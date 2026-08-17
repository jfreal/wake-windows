<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { SleepRecommendationRepository } from '../models/SleepRecommendations'
import { bandGeometry, hoursText, type BandGeometry } from '../models/today'
import { formatDuration } from '../models/time'
import { openSheet, type SheetContent } from '../stores/sheet'
import TierWhyButton from './TierWhyButton.vue'

// @doc:evidence-tier-badges-citations @doc:anti-anxiety-mechanics
//
// "Is today normal?" — answered as three ranges rather than three verdicts.
//
// The old comparison table gave a per-source pass/fail per metric. This says the
// same thing in the shape the claim actually has: a WIDE band of normal with the
// parent's own day marked inside it. That is not decoration — the whole Tier 1
// finding here is that healthy infants vary enormously, and a table of green
// ticks and amber warnings quietly asserts the opposite by implying a target.
//
// Out-of-range is stated plainly and calmly, in the same ink as everything else.
// No red, no alarm, no score.

const props = defineProps<{ schedule: ScheduleSetting }>()

const repo = new SleepRecommendationRepository()

// The Tier 1 source (AAP / Sleep Foundation consensus ranges) is the only one
// that spans the whole age range, and it is the only one whose numbers are
// strong enough to draw as "normal". The Tier 2 consultant sources stay in the
// full comparison table under Learn, labelled as the heuristics they are.
const tierOne = computed(() => repo.recommendations.find((r) => r.tier === 1))
const bracket = computed(() => tierOne.value?.currentBracket(props.schedule.monthsSinceBirth))

/** Longest single wake window in the plan — the stretch parents worry about,
 * which is usually the last one before bed. */
const longestAwakeHours = computed(() =>
  props.schedule.wws.length ? Math.max(...props.schedule.wws) : 0)

interface Band {
  key: string
  label: string
  value: string
  rangeText: string
  sheet: SheetContent
  /** Resolved once here rather than by a template call: template functions are
   * not cached, and the markup reads the geometry five times per band. */
  geometry: BandGeometry
}

const bands = computed<Band[]>(() => {
  const b = bracket.value
  if (!b) return []
  const months = props.schedule.monthsSinceBirth
  const awakeLow = b.wwTime[0] / 60
  const awakeHigh = b.wwTime[1] / 60

  return [
    {
      key: 'total-sleep',
      label: 'Total sleep',
      value: hoursText(props.schedule.totalSleep),
      geometry: bandGeometry(b.minSleep, b.maxSleep, props.schedule.totalSleep, 8, 18),
      rangeText: `typical ${b.minSleep}–${b.maxSleep} hr`,
      sheet: {
        tier: 1,
        title: 'Total sleep in 24 hours',
        body: [
          'Night sleep plus every nap. The published range at this age is wide on purpose — where '
          + 'a healthy baby lands inside it is largely individual and fairly stable over time.',
          'Longitudinal data following the same children for years shows roughly a two- to '
          + 'three-hour spread in total daily sleep among perfectly healthy infants at the same age.',
        ],
        math: [
          { label: 'Night sleep', value: hoursText(props.schedule.totalNightSleep) },
          { label: `Naps (${props.schedule.naps})`, value: hoursText(props.schedule.totalNap) },
          { label: 'Total', value: hoursText(props.schedule.totalSleep) },
          { label: `Typical at ${months} months`, value: `${b.minSleep}–${b.maxSleep} hr` },
        ],
        sourceIds: ['iglowstein-2003'],
        sourceNote: 'AAP / Sleep Foundation age ranges, with Iglowstein 2003 for the spread.',
      },
    },
    {
      key: 'naps',
      label: 'Naps',
      value: String(props.schedule.naps),
      geometry: bandGeometry(b.naps[0], b.naps[1], props.schedule.naps, 0, 6),
      rangeText: b.naps[0] === b.naps[1] ? `typically ${b.naps[0]}` : `typically ${b.naps[0]}–${b.naps[1]}`,
      sheet: {
        tier: 1,
        title: 'Nap count',
        body: [
          'Nap counts fall as wake windows lengthen. The number itself is not a goal — it is a '
          + 'consequence of how long your baby can comfortably stay awake.',
          'Sitting one nap either side of the typical count is common, especially in the weeks '
          + 'around a transition. When the count is drifting down for a week or more rather than '
          + 'for two odd days, that is the signal a transition is underway.',
        ],
        sourceNote:
          'Nap counts by age are Tier 1 (AAP / Sleep Foundation). The 4→3→2→1 transition timing '
          + 'and method are Tier 2 — see Nap transitions under Learn.',
      },
    },
    {
      key: 'awake',
      label: 'Longest awake stretch',
      value: formatDuration(longestAwakeHours.value * 60),
      geometry: bandGeometry(awakeLow, awakeHigh, longestAwakeHours.value, 0.5, 5),
      rangeText: `typical ${formatDuration(b.wwTime[0])}–${formatDuration(b.wwTime[1])}`,
      sheet: {
        tier: 2,
        title: 'Longest awake stretch',
        body: [
          'The longest gap between sleeps in your plan, usually the one before bedtime. '
          + 'Consultants suggest keeping it inside a range for the age, but this is a heuristic, '
          + 'not a limit, and it is the softest number on this screen.',
          'If the stretch is longer than the range and your baby is settling fine, it is fine. '
          + 'If settling has got hard, shortening it by 15 minutes and giving that three days is '
          + 'the usual first move — one change at a time, judged over days rather than naps.',
        ],
        sourceNote:
          'Practice-based (Tier 2). The phrase "wake window" does not appear in the pediatric '
          + 'sleep-medicine literature; the underlying sleep pressure is real, the specific '
          + 'minutes are convention.',
      },
    },
  ]
})

// The section-level "why?": where the shaded bands themselves come from, as
// opposed to what any single measure means.
function openRangesSheet() {
  openSheet({
    tier: 1,
    title: 'Where the normal ranges come from',
    body: [
      'The shaded band on each measure is the published range for your baby’s age. Total sleep '
      + 'and nap counts come from AAP and Sleep Foundation consensus ranges, which are Tier 1.',
      'The dark mark is your plan. Anywhere in the band is normal; just outside it is worth a '
      + 'glance, not an alarm — the bands are wide because healthy babies genuinely differ that '
      + 'much from one another.',
      'The longest-awake band is the soft one: wake-window lengths are a Tier 2 heuristic, so '
      + 'treat that mark as the loosest of the three.',
    ],
    sourceIds: ['iglowstein-2003'],
    sourceNote:
      'AAP / Sleep Foundation age-based sleep-duration ranges; longest-awake guidance is Tier 2.',
  })
}
</script>

<template>
  <section v-if="bands.length" aria-labelledby="ranges-heading">
    <div class="flex items-center gap-2 flex-wrap">
      <!-- Not "So far today", which the mock used: these bands are drawn from
           the PLAN, not from what has actually been logged, and a label that
           implies otherwise would make a parent read a projection as a record.
           The honest version of the same section. -->
      <h2 id="ranges-heading" class="eyebrow">How your plan compares</h2>
      <TierWhyButton :tier="1" v-on:click="openRangesSheet" />
    </div>

    <div class="card mt-2 p-5 space-y-5">
      <div v-for="band in bands" :key="band.key">
        <div class="flex items-baseline justify-between gap-3">
          <!-- The label IS the explainer trigger: an ⓘ next to a word people
               already want to press is one target, not two. -->
          <button type="button" class="flex items-center gap-1.5 text-sm text-slate-200 min-h-11"
            v-on:click="openSheet(band.sheet)">
            {{ band.label }}
            <span aria-hidden="true"
              class="grid h-4 w-4 place-items-center rounded-full border border-line-strong text-[10px] text-muted">i</span>
            <span class="sr-only">— what this means and where the range comes from</span>
          </button>
          <span class="display text-xl text-slate-200">{{ band.value }}</span>
        </div>

        <div class="relative h-3 rounded-full bg-paper-sunk">
          <div class="absolute inset-y-0 rounded-full bg-[color-mix(in_srgb,var(--color-violet-500)_22%,var(--color-card))]"
            :style="{ left: band.geometry.bandLeft, width: band.geometry.bandWidth }"></div>
          <div class="absolute -top-1 h-5 w-1 rounded-full bg-slate-200"
            :style="{ left: band.geometry.markLeft }"></div>
        </div>

        <p class="text-xs text-muted mt-1.5">
          {{ band.rangeText }}<span v-if="!band.geometry.inRange"> · your plan sits outside it, which is
            worth a glance rather than a worry</span>
        </p>
      </div>
    </div>
  </section>
</template>
