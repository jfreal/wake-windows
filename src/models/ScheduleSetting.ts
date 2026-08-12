import { roundToStep } from './time';

/**
 * Gestational weeks as a number the age math can use.
 *
 * An `<input type="number">` hands back '' when the parent clears the field —
 * Vue's looseToNumber leaves a non-numeric string alone — and '' coerces to 0 in
 * arithmetic, so `40 - weeks` used to read as forty weeks premature and knock
 * nine months off the plan mid-keystroke, silently swapping the age band, the
 * guidance mode, and the offered templates. No usable number means no
 * correction: 40. Out-of-range but numeric values are left alone — the schedule
 * warning already calls those out, and second-guessing a typed number would hide
 * it instead.
 *
 * A module function rather than a private getter on purpose: a `private` member
 * makes the class fail to match the type `reactive()` produces for it, and every
 * `ScheduleSetting` in the app comes out of a `reactive()` call.
 */
function usableGestationalWeeks(weeks: number): number {
    const w = Number(weeks);
    return Number.isFinite(w) && w > 0 ? w : 40;
}

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
        const gestationalAdjustment = 40 - usableGestationalWeeks(this.weeks);
        return Math.max(0, Math.round(chronologicalWeeks - gestationalAdjustment));
    }

    /** Adjusted age in months, accounting for gestational age. */
    public get monthsSinceBirth(): number {
        if (Number.isNaN(this.birthday.getTime())) return 0; // no/invalid birthday entered yet
        const now = new Date();
        const chronologicalMonths =
            (now.getFullYear() - this.birthday.getFullYear()) * 12
            + now.getMonth() - this.birthday.getMonth();
        const gestationalAdjustmentMonths = Math.round((40 - usableGestationalWeeks(this.weeks)) / 4.345);
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

    // @doc:cues-vs-clock-mode @doc:atypical-day-flag
    /** Nap starts as ranges rather than single target times: `slopMinutes`
     * around each computed start, rounded to 5-minute marks so endpoints read
     * like clock times ("9:15–9:45"), plus the nap length. Derived from
     * napTimes, so ranges track the computed schedule. Clock mode passes the
     * ±NAP_WINDOW_SLOP_MINUTES baseline; cues-led/atypical days widen it. */
    public napWindowsAt(slopMinutes: number): { earliest: number; latest: number; lengthMinutes: number }[] {
        return this.napTimes.map((nap) => ({
            earliest: roundToStep(nap.start - slopMinutes),
            latest: roundToStep(nap.start + slopMinutes),
            lengthMinutes: Math.round(nap.end - nap.start),
        }));
    }

    // @doc:cues-vs-clock-mode @doc:atypical-day-flag @doc:read-only-babysitter-mode
    /** Bedtime window at a caller-chosen half-width (see napWindowsAt), so the
     * sitter view and cues-led guidance never show a to-the-minute target. */
    public bedtimeWindowAt(slopMinutes: number): { earliest: number; latest: number } {
        return {
            earliest: roundToStep(this.bedtimeMinutes - slopMinutes),
            latest: roundToStep(this.bedtimeMinutes + slopMinutes),
        };
    }

    // @doc:read-only-babysitter-mode @doc:cues-vs-clock-mode
    /** The first nap window not yet past at `nowMinutes` (minutes from midnight),
     * at a caller-chosen half-width. A window still counts as "next" until its
     * latest start has passed — a nap mid-window is the one to put the baby down
     * for. Null once all naps are done. */
    public nextNapWindowAt(slopMinutes: number, nowMinutes: number): { earliest: number; latest: number; lengthMinutes: number } | null {
        return this.napWindowsAt(slopMinutes).find((w) => nowMinutes <= w.latest) ?? null;
    }
}

export { ScheduleSetting }
