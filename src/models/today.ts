// @doc:wake-window-schedule-generator @doc:anti-anxiety-mechanics
// @doc:24h-visual-day-breakdown
//
// The arithmetic behind the Today screen, as pure functions.
//
// The redesign puts a single countdown at the top of the app — the largest thing
// on screen and the one number a parent reads at 3am — which means "what happens
// next, and how long until it" is now load-bearing rather than incidental. It
// lives here, unit-tested, rather than inside a `computed` in a .vue file: every
// edge that matters (the last nap of the day already past, a window the clock is
// currently sitting inside, a day that has run out of events) is a branch, and a
// branch that only exists in a template is a branch nobody can test.
//
// Everything works in MINUTES FROM LOCAL MIDNIGHT, matching ScheduleSetting.

export type DaySegmentKind = 'night' | 'awake' | 'nap'

export interface DaySegment {
    /** Minutes from midnight, inclusive. */
    start: number
    /** Minutes from midnight, exclusive. Always > start. */
    end: number
    kind: DaySegmentKind
}

/**
 * The whole 24 hours as contiguous segments — night, awake, nap, awake, … night.
 *
 * Built by walking the day rather than by drawing three proportional blocks,
 * because the strip has to show WHEN each nap falls, not just how much of the
 * day it takes up. Segments are clamped into [0, 1440] and zero-length ones are
 * dropped, so an impossible plan (wake windows longer than the waking day, which
 * makes nap length negative) degrades to a legible strip instead of drawing nap
 * time that runs backwards. The warning row on the Today screen says what went
 * wrong; the strip just shows less.
 */
export function daySegments(
    wakeMinutes: number,
    bedtimeMinutes: number,
    naps: { start: number; end: number }[],
): DaySegment[] {
    const DAY = 24 * 60
    const clamp = (v: number) => Math.min(DAY, Math.max(0, v))
    const out: DaySegment[] = []
    const push = (start: number, end: number, kind: DaySegmentKind) => {
        const a = clamp(start)
        const b = clamp(end)
        if (b > a) out.push({ start: a, end: b, kind })
    }

    const wake = clamp(wakeMinutes)
    const bed = clamp(bedtimeMinutes)

    push(0, wake, 'night')
    let cursor = wake
    for (const nap of naps) {
        if (nap.end <= cursor) continue // out of order / already covered
        push(cursor, nap.start, 'awake')
        push(Math.max(cursor, nap.start), nap.end, 'nap')
        cursor = Math.max(cursor, clamp(nap.end))
    }
    push(cursor, bed, 'awake')
    push(Math.max(cursor, bed), DAY, 'night')
    return out
}

/** A segment list as a left-to-right CSS gradient, using a colour per kind. */
export function segmentsToGradient(
    segments: DaySegment[],
    colors: Record<DaySegmentKind, string>,
): string {
    const DAY = 24 * 60
    const pct = (v: number) => `${((v / DAY) * 100).toFixed(2)}%`
    const stops = segments
        .map((s) => `${colors[s.kind]} ${pct(s.start)}, ${colors[s.kind]} ${pct(s.end)}`)
        .join(', ')
    return `linear-gradient(to right, ${stops})`
}

// --- what happens next -----------------------------------------------------

export interface NapWindow {
    earliest: number
    latest: number
    lengthMinutes: number
}

export type NextEventKind = 'nap' | 'bedtime'

export interface NextEvent {
    kind: NextEventKind
    /** 1-based nap number; 0 for bedtime. */
    index: number
    earliest: number
    latest: number
    /** Expected nap length; 0 for bedtime. */
    lengthMinutes: number
    /** True while the clock is already inside the window — "now is the time". */
    inWindow: boolean
    /** Minutes until the window OPENS. 0 once it has. */
    untilMinutes: number
}

/**
 * The next thing the parent has to do.
 *
 * A window stays "next" until its LATEST start has passed, not its earliest:
 * mid-window is exactly the moment to put the baby down, and an app that skips
 * ahead to the following nap the second the window opens would be telling a
 * parent standing over a crib that they had missed it. Null once bedtime's
 * window is behind us — the day has no next event, which the hero renders as its
 * own state rather than as a negative countdown.
 */
export function nextEvent(
    napWindows: NapWindow[],
    bedtimeWindow: { earliest: number; latest: number },
    nowMinutes: number,
): NextEvent | null {
    const napIndex = napWindows.findIndex((w) => nowMinutes <= w.latest)
    if (napIndex !== -1) {
        const w = napWindows[napIndex]
        return {
            kind: 'nap',
            index: napIndex + 1,
            earliest: w.earliest,
            latest: w.latest,
            lengthMinutes: w.lengthMinutes,
            inWindow: nowMinutes >= w.earliest,
            untilMinutes: Math.max(0, w.earliest - nowMinutes),
        }
    }
    if (nowMinutes <= bedtimeWindow.latest) {
        return {
            kind: 'bedtime',
            index: 0,
            earliest: bedtimeWindow.earliest,
            latest: bedtimeWindow.latest,
            lengthMinutes: 0,
            inWindow: nowMinutes >= bedtimeWindow.earliest,
            untilMinutes: Math.max(0, bedtimeWindow.earliest - nowMinutes),
        }
    }
    return null
}

/** Minutes from local midnight for a Date (defaults to now). */
export function minutesFromMidnight(date: Date = new Date()): number {
    return date.getHours() * 60 + date.getMinutes()
}

// --- normal-range bands ----------------------------------------------------

export interface BandGeometry {
    /** CSS left/width for the shaded typical range. */
    bandLeft: string
    bandWidth: string
    /** CSS left for the "your day" mark. */
    markLeft: string
    inRange: boolean
}

/**
 * Where the typical range and the parent's own value sit on a 0–100% track.
 *
 * The mark is clamped into the track so an out-of-range value still renders
 * ON the bar (at its end) instead of escaping the rounded corner and floating in
 * the margin — which is what a raw percentage does the moment someone types a
 * 20-hour night. It reads as "past the end", which is the honest summary, and
 * `inRange` is what the copy branches on, never the position.
 */
export function bandGeometry(
    low: number,
    high: number,
    actual: number,
    scaleMin: number,
    scaleMax: number,
): BandGeometry {
    const span = scaleMax - scaleMin
    const pct = (v: number) => {
        if (span <= 0) return 0
        return Math.min(100, Math.max(0, ((v - scaleMin) / span) * 100))
    }
    const left = pct(low)
    const right = pct(high)
    return {
        bandLeft: `${left.toFixed(1)}%`,
        bandWidth: `${Math.max(0, right - left).toFixed(1)}%`,
        markLeft: `${pct(actual).toFixed(1)}%`,
        inRange: actual >= low && actual <= high,
    }
}

/** Round hours for display without pretending to minute precision. */
export function hoursText(hours: number): string {
    const rounded = Math.round(hours * 4) / 4
    const whole = Math.floor(rounded)
    const mins = Math.round((rounded - whole) * 60)
    if (whole <= 0) return `${mins} min`
    return mins === 0 ? `${whole} hr` : `${whole} hr ${mins} min`
}
