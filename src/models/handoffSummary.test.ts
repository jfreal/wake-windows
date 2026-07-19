import { describe, it, expect } from 'vitest';
import { lastNapSnapshot, sinceLastNap, clockMinutesOf } from './handoffSummary';
import { createEntry, stopEntry, type SleepEntry } from './sleepLog';

// A local wall-clock time on a fixed date -> epoch ms, so tests read like a
// clock and don't depend on the run date.
function at(y: number, mo: number, d: number, h: number, min: number): number {
    return new Date(y, mo - 1, d, h, min, 0, 0).getTime();
}

describe('lastNapSnapshot', () => {
    it('returns null for an empty log', () => {
        expect(lastNapSnapshot([])).toBeNull();
    });

    it('picks the most recently started entry, even if an earlier one is still running', () => {
        const older = stopEntry(createEntry(at(2026, 7, 19, 9, 0)), at(2026, 7, 19, 9, 30));
        const newer = createEntry(at(2026, 7, 19, 13, 40)); // running
        const snap = lastNapSnapshot([older, newer]);
        expect(snap).toEqual({ start: at(2026, 7, 19, 13, 40), end: null });
    });

    it('reports a completed nap with its end', () => {
        const nap = stopEntry(createEntry(at(2026, 7, 19, 13, 0)), at(2026, 7, 19, 13, 45));
        expect(lastNapSnapshot([nap])).toEqual({
            start: at(2026, 7, 19, 13, 0),
            end: at(2026, 7, 19, 13, 45),
        });
    });
});

describe('sinceLastNap', () => {
    it('returns null for no snapshot', () => {
        expect(sinceLastNap(null, Date.now())).toBeNull();
    });

    it('reports an in-progress nap as "so far" (now - start), never blank', () => {
        const start = at(2026, 7, 19, 13, 40);
        const now = at(2026, 7, 19, 14, 15); // 35 min later
        const line = sinceLastNap({ start, end: null }, now);
        expect(line).not.toBeNull();
        expect(line!.inProgress).toBe(true);
        expect(line!.durationMs).toBe(35 * 60_000);
    });

    it('reports a completed nap duration from end - start', () => {
        const line = sinceLastNap({ start: at(2026, 7, 19, 13, 0), end: at(2026, 7, 19, 13, 45) }, Date.now());
        expect(line!.inProgress).toBe(false);
        expect(line!.durationMs).toBe(45 * 60_000);
    });

    it('is immune to the midnight boundary — a nap 11:50pm→12:10am is 20 min', () => {
        const start = at(2026, 7, 19, 23, 50);
        const end = at(2026, 7, 20, 0, 10); // next calendar day
        const line = sinceLastNap({ start, end }, Date.now());
        expect(line!.durationMs).toBe(20 * 60_000);
        // Duration comes from epoch deltas, so crossing midnight never flips it
        // negative or off-by-hours.
        expect(line!.durationMs).toBeGreaterThan(0);
    });

    it('is immune to midnight for an in-progress nap that began before midnight', () => {
        const start = at(2026, 7, 19, 23, 40);
        const now = at(2026, 7, 20, 0, 5); // 25 min later, past midnight
        const line = sinceLastNap({ start, end: null }, now);
        expect(line!.inProgress).toBe(true);
        expect(line!.durationMs).toBe(25 * 60_000);
    });

    it('never goes negative on a clock-skew snapshot (end before start)', () => {
        const line = sinceLastNap({ start: at(2026, 7, 19, 13, 0), end: at(2026, 7, 19, 12, 0) }, Date.now());
        expect(line!.durationMs).toBe(0);
    });
});

describe('clockMinutesOf', () => {
    it('converts an epoch ms to local minutes-from-midnight', () => {
        expect(clockMinutesOf(at(2026, 7, 19, 13, 40))).toBe(13 * 60 + 40);
        expect(clockMinutesOf(at(2026, 7, 20, 0, 10))).toBe(10);
    });
});

// Guard the SleepEntry shape the snapshot relies on (start/end) stays stable.
describe('SleepEntry integration', () => {
    it('a running entry snapshots with end: null', () => {
        const running: SleepEntry = createEntry(at(2026, 7, 19, 13, 40));
        expect(lastNapSnapshot([running])).toEqual({ start: at(2026, 7, 19, 13, 40), end: null });
    });
});
