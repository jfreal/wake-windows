// @doc:trends-daily-totals
// Aggregation for the home-screen "Today" totals block and the 7-day sleep
// sparkline. Pure functions over the existing sleep log so they can be proven
// in unit tests; the `.vue` shell is only a thin renderer. Everything is
// computed on-device from the parent's own entries — no model, no server.

import {
    type SleepEntry,
    dailyTotals,
    startOfLocalDay,
} from './sleepLog';
import { recommendationForMonths } from './Citations';

const DAY_MS = 24 * 60 * 60 * 1000;

// --- day windows -----------------------------------------------------------

/** Start of the local day AFTER `dayStart` (DST-safe — a day may be 23/25h). */
function nextLocalDay(dayStart: number): number {
    const d = new Date(dayStart);
    d.setDate(d.getDate() + 1);
    return startOfLocalDay(d.getTime());
}

/** Does entry `e`'s [start, end-or-now) span touch the window [dayStart,dayEnd)? */
function overlapsDay(e: SleepEntry, dayStart: number, dayEnd: number, now: number): boolean {
    const end = e.end ?? now;
    return Math.min(end, dayEnd) - Math.max(e.start, dayStart) > 0;
}

// --- today's headline numbers ----------------------------------------------

/**
 * Number of naps touching the day window. A nap that crosses midnight counts on
 * each day it overlaps (matching how its minutes split in `dailyTotals`). An
 * in-progress nap counts as soon as it has started — its running minutes are in
 * the total, so it belongs in the count too.
 */
export function napCountForDay(
    entries: SleepEntry[],
    dayStart: number,
    dayEnd: number,
    now: number,
): number {
    return entries.filter(
        (e) => e.kind === 'nap' && overlapsDay(e, dayStart, dayEnd, now),
    ).length;
}

/**
 * True while a sleep that overlaps today is still running — so the day's total
 * is still climbing and should be labeled "so far", never presented as final.
 */
export function isDayInProgress(
    entries: SleepEntry[],
    dayStart: number,
    dayEnd: number,
    now: number,
): boolean {
    return entries.some(
        (e) => e.end === null && overlapsDay(e, dayStart, dayEnd, now),
    );
}

// --- 7-day sleep-total series (the sparkline data) -------------------------

export interface DaySleep {
    /** Local midnight for the day, epoch ms. */
    dayStart: number;
    /** Total sleep (nap + night) falling inside that local day, ms. */
    totalMs: number;
}

/**
 * Total sleep per local day for the last `days` days, oldest first and ending
 * with today. Each day is built from `dailyTotals`, so a sleep crossing
 * midnight splits across the two days it touches (no double counting), and
 * today's in-progress sleep contributes its elapsed minutes "so far". Days with
 * no logged sleep come back as an honest `totalMs: 0` — never dropped, never
 * blank-shamed.
 */
export function sevenDaySleepSeries(
    entries: SleepEntry[],
    now: number,
    days = 7,
): DaySleep[] {
    const today = startOfLocalDay(now);
    const out: DaySleep[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStart = startOfLocalDay(d.getTime());
        const dayEnd = nextLocalDay(dayStart);
        out.push({ dayStart, totalMs: dailyTotals(entries, dayStart, dayEnd, now).totalMs });
    }
    return out;
}

// --- age-appropriate total-sleep band (context, never a grade) -------------

export interface SleepBand {
    /** Lower / upper bound of the typical 24h total-sleep range, in hours. */
    minHours: number;
    maxHours: number;
    /** Raw range text as published, e.g. "12–16 hours (incl. naps)". */
    label: string;
    /** Human age label for the band, e.g. "4 to 6 months". */
    ageLabel: string;
    /** Provenance tier (1 = evidence-based) and the citation ids behind it. */
    tier: number;
    sourceIds: string[];
}

/** Parse the first "min–max" (en-dash or hyphen) hour range out of a string. */
function parseHourRange(value: string): { min: number; max: number } | null {
    const m = value.match(/(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)/);
    if (!m) return null;
    const min = parseFloat(m[1]);
    const max = parseFloat(m[2]);
    if (Number.isNaN(min) || Number.isNaN(max)) return null;
    return { min, max };
}

/**
 * The age-appropriate AASM/NSF total-sleep band (Tier 1) for `months`, pulled
 * from the citation library. Returns null when no band or no numeric range is
 * available, so the caller can simply omit the context rather than invent one.
 */
export function sleepBandForMonths(months: number): SleepBand | null {
    const rec = recommendationForMonths(months);
    if (!rec) return null;
    const item = rec.items.find((i) => /total\s*sleep/i.test(i.metric));
    if (!item) return null;
    const range = parseHourRange(item.value);
    if (!range) return null;
    return {
        minHours: range.min,
        maxHours: range.max,
        label: item.value,
        ageLabel: rec.ageLabel,
        tier: item.tier,
        sourceIds: item.sourceIds,
    };
}

/** Where a total sits relative to its band — for wording only, never a score. */
export type BandPosition = 'below' | 'within' | 'above';

/** Classify `hours` against `band`. Neutral: the caller must not color-code it. */
export function bandPosition(hours: number, band: SleepBand): BandPosition {
    if (hours < band.minHours) return 'below';
    if (hours > band.maxHours) return 'above';
    return 'within';
}

export { DAY_MS };
