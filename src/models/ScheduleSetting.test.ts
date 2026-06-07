import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ScheduleSetting } from './ScheduleSetting';

describe('ScheduleSetting', () => {
    describe('constructor defaults', () => {
        it('should initialize with default values', () => {
            const ss = new ScheduleSetting();
            expect(ss.dwt).toBe(7);
            expect(ss.bed).toBe(7);
            expect(ss.weeks).toBe(40);
            expect(ss.wws).toEqual([2, 2, 2, 2]);
            expect(ss.birthdayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should default birthday to four months ago', () => {
            vi.useFakeTimers();
            try {
                vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
                const ss = new ScheduleSetting();
                expect(ss.birthdayDate).toBe("2024-02-15"); // Feb 15, 2024
            } finally {
                vi.useRealTimers();
            }
        });
    });

    describe('birthdayDate setter', () => {
        it('should parse date string and set birthday', () => {
            const ss = new ScheduleSetting();
            ss.birthdayDate = "2024-06-15";
            expect(ss.birthdayDate).toBe("2024-06-15");
            expect(ss.birthday.getFullYear()).toBe(2024);
            expect(ss.birthday.getMonth()).toBe(5); // June = 5 (zero-indexed)
            expect(ss.birthday.getDate()).toBe(15);
        });
    });

    describe('totalNightSleep', () => {
        it('should calculate 12h for equal dwt and bed', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            expect(ss.totalNightSleep).toBe(12);
        });

        it('should give more night sleep for a later wake time (dwt > bed)', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 8; // wake 8 AM
            ss.bed = 7; // bed 7 PM -> awake 11h, night 13h
            // 12 + (8 - 7) = 13
            expect(ss.totalNightSleep).toBe(13);
        });

        it('should give less night sleep for an earlier wake time (dwt < bed)', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 6; // wake 6 AM
            ss.bed = 7; // bed 7 PM -> awake 13h, night 11h
            // 12 + (6 - 7) = 11
            expect(ss.totalNightSleep).toBe(11);
        });
    });

    describe('totalWakeTime', () => {
        it('should sum all wake windows', () => {
            const ss = new ScheduleSetting();
            ss.wws = [2, 2.5, 2, 2.5, 3];
            expect(ss.totalWakeTime).toBe(12);
        });

        it('should return 0 for empty wake windows', () => {
            const ss = new ScheduleSetting();
            ss.wws = [];
            expect(ss.totalWakeTime).toBe(0);
        });
    });

    describe('naps', () => {
        it('should be wake windows count minus 1', () => {
            const ss = new ScheduleSetting();
            ss.wws = [2, 2, 2, 2];
            expect(ss.naps).toBe(3);
        });

        it('should be 0 for single wake window', () => {
            const ss = new ScheduleSetting();
            ss.wws = [5];
            expect(ss.naps).toBe(0);
        });

        it('should clamp to 0 for empty wake windows (no negative naps)', () => {
            const ss = new ScheduleSetting();
            ss.wws = [];
            expect(ss.naps).toBe(0);
        });
    });

    describe('totalNap', () => {
        it('should be 24 minus night sleep minus wake time', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2, 2]; // 10h wake
            // 24 - 12 (night) - 10 (wake) = 2
            expect(ss.totalNap).toBe(2);
        });

        it('should go negative if schedule exceeds 24h', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [5, 5, 5]; // 15h wake
            // 24 - 12 - 15 = -3
            expect(ss.totalNap).toBe(-3);
        });
    });

    describe('totalSleep', () => {
        it('should be totalNap + totalNightSleep', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2, 2]; // 10h wake
            // totalNap=2, totalNightSleep=12 -> 14
            expect(ss.totalSleep).toBe(14);
        });

        it('should equal 24 minus totalWakeTime', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2]; // 6h wake
            expect(ss.totalSleep).toBe(24 - 6);
        });
    });

    describe('weeksSinceBirth', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should calculate weeks since birth for full-term baby', () => {
            vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
            const ss = new ScheduleSetting();
            ss.weeks = 40;
            ss.birthdayDate = "2024-05-15"; // May 15, 2024 — ~4.4 weeks ago
            expect(ss.weeksSinceBirth).toBe(4);
        });

        it('should adjust for premature babies', () => {
            vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
            const ss = new ScheduleSetting();
            ss.weeks = 36; // 4 weeks early
            ss.birthdayDate = "2024-03-15"; // March 15, 2024 — ~13 weeks ago
            // chronological ~13 weeks, minus 4 week adjustment = ~9
            expect(ss.weeksSinceBirth).toBe(9);
        });

        it('should return 0 for very premature baby born recently', () => {
            vi.setSystemTime(new Date(2024, 5, 15));
            const ss = new ScheduleSetting();
            ss.weeks = 30; // 10 weeks early
            ss.birthdayDate = "2024-05-15"; // born today
            // chronological 0 weeks, minus 10 weeks = -10 -> clamped to 0
            expect(ss.weeksSinceBirth).toBe(0);
        });

        it('should return 0 (not NaN) for an empty birthday', () => {
            const ss = new ScheduleSetting();
            ss.birthdayDate = ""; // user cleared the date field
            expect(ss.weeksSinceBirth).toBe(0);
        });
    });

    describe('monthsSinceBirth', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should calculate months for full-term baby', () => {
            vi.setSystemTime(new Date(2024, 8, 15)); // Sep 15, 2024
            const ss = new ScheduleSetting();
            ss.weeks = 40;
            ss.birthdayDate = "2024-03-15"; // March 15 -> 6 months ago
            expect(ss.monthsSinceBirth).toBe(6);
        });

        it('should adjust for premature babies', () => {
            vi.setSystemTime(new Date(2024, 8, 15)); // Sep 15, 2024
            const ss = new ScheduleSetting();
            ss.weeks = 36; // 4 weeks early -> ~1 month adjustment
            ss.birthdayDate = "2024-03-15"; // March 15 -> 6 months chronological
            // 6 - 1 = 5
            expect(ss.monthsSinceBirth).toBe(5);
        });

        it('should return 0 for future birthday', () => {
            vi.setSystemTime(new Date(2024, 0, 15));
            const ss = new ScheduleSetting();
            ss.weeks = 40;
            ss.birthdayDate = "2024-06-15"; // future
            expect(ss.monthsSinceBirth).toBe(0);
        });

        it('should return 0 (not NaN) for an empty birthday', () => {
            const ss = new ScheduleSetting();
            ss.birthdayDate = ""; // user cleared the date field
            expect(ss.monthsSinceBirth).toBe(0);
        });
    });

    describe('napTimes', () => {
        it('computes evenly-split nap clock times between wake windows', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2, 2]; // 4 naps, totalNap=2h -> 30min each
            const naps = ss.napTimes;
            expect(naps.length).toBe(4);
            expect(naps[0]).toEqual({ start: 540, end: 570 });   // 9:00-9:30 AM
            expect(naps[3]).toEqual({ start: 990, end: 1020 });  // 4:30-5:00 PM
        });

        it('lands wake time and bedtime correctly', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2, 2];
            expect(ss.wakeMinutes).toBe(420);     // 7:00 AM
            expect(ss.bedtimeMinutes).toBe(1140); // 7:00 PM
        });

        it('keeps bedtime equal to the selected bedtime even when wake time differs', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 6;
            ss.bed = 8;                                    // wake 6 AM, bed 8 PM
            expect(ss.bedtimeMinutes).toBe((8 + 12) * 60); // 8:00 PM, not derived from wake
            ss.dwt = 9;
            ss.bed = 6;                                    // wake 9 AM, bed 6 PM
            expect(ss.bedtimeMinutes).toBe((6 + 12) * 60); // 6:00 PM
        });

        it('spaces non-uniform naps and ends the day at the selected bedtime', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [1.5, 2, 2.5, 3]; // 9h awake, 3 naps of 1h each
            const naps = ss.napTimes;
            expect(naps.length).toBe(3);
            expect(naps[0]).toEqual({ start: 510, end: 570 });  // after the 1.5h window
            expect(naps[1]).toEqual({ start: 690, end: 750 });  // interior nap
            expect(naps[2]).toEqual({ start: 900, end: 960 });
            // wake + every window + every nap lands exactly at the 7 PM bedtime
            expect(ss.wakeMinutes + ss.totalWakeTime * 60 + ss.totalNap * 60).toBe(1140);
            expect(ss.bedtimeMinutes).toBe(1140);
        });

        it('returns no naps when nap time is non-positive', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [5, 5, 5]; // 15h wake -> negative nap time
            expect(ss.napTimes).toEqual([]);
        });

        it('returns no naps for a single wake window', () => {
            const ss = new ScheduleSetting();
            ss.wws = [5];
            expect(ss.napTimes).toEqual([]);
        });
    });
});
