<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { formatClock, formatClockRange, formatDuration } from '../models/time'
import { effectiveGuidanceMode, windowSlopMinutes, ATYPICAL_MESSAGE } from '../models/GuidanceMode'
import logoUrl from '../assets/logo.png'
import sunUrl from '../assets/sun.png'
import moonUrl from '../assets/moon.png'
import napUrl from '../assets/sleeping-baby2.png'

// @doc:read-only-babysitter-mode
// Read-only sitter/grandparent view of a shared plan. Renders today's schedule
// (both children when the plan has a sibling) with the next nap and bedtime
// prominent, as ranges (never a countdown), and contains no edit controls of
// any kind. Ranges use the same guidance-mode widening as the parent view, so
// a cues-led or atypical day reads identically for the sitter. "Next" is
// computed once at page load; live recompute is deliberately out of scope.

const props = defineProps<{ schedule: ScheduleSetting; sibling?: ScheduleSetting | null }>()

const now = new Date();
const nowMinutes = now.getHours() * 60 + now.getMinutes();

interface ChildView {
  label: string;
  atypical: boolean;
  nextNap: { earliest: number; latest: number; lengthMinutes: number } | null;
  bedtime: { earliest: number; latest: number };
  napWindows: { earliest: number; latest: number; lengthMinutes: number }[];
  wakeMinutes: number;
}

function viewOf(s: ScheduleSetting, label: string): ChildView {
  const slop = windowSlopMinutes(effectiveGuidanceMode(s.monthsSinceBirth, s.atypical));
  return {
    label,
    atypical: s.atypical,
    nextNap: s.nextNapWindowAt(slop, nowMinutes),
    bedtime: s.bedtimeWindowAt(slop),
    napWindows: s.napWindowsAt(slop),
    wakeMinutes: s.wakeMinutes,
  };
}

const children = computed<ChildView[]>(() =>
  props.sibling
    ? [viewOf(props.schedule, 'Baby A'), viewOf(props.sibling, 'Baby B')]
    : [viewOf(props.schedule, '')]);
</script>

<template>
  <div class="flex items-center gap-3 mb-2">
    <img class="h-20" :src="logoUrl" alt="Wake Windows" width="70" height="80" fetchpriority="high">
    <span class="eyebrow border border-slate-700 rounded px-2 py-1">Sitter view · read-only</span>
  </div>

  <div v-for="child in children" :key="child.label" class="mt-4">
    <h2 v-if="child.label" class="eyebrow mb-2">{{ child.label }}</h2>

    <p v-if="child.atypical" class="text-slate-300 text-sm p-2 bg-slate-800 rounded mb-3">
      {{ ATYPICAL_MESSAGE }}
    </p>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div class="bg-slate-800 rounded-lg p-4">
        <span class="flex items-center gap-2 eyebrow">
          <img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20" height="20" /> Next nap
        </span>
        <div v-if="child.nextNap" class="mt-1">
          <div class="text-3xl text-slate-200 tabular-nums">~{{ formatClockRange(child.nextNap.earliest, child.nextNap.latest) }}</div>
          <div class="text-slate-400 text-sm mt-1">usually sleeps about {{ formatDuration(child.nextNap.lengthMinutes) }}</div>
        </div>
        <div v-else class="mt-1 text-xl text-slate-300">No more naps today</div>
      </div>

      <div class="bg-slate-800 rounded-lg p-4">
        <span class="flex items-center gap-2 eyebrow">
          <img :src="moonUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20" height="20" /> Next bedtime
        </span>
        <div class="mt-1">
          <div class="text-3xl text-slate-200 tabular-nums">~{{ formatClockRange(child.bedtime.earliest, child.bedtime.latest) }}</div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <span class="eyebrow">{{ child.label ? `${child.label} — today's plan` : "Today's plan" }}</span>
      <div class="flex justify-between text-sm py-1 text-slate-300">
        <span class="flex items-center gap-2"><img :src="sunUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20" height="20" /> Wake</span>
        <span class="tabular-nums">{{ formatClock(child.wakeMinutes) }}</span>
      </div>
      <div v-for="(nap, i) in child.napWindows" :key="i"
        class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300"
        :class="{ 'opacity-60': nap.latest < nowMinutes }">
        <span class="flex items-center gap-2"><img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20" height="20" /> Nap {{ i + 1
          }} <span class="text-muted">({{ formatDuration(nap.lengthMinutes) }})</span></span>
        <span class="tabular-nums">~{{ formatClockRange(nap.earliest, nap.latest) }}</span>
      </div>
      <div class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300">
        <span class="flex items-center gap-2"><img :src="moonUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20" height="20" /> Bedtime</span>
        <span class="tabular-nums">~{{ formatClockRange(child.bedtime.earliest, child.bedtime.latest) }}</span>
      </div>
    </div>
  </div>

  <div class="mt-6 text-muted text-xs">
    <p>Nap times are ranges, not deadlines — anywhere in the window is on plan.</p>
    <p class="mt-1">Times are the plan's clock times (e.g. 9:30 AM as the family wrote it); they are not converted
      between time zones, and "next" is based on this device's clock.</p>
    <p class="mt-1">This link is view-only — nothing here can change the family's plan.</p>
  </div>
</template>
