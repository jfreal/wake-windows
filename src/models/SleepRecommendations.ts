import { faMultiply } from "@fortawesome/free-solid-svg-icons";
import { ScheduleSetting } from "./ScheduleSetting";

class SleepRecommendationRepository {
     recommendations: SleepRecommendation[];

     constructor() {
          this.recommendations = [
               new SleepRecommendation({
                    name: "Twins, Triplets, & Quads: Safe Sleep Training & Learning for Multiples", brackets: [
                         new DevelopmentBracket(true, { minTime: 0, maxTime: 4, maxNap: 3, maxNight: 11 })
                    ]
               }),
               new SleepRecommendation({
                    name: "Huckelberry", brackets: [
                         new DevelopmentBracket(true, { minTime: 4, maxTime: 5, minNaps: 3, maxNaps: 4 })
                    ]
               }),

          ];
     }
}

class SleepRecommendation {
     name: string = "";
     brackets: DevelopmentBracket[] = [];

     constructor(init?: Partial<SleepRecommendation>) {
          Object.assign(this, init);
     }

     validate(schedule: ScheduleSetting, time: number): ValidationError[] {
          let errors: Array<ValidationError> = [];

          //STOP
          if (!this.currentBracket(time)) {
               errors.push(new ValidationError(`🚧 There isn't enough information in the schedule settings to apply this recommendation.`))
               return errors;
          }

          if (schedule.totalSleep > this.currentBracket(time).maxSleep) {
               errors.push(new ValidationError(`⚠️ At this age, this schedule recommends ${this.currentBracket(time).maxSleep} hours of sleep.`))
          }

          return errors;
     }

     public get startBracket(): DevelopmentBracket {
          return this.brackets.sort((n1, n2) => n1.minTime - n2.minTime)[0];
     }

     public currentBracket(time: number): DevelopmentBracket {
          console.log(this.brackets)
          let bracket = this.brackets.filter(_ => _.minTime <= time && _.maxTime >= time);
          return bracket[0];
     }
}

class ValidationError {
     text: string;

     constructor(text: string) {
          this.text = text;
     }
}

class DevelopmentBracket {

     constructor(monthMode: boolean, init?: Partial<DevelopmentBracket>) {
          Object.assign(this, init);
     }

     minTime: number = 0;
     maxTime: number = 0;

     exampleNap: number = 0;
     dwt: number = 7;
     bed: number = 7;
     wwMax: number = 2;

     minNaps: number = 0;
     maxNaps: number = 0;

     minNight: number = 0;
     maxNight: number = 0;

     minNap: number = 0;
     maxNap: number = 0;

     get maxSleep() {
          return this.maxNight + this.maxNap;
     }
}

export { SleepRecommendation, SleepRecommendationRepository }