import { describe, it, expect } from 'vitest';
import {
    ageBandForMonths,
    recommendationForMonths,
    getSource,
    getSources,
    getTier,
    sources,
    tiers,
    ageBandRecommendations,
    meta,
} from './Citations';

describe('Citations data integrity', () => {
    it('loads sources, tiers, recommendations, and meta', () => {
        expect(sources.length).toBeGreaterThan(0);
        expect(tiers['1']).toBeDefined();
        expect(tiers['2']).toBeDefined();
        expect(tiers['3']).toBeDefined();
        expect(ageBandRecommendations.length).toBeGreaterThan(0);
        expect(meta.lastVerified).toBeTruthy();
    });

    it('every source has a known tier (1, 2, or 3)', () => {
        for (const s of sources) {
            expect([1, 2, 3]).toContain(s.tier);
        }
    });

    it('every source names an author/org with credentials and a link', () => {
        for (const s of sources) {
            expect(s.org).toBeTruthy();
            expect(s.credentials).toBeTruthy();
            expect(s.url).toMatch(/^https?:\/\//);
        }
    });

    it('every recommendation sourceId resolves to a real source', () => {
        for (const band of ageBandRecommendations) {
            for (const item of band.items) {
                expect(item.sourceIds.length).toBeGreaterThan(0);
                for (const id of item.sourceIds) {
                    expect(getSource(id), `missing source ${id}`).toBeDefined();
                }
            }
        }
    });

    it('wake-window items are Tier 2; total-sleep items are Tier 1', () => {
        for (const band of ageBandRecommendations) {
            for (const item of band.items) {
                if (item.metric === 'Wake window') expect(item.tier).toBe(2);
                if (item.metric === 'Total sleep / 24h') expect(item.tier).toBe(1);
            }
        }
    });
});

describe('ageBandForMonths', () => {
    it('maps months to the expected band', () => {
        expect(ageBandForMonths(0)).toBe('0-3mo');
        expect(ageBandForMonths(2)).toBe('0-3mo');
        expect(ageBandForMonths(3)).toBe('3-4mo');   // boundary → more advanced band
        expect(ageBandForMonths(4)).toBe('4-6mo');
        expect(ageBandForMonths(5)).toBe('4-6mo');
        expect(ageBandForMonths(6)).toBe('6-9mo');
        expect(ageBandForMonths(9)).toBe('9-12mo');
        expect(ageBandForMonths(12)).toBe('12-18mo');
        expect(ageBandForMonths(18)).toBe('18-24mo');
        expect(ageBandForMonths(23)).toBe('18-24mo');
    });

    it('clamps out-of-range ages', () => {
        expect(ageBandForMonths(-1)).toBe('0-3mo');
        expect(ageBandForMonths(24)).toBe('18-24mo');
        expect(ageBandForMonths(40)).toBe('18-24mo');
    });

    it('resolves a recommendation for every month 0..24', () => {
        for (let m = 0; m <= 24; m++) {
            expect(recommendationForMonths(m), `no rec for ${m} mo`).toBeDefined();
        }
    });
});

describe('source helpers', () => {
    it('getSource returns undefined for unknown ids', () => {
        expect(getSource('does-not-exist')).toBeUndefined();
    });

    it('getSources filters out unknown ids', () => {
        const result = getSources(['paruthi-2016', 'nope']);
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('paruthi-2016');
    });

    it('getTier returns the tier definition', () => {
        expect(getTier(1).id).toBe(1);
        expect(getTier(2).id).toBe(2);
    });
});
