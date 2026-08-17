<script setup lang="ts">
import { computed, markRaw, nextTick, ref, watch } from 'vue'
import { schedule } from '../stores/plan'
import { openTopic } from '../stores/tabs'
import { openSheet } from '../stores/sheet'
import { effectiveGuidanceMode, windowSlopMinutes } from '../models/GuidanceMode'
import { SleepRecommendationRepository } from '../models/SleepRecommendations'
import { getTier } from '../models/Citations'
import TierBadge from '../components/TierBadge.vue'
import SafeSleep from '../components/SafeSleep.vue'
import EvidenceGuidance from '../components/EvidenceGuidance.vue'
import OvertiredUndertired from '../components/OvertiredUndertired.vue'
import RegressionExplainer from '../components/RegressionExplainer.vue'
import SleepTrainingOverview from '../components/SleepTrainingOverview.vue'
import ContactNaps from '../components/ContactNaps.vue'
import DaycareGuidance from '../components/DaycareGuidance.vue'
import Troubleshooter from '../components/Troubleshooter.vue'
import HowCalculated from '../components/HowCalculated.vue'
import WindowMechanics from '../components/WindowMechanics.vue'
import NapCaps from '../components/NapCaps.vue'
import FaqPanel from '../components/FaqPanel.vue'
import Recommendations from '../components/Recommendations.vue'
import SourcesEvidence from '../components/SourcesEvidence.vue'
import AboutAuthor from '../components/AboutAuthor.vue'
import AccessibilityStatement from '../components/AccessibilityStatement.vue'

// @doc:methodology-sources-page @doc:evidence-tier-badges-citations
// @doc:sleepy-cues-reference @doc:safe-sleep-panel
//
// Learn. Everything demoted from the home screen, as a library.
//
// This is where the redesign's weight went. Fourteen cited guidance panels used
// to sit open, stacked, below the schedule — which meant the app looked like it
// had fourteen things to tell you the moment you opened it, none of them the one
// you came for. They are all still here, unedited, one tap away, and reading one
// changes nothing about your plan (which the intro says out loud, because a
// parent burned by other apps will assume otherwise).
//
// Each entry carries the tier of the claim it makes, on the card, before you
// open it — so "how hard should I hold this" is answered before you read a word.

const repo = new SleepRecommendationRepository()

const guidanceMode = computed(() => effectiveGuidanceMode(schedule.monthsSinceBirth, schedule.atypical))
const windowSlop = computed(() => windowSlopMinutes(guidanceMode.value))

interface Topic {
  id: string
  title: string
  sub: string
  /** Tier of the claim, or null where the entry is about the app rather than
   * about sleep — a badge there would be claiming evidence for a colophon. */
  tier: number | null
  component: unknown
  props?: () => Record<string, unknown>
}

const TOPICS: Topic[] = [
  {
    id: 'safe-sleep',
    title: 'Safe sleep basics',
    sub: 'The short version, written to be re-read at 3am.',
    tier: 1,
    component: markRaw(SafeSleep),
  },
  {
    id: 'cues',
    title: 'Sleepy cues, in order',
    sub: 'What to watch for before the clock says so — and the evidence behind each number in your plan.',
    tier: 2,
    component: markRaw(EvidenceGuidance),
    props: () => ({ months: schedule.monthsSinceBirth }),
  },
  {
    id: 'overtired',
    title: 'Overtired or undertired?',
    sub: 'Telling the two apart when a nap goes wrong. The fix is opposite in each case.',
    tier: 2,
    component: markRaw(OvertiredUndertired),
  },
  {
    id: 'four-month',
    title: 'The 4-month change',
    sub: 'Why it is a progression, not a regression — and why the later ones are weakly supported.',
    tier: 1,
    component: markRaw(RegressionExplainer),
  },
  {
    id: 'sleep-training',
    title: 'Sleep-training methods',
    sub: 'A neutral menu of the approaches, what the evidence shows, and the cortisol myth.',
    tier: 1,
    component: markRaw(SleepTrainingOverview),
  },
  {
    id: 'contact-naps',
    title: 'Contact naps',
    sub: 'Held sleep is real sleep. What it does and does not cost you.',
    tier: 2,
    component: markRaw(ContactNaps),
  },
  {
    id: 'daycare',
    title: 'Daycare days',
    sub: 'When their room runs on its own clock and yours has to bend.',
    tier: 2,
    component: markRaw(DaycareGuidance),
  },
  {
    id: 'troubleshooter',
    title: 'Something is going wrong',
    sub: 'Early rising, short naps, false starts and split nights — walked through question by question.',
    tier: 3,
    component: markRaw(Troubleshooter),
  },
  {
    id: 'how-calculated',
    title: 'How your plan is calculated',
    sub: 'Your own numbers, added up, with nothing in between.',
    tier: null,
    component: markRaw(HowCalculated),
    props: () => ({ schedule, slopMinutes: windowSlop.value }),
  },
  {
    id: 'window-mechanics',
    title: 'Where a wake window starts and ends',
    sub: 'The definitional one: does it start when they wake, or when you get them up?',
    tier: 2,
    component: markRaw(WindowMechanics),
  },
  {
    id: 'nap-caps',
    title: 'Should I cap a nap?',
    sub: 'When to wake a sleeping baby, and when to leave well alone.',
    tier: 2,
    component: markRaw(NapCaps),
  },
  {
    id: 'faq',
    title: 'Parents ask',
    sub: 'The catalogue of questions, each with a tier and a source.',
    tier: 1,
    component: markRaw(FaqPanel),
  },
  {
    id: 'compare',
    title: 'How your plan compares, source by source',
    sub: 'The full table: every published bracket for this age, next to your day.',
    tier: 1,
    component: markRaw(Recommendations),
    props: () => ({ sleepSchedule: schedule, recommendations: repo.recommendations }),
  },
  {
    id: 'sources',
    title: 'Where these numbers come from',
    sub: 'The whole citation library, by tier, with working links.',
    tier: 1,
    component: markRaw(SourcesEvidence),
  },
  {
    id: 'author',
    title: 'Who made this',
    sub: 'A parent of twins, not a clinic.',
    tier: null,
    component: markRaw(AboutAuthor),
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    sub: 'What this app commits to, and what it has actually been measured against.',
    tier: null,
    component: markRaw(AccessibilityStatement),
  },
]

const current = computed(() => TOPICS.find((t) => t.id === openTopic.value) ?? null)

// The badge says "Tier 2"; this says what Tier 2 means. Spelling it out beside
// the badge on the article itself saves the reader a trip to the explainer to
// answer the only question the badge raises.
const tierMeaning = computed(() =>
  current.value?.tier != null ? getTier(current.value.tier).label : '')

// Opening an article replaces the screen, so focus has to follow it — otherwise
// a keyboard user's focus stays on a button that no longer exists and lands back
// at the top of the document. Closing has to put it back on the card they came
// from, or "← All topics" drops them at the top of a sixteen-item list with no
// memory of where they were.
//
// Not `immediate`: a deep link (?topic=…) should land the reader at the top of
// the article to read, not move focus for them before they have touched
// anything. Focus follows an action; arriving is not an action.
const article = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null

function openArticle(id: string, event: MouseEvent) {
  opener = event.currentTarget as HTMLElement | null
  openTopic.value = id
}

async function closeArticle() {
  const returnTo = opener
  openTopic.value = null
  opener = null
  await nextTick()
  returnTo?.focus()
}

watch(current, async (value) => {
  if (value) {
    await nextTick()
    article.value?.focus()
  }
})

function openTiers() {
  openSheet({
    tier: 1,
    title: 'What the tiers mean',
    body: [
      'Tier 1 — evidence-based. Backed by peer-reviewed research or a professional body such as '
      + 'the AAP. Total sleep, nap counts and safe-sleep guidance sit here.',
      'Tier 2 — practice-based heuristic. Widely used by clinicians and sleep consultants, but not '
      + 'established by trial. Wake-window minutes and nap-transition methods sit here.',
      'Tier 3 — practitioner convention. A plausible mechanism with no direct study of the '
      + 'specific protocol, like the ~15 min/day daylight-saving ramp.',
      'Every number in this app is labelled so you know how hard to hold it. Nothing here is '
      + 'medical advice, and nothing about your baby leaves your phone.',
    ],
    sourceNote: 'Full source list under “Where these numbers come from”.',
  })
}
</script>

<template>
  <div v-if="!current" class="space-y-5">
    <div class="space-y-2">
      <h2 class="display text-3xl text-slate-200 lg:text-4xl">Learn</h2>
      <p class="text-slate-300 leading-relaxed text-pretty max-w-[62ch]">
        Short answers, written for 3am. Every claim carries an evidence tier so you know how hard
        to hold it. Nothing here changes your plan.
      </p>
    </div>

    <!-- A grid, not a list, once there is room: sixteen full-width rows is a
         scroll, sixteen cards is a library you can scan. The tier badge sits
         ABOVE the title so the strength of the claim is read before the claim. -->
    <ul class="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="topic in TOPICS" :key="topic.id" class="flex">
        <button type="button"
          class="card flex w-full flex-col items-start gap-2 p-5 text-left hover:border-line-strong"
          v-on:click="openArticle(topic.id, $event)">
          <TierBadge v-if="topic.tier !== null" :tier="topic.tier" />
          <span class="display text-xl text-slate-200 text-pretty">{{ topic.title }}</span>
          <span class="text-sm text-muted leading-relaxed text-pretty">{{ topic.sub }}</span>
        </button>
      </li>
    </ul>

    <button type="button" class="btn-inline no-underline" v-on:click="openTiers">
      What do the tiers mean?
    </button>
  </div>

  <!-- An article is prose, so it is capped at a readable measure rather than
       stretched across the full width the grid above uses. -->
  <div v-else ref="article" tabindex="-1" class="space-y-4 max-w-[680px]">
    <button type="button" class="btn-inline no-underline" v-on:click="closeArticle">
      ← All topics
    </button>
    <h2 class="display text-3xl text-slate-200 text-pretty lg:text-4xl">{{ current.title }}</h2>
    <div v-if="current.tier !== null" class="flex flex-wrap items-center gap-2.5">
      <TierBadge :tier="current.tier" />
      <span class="text-xs text-muted">{{ tierMeaning }}</span>
    </div>
    <component :is="current.component" v-bind="current.props ? current.props() : {}" />
    <button type="button" class="btn-inline no-underline" v-on:click="openTiers">
      What do the tiers mean?
    </button>
  </div>
</template>
