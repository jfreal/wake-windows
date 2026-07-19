<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { formatClock, formatDuration } from '../models/time'
import TierBadge from './TierBadge.vue'

// @doc:no-ai-no-data-training
// "How this was calculated" — the plan's arithmetic spelled out with the
// user's own numbers, right under the nap schedule it explains. Companion to
// the stance panel (NoAiStance.vue): proof that "no AI, no black box" is
// checkable, not a slogan. Parent renders it only when a nap schedule exists,
// so the numbers here always describe a valid plan.
const props = defineProps<{ schedule: ScheduleSetting; slopMinutes: number }>()

const wwList = computed(() => props.schedule.wws.map((w) => `${w} h`).join(' / '))
const napLengthMinutes = computed(() =>
     props.schedule.naps > 0 ? (props.schedule.totalNap / props.schedule.naps) * 60 : 0)
</script>

<template>
     <details class="rounded border border-slate-800">
          <!-- py-3: 20px line + 24px padding = 44px tap target (F08) -->
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               How this was calculated
               <span class="text-muted font-normal">— wake time + wake windows → nap &amp; bedtime windows</span>
          </summary>

          <div class="px-3 pb-3 space-y-2 text-xs text-slate-400">
               <p>
                    Start at your wake time, <span class="text-slate-200 tabular-nums">{{
                         formatClock(schedule.wakeMinutes) }}</span>. Add each wake window you set
                    (<span class="text-slate-200 tabular-nums">{{ wwList }}</span>) — a nap starts where
                    each window ends, and the last window runs into bedtime.
               </p>
               <p>
                    Your bedtime, <span class="text-slate-200 tabular-nums">{{
                         formatClock(schedule.bedtimeMinutes) }}</span>, fixes night sleep at
                    <span class="text-slate-200 tabular-nums">{{ schedule.totalNightSleep }} h</span>.
                    What's left of the 24-hour day after
                    <span class="text-slate-200 tabular-nums">{{ schedule.totalWakeTime }} h</span> awake is
                    <span class="text-slate-200 tabular-nums">{{ schedule.totalNap }} h</span> of naps,
                    split evenly — about
                    <span class="text-slate-200 tabular-nums">{{ formatDuration(napLengthMinutes) }}</span> each.
               </p>
               <p>
                    Each start is shown as a range, ±{{ slopMinutes }} minutes around the computed time —
                    honest slack, not false precision. Cues-led and atypical days widen it.
               </p>
               <p>
                    <TierBadge :tier="2" />
                    <span class="mt-1 block">
                         The wake-window lengths are the only judgment call — a practice-based heuristic
                         (Tier 2), cited in Sources &amp; Evidence below. Everything else is arithmetic on
                         your inputs.
                    </span>
               </p>
               <p class="text-muted border-t border-slate-800 pt-2">
                    No AI anywhere in this. Same inputs, same plan, every time.
               </p>
          </div>
     </details>
</template>
