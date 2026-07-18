import { describe, it, expect } from 'vitest';
import { formatClock, formatClockRange, formatDuration, roundToStep } from './time';

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

describe('roundToStep', () => {
    it('rounds to the nearest 5-minute mark by default', () => {
        expect(roundToStep(9 * 60 + 23)).toBe(9 * 60 + 25);
        expect(roundToStep(9 * 60 + 22)).toBe(9 * 60 + 20);
        expect(roundToStep(9 * 60 + 25)).toBe(9 * 60 + 25);
    });

    it('accepts a custom step', () => {
        expect(roundToStep(9 * 60 + 23, 15)).toBe(9 * 60 + 30);
        expect(roundToStep(9 * 60 + 7, 15)).toBe(9 * 60);
    });
});

describe('formatClockRange', () => {
    it('collapses the period when both ends share it', () => {
        expect(formatClockRange(9 * 60 + 15, 9 * 60 + 45)).toBe("9:15–9:45 AM");
    });

    it('keeps both periods when the range crosses noon', () => {
        expect(formatClockRange(11 * 60 + 50, 12 * 60 + 20)).toBe("11:50 AM–12:20 PM");
    });
});

describe('formatDuration', () => {
    it('formats minutes-only durations', () => {
        expect(formatDuration(45)).toBe("45 min");
    });

    it('formats whole hours', () => {
        expect(formatDuration(120)).toBe("2 h");
    });

    it('formats mixed hours and minutes, rounding', () => {
        expect(formatDuration(80)).toBe("1 h 20 min");
        expect(formatDuration(80.4)).toBe("1 h 20 min");
    });
});
