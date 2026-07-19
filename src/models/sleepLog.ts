// @doc:sleep-nap-logging
// Sleep & nap logging — the correctness core lives here as pure functions so it
// can be proven in unit tests; the `.vue` shell is only a thin renderer over it.
//
// Design invariants that make the two headline bugs impossible:
//   - The running clock is COMPUTED from a stored start timestamp (epoch ms)
//     plus accumulated paused time — never a foreground counter. Elapsed is a
//     function of `now`, so closing/reopening the app or restarting the device
//     loses nothing (`elapsedMs` is correct for a start N hours in the past).
//   - Entries are plain {start, end} epoch-ms pairs. Editing sets raw
//     timestamps with NO clamping to "today", so an entry created at 1am is
//     freely backdatable to yesterday — the classic midnight bug can't occur.

import { loadJSON, saveJSON, storageKey } from './storage';

export type SleepKind = 'nap' | 'night';

export interface SleepEntry {
    /** Stable id (used as a list key and for edit/delete). */
    id: string;
    /** Sleep start, epoch ms. The source of truth for elapsed time. */
    start: number;
    /** Sleep end, epoch ms, or null while the timer is still running. */
    end: number | null;
    /** Total time spent paused so far, in ms (accumulated across resumes). */
    pausedMs: number;
    /** Epoch ms the current pause began, or null when actively running. */
    pauseStart: number | null;
    /** 'nap' or 'night', inferred from the start time unless overridden. */
    kind: SleepKind;
    /** True once the user hand-picks the kind, so re-inference stops touching it. */
    kindOverridden: boolean;
}

/** localStorage key for the log — namespaced + versioned via the shared helper. */
export const SLEEP_LOG_KEY = storageKey('sleepLog', 1);

/** A running sleep over this many ms triggers a gentle "still asleep?" prompt. */
export const STILL_ASLEEP_MS = 12 * 60 * 60 * 1000;

const MINUTE_MS = 60 * 1000;

// --- kind inference -------------------------------------------------------

// Night sleep is anything that starts in the evening or the small hours; the
// rest of the day is a nap. 7pm–7am reads as "night", matching typical bedtimes
// (a 1am start is night sleep, not a nap). The user can always override.
const NIGHT_START_HOUR = 19; // 7pm and later
const NIGHT_END_HOUR = 7;    // before 7am

/** Infer nap vs night from the local hour of the start timestamp. */
export function inferKind(startMs: number): SleepKind {
    const hour = new Date(startMs).getHours();
    return hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR ? 'night' : 'nap';
}

// --- id --------------------------------------------------------------------

let idCounter = 0;
/** Best-effort unique id; falls back to a counter where crypto is unavailable. */
export function newId(): string {
    try {
        if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
            return crypto.randomUUID();
        }
    } catch {
        /* fall through to the counter */
    }
    idCounter += 1;
    return `s${idCounter}-${idCounter.toString(36)}`;
}

// --- timer state transitions (all pure: return a NEW entry) ---------------

/** Start a new running timer at `startMs`, kind inferred from the time of day. */
export function createEntry(startMs: number, kind?: SleepKind): SleepEntry {
    return {
        id: newId(),
        start: startMs,
        end: null,
        pausedMs: 0,
        pauseStart: null,
        kind: kind ?? inferKind(startMs),
        kindOverridden: kind !== undefined,
    };
}

export function isRunning(entry: SleepEntry): boolean {
    return entry.end === null;
}

export function isPaused(entry: SleepEntry): boolean {
    return entry.pauseStart !== null;
}

/** Pause a running timer. No-op if already paused or already stopped. */
export function pauseEntry(entry: SleepEntry, now: number): SleepEntry {
    if (!isRunning(entry) || isPaused(entry)) return entry;
    return { ...entry, pauseStart: now };
}

/** Resume a paused timer, banking the paused span into `pausedMs`. */
export function resumeEntry(entry: SleepEntry, now: number): SleepEntry {
    if (entry.pauseStart === null) return entry;
    const bankedPause = Math.max(0, now - entry.pauseStart);
    return { ...entry, pausedMs: entry.pausedMs + bankedPause, pauseStart: null };
}

/** Stop a running timer at `now`, first resuming so no pause is left dangling. */
export function stopEntry(entry: SleepEntry, now: number): SleepEntry {
    if (!isRunning(entry)) return entry;
    const resumed = resumeEntry(entry, now);
    return { ...resumed, end: now };
}

/** Override the nap/night label; marks it sticky so re-inference leaves it be. */
export function setKind(entry: SleepEntry, kind: SleepKind): SleepEntry {
    return { ...entry, kind, kindOverridden: true };
}

/**
 * Edit an entry's start/end (backdating included — timestamps are stored raw,
 * never clamped to today). When the kind was never hand-picked, it is
 * re-inferred from the new start so a backdated entry re-labels sensibly.
 */
export function editEntry(
    entry: SleepEntry,
    patch: { start?: number; end?: number | null; kind?: SleepKind },
): SleepEntry {
    const next: SleepEntry = { ...entry };
    if (patch.start !== undefined) next.start = patch.start;
    if (patch.end !== undefined) next.end = patch.end;
    if (patch.kind !== undefined) {
        next.kind = patch.kind;
        next.kindOverridden = true;
    } else if (patch.start !== undefined && !next.kindOverridden) {
        next.kind = inferKind(next.start);
    }
    return next;
}

// --- elapsed / duration ----------------------------------------------------

/**
 * Active sleep duration in ms — the whole point of the timestamp model.
 * = (end-or-now − start) − paused time, so it is correct for a timer whose
 * start is hours in the past, regardless of whether the app was open the whole
 * time. Never negative.
 */
export function elapsedMs(entry: SleepEntry, now: number): number {
    const until = entry.end ?? now;
    const currentPause = entry.pauseStart !== null ? Math.max(0, now - entry.pauseStart) : 0;
    return Math.max(0, until - entry.start - entry.pausedMs - currentPause);
}

/** Wall-clock span (end-or-now − start) ignoring pauses, for runaway checks. */
export function spanMs(entry: SleepEntry, now: number): number {
    const until = entry.end ?? now;
    return Math.max(0, until - entry.start);
}

/** A running timer past the 12h mark — prompt "still asleep?", never auto-stop. */
export function isStillAsleepPrompt(entry: SleepEntry, now: number): boolean {
    return isRunning(entry) && spanMs(entry, now) >= STILL_ASLEEP_MS;
}

/** More than one timer running at once (twins / overlapping caregivers). */
export function runningCount(entries: SleepEntry[]): number {
    return entries.filter(isRunning).length;
}

// --- daily totals ----------------------------------------------------------

/** Length of the overlap of [aStart,aEnd) and [bStart,bEnd) in ms (>= 0). */
function overlapMs(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
    return Math.max(0, Math.min(aEnd, bEnd) - Math.max(aStart, bStart));
}

export interface DailyTotals {
    napMs: number;
    nightMs: number;
    totalMs: number;
}

/**
 * Sleep totals falling inside the day window [dayStart, dayEnd), split by kind.
 * Each entry's [start, end-or-now) span is clipped to the window, so a sleep
 * that crosses midnight contributes only its in-window portion to each day
 * (no double counting). Paused time is attributed to the entry's start day.
 */
export function dailyTotals(
    entries: SleepEntry[],
    dayStart: number,
    dayEnd: number,
    now: number,
): DailyTotals {
    let napMs = 0;
    let nightMs = 0;
    for (const entry of entries) {
        const end = entry.end ?? now;
        let ms = overlapMs(entry.start, end, dayStart, dayEnd);
        if (ms <= 0) continue;
        // Subtract paused time from the day that owns the entry's start.
        if (entry.start >= dayStart && entry.start < dayEnd) {
            ms = Math.max(0, ms - entry.pausedMs);
        }
        if (entry.kind === 'night') nightMs += ms;
        else napMs += ms;
    }
    return { napMs, nightMs, totalMs: napMs + nightMs };
}

/** Local midnight (start of day) containing `ms`, as epoch ms. */
export function startOfLocalDay(ms: number): number {
    const d = new Date(ms);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

// --- <input type="datetime-local"> <-> epoch ms ---------------------------
// The edit UI uses native datetime-local inputs, whose value is a local
// wall-clock string with no timezone. These two helpers are exact inverses at
// minute resolution, which is what makes backdating across midnight trivial:
// the input carries the date, so there is no "today" to clamp to.

function pad(n: number): string {
    return String(n).padStart(2, '0');
}

/** epoch ms -> "YYYY-MM-DDTHH:mm" in local time (for a datetime-local input). */
export function toLocalInput(ms: number): string {
    const d = new Date(ms);
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}`
    );
}

/** "YYYY-MM-DDTHH:mm" local -> epoch ms; null for an empty/invalid string. */
export function fromLocalInput(value: string): number | null {
    if (!value) return null;
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? null : ms;
}

/** Round a timestamp down to the whole minute (datetime-local has no seconds). */
export function floorToMinute(ms: number): number {
    return Math.floor(ms / MINUTE_MS) * MINUTE_MS;
}

// --- persistence -----------------------------------------------------------

/** A stored entry passes shape validation (defends against corrupt/old blobs). */
function isValidEntry(value: unknown): value is SleepEntry {
    if (typeof value !== 'object' || value === null) return false;
    const e = value as Record<string, unknown>;
    return (
        typeof e.id === 'string' &&
        typeof e.start === 'number' &&
        (e.end === null || typeof e.end === 'number') &&
        typeof e.pausedMs === 'number' &&
        (e.pauseStart === null || typeof e.pauseStart === 'number') &&
        (e.kind === 'nap' || e.kind === 'night') &&
        typeof e.kindOverridden === 'boolean'
    );
}

/** Load the log from localStorage, dropping any entries that fail validation. */
export function loadLog(): SleepEntry[] {
    const raw = loadJSON<unknown>(SLEEP_LOG_KEY, []);
    if (!Array.isArray(raw)) return [];
    return raw.filter(isValidEntry);
}

/** Persist the whole log (best-effort; wiped by "Delete all my data"). */
export function saveLog(entries: SleepEntry[]): void {
    saveJSON(SLEEP_LOG_KEY, entries);
}
