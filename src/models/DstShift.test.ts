import { describe, it, expect } from 'vitest';
import { ScheduleSetting } from './ScheduleSetting';
import {
    buildDstShiftPlan, dstModeFromParam, dstModeToParam, SHIFT_DAYS, SHIFT_STEP_MINUTES,
} from './DstShift';

function baseSchedule(): ScheduleSetting {
    const ss = new ScheduleSetting();
    ss.dwt = 7;                 // wake 7:00 AM (420)
    ss.bed = 7;                 // bed 7:00 PM (1140)
    ss.wws = [2, 2, 2, 2, 2];   // 4 naps of 30 min each
    return ss;
}

describe('buildDstShiftPlan', () => {
    it('produces 4 ramp days plus a change-day row', () => {
        const plan = buildDstShiftPlan(baseSchedule(), 'spring-forward');
        expect(plan.days.length).toBe(SHIFT_DAYS + 1);
        expect(plan.stepMinutes).toBe(SHIFT_STEP_MINUTES);
        expect(plan.days.map(d => d.label)).toEqual([
            '4 days before', '3 days before', '2 days before', '1 day before', 'Change day onward',
        ]);
        expect(plan.days.map(d => d.afterChange)).toEqual([false, false, false, false, true]);
    });

    it('spring-forward walks the day earlier in 15-minute steps', () => {
        const plan = buildDstShiftPlan(baseSchedule(), 'spring-forward');
        expect(plan.days.map(d => d.offsetMinutes)).toEqual([-15, -30, -45, -60, 0]);
        expect(plan.days[0].bedtimeMinutes).toBe(1140 - 15);
        expect(plan.days[3].bedtimeMinutes).toBe(1140 - 60);
        expect(plan.days[3].wakeMinutes).toBe(420 - 60);
    });

    it('fall-back walks the day later in 15-minute steps', () => {
        const plan = buildDstShiftPlan(baseSchedule(), 'fall-back');
        expect(plan.days.map(d => d.offsetMinutes)).toEqual([15, 30, 45, 60, 0]);
        expect(plan.days[3].bedtimeMinutes).toBe(1140 + 60);
        expect(plan.days[3].wakeMinutes).toBe(420 + 60);
    });

    it('converges back to the usual schedule on the change day (bedtime cap respected)', () => {
        for (const mode of ['spring-forward', 'fall-back'] as const) {
            const ss = baseSchedule();
            const finalDay = buildDstShiftPlan(ss, mode).days[SHIFT_DAYS];
            expect(finalDay.offsetMinutes).toBe(0);
            expect(finalDay.wakeMinutes).toBe(ss.wakeMinutes);
            expect(finalDay.bedtimeMinutes).toBe(ss.bedtimeMinutes);
            expect(finalDay.exceedsPreferredBedtime).toBe(false);
        }
    });

    it('flags fall-back ramp days as past the preferred bedtime, spring-forward never', () => {
        const fall = buildDstShiftPlan(baseSchedule(), 'fall-back');
        expect(fall.days.slice(0, SHIFT_DAYS).every(d => d.exceedsPreferredBedtime)).toBe(true);
        const spring = buildDstShiftPlan(baseSchedule(), 'spring-forward');
        expect(spring.days.every(d => !d.exceedsPreferredBedtime)).toBe(true);
    });

    it('shifts every nap by the day offset', () => {
        const ss = baseSchedule();
        const naps = ss.napTimes; // first nap 540–570
        const plan = buildDstShiftPlan(ss, 'spring-forward');
        const day2 = plan.days[1]; // offset -30
        expect(day2.naps.length).toBe(naps.length);
        expect(day2.naps[0].start).toBe(naps[0].start - 30);
        expect(day2.naps[0].end).toBe(naps[0].end - 30);
    });

    it('presents windows at the app-standard ±15-min slop with 5-minute-rounded endpoints', () => {
        const plan = buildDstShiftPlan(baseSchedule(), 'fall-back');
        const width = ScheduleSetting.NAP_WINDOW_SLOP_MINUTES * 2;
        for (const day of plan.days) {
            const ranges = [day.wake, day.bedtime, ...day.naps.map(n => n.startRange)];
            for (const r of ranges) {
                expect(r.start % 5).toBe(0);
                expect(r.end % 5).toBe(0);
                expect(r.end - r.start).toBe(width);
            }
        }
        // Day 1 (+15): bedtime 1155 -> 1140–1170 (7:00–7:30 PM)
        expect(plan.days[0].bedtime).toEqual({ start: 1140, end: 1170 });
    });

    it('round-trips the URL shift param and rejects junk', () => {
        expect(dstModeToParam('spring-forward')).toBe('spring');
        expect(dstModeToParam('fall-back')).toBe('fall');
        expect(dstModeToParam(null)).toBe('');
        expect(dstModeFromParam('spring')).toBe('spring-forward');
        expect(dstModeFromParam('fall')).toBe('fall-back');
        expect(dstModeFromParam(undefined)).toBe(null);
        expect(dstModeFromParam('sideways')).toBe(null);
    });

    it('handles a schedule with no naps (single wake window)', () => {
        const ss = new ScheduleSetting();
        ss.dwt = 7;
        ss.bed = 7;
        ss.wws = [12];
        const plan = buildDstShiftPlan(ss, 'fall-back');
        expect(plan.days.every(d => d.naps.length === 0)).toBe(true);
        expect(plan.days[0].wakeMinutes).toBe(420 + 15);
    });
});
