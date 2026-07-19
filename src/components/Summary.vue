<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { type DstMode, dstModeFromParam, dstModeToParam } from '../models/DstShift'
import { SleepRecommendationRepository } from '../models/SleepRecommendations';
import { formatClock, formatClockRange, formatDuration } from '../models/time';
import { getSource } from '../models/Citations';
import { applyPlanParams, buildPlanQuery, hasSiblingParams, withPlanExtras } from '../models/planUrl';
import { effectiveGuidanceMode, windowSlopMinutes, isAtypicalReason } from '../models/GuidanceMode';
import Recommendations from './Recommendations.vue'
import DstShift from './DstShift.vue'
import EvidenceGuidance from './EvidenceGuidance.vue'
import GuidanceBanner from './GuidanceBanner.vue'
import AtypicalDayFlag from './AtypicalDayFlag.vue'
import SafeSleep from './SafeSleep.vue'
import SourcesEvidence from './SourcesEvidence.vue'
import SitterView from './SitterView.vue'
import Troubleshooter from './Troubleshooter.vue'
import ChildInputs from './ChildInputs.vue'
import HowCalculated from './HowCalculated.vue'
import PersonalizedWindows from './PersonalizedWindows.vue'
import SiblingAlignment from './SiblingAlignment.vue'
import logoUrl from '../assets/logo.png'
import sunUrl from '../assets/sun.png'
import moonUrl from '../assets/moon.png'
import napUrl from '../assets/sleeping-baby2.png'

const repo = new SleepRecommendationRepository();
const sleepRecommendations = repo.recommendations;

// @doc:shareable-plan-url
// Plan state is read from (and written to) the URL query string, so a plan is
// shareable by link with no account.
const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());

// @doc:read-only-babysitter-mode
// `?view=sitter` renders the shared plan read-only: next nap and bedtime up
// front plus today's schedule, with every edit control removed. Same URL-state
// foundation as the shareable plan link — no account, works in any browser.
const sitterMode = params.view === 'sitter';

const schedule = reactive(new ScheduleSetting());
applyPlanParams(schedule, params.bd, params.s);

// @doc:atypical-day-flag @doc:shareable-plan-url
// `?at=<reason>` marks today atypical; an unknown reason still flags the day,
// just filed under "other". Rides the same query string as the plan.
if (params.at) {
  schedule.atypical = true;
  schedule.atypicalReason = isAtypicalReason(params.at) ? params.at : 'other';
}

// @doc:sibling-twins-alignment
// A second child (sibling/twin) is opt-in and rides the same query string as
// bd2/s2; old single-child links parse unchanged. Both schedules are full
// ScheduleSetting instances, so different ages/nap counts fall out for free.
const sibling = ref<ScheduleSetting | null>(null);
if (hasSiblingParams(params)) {
  const second = reactive(new ScheduleSetting());
  applyPlanParams(second, params.bd2, params.s2);
  sibling.value = second;
}

// Seed the new sibling from Baby A — for twins (the primary case) the
// birthday, gestational age, and schedule start out identical.
function addSibling() {
  const second = reactive(new ScheduleSetting());
  second.birthdayDate = schedule.birthdayDate;
  second.weeks = schedule.weeks;
  second.dwt = schedule.dwt;
  second.bed = schedule.bed;
  second.wws = [...schedule.wws];
  sibling.value = second;
}

function removeSibling() {
  sibling.value = null;
}

// @doc:dst-timezone-shift @doc:shareable-plan-url
// The selected DST preset rides the same query string (`shift=spring|fall`),
// so a shared link shows both caregivers the identical step plan.
const shiftMode = ref<DstMode | null>(dstModeFromParam(params.shift));
const shiftParam = computed(() => dstModeToParam(shiftMode.value));

// @doc:accessibility-dark-room
// Text alternative for the 24h bar: the day arc in words, hours spelled out
// so screen readers don't announce a bare "h".
const barLabel = computed(() =>
  `Day at a glance: ${schedule.totalWakeTime} hours awake, ${schedule.totalNightSleep} hours night sleep, ${schedule.totalNap} hours of naps.`);

function warningsFor(s: ScheduleSetting): string[] {
  const warnings: string[] = [];
  if (s.totalNap < 0) {
    warnings.push("Total nap time is negative. Your wake windows may be too long for the given wake time and bedtime.");
  }
  if (s.totalNightSleep < 0) {
    warnings.push("Night sleep is negative. Check your desired wake time and bedtime.");
  }
  if (s.totalNightSleep > 14) {
    warnings.push("Night sleep exceeds 14 hours. Check your desired wake time and bedtime.");
  }
  if (s.weeks < 20 || s.weeks > 44) {
    warnings.push("Weeks in womb should typically be between 20 and 44.");
  }
  return warnings;
}

const scheduleWarnings = computed(() => warningsFor(schedule));
const siblingWarnings = computed(() =>
  sibling.value ? warningsFor(sibling.value).map(w => `Baby B: ${w}`) : []);

// @doc:shareable-plan-url @doc:sibling-twins-alignment
// One or both children serialize through buildPlanQuery (bd/s, plus bd2/s2
// when a sibling is on the plan); the DST preset rides along unchanged.
const planQuery = computed(() => buildPlanQuery(schedule, sibling.value));

// @doc:atypical-day-flag — today's flag rides the plan URL too (`at=<reason>`).
const atParam = computed(() => schedule.atypical ? (schedule.atypicalReason || 'other') : '');

// In sitter mode nothing is editable, so skip URL rewriting entirely — it
// would also strip the `view=sitter` param from the shared link.
if (!sitterMode) {
  // Debounce the writes: a held number-input spinner or fast typing would
  // otherwise fire history.replaceState per tick, and Safari throws after ~100
  // calls / 30s, which would kill URL syncing for the rest of the session.
  let urlWriteTimer: ReturnType<typeof setTimeout> | undefined;
  watch([planQuery, shiftParam, atParam], ([query, shift, at]) => {
    clearTimeout(urlWriteTimer);
    urlWriteTimer = setTimeout(() => {
      history.replaceState(null, "", withPlanExtras(query, { shift, at }));
    }, 250);
  }, { immediate: true });
}

// @doc:read-only-babysitter-mode
// Built from the same canonical query as the address bar (withPlanExtras), so
// the sitter link carries the whole plan — sibling (bd2/s2), DST preset, and
// atypical flag — and can't drift from what the parent sees.
const sitterLink = computed(() =>
  `${location.origin}${location.pathname}${withPlanExtras(planQuery.value, { shift: shiftParam.value, at: atParam.value, view: 'sitter' })}`);

const copyState = ref<'idle' | 'copied' | 'failed'>('idle');
async function copySitterLink() {
  try {
    await navigator.clipboard.writeText(sitterLink.value);
    copyState.value = 'copied';
  } catch {
    // Clipboard can be unavailable (permissions, non-secure context); show the
    // link itself so it can be copied by hand.
    copyState.value = 'failed';
  }
}

// @doc:anti-anxiety-mechanics
// Nap starts render as ranges (ScheduleSetting.napWindowsAt), never a single
// to-the-minute target; the reassurance line cites normal day-to-day
// variation. No streaks, scores, or grades anywhere in this app.
const iglowstein = getSource('iglowstein-2003');

// @doc:cues-vs-clock-mode @doc:atypical-day-flag
// Guidance mode keys off Baby A's corrected age; an atypical day drops to
// cues-first regardless of age. Cues-led modes widen the displayed ranges and
// lift the evidence guidance above the clock schedule.
const guidanceMode = computed(() => effectiveGuidanceMode(schedule.monthsSinceBirth, schedule.atypical));
const windowSlop = computed(() => windowSlopMinutes(guidanceMode.value));
const napWins = computed(() => schedule.napWindowsAt(windowSlop.value));
const bedtimeWin = computed(() => schedule.bedtimeWindowAt(windowSlop.value));
const cuesFirst = computed(() => guidanceMode.value !== 'clock');
</script>

<template>
  <!-- @doc:read-only-babysitter-mode — sitter mode renders only the read-only
       view; none of the edit controls below exist in its DOM. -->
  <SitterView v-if="sitterMode" :schedule="schedule" :sibling="sibling" />

  <template v-else>
  <h1><img class="h-20 mb-2" :src="logoUrl" alt="Wake Windows"></h1>


  <div class="grid grid-cols-1 gap-6 md:grid-cols-[30%_70%] w-full md:items-start">

    <div class="pr-2">

      <h2 v-if="sibling" class="text-slate-400 text-sm uppercase font-normal mb-2">Baby A</h2>
      <ChildInputs :schedule="schedule" id-prefix="" />

      <!-- @doc:sibling-twins-alignment — second child is opt-in; single-child
           stays the default UX. -->
      <div v-if="!sibling" class="mt-6">
        <button type="button"
          class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-4 min-h-11"
          v-on:click="addSibling">+ Add sibling / twin</button>
        <p class="text-muted text-xs mt-1">
          Plan two children together and see when their naps line up.
        </p>
      </div>

      <div v-if="sibling" class="mt-6 border-t border-slate-800 pt-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-slate-400 text-sm uppercase font-normal">Baby B</h2>
          <button type="button"
            class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded px-3 min-h-9"
            v-on:click="removeSibling">Remove</button>
        </div>
        <ChildInputs :schedule="sibling" id-prefix="b-" />
      </div>

      <!-- @doc:atypical-day-flag -->
      <AtypicalDayFlag :schedule="schedule" />

    </div>
    <div>

      <div class="flex flex-col sm:flex-row">
        <div class="basis-1/2">
          <h2 class="text-slate-400 text-sm uppercase font-normal">Summary</h2>

          <div class="text-xl tabular-nums">
            <strong>{{ schedule.dwt }}</strong>-<span v-for="(find, index) in schedule.wws" class="text-muted">
              <span v-if="find" class="text-slate-200">{{ find }}</span><span
                v-if="index != schedule.wws.length - 1">/</span></span>-<strong>{{ schedule.bed }}</strong>
          </div>
        </div>
        <div>
          <h2 class="text-slate-400 text-sm uppercase font-normal">Age</h2>
          {{ schedule.weeksSinceBirth }} weeks / {{ schedule.monthsSinceBirth }} months
        </div>
      </div>

      <!-- @doc:cues-vs-clock-mode @doc:atypical-day-flag -->
      <div class="mt-4">
        <GuidanceBanner :months="schedule.monthsSinceBirth" :atypical="schedule.atypical"
          :atypical-reason="schedule.atypicalReason" />
      </div>

      <!-- @doc:24h-visual-day-breakdown @doc:accessibility-dark-room -->
      <div class="flex mt-4 h-10" role="img" :aria-label="barLabel">

        <div
          class="bg-orange-500 rounded-l-lg flex items-center justify-between gap-1 px-1.5 overflow-hidden min-w-0 motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          :style="{ width: `${(schedule.totalWakeTime / 24) * 100}%` }">
          <img :src="sunUrl" class="h-8 w-8 shrink-0" alt="" aria-hidden="true" />
          <span class="text-xl text-slate-900 font-semibold tabular-nums">{{ schedule.totalWakeTime }}h</span>
        </div>

        <div
          class="bg-cyan-500 flex items-center justify-between gap-1 px-1.5 overflow-hidden min-w-0 motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          :style="{ width: `${(schedule.totalNightSleep / 24) * 100}%` }">
          <img :src="moonUrl" class="h-8 w-8 shrink-0" alt="" aria-hidden="true" />
          <span class="text-xl text-slate-900 font-semibold tabular-nums">{{ schedule.totalNightSleep }}h</span>
        </div>

        <div
          class="bg-violet-500 rounded-r-lg flex items-center justify-between gap-1 px-1.5 overflow-hidden min-w-0 motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          :style="{ width: `${(schedule.totalNap / 24) * 100}%` }">
          <img :src="napUrl" class="h-8 w-8 shrink-0" alt="" aria-hidden="true" />
          <span class="text-xl text-slate-900 font-semibold tabular-nums">{{ schedule.totalNap }}h</span>
        </div>
      </div>

      <div aria-live="polite" class="mt-4 empty:mt-0">
        <div v-for="warning in [...scheduleWarnings, ...siblingWarnings]" :key="warning"
          class="text-amber-400 text-sm p-2 bg-amber-400/10 rounded mb-1">
          &#9888;&#65039; {{ warning }}
        </div>
      </div>

      <!-- @doc:sibling-twins-alignment — stacked dual-track day view with the
           shared quiet block highlighted. -->
      <div v-if="sibling" class="mt-6">
        <SiblingAlignment :a="schedule" :b="sibling" />
      </div>

      <div class="mt-4">
        <h2 class="text-slate-400 text-sm uppercase font-normal">Sleep Stats</h2>
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

      <!-- @doc:cues-vs-clock-mode — cues-led modes foreground the sleepy-cues /
           evidence guidance above the clock schedule; clock mode keeps it below. -->
      <div v-if="cuesFirst" class="mt-6">
        <EvidenceGuidance :months="schedule.monthsSinceBirth" />
      </div>

      <div v-if="schedule.napTimes.length" class="mt-4">
        <h2 class="text-slate-400 text-sm uppercase font-normal">Nap Schedule</h2>
        <div class="flex justify-between text-sm py-1 text-slate-300">
          <span class="flex items-center gap-2"><img :src="sunUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Wake</span>
          <span class="tabular-nums">{{ formatClock(schedule.wakeMinutes) }}</span>
        </div>
        <!-- @doc:anti-anxiety-mechanics — ranges, not a stopwatch.
             @doc:cues-vs-clock-mode @doc:atypical-day-flag — cues-led modes and
             atypical days widen these windows further (napWindowsAt). -->
        <div v-for="(win, i) in napWins" :key="i"
          class="flex justify-between gap-3 text-sm py-1 border-t border-slate-800 text-slate-300">
          <span class="flex items-center gap-2 shrink-0"><img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Nap {{ i + 1
            }}</span>
          <span class="text-right">aim for roughly <span class="tabular-nums">{{ formatClockRange(win.earliest, win.latest)
            }}</span> <span class="text-muted whitespace-nowrap">· about {{ formatDuration(win.lengthMinutes) }}</span></span>
        </div>
        <div class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300">
          <span class="flex items-center gap-2"><img :src="moonUrl" class="h-5 w-5" alt="" aria-hidden="true" /> Bedtime</span>
          <span class="tabular-nums">{{ guidanceMode === 'clock'
            ? formatClock(schedule.bedtimeMinutes)
            : formatClockRange(bedtimeWin.earliest, bedtimeWin.latest) }}</span>
        </div>
        <p v-if="cuesFirst" class="text-muted text-xs mt-2">
          Loose windows — start settling when you see sleepy cues, even if the clock disagrees.
        </p>
        <p class="text-muted text-xs mt-2">
          Anywhere in a window counts — these are ranges, not deadlines. Missing one doesn't set your baby
          back; healthy babies vary widely from day to day
          <a v-if="iglowstein" :href="iglowstein.url" target="_blank" rel="noopener noreferrer"
            class="text-sky-400 hover:text-sky-300 underline underline-offset-2">(Iglowstein 2003 <span
              aria-hidden="true">↗</span>)</a>.
        </p>

        <!-- @doc:no-ai-no-data-training — the plan's arithmetic spelled out
             with the user's own numbers, reachable right from the schedule. -->
        <div class="mt-3">
          <HowCalculated :schedule="schedule" :slop-minutes="windowSlop" />
        </div>
      </div>

      <!-- @doc:personalized-from-local-history — optional, opt-in refinement of
           the wake windows from the baby's own logged history. Off by default;
           the age plan above is complete without it. -->
      <div class="mt-6">
        <PersonalizedWindows :schedule="schedule" />
      </div>

      <!-- @doc:dst-timezone-shift -->
      <div class="mt-6">
        <DstShift :schedule="schedule" v-model="shiftMode" />
      </div>

      <!-- @doc:read-only-babysitter-mode -->
      <div class="mt-6">
        <h2 class="text-slate-400 text-sm uppercase font-normal">Handing off?</h2>
        <p class="text-muted text-xs mb-2">
          Send a read-only link to a sitter or grandparent — today's plan with the next nap and bedtime
          up front. Opens in any browser; nothing they can edit, no account needed.
        </p>
        <button type="button"
          class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-4 min-h-11"
          v-on:click="copySitterLink">Copy sitter link</button>
        <span v-if="copyState === 'copied'" role="status" class="ml-2 text-emerald-400 text-sm">Copied!</span>
        <p v-if="copyState === 'failed'" class="text-slate-300 text-xs mt-2 break-all select-all">{{ sitterLink }}</p>
      </div>

      <div class="mt-6">
        <SafeSleep />
      </div>

      <div v-if="!cuesFirst" class="mt-6">
        <EvidenceGuidance :months="schedule.monthsSinceBirth" />
      </div>

      <div class="mt-6">
        <h2 class="text-slate-400 text-sm uppercase font-normal">How your plan compares</h2>
        <p class="text-muted text-xs mb-2">
          Total-sleep and nap counts are evidence-based (Tier 1). Wake-window timing is a practice-based
          heuristic (Tier 2) — a starting estimate, not a rule. Watch your baby's tiredness cues over the clock.
        </p>
        <Recommendations :sleep-schedule="schedule" :recommendations="sleepRecommendations" />
      </div>

      <!-- @doc:interactive-troubleshooter — placed after the comparison table
           because leaves reference "how your plan compares, above". -->
      <div class="mt-6">
        <Troubleshooter />
      </div>

      <div class="mt-6">
        <SourcesEvidence />
      </div>

    </div>
  </div>
  </template>
</template>
