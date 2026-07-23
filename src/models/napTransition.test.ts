// @test:nap-transition-detector
import { describe, it, expect, beforeEach } from 'vitest';
import type { SleepEntry } from './sleepLog';
import {
    ruleForMonths,
    isUnderSixMonths,
    deriveDaySignals,
    daySignalFlags,
    daySignalCount,
    isTriggerDay,
    manualSignalCount,
    isManualCluster,
    detectNapTransition,
    buildLengtheningPlan,
    loadDismissed,
    saveDismissed,
    isDismissed,
    TRANSITION_RULES,
    SHORT_NAP_MAX_MS,
    STEP_MINUTES,
    NAP_TRANSITION_DISMISS_KEY,
    type DaySignals,
    type TransitionRule,
} from './napTransition';

const H = 60 * 60 * 1000;
const MIN = 60 * 1000;

let uid = 0;
function entry(start: number, end: number | null, kind: 'nap' | 'night'): SleepEntry {
    return { id: `e${uid++}`, start, end, pausedMs: 0, pauseStart: null, kind, kindOverridden: true };
}

/** Local time for a day offset from an anchor. */
function at(anchor: Date, dayOffset: number, hour: number, minute = 0): number {
    return new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + dayOffset, hour, minute).getTime();
}

// Minimal in-memory localStorage — the node test env has none, and the
// dismiss-persistence helpers (via storage.ts) otherwise no-op silently.
if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
    const store = new Map<string, string>();
    (globalThis as { localStorage: unknown }).localStorage = {
        getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
        setItem: (k: string, v: string) => { store.set(k, String(v)); },
        removeItem: (k: string) => { store.delete(k); },
        clear: () => { store.clear(); },
    };
}

const ANCHOR = new Date(2026, 5, 15); // June 15 2026, local
const NOW = at(ANCHOR, 0, 12); // noon on the anchor day

/**
 * Build one day's entries. `naps` is a list of [startHour, lengthMin] pairs;
 * `wakeHour` is the morning wake for that day (end of the overnight that started
 * the evening before). Optionally inject a deep-night split gap.
 */
function dayEntries(
    dayOffset: number,
    opts: {
        wakeHour?: number;
        naps?: [number, number][];
        split?: boolean; // insert a 1h wakeful block at ~2am
    } = {},
): SleepEntry[] {
    const { wakeHour = 7, naps = [], split = false } = opts;
    const es: SleepEntry[] = [];
    // Overnight ending at this morning's wake.
    if (split) {
        // ...19:00 prev → 02:00, then 03:00 → wake (a 1h split at 2–3am).
        es.push(entry(at(ANCHOR, dayOffset - 1, 19), at(ANCHOR, dayOffset, 2), 'night'));
        es.push(entry(at(ANCHOR, dayOffset, 3), at(ANCHOR, dayOffset, wakeHour), 'night'));
    } else {
        es.push(entry(at(ANCHOR, dayOffset - 1, 19), at(ANCHOR, dayOffset, wakeHour), 'night'));
    }
    for (const [startHour, lenMin] of naps) {
        const s = at(ANCHOR, dayOffset, startHour);
        es.push(entry(s, s + lenMin * MIN, 'nap'));
    }
    return es;
}

const RULE_3to2 = TRANSITION_RULES.find((r) => r.type === '3-to-2') as TransitionRule;

describe('ruleForMonths / age windows', () => {
    it('maps ages into the right transition (half-open bands)', () => {
        expect(ruleForMonths(2)).toBeNull();
        expect(ruleForMonths(4)?.type).toBe('4-to-3');
        expect(ruleForMonths(6)?.type).toBe('4-to-3');
        expect(ruleForMonths(7)?.type).toBe('3-to-2');
        expect(ruleForMonths(9)?.type).toBe('3-to-2');
        expect(ruleForMonths(10)).toBeNull(); // gap: reliable 2-nap age
        expect(ruleForMonths(12)).toBeNull();
        expect(ruleForMonths(13)).toBeNull(); // 2→1 band is 14–18mo; 13 is not in it yet
        expect(ruleForMonths(14)?.type).toBe('2-to-1');
        expect(ruleForMonths(18)?.type).toBe('2-to-1');
        expect(ruleForMonths(19)).toBeNull();
    });

    it('flags under ~6 months for cues-over-clock', () => {
        expect(isUnderSixMonths(5)).toBe(true);
        expect(isUnderSixMonths(6)).toBe(false);
    });
});

describe('deriveDaySignals', () => {
    it('counts naps and short naps by start day', () => {
        const es = dayEntries(0, { naps: [[9, 90], [12, 30], [15, 40]] });
        const [d] = deriveDaySignals(es);
        expect(d.napCount).toBe(3);
        // 30 and 40 min are <= 45 min short; 90 is not.
        expect(d.shortNaps).toBe(2);
    });

    it('ignores running (unfinished) naps', () => {
        const s = at(ANCHOR, 0, 9);
        const es = [...dayEntries(0, {}), entry(s, null, 'nap')];
        const [d] = deriveDaySignals(es);
        expect(d.napCount).toBe(0);
    });

    it('detects early waking (before 6am) from the morning wake', () => {
        const early = deriveDaySignals(dayEntries(0, { wakeHour: 5 }));
        expect(early[0].earlyWaking).toBe(true);
        const onTime = deriveDaySignals(dayEntries(0, { wakeHour: 7 }));
        expect(onTime[0].earlyWaking).toBe(false);
    });

    it('detects a deep-night split', () => {
        const withSplit = deriveDaySignals(dayEntries(0, { split: true }));
        expect(withSplit.find((d) => d.dayStart === at(ANCHOR, 0, 0))?.splitNight).toBe(true);
        const noSplit = deriveDaySignals(dayEntries(0, {}));
        expect(noSplit[0].splitNight).toBe(false);
    });

    it('napResistance is never derived from timestamps', () => {
        const d = deriveDaySignals(dayEntries(0, { naps: [[9, 20]] }));
        expect(d[0].napResistance).toBe(false);
    });

    it('a short-nap boundary is inclusive at SHORT_NAP_MAX_MS', () => {
        const s = at(ANCHOR, 0, 9);
        const es = [entry(s, s + SHORT_NAP_MAX_MS, 'nap'), entry(s + 4 * H, s + 4 * H + SHORT_NAP_MAX_MS + MIN, 'nap')];
        const [d] = deriveDaySignals(es);
        expect(d.shortNaps).toBe(1);
    });
});

describe('signal flags & clustering', () => {
    const base: DaySignals = { dayStart: 0, napCount: 3, shortNaps: 0, earlyWaking: false, splitNight: false, napResistance: false };

    it('infers a skipped nap when napCount < age target', () => {
        const f = daySignalFlags({ ...base, napCount: 2 }, 3);
        expect(f.shortOrSkippedNap).toBe(true);
    });

    it('a zero-log day never counts as skipped', () => {
        const f = daySignalFlags({ ...base, napCount: 0 }, 3);
        expect(f.shortOrSkippedNap).toBe(false);
        expect(daySignalCount({ ...base, napCount: 0 }, 3)).toBe(0);
    });

    it('early waking or split night ALONE is not a trigger day (nap must be involved)', () => {
        const early = { ...base, earlyWaking: true };
        const split = { ...base, splitNight: true };
        expect(daySignalCount(early, 3)).toBe(1);
        expect(isTriggerDay(early, 3)).toBe(false);
        expect(isTriggerDay(split, 3)).toBe(false);
        // Both together, still no nap-specific signal → still not a trigger.
        expect(isTriggerDay({ ...base, earlyWaking: true, splitNight: true }, 3)).toBe(false);
    });

    it('a trigger day needs a nap-specific signal PLUS one more', () => {
        // short nap alone = 1 signal, not enough.
        expect(isTriggerDay({ ...base, shortNaps: 1 }, 3)).toBe(false);
        // short nap + early waking = 2, nap-specific present → trigger.
        expect(isTriggerDay({ ...base, shortNaps: 1, earlyWaking: true }, 3)).toBe(true);
        // resistance + split night → trigger.
        expect(isTriggerDay({ ...base, napResistance: true, splitNight: true }, 3)).toBe(true);
    });
});

describe('manual (self-reported) signals', () => {
    it('counts and clusters', () => {
        expect(manualSignalCount({ napResistance: true, earlyWaking: true })).toBe(2);
        expect(isManualCluster({ napResistance: true, earlyWaking: true })).toBe(true);
        // Two signals but neither nap-specific → not a cluster.
        expect(isManualCluster({ earlyWaking: true, splitNights: true })).toBe(false);
        // One nap-specific signal alone → not a cluster.
        expect(isManualCluster({ shortNaps: true })).toBe(false);
    });
});

/** N cluster days for the 3→2 rule: short nap + early wake, wake at 5am. */
function clusterDay(dayOffset: number): SleepEntry[] {
    return dayEntries(dayOffset, { wakeHour: 5, naps: [[9, 30], [13, 80]] }); // 2 naps (<3 = skipped) + short + early
}

describe('detectNapTransition — log path', () => {
    it('does not fire outside any age window', () => {
        const es = [...clusterDay(-2), ...clusterDay(-1), ...clusterDay(0)];
        const r = detectNapTransition(es, 11, { now: NOW });
        expect(r.detected).toBe(false);
        expect(r.transition).toBeNull();
        expect(r.rule).toBeNull();
    });

    it('fires when the cluster is sustained across the trigger-day threshold', () => {
        const es = [...clusterDay(-2), ...clusterDay(-1), ...clusterDay(0)];
        const r = detectNapTransition(es, 8, { now: NOW });
        expect(r.transition).toBe('3-to-2');
        expect(r.clusterDays).toBeGreaterThanOrEqual(RULE_3to2.minTriggerDays);
        expect(r.detected).toBe(true);
        expect(r.source).toBe('logs');
    });

    it('does NOT fire on one bad day (temporary regression, not a transition)', () => {
        // Six calm days + a single rough day.
        const calm = [-6, -5, -4, -3, -2, -1].flatMap((d) => dayEntries(d, { wakeHour: 7, naps: [[9, 90], [13, 90], [16, 60]] }));
        const es = [...calm, ...clusterDay(0)];
        const r = detectNapTransition(es, 8, { now: NOW });
        expect(r.clusterDays).toBe(1);
        expect(r.detected).toBe(false);
    });

    it('2→1 needs the higher ≥4-day threshold', () => {
        const three = [-2, -1, 0].flatMap((d) => dayEntries(d, { wakeHour: 5, naps: [[10, 30]] })); // 1 nap (<2), short, early
        const r3 = detectNapTransition(three, 15, { now: NOW });
        expect(r3.clusterDays).toBe(3);
        expect(r3.detected).toBe(false); // 3 < 4
        const four = [-3, -2, -1, 0].flatMap((d) => dayEntries(d, { wakeHour: 5, naps: [[10, 30]] }));
        const r4 = detectNapTransition(four, 15, { now: NOW });
        expect(r4.clusterDays).toBe(4);
        expect(r4.detected).toBe(true);
    });

    it('excludes days older than the lookback window', () => {
        const old = [-20, -19, -18].flatMap((d) => clusterDay(d));
        const r = detectNapTransition(old, 8, { now: NOW });
        expect(r.clusterDays).toBe(0);
        expect(r.detected).toBe(false);
    });
});

describe('detectNapTransition — manual path & under-6mo', () => {
    it('fires from self-report alone with no logs', () => {
        const r = detectNapTransition([], 8, { now: NOW, manual: { napResistance: true, earlyWaking: true } });
        expect(r.detected).toBe(true);
        expect(r.source).toBe('reported');
        expect(r.reportedCount).toBe(2);
    });

    it('reports source "both" when logs and reports agree', () => {
        const es = [...clusterDay(-2), ...clusterDay(-1), ...clusterDay(0)];
        const r = detectNapTransition(es, 8, { now: NOW, manual: { napResistance: true, shortNaps: true } });
        expect(r.source).toBe('both');
    });

    it('flags under-6-months on a 4→3 detection', () => {
        const r = detectNapTransition([], 5, { now: NOW, manual: { napResistance: true, shortNaps: true } });
        expect(r.transition).toBe('4-to-3');
        expect(r.detected).toBe(true);
        expect(r.underSixMonths).toBe(true);
    });
});

describe('buildLengtheningPlan', () => {
    it('lengthens each window ~15 min, clamped, and never suggests dropping abruptly', () => {
        const rule = TRANSITION_RULES.find((r) => r.type === '3-to-2') as TransitionRule;
        const plan = buildLengtheningPlan(rule, [2, 2, 2, 2]);
        expect(plan.stepMinutes).toBe(STEP_MINUTES);
        expect(STEP_MINUTES).toBe(15);
        expect(plan.suggested).toEqual([2.25, 2.25, 2.25, 2.25]);
        expect(plan.current).toEqual([2, 2, 2, 2]);
        expect(plan.notes.join(' ')).toMatch(/never drop the nap abruptly/i);
    });

    it('clamps at the app maximum window', () => {
        const rule = TRANSITION_RULES.find((r) => r.type === '2-to-1') as TransitionRule;
        const plan = buildLengtheningPlan(rule, [6, 6]);
        expect(plan.suggested).toEqual([6, 6]);
    });

    it('2→1 adds the morning-nap shift (toward ~5h after wake, no earlier than 11:00)', () => {
        const rule = TRANSITION_RULES.find((r) => r.type === '2-to-1') as TransitionRule;
        const plan = buildLengtheningPlan(rule, [3, 3, 3]);
        expect(plan.morningNapShift).toEqual({ targetHoursAfterWake: 5, noEarlierThan: '11:00 AM' });
        expect(plan.notes.join(' ')).toMatch(/morning nap/i);
    });

    it('earlier transitions have no morning-nap shift', () => {
        const rule = TRANSITION_RULES.find((r) => r.type === '4-to-3') as TransitionRule;
        const plan = buildLengtheningPlan(rule, [1.5, 1.5, 1.5, 1.5, 1.5]);
        expect(plan.morningNapShift).toBeUndefined();
    });
});

describe('dismiss persistence', () => {
    beforeEach(() => localStorage.clear());

    it('round-trips and de-dupes dismissed types', () => {
        saveDismissed(['3-to-2', '3-to-2', '2-to-1']);
        expect(loadDismissed().sort()).toEqual(['2-to-1', '3-to-2']);
    });

    it('isDismissed keys on the transition type', () => {
        const r = detectNapTransition([], 8, { now: NOW, manual: { napResistance: true, earlyWaking: true } });
        expect(isDismissed(r, ['3-to-2'])).toBe(true);
        expect(isDismissed(r, ['2-to-1'])).toBe(false); // a different, later transition still shows
    });

    it('rejects a corrupt stored blob', () => {
        saveDismissed(['3-to-2']);
        // simulate junk
        localStorage.setItem(NAP_TRANSITION_DISMISS_KEY, '"not-an-array"');
        expect(loadDismissed()).toEqual([]);
    });
});
