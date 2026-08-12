<script setup lang="ts">
import { ref, computed } from 'vue'
import { dailyTotals, startOfLocalDay } from '../models/sleepLog'
import {
     napCountForDay,
     isDayInProgress,
     sevenDaySleepSeries,
     sleepBandForMonths,
     bandPosition,
} from '../models/trends'
import { formatDuration } from '../models/time'
import { getSources } from '../models/Citations'
import { schedule } from '../stores/plan'
import { entries, now } from '../stores/sleepLog'
import TierBadge from './TierBadge.vue'

// @doc:trends-daily-totals
// Glanceable "Today" totals + a 7-day sleep sparkline, right on the home screen
// so the exhausted-parent question ("how much has the baby slept today?") is a
// fact, not a report two taps deep. All correctness (midnight split, in-progress
// "so far", honest empty days) lives in models/trends.ts and is unit-tested;
// this shell only renders it. Local-only: reads the same ww.sleepLog.v1 store as
// the log below. No account, no server, no model.

const DAY_MS = 24 * 60 * 60 * 1000

// Log and clock both come from stores/sleepLog.ts. This panel used to run its
// own 1-second interval that re-parsed the whole log out of localStorage on
// every tick, purely to notice edits made in the panel below it — sharing the
// reactive array makes that re-read unnecessary, and the shared ticker only
// runs at 1s while a timer is actually going.

// Age drives the total-sleep context band, read from the live plan so it can't
// drift from the schedule above.
const band = computed(() => sleepBandForMonths(schedule.monthsSinceBirth))
const bandSources = computed(() => (band.value ? getSources(band.value.sourceIds) : []))

const dayStart = computed(() => startOfLocalDay(now.value))
const dayEnd = computed(() => dayStart.value + DAY_MS)

const totals = computed(() =>
     dailyTotals(entries, dayStart.value, dayEnd.value, now.value))
const napCount = computed(() =>
     napCountForDay(entries, dayStart.value, dayEnd.value, now.value))
const inProgress = computed(() =>
     isDayInProgress(entries, dayStart.value, dayEnd.value, now.value))

const totalHours = computed(() => totals.value.totalMs / (60 * 60 * 1000))
const position = computed(() =>
     band.value ? bandPosition(totalHours.value, band.value) : null)

const hasAnyData = computed(() => entries.length > 0)

// @doc:trends-daily-totals
// Feeding totals (C02) aren't built yet, so there is no data source — the feed
// tiles stay behind this guard rather than fabricate numbers. When the feeding
// log lands, swap `null` for its per-day totals and the tiles light up. Keeps
// the block to four numbers max (sleep, naps [, feeds, oz]).
const feedTotals = ref<{ count: number; ozOrMl: number; unit: 'oz' | 'mL' } | null>(null)

// --- 7-day sparkline -------------------------------------------------------

const series = computed(() => sevenDaySleepSeries(entries, now.value, 7))

// @doc:trends-daily-totals — observed "sleep budget": the mean of days that
// actually have logged sleep (today's partial day excluded so an in-progress
// morning can't drag the average down). Null until 3 complete logged days
// exist — an average of one day would be noise wearing a number's clothes.
const weeklyAvgLabel = computed(() => {
     const complete = series.value.filter((d) => d.totalMs > 0 && d.dayStart !== dayStart.value)
     if (complete.length < 3) return null
     const avgMs = complete.reduce((s, d) => s + d.totalMs, 0) / complete.length
     return formatDuration(avgMs / 60000)
})

// Scale bars against the age-band ceiling (so a typical day nearly fills) with a
// floor at the busiest day and a hard 24h cap, so nothing overflows the box.
const seriesMaxMs = computed(() => {
     const busiest = Math.max(0, ...series.value.map((d) => d.totalMs))
     const bandCeil = band.value ? band.value.maxHours * 60 * 60 * 1000 : 0
     return Math.min(DAY_MS, Math.max(busiest, bandCeil, 1))
})

const SPARK_W = 154
const SPARK_H = 40
const BAR_GAP = 4
const barWidth = computed(() => (SPARK_W - BAR_GAP * (series.value.length - 1)) / series.value.length)

interface Bar { x: number; y: number; w: number; h: number; isToday: boolean; label: string }
const bars = computed<Bar[]>(() =>
     series.value.map((d, i) => {
          const frac = d.totalMs / seriesMaxMs.value
          // Min 2px so an empty day still shows a faint baseline (honest: the day
          // exists and was blank), never nothing.
          const h = d.totalMs > 0 ? Math.max(2, frac * SPARK_H) : 2
          const isToday = i === series.value.length - 1
          return {
               x: i * (barWidth.value + BAR_GAP),
               y: SPARK_H - h,
               w: barWidth.value,
               h,
               isToday,
               label: dayLabel(d.dayStart),
          }
     }))

function dayLabel(ms: number): string {
     if (ms === dayStart.value) return 'Today'
     return new Date(ms).toLocaleDateString(undefined, { weekday: 'short' })
}

function hoursLabel(ms: number): string {
     return ms > 0 ? formatDuration(ms / 60000) : '—'
}

// Text alternative for the sparkline (spelled-out, screen-reader friendly).
const sparkAlt = computed(() =>
     'Sleep over the last 7 days: ' +
     series.value
          .map((d) => `${dayLabel(d.dayStart)} ${d.totalMs > 0 ? formatDuration(d.totalMs / 60000) : 'none logged'}`)
          .join(', ') + '.')

const showBreakdown = ref(false)
</script>

<template>
     <!-- @doc:trends-daily-totals -->
     <section class="mt-6 rounded-lg border border-slate-800 p-4" aria-labelledby="trends-today-heading">
          <div class="flex items-baseline justify-between gap-2">
               <h2 id="trends-today-heading" class="text-slate-400 text-sm uppercase font-normal">Today</h2>
               <span v-if="inProgress" class="text-muted text-xs">so far</span>
          </div>

          <!-- Headline numbers — four max (sleep, naps [, feeds, oz]). -->
          <div class="flex flex-wrap gap-x-6 gap-y-2 mt-2" aria-live="polite">
               <div>
                    <div class="text-slate-400 text-xs uppercase">Total sleep</div>
                    <div class="text-2xl text-slate-100 tabular-nums font-medium">
                         {{ hoursLabel(totals.totalMs) }}
                    </div>
               </div>
               <div>
                    <div class="text-slate-400 text-xs uppercase">Naps</div>
                    <div class="text-2xl text-slate-100 tabular-nums font-medium">{{ napCount }}</div>
               </div>
               <!-- @doc:trends-daily-totals — feed tiles are guarded until C02 lands. -->
               <template v-if="feedTotals">
                    <div>
                         <div class="text-slate-400 text-xs uppercase">Feeds</div>
                         <div class="text-2xl text-slate-100 tabular-nums font-medium">{{ feedTotals.count }}</div>
                    </div>
                    <div>
                         <div class="text-slate-400 text-xs uppercase">{{ feedTotals.unit }}</div>
                         <div class="text-2xl text-slate-100 tabular-nums font-medium">
                              {{ feedTotals.ozOrMl }}
                         </div>
                    </div>
               </template>
          </div>

          <!-- Total-sleep context vs the age band — informative, never a grade. -->
          <div v-if="band" class="mt-3 text-sm text-slate-300">
               <div class="flex items-center gap-2 flex-wrap">
                    <span>Typical at {{ band.ageLabel }}: <span class="text-slate-200">{{ band.label }}</span> in 24h</span>
                    <TierBadge :tier="band.tier" />
               </div>
               <p v-if="position === 'below' && inProgress" class="text-muted text-xs mt-1">
                    Still climbing — the day isn't over yet.
               </p>
               <p class="text-muted text-xs mt-1">
                    Context for the whole 24h, not a target to hit. Babies vary widely day to day<template
                         v-if="bandSources.length"> (<template v-for="(s, i) in bandSources" :key="s.id"><span
                              v-if="i > 0">, </span><a :href="s.url" target="_blank" rel="noopener noreferrer"
                              class="text-sky-400 hover:text-sky-300 underline underline-offset-2">{{ s.leadAuthor || s.org
                              }}<span aria-hidden="true"> ↗</span></a></template>)</template>.
               </p>
               <!-- @doc:trends-daily-totals @doc:anti-anxiety-mechanics — the "sleep
                    budget" reframe (research/08 T1, T18): published charts are
                    population averages; the baby's own observed 7-day total is the
                    honest anchor when the charts don't fit. -->
               <p v-if="weeklyAvgLabel" class="text-muted text-xs mt-1">
                    Your baby's own 7-day average is <span class="text-slate-300 tabular-nums">{{ weeklyAvgLabel }}</span>/day
                    — published bands are averages of many babies, and when the two disagree, your baby's own
                    total is usually the better anchor for the schedule.
               </p>
          </div>

          <!-- 7-day sleep sparkline — parent's own local data, no model. -->
          <div class="mt-4">
               <div class="flex items-baseline justify-between">
                    <div class="text-slate-400 text-xs uppercase">Sleep · last 7 days</div>
                    <button type="button"
                         class="btn-inline"
                         :aria-expanded="showBreakdown"
                         v-on:click="showBreakdown = !showBreakdown">
                         {{ showBreakdown ? 'Hide breakdown' : 'View breakdown' }}
                    </button>
               </div>

               <!-- Text alternative for screen readers; the chart itself is
                    decorative (aria-hidden) so it doesn't add a second role=img. -->
               <span class="sr-only">{{ sparkAlt }}</span>
               <svg :viewBox="`0 0 ${SPARK_W} ${SPARK_H}`" :width="SPARK_W" :height="SPARK_H"
                    class="mt-2 max-w-full h-10" aria-hidden="true" preserveAspectRatio="xMinYMax meet">
                    <rect v-for="(b, i) in bars" :key="i" :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="1.5"
                         :class="b.isToday ? 'fill-sky-400' : 'fill-violet-400/60'">
                         <title>{{ b.label }}</title>
                    </rect>
               </svg>

               <p v-if="!hasAnyData" class="text-muted text-xs mt-2">
                    Nothing logged yet — this fills in on its own as you use the sleep log below. Nothing to keep up
                    with.
               </p>

               <!-- Tap-through to the fuller per-day view. -->
               <div v-if="showBreakdown" class="mt-3">
                    <table class="w-full text-sm">
                         <tbody>
                              <tr v-for="d in [...series].reverse()" :key="d.dayStart"
                                   class="border-t border-slate-800 first:border-t-0">
                                   <td class="text-slate-400 py-1">{{ dayLabel(d.dayStart) }}</td>
                                   <td class="text-right text-slate-200 tabular-nums py-1">{{ hoursLabel(d.totalMs) }}</td>
                              </tr>
                         </tbody>
                    </table>
                    <p class="text-muted text-xs mt-2">
                         Days split at local midnight; a sleep across midnight counts on each side. Longer windows
                         (14/30-day, feed volume) are coming.
                    </p>
               </div>
          </div>
     </section>
</template>
