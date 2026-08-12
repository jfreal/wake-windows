// @doc:cues-vs-clock-mode
// Age-driven cues-vs-clock guidance, keyed to CORRECTED age
// (ScheduleSetting.monthsSinceBirth). Under ~6 months the circadian clock is
// still maturing, so watching the baby beats watching the clock; 5–6 months is
// a deliberate soft handoff (both framings, cues weighted) — never a hard cut.

export type GuidanceMode = 'cues' | 'transition' | 'clock'

/** Fully cues-led below this corrected age (months). */
export const CUES_UNTIL_MONTHS = 5

/** Clock-led at/after this corrected age (months); the 5–6 band shows both. */
export const CLOCK_FROM_MONTHS = 6

/** Cues get less reliable from about this corrected age; clock clearly leads. */
export const CUES_UNRELIABLE_FROM_MONTHS = 9

// Note: this cues-vs-clock banding (5/6/9 mo) is deliberately distinct from the
// recommendation age bands in Citations.ageBandForMonths (0-3/3-4/4-6/6-9/…).
// They answer different questions — "how much to trust the clock" vs "which
// published sleep-needs row applies" — and are shown together, so if you move a
// boundary here, re-check that the guidance copy still reads sensibly beside the
// EvidenceGuidance band it lands in. They are not meant to share a threshold.
export function guidanceModeForMonths(months: number): GuidanceMode {
    if (months < CUES_UNTIL_MONTHS) return 'cues'
    if (months < CLOCK_FROM_MONTHS) return 'transition'
    return 'clock'
}

// @doc:atypical-day-flag
/** On an atypical day guidance drops back to cues-first regardless of age —
 * the flag is relief, never a demerit; the age-based mode returns with it off. */
export function effectiveGuidanceMode(months: number, atypical: boolean): GuidanceMode {
    return atypical ? 'cues' : guidanceModeForMonths(months)
}

/** Half-width (minutes) of displayed nap/bedtime windows per mode. Clock mode
 * keeps the ±15 anti-anxiety baseline (never a stopwatch); cues-led modes
 * widen further so times read as loose ranges. */
export function windowSlopMinutes(mode: GuidanceMode): number {
    switch (mode) {
        case 'cues': return 30
        case 'transition': return 20
        case 'clock': return 15
    }
}

export interface ModeGuidance {
    /** Short mode chip, e.g. "Cues first". */
    label: string
    headline: string
    /** One-line why, tied to the citations below. */
    rationale: string
    tier: number
    sourceIds: string[]
}

export const MODE_GUIDANCE: Record<GuidanceMode, ModeGuidance> = {
    cues: {
        label: 'Cues first',
        headline: 'Watch the baby, not the clock',
        rationale:
            'Under ~6 months (corrected age) the circadian clock is still maturing, so sleep runs on '
            + 'sleep pressure and hunger — sleepy cues beat clock times. Times below are loose ranges, not targets.',
        tier: 1,
        sourceIds: ['rivkees-2007', 'mcgraw-1999', 'mindell-2016-app'],
    },
    transition: {
        label: 'Cues first, clock emerging',
        headline: 'Keep following cues — the clock is starting to matter',
        rationale:
            'Around 5–6 months (corrected age) the internal clock matures and sleep patterns start to organize. '
            + 'Lean on cues, with the clock times as a growing second opinion.',
        tier: 1,
        sourceIds: ['rivkees-2007', 'mindell-2016-app'],
    },
    clock: {
        label: 'Clock first',
        headline: 'A by-the-clock schedule works now',
        rationale:
            'From ~6 months (corrected age) the circadian clock has matured and morning wake time stabilizes, '
            + 'so by-the-clock scheduling is realistic — keep sleepy cues as a secondary check.',
        tier: 1,
        sourceIds: ['mindell-2016-app', 'rivkees-2007'],
    },
}

/** Extra nuance for older babies; null when it doesn't apply. */
export function cuesReliabilityNote(months: number): string | null {
    if (months < CUES_UNRELIABLE_FROM_MONTHS) return null
    return 'After ~9 months sleepy cues get less reliable, so let the clock clearly lead.'
}

// @doc:cues-vs-clock-mode
/** Day/night confusion typically resolves by ~8 weeks; the note shows below
 * this corrected age (months). */
export const DAY_NIGHT_NOTE_UNTIL_MONTHS = 2

export interface NewbornNote {
    text: string
    tier: number
    sourceIds: string[]
}

/** Newborn day/night-confusion note (research/07 §8 — a common newborn FAQ
 * with no prior coverage). Reassurance-first: an immature body clock, not a
 * habit and not a mistake; null once baby is past the confusion age. */
export function newbornDayNightNote(months: number): NewbornNote | null {
    if (months >= DAY_NIGHT_NOTE_UNTIL_MONTHS) return null
    return {
        text:
            'Days and nights mixed up? Normal at this age — the body clock is still under construction. '
            + 'Bright, active days; dark, boring nights; and gently ending naps that run past ~2 hours all '
            + 'help it along. It typically sorts itself out by around 8 weeks.',
        tier: 3,
        sourceIds: ['mcgraw-1999', 'huckleberry-day-night'],
    }
}

// @doc:atypical-day-flag
// One-tap "today is atypical" disruption flag (illness, teething, travel,
// regression, vaccination, other). Reassurance-first: calm copy, wider windows,
// cues-first framing — no guilt, no streaks.

export interface AtypicalReason {
    id: string
    label: string
}

export const ATYPICAL_REASONS: AtypicalReason[] = [
    { id: 'illness', label: 'Illness' },
    { id: 'teething', label: 'Teething' },
    { id: 'travel', label: 'Travel' },
    { id: 'regression', label: 'Regression' },
    { id: 'vaccination', label: 'Vaccination' },
    { id: 'daycare', label: 'Daycare day' },
    { id: 'car-nap', label: 'Car/stroller nap' },
    { id: 'other', label: 'Other' },
]

// @doc:atypical-day-flag
/** Reason-specific one-liners for the disruptions parents ask about most
 * (research/08 T13, T20). Practical counting rules, never scolding; reasons
 * without an entry just get the standard atypical treatment. */
export const ATYPICAL_TIPS: Record<string, string> = {
    'car-nap':
        'A car or stroller catnap under ~30 minutes: stretch the next wake window a little and carry on. '
        + 'Longer: count it as a real nap and let the rest of the day shift. One motion nap changes nothing long-term.',
    daycare:
        'Daycare naps run on daycare rules — that\'s fine. If today\'s naps ran short, an earlier bedtime '
        + '(even ~6:00 PM) absorbs it better than a late rescue nap.',
}

export function isAtypicalReason(id: string): boolean {
    return ATYPICAL_REASONS.some((r) => r.id === id)
}

export const ATYPICAL_MESSAGE =
    "Atypical day — don't over-adjust. Follow cues today; your normal plan will still be here tomorrow."
