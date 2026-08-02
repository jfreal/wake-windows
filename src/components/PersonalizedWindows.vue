<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { entries } from '../stores/sleepLog'
import {
     personalizeWakeWindows,
     describeAdjustment,
     loadPersonalizePref,
     savePersonalizePref,
     DEFAULT_LOOKBACK_DAYS,
     MIN_DAYS_TO_PERSONALIZE,
     type PersonalizationResult,
} from '../models/PersonalizedWindows'
import { formatDuration } from '../models/time'
import TierBadge from './TierBadge.vue'

// @doc:personalized-from-local-history
// Opt-in, OFF by default. Refines the plan's wake windows from the baby's own
// last-N-days sleep log using plain median arithmetic (PersonalizedWindows.ts),
// entirely on-device. Shows its work and resets to the age default in one tap.
// The age-based plan is complete without this — turning it off restores exactly
// the windows the parent had before.
const props = defineProps<{ schedule: ScheduleSetting }>()

// The log comes from the shared store, so a nap logged below is reflected here
// without a reload (it used to be read once on mount and then never again).
const enabled = ref(false)
// The age-default windows captured when personalization was switched on, so a
// reload re-nudges from the default (never compounding) and reset is exact.
const baseWws = ref<number[]>([...props.schedule.wws])

function applyToSchedule(windows: number[]) {
     // Splice in place so the reactive array identity (and everything derived
     // from schedule.wws — totals, nap times, the 24h bar) updates.
     props.schedule.wws.splice(0, props.schedule.wws.length, ...windows)
}

const result = computed<PersonalizationResult>(() =>
     personalizeWakeWindows(baseWws.value, entries, { now: Date.now(), lookbackDays: DEFAULT_LOOKBACK_DAYS }))

onMounted(() => {
     const pref = loadPersonalizePref()
     if (pref.enabled && pref.base) {
          baseWws.value = [...pref.base]
          enabled.value = true
          if (result.value.personalized) applyToSchedule(result.value.windows)
     } else {
          baseWws.value = [...props.schedule.wws]
     }
})

function enable() {
     baseWws.value = [...props.schedule.wws]
     enabled.value = true
     savePersonalizePref({ enabled: true, base: [...baseWws.value] })
     if (result.value.personalized) applyToSchedule(result.value.windows)
}

// Single control doubles as "one-tap reset to default": turning it off restores
// the captured age-default windows — relief, never a demerit.
function reset() {
     enabled.value = false
     applyToSchedule(baseWws.value)
     savePersonalizePref({ enabled: false, base: null })
}

const total = computed(() => baseWws.value.length)
const adjustments = computed(() => result.value.adjustments)
const hasEnoughData = computed(() => result.value.daysUsed >= MIN_DAYS_TO_PERSONALIZE)
</script>

<template>
     <div>
          <h2 class="text-slate-400 text-sm uppercase font-normal">Personalize from your logs</h2>
          <p class="text-muted text-xs mb-2">
               Optional. Nudge your plan's wake windows toward your baby's own recent pattern —
               plain median arithmetic on your last {{ DEFAULT_LOOKBACK_DAYS }} days of sleep logs, worked out
               on your device. No account, no AI. Off unless you turn it on, and one tap back to the age default.
          </p>

          <!-- On-state is the sky accent, not violet: violet is the nap colour in
               the 24-hour bar, where it means a literal block of the day. -->
          <button
               type="button"
               :aria-pressed="enabled"
               class="btn w-full justify-start px-2.5 text-left border transition-colors"
               :class="enabled
                    ? 'bg-sky-400/10 border-sky-400/50 text-sky-200'
                    : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-300'"
               @click="enabled ? reset() : enable()"
          >
               {{ enabled ? '✓ Personalizing from your logs' : 'Personalize from my logs' }}
          </button>

          <div v-if="enabled" class="mt-3">
               <!-- Enough usable days AND at least one window meaningfully different -->
               <div v-if="result.personalized" class="rounded border border-sky-400/30 bg-sky-400/5 p-3">
                    <div class="flex items-center gap-2 mb-2">
                         <span class="text-slate-300 text-sm font-medium">What we changed</span>
                         <TierBadge :tier="3" />
                    </div>
                    <ul class="space-y-1.5">
                         <li v-for="adj in adjustments" :key="adj.index" class="text-xs text-slate-300">
                              {{ describeAdjustment(adj, total, result.lookbackDays) }}
                              <span class="text-muted whitespace-nowrap">({{ formatDuration(adj.baseHours * 60) }} →
                                   {{ formatDuration(adj.appliedHours * 60) }})</span>
                         </li>
                    </ul>
                    <p class="text-muted text-xs mt-2">
                         Based on {{ result.daysUsed }}
                         {{ result.daysUsed === 1 ? 'day' : 'days' }} of logs<span
                              v-if="result.excludedDays > 0"> ({{ result.excludedDays }} unusual
                              {{ result.excludedDays === 1 ? 'day' : 'days' }} left out so an off day doesn't skew
                              things)</span>. Each nudge is capped at ±30 min — it refines the range, it doesn't
                         invent a schedule. Your windows are still fully adjustable above.
                    </p>
                    <button
                         type="button"
                         class="btn btn-quiet mt-2"
                         @click="reset"
                    >Reset to age default</button>
               </div>

               <!-- Turned on, data present, but nothing moved by a meaningful amount -->
               <div v-else-if="hasEnoughData" class="rounded border border-slate-800 p-3">
                    <p class="text-slate-300 text-xs">
                         Your last {{ result.lookbackDays }} days already line up with the age default —
                         nothing to change. That's a good sign, not a problem.
                    </p>
                    <button
                         type="button"
                         class="btn btn-quiet mt-2"
                         @click="reset"
                    >Turn off</button>
               </div>

               <!-- Too little data — keep the age default and say so plainly -->
               <div v-else class="rounded border border-slate-800 p-3">
                    <p class="text-slate-300 text-xs">
                         Not enough logged sleep yet to personalize — we need at least
                         {{ MIN_DAYS_TO_PERSONALIZE }} usual days. Keep logging naps and nights and your plan
                         will start to match your baby. Until then it stays on the age default.
                    </p>
                    <button
                         type="button"
                         class="btn btn-quiet mt-2"
                         @click="reset"
                    >Turn off</button>
               </div>
          </div>
     </div>
</template>
