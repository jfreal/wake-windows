// @doc:reminders-nudges
import { describe, it, expect } from 'vitest';
import {
    DEFAULT_LEAD_MINUTES,
    DEFAULT_REMINDER_PREFS,
    LEAD_MINUTE_OPTIONS,
    normalizeLeadMinutes,
    normalizePrefs,
    normalizeFires,
    nudgeTimeMs,
    msUntilNudge,
    minutesOfDayLocal,
    isWithinQuietHours,
    isSameLocalDay,
    firesToday,
    dailyCapReached,
    pruneFiresToToday,
    decideNudge,
} from './reminders';

// Build an epoch-ms instant from LOCAL wall-clock parts, so these tests assert
// wall-clock behavior regardless of the machine's timezone.
function localMs(y: number, mo: number, d: number, h: number, min = 0): number {
    return new Date(y, mo - 1, d, h, min, 0, 0).getTime();
}

describe('prefs defaults + normalization', () => {
    it('is off by default with a 30-min lead', () => {
        expect(DEFAULT_REMINDER_PREFS).toEqual({ enabled: false, leadMinutes: 30 });
        expect(DEFAULT_LEAD_MINUTES).toBe(30);
        expect(LEAD_MINUTE_OPTIONS).toEqual([15, 30, 45]);
    });

    it('coerces off-spec lead times back to the default', () => {
        expect(normalizeLeadMinutes(15)).toBe(15);
        expect(normalizeLeadMinutes(45)).toBe(45);
        expect(normalizeLeadMinutes(20)).toBe(30);
        expect(normalizeLeadMinutes('30')).toBe(30); // string, not number
        expect(normalizeLeadMinutes(null)).toBe(30);
        expect(normalizeLeadMinutes(undefined)).toBe(30);
    });

    it('re-validates a corrupt persisted blob', () => {
        expect(normalizePrefs({ enabled: true, leadMinutes: 45 })).toEqual({
            enabled: true,
            leadMinutes: 45,
        });
        expect(normalizePrefs({ enabled: 'yes', leadMinutes: 999 })).toEqual({
            enabled: false,
            leadMinutes: 30,
        });
        expect(normalizePrefs(null)).toEqual({ enabled: false, leadMinutes: 30 });
        expect(normalizePrefs(undefined)).toEqual({ enabled: false, leadMinutes: 30 });
    });

    it('coerces a corrupt fire-history blob to a clean number array (never throws)', () => {
        expect(normalizeFires([1, 2, 3])).toEqual([1, 2, 3]);
        // Non-arrays that would blow up a later .filter() collapse to [].
        expect(normalizeFires(5)).toEqual([]);
        expect(normalizeFires({})).toEqual([]);
        expect(normalizeFires('nope')).toEqual([]);
        expect(normalizeFires(null)).toEqual([]);
        expect(normalizeFires(undefined)).toEqual([]);
        // Junk entries inside an array are dropped.
        expect(normalizeFires([1, 'x', null, NaN, Infinity, 2])).toEqual([1, 2]);
    });
});

describe('lead-time offset', () => {
    it('fires exactly leadMinutes before the window end', () => {
        const end = localMs(2026, 7, 21, 10, 10); // 10:10 window end
        expect(nudgeTimeMs(end, 30)).toBe(localMs(2026, 7, 21, 9, 40));
        expect(nudgeTimeMs(end, 15)).toBe(localMs(2026, 7, 21, 9, 55));
        expect(nudgeTimeMs(end, 45)).toBe(localMs(2026, 7, 21, 9, 25));
    });

    it('msUntilNudge is positive before due, negative after', () => {
        const end = localMs(2026, 7, 21, 10, 10);
        expect(msUntilNudge(localMs(2026, 7, 21, 9, 30), end, 30)).toBe(10 * 60_000);
        expect(msUntilNudge(localMs(2026, 7, 21, 9, 50), end, 30)).toBe(-10 * 60_000);
    });
});

describe('quiet hours (local wall time)', () => {
    it('reports local minutes-of-day', () => {
        expect(minutesOfDayLocal(localMs(2026, 7, 21, 9, 40))).toBe(9 * 60 + 40);
        expect(minutesOfDayLocal(localMs(2026, 7, 21, 0, 0))).toBe(0);
    });

    it('blocks overnight default window 20:00–07:00 and allows daytime', () => {
        expect(isWithinQuietHours(localMs(2026, 7, 21, 22, 0))).toBe(true); // 10pm
        expect(isWithinQuietHours(localMs(2026, 7, 21, 3, 0))).toBe(true); // 3am
        expect(isWithinQuietHours(localMs(2026, 7, 21, 6, 59))).toBe(true); // just before 7
        expect(isWithinQuietHours(localMs(2026, 7, 21, 7, 0))).toBe(false); // end is exclusive
        expect(isWithinQuietHours(localMs(2026, 7, 21, 9, 40))).toBe(false); // daytime
        expect(isWithinQuietHours(localMs(2026, 7, 21, 20, 0))).toBe(true); // start inclusive
        expect(isWithinQuietHours(localMs(2026, 7, 21, 19, 59))).toBe(false); // just before start
    });

    it('supports a same-day window and a disabled (start===end) window', () => {
        // 13:00–14:00 nap-lull window
        expect(isWithinQuietHours(localMs(2026, 7, 21, 13, 30), 13 * 60, 14 * 60)).toBe(true);
        expect(isWithinQuietHours(localMs(2026, 7, 21, 12, 0), 13 * 60, 14 * 60)).toBe(false);
        // start === end disables quiet hours entirely
        expect(isWithinQuietHours(localMs(2026, 7, 21, 3, 0), 0, 0)).toBe(false);
    });
});

describe('daily cap (per local calendar day)', () => {
    const now = localMs(2026, 7, 21, 9, 0);

    it('detects same local day', () => {
        expect(isSameLocalDay(localMs(2026, 7, 21, 1, 0), localMs(2026, 7, 21, 23, 0))).toBe(true);
        expect(isSameLocalDay(localMs(2026, 7, 21, 23, 0), localMs(2026, 7, 22, 1, 0))).toBe(false);
    });

    it('counts only today toward the cap', () => {
        const fires = [
            localMs(2026, 7, 20, 9, 40), // yesterday
            localMs(2026, 7, 21, 7, 30), // today
        ];
        expect(firesToday(fires, now)).toBe(1);
        expect(dailyCapReached(fires, now)).toBe(true); // cap 1 reached
        expect(dailyCapReached([localMs(2026, 7, 20, 9, 40)], now)).toBe(false); // only yesterday
    });

    it('cap self-resets the next local day', () => {
        const fires = [localMs(2026, 7, 21, 9, 40)];
        expect(dailyCapReached(fires, localMs(2026, 7, 21, 10, 0))).toBe(true); // same day
        expect(dailyCapReached(fires, localMs(2026, 7, 22, 8, 0))).toBe(false); // next day
    });

    it('pruneFiresToToday drops stale days', () => {
        const fires = [localMs(2026, 7, 19, 9, 0), localMs(2026, 7, 20, 9, 0), localMs(2026, 7, 21, 8, 0)];
        expect(pruneFiresToToday(fires, now)).toEqual([localMs(2026, 7, 21, 8, 0)]);
    });
});

describe('decideNudge gate ordering', () => {
    const end = localMs(2026, 7, 21, 10, 10); // window end; 30-min nudge at 9:40
    const base = { windowEndMs: end, leadMinutes: 30 as const, firedAtMs: [] as number[] };

    it('holds before the nudge is due', () => {
        const d = decideNudge({ ...base, nowMs: localMs(2026, 7, 21, 9, 0) });
        expect(d.fire).toBe(false);
        expect(d.reason).toBe('too-early');
        expect(d.nudgeAtMs).toBe(localMs(2026, 7, 21, 9, 40));
    });

    it('fires inside the lead window', () => {
        const d = decideNudge({ ...base, nowMs: localMs(2026, 7, 21, 9, 45) });
        expect(d.fire).toBe(true);
        expect(d.reason).toBeUndefined();
    });

    it('never fires after the window has passed (no "you missed it")', () => {
        const d = decideNudge({ ...base, nowMs: localMs(2026, 7, 21, 10, 15) });
        expect(d.fire).toBe(false);
        expect(d.reason).toBe('window-passed');
    });

    it('respects quiet hours even when otherwise due', () => {
        // Window end 06:30 → 30-min nudge at 06:00, inside the 20:00–07:00 quiet window.
        const nightEnd = localMs(2026, 7, 21, 6, 30);
        const d = decideNudge({
            windowEndMs: nightEnd,
            leadMinutes: 30,
            firedAtMs: [],
            nowMs: localMs(2026, 7, 21, 6, 5),
        });
        expect(d.fire).toBe(false);
        expect(d.reason).toBe('quiet-hours');
    });

    it('respects the daily cap even when otherwise due', () => {
        const d = decideNudge({
            ...base,
            nowMs: localMs(2026, 7, 21, 9, 45),
            firedAtMs: [localMs(2026, 7, 21, 8, 0)], // already fired today
        });
        expect(d.fire).toBe(false);
        expect(d.reason).toBe('daily-cap');
    });
});

describe('TZ/DST honesty — recompute against the plan, not a frozen timestamp', () => {
    it('nudge time is a pure function of the (recomputed) window end', () => {
        // The plan recomputes windowEnd against local wall time; the nudge is
        // always lead-minutes before whatever that is — nothing is pinned.
        const planA = localMs(2026, 3, 8, 10, 10); // spring-forward day
        const planB = localMs(2026, 11, 1, 10, 10); // fall-back day
        expect(nudgeTimeMs(planA, 30)).toBe(localMs(2026, 3, 8, 9, 40));
        expect(nudgeTimeMs(planB, 30)).toBe(localMs(2026, 11, 1, 9, 40));
    });

    it('quiet-hours gate keys off wall-clock time, so it is stable across a DST shift', () => {
        // 9:40 AM wall time is daytime on both a normal and a DST-transition day.
        expect(isWithinQuietHours(localMs(2026, 3, 8, 9, 40))).toBe(false);
        expect(isWithinQuietHours(localMs(2026, 11, 1, 9, 40))).toBe(false);
        // 6:00 AM wall time is quiet on both.
        expect(isWithinQuietHours(localMs(2026, 3, 8, 6, 0))).toBe(true);
        expect(isWithinQuietHours(localMs(2026, 11, 1, 6, 0))).toBe(true);
    });
});
