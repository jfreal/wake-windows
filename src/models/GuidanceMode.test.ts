import { describe, it, expect } from 'vitest';
import {
    guidanceModeForMonths,
    effectiveGuidanceMode,
    windowSlopMinutes,
    cuesReliabilityNote,
    MODE_GUIDANCE,
    ATYPICAL_REASONS,
    ATYPICAL_TIPS,
    isAtypicalReason,
    ATYPICAL_MESSAGE,
    newbornDayNightNote,
    DAY_NIGHT_NOTE_UNTIL_MONTHS,
    CUES_UNTIL_MONTHS,
    CLOCK_FROM_MONTHS,
    CUES_UNRELIABLE_FROM_MONTHS,
} from './GuidanceMode';
import { getSources } from './Citations';
import { SCOLDING_PATTERN } from './tone';
import { ScheduleSetting } from './ScheduleSetting';

describe('guidanceModeForMonths', () => {
    it('is cues-led under 5 months corrected', () => {
        expect(guidanceModeForMonths(0)).toBe('cues');
        expect(guidanceModeForMonths(2)).toBe('cues');
        expect(guidanceModeForMonths(4)).toBe('cues');
    });

    it('hands off softly at 5-6 months (both framings, cues weighted)', () => {
        expect(guidanceModeForMonths(5)).toBe('transition');
        expect(guidanceModeForMonths(5.9)).toBe('transition');
    });

    it('is clock-led from 6 months corrected', () => {
        expect(guidanceModeForMonths(6)).toBe('clock');
        expect(guidanceModeForMonths(9)).toBe('clock');
        expect(guidanceModeForMonths(24)).toBe('clock');
    });

    it('never hard-cuts: thresholds define a transition band, not a switch', () => {
        expect(CUES_UNTIL_MONTHS).toBeLessThan(CLOCK_FROM_MONTHS);
    });
});

describe('effectiveGuidanceMode', () => {
    it('matches the age mode on a normal day', () => {
        expect(effectiveGuidanceMode(2, false)).toBe('cues');
        expect(effectiveGuidanceMode(5, false)).toBe('transition');
        expect(effectiveGuidanceMode(8, false)).toBe('clock');
    });

    it('drops to cues-first on an atypical day regardless of age', () => {
        expect(effectiveGuidanceMode(2, true)).toBe('cues');
        expect(effectiveGuidanceMode(5, true)).toBe('cues');
        expect(effectiveGuidanceMode(12, true)).toBe('cues');
    });
});

describe('windowSlopMinutes', () => {
    it('widens ranges as guidance leans cues-ward', () => {
        expect(windowSlopMinutes('cues')).toBe(30);
        expect(windowSlopMinutes('transition')).toBe(20);
        expect(windowSlopMinutes('clock')).toBe(15);
    });

    it('never narrows below the anti-anxiety baseline (ranges, not a stopwatch)', () => {
        for (const mode of ['cues', 'transition', 'clock'] as const) {
            expect(windowSlopMinutes(mode)).toBeGreaterThanOrEqual(
                ScheduleSetting.NAP_WINDOW_SLOP_MINUTES);
        }
    });
});

describe('cuesReliabilityNote', () => {
    it('is silent while cues are still reliable', () => {
        expect(cuesReliabilityNote(2)).toBeNull();
        expect(cuesReliabilityNote(8)).toBeNull();
    });

    it('notes cue fade from ~9 months so the clock clearly leads', () => {
        expect(cuesReliabilityNote(CUES_UNRELIABLE_FROM_MONTHS)).toMatch(/less reliable/);
        expect(cuesReliabilityNote(14)).toMatch(/clock/);
    });
});

describe('MODE_GUIDANCE', () => {
    it('gives every mode a one-line rationale with resolvable citations', () => {
        for (const mode of ['cues', 'transition', 'clock'] as const) {
            const g = MODE_GUIDANCE[mode];
            expect(g.rationale.length).toBeGreaterThan(0);
            expect(g.sourceIds.length).toBeGreaterThan(0);
            // every cited id must exist in citations.json (no dangling references)
            expect(getSources(g.sourceIds).length).toBe(g.sourceIds.length);
        }
    });

    it('cites Tier 1/2 evidence for the mode change (brand: badge every claim)', () => {
        for (const g of Object.values(MODE_GUIDANCE)) {
            expect([1, 2]).toContain(g.tier);
            for (const src of getSources(g.sourceIds)) {
                expect([1, 2]).toContain(src.tier);
            }
        }
    });

    it('anchors the cues-mode framing in circadian maturation sources', () => {
        expect(MODE_GUIDANCE.cues.sourceIds).toContain('rivkees-2007');
        expect(MODE_GUIDANCE.clock.sourceIds).toContain('mindell-2016-app');
    });
});

describe('atypical day flag', () => {
    it('offers the spec reasons (plus the 2026-08 daycare/car-nap additions)', () => {
        expect(ATYPICAL_REASONS.map((r) => r.id)).toEqual(
            ['illness', 'teething', 'travel', 'regression', 'vaccination', 'daycare', 'car-nap', 'other']);
    });

    it('validates reason ids (unknown URL values fall back gracefully)', () => {
        expect(isAtypicalReason('teething')).toBe(true);
        expect(isAtypicalReason('daycare')).toBe(true);
        expect(isAtypicalReason('car-nap')).toBe(true);
        expect(isAtypicalReason('bad-day')).toBe(false);
        expect(isAtypicalReason('')).toBe(false);
    });

    it('uses the calm, no-demerit message from the spec', () => {
        expect(ATYPICAL_MESSAGE).toBe(
            "Atypical day — don't over-adjust. Follow cues today; your normal plan will still be here tomorrow.");
    });

    it('reason tips exist only for reasons with a counting rule, and never scold', () => {
        expect(Object.keys(ATYPICAL_TIPS).sort()).toEqual(['car-nap', 'daycare']);
        for (const id of Object.keys(ATYPICAL_TIPS)) {
            expect(isAtypicalReason(id), `tip for unknown reason "${id}"`).toBe(true);
            expect(ATYPICAL_TIPS[id], `scolding language in tip "${id}"`).not.toMatch(SCOLDING_PATTERN);
        }
    });
});

// @doc:cues-vs-clock-mode
describe('newborn day/night-confusion note', () => {
    it('shows under 2 months (corrected) and not after', () => {
        expect(newbornDayNightNote(0)).not.toBeNull();
        expect(newbornDayNightNote(1)).not.toBeNull();
        expect(newbornDayNightNote(DAY_NIGHT_NOTE_UNTIL_MONTHS)).toBeNull();
        expect(newbornDayNightNote(6)).toBeNull();
    });

    it('is reassurance-first, cited, and Tier 3', () => {
        const note = newbornDayNightNote(1)!;
        expect(note.text).toMatch(/Normal at this age/);
        expect(note.text).not.toMatch(SCOLDING_PATTERN);
        expect(note.tier).toBe(3);
        expect(note.sourceIds).toContain('mcgraw-1999');
        expect(note.sourceIds).toContain('huckleberry-day-night');
    });

    // Naming the ids isn't enough — the banner renders whatever getSources returns,
    // and getSources silently drops ids it can't find, so a typo would show a note
    // with no citations at all rather than failing anywhere.
    it('every cited source resolves to a real record the banner can render', () => {
        const note = newbornDayNightNote(1)!;
        const sources = getSources(note.sourceIds);
        expect(sources.length, 'a cited source id did not resolve').toBe(note.sourceIds.length);
        for (const src of sources) {
            expect(src.org, `source "${src.id}" has no org to label the link`).toBeTruthy();
            expect(src.url, `source "${src.id}" has no url`).toMatch(/^https?:\/\//);
        }
    });
});
