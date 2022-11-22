class ScheduleSetting {
    private _birthdayDate?: string = "2022/1/1";

    dwt: number = 7;
    wws: number[];
    bed: number;
    birthday: Date;
    weeks: number;

    constructor() {
        this.wws = [0, 0, 0, 0, 0]
        this.bed = 7;
        this.birthday = new Date();
        this.weeks = 40;
    }

    get birthdayDate(): string {
        return this._birthdayDate ?? "";
    }

    set birthdayDate(value: string) {
        this._birthdayDate = value;

        console.log(value)

        let [year, month, day] = value.split("-");
        let date = new Date(+year, +month - 1, +day);

        this.birthday = date;
    }

    public get weeksSinceBirth(): number {
        const msInWeek = 1000 * 60 * 60 * 24 * 7;
        let ms = -Math.abs(this.birthday.getTime() - new Date().getTime()) / msInWeek;

        return Math.round((40 - this.weeks) - ms);
    }

    public get monthsSinceBirth(): number {
        var months;
        months = (new Date().getFullYear() - this.birthday.getFullYear()) * 12;
        months -= this.birthday.getMonth();
        months += new Date().getMonth();
        return months <= 0 ? 0 : months;
    }

    public get totalNightSleep() {
        return 12 - (this.dwt - this.bed);
    }

    public get totalWakeTime() {
        return this.wws.reduce((accumulator, current) => {
            return accumulator + current;
        }, 0);
    }

    public get totalNap() {
        return 24 - this.totalNightSleep - this.totalWakeTime;
    }

    public get totalSleep() {
        return this.totalNap + this.totalNightSleep;
    }
}

export { ScheduleSetting }