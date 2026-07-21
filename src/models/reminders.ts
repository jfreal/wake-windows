// @doc:reminders-nudges
// Pure, on-device scheduling logic for the single "pre-nap wind-down" nudge.
// No Vue, no service worker, no localStorage here — just deterministic time
// math the component and the service worker both lean on, so every gate
// (lead-time offset, quiet-hours, daily-cap) is unit-testable in isolation and
// impossible to bypass by construction.
//
// Everything works in absolute epoch-ms against the user's LOCAL wall clock and
// is recomputed from the live plan on every call — nothing is pinned to a stored
// timestamp. That is what keeps a TZ/DST change honest: the plan's window moves,
// so the nudge time moves with it, instead of firing an hour early against a
// frozen absolute deadline.

/** Selectable lead times, in minutes before the wake-window range's end. */
export const LEAD_MINUTE_OPTIONS = [15, 30, 45] as const;
export type LeadMinutes = (typeof LEAD_MINUTE_OPTIONS)[number];
export const DEFAULT_LEAD_MINUTES: LeadMinutes = 30;

/** Overnight quiet window [start, end) in minutes-from-local-midnight. Default
 *  20:00–07:00: a wind-down nudge must never land in the middle of the night. */
export const DEFAULT_QUIET_START_MIN = 20 * 60; // 8:00 PM
export const DEFAULT_QUIET_END_MIN = 7 * 60; // 7:00 AM

/** At most one nudge per local calendar day — a hard cap, by construction, so
 *  the feature can never become the "notification spam" reviewers hate. */
export const DEFAULT_DAILY_CAP = 1;

/** Per-session, per-device opt-in preference. Off by default. */
export interface ReminderPrefs {
    enabled: boolean;
    leadMinutes: LeadMinutes;
}

export const DEFAULT_REMINDER_PREFS: ReminderPrefs = {
    enabled: false,
    leadMinutes: DEFAULT_LEAD_MINUTES,
};

/** Coerce an arbitrary value to a valid LeadMinutes, falling back to default —
 *  a stale/corrupt stored blob can never yield an off-spec lead time. */
export function normalizeLeadMinutes(value: unknown): LeadMinutes {
    return (LEAD_MINUTE_OPTIONS as readonly number[]).includes(value as number)
        ? (value as LeadMinutes)
        : DEFAULT_LEAD_MINUTES;
}

/** Re-validate a persisted prefs blob (loadJSON returns `unknown` shapes). */
export function normalizePrefs(value: unknown): ReminderPrefs {
    const v = (value ?? {}) as Partial<ReminderPrefs>;
    return {
        enabled: v.enabled === true,
        leadMinutes: normalizeLeadMinutes(v.leadMinutes),
    };
}

const MS_PER_MINUTE = 60_000;

/** Fire time for a nudge: `leadMinutes` before the end of the wake-window range. */
export function nudgeTimeMs(windowEndMs: number, leadMinutes: number): number {
    return windowEndMs - leadMinutes * MS_PER_MINUTE;
}

/** Ms remaining until the nudge should fire; negative once it is due/past. */
export function msUntilNudge(nowMs: number, windowEndMs: number, leadMinutes: number): number {
    return nudgeTimeMs(windowEndMs, leadMinutes) - nowMs;
}

/** Local wall-clock minutes-from-midnight for an epoch-ms instant. Reads local
 *  getHours/getMinutes so the gate tracks the device's current TZ/DST offset. */
export function minutesOfDayLocal(ms: number): number {
    const d = new Date(ms);
    return d.getHours() * 60 + d.getMinutes();
}

/**
 * True if `ms` falls inside the quiet window (local wall time). The window is
 * half-open [start, end); an overnight window (start > end, e.g. 20:00–07:00)
 * wraps midnight. start === end means "no quiet hours".
 */
export function isWithinQuietHours(
    ms: number,
    startMin: number = DEFAULT_QUIET_START_MIN,
    endMin: number = DEFAULT_QUIET_END_MIN,
): boolean {
    if (startMin === endMin) return false;
    const m = minutesOfDayLocal(ms);
    return startMin < endMin
        ? m >= startMin && m < endMin // same-day window
        : m >= startMin || m < endMin; // overnight wrap
}

/** True if two instants land on the same LOCAL calendar day. */
export function isSameLocalDay(aMs: number, bMs: number): boolean {
    const a = new Date(aMs);
    const b = new Date(bMs);
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/** How many past fires happened on the same local day as `nowMs`. */
export function firesToday(firedAtMs: readonly number[], nowMs: number): number {
    return firedAtMs.filter((t) => isSameLocalDay(t, nowMs)).length;
}

/** True once today's fires have reached the daily cap. */
export function dailyCapReached(
    firedAtMs: readonly number[],
    nowMs: number,
    cap: number = DEFAULT_DAILY_CAP,
): boolean {
    return firesToday(firedAtMs, nowMs) >= cap;
}

/** Drop fire timestamps not on `nowMs`'s local day — keeps the stored history
 *  bounded and makes the daily cap self-reset at local midnight. */
export function pruneFiresToToday(firedAtMs: readonly number[], nowMs: number): number[] {
    return firedAtMs.filter((t) => isSameLocalDay(t, nowMs));
}

export type NudgeSkipReason = 'too-early' | 'window-passed' | 'quiet-hours' | 'daily-cap';

export interface NudgeDecisionInput {
    nowMs: number;
    /** Absolute end of the current wake-window range (the nap window's latest). */
    windowEndMs: number;
    leadMinutes: LeadMinutes;
    /** Timestamps of past fires (any horizon); only today's count toward the cap. */
    firedAtMs: readonly number[];
    cap?: number;
    quietStartMin?: number;
    quietEndMin?: number;
}

export interface NudgeDecision {
    fire: boolean;
    reason?: NudgeSkipReason;
    /** When the nudge is due, so callers can render a countdown even when skipped. */
    nudgeAtMs: number;
}

/**
 * The one decision the SW / component asks: fire the wind-down nudge now?
 * Gates, in order — too-early, window-already-passed (so we never scold with a
 * "you missed it"), quiet-hours, daily-cap. `fire` is true only if all pass.
 */
export function decideNudge(input: NudgeDecisionInput): NudgeDecision {
    const {
        nowMs,
        windowEndMs,
        leadMinutes,
        firedAtMs,
        cap = DEFAULT_DAILY_CAP,
        quietStartMin = DEFAULT_QUIET_START_MIN,
        quietEndMin = DEFAULT_QUIET_END_MIN,
    } = input;

    const nudgeAtMs = nudgeTimeMs(windowEndMs, leadMinutes);

    if (nowMs < nudgeAtMs) return { fire: false, reason: 'too-early', nudgeAtMs };
    if (nowMs >= windowEndMs) return { fire: false, reason: 'window-passed', nudgeAtMs };
    if (isWithinQuietHours(nowMs, quietStartMin, quietEndMin))
        return { fire: false, reason: 'quiet-hours', nudgeAtMs };
    if (dailyCapReached(firedAtMs, nowMs, cap))
        return { fire: false, reason: 'daily-cap', nudgeAtMs };

    return { fire: true, nudgeAtMs };
}
