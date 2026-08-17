<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { createEntry, elapsedMs, isRunning, stopEntry, type SleepEntry } from '../models/sleepLog'
import { formatClock, formatDuration } from '../models/time'
import { minutesFromMidnight } from '../models/today'
import { entries, now } from '../stores/sleepLog'
import napUrl from '../assets/sleeping-baby2.png'
import sunUrl from '../assets/sun.png'

// @doc:sleep-nap-logging @doc:accessibility-dark-room
//
// One tap, and nothing else to fill in.
//
// The log used to open with a form's worth of controls — start, add past sleep,
// then a datetime pair per entry — which is a lot of decisions to hand someone
// holding a baby in the dark. This is the whole primary interaction: a target
// roughly the width of the screen that says what it will do in plain words. The
// details underneath are still there for anyone who wants to correct a time; the
// point is that nobody has to.
//
// It is a real <button> at native size rather than a styled div, so it keeps its
// focus ring, its Enter/Space handling and its role for free. The circle is
// decoration around a control, not the control itself.

const runningEntry = computed<SleepEntry | undefined>(() =>
  [...entries].reverse().find(isRunning))

const asleep = computed(() => runningEntry.value !== undefined)

const title = computed(() => (asleep.value ? 'Awake' : 'Asleep'))
const sub = computed(() => (asleep.value ? 'tap when they wake up' : 'tap when they go down'))

const elapsed = computed(() => {
  const entry = runningEntry.value
  if (!entry) return ''
  return `${formatDuration(elapsedMs(entry, now.value) / 60000)} so far`
    + ` · started ${formatClock(minutesFromMidnight(new Date(entry.start)))}`
})

// The accessible name deliberately avoids the words "start" and "stop": the
// per-entry controls below already own those, and two different-sized buttons
// answering to the same name is a maze for anyone driving by voice or by
// screen reader.
const label = computed(() => (asleep.value ? 'They woke up' : 'They went down'))

function toggle() {
  const entry = runningEntry.value
  if (entry) {
    const i = entries.findIndex((e) => e.id === entry.id)
    if (i !== -1) entries[i] = stopEntry(entry, Date.now())
  } else {
    entries.push(createEntry(Date.now()))
  }
}

// `S` toggles asleep — a one-key version of the one-tap control, for the hand
// that is on a keyboard rather than a phone.
//
// Guarded hard, because this writes data: only while the Log screen is the one
// on screen (the listener is mounted with it), never with a modifier held (Cmd-S
// is Save, and stealing it would be a genuinely hostile surprise), and never
// while the caret is in a field — otherwise typing a note or a date would log
// naps. Nothing else in the app binds a bare letter.
function onKeydown(event: KeyboardEvent) {
  if (event.key !== 's' && event.key !== 'S') return
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const el = event.target as HTMLElement | null
  if (el?.isContentEditable) return
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
  event.preventDefault()
  toggle()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div>
    <button type="button"
      class="mx-auto flex aspect-square w-full max-w-xs flex-col items-center justify-center gap-2
             rounded-full text-on-fill shadow-[var(--shadow-lift)]
             motion-safe:transition-transform motion-safe:active:scale-[0.985]"
      :class="asleep ? 'bg-cyan-500' : 'bg-violet-500'"
      :aria-label="label"
      v-on:click="toggle">
      <img :src="asleep ? sunUrl : napUrl" alt="" aria-hidden="true" width="44" height="44"
        class="h-11 w-11 opacity-90" />
      <span class="display text-5xl" aria-hidden="true">{{ title }}</span>
      <span class="text-[15px] opacity-85" aria-hidden="true">{{ sub }}</span>
    </button>

    <p class="text-center text-sm text-muted mt-4 text-pretty" aria-live="polite">
      <template v-if="asleep">{{ elapsed }}</template>
      <template v-else>One tap. Nothing else to fill in — you can fix the time afterwards.</template>
    </p>

    <!-- Shown only where there is a keyboard to press it on. -->
    <p class="hidden md:block text-center text-xs text-muted mt-1.5">
      Or press <kbd class="rounded-sm bg-slate-800 px-1.5 py-0.5 font-medium text-slate-200">S</kbd>
    </p>
  </div>
</template>
