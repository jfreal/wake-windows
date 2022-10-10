class Schedule {
    dwt: number;
    wws: number[];
    bed: number;

    constructor() {
        this.dwt = 7;
        this.wws = [1, 1.5, 1.5, 2]
        this.bed = 7;
    }

    public get totalNightSleep() {
        return 12 - (this.dwt - this.bed);
    }

    public get totalWakeTime() {
        return this.wws.reduce((accumulator, current) => {
            return accumulator + current;
        }, 0);
    }

    public get totalDaySleep() {
        return 24 - this.totalNightSleep - this.totalWakeTime;
    }
}

export { Schedule }
