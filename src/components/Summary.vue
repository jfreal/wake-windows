<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { SleepRecommendationRepository } from '../models/SleepRecommendations';
import { formatClock } from '../models/time';
import Recommendations from './Recommendations.vue'
import EvidenceGuidance from './EvidenceGuidance.vue'
import SafeSleep from './SafeSleep.vue'
import SourcesEvidence from './SourcesEvidence.vue'

const repo = new SleepRecommendationRepository();
const sleepRecommendations = repo.recommendations;

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

const schedule = reactive(new ScheduleSetting());

if (params.bd) {
  schedule.birthdayDate = params.bd;
}

if (params.s) {
  let [dwt, wwString, bed] = params.s.split("-");
  schedule.wws = wwString.split('/').map(Number);
  schedule.dwt = +dwt;
  schedule.bed = +bed;
}

function addWW() {
  schedule.wws.push(1);
}

function removeWW(index: number) {
  if (schedule.wws.length <= 1) return; // keep at least one wake window
  schedule.wws.splice(index, 1);
}

const scheduleSummary = computed(() => {
  return `${schedule.dwt}-${schedule.wws.join('/')}-${schedule.bed}`;
});

const scheduleWarnings = computed(() => {
  const warnings: string[] = [];
  if (schedule.totalNap < 0) {
    warnings.push("Total nap time is negative. Your wake windows may be too long for the given wake time and bedtime.");
  }
  if (schedule.totalNightSleep < 0) {
    warnings.push("Night sleep is negative. Check your desired wake time and bedtime.");
  }
  if (schedule.totalNightSleep > 14) {
    warnings.push("Night sleep exceeds 14 hours. Check your desired wake time and bedtime.");
  }
  if (schedule.weeks < 20 || schedule.weeks > 44) {
    warnings.push("Weeks in womb should typically be between 20 and 44.");
  }
  return warnings;
});

watch([scheduleSummary, () => schedule.birthdayDate], ([shorthand]) => {
  history.replaceState(null, "", `?bd=${schedule.birthdayDate}&s=${shorthand}`);
}, { immediate: true });
</script>

<template>
  <img class="h-20 mb-2" src="/src/assets/logo.png" alt="Wake Windows">


  <div class="grid grid-cols-1 gap-6 md:grid-cols-[30%_70%] w-full md:items-start">

    <div class="pr-2">

      <label for="bd" class="block text-slate-400 text-sm mb-1">Birthday</label>
      <div class="mb-4">
        <input id="bd" type="date" class="peer bg-slate-800 text-slate-200 text-sm rounded block p-2.5 w-full"
          v-model="schedule.birthdayDate" required />
        <span class="hidden peer-invalid:block text-amber-100 text-sm mt-1">Please enter a birthdate.</span>
      </div>

      <label for="weeks" class="block text-slate-400 text-sm mb-1">Weeks in Womb</label>
      <input id="weeks" type="number" class="bg-slate-800 text-slate-200 text-sm rounded block p-2.5 w-full mb-4"
        placeholder="Weeks" min="20" max="44" step="1" v-model="schedule.weeks" />

      <label for="dwt" class="block text-slate-400 text-sm mb-1">Desired Wake Time</label>
      <select id="dwt" class="bg-slate-800 text-slate-200 text-sm rounded block p-2.5 w-full mb-4" v-model="schedule.dwt" dir="rtl">
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

      <span id="ww-label" class="block text-slate-400 text-sm mb-1">Wake Windows</span>
      <div role="group" aria-labelledby="ww-label" class="mb-4">
        <div v-for="(find, index) in schedule.wws" class="flex items-center gap-2 mb-1">
          <input type="number" class="bg-slate-800 text-slate-200 text-sm rounded p-2.5 min-h-11 w-full" placeholder="Hours"
            v-model="schedule.wws[index]" min="0" max="6" step="0.25" :aria-label="`Wake window ${index + 1} (hours)`" />
          <button type="button"
            class="shrink-0 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-lg rounded min-h-11 min-w-11 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="schedule.wws.length <= 1" :aria-label="`Remove wake window ${index + 1}`"
            v-on:click="removeWW(index)">−</button>
        </div>
        <button type="button"
          class="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-lg rounded min-h-11 min-w-11"
          aria-label="Add wake window" v-on:click="addWW">+</button>
      </div>

      <label for="bed" class="block text-slate-400 text-sm mb-1">Bedtime</label>
      <select id="bed" class="bg-slate-800 text-slate-200 text-sm rounded block p-2.5 w-full" v-model="schedule.bed" dir="rtl">
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

      <div class="flex flex-col sm:flex-row">
        <div class="basis-1/2">
          <span class="text-slate-400 text-sm uppercase">Summary</span>

          <div class="text-xl tabular-nums">
            <strong>{{ schedule.dwt }}</strong>-<span v-for="(find, index) in schedule.wws" class="text-muted">
              <span v-if="find" class="text-slate-200">{{ find }}</span><span
                v-if="index != schedule.wws.length - 1">/</span></span>-<strong>{{ schedule.bed }}</strong>
          </div>
        </div>
        <div>
          <span class="text-slate-400 text-sm uppercase">Age</span>
          {{ schedule.weeksSinceBirth }} weeks / {{ schedule.monthsSinceBirth }} months
        </div>
      </div>

      <div class="flex mt-4 h-10" role="img"
        :aria-label="`Day: ${schedule.totalWakeTime}h awake, ${schedule.totalNightSleep}h night sleep, ${schedule.totalNap}h naps`">

        <div class="bg-orange-500 rounded-l-lg flex items-center justify-between gap-1 px-1.5 overflow-hidden min-w-0"
          :style="{ width: `${(schedule.totalWakeTime / 24) * 100}%` }">
          <img src="/src/assets/sun.png" class="h-8 w-8 shrink-0" alt="" aria-hidden="true" />
          <span class="text-xl text-slate-900 font-semibold tabular-nums">{{ schedule.totalWakeTime }}h</span>
        </div>

        <div class="bg-cyan-500 flex items-center justify-between gap-1 px-1.5 overflow-hidden min-w-0"
          :style="{ width: `${(schedule.totalNightSleep / 24) * 100}%` }">
          <img src="/src/assets/moon.png" class="h-8 w-8 shrink-0" alt="" aria-hidden="true" />
          <span class="text-xl text-slate-900 font-semibold tabular-nums">{{ schedule.totalNightSleep }}h</span>
        </div>

        <div class="bg-violet-500 rounded-r-lg flex items-center justify-between gap-1 px-1.5 overflow-hidden min-w-0"
          :style="{ width: `${(schedule.totalNap / 24) * 100}%` }">
          <img src="/src/assets/sleeping-baby2.png" class="h-8 w-8 shrink-0" alt="" aria-hidden="true" />
          <span class="text-xl text-slate-900 font-semibold tabular-nums">{{ schedule.totalNap }}h</span>
        </div>
      </div>

      <div v-if="scheduleWarnings.length" class="mt-4">
        <div v-for="warning in scheduleWarnings" class="text-amber-400 text-sm p-2 bg-amber-400/10 rounded mb-1">
          &#9888;&#65039; {{ warning }}
        </div>
      </div>

      <div class="mt-4">
        <span class="text-slate-400 text-sm uppercase">Sleep Stats</span>
        <div class="flex flex-col sm:flex-row">
          <div class="basis-1/2">
            <table class="table-auto w-full">
              <tbody>
                <tr>
                  <td class="text-slate-400 text-sm uppercase">Naps ({{ schedule.naps }})</td>
                  <td class="text-right text-slate-200 tabular-nums">{{ schedule.totalNap }}h</td>
                </tr>
                <tr>
                  <td class="text-slate-400 text-sm uppercase">Night Sleep</td>
                  <td class="text-right text-slate-200 tabular-nums">{{ schedule.totalNightSleep }}h</td>
                </tr>
                <tr class="border-t border-slate-700">
                  <td class="text-slate-400 text-sm uppercase">Total Sleep</td>
                  <td class="text-right text-slate-200 tabular-nums font-medium">{{ schedule.totalSleep }}h</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="basis-1/2">
            <table class="table-auto w-full">
              <tbody>
                <tr>
                  <td class="text-slate-400 text-sm uppercase">Total Wake</td>
                  <td class="text-right text-slate-200 tabular-nums">{{ schedule.totalWakeTime }}h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-if="schedule.napTimes.length" class="mt-4">
        <span class="text-slate-400 text-sm uppercase">Nap Schedule</span>
        <div class="flex justify-between text-sm py-1 text-slate-300">
          <span class="flex items-center gap-2"><img src="/src/assets/sun.png" class="h-5 w-5" alt="" aria-hidden="true" /> Wake</span>
          <span class="tabular-nums">{{ formatClock(schedule.wakeMinutes) }}</span>
        </div>
        <div v-for="(nap, i) in schedule.napTimes" :key="i"
          class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300">
          <span class="flex items-center gap-2"><img src="/src/assets/sleeping-baby2.png" class="h-5 w-5" alt="" aria-hidden="true" /> Nap {{ i + 1
            }}</span>
          <span class="tabular-nums">{{ formatClock(nap.start) }} – {{ formatClock(nap.end) }}</span>
        </div>
        <div class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300">
          <span class="flex items-center gap-2"><img src="/src/assets/moon.png" class="h-5 w-5" alt="" aria-hidden="true" /> Bedtime</span>
          <span class="tabular-nums">{{ formatClock(schedule.bedtimeMinutes) }}</span>
        </div>
      </div>

      <div class="mt-6">
        <SafeSleep />
      </div>

      <div class="mt-6">
        <EvidenceGuidance :months="schedule.monthsSinceBirth" />
      </div>

      <div class="mt-6">
        <span class="text-slate-400 text-sm uppercase">How your plan compares</span>
        <p class="text-muted text-xs mb-2">
          Total-sleep and nap counts are evidence-based (Tier 1). Wake-window timing is a practice-based
          heuristic (Tier 2) — a starting estimate, not a rule. Watch your baby's tiredness cues over the clock.
        </p>
        <Recommendations :sleep-schedule="schedule" :recommendations="sleepRecommendations" />
      </div>

      <div class="mt-6">
        <SourcesEvidence />
      </div>

    </div>
  </div>
</template>
