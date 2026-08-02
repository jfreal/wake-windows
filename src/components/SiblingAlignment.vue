<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { intersectIntervals, totalOverlapMinutes } from '../models/napOverlap'
import { formatClockRange, formatDuration } from '../models/time'

// @doc:sibling-twins-alignment
// Stacked dual-track 24h view: both children's days on one clock-positioned
// timeline, with the overlapping nap window(s) — the shared "quiet block" —
// highlighted as a band across both tracks. The overlap is a best-effort
// observation computed from the two schedules, never a target.
const props = defineProps<{
  a: ScheduleSetting
  b: ScheduleSetting
}>()

type Segment = { type: 'night' | 'wake' | 'nap'; start: number; end: number }

/** One child's day as clock-positioned segments: night, then wake/nap
 * alternation from napTimes, then night after bedtime. Falls back to a single
 * wake block when the schedule has no computable naps. */
function daySegments(s: ScheduleSetting): Segment[] {
  const wake = s.wakeMinutes
  const bed = s.bedtimeMinutes
  const segs: Segment[] = [{ type: 'night', start: 0, end: wake }]
  let t = wake
  for (const nap of s.napTimes) {
    segs.push({ type: 'wake', start: t, end: nap.start })
    segs.push({ type: 'nap', start: nap.start, end: nap.end })
    t = nap.end
  }
  segs.push({ type: 'wake', start: t, end: bed })
  segs.push({ type: 'night', start: bed, end: 1440 })
  return segs.filter((seg) => seg.end > seg.start)
}

const tracks = computed(() => [
  { label: `Baby A · ${props.a.monthsSinceBirth} mo`, segments: daySegments(props.a) },
  { label: `Baby B · ${props.b.monthsSinceBirth} mo`, segments: daySegments(props.b) },
])

const overlaps = computed(() => intersectIntervals(props.a.napTimes, props.b.napTimes))
const overlapTotal = computed(() => totalOverlapMinutes(overlaps.value))

const segmentColor: Record<Segment['type'], string> = {
  wake: 'bg-orange-500',
  night: 'bg-cyan-500',
  nap: 'bg-violet-500',
}

function pct(minutes: number): string {
  return `${(minutes / 1440) * 100}%`
}

const ariaSummary = computed(() =>
  overlaps.value.length
    ? `Both children's days with ${overlaps.value.length} shared quiet ` +
      `${overlaps.value.length === 1 ? 'block' : 'blocks'} totaling ${formatDuration(overlapTotal.value)}`
    : "Both children's days; their naps don't overlap on these schedules")

const hourMarks = [
  { at: 0, label: '12 AM' },
  { at: 360, label: '6 AM' },
  { at: 720, label: '12 PM' },
  { at: 1080, label: '6 PM' },
]
</script>

<template>
  <span class="text-slate-400 text-sm uppercase">Shared quiet block</span>

  <div class="flex gap-2 mt-2" role="img" :aria-label="ariaSummary">
    <div class="flex flex-col gap-1 shrink-0 text-xs text-slate-400">
      <span v-for="track in tracks" :key="track.label" class="h-6 flex items-center whitespace-nowrap">{{ track.label
        }}</span>
    </div>
    <div class="grow min-w-0">
      <div class="relative">
        <div class="flex flex-col gap-1">
          <div v-for="track in tracks" :key="track.label" class="relative h-6 rounded overflow-hidden bg-slate-800">
            <div v-for="(seg, i) in track.segments" :key="i" class="absolute inset-y-0" :class="segmentColor[seg.type]"
              :style="{ left: pct(seg.start), width: pct(seg.end - seg.start) }"></div>
          </div>
        </div>
        <!-- Overlap bands span both tracks. -->
        <div v-for="(o, i) in overlaps" :key="`overlap-${i}`"
          class="absolute top-0 bottom-0 bg-emerald-200/15 border-x-2 border-emerald-300/80 pointer-events-none"
          :style="{ left: pct(o.start), width: pct(o.end - o.start) }"></div>
      </div>
      <!-- text-muted, not slate-500: these are real labels a parent reads, and
           slate-500 measures 3.75:1 on the body — under the 4.5:1 floor. -->
      <div class="relative h-5 text-xs text-muted tabular-nums">
        <span v-for="mark in hourMarks" :key="mark.at" class="absolute" :style="{ left: pct(mark.at) }">{{ mark.label
          }}</span>
      </div>
    </div>
  </div>

  <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
    <span class="flex items-center gap-1"><span class="inline-block h-2.5 w-2.5 rounded-sm bg-orange-500"></span> Awake</span>
    <span class="flex items-center gap-1"><span class="inline-block h-2.5 w-2.5 rounded-sm bg-violet-500"></span> Nap</span>
    <span class="flex items-center gap-1"><span class="inline-block h-2.5 w-2.5 rounded-sm bg-cyan-500"></span> Night</span>
    <span class="flex items-center gap-1"><span
        class="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-200/30 border border-emerald-300/80"></span> Both asleep</span>
  </div>

  <div v-if="overlaps.length" class="mt-3">
    <div v-for="(o, i) in overlaps" :key="i"
      class="flex justify-between text-sm py-1 text-slate-300" :class="{ 'border-t border-slate-800': i > 0 }">
      <span class="text-emerald-300">Quiet block {{ overlaps.length > 1 ? i + 1 : '' }}</span>
      <span class="tabular-nums">{{ formatClockRange(o.start, o.end) }} · {{ formatDuration(o.end - o.start) }}</span>
    </div>
    <p class="text-muted text-xs mt-1">
      Where both babies are likely asleep at once, going by these schedules — a best-effort
      observation, not a target. Real days drift; a shorter or shifted overlap is normal.
    </p>
  </div>
  <div v-else class="mt-3">
    <p class="text-slate-300 text-sm">No overlapping nap window on these schedules.</p>
    <p class="text-muted text-xs mt-1">
      Different ages usually mean different rhythms — that's expected, not something to fix.
      Overlap tends to appear on its own as nap counts converge.
    </p>
  </div>
</template>
