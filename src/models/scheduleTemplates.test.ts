import { describe, it, expect } from 'vitest';
import {
    SCHEDULE_TEMPLATES,
    templatesForMonths,
    matchesTemplate,
    applyTemplate,
} from './scheduleTemplates';

// @doc:wake-window-schedule-generator
describe('schedule templates', () => {
    it('defines the community-named templates with sane windows', () => {
        const ids = SCHEDULE_TEMPLATES.map((t) => t.id);
        expect(ids).toContain('2-3-4');
        expect(ids).toContain('3-3-4');
        for (const t of SCHEDULE_TEMPLATES) {
            expect(t.wws.length).toBeGreaterThanOrEqual(2);
            for (const w of t.wws) {
                expect(w).toBeGreaterThan(0);
                expect(w).toBeLessThanOrEqual(6);
            }
            // Windows never shrink across the day in any published template shape.
            for (let i = 1; i < t.wws.length; i++) {
                expect(t.wws[i]).toBeGreaterThanOrEqual(t.wws[i - 1]);
            }
            expect(t.description.length).toBeGreaterThan(20);
            expect(t.ageMonths[0]).toBeLessThan(t.ageMonths[1]);
        }
    });

    it('2-3-4 is the canonical two-nap shape', () => {
        const t = SCHEDULE_TEMPLATES.find((x) => x.id === '2-3-4')!;
        expect(t.wws).toEqual([2, 3, 4]);
        // 3 windows → 2 naps in ScheduleSetting terms.
        expect(t.wws.length - 1).toBe(2);
    });

    it('offers no templates under 3 months (newborn days resist templating)', () => {
        expect(templatesForMonths(0)).toEqual([]);
        expect(templatesForMonths(2)).toEqual([]);
    });

    it('offers age-appropriate templates only', () => {
        const at4 = templatesForMonths(4).map((t) => t.id);
        expect(at4).toContain('four-naps');
        expect(at4).not.toContain('2-3-4');

        const at7 = templatesForMonths(7).map((t) => t.id);
        expect(at7).toContain('2-3-4');
        expect(at7).not.toContain('four-naps');

        const at12 = templatesForMonths(12).map((t) => t.id);
        expect(at12).toContain('2-3-4');
        expect(at12).toContain('3-3-4');
    });

    it('every month 3..24 that offers templates offers each at most once', () => {
        for (let m = 3; m <= 24; m++) {
            const ids = templatesForMonths(m).map((t) => t.id);
            expect(new Set(ids).size).toBe(ids.length);
        }
    });

    it('matchesTemplate compares length and values', () => {
        const t = SCHEDULE_TEMPLATES.find((x) => x.id === '2-3-4')!;
        expect(matchesTemplate([2, 3, 4], t)).toBe(true);
        expect(matchesTemplate([2, 3], t)).toBe(false);
        expect(matchesTemplate([2, 3, 4.25], t)).toBe(false);
        expect(matchesTemplate([2, 3, 4, 4], t)).toBe(false);
    });

    it('applyTemplate replaces the array contents in place (reactive-safe)', () => {
        const wws = [1, 1, 1, 1, 1];
        const t = SCHEDULE_TEMPLATES.find((x) => x.id === '2-3-4')!;
        const returned = applyTemplate(wws, t);
        expect(wws).toEqual([2, 3, 4]);
        expect(returned).toBe(t);
        // A second apply is a no-op in effect, not an error.
        applyTemplate(wws, t);
        expect(wws).toEqual([2, 3, 4]);
    });
});
