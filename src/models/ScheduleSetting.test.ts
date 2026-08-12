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

        // @doc:corrected-gestational-age
        // A cleared "Weeks in Womb" field arrives here as '' (Vue's looseToNumber
        // leaves a non-numeric string alone), and '' coerces to 0 in arithmetic —
        // so `40 - weeks` used to read as forty weeks premature and knock nine
        // months off the plan while the parent was mid-retype, silently swapping
        // the age band, the guidance mode, and the offered templates.
        it('treats an unusable gestational value as no correction, not 40 weeks early', () => {
            vi.setSystemTime(new Date(2024, 8, 15)); // Sep 15, 2024
            const ss = new ScheduleSetting();
            ss.birthdayDate = "2024-03-15"; // 6 months ago

            for (const blank of ['', ' ', 'abc', null, undefined, NaN]) {
                ss.weeks = blank as unknown as number;
                expect(ss.monthsSinceBirth, `weeks=${JSON.stringify(blank)}`).toBe(6);
                expect(ss.weeksSinceBirth, `weeks=${JSON.stringify(blank)}`).toBe(26);
            }

            // A real number still corrects, blank-guard or not.
            ss.weeks = 32;
            expect(ss.monthsSinceBirth).toBe(4);
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

    // @doc:anti-anxiety-mechanics
    describe('napWindows', () => {
        it('wraps each computed nap start in a ±15 min range with the nap length', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2, 2]; // nap starts 9:00, 11:30, 2:00, 4:30; 30 min each
            const windows = ss.napWindowsAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES);
            expect(windows.length).toBe(4);
            expect(windows[0]).toEqual({ earliest: 525, latest: 555, lengthMinutes: 30 }); // 8:45–9:15
            expect(windows[3]).toEqual({ earliest: 975, latest: 1005, lengthMinutes: 30 }); // 4:15–4:45
        });

        it('rounds range endpoints to 5-minute clock marks', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2.2, 2]; // nap start 552 (9:12) — not on a 5-minute mark
            const [win] = ss.napWindowsAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES);
            expect(win.earliest).toBe(535); // 552 - 15 = 537 -> 8:55
            expect(win.latest).toBe(565);   // 552 + 15 = 567 -> 9:25
        });

        it('stays tied to the computed schedule (empty when there are no naps)', () => {
            const ss = new ScheduleSetting();
            ss.wws = [5];
            expect(ss.napWindowsAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES)).toEqual([]);
        });
    });

    // @doc:read-only-babysitter-mode
    describe('bedtimeWindow', () => {
        it('wraps bedtime in the same ±15 min range as naps', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7; // 7:00 PM = 1140
            expect(ss.bedtimeWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES)).toEqual({ earliest: 1125, latest: 1155 }); // 6:45–7:15 PM
        });

        it('rounds range endpoints to 5-minute clock marks', () => {
            const ss = new ScheduleSetting();
            ss.bed = 6.55; // 6:33 PM = 1113 — off-mark, so rounding must kick in
            expect(ss.bedtimeWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES)).toEqual({ earliest: 1100, latest: 1130 });
        });
    });

    // @doc:read-only-babysitter-mode
    describe('nextNapWindow', () => {
        // Default day: dwt 7, bed 7, wws [2,2,2,2] -> nap windows
        // 8:45–9:15 (525–555), 12:05–12:35 (725–755), 3:25–3:55 (925–955)
        function defaultDay() {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2];
            return ss;
        }

        it('returns the first window before any naps have started', () => {
            const ss = defaultDay();
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,8 * 60)).toEqual({ earliest: 525, latest: 555, lengthMinutes: 80 });
        });

        it('keeps returning a window while now is inside it', () => {
            const ss = defaultDay();
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,540)?.earliest).toBe(525); // 9:00, mid-window
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,555)?.earliest).toBe(525); // exactly at latest still counts
        });

        it('moves to the following window once the latest start has passed', () => {
            const ss = defaultDay();
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,556)?.earliest).toBe(725);
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,800)?.earliest).toBe(925);
        });

        it('returns null once all naps are done for the day', () => {
            const ss = defaultDay();
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,956)).toBeNull();
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,23 * 60)).toBeNull();
        });

        it('returns null when the schedule has no naps', () => {
            const ss = new ScheduleSetting();
            ss.wws = [5];
            expect(ss.nextNapWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES,9 * 60)).toBeNull();
        });
    });

    // @doc:atypical-day-flag
    describe('atypical day state', () => {
        it('defaults to a normal day with no reason', () => {
            const ss = new ScheduleSetting();
            expect(ss.atypical).toBe(false);
            expect(ss.atypicalReason).toBe('');
        });
    });

    // @doc:cues-vs-clock-mode @doc:atypical-day-flag
    describe('napWindowsAt / bedtimeWindowAt', () => {
        it('widens nap ranges to the requested half-width', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2, 2, 2, 2, 2]; // first nap starts 9:00 (540)
            const [win] = ss.napWindowsAt(30);
            expect(win).toEqual({ earliest: 510, latest: 570, lengthMinutes: 30 }); // 8:30–9:30
        });

        it('widens the bedtime range too', () => {
            const ss = new ScheduleSetting();
            ss.bed = 7; // 7:00 PM = 1140
            expect(ss.bedtimeWindowAt(30)).toEqual({ earliest: 1110, latest: 1170 }); // 6:30–7:30 PM
        });

        it('rounds widened endpoints to 5-minute clock marks', () => {
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            ss.wws = [2.2, 2]; // nap start 552 (9:12)
            const [win] = ss.napWindowsAt(30);
            expect(win.earliest).toBe(520); // 552 - 30 = 522 -> 8:40
            expect(win.latest).toBe(580);   // 552 + 30 = 582 -> 9:40
        });
    });
});
