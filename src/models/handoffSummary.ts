// @doc:caregiver-handoff-notes
// The "Since you last had the baby" summary — transparent arithmetic over the
// on-device sleep log, NO model/AI (supports the G04 no-AI stance). Pure
// functions so the last-nap + "so far" math is proven in unit tests; the
// HandoffNotes.vue shell only renders over it.
//
// Correctness invariants (mirrors sleepLog.ts):
//   - Durations are epoch-ms deltas, so midnight/DST can't distort "since last"
//     (a nap 11:50pm–12:10am is 20 min, never negative or off-by-an-hour).
//   - An in-progress nap at handoff is reported as "so far" (now - start),
//     never a blank — the outgoing caregiver hands off mid-nap all the time.

import { SleepEntry } from './sleepLog';

/** Minimal last-nap snapshot that rides the handoff link (see planUrl.ts). The
 * incoming caregiver's device has no log of its own, so what-just-happened has
 * to travel in the URL, not be recomputed. `end === null` means still asleep. */
export interface LastNapSnapshot {
    /** Sleep start, epoch ms. */
    start: number;
    /** Sleep end, epoch ms, or null while the baby is still asleep. */
    end: number | null;
}

/** The most recently started sleep entry as a snapshot, or null when the log is
 * empty. Picks by start time so a still-running nap (the mid-handoff case) wins
 * over an earlier completed one. */
export function lastNapSnapshot(entries: SleepEntry[]): LastNapSnapshot | null {
    let latest: SleepEntry | null = null;
    for (const e of entries) {
        if (latest === null || e.start > latest.start) latest = e;
    }
    return latest === null ? null : { start: latest.start, end: latest.end };
}

/** A resolved "since last" line, ready to phrase. `durationMs` is the completed
 * span (end - start) or, for an in-progress nap, the time asleep so far
 * (now - start) — both clamped non-negative. */
export interface SinceLastNap {
    inProgress: boolean;
    start: number;
    end: number | null;
    durationMs: number;
}

/** Resolve a snapshot against `now` into a phrasable line, or null for no nap.
 * All arithmetic is epoch-ms deltas, so it is immune to midnight/DST. */
export function sinceLastNap(snap: LastNapSnapshot | null, now: number): SinceLastNap | null {
    if (snap === null) return null;
    const inProgress = snap.end === null;
    const until = snap.end ?? now;
    return {
        inProgress,
        start: snap.start,
        end: snap.end,
        durationMs: Math.max(0, until - snap.start),
    };
}

/** Local minutes-from-midnight for an epoch ms, for feeding into formatClock.
 * Uses the reader's local wall clock (same convention as the rest of the app). */
export function clockMinutesOf(ms: number): number {
    const d = new Date(ms);
    return d.getHours() * 60 + d.getMinutes();
}
