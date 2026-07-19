// @test:personalized-from-local-history
import { describe, it, expect } from 'vitest';
import type { SleepEntry } from './sleepLog';
import {
    median,
    medianAbsoluteDeviation,
    deriveDailyWakeWindows,
    personalizeWakeWindows,
    wakeWindowLabel,
    describeAdjustment,
    MIN_DAYS_TO_PERSONALIZE,
    MAX_NUDGE_HOURS,
} from './PersonalizedWindows';

const H = 60 * 60 * 1000;

function entry(start: number, end: number | null, kind: 'nap' | 'night'): SleepEntry {
    return { id: `${start}`, start, end, pausedMs: 0, pauseStart: null, kind, kindOverridden: true };
}

/** Midnight-based local time for a given day offset from an anchor date. */
function at(anchor: Date, dayOffset: number, hour: number, minute = 0): number {
    const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayOffset, hour, minute);
    return d.getTime();
}

/**
 * Build a realistic sleep log from explicit per-day wake-window arrays. Each
 * day: wake at 07:00, then (windows.length - 1) one-hour naps separated by the
 * given windows, then the final window into a continuous overnight sleep that
 * ends at 07:00 the next morning. A leading overnight makes day 0's morning
 * window measurable too.
 */
function buildLog(anchor: Date, daysWindows: number[][], napLenH = 1): SleepEntry[] {
    const entries: SleepEntry[] = [];
    // Leading overnight: ends at day-0 wake so day 0's morning window has a start.
    entries.push(entry(at(anchor, -1, 19), at(anchor, 0, 7), 'night'));
    daysWindows.forEach((windows, day) => {
        let t = at(anchor, day, 7); // morning wake = end of the prior overnight
        for (let i = 0; i < windows.length - 1; i++) {
            const napStart = t + windows[i] * H;
            const napEnd = napStart + napLenH * H;
            entries.push(entry(napStart, napEnd, 'nap'));
            t = napEnd;
        }
        const nightStart = t + windows[windows.length - 1] * H;
        entries.push(entry(nightStart, at(anchor, day + 1, 7), 'night'));
    });
    return entries;
}

const ANCHOR = new Date(2026, 5, 15); // June 15 2026, local
const NOW = at(ANCHOR, 0, 12); // noon on the anchor day

describe('median / MAD', () => {
    it('median of odd and even lengths', () => {
        expect(median([3, 1, 2])).toBe(2);
        expect(median([1, 2, 3, 4])).toBe(2.5);
        expect(median([])).toBe(0);
    });
    it('MAD is robust to a single outlier', () => {
        const v = [2, 2, 2, 2, 20];
        expect(medianAbsoluteDeviation(v, median(v))).toBe(0);
    });
});

describe('deriveDailyWakeWindows', () => {
    it('reconstructs each day\'s windows in morning-first order', () => {
        const log = buildLog(new Date(2026, 5, 10), [[2, 2, 2], [2, 2, 2]]);
        const days = deriveDailyWakeWindows(log);
        expect(days).toHaveLength(2);
        expect(days[0].windows).toEqual([2, 2, 2]);
        expect(days[1].windows).toEqual([2, 2, 2]);
        // sorted ascending by day
        expect(days[0].dayStart).toBeLessThan(days[1].dayStart);
    });

    it('ignores running sleeps and implausibly long gaps', () => {
        const runningEnd = null;
        const log: SleepEntry[] = [
            entry(at(ANCHOR, 0, 9), runningEnd, 'nap'), // no end → no window after it
            entry(at(ANCHOR, 0, 13), at(ANCHOR, 0, 14), 'nap'),
            // 10h gap to the next start → treated as a logging gap, dropped
            entry(at(ANCHOR, 1, 0), at(ANCHOR, 1, 1), 'night'),
        ];
        const days = deriveDailyWakeWindows(log);
        // Only the 13:00→ (nothing valid). The running entry can't start a window;
        // the 10h gap is dropped. So no measurable windows.
        expect(days.flatMap((d) => d.windows)).toHaveLength(0);
    });
});

describe('personalizeWakeWindows', () => {
    it('needs enough days before nudging anything', () => {
        const log = buildLog(ANCHOR, [[2, 2, 2], [2, 2, 2]]); // only 2 usable days
        const r = personalizeWakeWindows([2, 2, 2], log, { now: NOW });
        expect(r.status).toBe('insufficient-data');
        expect(r.personalized).toBe(false);
        expect(r.windows).toEqual([2, 2, 2]);
        expect(r.daysUsed).toBeLessThan(MIN_DAYS_TO_PERSONALIZE);
    });

    it('nudges a window toward the observed median', () => {
        // Mornings consistently run ~45 min longer than the [2,2,2] default.
        const log = buildLog(ANCHOR, [
            [2.75, 2, 2], [2.75, 2, 2], [2.75, 2, 2], [2.75, 2, 2],
        ]);
        const r = personalizeWakeWindows([2, 2, 2], log, { now: NOW });
        expect(r.status).toBe('personalized');
        expect(r.personalized).toBe(true);
        expect(r.adjustments).toHaveLength(1);
        const a = r.adjustments[0];
        expect(a.index).toBe(0);
        expect(a.observedDeltaMinutes).toBe(45);
        // Capped at ±30 min and rounded to the 0.25h step → 2.0 → 2.5
        expect(a.appliedHours).toBe(2.5);
        expect(a.appliedDeltaMinutes).toBe(30);
        expect(r.windows).toEqual([2.5, 2, 2]);
    });

    it('caps the nudge at MAX_NUDGE_HOURS even for a huge shift', () => {
        const log = buildLog(ANCHOR, [
            [4, 2, 2], [4, 2, 2], [4, 2, 2], [4, 2, 2],
        ]);
        const r = personalizeWakeWindows([2, 2, 2], log, { now: NOW });
        expect(r.windows[0]).toBe(2 + MAX_NUDGE_HOURS); // 2.5, not 4
    });

    it('reports no change when the baby already matches the age default', () => {
        const log = buildLog(ANCHOR, [
            [2, 2, 2], [2, 2, 2], [2, 2, 2], [2, 2, 2],
        ]);
        const r = personalizeWakeWindows([2, 2, 2], log, { now: NOW });
        expect(r.status).toBe('no-change');
        expect(r.personalized).toBe(false);
        expect(r.windows).toEqual([2, 2, 2]);
    });

    it('excludes an atypical (outlier) day so it does not poison the baseline', () => {
        // Five ordinary days with slight spread, plus one wild day (illness/travel).
        const log = buildLog(ANCHOR, [
            [2, 2, 2], [2.25, 2, 2], [1.75, 2, 2], [2, 2, 2], [2.25, 2, 2],
            [6, 2, 2], // atypical: mornings 6h → total awake far from the median
        ]);
        const r = personalizeWakeWindows([2, 2, 2], log, { now: NOW });
        expect(r.daysConsidered).toBe(6);
        expect(r.excludedDays).toBe(1);
        expect(r.daysUsed).toBe(5);
        // With the outlier dropped the morning median is 2h → no bogus nudge.
        expect(r.adjustments.find((a) => a.index === 0)).toBeUndefined();
    });

    it('only considers days inside the lookback window', () => {
        // Anchor these days 30 days before NOW → all outside the 7-day lookback.
        const oldAnchor = new Date(2026, 4, 10);
        const log = buildLog(oldAnchor, [[3, 2, 2], [3, 2, 2], [3, 2, 2], [3, 2, 2]]);
        const r = personalizeWakeWindows([2, 2, 2], log, { now: NOW });
        expect(r.daysConsidered).toBe(0);
        expect(r.status).toBe('insufficient-data');
    });

    it('does not mutate the input base array', () => {
        const base = [2, 2, 2];
        const log = buildLog(ANCHOR, [[2.75, 2, 2], [2.75, 2, 2], [2.75, 2, 2]]);
        personalizeWakeWindows(base, log, { now: NOW });
        expect(base).toEqual([2, 2, 2]);
    });
});

describe('explainer copy', () => {
    it('labels positions morning / numbered / before-bed', () => {
        expect(wakeWindowLabel(0, 4)).toBe('Morning wake window');
        expect(wakeWindowLabel(3, 4)).toBe('Last wake window (before bed)');
        expect(wakeWindowLabel(1, 4)).toBe('Wake window 2');
    });

    it('describes a longer morning in plain language', () => {
        const s = describeAdjustment(
            { index: 0, baseHours: 2, medianHours: 2.75, appliedHours: 2.5, observedDeltaMinutes: 45, appliedDeltaMinutes: 30, sampleDays: 4 },
            3,
            7,
        );
        expect(s).toContain('last 7 days');
        expect(s).toContain('morning wake window');
        expect(s).toContain('45 min longer');
    });
});
