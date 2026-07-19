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
    { id: 'other', label: 'Other' },
]

export function isAtypicalReason(id: string): boolean {
    return ATYPICAL_REASONS.some((r) => r.id === id)
}

export const ATYPICAL_MESSAGE =
    "Atypical day — don't over-adjust. Follow cues today; your normal plan will still be here tomorrow."
