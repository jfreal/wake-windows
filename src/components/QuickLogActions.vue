<script setup lang="ts">
import { createEntry, floorToMinute } from '../models/sleepLog'
import { entries } from '../stores/sleepLog'
import napUrl from '../assets/sleeping-baby2.png'
import moonUrl from '../assets/moon.png'

// @doc:sleep-nap-logging
//
// The two things you do after the fact.
//
// The big toggle above covers "it is happening now". These cover "it already
// happened and I didn't have a hand free" — which, with a newborn, is most of
// them. Both drop in a complete, fully editable entry rather than opening a
// form: pick the shape that is closest and nudge the times, instead of typing
// four fields from scratch at 3am.
//
// Deliberately only two. The design's third slot was a feed log, and this app
// tracks sleep and nothing else.

const HOUR_MS = 60 * 60 * 1000

/** A one-hour block ending now — the nap you forgot to start. */
function addPastSleep() {
  const end = floorToMinute(Date.now())
  const entry = createEntry(end - HOUR_MS)
  entry.end = end
  entries.push(entry)
}

/**
 * Last night, as a 7pm–7am block ending this morning.
 *
 * Built from the local calendar day rather than by subtracting hours from now,
 * so it lands on last night whatever time of day you tap it — and it stays
 * correct across a DST boundary, where "12 hours ago" and "7am today" are not
 * the same instant.
 */
function addLastNight() {
  const start = new Date()
  start.setDate(start.getDate() - 1)
  start.setHours(19, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  end.setHours(7, 0, 0, 0)
  const entry = createEntry(start.getTime(), 'night')
  entry.end = end.getTime()
  entries.push(entry)
}

const ACTIONS = [
  { label: 'Add past sleep', hint: 'an hour, ending now', icon: napUrl, color: 'var(--color-violet-500)', run: addPastSleep },
  { label: 'Add last night', hint: '7pm to 7am', icon: moonUrl, color: 'var(--color-cyan-500)', run: addLastNight },
]
</script>

<template>
  <div class="grid grid-cols-2 gap-2.5">
    <button v-for="action in ACTIONS" :key="action.label" type="button"
      class="card flex min-h-[62px] flex-col items-center justify-center gap-1 px-3 py-3.5 hover:border-line-strong"
      v-on:click="action.run">
      <span class="grid h-6 w-6 place-items-center rounded-full" :style="{ background: action.color }">
        <img :src="action.icon" alt="" aria-hidden="true" width="15" height="15" class="h-3.5 w-3.5" />
      </span>
      <span class="text-sm text-slate-200">{{ action.label }}</span>
      <span class="text-xs text-muted">{{ action.hint }}</span>
    </button>
  </div>
</template>
