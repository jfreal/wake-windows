<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { buildDstShiftPlan, type DstMode } from '../models/DstShift'
import { formatClockRange } from '../models/time'
import TierBadge from './TierBadge.vue'

// @doc:dst-timezone-shift
// "Shift my schedule" — DST presets that render the gradual 15-min/day
// transition plan day by day. Spring-forward and fall-back are asymmetric
// (earlier vs. later steps), so each mode gets its own explanation.
const props = defineProps<{ schedule: ScheduleSetting }>()
const mode = defineModel<DstMode | null>({ default: null })

const MODES: { id: DstMode; label: string; hint: string }[] = [
  { id: 'spring-forward', label: 'Spring forward', hint: 'clocks jump ahead 1h' },
  { id: 'fall-back', label: 'Fall back', hint: 'clocks go back 1h' },
]

const EXPLAIN: Record<DstMode, string> = {
  'spring-forward':
    'Clocks jump ahead, so your usual bedtime will suddenly feel an hour too early to your baby. '
    + 'Starting 4 days before the change, move the whole day — wake, naps, bedtime — about 15 minutes '
    + 'earlier each day. When the clocks change, you are already back on your usual times.',
  'fall-back':
    'Clocks go back, so your baby runs an hour ahead of the new clock — the classic struggle is the '
    + 'extra-early morning wake-up. Starting 4 days before the change, move the whole day — wake, naps, '
    + 'bedtime — about 15 minutes later each day. Bedtime deliberately runs a little past your preferred '
    + 'bedtime during the ramp, then lands right back on it when the clocks change.',
}

function toggle(id: DstMode) {
  mode.value = mode.value === id ? null : id
}

const plan = computed(() => (mode.value ? buildDstShiftPlan(props.schedule, mode.value) : null))

// Day strip geometry: percentage of the 24h track.
function pct(minutes: number) {
  return `${(Math.min(Math.max(minutes, 0), 1440) / 1440) * 100}%`
}
function spanPct(start: number, end: number) {
  return `${((Math.min(Math.max(end, 0), 1440) - Math.min(Math.max(start, 0), 1440)) / 1440) * 100}%`
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-2">
      <h2 class="text-slate-400 text-sm uppercase font-normal">Shift my schedule</h2>
      <TierBadge :tier="3" />
    </div>
    <p class="text-muted text-xs mt-1 mb-2">
      Daylight saving coming up? Ease the whole day over in small steps instead of an overnight jump.
      The ~15 min/day ramp is a sleep-consultant convention — reasonable, gentle, and not a rule.
    </p>

    <div class="flex flex-wrap gap-2" role="group" aria-label="Daylight saving presets">
      <button
        v-for="m in MODES"
        :key="m.id"
        type="button"
        class="rounded px-3 py-2 min-h-11 text-sm border"
        :class="mode === m.id
          ? 'bg-slate-700 border-slate-500 text-slate-100'
          : 'bg-slate-800 border-slate-800 hover:bg-slate-700 text-slate-300'"
        :aria-pressed="mode === m.id"
        @click="toggle(m.id)"
      >
        <!-- hint inherits the button's ink: muted fails 4.5:1 on the slate-800/700 fills -->
        {{ m.label }} <span class="text-xs">({{ m.hint }})</span>
      </button>
    </div>

    <div v-if="plan && mode" class="mt-3">
      <p class="text-slate-400 text-xs mb-3">{{ EXPLAIN[mode] }}</p>

      <div
        v-for="day in plan.days"
        :key="day.label"
        class="border-t border-slate-800 py-2"
      >
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <span class="text-slate-300 text-sm font-medium">{{ day.label }}</span>
          <span v-if="!day.afterChange" class="text-muted text-xs tabular-nums">
            {{ day.offsetMinutes < 0 ? '−' : '+' }}{{ Math.abs(day.offsetMinutes) }} min
          </span>
          <span v-else class="text-muted text-xs">usual times, new clock</span>
        </div>

        <!-- Mini 24h strip: the awake span slides across days to show the shift direction. -->
        <div class="relative h-2 mt-1.5 rounded bg-slate-800 overflow-hidden" aria-hidden="true">
          <div
            class="absolute inset-y-0 bg-orange-500/70 rounded"
            :style="{ left: pct(day.wakeMinutes), width: spanPct(day.wakeMinutes, day.bedtimeMinutes) }"
          ></div>
          <div
            v-for="(nap, i) in day.naps"
            :key="i"
            class="absolute inset-y-0 bg-violet-500"
            :style="{ left: pct(nap.start), width: spanPct(nap.start, nap.end) }"
          ></div>
        </div>

        <div class="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-sm text-slate-300">
          <span>Wake <span class="tabular-nums">{{ formatClockRange(day.wake.start, day.wake.end) }}</span></span>
          <span v-for="(nap, i) in day.naps" :key="i">
            Nap {{ i + 1 }} <span class="tabular-nums">{{ formatClockRange(nap.startRange.start, nap.startRange.end) }}</span>
          </span>
          <span>
            Bedtime <span class="tabular-nums">{{ formatClockRange(day.bedtime.start, day.bedtime.end) }}</span>
          </span>
        </div>
        <p v-if="day.exceedsPreferredBedtime" class="text-muted text-xs mt-0.5">
          Runs past your preferred bedtime on purpose — it lands back on it after the change.
        </p>
      </div>

      <p class="text-muted text-xs mt-2">
        Ranges, not targets — landing anywhere inside the window is a win, and a day that goes
        sideways doesn't restart the plan. Share this page's link so every caregiver follows the
        same steps.
      </p>
    </div>
  </div>
</template>
