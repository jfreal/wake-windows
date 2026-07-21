<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { applyPlanParams } from '../models/planUrl'
import { type SleepEntry, loadLog } from '../models/sleepLog'
import { getSource } from '../models/Citations'
import { formatDuration } from '../models/time'
import {
     detectNapTransition,
     buildLengtheningPlan,
     loadDismissed,
     saveDismissed,
     isDismissed,
     type ManualSignals,
     type TransitionType,
} from '../models/napTransition'
import TierBadge from './TierBadge.vue'

// @doc:nap-transition-detector
// Gentle, dismissible nap-transition (4→3→2→1) detector + guidance. Runs fully
// on-device from the local sleep log and/or the parent's own self-report — no
// account, offline-safe. It NEVER commands: it offers "this looks like it could
// be a transition" and shows the standard Tier-3 gradual plan (lengthen wake
// windows ~15 min at a time). Every surface carries the Tier-3 badge + citation.
//
// This mounts standalone in App.vue, so it reads the plan (age + current wake
// windows) from the same shareable URL query the rest of the app uses, and the
// log from localStorage on mount.

const params = Object.fromEntries(new URLSearchParams(window.location.search).entries())
const schedule = reactive(new ScheduleSetting())
applyPlanParams(schedule, params.bd, params.s)

const log = ref<SleepEntry[]>([])
const dismissed = ref<TransitionType[]>([])

// Self-reported signals ("over the past week, are you seeing…"). Local UI state;
// the log path works without touching these.
const manual = reactive<ManualSignals>({
     napResistance: false,
     shortNaps: false,
     earlyWaking: false,
     splitNights: false,
})
const reportOpen = ref(false)

onMounted(() => {
     log.value = loadLog()
     dismissed.value = loadDismissed()
})

const result = computed(() =>
     detectNapTransition(log.value, schedule.monthsSinceBirth, { now: Date.now(), manual }))

// The prompt shows only when a transition is age-appropriate, its signals
// cluster, AND the parent hasn't dismissed it. Everything else stays quiet.
const showPrompt = computed(() => result.value.detected && !isDismissed(result.value, dismissed.value))

// A subtle "watching" line + self-report entry appears when the child is in a
// transition age but nothing has fired (or it was dismissed) — never nags.
const showWatch = computed(() => result.value.rule !== null && !showPrompt.value)

const plan = computed(() =>
     result.value.rule ? buildLengtheningPlan(result.value.rule, schedule.wws) : null)

const citation = getSource('huckleberry-nap-transitions')

const signalToggles = [
     { key: 'napResistance', label: 'Fighting or resisting naps' },
     { key: 'shortNaps', label: 'Short or skipped naps' },
     { key: 'earlyWaking', label: 'Waking early (before ~6 AM)' },
     { key: 'splitNights', label: 'Long awake stretches at night' },
] as const

function dismiss() {
     if (!result.value.transition) return
     dismissed.value = [...dismissed.value, result.value.transition]
     saveDismissed(dismissed.value)
}

/** Total awake+nap span (hours) used to scale the mini lengthening bar. */
const barTotal = computed(() => {
     const wws = plan.value?.suggested ?? []
     // wake windows + one short nap slot between each, just for proportion.
     return Math.max(1, wws.reduce((s, w) => s + w, 0) + Math.max(0, wws.length - 1))
})
</script>

<template>
     <!-- @doc:nap-transition-detector — nothing renders outside a transition age. -->
     <section v-if="result.rule" class="mt-6">
          <h2 class="text-slate-400 text-sm uppercase font-normal">Nap transitions</h2>

          <!-- The gentle, dismissible prompt. -->
          <div v-if="showPrompt" class="mt-2 rounded border border-amber-400/40 bg-amber-400/5 p-3">
               <div class="flex flex-wrap items-center gap-2 mb-1">
                    <span class="text-slate-100 text-sm font-medium">This looks like it could be a transition</span>
                    <TierBadge :tier="3" />
               </div>
               <p class="text-slate-300 text-sm">
                    The signs point to the <strong class="text-slate-100">{{ result.label }}</strong> transition
                    ({{ result.ageMonths }} months). This is a gentle heads-up, not a diagnosis — you know your baby
                    best.
               </p>
               <p class="text-muted text-xs mt-1">{{ result.reason }}</p>

               <!-- Under ~6 months: cues over clock, never a rigid schedule. -->
               <p v-if="result.underSixMonths"
                    class="text-amber-200 text-xs mt-2 rounded bg-amber-400/10 p-2">
                    Your baby is still under ~6 months — follow sleepy cues over the clock. Treat this as something to
                    watch, not a schedule to enforce.
               </p>

               <!-- The gentle plan: lengthen wake windows ~15 min at a time. -->
               <div v-if="plan" class="mt-3">
                    <div class="flex items-center gap-2 mb-1">
                         <span class="text-slate-300 text-sm font-medium">A gentle way through it</span>
                    </div>
                    <ul class="space-y-1.5">
                         <li v-for="(note, i) in plan.notes" :key="i" class="text-xs text-slate-300 flex gap-2">
                              <span aria-hidden="true" class="text-amber-300">•</span><span>{{ note }}</span>
                         </li>
                    </ul>

                    <!-- @doc:24h-visual-day-breakdown @doc:nap-transition-detector — the
                         ~15-min lengthening shown on the day view: each window's current
                         length plus the lighter "+15 min" extension it grows into. -->
                    <div class="mt-3">
                         <p class="text-slate-400 text-xs mb-1">
                              This week's wake windows (lighter tip = the ~{{ plan.stepMinutes }} min you're adding):
                         </p>
                         <div class="flex flex-col gap-1"
                              role="img"
                              :aria-label="`Lengthening plan: windows growing about ${plan.stepMinutes} minutes each, from ${plan.current.map(formatDuration).join(', ')} to ${plan.suggested.map(formatDuration).join(', ')}.`">
                              <div v-for="(w, i) in plan.current" :key="i" class="flex items-center gap-2">
                                   <span class="text-muted text-[11px] w-14 shrink-0">Window {{ i + 1 }}</span>
                                   <div class="flex-1 flex h-4 rounded overflow-hidden bg-slate-800">
                                        <div class="bg-orange-500/80 h-full"
                                             :style="{ width: `${(w / barTotal) * 100}%` }"></div>
                                        <div class="bg-orange-400/40 h-full"
                                             :style="{ width: `${((plan.suggested[i] - w) / barTotal) * 100}%` }"></div>
                                   </div>
                                   <span class="text-slate-300 text-[11px] tabular-nums whitespace-nowrap">
                                        {{ formatDuration(w * 60) }} → {{ formatDuration(plan.suggested[i] * 60) }}
                                   </span>
                              </div>
                         </div>
                    </div>
               </div>

               <div class="mt-3 flex flex-wrap items-center gap-3">
                    <button type="button"
                         class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-4 min-h-11"
                         @click="dismiss">Not now</button>
                    <a v-if="citation" :href="citation.url" target="_blank" rel="noopener noreferrer"
                         class="text-sky-400 hover:text-sky-300 underline underline-offset-2 text-xs">
                         Why we're saying this ({{ citation.org }} <span aria-hidden="true">↗</span>)
                    </a>
               </div>
               <p class="text-muted text-[11px] mt-2">
                    Tier 3 — practitioner convention, not validated medicine. An offer, never a command.
               </p>
          </div>

          <!-- Quiet "watching" state + self-report entry (no cluster yet, or dismissed). -->
          <div v-else-if="showWatch" class="mt-2">
               <p class="text-muted text-xs">
                    Watching for the <strong class="text-slate-300">{{ result.label }}</strong> transition
                    from your logs. Nothing to change yet — one rough day isn't a transition.
               </p>
               <button type="button"
                    class="mt-1 inline-flex items-center min-h-11 text-sky-400 hover:text-sky-300 underline underline-offset-2 text-xs"
                    :aria-expanded="reportOpen" @click="reportOpen = !reportOpen">
                    {{ reportOpen ? 'Hide' : 'Not sure? Tell us what you\'re seeing' }}
               </button>
          </div>

          <!-- Self-report toggles: a log-free path into detection. Shown when the
               parent opens the disclosure, or whenever the prompt is up so they can
               refine it. -->
          <fieldset v-if="reportOpen || showPrompt" class="mt-2 border border-slate-800 rounded p-3">
               <legend class="text-slate-400 text-xs px-1">Over the past week, are you seeing…</legend>
               <label v-for="t in signalToggles" :key="t.key"
                    class="flex items-center gap-2 text-sm text-slate-300 py-1 min-h-11 cursor-pointer">
                    <input type="checkbox" class="h-5 w-5 accent-amber-400" v-model="manual[t.key]" />
                    {{ t.label }}
               </label>
               <p class="text-muted text-[11px] mt-1">
                    Self-reported signs count alongside your logs. Nothing leaves your device.
               </p>
          </fieldset>
     </section>
</template>
