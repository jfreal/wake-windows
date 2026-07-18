import { ScheduleSetting } from './ScheduleSetting';
import { roundToStep } from './time';

// @doc:dst-timezone-shift
// Gradual daylight-saving transition plan: walk the whole day (wake, naps,
// bedtime) ~15 min/day over the 4 days before the clock change, so the
// schedule lands on the usual clock times the day the clocks move. The
// ~15 min/day ramp is a sleep-consultant convention (Tier 3), not a
// trial-validated protocol.

export type DstMode = 'spring-forward' | 'fall-back';

/** A labeled target window (minutes from midnight), never an exact clock target. */
export interface ShiftRange {
    start: number;
    end: number;
}

export interface ShiftNap {
    /** Exact shifted nap span, for drawing the day strip. */
    start: number;
    end: number;
    /** The labeled "put down between" window shown to the caregiver. */
    startRange: ShiftRange;
}

export interface ShiftDay {
    label: string;
    /** Minutes every schedule time moves this day (negative = earlier). */
    offsetMinutes: number;
    /** True for the final "clocks have changed" day — usual times, new clock. */
    afterChange: boolean;
    /** Exact shifted anchors for the day strip. */
    wakeMinutes: number;
    bedtimeMinutes: number;
    wake: ShiftRange;
    bedtime: ShiftRange;
    naps: ShiftNap[];
    /** Fall-back ramp days intentionally run past the preferred bedtime (A05
     * cap); flagged so the UI can say so transparently instead of hiding it. */
    exceedsPreferredBedtime: boolean;
}

export interface ShiftPlan {
    mode: DstMode;
    stepMinutes: number;
    days: ShiftDay[];
}

/** Days of gradual shifting before the clock change. */
export const SHIFT_DAYS = 4;
/** Size of each daily step, minutes. */
export const SHIFT_STEP_MINUTES = 15;

/** Every displayed target is a window at the app's standard ±15-min slop
 * (ranges, not a stopwatch) with 5-minute-rounded endpoints. */
function rangeAround(minutes: number): ShiftRange {
    const slop = ScheduleSetting.NAP_WINDOW_SLOP_MINUTES;
    return {
        start: roundToStep(minutes - slop),
        end: roundToStep(minutes + slop),
    };
}

function dayLabel(daysBefore: number): string {
    return daysBefore === 1 ? '1 day before' : `${daysBefore} days before`;
}

/**
 * Build the day-by-day transition plan for a DST change.
 *
 * Spring-forward (clocks jump ahead; bedtime suddenly feels an hour too
 * early): shift every day 15 min *earlier* per day. Fall-back (clocks go
 * back; baby runs an hour ahead of the new clock, early waking): shift 15 min
 * *later* per day. Either way the final day is the usual schedule read off
 * the new clock — the plan converges back to the preferred bedtime rather
 * than drifting past it.
 */
/** Query-string spelling of each mode (`shift=spring|fall`). */
const PARAM_BY_MODE: Record<DstMode, string> = {
    'spring-forward': 'spring',
    'fall-back': 'fall',
};

export function dstModeToParam(mode: DstMode | null): string {
    return mode ? PARAM_BY_MODE[mode] : '';
}

/** Inverse of dstModeToParam; unknown or absent values mean "tool closed". */
export function dstModeFromParam(value: string | undefined): DstMode | null {
    const hit = (Object.keys(PARAM_BY_MODE) as DstMode[])
        .find((mode) => PARAM_BY_MODE[mode] === value);
    return hit ?? null;
}

export function buildDstShiftPlan(schedule: ScheduleSetting, mode: DstMode): ShiftPlan {
    const direction = mode === 'spring-forward' ? -1 : 1;
    const baseWake = schedule.wakeMinutes;
    const baseBed = schedule.bedtimeMinutes;
    const baseNaps = schedule.napTimes;

    const days: ShiftDay[] = [];
    for (let step = 1; step <= SHIFT_DAYS + 1; step++) {
        const afterChange = step > SHIFT_DAYS;
        const offsetMinutes = afterChange ? 0 : direction * SHIFT_STEP_MINUTES * step;
        const wakeMinutes = baseWake + offsetMinutes;
        const bedtimeMinutes = baseBed + offsetMinutes;
        days.push({
            label: afterChange ? 'Change day onward' : dayLabel(SHIFT_DAYS + 1 - step),
            offsetMinutes,
            afterChange,
            wakeMinutes,
            bedtimeMinutes,
            wake: rangeAround(wakeMinutes),
            bedtime: rangeAround(bedtimeMinutes),
            naps: baseNaps.map((nap) => ({
                start: nap.start + offsetMinutes,
                end: nap.end + offsetMinutes,
                startRange: rangeAround(nap.start + offsetMinutes),
            })),
            exceedsPreferredBedtime: bedtimeMinutes > baseBed,
        });
    }

    return { mode, stepMinutes: SHIFT_STEP_MINUTES, days };
}
