<script lang="ts">
import { defineComponent } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { SleepRecommendationRepository } from '../models/SleepRecommendations';

import Recommendations from './Recommendations.vue'

let repo = new SleepRecommendationRepository();

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());


let ss = new ScheduleSetting();

if (params.bd) {
  ss.birthdayDate = params.bd;
}

if (params.s) {
  let [dwt, wwString, bed] = params.s.split("-");

  ss.wws = wwString.split('/').map(Number)
  ss.dwt = +dwt;
  ss.bed = +bed;
}

export default defineComponent({
  data() {
    return {
      schedule: ss,
      sleepRecommendations: repo.recommendations
    }
  },
  components: {
    Recommendations
  }
})
</script>

<template>
  <div class="grid grid-cols-[30%_70%] w-full">
    <img class="h-20" src="/src/assets/logo.png">
  </div>

  <div class="grid grid-cols-[30%_70%] w-full h-64">

    <div class="pr-2">

      <span class="text-gray-400 text-sm">Birthday</span>

      <div class="mb-4">
        <input type="date" class="peer bg-slate-800  text-gray-300 text-sm rounded block p-2.5 mb-1 w-full "
          placeholder="WW1" v-model="schedule.birthdayDate" required="true" />
        <span class="hidden peer-invalid:block text-amber-100 text-sm">please enter a birthdate</span>
      </div>

      <span class="text-gray-400 text-sm">Weeks in Womb</span>

      <input type="number" class="bg-slate-800  text-gray-300 text-sm rounded block p-2.5 mb-1 w-full  mb-4"
        placeholder="WW1" min="0" step="1" v-model="schedule.weeks" />

      <span class="text-gray-400 text-sm">Desired Wake Time</span>
      <select class="bg-slate-800 text-gray-300 text-sm block h-8 p-1 w-full mb-4" v-model="schedule.dwt" dir="rtl">
        <option value="">12:00</option>
        <option value=".5">12:30</option>
        <option value="1">1:00</option>
        <option value="1.5">1:30</option>
        <option value="2">2:00</option>
        <option value="2.5">2:30</option>
        <option value="3">3:00</option>
        <option value="3.5">3:30</option>
        <option value="4">4:00</option>
        <option value="4.5">4:30</option>
        <option value="5">5:00</option>
        <option value="5.5">5:30</option>
        <option value="6">6:00</option>
        <option value="6.5">6:30</option>
        <option value="7">7:00</option>
        <option value="7.5">7:30</option>
        <option value="8">8:00</option>
        <option value="8.5">8:30</option>
        <option value="9">9:00</option>
        <option value="9.5">9:30</option>
        <option value="10">10:00</option>
        <option value="10.5">10:30</option>
        <option value="11">11:00</option>
        <option value="11.5">11:30</option>
      </select>

      <span class="text-gray-400 text-sm">Wake Windows</span>
      <div class="mb-4">
        <div v-for="(find, index) in schedule.wws">
          <input type="number" class="bg-slate-800  text-gray-300 text-sm rounded block p-2.5 mb-1 w-full "
            placeholder="WW1" v-model="schedule.wws[index]" min="0" step="0.25" />
        </div>
      </div>

      <span class="text-gray-400 text-sm">Bedtime</span>

      <select class="bg-slate-800 text-gray-300 text-sm rounded block p-2.5 w-full" v-model="schedule.bed" dir="rtl">
        <option value="">12:00</option>
        <option value=".5">12:30</option>
        <option value="1">1:00</option>
        <option value="1.5">1:30</option>
        <option value="2">2:00</option>
        <option value="2.5">2:30</option>
        <option value="3">3:00</option>
        <option value="3.5">3:30</option>
        <option value="4">4:00</option>
        <option value="4.5">4:30</option>
        <option value="5">5:00</option>
        <option value="5.5">5:30</option>
        <option value="6">6:00</option>
        <option value="6.5">6:30</option>
        <option value="7">7:00</option>
        <option value="7.5">7:30</option>
        <option value="8">8:00</option>
        <option value="8.5">8:30</option>
        <option value="9">9:00</option>
        <option value="9.5">9:30</option>
        <option value="10">10:00</option>
        <option value="10.5">10:30</option>
        <option value="11">11:00</option>
        <option value="11.5">11:30</option>
      </select>

    </div>
    <div>

      <div class="flex flex-row">
        <div class="basis-1/2">
          <span class="text-slate-400 text-sm uppercase">Summary</span>

          <div class="text-xl"><strong>{{ schedule.dwt }}</strong>-<span v-for="(find, index) in schedule.wws"
              class="text-gray-600">
              <span v-if="find" class="text-gray-200">{{ find }}</span><span
                v-if="index != schedule.wws.length - 1">/</span></span>-<strong>{{ schedule.bed }}</strong>
          </div>
        </div>
        <div>
          <span class="text-slate-400 text-sm uppercase">Age</span>
          {{ schedule.weeksSinceBirth }} weeks / {{ schedule.monthsSinceBirth }} months
        </div>
      </div>

      <div class="block mt-4 h-12">

        <div class="bg-orange-500 rounded-l-lg text-right inline-block h-10 overflow-hidden"
          :style="{ width: `${(schedule.totalWakeTime / 24) * 100}%` }">
          <img src="/src/assets/sun.png" class="h-8 w-8 m-1 float-left" />
          <span class="text-xl m-2">
            {{ schedule.totalWakeTime }}h</span>
        </div>

        <div class="bg-cyan-500 text-right inline-block h-10 overflow-hidden"
          :style="{ width: `${(schedule.totalNightSleep / 24) * 100}%` }">
          <img src="/src/assets/moon.png" class="h-8 w-8 m-1 float-left" />
          <span class="text-xl m-2">
            {{ schedule.totalNightSleep }}h</span>
        </div>

        <div class="bg-violet-500 rounded-r-lg  text-right h-10 inline-block overflow-hidden"
          :style="{ width: `${(schedule.totalNap / 24) * 100}%` }">
          <img src="/src/assets/sleeping-baby2.png" class="h-8 w-8 m-1 float-left" />
          <span class="text-xl m-2">
            {{ schedule.totalNap }}h</span>
        </div>
      </div>

      <div class="mt-4">
        <span class="text-slate-400 text-sm uppercase">Sleep Stats</span>
        <div class="flex flex-row">
          <div class="basis-1/2">
            <table class="table-auto w-full">
              <tbody>
                <tr>
                  <td class="text-gray-400 text-sm uppercase"> Naps ({{ schedule.wws.filter((x) => x).length }})</td>
                  <td>{{ schedule.totalNap }}h</td>
                </tr>
                <tr>
                  <td class="text-gray-400 text-sm uppercase">Night Sleep</td>
                  <td>{{ schedule.totalNightSleep }}h</td>
                </tr>
                <tr class="border-t">
                  <td class="text-gray-400 text-sm uppercase">Total Sleep</td>
                  <td>{{ schedule.totalSleep }}h</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="basis-1/2">
            <table class="table-auto w-full">
              <tr>
                <td class="text-gray-400  text-sm  uppercase">Total Wake</td>
                <td>{{ schedule.totalNap }}h</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <Recommendations :sleep-schedule="schedule" :recommendations="sleepRecommendations" />
      </div>

    </div>
  </div>
</template>