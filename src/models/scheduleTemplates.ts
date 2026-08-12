// @doc:wake-window-schedule-generator @doc:anti-anxiety-mechanics

// Named schedule templates ("2-3-4", "3-3-4") — the community's shorthand for
// whole days of wake windows (research/08 T9: parents search these exact
// strings). A template is nothing magic: it just fills the wake-window inputs,
// which stay fully editable afterwards. Honesty rules apply — each template
// names the age range it's conventionally used for and the caveat that it
// over-promises sleep for low-sleep-needs babies. Applying one is a starting
// point offered, never a schedule enforced.

export interface ScheduleTemplate {
    id: string
    /** The name parents search for. */
    label: string
    /** Wake windows in hours, morning to bedtime. */
    wws: number[]
    /** Conventional age range, months (inclusive), for showing the right templates. */
    ageMonths: [number, number]
    /** One-line honest description. */
    description: string
}

export const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
    {
        id: '2-3-4',
        label: '2-3-4',
        wws: [2, 3, 4],
        ageMonths: [6, 14],
        description:
            'The classic two-nap day: 2h awake before the first nap, 3h before the second, 4h before bed. '
            + 'A common default around 6–14 months — assumes two solid naps, and over-promises sleep for '
            + 'low-sleep-needs babies.',
    },
    {
        id: '3-3-4',
        label: '3-3-4',
        wws: [3, 3, 4],
        ageMonths: [9, 15],
        description:
            'The lower-sleep-needs variant of 2-3-4: a longer first window for babies who fight the morning '
            + 'nap or wake very early on 2-3-4.',
    },
    {
        id: 'four-naps',
        label: '4-nap day',
        wws: [1.5, 1.75, 1.75, 1.75, 2],
        ageMonths: [3, 6],
        description:
            'A gentle four-nap shape for roughly 3–6 months, windows lengthening through the day. At this '
            + 'age cues still beat any template — treat it as a sketch.',
    },
]

/** Templates conventionally offered at this (corrected) age — the honest set,
 * not everything. Empty under 3 months: newborn days resist templating, and
 * offering one would contradict the cues-first guidance. */
export function templatesForMonths(months: number): ScheduleTemplate[] {
    return SCHEDULE_TEMPLATES.filter((t) => months >= t.ageMonths[0] && months <= t.ageMonths[1])
}

/** True when the current wake windows already match the template (so the UI
 * can mark it active without storing extra state). */
export function matchesTemplate(wws: number[], template: ScheduleTemplate): boolean {
    return wws.length === template.wws.length && wws.every((w, i) => w === template.wws[i])
}

/** Apply in place (the schedule's wws array is reactive state owned by the
 * caller); returns the template for chaining/telemetry-free convenience. */
export function applyTemplate(wws: number[], template: ScheduleTemplate): ScheduleTemplate {
    wws.splice(0, wws.length, ...template.wws)
    return template
}
