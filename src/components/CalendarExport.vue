<script setup lang="ts">
// @doc:calendar-export
// "Add to calendar" panel: builds a standards-compliant .ics from today's plan
// entirely in the browser (no server, no account) and hands it off as a Blob
// download that Google, Apple, and Outlook all import. All the calendar logic
// lives in ../models/ics.ts; this component only reads the plan and triggers the
// download.
import { computed, ref } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { applyPlanParams } from '../models/planUrl'
import { effectiveGuidanceMode, windowSlopMinutes, isAtypicalReason } from '../models/GuidanceMode'
import { buildIcs, type IcsPlan } from '../models/ics'

// Read the plan from the same URL state the rest of the app uses, so the export
// matches exactly what the parent sees on screen — no account, no re-entry.
const params = Object.fromEntries(new URLSearchParams(window.location.search).entries())
const schedule = new ScheduleSetting()
applyPlanParams(schedule, params.bd, params.s)
if (params.at) {
  schedule.atypical = true
  schedule.atypicalReason = isAtypicalReason(params.at) ? params.at : 'other'
}

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
    <button type="button"
      class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-4 min-h-11 disabled:opacity-50"
      :disabled="!hasPlan"
      v-on:click="addToCalendar">Add to calendar (.ics)</button>
    <span v-if="done" role="status" class="ml-2 text-emerald-400 text-sm">Calendar file ready.</span>
  </section>
</template>
