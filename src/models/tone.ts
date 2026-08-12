// @doc:anti-anxiety-mechanics

/**
 * The phrases this app never says to a parent, in one place.
 *
 * Cited content is written in a lot of files — FAQ answers, atypical-day tips,
 * guidance notes — and each of them used to carry its own hand-copied version of
 * this list, which had already drifted (one checked "should have", another
 * checked "failure"). A single list means a new banned phrase lands everywhere
 * at once instead of only where someone remembered to paste it.
 *
 * This is the unit-test half of the rule the e2e anti-anxiety spec enforces on
 * the rendered page.
 */
export const SCOLDING_PATTERN =
    /you missed|off track|behind schedule|should have|habit you created|\bfailure\b|\bfailing\b/i
