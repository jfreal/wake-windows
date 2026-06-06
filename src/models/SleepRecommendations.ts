import { ScheduleSetting } from "./ScheduleSetting";

class SleepRecommendationRepository {
     recommendations: SleepRecommendation[];

     constructor() {
          this.recommendations = [
               new SleepRecommendation({
                    name: "Twins, Triplets, & Quads: Safe Sleep Training & Learning for Multiples",
                    url: "https://www.facebook.com/groups/157633598090301/",
                    brackets: [
                         new DevelopmentBracket([4, 5], [0, 4.5], [10, 12], [3, 4], [75, 105]),
                         new DevelopmentBracket([5, 6], [0, 4], [10, 12], [3, 3], [90, 135]),
                         new DevelopmentBracket([6, 7], [0, 3.5], [10, 12], [3, 3], [120, 150]),
                    ]
               }),
               new SleepRecommendation({
                    name: "Huckleberry",
                    url: "https://huckleberrycare.com/blog/baby-sleep-schedule-by-age-nap-and-sleep-chart",
                    brackets: [
                         new DevelopmentBracket([3, 4], [4, 5], [10, 12], [4, 5], [60, 120]),
                         new DevelopmentBracket([4, 5], [3.5, 4.5], [10, 12], [3, 4], [90, 150]),
                         new DevelopmentBracket([5, 6], [2.5, 3.5], [11, 12], [3, 4], [120, 240]),
                    ]
               }),
               new SleepRecommendation({
                    name: "General Guidance (AAP / Sleep Foundation ranges)",
                    url: "https://www.sleepfoundation.org/children-and-sleep/how-much-sleep-do-kids-need",
                    brackets: [
                         new DevelopmentBracket([0, 2], [6, 9], [8, 10], [4, 6], [35, 90]),
                         new DevelopmentBracket([3, 5], [3.5, 5], [10, 12], [3, 5], [75, 150]),
                         new DevelopmentBracket([6, 8], [2.5, 3.5], [10, 12], [2, 3], [120, 180]),
                         new DevelopmentBracket([9, 11], [2, 3], [10, 12], [2, 2], [150, 210]),
                         new DevelopmentBracket([12, 17], [1.5, 3], [10, 12], [1, 2], [180, 240]),
                         new DevelopmentBracket([18, 24], [1, 2.5], [10, 12], [1, 1], [240, 360]),
                    ]
               }),

          ];
     }
}

class SleepRecommendation {
     name: string = "";
     url: string = "";
     brackets: DevelopmentBracket[] = [];

     constructor(init?: Partial<SleepRecommendation>) {
          Object.assign(this, init);
     }

     validate(schedule: ScheduleSetting, time: number): ValidationError[] {
          const errors: ValidationError[] = [];
          const bracket = this.currentBracket(time);

          if (!bracket) {
               errors.push(new ValidationError(`🚧 There isn't enough information in the schedule settings to apply this recommendation.`))
               return errors;
          }

          if (schedule.totalSleep > bracket.maxSleep) {
               errors.push(new ValidationError(`⚠️ At this age, this schedule recommends no more than ${bracket.maxSleep} hours of sleep.`))
          }

          if (schedule.totalSleep < bracket.minSleep) {
               errors.push(new ValidationError(`⚠️ At this age, this schedule recommends a minimum of ${bracket.minSleep} hours of sleep.`))
          }

          if (schedule.wws.length - 1 < bracket.naps[0]) {
               errors.push(new ValidationError(`⚠️ At this age, this schedule recommends a minimum of ${bracket.naps[0]} naps.`))
          }

          return errors;
     }

     public get startBracket(): DevelopmentBracket {
          return this.brackets.sort((n1, n2) => n1.months[0] - n2.months[0])[0];
     }

     public currentBracket(time: number): DevelopmentBracket | undefined {
          const matches = this.brackets.filter(_ => _.months[0] <= time && _.months[1] >= time);
          // Brackets can overlap at a boundary month (e.g. [3,4] and [4,5] both contain 4);
          // prefer the more advanced range (highest start) so the age maps to the bracket it enters.
          return matches.sort((a, b) => b.months[0] - a.months[0])[0];
     }
}

class ValidationError {
     text: string;

     constructor(text: string) {
          this.text = text;
     }
}

class DevelopmentBracket {

     constructor(
          public months: [number, number],
          public daySleep: [number, number],
          public nightSleep: [number, number],
          public naps: [number, number],
          public wwTime: [number, number]
     ) { }

     dwt: number = 7;
     bed: number = 7;

     get maxSleep() {
          return this.daySleep[1] + this.nightSleep[1];
     }

     get minSleep() {
          return this.daySleep[0] + this.nightSleep[0];
     }
}

export { SleepRecommendation, SleepRecommendationRepository }