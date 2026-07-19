import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
    createEntry,
    editEntry,
    pauseEntry,
    resumeEntry,
    stopEntry,
    setKind,
    inferKind,
    isRunning,
    isPaused,
    elapsedMs,
    spanMs,
    isStillAsleepPrompt,
    runningCount,
    dailyTotals,
    startOfLocalDay,
    toLocalInput,
    fromLocalInput,
    floorToMinute,
    loadLog,
    saveLog,
    SLEEP_LOG_KEY,
    STILL_ASLEEP_MS,
    type SleepEntry,
} from './sleepLog';

const H = 60 * 60 * 1000;
const M = 60 * 1000;

// A fixed local-time anchor. Using date-part constructors keeps these values in
// the test runner's own timezone, matching the app's local-time semantics.
function at(y: number, mo: number, d: number, h: number, min = 0): number {
    return new Date(y, mo - 1, d, h, min, 0, 0).getTime();
}

describe('inferKind', () => {
    it('labels the small hours and evening as night', () => {
        expect(inferKind(at(2026, 7, 19, 1))).toBe('night');   // 1am
        expect(inferKind(at(2026, 7, 19, 23))).toBe('night');  // 11pm
        expect(inferKind(at(2026, 7, 19, 19))).toBe('night');  // 7pm boundary
    });
    it('labels daytime as nap', () => {
        expect(inferKind(at(2026, 7, 19, 7))).toBe('nap');     // 7am boundary
        expect(inferKind(at(2026, 7, 19, 10))).toBe('nap');
        expect(inferKind(at(2026, 7, 19, 14))).toBe('nap');
        expect(inferKind(at(2026, 7, 19, 18, 30))).toBe('nap');
    });
});

describe('createEntry', () => {
    it('starts a running timer with inferred kind', () => {
        const e = createEntry(at(2026, 7, 19, 14));
        expect(isRunning(e)).toBe(true);
        expect(isPaused(e)).toBe(false);
        expect(e.kind).toBe('nap');
        expect(e.kindOverridden).toBe(false);
        expect(e.end).toBeNull();
    });
    it('honors an explicit kind as an override', () => {
        const e = createEntry(at(2026, 7, 19, 14), 'night');
        expect(e.kind).toBe('night');
        expect(e.kindOverridden).toBe(true);
    });
});

describe('elapsedMs — background-safe (timestamp derived)', () => {
    it('is correct for a start N hours in the past even if the app was never open', () => {
        const start = at(2026, 7, 19, 13);
        const e = createEntry(start);
        const now = start + 3 * H + 25 * M;
        expect(elapsedMs(e, now)).toBe(3 * H + 25 * M);
    });

    it('does not lose time across an app close/reopen (elapsed is a pure fn of now)', () => {
        const start = Date.parse('2026-07-19T13:00:00');
        const e = createEntry(start);
        // "reopened" 5h later — no ticking counter ran in between.
        expect(elapsedMs(e, start + 5 * H)).toBe(5 * H);
    });

    it('uses end once stopped, ignoring later now', () => {
        const start = at(2026, 7, 19, 13);
        const e = stopEntry(createEntry(start), start + 2 * H);
        expect(elapsedMs(e, start + 10 * H)).toBe(2 * H);
    });

    it('never goes negative', () => {
        const e = createEntry(at(2026, 7, 19, 13));
        expect(elapsedMs(e, e.start - 5 * M)).toBe(0);
    });
});

describe('pause / resume', () => {
    it('excludes paused time from elapsed while paused', () => {
        const start = at(2026, 7, 19, 13);
        let e = createEntry(start);
        e = pauseEntry(e, start + 30 * M);
        // 20 more min pass while paused: elapsed frozen at 30 min.
        expect(elapsedMs(e, start + 50 * M)).toBe(30 * M);
        expect(isPaused(e)).toBe(true);
    });

    it('banks paused time on resume and keeps counting after', () => {
        const start = at(2026, 7, 19, 13);
        let e = createEntry(start);
        e = pauseEntry(e, start + 30 * M);   // sleep so far: 30m
        e = resumeEntry(e, start + 50 * M);  // paused for 20m
        expect(e.pausedMs).toBe(20 * M);
        // 10 more min of sleep after resume => 40m active at t+60m.
        expect(elapsedMs(e, start + 60 * M)).toBe(40 * M);
    });

    it('pause is a no-op when already paused or stopped', () => {
        const start = at(2026, 7, 19, 13);
        let e = pauseEntry(createEntry(start), start + 10 * M);
        expect(pauseEntry(e, start + 20 * M)).toBe(e);
        const stopped = stopEntry(createEntry(start), start + 1 * H);
        expect(pauseEntry(stopped, start + 2 * H)).toBe(stopped);
    });

    it('stop while paused banks the open pause (no dangling pause)', () => {
        const start = at(2026, 7, 19, 13);
        let e = createEntry(start);
        e = pauseEntry(e, start + 30 * M);
        e = stopEntry(e, start + 90 * M); // paused 60m of the 90m span
        expect(isPaused(e)).toBe(false);
        expect(isRunning(e)).toBe(false);
        expect(elapsedMs(e, start + 5 * H)).toBe(30 * M);
    });
});

describe('midnight bug — backdating never clamps to today', () => {
    it('an entry created at 1am can be dated to yesterday', () => {
        // Logged at 1:00am on the 19th, but the sleep really started 11pm on the 18th.
        const createdAt = at(2026, 7, 19, 1);
        let e = createEntry(createdAt);
        expect(e.kind).toBe('night');
        const realStart = at(2026, 7, 18, 23);
        e = editEntry(e, { start: realStart, end: at(2026, 7, 19, 6) });
        expect(e.start).toBe(realStart);          // stayed on the 18th
        expect(new Date(e.start).getDate()).toBe(18);
        expect(new Date(e.end!).getDate()).toBe(19);
    });

    it('edits store raw timestamps with no clamping, across any date', () => {
        let e = createEntry(at(2026, 7, 19, 14));
        const lastMonth = at(2026, 6, 2, 13);
        e = editEntry(e, { start: lastMonth, end: lastMonth + 90 * M });
        expect(e.start).toBe(lastMonth);
        expect(elapsedMs(e, Date.now())).toBe(90 * M);
    });

    it('re-infers kind on backdate unless the user overrode it', () => {
        let e = createEntry(at(2026, 7, 19, 14)); // nap
        e = editEntry(e, { start: at(2026, 7, 19, 22) }); // moved to 10pm
        expect(e.kind).toBe('night');
        // Now the user pins it, and a later backdate leaves it alone.
        e = setKind(e, 'nap');
        e = editEntry(e, { start: at(2026, 7, 19, 23) });
        expect(e.kind).toBe('nap');
    });
});

describe('overnight runaway prompt', () => {
    it('prompts once a running timer passes 12h, without stopping it', () => {
        const start = at(2026, 7, 19, 19);
        const e = createEntry(start);
        expect(isStillAsleepPrompt(e, start + 11 * H)).toBe(false);
        expect(isStillAsleepPrompt(e, start + STILL_ASLEEP_MS)).toBe(true);
        expect(isRunning(e)).toBe(true); // never auto-deleted/stopped
    });
    it('does not prompt for a stopped entry however long it was', () => {
        const start = at(2026, 7, 19, 19);
        const e = stopEntry(createEntry(start), start + 14 * H);
        expect(isStillAsleepPrompt(e, start + 20 * H)).toBe(false);
    });
});

describe('two open timers', () => {
    it('counts concurrent running timers (twins / caregiver overlap)', () => {
        const a = createEntry(at(2026, 7, 19, 13));
        const b = createEntry(at(2026, 7, 19, 13, 5));
        const c = stopEntry(createEntry(at(2026, 7, 19, 9)), at(2026, 7, 19, 10));
        expect(runningCount([a, b, c])).toBe(2);
    });
});

describe('dailyTotals', () => {
    const dayStart = startOfLocalDay(at(2026, 7, 19, 12));
    const dayEnd = dayStart + 24 * H;

    it('splits a sleep that crosses midnight across two days (no double count)', () => {
        // 11pm on the 18th to 6am on the 19th = 7h night sleep.
        const e = createEntry(at(2026, 7, 18, 23), 'night');
        const stopped = stopEntry(e, at(2026, 7, 19, 6));
        const today = dailyTotals([stopped], dayStart, dayEnd, dayEnd);
        expect(today.nightMs).toBe(6 * H);   // midnight -> 6am portion
        const prevStart = dayStart - 24 * H;
        const yesterday = dailyTotals([stopped], prevStart, dayStart, dayStart);
        expect(yesterday.nightMs).toBe(1 * H); // 11pm -> midnight portion
    });

    it('sums naps and night separately and reports the total', () => {
        const nap1 = stopEntry(createEntry(at(2026, 7, 19, 10)), at(2026, 7, 19, 11));
        const nap2 = stopEntry(createEntry(at(2026, 7, 19, 14)), at(2026, 7, 19, 15, 30));
        const night = createEntry(at(2026, 7, 19, 20), 'night'); // still running
        const t = dailyTotals([nap1, nap2, night], dayStart, dayEnd, at(2026, 7, 19, 21));
        expect(t.napMs).toBe(2.5 * H);
        expect(t.nightMs).toBe(1 * H);
        expect(t.totalMs).toBe(3.5 * H);
    });

    it('counts a running timer up to now', () => {
        const running = createEntry(at(2026, 7, 19, 13));
        const t = dailyTotals([running], dayStart, dayEnd, at(2026, 7, 19, 14, 30));
        expect(t.napMs).toBe(1.5 * H);
    });

    it('subtracts paused time from the start day', () => {
        let e = createEntry(at(2026, 7, 19, 13));
        e = pauseEntry(e, at(2026, 7, 19, 13, 20));
        e = resumeEntry(e, at(2026, 7, 19, 13, 50)); // 30m paused
        e = stopEntry(e, at(2026, 7, 19, 15));       // 2h span, 1.5h active
        const t = dailyTotals([e], dayStart, dayEnd, dayEnd);
        expect(t.napMs).toBe(1.5 * H);
    });

    it('ignores entries fully outside the day window', () => {
        const other = stopEntry(createEntry(at(2026, 7, 17, 10)), at(2026, 7, 17, 11));
        const t = dailyTotals([other], dayStart, dayEnd, dayEnd);
        expect(t.totalMs).toBe(0);
    });
});

describe('datetime-local <-> ms helpers', () => {
    it('round-trips at minute resolution regardless of timezone', () => {
        const ms = floorToMinute(at(2026, 7, 19, 14, 37));
        expect(fromLocalInput(toLocalInput(ms))).toBe(ms);
    });
    it('produces a parseable local string shape', () => {
        expect(toLocalInput(at(2026, 7, 5, 9, 3))).toBe('2026-07-05T09:03');
    });
    it('returns null for empty or invalid input', () => {
        expect(fromLocalInput('')).toBeNull();
        expect(fromLocalInput('not-a-date')).toBeNull();
    });
});

describe('persistence (localStorage)', () => {
    // The default Vitest env is node (no DOM); back the persistence tests with a
    // minimal Map-based localStorage so we exercise the real save/load path
    // without pulling in a jsdom/happy-dom dependency.
    beforeAll(() => {
        if (typeof globalThis.localStorage === 'undefined') {
            const store = new Map<string, string>();
            const mock: Storage = {
                get length() { return store.size; },
                clear: () => store.clear(),
                getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
                key: (i: number) => Array.from(store.keys())[i] ?? null,
                removeItem: (k: string) => { store.delete(k); },
                setItem: (k: string, v: string) => { store.set(k, String(v)); },
            };
            Object.defineProperty(globalThis, 'localStorage', { value: mock, configurable: true });
        }
    });
    beforeEach(() => localStorage.clear());

    it('round-trips a log through save/load', () => {
        const entries = [
            stopEntry(createEntry(at(2026, 7, 19, 10)), at(2026, 7, 19, 11)),
            createEntry(at(2026, 7, 19, 20), 'night'),
        ];
        saveLog(entries);
        const loaded = loadLog();
        expect(loaded).toHaveLength(2);
        expect(loaded[0].id).toBe(entries[0].id);
        expect(loaded[1].kind).toBe('night');
    });

    it('returns [] when nothing is stored', () => {
        expect(loadLog()).toEqual([]);
    });

    it('drops corrupt JSON without throwing', () => {
        localStorage.setItem(SLEEP_LOG_KEY, '{not json');
        expect(loadLog()).toEqual([]);
    });

    it('filters out malformed entries', () => {
        const good: SleepEntry = createEntry(at(2026, 7, 19, 10));
        localStorage.setItem(
            SLEEP_LOG_KEY,
            JSON.stringify([good, { id: 'x' }, null, { start: 'nope' }]),
        );
        const loaded = loadLog();
        expect(loaded).toHaveLength(1);
        expect(loaded[0].id).toBe(good.id);
    });

    it('is namespaced and versioned so "delete all data" (clear) wipes it', () => {
        expect(SLEEP_LOG_KEY).toBe('ww.sleepLog.v1');
        saveLog([createEntry(at(2026, 7, 19, 10))]);
        localStorage.clear(); // what DeleteData.vue does
        expect(loadLog()).toEqual([]);
    });
});
