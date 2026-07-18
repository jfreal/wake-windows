<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { formatClock, formatClockRange, formatDuration } from '../models/time'
import logoUrl from '../assets/logo.png'
import sunUrl from '../assets/sun.png'
import moonUrl from '../assets/moon.png'
import napUrl from '../assets/sleeping-baby2.png'

// @doc:read-only-babysitter-mode
// Read-only sitter/grandparent view of a shared plan. Renders today's schedule
// with the next nap and bedtime prominent, as ranges (never a countdown), and
// contains no edit controls of any kind. "Next" is computed once at page load;
// live recompute is deliberately out of scope.

const props = defineProps<{ schedule: ScheduleSetting }>()

const now = new Date();
const nowMinutes = now.getHours() * 60 + now.getMinutes();

const nextNap = computed(() => props.schedule.nextNapWindow(nowMinutes));
const bedtime = computed(() => props.schedule.bedtimeWindow);
const napWindows = computed(() => props.schedule.napWindows);
</script>

<template>
  <div class="flex items-center gap-3 mb-2">
    <img class="h-20" :src="logoUrl" alt="Wake Windows">
    <span class="text-slate-400 text-xs uppercase border border-slate-700 rounded px-2 py-1">Sitter view · read-only</span>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
    <div class="bg-slate-800 rounded-lg p-4">
      <span class="flex items-center gap-2 text-slate-400 text-sm uppercase">
        <img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Next nap
      </span>
      <div v-if="nextNap" class="mt-1">
        <div class="text-3xl text-slate-200 tabular-nums">~{{ formatClockRange(nextNap.earliest, nextNap.latest) }}</div>
        <div class="text-slate-400 text-sm mt-1">usually sleeps about {{ formatDuration(nextNap.lengthMinutes) }}</div>
      </div>
      <div v-else class="mt-1 text-xl text-slate-300">No more naps today</div>
    </div>

    <div class="bg-slate-800 rounded-lg p-4">
      <span class="flex items-center gap-2 text-slate-400 text-sm uppercase">
        <img :src="moonUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Next bedtime
      </span>
      <div class="mt-1">
        <div class="text-3xl text-slate-200 tabular-nums">~{{ formatClockRange(bedtime.earliest, bedtime.latest) }}</div>
      </div>
    </div>
  </div>

  <div class="mt-6">
    <span class="text-slate-400 text-sm uppercase">Today's plan</span>
    <div class="flex justify-between text-sm py-1 text-slate-300">
      <span class="flex items-center gap-2"><img :src="sunUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Wake</span>
      <span class="tabular-nums">{{ formatClock(schedule.wakeMinutes) }}</span>
    </div>
    <div v-for="(nap, i) in napWindows" :key="i"
      class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300"
      :class="{ 'opacity-60': nap.latest < nowMinutes }">
      <span class="flex items-center gap-2"><img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Nap {{ i + 1
        }} <span class="text-muted">({{ formatDuration(nap.lengthMinutes) }})</span></span>
      <span class="tabular-nums">~{{ formatClockRange(nap.earliest, nap.latest) }}</span>
    </div>
    <div class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300">
      <span class="flex items-center gap-2"><img :src="moonUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Bedtime</span>
      <span class="tabular-nums">~{{ formatClockRange(bedtime.earliest, bedtime.latest) }}</span>
    </div>
  </div>

  <div class="mt-6 text-muted text-xs">
    <p>Nap times are ranges, not deadlines — anywhere in the window is on plan.</p>
    <p class="mt-1">All times are clock times in the baby's home time zone, not adjusted to this device.</p>
    <p class="mt-1">This link is view-only — nothing here can change the family's plan.</p>
  </div>
</template>
