class ScheduleSetting {
    _birthdayDate: string = "";

    dwt: number = 7;
    wws: number[];
    bed: number;
    birthday: Date;
    weeks: number;

    constructor() {
        this.wws = [0, 0, 0, 0, 0]
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
        const msInWeek = 1000 * 60 * 60 * 24 * 7;
        const chronologicalWeeks = (new Date().getTime() - this.birthday.getTime()) / msInWeek;
        const gestationalAdjustment = 40 - this.weeks;
        return Math.max(0, Math.round(chronologicalWeeks - gestationalAdjustment));
    }

    /** Adjusted age in months, accounting for gestational age. */
    public get monthsSinceBirth(): number {
        const chronologicalMonths =
            (new Date().getFullYear() - this.birthday.getFullYear()) * 12
            + new Date().getMonth() - this.birthday.getMonth();
        const gestationalAdjustmentMonths = Math.round((40 - this.weeks) / 4.345);
        const adjusted = chronologicalMonths - gestationalAdjustmentMonths;
        return adjusted <= 0 ? 0 : adjusted;
    }

    public get totalNightSleep() {
        return 12 - (this.dwt - this.bed);
    }

    public get totalWakeTime() {
        return this.wws.reduce((accumulator, current) => {
            return accumulator + current;
        }, 0);
    }

    public get naps() {
        return this.wws.length - 1;
    }

    public get totalNap() {
        return 24 - this.totalNightSleep - this.totalWakeTime;
    }

    public get totalSleep() {
        return this.totalNap + this.totalNightSleep;
    }
}

export { ScheduleSetting }
