// @doc:trends-daily-totals
import { describe, it, expect } from 'vitest';
import {
    napCountForDay,
    isDayInProgress,
    sevenDaySleepSeries,
    sleepBandForMonths,
    bandPosition,
} from './trends';
import { createEntry, startOfLocalDay, type SleepEntry } from './sleepLog';

const H = 60 * 60 * 1000;
const DAY = 24 * H;

// Fixed local-time anchor in the runner's own timezone (matches app semantics).
function at(y: number, mo: number, d: number, h: number, min = 0): number {
    return new Date(y, mo - 1, d, h, min, 0, 0).getTime();
}

/** A completed entry with an explicit kind. */
function done(start: number, end: number, kind: 'nap' | 'night'): SleepEntry {
    const e = createEntry(start, kind);
    e.end = end;
    return e;
}

describe('napCountForDay', () => {
    const dayStart = at(2026, 7, 19, 0);
    const dayEnd = dayStart + DAY;
    const now = at(2026, 7, 19, 20);

    it('counts only naps that overlap the day, not night sleep', () => {
        const entries = [
            done(at(2026, 7, 19, 9), at(2026, 7, 19, 10, 30), 'nap'),
            done(at(2026, 7, 19, 13), at(2026, 7, 19, 14), 'nap'),
            done(at(2026, 7, 19, 1), at(2026, 7, 19, 6), 'night'),
        ];
        expect(napCountForDay(entries, dayStart, dayEnd, now)).toBe(2);
    });

    it('excludes naps that fall entirely on another day', () => {
        const entries = [done(at(2026, 7, 18, 13), at(2026, 7, 18, 14), 'nap')];
        expect(napCountForDay(entries, dayStart, dayEnd, now)).toBe(0);
    });

    it('counts an in-progress nap that has started today', () => {
        const running = createEntry(at(2026, 7, 19, 15), 'nap'); // still running
        expect(napCountForDay([running], dayStart, dayEnd, now)).toBe(1);
    });

    it('counts a midnight-crossing nap on both days it touches', () => {
        const crosser = done(at(2026, 7, 18, 23, 30), at(2026, 7, 19, 0, 30), 'nap');
        const prevStart = at(2026, 7, 18, 0);
        expect(napCountForDay([crosser], prevStart, prevStart + DAY, now)).toBe(1);
        expect(napCountForDay([crosser], dayStart, dayEnd, now)).toBe(1);
    });
});

describe('isDayInProgress', () => {
    const dayStart = at(2026, 7, 19, 0);
    const dayEnd = dayStart + DAY;
    const now = at(2026, 7, 19, 16);

    it('is true while a sleep overlapping today is still running', () => {
        const running = createEntry(at(2026, 7, 19, 15), 'nap');
        expect(isDayInProgress([running], dayStart, dayEnd, now)).toBe(true);
    });

    it('is false when every entry today is finished', () => {
        const entries = [done(at(2026, 7, 19, 9), at(2026, 7, 19, 10), 'nap')];
        expect(isDayInProgress(entries, dayStart, dayEnd, now)).toBe(false);
    });

    it("ignores a running timer that hasn't reached the target day", () => {
        // Started today at 15:00; the *previous* day's window closed before it
        // began, so that day is not "in progress" even though the timer runs.
        const prevStart = at(2026, 7, 18, 0);
        const running = createEntry(at(2026, 7, 19, 15), 'nap');
        expect(isDayInProgress([running], prevStart, prevStart + DAY, now)).toBe(false);
    });
});

describe('sevenDaySleepSeries', () => {
    const now = at(2026, 7, 19, 20);

    it('returns `days` entries, oldest first, ending on today', () => {
        const series = sevenDaySleepSeries([], now, 7);
        expect(series).toHaveLength(7);
        expect(series[6].dayStart).toBe(startOfLocalDay(now));
        expect(series[0].dayStart).toBe(startOfLocalDay(now) - 6 * DAY);
        // Sorted ascending by day.
        for (let i = 1; i < series.length; i++) {
            expect(series[i].dayStart).toBeGreaterThan(series[i - 1].dayStart);
        }
    });

    it('reports honest zero totals for empty days (never dropped)', () => {
        const series = sevenDaySleepSeries([], now);
        expect(series.every((d) => d.totalMs === 0)).toBe(true);
    });

    it('places each day total on the right day', () => {
        const entries = [
            done(at(2026, 7, 17, 13), at(2026, 7, 17, 15), 'nap'),   // 2h, two days ago
            done(at(2026, 7, 19, 9), at(2026, 7, 19, 10, 30), 'nap'), // 1.5h today
        ];
        const series = sevenDaySleepSeries(entries, now);
        const byDay = new Map(series.map((d) => [d.dayStart, d.totalMs]));
        expect(byDay.get(startOfLocalDay(at(2026, 7, 17, 12)))).toBe(2 * H);
        expect(byDay.get(startOfLocalDay(now))).toBe(1.5 * H);
        expect(byDay.get(startOfLocalDay(at(2026, 7, 18, 12)))).toBe(0);
    });

    it('splits a midnight-crossing sleep across its two days', () => {
        const entries = [done(at(2026, 7, 18, 23), at(2026, 7, 19, 1), 'night')]; // 1h each side
        const series = sevenDaySleepSeries(entries, now);
        const byDay = new Map(series.map((d) => [d.dayStart, d.totalMs]));
        expect(byDay.get(startOfLocalDay(at(2026, 7, 18, 12)))).toBe(1 * H);
        expect(byDay.get(startOfLocalDay(now))).toBe(1 * H);
    });

    it('counts an in-progress nap toward today "so far"', () => {
        const running = createEntry(at(2026, 7, 19, 19), 'nap'); // started 1h before now
        const series = sevenDaySleepSeries([running], now);
        expect(series[6].totalMs).toBe(1 * H);
    });
});

describe('sleepBandForMonths', () => {
    it('returns the Tier 1 total-sleep band for a 5-month-old', () => {
        const band = sleepBandForMonths(5);
        expect(band).not.toBeNull();
        expect(band!.minHours).toBe(12);
        expect(band!.maxHours).toBe(16);
        expect(band!.tier).toBe(1);
        expect(band!.sourceIds.length).toBeGreaterThan(0);
    });

    it('returns the newborn band (14–17h) for a 1-month-old', () => {
        const band = sleepBandForMonths(1);
        expect(band!.minHours).toBe(14);
        expect(band!.maxHours).toBe(17);
    });

    it('never returns null for a plausible infant age', () => {
        for (const m of [0, 2, 3, 6, 9, 12, 18, 23]) {
            expect(sleepBandForMonths(m)).not.toBeNull();
        }
    });
});

describe('bandPosition', () => {
    const band = { minHours: 12, maxHours: 16, label: '', ageLabel: '', tier: 1, sourceIds: [] };
    it('classifies below / within / above without implying a grade', () => {
        expect(bandPosition(9, band)).toBe('below');
        expect(bandPosition(14, band)).toBe('within');
        expect(bandPosition(12, band)).toBe('within'); // inclusive lower bound
        expect(bandPosition(16, band)).toBe('within'); // inclusive upper bound
        expect(bandPosition(18, band)).toBe('above');
    });
});
