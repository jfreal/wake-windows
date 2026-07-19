import { describe, it, expect } from 'vitest';
import {
    guidanceModeForMonths,
    effectiveGuidanceMode,
    windowSlopMinutes,
    cuesReliabilityNote,
    MODE_GUIDANCE,
    ATYPICAL_REASONS,
    isAtypicalReason,
    ATYPICAL_MESSAGE,
    CUES_UNTIL_MONTHS,
    CLOCK_FROM_MONTHS,
    CUES_UNRELIABLE_FROM_MONTHS,
} from './GuidanceMode';
import { getSources } from './Citations';
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
    it('offers the spec reasons', () => {
        expect(ATYPICAL_REASONS.map((r) => r.id)).toEqual(
            ['illness', 'teething', 'travel', 'regression', 'vaccination', 'other']);
    });

    it('validates reason ids (unknown URL values fall back gracefully)', () => {
        expect(isAtypicalReason('teething')).toBe(true);
        expect(isAtypicalReason('bad-day')).toBe(false);
        expect(isAtypicalReason('')).toBe(false);
    });

    it('uses the calm, no-demerit message from the spec', () => {
        expect(ATYPICAL_MESSAGE).toBe(
            "Atypical day — don't over-adjust. Follow cues today; your normal plan will still be here tomorrow.");
    });
});
