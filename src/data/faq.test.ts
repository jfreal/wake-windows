import { describe, it, expect } from 'vitest';
import { faqEntries } from './faq';
import { getSource, getSources } from '../models/Citations';

// @doc:evidence-tier-badges-citations
// The FAQ is cited content: every entry must resolve to real sources so the
// panel never renders an empty citation, and the tone rules are enforced the
// same way the e2e anti-anxiety spec enforces them on the page.
describe('FAQ data integrity', () => {
    it('has a meaningful catalog', () => {
        expect(faqEntries.length).toBeGreaterThanOrEqual(15);
    });

    it('every entry has a unique id', () => {
        const ids = faqEntries.map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every entry is a real question with a substantive answer', () => {
        for (const e of faqEntries) {
            expect(e.question.trim().endsWith('?'), `question "${e.id}" should end with ?`).toBe(true);
            expect(e.answer.length, `answer "${e.id}" too short`).toBeGreaterThan(80);
        }
    });

    it('every entry has a known tier and resolvable sources', () => {
        for (const e of faqEntries) {
            expect([1, 2, 3], `bad tier on "${e.id}"`).toContain(e.tier);
            expect(e.sourceIds.length, `no sources on "${e.id}"`).toBeGreaterThan(0);
            for (const id of e.sourceIds) {
                expect(getSource(id), `missing source "${id}" on faq "${e.id}"`).toBeDefined();
            }
            expect(getSources(e.sourceIds).length).toBe(e.sourceIds.length);
        }
    });

    it('answers never scold (anti-anxiety tone rules)', () => {
        for (const e of faqEntries) {
            expect(e.answer).not.toMatch(/you missed|off track|behind schedule|\bfailure\b|\bfailing\b/i);
        }
    });

    it('covers the highest-frequency themes from the research sweep', () => {
        const ids = new Set(faqEntries.map((e) => e.id));
        // The top-ten FAQ themes (research/07) that had no prior app coverage.
        for (const required of [
            'ww-start',
            'contact-naps',
            'wake-sleeping-baby',
            'daycare',
            'crib-hour',
            'day-night-confusion',
            'charts-dont-fit',
        ]) {
            expect(ids.has(required), `missing FAQ "${required}"`).toBe(true);
        }
    });
});
