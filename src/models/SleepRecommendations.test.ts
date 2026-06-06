import { describe, it, expect } from 'vitest';
import { SleepRecommendation, SleepRecommendationRepository } from './SleepRecommendations';
import { ScheduleSetting } from './ScheduleSetting';

describe('SleepRecommendationRepository', () => {
    it('should contain recommendations', () => {
        const repo = new SleepRecommendationRepository();
        expect(repo.recommendations.length).toBeGreaterThan(0);
    });

    it('should have named recommendations with brackets', () => {
        const repo = new SleepRecommendationRepository();
        for (const rec of repo.recommendations) {
            expect(rec.name).toBeTruthy();
            expect(rec.brackets.length).toBeGreaterThan(0);
        }
    });
});

describe('SleepRecommendation', () => {
    function makeRec() {
        return new SleepRecommendation({
            name: "Test Rec",
            brackets: [
                // 4-6 months: daySleep 2-4h, nightSleep 10-12h, 3-4 naps
                { months: [4, 6] as [number, number], daySleep: [2, 4] as [number, number], nightSleep: [10, 12] as [number, number], naps: [3, 4] as [number, number], wwTime: [90, 150] as [number, number], dwt: 7, bed: 7, get maxSleep() { return this.daySleep[1] + this.nightSleep[1]; }, get minSleep() { return this.daySleep[0] + this.nightSleep[0]; } },
            ]
        });
    }

    describe('currentBracket', () => {
        it('should return bracket matching the age', () => {
            const rec = makeRec();
            const bracket = rec.currentBracket(5);
            expect(bracket).toBeDefined();
            expect(bracket.months).toEqual([4, 6]);
        });

        it('should return undefined for age outside brackets', () => {
            const rec = makeRec();
            expect(rec.currentBracket(2)).toBeUndefined();
            expect(rec.currentBracket(8)).toBeUndefined();
        });

        it('should match at bracket boundaries', () => {
            const rec = makeRec();
            expect(rec.currentBracket(4)).toBeDefined();
            expect(rec.currentBracket(6)).toBeDefined();
        });
    });

    describe('validate', () => {
        it('should return error when no bracket matches', () => {
            const rec = makeRec();
            const ss = new ScheduleSetting();
            const errors = rec.validate(ss, 2); // 2 months, no bracket
            expect(errors.length).toBe(1);
            expect(errors[0].text).toContain("isn't enough information");
        });

        it('should warn when total sleep exceeds max', () => {
            const rec = makeRec();
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            // totalNightSleep = 12, need totalSleep > maxSleep (4+12=16)
            // totalSleep = totalNap + totalNightSleep = (24 - 12 - wakeTime) + 12 = 24 - wakeTime
            // need 24 - wakeTime > 16, so wakeTime < 8
            ss.wws = [1, 1, 1, 1]; // totalWake=4, totalSleep=20, maxSleep=16
            const errors = rec.validate(ss, 5);
            const maxError = errors.find(e => e.text.includes("no more than"));
            expect(maxError).toBeDefined();
        });

        it('should warn when total sleep is below min', () => {
            const rec = makeRec();
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            // minSleep = 2+10 = 12, totalSleep = 24 - wakeTime
            // need 24 - wakeTime < 12, so wakeTime > 12
            ss.wws = [3, 3, 3, 3, 3]; // totalWake=15, totalSleep=9
            const errors = rec.validate(ss, 5);
            const minError = errors.find(e => e.text.includes("minimum"));
            expect(minError).toBeDefined();
        });

        it('should warn when nap count is below minimum', () => {
            const rec = makeRec();
            const ss = new ScheduleSetting();
            ss.wws = [2, 2]; // 1 nap, bracket requires min 3
            ss.dwt = 7;
            ss.bed = 7;
            const errors = rec.validate(ss, 5);
            const napError = errors.find(e => e.text.includes("naps"));
            expect(napError).toBeDefined();
        });

        it('should return no errors for a good schedule', () => {
            const rec = makeRec();
            const ss = new ScheduleSetting();
            ss.dwt = 7;
            ss.bed = 7;
            // totalNightSleep=12, need 3+ naps, totalSleep between 12-16
            // wws = [2,2,2,2] -> 4 naps (wws.length-1=3), totalWake=8, totalSleep=16 (= maxSleep, not >)
            ss.wws = [2, 2, 2, 2];
            const errors = rec.validate(ss, 5);
            expect(errors.length).toBe(0);
        });
    });

    describe('startBracket', () => {
        it('should return the earliest bracket', () => {
            const repo = new SleepRecommendationRepository();
            for (const rec of repo.recommendations) {
                const start = rec.startBracket;
                for (const b of rec.brackets) {
                    expect(start.months[0]).toBeLessThanOrEqual(b.months[0]);
                }
            }
        });
    });
});

describe('General Guidance source', () => {
    function generalRec() {
        const repo = new SleepRecommendationRepository();
        return repo.recommendations.find(r => r.name.startsWith("General Guidance"))!;
    }

    it('exists and spans newborn through 24 months', () => {
        const rec = generalRec();
        expect(rec).toBeDefined();
        expect(rec.currentBracket(1)).toBeDefined();   // newborn
        expect(rec.currentBracket(12)).toBeDefined();  // toddler
        expect(rec.currentBracket(24)).toBeDefined();
    });

    it('covers every month 0..24 with exactly one bracket (contiguous, no gaps/overlaps)', () => {
        const rec = generalRec();
        for (let m = 0; m <= 24; m++) {
            const matches = rec.brackets.filter(b => b.months[0] <= m && b.months[1] >= m);
            expect(matches.length).toBe(1);
        }
    });
});

describe('DevelopmentBracket', () => {
    it('should calculate maxSleep as sum of max day and night sleep', () => {
        const repo = new SleepRecommendationRepository();
        const bracket = repo.recommendations[0].brackets[0];
        expect(bracket.maxSleep).toBe(bracket.daySleep[1] + bracket.nightSleep[1]);
    });

    it('should calculate minSleep as sum of min day and night sleep', () => {
        const repo = new SleepRecommendationRepository();
        const bracket = repo.recommendations[0].brackets[0];
        expect(bracket.minSleep).toBe(bracket.daySleep[0] + bracket.nightSleep[0]);
    });
});
