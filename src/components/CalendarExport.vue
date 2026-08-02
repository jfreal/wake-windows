<script setup lang="ts">
// @doc:calendar-export
// "Add to calendar" panel: builds a standards-compliant .ics from today's plan
// entirely in the browser (no server, no account) and hands it off as a Blob
// download that Google, Apple, and Outlook all import. All the calendar logic
// lives in ../models/ics.ts; this component only reads the plan and triggers the
// download.
import { computed, ref, watch } from 'vue'
import { effectiveGuidanceMode, windowSlopMinutes } from '../models/GuidanceMode'
import { buildIcs, type IcsPlan } from '../models/ics'
import { schedule } from '../stores/plan'

// The live plan from stores/plan.ts, not a copy — this panel used to rebuild
// its own ScheduleSetting from the URL at setup and never re-read it, so a
// parent who adjusted bedtime and then exported got the plan as it stood at
// page load, with nothing to indicate it.

// Same slop the schedule display uses: cues-led / atypical days widen the
// guidance windows, and the exported ranges track that.
const slop = computed(() =>
  windowSlopMinutes(effectiveGuidanceMode(schedule.monthsSinceBirth, schedule.atypical)))

const hasPlan = computed(() => schedule.napTimes.length > 0)

function today(): { year: number; month: number; day: number } {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}

function buildPlan(): IcsPlan {
  const naps = schedule.napWindowsAt(slop.value)
  const bed = schedule.bedtimeWindowAt(slop.value)
  return {
    date: today(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    napWindows: naps.map((n) => ({ earliest: n.earliest, latest: n.latest })),
    bedtimeWindow: { earliest: bed.earliest, latest: bed.latest },
  }
}

const done = ref(false)

// Clear the "file ready" note as soon as the plan moves: the downloaded .ics is
// a snapshot, so leaving the confirmation up next to changed times would imply
// the calendar already knows about them.
watch(() => [schedule.dwt, schedule.bed, schedule.wws.join('/'), schedule.atypical], () => {
  done.value = false
})

function addToCalendar() {
  const plan = buildPlan()
  const ics = buildIcs(plan)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const { year, month, day } = plan.date
  a.href = url
  a.download = `wake-windows-${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  done.value = true
}
</script>

<template>
  <section class="rounded border border-slate-800 p-3">
    <h2 class="text-slate-400 text-sm uppercase font-normal">Add to calendar</h2>
    <p class="text-muted text-xs mt-1 mb-2">
      Drop today's naps and bedtime onto your calendar (Google, Apple, or Outlook). Each event is a
      guidance range, not a fixed appointment — anywhere in the window counts. No account, nothing leaves
      your device until you open the file.
    </p>
    <button type="button" class="btn btn-quiet"
      :disabled="!hasPlan"
      v-on:click="addToCalendar">Add to calendar (.ics)</button>
    <span v-if="done" role="status" class="ml-2 text-emerald-400 text-sm">Calendar file ready.</span>
  </section>
</template>
