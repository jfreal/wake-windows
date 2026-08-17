<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { formatClock, formatClockRange, formatDuration } from '../models/time'
import { minutesFromMidnight } from '../models/today'
import { now } from '../stores/sleepLog'
import { openSheet } from '../stores/sheet'
import { getSource } from '../models/Citations'
import TierWhyButton from './TierWhyButton.vue'
import napUrl from '../assets/sleeping-baby2.png'
import moonUrl from '../assets/moon.png'
import sunUrl from '../assets/sun.png'

// @doc:wake-window-schedule-generator @doc:bedtime-calculator
// @doc:anti-anxiety-mechanics @doc:cues-vs-clock-mode
//
// The whole day as a list: waking, each nap window, bedtime.
//
// Naps whose window has passed go quiet rather than disappearing — a parent
// scanning the list needs to see where in the day they are, and a list that
// silently shortens as the day goes on gives no sense of place. They are dimmed
// and read "done", never "missed": nothing here is a target that can be failed.
//
// Every start is a RANGE. There is no to-the-minute nap time anywhere in this
// component, because wake-window timing is a Tier 2 heuristic and rendering it
// to the minute would claim a precision the evidence does not have.

const props = defineProps<{
  schedule: ScheduleSetting
  slopMinutes: number
  cuesFirst: boolean
}>()

const nowMinutes = computed(() => minutesFromMidnight(new Date(now.value)))

// @doc:anti-anxiety-mechanics — the reassurance line is cited in place, not just
// inside the sheet: the claim that healthy babies vary this much is the load-
// bearing one under "windows, not deadlines".
const iglowstein = getSource('iglowstein-2003')

interface Row {
  key: string
  label: string
  hint: string
  time: string
  icon: string
  color: string
  past: boolean
}

const rows = computed<Row[]>(() => {
  const windows = props.schedule.napWindowsAt(props.slopMinutes)
  const out: Row[] = [{
    key: 'wake',
    label: 'Woke for the day',
    hint: 'where the day’s arithmetic starts',
    time: formatClock(props.schedule.wakeMinutes),
    icon: sunUrl,
    color: 'var(--color-orange-500)',
    past: nowMinutes.value >= props.schedule.wakeMinutes,
  }]

  windows.forEach((window, i) => {
    const past = nowMinutes.value > window.latest
    out.push({
      key: `nap-${i}`,
      label: `Nap ${i + 1}`,
      hint: past
        ? `about ${formatDuration(window.lengthMinutes)} · window has passed`
        : `about ${formatDuration(window.lengthMinutes)}`,
      time: past ? 'done' : formatClockRange(window.earliest, window.latest),
      icon: napUrl,
      color: 'var(--color-violet-500)',
      past,
    })
  })

  const bed = props.schedule.bedtimeWindowAt(props.slopMinutes)
  out.push({
    key: 'bed',
    label: 'Bedtime',
    hint: 'aim for the window, not the minute',
    time: formatClockRange(bed.earliest, bed.latest),
    icon: moonUrl,
    color: 'var(--color-cyan-500)',
    past: nowMinutes.value > bed.latest,
  })
  return out
})

function openWhy() {
  openSheet({
    tier: 2,
    title: 'Why these are windows, not times',
    body: [
      'Each nap start is your baby’s last wake time plus a wake window for their age. The wake '
      + 'window is a practice-based estimate, so the result is a range, not an appointment.',
      props.cuesFirst
        ? 'Your plan is running cues-first right now, so the ranges are drawn wider still. Under '
        + 'about six months corrected age the body clock is not the thing driving sleep — sleep '
        + 'pressure and hunger are — so what the baby is doing beats what the clock says.'
        : 'Anywhere inside a window counts. Missing one does not set anything back; healthy '
        + 'babies vary widely from day to day.',
      'Naps whose window has passed are marked done, not missed. There is nothing to make up for '
      + 'and nothing here keeps score.',
    ],
    sourceNote:
      'Wake-window durations by age are Tier 2 — widely used by sleep consultants, not validated '
      + 'by trial. The day-to-day variation behind "windows, not deadlines" is Tier 1.',
    sourceIds: ['iglowstein-2003'],
  })
}
</script>

<template>
  <section aria-labelledby="rest-of-day-heading">
    <div class="flex items-center gap-2 flex-wrap">
      <h2 id="rest-of-day-heading" class="eyebrow">Rest of the day</h2>
      <TierWhyButton :tier="2" v-on:click="openWhy" />
    </div>

    <ul class="card mt-2 overflow-hidden">
      <li v-for="(row, i) in rows" :key="row.key"
        class="flex items-center gap-3.5 px-4 py-3.5"
        :class="[i > 0 ? 'border-t border-paper-sunk' : '', row.past ? 'opacity-55' : '']">
        <span class="grid h-7.5 w-7.5 shrink-0 place-items-center rounded-full"
          :style="{ background: row.past ? 'var(--color-slate-700)' : row.color }">
          <img :src="row.icon" alt="" aria-hidden="true" width="18" height="18" class="h-4.5 w-4.5" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-[15px] text-slate-200">{{ row.label }}</span>
          <span class="block text-xs text-muted">{{ row.hint }}</span>
        </span>
        <span class="text-sm text-slate-300 tabular-nums text-right">{{ row.time }}</span>
      </li>
    </ul>

    <p v-if="cuesFirst" class="text-xs text-muted mt-2 px-1 text-pretty">
      Loose windows — start settling when you see sleepy cues, even if the clock disagrees.
    </p>
    <p class="text-xs text-muted mt-2 px-1 text-pretty">
      Anywhere in a window counts — these are ranges, not deadlines. Missing one doesn't set your baby
      back; healthy babies vary widely from day to day<template v-if="iglowstein">
        <a :href="iglowstein.url" target="_blank" rel="noopener noreferrer" class="link-ext">
          (Iglowstein 2003 <span aria-hidden="true">↗</span>)</a></template>.
    </p>
    <p class="text-xs text-muted mt-2 px-1 text-pretty">
      Total-sleep and nap counts are evidence-based (Tier 1); wake-window timing is a practice-based
      heuristic (Tier 2) — a starting estimate, not a rule. Watch your baby's tiredness cues over the
      clock.
    </p>
  </section>
</template>
