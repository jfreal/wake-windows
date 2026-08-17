<script setup lang="ts">
import { computed } from 'vue'
import { elapsedMs, isRunning, startOfLocalDay, type SleepEntry } from '../models/sleepLog'
import { formatClock, formatDuration } from '../models/time'
import { minutesFromMidnight } from '../models/today'
import { entries, now } from '../stores/sleepLog'
import { goTab } from '../stores/tabs'
import napUrl from '../assets/sleeping-baby2.png'
import moonUrl from '../assets/moon.png'

// @doc:sleep-nap-logging @doc:trends-daily-totals
//
// What actually happened today, on the Today screen — read-only.
//
// The plan is above; this is the record. Keeping a small, uneditable version of
// the log here is the difference between "here is the plan" and "here is your
// day": a parent who has already logged two naps should see them next to the
// schedule they are being measured against, without a tab switch.
//
// Read-only is the whole point. Every control that changes a time lives on the
// Log screen, so this can never become a second, subtly different editor.

const todayEntries = computed<SleepEntry[]>(() => {
  const dayStart = startOfLocalDay(now.value)
  return entries
    // A running entry counts as today's however long ago it started: night
    // sleep begins the previous evening, so a plain `start >= dayStart` filter
    // makes the baby vanish from this panel at midnight and shows "Nothing
    // logged yet today" at 3am while the timer is still going.
    .filter((e) => e.start >= dayStart || isRunning(e))
    .sort((a, b) => b.start - a.start)
})

function label(entry: SleepEntry): string {
  const kind = entry.kind === 'night' ? 'Night sleep' : 'Nap'
  const length = formatDuration(elapsedMs(entry, now.value) / 60000)
  return isRunning(entry) ? `${kind} · ${length} so far` : `${kind} · ${length}`
}

function time(entry: SleepEntry): string {
  const start = formatClock(minutesFromMidnight(new Date(entry.start)))
  if (entry.end === null) return `${start} –`
  return `${start} – ${formatClock(minutesFromMidnight(new Date(entry.end)))}`
}
</script>

<template>
  <section class="card p-5" aria-labelledby="recent-sleep-heading">
    <div class="flex items-baseline justify-between gap-3">
      <h2 id="recent-sleep-heading" class="eyebrow">Logged today</h2>
      <button type="button" class="btn-inline no-underline" v-on:click="goTab('log')">Open the log</button>
    </div>

    <ul v-if="todayEntries.length" class="mt-2 space-y-2.5">
      <li v-for="entry in todayEntries" :key="entry.id" class="flex items-center gap-3 text-sm">
        <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full"
          :style="{ background: entry.kind === 'night' ? 'var(--color-cyan-500)' : 'var(--color-violet-500)' }">
          <img :src="entry.kind === 'night' ? moonUrl : napUrl" alt="" aria-hidden="true"
            width="15" height="15" class="h-3.5 w-3.5" />
        </span>
        <span class="min-w-0 flex-1 text-slate-300">{{ label(entry) }}</span>
        <span class="text-muted tabular-nums">{{ time(entry) }}</span>
      </li>
    </ul>

    <p v-else class="text-sm text-muted mt-2 text-pretty">
      Nothing logged yet today. Tap “They went down” above when the next nap starts — one tap, and
      nothing else to fill in.
    </p>
  </section>
</template>
