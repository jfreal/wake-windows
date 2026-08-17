<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { daySegments, minutesFromMidnight, segmentsToGradient } from '../models/today'
import { now } from '../stores/sleepLog'
import sunUrl from '../assets/sun.png'
import moonUrl from '../assets/moon.png'
import napUrl from '../assets/sleeping-baby2.png'

// @doc:24h-visual-day-breakdown @doc:accessibility-dark-room
//
// The day, left to right, midnight to midnight, with a marker for right now.
//
// This replaces the old three-block proportional bar. That bar answered "how
// much of the day is nap/night/awake" — which the Sleep Stats table already
// answered in words — while the question a parent actually has standing in a
// dark nursery is "where am I in the day". Position carries that; proportion
// does not, and a nap at 9am and a nap at 4pm were indistinguishable before.
//
// Colour is the same warm-to-cool day arc as before and means the same three
// things. Because segments are now positional they can be very narrow, so
// nothing is ever written INSIDE a band: the figures live in the totals row
// below and in the aria-label, which is what makes it safe for the strip itself
// to be decorative-thin.

const props = defineProps<{ schedule: ScheduleSetting }>()

const COLORS = {
  night: 'var(--color-cyan-500)',
  awake: 'var(--color-orange-500)',
  nap: 'var(--color-violet-500)',
} as const

const segments = computed(() =>
  daySegments(props.schedule.wakeMinutes, props.schedule.bedtimeMinutes, props.schedule.napTimes))

const gradient = computed(() => segmentsToGradient(segments.value, COLORS))

const nowPercent = computed(() => `${((minutesFromMidnight(new Date(now.value)) / 1440) * 100).toFixed(2)}%`)

// The text alternative. Hours are spelled out so a screen reader doesn't
// announce a bare "h", and the sentence says the same thing the picture does.
const label = computed(() =>
  `Day at a glance: ${props.schedule.totalWakeTime} hours awake, `
  + `${props.schedule.totalNightSleep} hours night sleep, `
  + `${props.schedule.totalNap} hours of naps.`)

// The stats table is the legend and the figures at once. It has to be BOTH:
// the strip is now positional, so its bands can be a few pixels wide, and a
// figure written inside one would be unreadable or clipped. The rule the old bar
// followed still holds and is easier to keep now — every number the picture
// encodes exists here, in text, immediately below it.
const stats = computed(() => [
  { label: `Naps (${props.schedule.naps})`, hours: props.schedule.totalNap, color: COLORS.nap, icon: napUrl },
  { label: 'Night Sleep', hours: props.schedule.totalNightSleep, color: COLORS.night, icon: moonUrl },
  { label: 'Total Wake', hours: props.schedule.totalWakeTime, color: COLORS.awake, icon: sunUrl },
])
</script>

<template>
  <section class="card p-5" aria-labelledby="day-strip-heading">
    <h2 id="day-strip-heading" class="eyebrow">Your day</h2>

    <!-- Taller and squarer on a wide screen, where there is room for the shape
         of the day to be read rather than just glanced at. -->
    <div class="relative h-7 rounded-full overflow-hidden bg-paper-sunk mt-2 lg:h-11 lg:rounded-sm"
      role="img" :aria-label="label">
      <div class="absolute inset-0" :style="{ background: gradient }"></div>
      <!-- The now-marker runs past the top and bottom edges so it reads as a
           cursor on the day rather than as a fourth kind of band. -->
      <div class="absolute -top-1 -bottom-1 w-[3px] bg-slate-200"
        :style="{ left: nowPercent }" aria-hidden="true"></div>
    </div>

    <!-- Every three hours where there is room, every six where there is not.
         Decorative: the strip's own aria-label carries the day in words. -->
    <div class="flex justify-between text-[11px] text-muted tabular-nums mt-1.5" aria-hidden="true">
      <span>12a</span><span class="hidden lg:inline">3a</span><span>6a</span>
      <span class="hidden lg:inline">9a</span><span>12p</span>
      <span class="hidden lg:inline">3p</span><span>6p</span>
      <span class="hidden lg:inline">9p</span><span>12a</span>
    </div>

    <!-- Every figure the strip encodes, in text — and the strip's legend, since
         each row carries its band's colour. The strip is allowed to be a thin
         ribbon precisely because nothing is only in the ribbon. -->
    <h2 class="eyebrow mt-5">Sleep Stats</h2>
    <table class="w-full mt-1.5 text-sm">
      <tbody>
        <!-- The label column is a row header, not a second data cell: without
             `th scope="row"` a screen reader reads a bare pair of values and the
             tie between "Night Sleep" and "12h" exists only visually. -->
        <tr v-for="row in stats" :key="row.label" class="border-t border-line first:border-t-0">
          <th scope="row" class="py-1.5 text-left font-normal text-slate-300">
            <span class="flex items-center gap-2">
              <span class="grid h-5 w-5 shrink-0 place-items-center rounded-sm" :style="{ background: row.color }">
                <img :src="row.icon" alt="" aria-hidden="true" width="14" height="14" class="h-3.5 w-3.5" />
              </span>
              {{ row.label }}
            </span>
          </th>
          <td class="py-1.5 text-right text-slate-200 tabular-nums">{{ row.hours }}h</td>
        </tr>
        <tr class="border-t border-line-strong">
          <th scope="row" class="py-1.5 pl-7 text-left font-normal text-slate-300">Total Sleep</th>
          <td class="py-1.5 text-right text-slate-200 tabular-nums font-medium">{{ schedule.totalSleep }}h</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
