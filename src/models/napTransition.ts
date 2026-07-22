// @doc:nap-transition-detector
// Nap-transition readiness detector (4→3→2→1) — the correctness core lives here
// as pure functions so it can be proven in unit tests; NapTransition.vue is a
// thin renderer over it. Everything runs on-device from the local sleep log
// (sleepLog.ts) and/or the parent's own self-reported toggles — no account, no
// network, offline-safe (G01/G04).
//
// Guiding rules from the Tier-3 transition table (practitioner convention, NOT
// validated medicine — every surface carries the Tier-3 badge + citation):
//   - Fire ONLY on a SIGNAL CLUSTER (nap resistance + short/skipped naps +
//     early waking + split nights, together and age-appropriate) — never one
//     bad nap. Requiring the cluster over MULTIPLE days is what separates a real
//     transition from a passing regression.
//   - 4→3 ≈ 4–6 mo, 3→2 ≈ 7–9 mo, 2→1 ≈ 14–18 mo (the last fires only when a
//     nap is fought/skipped ≥4×/week for ~1–2 weeks).
//   - Guidance is an OFFER, never a command: lengthen wake windows ~15 min at a
//     time, never drop a nap abruptly.
//   - Under ~6 months, stay cues-over-clock; never push a rigid schedule.

import { type SleepEntry, startOfLocalDay } from './sleepLog';
import { WW_STEP_HOURS, MAX_WINDOW_HOURS, roundToStepHours } from './PersonalizedWindows';
import { loadJSON, saveJSON, storageKey } from './storage';

const HOUR_MS = 60 * 60 * 1000;
const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type TransitionType = '4-to-3' | '3-to-2' | '2-to-1';

/** A nap at or under this length reads as a "short nap" (a catnap-style cycle). */
export const SHORT_NAP_MAX_MS = 45 * MINUTE_MS;

/** A morning wake before this local hour reads as "early waking". */
export const EARLY_WAKE_HOUR = 6;

/** A wakeful block in the deep night at least this long reads as a "split night". */
export const SPLIT_NIGHT_MIN_MS = 45 * MINUTE_MS;

/** A day counts toward a transition only when at least this many signals cluster. */
export const MIN_SIGNALS_PER_DAY = 2;

// --- the Tier-3 transition table -------------------------------------------

export interface TransitionRule {
    type: TransitionType;
    /** Human label for the prompt, e.g. "3 naps → 2 naps". */
    label: string;
    /** Age window (corrected months), half-open [minMonths, maxMonths). */
    minMonths: number;
    maxMonths: number;
    /** The nap count the child is moving DOWN from (naps expected before the drop). */
    fromNaps: number;
    /** The nap count after the transition. */
    toNaps: number;
    /** Days of recent history inspected. */
    lookbackDays: number;
    /** Cluster (trigger) days needed inside the lookback to fire. */
    minTriggerDays: number;
}

// minTriggerDays encodes "over multiple days" (never one bad nap). 2→1 uses 4,
// matching the ≥4×/week-for-1–2-weeks convention; the earlier, faster-moving
// transitions fire a touch sooner (3 of 7) since their windows are shorter.
export const TRANSITION_RULES: readonly TransitionRule[] = [
    { type: '4-to-3', label: '4 naps → 3 naps', minMonths: 4, maxMonths: 7, fromNaps: 4, toNaps: 3, lookbackDays: 7, minTriggerDays: 3 },
    { type: '3-to-2', label: '3 naps → 2 naps', minMonths: 7, maxMonths: 10, fromNaps: 3, toNaps: 2, lookbackDays: 7, minTriggerDays: 3 },
    { type: '2-to-1', label: '2 naps → 1 nap', minMonths: 14, maxMonths: 19, fromNaps: 2, toNaps: 1, lookbackDays: 7, minTriggerDays: 4 },
];

/** The transition whose age window contains `months`, or null (no transition due). */
export function ruleForMonths(months: number): TransitionRule | null {
    return TRANSITION_RULES.find((r) => months >= r.minMonths && months < r.maxMonths) ?? null;
}

/** True when the child is younger than the ~6-month cues-over-clock threshold. */
export function isUnderSixMonths(months: number): boolean {
    return months < 6;
}

// --- per-day signals, derived from the log ---------------------------------

/** The four readiness signals for one local calendar day. `napResistance` is not
 *  derivable from timestamps (the log has no sleep-onset latency), so it only
 *  ever comes from a parent's self-report; the other three are read from logs. */
export interface DaySignals {
    dayStart: number;
    /** Completed naps logged that day. */
    napCount: number;
    /** Completed naps that day at or under SHORT_NAP_MAX_MS. */
    shortNaps: number;
    /** Woke for the day before EARLY_WAKE_HOUR. */
    earlyWaking: boolean;
    /** A wakeful block ≥ SPLIT_NIGHT_MIN_MS in the deep night. */
    splitNight: boolean;
    /** Fought/resisted a nap — self-reported only. */
    napResistance: boolean;
}

function napDurationMs(entry: SleepEntry): number {
    if (entry.end == null) return 0;
    return Math.max(0, entry.end - entry.start - entry.pausedMs);
}

/**
 * Reconstruct per-day readiness signals from the log, keyed by local calendar
 * day. Naps are attributed to the day they start; the morning wake and any
 * deep-night split are attributed to the calendar day they occur on, so one
 * day's object holds that morning's wake, that day's naps, and that night's
 * small-hours split. Pure — no Date.now, no storage.
 */
export function deriveDaySignals(entries: SleepEntry[]): DaySignals[] {
    const sorted = entries
        .filter((e) => typeof e.start === 'number')
        .sort((a, b) => a.start - b.start);

    const byDay = new Map<number, DaySignals>();
    const dayOf = (ms: number): DaySignals => {
        const key = startOfLocalDay(ms);
        let d = byDay.get(key);
        if (!d) {
            d = { dayStart: key, napCount: 0, shortNaps: 0, earlyWaking: false, splitNight: false, napResistance: false };
            byDay.set(key, d);
        }
        return d;
    };

    // Naps: count and short-nap tally, keyed by the nap's start day.
    for (const e of sorted) {
        if (e.kind !== 'nap' || e.end == null) continue;
        const d = dayOf(e.start);
        d.napCount += 1;
        if (napDurationMs(e) <= SHORT_NAP_MAX_MS) d.shortNaps += 1;
    }

    // Morning wake: the end of a night sleep in the early-morning band. Earliest
    // such end per day wins, so a brief re-settle after a too-early wake can't
    // mask the early rise. Before EARLY_WAKE_HOUR ⇒ early waking.
    for (const e of sorted) {
        if (e.kind !== 'night' || e.end == null) continue;
        const endHour = new Date(e.end).getHours();
        if (endHour < 3 || endHour >= 10) continue; // not a morning wake
        const d = dayOf(e.end);
        d.earlyWaking = d.earlyWaking || endHour < EARLY_WAKE_HOUR;
    }

    // Split night: a gap between consecutive sleeps that sits in the deep night
    // (gap starts 00:00–05:00 local) and lasts at least SPLIT_NIGHT_MIN_MS.
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        if (prev.end == null) continue;
        const gapMs = cur.start - prev.end;
        if (gapMs < SPLIT_NIGHT_MIN_MS) continue;
        const gapStartHour = new Date(prev.end).getHours();
        if (gapStartHour >= 0 && gapStartHour < 5) {
            dayOf(prev.end).splitNight = true;
        }
    }

    return [...byDay.values()].sort((a, b) => a.dayStart - b.dayStart);
}

// --- clustering ------------------------------------------------------------

/** The distinct signal categories present on a day, given the age's nap target.
 *  A "skipped nap" is inferred when the child napped but fewer times than the
 *  age band expects; a zero-log day contributes nothing (can't tell skip from
 *  an unlogged day). */
export function daySignalFlags(day: DaySignals, fromNaps: number): {
    napResistance: boolean;
    shortOrSkippedNap: boolean;
    earlyWaking: boolean;
    splitNight: boolean;
} {
    const skipped = day.napCount >= 1 && day.napCount < fromNaps;
    return {
        napResistance: day.napResistance,
        shortOrSkippedNap: day.shortNaps > 0 || skipped,
        earlyWaking: day.earlyWaking,
        splitNight: day.splitNight,
    };
}

/** How many of the four signal categories a day shows. */
export function daySignalCount(day: DaySignals, fromNaps: number): number {
    const f = daySignalFlags(day, fromNaps);
    return Number(f.napResistance) + Number(f.shortOrSkippedNap) + Number(f.earlyWaking) + Number(f.splitNight);
}

/** A "trigger" (cluster) day: at least one NAP-specific signal (resistance or a
 *  short/skipped nap) AND at least MIN_SIGNALS_PER_DAY signals total. Early
 *  waking or a split night alone never trips it — the nap itself must be
 *  involved, so a rough night without daytime nap trouble doesn't read as a
 *  nap transition. */
export function isTriggerDay(day: DaySignals, fromNaps: number): boolean {
    const f = daySignalFlags(day, fromNaps);
    const napSpecific = f.napResistance || f.shortOrSkippedNap;
    return napSpecific && daySignalCount(day, fromNaps) >= MIN_SIGNALS_PER_DAY;
}

// --- self-reported (manual) signals ----------------------------------------

/** Parent-toggled signals ("I'm seeing this over the past week"). A manual
 *  cluster gives a log-free detection path; the UI frames the toggles as an
 *  ongoing pattern, not a single day. */
export interface ManualSignals {
    napResistance?: boolean;
    shortNaps?: boolean;
    earlyWaking?: boolean;
    splitNights?: boolean;
}

export function manualSignalCount(m: ManualSignals): number {
    return Number(!!m.napResistance) + Number(!!m.shortNaps) + Number(!!m.earlyWaking) + Number(!!m.splitNights);
}

/** A manual cluster: a nap-specific report plus at least MIN_SIGNALS_PER_DAY total. */
export function isManualCluster(m: ManualSignals): boolean {
    const napSpecific = !!m.napResistance || !!m.shortNaps;
    return napSpecific && manualSignalCount(m) >= MIN_SIGNALS_PER_DAY;
}

// --- detection -------------------------------------------------------------

export type DetectionSource = 'none' | 'logs' | 'reported' | 'both';

export interface NapTransitionResult {
    /** True when a transition looks likely (age-appropriate cluster present). */
    detected: boolean;
    transition: TransitionType | null;
    /** Human label, e.g. "3 naps → 2 naps"; '' when no rule applies. */
    label: string;
    /** The matched rule (for the plan), or null when the age is outside every window. */
    rule: TransitionRule | null;
    /** Log-derived trigger (cluster) days inside the lookback. */
    clusterDays: number;
    /** Days with any usable signal inside the lookback. */
    daysConsidered: number;
    /** Distinct self-reported signals toggled on. */
    reportedCount: number;
    /** What drove the detection. */
    source: DetectionSource;
    /** True when the child is under ~6 months (cues-over-clock caveat applies). */
    underSixMonths: boolean;
    ageMonths: number;
    /** Plain-language "why / why not". */
    reason: string;
    /** The per-day signals inspected (most recent last). */
    days: DaySignals[];
}

export interface DetectOptions {
    now?: number;
    manual?: ManualSignals;
}

/**
 * Classify whether the child looks ready for its age-appropriate nap transition,
 * from logged history and/or self-reported signals. Fires only on a signal
 * cluster sustained across the rule's trigger-day threshold (log path) or a
 * multi-signal self-report (manual path). Never fires outside the age windows.
 */
export function detectNapTransition(
    entries: SleepEntry[],
    ageMonths: number,
    options: DetectOptions = {},
): NapTransitionResult {
    const now = options.now ?? Date.now();
    const manual = options.manual ?? {};
    const rule = ruleForMonths(ageMonths);
    const underSixMonths = isUnderSixMonths(ageMonths);
    const reportedCount = manualSignalCount(manual);

    if (!rule) {
        return {
            detected: false, transition: null, label: '', rule: null,
            clusterDays: 0, daysConsidered: 0, reportedCount, source: 'none',
            underSixMonths, ageMonths,
            reason: `At ${ageMonths} months there isn't a nap transition due — no change suggested.`,
            days: [],
        };
    }

    const cutoff = startOfLocalDay(now) - (rule.lookbackDays - 1) * DAY_MS;
    const days = deriveDaySignals(entries).filter((d) => d.dayStart >= cutoff && d.dayStart <= now);
    const usableDays = days.filter((d) => daySignalCount(d, rule.fromNaps) > 0);
    const clusterDays = days.filter((d) => isTriggerDay(d, rule.fromNaps)).length;

    const logCluster = clusterDays >= rule.minTriggerDays;
    const manualCluster = isManualCluster(manual);
    const detected = logCluster || manualCluster;

    let source: DetectionSource = 'none';
    if (logCluster && manualCluster) source = 'both';
    else if (logCluster) source = 'logs';
    else if (manualCluster) source = 'reported';

    let reason: string;
    if (detected) {
        const parts: string[] = [];
        if (logCluster) parts.push(`${clusterDays} of the last ${rule.lookbackDays} days show the cluster`);
        if (manualCluster) parts.push(`${reportedCount} signals reported`);
        reason = `Looks like the ${rule.label} transition: ${parts.join(' and ')}.`;
    } else {
        reason = `Not enough clustered signs yet for the ${rule.label} transition `
            + `(${clusterDays} of ${rule.minTriggerDays} cluster days needed). One rough day isn't a transition.`;
    }

    return {
        detected, transition: rule.type, label: rule.label, rule,
        clusterDays, daysConsidered: usableDays.length, reportedCount, source,
        underSixMonths, ageMonths, reason, days,
    };
}

// --- the gentle lengthening plan -------------------------------------------

export interface LengtheningPlan {
    transition: TransitionType;
    fromNaps: number;
    toNaps: number;
    /** The gradual step, in minutes (~15). */
    stepMinutes: number;
    /** Current wake windows (hours), morning first. */
    current: number[];
    /** Each window nudged one step longer, clamped — "this week's" gentle target. */
    suggested: number[];
    /** For 2→1 only: shift the (single) morning nap later toward this many hours
     *  after wake, but no earlier than `noEarlierThan`. */
    morningNapShift?: { targetHoursAfterWake: number; noEarlierThan: string };
    /** Plain-language, non-prescriptive guidance lines. */
    notes: string[];
}

/** The gradual-shift step used across the app's Tier-3 guidance: 15 min = 0.25 h. */
export const STEP_MINUTES = Math.round(WW_STEP_HOURS * 60);

/**
 * Build the gentle guidance plan for a transition: lengthen each wake window by
 * one ~15-min step (clamped to the app's max), never dropping a nap abruptly.
 * For 2→1 it adds the standard morning-nap push (toward ~5 h after wake, no
 * earlier than ~11:00). Pure — takes the current windows, returns a fresh plan.
 */
export function buildLengtheningPlan(rule: TransitionRule, currentWws: number[]): LengtheningPlan {
    const current = [...currentWws];
    const suggested = current.map((w) => Math.min(MAX_WINDOW_HOURS, roundToStepHours(w + WW_STEP_HOURS)));

    const notes: string[] = [
        `Lengthen each wake window about ${STEP_MINUTES} minutes at a time — hold for a few days, then nudge again.`,
        `Never drop the nap abruptly: stretch the windows so the extra nap fades on its own.`,
        `These are ranges, not deadlines — follow your baby's sleepy cues over the clock.`,
    ];

    let morningNapShift: LengtheningPlan['morningNapShift'];
    if (rule.type === '2-to-1') {
        morningNapShift = { targetHoursAfterWake: 5, noEarlierThan: '11:00 AM' };
        notes.unshift(
            `Shift the morning nap about ${STEP_MINUTES} minutes later every few days, aiming for roughly `
            + `5 hours after wake and no earlier than 11:00 AM — that becomes the single midday nap.`,
        );
    }

    return {
        transition: rule.type,
        fromNaps: rule.fromNaps,
        toNaps: rule.toNaps,
        stepMinutes: STEP_MINUTES,
        current,
        suggested,
        morningNapShift,
        notes,
    };
}

// --- dismiss persistence ---------------------------------------------------
// A dismissed prompt stays dismissed until the signals change. Each transition
// happens once in a child's life, so we key the dismissal on the transition
// TYPE: dismissing "3→2" hides it for good, but when the child later ages into
// "2→1" (a genuinely new signal) the prompt returns. Stored on-device like the
// log and wiped by "Delete all my data".

export const NAP_TRANSITION_DISMISS_KEY = storageKey('napTransitionDismissed', 1);

/** Load the set of dismissed transition types. */
export function loadDismissed(): TransitionType[] {
    const raw = loadJSON<unknown>(NAP_TRANSITION_DISMISS_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter((t): t is TransitionType => t === '4-to-3' || t === '3-to-2' || t === '2-to-1');
}

export function saveDismissed(types: TransitionType[]): void {
    // De-dupe so repeated dismissals can't grow the blob unbounded.
    saveJSON(NAP_TRANSITION_DISMISS_KEY, [...new Set(types)]);
}

/** True when this result's transition has been dismissed by the parent. */
export function isDismissed(result: NapTransitionResult, dismissed: TransitionType[]): boolean {
    return result.transition !== null && dismissed.includes(result.transition);
}
