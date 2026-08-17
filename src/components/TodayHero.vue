<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { formatClock, formatClockRange, formatDuration } from '../models/time'
import { minutesFromMidnight, nextEvent } from '../models/today'
import { createEntry, elapsedMs, isRunning, stopEntry, type SleepEntry } from '../models/sleepLog'
import { entries, now } from '../stores/sleepLog'
import { openSheet } from '../stores/sheet'
import napUrl from '../assets/sleeping-baby2.png'
import moonUrl from '../assets/moon.png'
import sunUrl from '../assets/sun.png'

// @doc:wake-window-schedule-generator @doc:bedtime-calculator
// @doc:anti-anxiety-mechanics @doc:sleep-nap-logging
//
// The countdown. The largest thing in the app, and deliberately the only thing
// above the fold: a parent opening this at 3am wants one sentence — what happens
// next and roughly when — and everything that used to compete with that answer
// now sits below it or on another tab.
//
// It is still a RANGE, not a deadline. The big figure counts down to when the
// window OPENS, and the line under it always names both ends of the window, so
// the number can never be read as a to-the-minute target. Once the clock is
// inside the window the countdown stops and says so rather than counting past
// zero into a deficit — a parent who is 20 minutes "late" is not late.
//
// The surface colour carries the state: terracotta while awake (there is
// something to do), night blue while asleep (there is not).

const props = defineProps<{
  schedule: ScheduleSetting
  slopMinutes: number
}>()

const nowMinutes = computed(() => minutesFromMidnight(new Date(now.value)))

// A running timer IS the answer to "is the baby asleep" — there is no separate
// asleep flag to fall out of sync with the log.
const runningEntry = computed<SleepEntry | undefined>(() =>
  [...entries].reverse().find(isRunning))

const asleep = computed(() => runningEntry.value !== undefined)

const upcoming = computed(() =>
  nextEvent(
    props.schedule.napWindowsAt(props.slopMinutes),
    props.schedule.bedtimeWindowAt(props.slopMinutes),
    nowMinutes.value,
  ))

const kicker = computed(() => {
  if (asleep.value) return 'Asleep'
  const next = upcoming.value
  if (!next) return 'Day’s done'
  if (next.kind === 'bedtime') return next.inWindow ? 'Bedtime window is open' : 'Bedtime coming up'
  return next.inWindow ? `Nap ${next.index} — window is open` : `Nap ${next.index} coming up`
})

const headline = computed(() => {
  if (asleep.value) return formatDuration(elapsedMs(runningEntry.value!, now.value) / 60000)
  const next = upcoming.value
  if (!next) return 'Rest'
  if (next.inWindow) return 'Any time now'
  return formatDuration(next.untilMinutes)
})

const detail = computed(() => {
  if (asleep.value) {
    return `Started ${formatClock(minutesFromMidnight(new Date(runningEntry.value!.start)))}. `
      + 'No need to wake them — tap below when they stir.'
  }
  const next = upcoming.value
  if (!next) {
    return 'Bedtime has passed and nothing else is scheduled. Anything from here is night sleep.'
  }
  const range = formatClockRange(next.earliest, next.latest)
  if (next.kind === 'bedtime') {
    return `Aim for roughly ${range}. Anywhere in there counts.`
  }
  return `Start settling any time from ${range}`
    + (next.lengthMinutes ? ` · usually about ${formatDuration(next.lengthMinutes)}.` : '.')
})

// The one-line "and after that" — what is coming once this window is done. It
// exists so the countdown never reads as the only thing left in the day, which
// is how a single number starts to feel like a deadline.
const then = computed(() => {
  if (asleep.value) return 'Rest while they do.'
  const next = upcoming.value
  if (!next) return ''
  if (next.kind === 'bedtime') return 'Last stretch of the day.'
  return `Then bedtime around ${formatClock(props.schedule.bedtimeMinutes)}.`
})

const icon = computed(() => {
  if (asleep.value) return napUrl
  const next = upcoming.value
  return !next || next.kind === 'bedtime' ? moonUrl : sunUrl
})

const actionLabel = computed(() => (asleep.value ? 'They woke up' : 'They went down'))

function toggleSleep() {
  const entry = runningEntry.value
  if (entry) {
    const i = entries.findIndex((e) => e.id === entry.id)
    if (i !== -1) entries[i] = stopEntry(entry, Date.now())
  } else {
    entries.push(createEntry(Date.now()))
  }
}

// @doc:no-ai-no-data-training — "where this time comes from" is the whole
// no-model claim made concrete: the arithmetic is four lines of the parent's own
// numbers, and they can read every one of them.
function openWindowMath() {
  const next = upcoming.value
  const naps = props.schedule.napTimes

  // The window that produced THIS event, and the sleep it is measured from.
  //
  // Nap N is reached through wake window N (1-based), and the clock starts at
  // the end of nap N-1 — not at the morning wake time, which is only right for
  // nap 1. Bedtime is the last window of all, measured from the final nap.
  // Getting this wrong was worse than showing nothing: the sheet's whole claim
  // is "here is the arithmetic on YOUR numbers", so a plausible-looking wrong
  // sum is the one failure mode it cannot have.
  const windowIndex = next
    ? (next.kind === 'bedtime' ? props.schedule.wws.length - 1 : next.index - 1)
    : 0
  const windowHours = props.schedule.wws[windowIndex] ?? props.schedule.wws[0]

  const precedingNap = next
    ? (next.kind === 'bedtime' ? naps.at(-1) : naps[next.index - 2])
    : undefined

  const math = [
    precedingNap
      ? { label: `Woke from nap ${naps.indexOf(precedingNap) + 1}`, value: formatClock(precedingNap.end) }
      : { label: 'Woke for the day', value: formatClock(props.schedule.wakeMinutes) },
    {
      label: `Wake window at ${props.schedule.monthsSinceBirth} months`,
      value: formatDuration(windowHours * 60),
    },
  ]
  if (next) {
    math.push({ label: 'Suggested start', value: formatClock((next.earliest + next.latest) / 2) })
    math.push({
      label: `Shown as a ±${props.slopMinutes} min window`,
      value: formatClockRange(next.earliest, next.latest),
    })
  }
  openSheet({
    tier: 2,
    title: 'Where this time comes from',
    body: [
      'Wake windows are a practice-based estimate for your baby’s age, not a clinical rule. '
      + 'We add the window to the time they last woke and show a range around the result.',
      'That is why it is a window and not a minute: the arithmetic is only as precise as the '
      + 'estimate behind it. Cues beat the clock whenever the two disagree.',
      'All of this happens on your phone. There is no model and no server involved — it is the '
      + 'four lines above, added up.',
    ],
    math,
    sourceNote:
      'Wake-window lengths by age are a Tier 2 heuristic used widely by sleep consultants. '
      + 'No trial validates the specific minutes.',
    sourceIds: ['mindell-2016-app'],
  })
}
</script>

<template>
  <section class="rounded-2xl px-6 pt-6 pb-5 text-on-fill shadow-[var(--shadow-lift)] lg:px-8 lg:pt-8 lg:pb-6"
    :class="asleep ? 'bg-cyan-500' : 'bg-violet-500'"
    aria-labelledby="hero-kicker">
    <div class="flex items-center gap-2.5">
      <img :src="icon" alt="" aria-hidden="true" width="26" height="26" class="h-6.5 w-6.5 opacity-90" />
      <h2 id="hero-kicker" class="text-xs uppercase tracking-[0.14em] opacity-80 font-normal">{{ kicker }}</h2>
    </div>

    <!-- aria-live so a screen-reader user hears the countdown change without
         having to go looking for it; polite, because it changes every minute. -->
    <p class="display text-6xl mt-2.5 lg:text-7xl xl:text-8xl" aria-live="polite">{{ headline }}</p>

    <p class="text-[15px] leading-relaxed opacity-90 mt-2.5 text-pretty max-w-[44ch] lg:text-[17px]">{{ detail }}</p>

    <p v-if="then" class="text-[15px] opacity-85 mt-1">{{ then }}</p>

    <div class="mt-4 pt-3 border-t border-[rgba(255,247,239,.28)] flex items-center justify-between gap-3 flex-wrap">
      <button type="button" class="btn px-0 text-[13.5px] underline underline-offset-4 decoration-[rgba(255,247,239,.45)]"
        v-on:click="openWindowMath">Where this time comes from</button>
      <button type="button"
        class="btn bg-[rgba(255,247,239,.16)] hover:bg-[rgba(255,247,239,.28)] text-on-fill"
        v-on:click="toggleSleep">
        <span class="h-2.5 w-2.5 rounded-full bg-on-fill" aria-hidden="true"></span>{{ actionLabel }}
      </button>
    </div>
  </section>
</template>
