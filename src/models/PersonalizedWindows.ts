// @doc:personalized-from-local-history
// Optional, opt-in refinement of the age-default wake windows from the baby's
// OWN recent sleep log — plain, inspectable arithmetic, computed entirely
// on-device. No account, no server, no ML, no data training (G01/G04).
//
// The whole feature is a nudge, never a new schedule:
//   1. Reconstruct each day's wake windows from logged sleeps (the awake gap
//      between one sleep ending and the next starting).
//   2. Drop atypical days so illness/teething/travel can't poison the baseline.
//      There is no per-day atypical *record* in the log, so "atypical" is found
//      statistically: a day whose total awake time is a median-absolute-deviation
//      outlier is excluded — the A07 spirit (AtypicalDayFlag.vue) applied to data.
//   3. Take the MEDIAN observed window per position (robust to the odd bad day).
//   4. Nudge each age-default window toward its median, CLAMPED to ±30 min and
//      rounded to the 0.25 h input step — refine the range, don't invent a plan.
//   5. Too little usable data → don't personalize; keep the age default and say so.
//
// Everything here is pure (no Date.now / no storage) except the default `now`,
// so the stats are provable in unit tests.

import { type SleepEntry, startOfLocalDay } from './sleepLog';
import { loadJSON, saveJSON, storageKey } from './storage';

/** Days of history considered ("your last N days"). */
export const DEFAULT_LOOKBACK_DAYS = 7;

/** Need at least this many usable (non-atypical) days before nudging anything. */
export const MIN_DAYS_TO_PERSONALIZE = 3;

/** A single window position needs at least this many samples to be nudged. */
export const MIN_SAMPLES_PER_WINDOW = 3;

/** Personalization only ever nudges a window by this much — it refines, never invents. */
export const MAX_NUDGE_HOURS = 0.5;

/** Gaps longer than this are treated as a logging gap, not a real wake window. */
export const MAX_WAKE_WINDOW_HOURS = 8;

/** Wake-window input granularity (matches the ChildInputs 0.25 h step). */
export const WW_STEP_HOURS = 0.25;

/** Lower/upper clamp for a nudged window (mirrors the ChildInputs min/max). */
export const MIN_WINDOW_HOURS = 0.25;
export const MAX_WINDOW_HOURS = 6;

/** A day is atypical if its total awake time is this many MADs from the median. */
export const OUTLIER_MAD_MULT = 3;

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** One local day's wake windows (hours), in time order: morning first. */
export interface DayWakeWindows {
    dayStart: number;
    windows: number[];
}

/** What happened to one wake-window position under personalization. */
export interface WindowAdjustment {
    /** Position in the wws array (0 = morning). */
    index: number;
    /** The age-default value before nudging (hours). */
    baseHours: number;
    /** Observed median for this position over the used days (hours). */
    medianHours: number;
    /** The nudged value actually applied (hours, rounded to the input step). */
    appliedHours: number;
    /** Observed gap vs. the default, in minutes (can exceed the applied nudge). */
    observedDeltaMinutes: number;
    /** Applied change vs. the default, in minutes (clamped + rounded). */
    appliedDeltaMinutes: number;
    /** How many days contributed a sample to this position. */
    sampleDays: number;
}

export type PersonalizationStatus = 'insufficient-data' | 'no-change' | 'personalized';

export interface PersonalizationResult {
    /** True when at least one window was actually nudged. */
    personalized: boolean;
    /** Full wws to apply — the base with nudges folded in (== base when none). */
    windows: number[];
    /** Only the positions that changed. */
    adjustments: WindowAdjustment[];
    /** Distinct days with any reconstructed window inside the lookback. */
    daysConsidered: number;
    /** Days left after excluding atypical (outlier) days. */
    daysUsed: number;
    /** Days dropped as atypical. */
    excludedDays: number;
    status: PersonalizationStatus;
    lookbackDays: number;
}

// --- basic robust stats ----------------------------------------------------

/** Median of a non-empty numeric list. Returns 0 for an empty list. */
export function median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/** Median absolute deviation from `med` — a spread measure robust to outliers. */
export function medianAbsoluteDeviation(values: number[], med: number): number {
    if (values.length === 0) return 0;
    return median(values.map((v) => Math.abs(v - med)));
}

// --- deriving wake windows from the log ------------------------------------

/**
 * Reconstruct each local day's wake windows (hours) from logged sleeps. A wake
 * window is the awake gap between one sleep ENDING and the next STARTING; it is
 * attributed to the day the baby is awake going into the later sleep (so the
 * morning wake → first-nap gap lands on that morning). Running/unfinished
 * sleeps contribute no "ending", and implausibly long gaps (a missed log) are
 * ignored. Pure — order in equals order out, keyed by local midnight.
 */
export function deriveDailyWakeWindows(entries: SleepEntry[]): DayWakeWindows[] {
    const sorted = entries
        .filter((e) => typeof e.start === 'number')
        .sort((a, b) => a.start - b.start);

    const byDay = new Map<number, number[]>();
    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur = sorted[i];
        if (prev.end == null) continue; // no ending → no measurable window
        const gapMs = cur.start - prev.end;
        if (gapMs <= 0) continue; // overlapping/adjacent — not a wake window
        const gapHours = gapMs / HOUR_MS;
        if (gapHours > MAX_WAKE_WINDOW_HOURS) continue; // logging gap, not awake time
        const day = startOfLocalDay(cur.start);
        const list = byDay.get(day) ?? [];
        list.push(gapHours);
        byDay.set(day, list);
    }

    return [...byDay.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([dayStart, windows]) => ({ dayStart, windows }));
}

// --- the nudge -------------------------------------------------------------

function clamp(value: number, lo: number, hi: number): number {
    return Math.min(hi, Math.max(lo, value));
}

/** Round to the nearest wake-window input step (0.25 h). */
export function roundToStepHours(hours: number): number {
    return Math.round(hours / WW_STEP_HOURS) * WW_STEP_HOURS;
}

interface PersonalizeOptions {
    /** "Now" for the lookback window; defaults to the wall clock. */
    now?: number;
    lookbackDays?: number;
}

/**
 * Nudge `baseWws` toward the baby's own recent median, position by position.
 * Returns the full wws to apply plus a per-position explanation. Never mutates
 * the input. When there isn't enough usable data, returns the base unchanged
 * with `status: 'insufficient-data'`.
 */
export function personalizeWakeWindows(
    baseWws: number[],
    entries: SleepEntry[],
    options: PersonalizeOptions = {},
): PersonalizationResult {
    const now = options.now ?? Date.now();
    const lookbackDays = options.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;

    const cutoff = startOfLocalDay(now) - (lookbackDays - 1) * DAY_MS;
    const days = deriveDailyWakeWindows(entries).filter((d) => d.dayStart >= cutoff);
    const daysConsidered = days.length;

    // Exclude atypical days: those whose total awake time is a MAD outlier.
    const totals = days.map((d) => d.windows.reduce((s, w) => s + w, 0));
    const med = median(totals);
    const mad = medianAbsoluteDeviation(totals, med);
    const kept = mad > 0
        ? days.filter((_, i) => Math.abs(totals[i] - med) <= OUTLIER_MAD_MULT * mad)
        : days;

    const daysUsed = kept.length;
    const excludedDays = daysConsidered - daysUsed;
    const base = [...baseWws];

    if (daysUsed < MIN_DAYS_TO_PERSONALIZE) {
        return {
            personalized: false,
            windows: base,
            adjustments: [],
            daysConsidered,
            daysUsed,
            excludedDays,
            status: 'insufficient-data',
            lookbackDays,
        };
    }

    const windows = [...base];
    const adjustments: WindowAdjustment[] = [];

    for (let i = 0; i < base.length; i++) {
        const samples = kept
            .map((d) => d.windows[i])
            .filter((v): v is number => typeof v === 'number');
        if (samples.length < MIN_SAMPLES_PER_WINDOW) continue;

        const observedMedian = median(samples);
        const rawDelta = observedMedian - base[i];
        const clampedDelta = clamp(rawDelta, -MAX_NUDGE_HOURS, MAX_NUDGE_HOURS);
        const applied = clamp(roundToStepHours(base[i] + clampedDelta), MIN_WINDOW_HOURS, MAX_WINDOW_HOURS);
        const appliedDelta = applied - base[i];
        // Rounded to the same step it landed on, so anything under half a step is no change.
        if (Math.abs(appliedDelta) < WW_STEP_HOURS / 2) continue;

        windows[i] = applied;
        adjustments.push({
            index: i,
            baseHours: base[i],
            medianHours: observedMedian,
            appliedHours: applied,
            observedDeltaMinutes: Math.round(rawDelta * 60),
            appliedDeltaMinutes: Math.round(appliedDelta * 60),
            sampleDays: samples.length,
        });
    }

    return {
        personalized: adjustments.length > 0,
        windows,
        adjustments,
        daysConsidered,
        daysUsed,
        excludedDays,
        status: adjustments.length > 0 ? 'personalized' : 'no-change',
        lookbackDays,
    };
}

// --- plain-language explainer ("show the work") ----------------------------

/** Human label for a wake-window position, given how many windows there are. */
export function wakeWindowLabel(index: number, total: number): string {
    if (index === 0) return 'Morning wake window';
    if (index === total - 1) return 'Last wake window (before bed)';
    return `Wake window ${index + 1}`;
}

/**
 * One-line "show the work" summary for a single adjustment, e.g.
 * "Your last 7 days: mornings run ~10 min longer than the default — nudged to match."
 */
export function describeAdjustment(adj: WindowAdjustment, total: number, lookbackDays: number): string {
    const label = wakeWindowLabel(adj.index, total).toLowerCase();
    const observed = Math.abs(adj.observedDeltaMinutes);
    const direction = adj.observedDeltaMinutes >= 0 ? 'longer' : 'shorter';
    return `Your last ${lookbackDays} days: ${label} runs ~${observed} min ${direction} than the default — nudged to match.`;
}

// --- opt-in preference (off by default) ------------------------------------
// Persisted on-device like the log itself, and wiped by "Delete all my data".
// We store the parent's ORIGINAL age-default windows alongside the flag so that,
// on reload, we re-nudge from the default rather than re-nudging an already-
// personalized value (which would compound), and so "reset to default" is exact.

export const PERSONALIZE_PREF_KEY = storageKey('personalizeWindows', 1);

export interface PersonalizePref {
    enabled: boolean;
    /** The age-default wws captured when personalization was turned on. */
    base: number[] | null;
}

const DEFAULT_PREF: PersonalizePref = { enabled: false, base: null };

export function loadPersonalizePref(): PersonalizePref {
    const raw = loadJSON<Partial<PersonalizePref>>(PERSONALIZE_PREF_KEY, DEFAULT_PREF);
    const enabled = raw?.enabled === true;
    const base = Array.isArray(raw?.base) && raw.base.every((n) => typeof n === 'number')
        ? raw.base
        : null;
    return { enabled, base };
}

export function savePersonalizePref(pref: PersonalizePref): void {
    saveJSON(PERSONALIZE_PREF_KEY, pref);
}
