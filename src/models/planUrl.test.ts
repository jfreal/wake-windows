import { describe, it, expect } from 'vitest';
import { scheduleShorthand, applyPlanParams, buildPlanQuery, hasSiblingParams } from './planUrl';
import { ScheduleSetting } from './ScheduleSetting';

function paramsOf(query: string): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(query).entries());
}

describe('scheduleShorthand', () => {
    it('formats as dwt-ww/ww/...-bed', () => {
        const s = new ScheduleSetting();
        s.dwt = 7;
        s.bed = 8;
        s.wws = [2, 2.5, 3];
        expect(scheduleShorthand(s)).toBe('7-2/2.5/3-8');
    });
});

describe('applyPlanParams', () => {
    it('applies birthday and shorthand', () => {
        const s = new ScheduleSetting();
        applyPlanParams(s, '2026-03-01', '6.5-1.5/2/2.5-7.5');
        expect(s.birthdayDate).toBe('2026-03-01');
        expect(s.dwt).toBe(6.5);
        expect(s.bed).toBe(7.5);
        expect(s.wws).toEqual([1.5, 2, 2.5]);
    });

    it('ignores a malformed shorthand and keeps defaults', () => {
        const s = new ScheduleSetting();
        applyPlanParams(s, undefined, '7');
        expect(s.dwt).toBe(7);
        expect(s.wws).toEqual([2, 2, 2, 2]);
    });

    it('rejects a nonnumeric shorthand atomically (no NaN corruption)', () => {
        const s = new ScheduleSetting();
        applyPlanParams(s, undefined, 'abc-x/y-z');
        expect(s.dwt).toBe(7);
        expect(s.bed).toBe(7);
        expect(s.wws).toEqual([2, 2, 2, 2]);
    });

    it('rejects a partially numeric shorthand without a half-applied schedule', () => {
        const s = new ScheduleSetting();
        applyPlanParams(s, undefined, '8-2/oops/2-6');
        expect(s.dwt).toBe(7); // dwt untouched even though it parsed fine
        expect(s.bed).toBe(7);
        expect(s.wws).toEqual([2, 2, 2, 2]);
    });

    it('accepts empty dwt/bed as 0 (the 12:00 select option)', () => {
        const s = new ScheduleSetting();
        applyPlanParams(s, undefined, '-2/2-');
        expect(s.dwt).toBe(0);
        expect(s.bed).toBe(0);
        expect(s.wws).toEqual([2, 2]);
    });

    it('applies nothing when both params are absent', () => {
        const s = new ScheduleSetting();
        const before = s.birthdayDate;
        applyPlanParams(s);
        expect(s.birthdayDate).toBe(before);
        expect(s.wws).toEqual([2, 2, 2, 2]);
    });
});

describe('buildPlanQuery', () => {
    it('keeps the original single-child shape when no sibling', () => {
        const s = new ScheduleSetting();
        s.birthdayDate = '2026-03-01';
        s.dwt = 7;
        s.bed = 7;
        s.wws = [2, 2, 2, 2];
        expect(buildPlanQuery(s)).toBe('?bd=2026-03-01&s=7-2/2/2/2-7');
        expect(buildPlanQuery(s, null)).toBe('?bd=2026-03-01&s=7-2/2/2/2-7');
    });

    it('appends bd2/s2 for a sibling', () => {
        const a = new ScheduleSetting();
        a.birthdayDate = '2026-03-01';
        a.wws = [2, 2, 2, 2];
        const b = new ScheduleSetting();
        b.birthdayDate = '2025-01-15';
        b.dwt = 6.5;
        b.bed = 7.5;
        b.wws = [3, 3.5, 4];
        expect(buildPlanQuery(a, b)).toBe(
            '?bd=2026-03-01&s=7-2/2/2/2-7&bd2=2025-01-15&s2=6.5-3/3.5/4-7.5');
    });

    it('round-trips two asymmetric schedules through the query string', () => {
        const a = new ScheduleSetting();
        a.birthdayDate = '2026-03-01';
        a.dwt = 7;
        a.bed = 7;
        a.wws = [2, 2, 2, 2, 2];
        const b = new ScheduleSetting();
        b.birthdayDate = '2024-11-20';
        b.dwt = 6.5;
        b.bed = 8;
        b.wws = [3, 3.5];

        const params = paramsOf(buildPlanQuery(a, b));
        const a2 = new ScheduleSetting();
        const b2 = new ScheduleSetting();
        applyPlanParams(a2, params.bd, params.s);
        applyPlanParams(b2, params.bd2, params.s2);

        expect(a2.birthdayDate).toBe(a.birthdayDate);
        expect(a2.dwt).toBe(a.dwt);
        expect(a2.bed).toBe(a.bed);
        expect(a2.wws).toEqual(a.wws);
        expect(b2.birthdayDate).toBe(b.birthdayDate);
        expect(b2.dwt).toBe(b.dwt);
        expect(b2.bed).toBe(b.bed);
        expect(b2.wws).toEqual(b.wws);
    });

    it('round-trips an old single-child link unchanged (back-compat)', () => {
        const params = paramsOf('?bd=2026-03-01&s=7-2/2/2/2-7');
        expect(hasSiblingParams(params)).toBe(false);
        const s = new ScheduleSetting();
        applyPlanParams(s, params.bd, params.s);
        expect(buildPlanQuery(s)).toBe('?bd=2026-03-01&s=7-2/2/2/2-7');
    });
});

describe('hasSiblingParams', () => {
    it('detects bd2 or s2', () => {
        expect(hasSiblingParams({ bd2: '2026-03-01' })).toBe(true);
        expect(hasSiblingParams({ s2: '7-2/2-7' })).toBe(true);
        expect(hasSiblingParams({})).toBe(false);
    });
});
