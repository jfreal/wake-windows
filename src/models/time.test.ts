import { describe, it, expect } from 'vitest';
import { formatClock } from './time';

describe('formatClock', () => {
    it('formats morning times', () => {
        expect(formatClock(7 * 60)).toBe("7:00 AM");
        expect(formatClock(9 * 60 + 30)).toBe("9:30 AM");
    });

    it('formats noon and midnight', () => {
        expect(formatClock(0)).toBe("12:00 AM");
        expect(formatClock(12 * 60)).toBe("12:00 PM");
    });

    it('formats afternoon/evening times', () => {
        expect(formatClock(13 * 60)).toBe("1:00 PM");
        expect(formatClock(19 * 60)).toBe("7:00 PM");
    });

    it('pads minutes and rounds', () => {
        expect(formatClock(8 * 60 + 5)).toBe("8:05 AM");
        expect(formatClock(8 * 60 + 5.6)).toBe("8:06 AM");
    });

    it('wraps values past midnight', () => {
        expect(formatClock(25 * 60)).toBe("1:00 AM");
        expect(formatClock(-60)).toBe("11:00 PM");
    });
});
