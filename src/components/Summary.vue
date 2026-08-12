<script setup lang="ts">
import { computed, ref } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { SleepRecommendationRepository } from '../models/SleepRecommendations';
import { formatClock, formatClockRange, formatDuration } from '../models/time';
import { getSource } from '../models/Citations';
import { effectiveGuidanceMode, windowSlopMinutes } from '../models/GuidanceMode';
import {
  addSibling,
  planLink,
  removeSibling,
  schedule,
  shiftMode,
  sibling,
  sitterMode,
} from '../stores/plan';
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
import WindowMechanics from './WindowMechanics.vue'
import NapCaps from './NapCaps.vue'
import PersonalizedWindows from './PersonalizedWindows.vue'
import SiblingAlignment from './SiblingAlignment.vue'
import logoUrl from '../assets/logo.png'
import sunUrl from '../assets/sun.png'
import moonUrl from '../assets/moon.png'
import napUrl from '../assets/sleeping-baby2.png'

const repo = new SleepRecommendationRepository();
const sleepRecommendations = repo.recommendations;

// @doc:shareable-plan-url @doc:sibling-twins-alignment @doc:read-only-babysitter-mode
// Plan state, the sibling, the DST preset and the address-bar sync all live in
// stores/plan.ts — one reactive plan that every panel reads, so the calendar
// export and handoff recap can't drift from what is on screen here.

// @doc:accessibility-dark-room
// Text alternative for the 24h bar: the day arc in words, hours spelled out
// so screen readers don't announce a bare "h".
const barLabel = computed(() =>
  `Day at a glance: ${schedule.totalWakeTime} hours awake, ${schedule.totalNightSleep} hours night sleep, ${schedule.totalNap} hours of naps.`);

// @doc:24h-visual-day-breakdown
// Segment width as a share of the day. Clamped at zero because an impossible
// plan (wake windows longer than the waking day) makes totalNap negative, and a
// negative width is an invalid declaration — the browser drops it and the
// segment sizes to its content, drawing nap time that doesn't exist. The
// warning row below says what went wrong; the bar just shows nothing.
function barPct(hours: number): string {
  return `${Math.max(0, hours / 24) * 100}%`;
}

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

// @doc:read-only-babysitter-mode
// Built from the same canonical query as the address bar, so the sitter link
// carries the whole plan — sibling (bd2/s2), DST preset, and atypical flag.
const sitterLink = computed(() => planLink({ view: 'sitter' }));

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
  <h1>
    <img class="h-20 mb-2" :src="logoUrl" alt="Wake Windows" width="70" height="80"
      fetchpriority="high">
    <span class="sr-only">Infant Nap Schedule &amp; Wake Windows Planner</span>
  </h1>


  <!-- 3fr/7fr, not 30%/70%: percentage tracks are measured against the whole
       container, so 30% + 70% + a 24px gap comes to 24px MORE than there is
       room for. That overflow is invisible at most sizes because the page is
       capped at max-w-3xl and the slack lives in the margins — but at exactly
       768px the viewport IS the cap, and iPad portrait got a horizontal
       scrollbar. fr units divide what is left after the gap, so they can't.
       min-w-0 on both columns for the matching reason: a grid item defaults to
       min-width:auto and will refuse to shrink below a native date input. -->
  <div class="grid grid-cols-1 gap-6 md:grid-cols-[3fr_7fr] w-full md:items-start">

    <div class="pr-2 min-w-0">

      <h2 v-if="sibling" class="text-slate-400 text-sm uppercase font-normal mb-2">Baby A</h2>
      <ChildInputs :schedule="schedule" id-prefix="" />

      <!-- @doc:sibling-twins-alignment — second child is opt-in; single-child
           stays the default UX. -->
      <div v-if="!sibling" class="mt-6">
        <button type="button" class="btn btn-quiet"
          v-on:click="addSibling">+ Add sibling / twin</button>
        <p class="text-muted text-xs mt-1">
          Plan two children together and see when their naps line up.
        </p>
      </div>

      <div v-if="sibling" class="mt-6 border-t border-slate-800 pt-4">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-slate-400 text-sm uppercase font-normal">Baby B</h2>
          <button type="button" class="btn btn-quiet text-slate-300"
            v-on:click="removeSibling">Remove</button>
        </div>
        <ChildInputs :schedule="sibling" id-prefix="b-" />
      </div>

      <!-- @doc:atypical-day-flag -->
      <AtypicalDayFlag :schedule="schedule" />

    </div>
    <div class="min-w-0">

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

      <!-- @doc:24h-visual-day-breakdown @doc:accessibility-dark-room
           Each band is its own @container, so what it can show depends on how
           wide THAT band is rather than on the viewport: a 4h nap band is ~100px
           on a laptop and ~57px on a phone, and the figure used to be clipped at
           every phone width. It degrades in steps instead of falling off a cliff:
           under 80px the figure steps down to text-sm and the row centres, under
           72px the decorative icon is dropped, and only under 28px — where
           nothing legible fits at all — does the figure go too. The two
           thresholds differ because once the figure is small, an icon still fits
           (32 + 4 + a ~32px "3.5h" = 68). Note the query measures the CONTENT
           box, so these numbers sit inside the px-1.5 padding.
           A band is never allowed to be the only place a number exists: the
           Sleep Stats table directly below carries all three, and so does the
           aria-label.
           The width transition animates a layout property on purpose — width IS
           the data here, and scaling would distort the icon and the digits.
           Three boxes, one row, 300ms, input-driven: a bounded exception. -->
      <div class="flex mt-4 h-10" role="img" :aria-label="barLabel">

        <div
          class="@container bg-orange-500 rounded-l-lg flex items-center justify-between @max-[80px]:justify-center gap-1 px-1.5 overflow-hidden min-w-0 motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          :style="{ width: barPct(schedule.totalWakeTime) }">
          <img :src="sunUrl" class="h-8 w-8 shrink-0 @max-[72px]:hidden" alt="" aria-hidden="true" width="32"
            height="32" />
          <span
            class="text-xl @max-[80px]:text-sm @max-[28px]:hidden text-slate-950 font-semibold tabular-nums">{{
              schedule.totalWakeTime }}h</span>
        </div>

        <div
          class="@container bg-cyan-500 flex items-center justify-between @max-[80px]:justify-center gap-1 px-1.5 overflow-hidden min-w-0 motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          :style="{ width: barPct(schedule.totalNightSleep) }">
          <img :src="moonUrl" class="h-8 w-8 shrink-0 @max-[72px]:hidden" alt="" aria-hidden="true" width="32"
            height="32" />
          <span
            class="text-xl @max-[80px]:text-sm @max-[28px]:hidden text-slate-950 font-semibold tabular-nums">{{
              schedule.totalNightSleep }}h</span>
        </div>

        <div
          class="@container bg-violet-500 rounded-r-lg flex items-center justify-between @max-[80px]:justify-center gap-1 px-1.5 overflow-hidden min-w-0 motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out"
          :style="{ width: barPct(schedule.totalNap) }">
          <img :src="napUrl" class="h-8 w-8 shrink-0 @max-[72px]:hidden" alt="" aria-hidden="true" width="32"
            height="32" />
          <span
            class="text-xl @max-[80px]:text-sm @max-[28px]:hidden text-slate-950 font-semibold tabular-nums">{{
              schedule.totalNap }}h</span>
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
          <span class="flex items-center gap-2"><img :src="sunUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20"
              height="20" /> Wake</span>
          <span class="tabular-nums">{{ formatClock(schedule.wakeMinutes) }}</span>
        </div>
        <!-- @doc:anti-anxiety-mechanics — ranges, not a stopwatch.
             @doc:cues-vs-clock-mode @doc:atypical-day-flag — cues-led modes and
             atypical days widen these windows further (napWindowsAt). -->
        <div v-for="(win, i) in napWins" :key="i"
          class="flex justify-between gap-3 text-sm py-1 border-t border-slate-800 text-slate-300">
          <span class="flex items-center gap-2 shrink-0"><img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true"
              width="20" height="20" /> Nap {{ i + 1
            }}</span>
          <span class="text-right">aim for roughly <span class="tabular-nums">{{ formatClockRange(win.earliest, win.latest)
            }}</span> <span class="text-muted whitespace-nowrap">· about {{ formatDuration(win.lengthMinutes) }}</span></span>
        </div>
        <div class="flex justify-between text-sm py-1 border-t border-slate-800 text-slate-300">
          <span class="flex items-center gap-2"><img :src="moonUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20"
              height="20" /> Bedtime</span>
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

        <!-- The two definitional FAQs that belong right next to the schedule
             they apply to: where a window starts/ends, and whether to cap naps. -->
        <div class="mt-2">
          <WindowMechanics />
        </div>
        <div class="mt-2">
          <NapCaps />
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
        <button type="button" class="btn btn-quiet"
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
