import { roundToStep } from './time';

// @doc:wake-window-schedule-generator @doc:bedtime-calculator @doc:corrected-gestational-age
// Holds the inputs (birthday, wake time, wake-window lengths, bedtime, gestational weeks)
// that drive the generated schedule.
class ScheduleSetting {
    _birthdayDate: string = "";

    dwt: number = 7;
    wws: number[];
    bed: number;
    birthday: Date;
    weeks: number;

    // @doc:atypical-day-flag
    // One-tap "today is atypical" disruption state (illness, teething, travel, …).
    // Shifts guidance cues-first and widens displayed windows; carried in the
    // shared URL so a sent link reflects the day.
    atypical: boolean = false;
    atypicalReason: string = "";

    constructor() {
        this.wws = [2, 2, 2, 2]
        this.bed = 7;
        this.weeks = 40;

        const fourMonthsAgo = new Date();
        fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
        this.birthday = fourMonthsAgo;
        const y = fourMonthsAgo.getFullYear();
        const m = String(fourMonthsAgo.getMonth() + 1).padStart(2, '0');
        const d = String(fourMonthsAgo.getDate()).padStart(2, '0');
        this._birthdayDate = `${y}-${m}-${d}`;
    }

    get birthdayDate(): string {
        return this._birthdayDate;
    }

    set birthdayDate(value: string) {
        this._birthdayDate = value;

        let [year, month, day] = value.split("-");
        let date = new Date(+year, +month - 1, +day);

        this.birthday = date;
    }

    /** Adjusted age in weeks, accounting for gestational age (premature babies get a younger adjusted age). */
    public get weeksSinceBirth(): number {
        const birthMs = this.birthday.getTime();
        if (Number.isNaN(birthMs)) return 0; // no/invalid birthday entered yet
        const msInWeek = 1000 * 60 * 60 * 24 * 7;
        const chronologicalWeeks = (Date.now() - birthMs) / msInWeek;
        const gestationalAdjustment = 40 - this.weeks;
        return Math.max(0, Math.round(chronologicalWeeks - gestationalAdjustment));
    }

    /** Adjusted age in months, accounting for gestational age. */
    public get monthsSinceBirth(): number {
        if (Number.isNaN(this.birthday.getTime())) return 0; // no/invalid birthday entered yet
        const now = new Date();
        const chronologicalMonths =
            (now.getFullYear() - this.birthday.getFullYear()) * 12
            + now.getMonth() - this.birthday.getMonth();
        const gestationalAdjustmentMonths = Math.round((40 - this.weeks) / 4.345);
        const adjusted = chronologicalMonths - gestationalAdjustmentMonths;
        return adjusted <= 0 ? 0 : adjusted;
    }

    /**
     * Night sleep in hours. Wake is `dwt` (AM) and bedtime is `bed` (PM, i.e. bed+12
     * in 24h), so the awake span is (bed+12) - dwt and night = 24 - awake = 12 + dwt - bed.
     */
    public get totalNightSleep() {
        return 12 + (this.dwt - this.bed);
    }

    public get totalWakeTime() {
        return this.wws.reduce((accumulator, current) => {
            return accumulator + current;
        }, 0);
    }

    public get naps() {
        return Math.max(0, this.wws.length - 1);
    }

    public get totalNap() {
        return 24 - this.totalNightSleep - this.totalWakeTime;
    }

    public get totalSleep() {
        return this.totalNap + this.totalNightSleep;
    }

    /** Morning wake time, in minutes from midnight. */
    public get wakeMinutes() {
        return this.dwt * 60;
    }

    /** Bedtime (the selected `bed` evening hour), in minutes from midnight. The nap
     * walk below ends here too, since wake + wake-windows + naps == 24 - night. */
    public get bedtimeMinutes() {
        return (this.bed + 12) * 60;
    }

    /**
     * Clock times for each nap (minutes from midnight), walking the day from the
     * morning wake time through each wake window, splitting total nap time evenly.
     * A nap follows every wake window except the last. Empty if the schedule has
     * no naps or non-positive nap time.
     */
    public get napTimes(): { start: number; end: number }[] {
        const napCount = this.naps;
        if (napCount <= 0 || this.totalNap <= 0) return [];

        const napDuration = (this.totalNap / napCount) * 60;
        const times: { start: number; end: number }[] = [];
        let t = this.wakeMinutes;
        for (let i = 0; i < this.wws.length; i++) {
            t += this.wws[i] * 60;
            if (i < this.wws.length - 1) {
                times.push({ start: t, end: t + napDuration });
                t += napDuration;
            }
        }
        return times;
    }

    // @doc:anti-anxiety-mechanics
    /** Half-width of the displayed nap-start window. Wake-window timing is a
     * Tier-2 heuristic, so a single to-the-minute target carries false
     * precision; ±15 min keeps the range honest but still actionable. */
    static readonly NAP_WINDOW_SLOP_MINUTES = 15;

    /**
     * Nap starts as ranges rather than single target times: ±15 minutes around
     * each computed start, rounded to 5-minute marks so endpoints read like
     * clock times ("9:15–9:45"), plus the nap length. Derived from napTimes,
     * so ranges track the computed schedule.
     */
    public get napWindows(): { earliest: number; latest: number; lengthMinutes: number }[] {
        return this.napWindowsAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES);
    }

    // @doc:cues-vs-clock-mode @doc:atypical-day-flag
    /** Nap windows at a caller-chosen half-width, so cues-led guidance and
     * atypical days can widen the displayed ranges past the ±15 baseline. */
    public napWindowsAt(slopMinutes: number): { earliest: number; latest: number; lengthMinutes: number }[] {
        return this.napTimes.map((nap) => ({
            earliest: roundToStep(nap.start - slopMinutes),
            latest: roundToStep(nap.start + slopMinutes),
            lengthMinutes: Math.round(nap.end - nap.start),
        }));
    }

    // @doc:read-only-babysitter-mode
    /** Bedtime as a range with the same ±slop as naps, so the sitter view never
     * shows a to-the-minute target. */
    public get bedtimeWindow(): { earliest: number; latest: number } {
        return this.bedtimeWindowAt(ScheduleSetting.NAP_WINDOW_SLOP_MINUTES);
    }

    // @doc:cues-vs-clock-mode @doc:atypical-day-flag
    /** Bedtime window at a caller-chosen half-width (see napWindowsAt). */
    public bedtimeWindowAt(slopMinutes: number): { earliest: number; latest: number } {
        return {
            earliest: roundToStep(this.bedtimeMinutes - slopMinutes),
            latest: roundToStep(this.bedtimeMinutes + slopMinutes),
        };
    }

    // @doc:read-only-babysitter-mode
    /** The first nap window not yet past at `nowMinutes` (minutes from midnight).
     * A window still counts as "next" until its latest start has passed — a nap
     * mid-window is the one to put the baby down for. Null once all naps are done. */
    public nextNapWindow(nowMinutes: number): { earliest: number; latest: number; lengthMinutes: number } | null {
        return this.napWindows.find((w) => nowMinutes <= w.latest) ?? null;
    }
}

export { ScheduleSetting }
