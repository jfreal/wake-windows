<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import {
     type SleepEntry,
     type SleepKind,
     loadLog,
     saveLog,
     createEntry,
     pauseEntry,
     resumeEntry,
     stopEntry,
     setKind,
     editEntry,
     isRunning,
     isPaused,
     elapsedMs,
     dailyTotals,
     runningCount,
     isStillAsleepPrompt,
     startOfLocalDay,
     toLocalInput,
     fromLocalInput,
     floorToMinute,
} from '../models/sleepLog'
import { formatDuration } from '../models/time'

// @doc:sleep-nap-logging
// Thin shell over models/sleepLog.ts. All correctness (background-safe elapsed,
// pause/resume, midnight backdating, daily totals) is proven in that module's
// unit tests; this component only renders it and wires user input. Local-only:
// entries live in localStorage (ww.sleepLog.v1), wiped by "Delete all my data".

// The running clock is COMPUTED from stored timestamps; `now` is a display-only
// tick so the elapsed readout advances. Timestamps are the source of truth, so
// backgrounding or restarting the device never loses time.
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
onMounted(() => {
     ticker = setInterval(() => { now.value = Date.now() }, 1000)
})
onUnmounted(() => { if (ticker) clearInterval(ticker) })

// Persisted log. Reactive array; every mutation is flushed to localStorage.
const entries = reactive<SleepEntry[]>(loadLog())
watch(entries, (list) => saveLog(list), { deep: true })

/** Replace an entry in place by id (state transitions return new objects). */
function replace(entry: SleepEntry, next: SleepEntry) {
     const i = entries.findIndex((e) => e.id === entry.id)
     if (i !== -1) entries[i] = next
}

// Newest first for display, without mutating stored order.
const ordered = computed(() =>
     [...entries].sort((a, b) => b.start - a.start))

const totals = computed(() => {
     const dayStart = startOfLocalDay(now.value)
     return dailyTotals(entries, dayStart, dayStart + 24 * 60 * 60 * 1000, now.value)
})

const running = computed(() => runningCount(entries))

function startTimer() {
     entries.push(createEntry(Date.now()))
}
function pause(entry: SleepEntry) {
     replace(entry, pauseEntry(entry, Date.now()))
}
function resume(entry: SleepEntry) {
     replace(entry, resumeEntry(entry, Date.now()))
}
function stop(entry: SleepEntry) {
     replace(entry, stopEntry(entry, Date.now()))
}
function toggleKind(entry: SleepEntry, kind: SleepKind) {
     replace(entry, setKind(entry, kind))
}
function remove(entry: SleepEntry) {
     const i = entries.findIndex((e) => e.id === entry.id)
     if (i !== -1) entries.splice(i, 1)
}

// Add a completed, fully-editable entry to backdate a sleep you forgot to
// time — defaults to a one-hour block ending now; every field is then editable,
// including the date, so it can be moved to any day (across midnight included).
function addPastEntry() {
     const end = floorToMinute(Date.now())
     const start = end - 60 * 60 * 1000
     const entry = createEntry(start)
     entry.end = end
     entries.push(entry)
}

function onEditStart(entry: SleepEntry, event: Event) {
     const ms = fromLocalInput((event.target as HTMLInputElement).value)
     if (ms !== null) replace(entry, editEntry(entry, { start: ms }))
}
function onEditEnd(entry: SleepEntry, event: Event) {
     const ms = fromLocalInput((event.target as HTMLInputElement).value)
     if (ms !== null) replace(entry, editEntry(entry, { end: ms }))
}

// Live readout: ticking active duration for a running timer; final duration for
// a stopped one. formatDuration works in minutes.
function durationLabel(entry: SleepEntry): string {
     return formatDuration(elapsedMs(entry, now.value) / 60000)
}
</script>

<template>
     <section class="mt-8" aria-labelledby="sleep-log-heading">
          <h2 id="sleep-log-heading" class="text-slate-400 text-sm uppercase font-normal">Sleep &amp; Nap Log</h2>
          <p class="text-muted text-xs mb-3">
               One-tap timing that survives the app closing — the clock is figured from the start time, not a
               counter, so nothing is lost if you background the app or your phone restarts. Every entry is
               editable and can be backdated to any day. Stored on this device only.
          </p>

          <!-- Today's live totals -->
          <div class="flex gap-4 mb-3" aria-live="polite">
               <div>
                    <div class="text-slate-400 text-xs uppercase">Naps today</div>
                    <div class="text-xl text-slate-200 tabular-nums">{{ formatDuration(totals.napMs / 60000) }}</div>
               </div>
               <div>
                    <div class="text-slate-400 text-xs uppercase">Night today</div>
                    <div class="text-xl text-slate-200 tabular-nums">{{ formatDuration(totals.nightMs / 60000) }}</div>
               </div>
               <div>
                    <div class="text-slate-400 text-xs uppercase">Total today</div>
                    <div class="text-xl text-slate-200 tabular-nums font-medium">{{ formatDuration(totals.totalMs / 60000) }}</div>
               </div>
          </div>

          <button type="button"
               class="inline-flex items-center bg-sky-700 hover:bg-sky-600 text-white text-sm rounded px-4 min-h-11"
               v-on:click="startTimer">Start sleep timer</button>
          <button type="button"
               class="ml-2 inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-4 min-h-11"
               v-on:click="addPastEntry">Add past sleep</button>

          <!-- Two open timers: allowed (twins / caregiver overlap), but flagged. -->
          <p v-if="running > 1" role="status"
               class="text-amber-400 text-sm p-2 bg-amber-400/10 rounded mt-3">
               &#9888;&#65039; {{ running }} timers are running at once. That's fine for twins or an overlapping
               handoff — just make sure it's intentional.
          </p>

          <p v-if="!entries.length" class="text-muted text-sm mt-3">
               No sleeps logged yet. Tap “Start sleep timer” when your baby goes down.
          </p>

          <ul class="mt-3 space-y-3">
               <li v-for="entry in ordered" :key="entry.id"
                    class="rounded border border-slate-800 p-3">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                         <div class="flex items-center gap-2">
                              <!-- Nap / night label, inferred but overridable. -->
                              <div role="group" aria-label="Sleep type" class="inline-flex rounded overflow-hidden border border-slate-700">
                                   <button type="button"
                                        class="text-xs px-2.5 min-h-9"
                                        :class="entry.kind === 'nap' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
                                        :aria-pressed="entry.kind === 'nap'"
                                        v-on:click="toggleKind(entry, 'nap')">Nap</button>
                                   <button type="button"
                                        class="text-xs px-2.5 min-h-9"
                                        :class="entry.kind === 'night' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
                                        :aria-pressed="entry.kind === 'night'"
                                        v-on:click="toggleKind(entry, 'night')">Night</button>
                              </div>
                              <span class="text-slate-200 text-sm tabular-nums">{{ durationLabel(entry) }}</span>
                              <span v-if="isRunning(entry)"
                                   class="text-xs px-1.5 rounded"
                                   :class="isPaused(entry) ? 'bg-slate-700 text-slate-300' : 'bg-emerald-700/40 text-emerald-300'">
                                   {{ isPaused(entry) ? 'paused' : 'running' }}
                              </span>
                         </div>

                         <div class="flex items-center gap-2">
                              <template v-if="isRunning(entry)">
                                   <button v-if="!isPaused(entry)" type="button"
                                        class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-3 min-h-9"
                                        v-on:click="pause(entry)">Pause</button>
                                   <button v-else type="button"
                                        class="inline-flex items-center bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded px-3 min-h-9"
                                        v-on:click="resume(entry)">Resume</button>
                                   <button type="button"
                                        class="inline-flex items-center bg-rose-800 hover:bg-rose-700 text-white text-sm rounded px-3 min-h-9"
                                        v-on:click="stop(entry)">Stop</button>
                              </template>
                              <button type="button"
                                   class="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 text-sm rounded min-h-9 px-3"
                                   :aria-label="`Delete this sleep entry`"
                                   v-on:click="remove(entry)">Delete</button>
                         </div>
                    </div>

                    <!-- Overnight runaway: prompt, never auto-stop or delete. -->
                    <p v-if="isStillAsleepPrompt(entry, now)" role="status"
                         class="text-amber-400 text-sm p-2 bg-amber-400/10 rounded mt-2">
                         Still asleep? This timer has been running over 12 hours. Stop it or edit the end time if the
                         sleep already ended.
                    </p>

                    <!-- Fully editable, backdatable start/end. The date is part of the
                         input, so an entry can move to any day — no clamping to today. -->
                    <div class="flex flex-col sm:flex-row gap-2 mt-2">
                         <label class="flex-1 text-xs text-slate-400">
                              Start
                              <input type="datetime-local"
                                   class="bg-slate-800 text-slate-200 text-sm rounded block p-2 min-h-11 w-full mt-0.5"
                                   :value="toLocalInput(entry.start)"
                                   v-on:change="onEditStart(entry, $event)" />
                         </label>
                         <label class="flex-1 text-xs text-slate-400">
                              End
                              <input type="datetime-local"
                                   class="bg-slate-800 text-slate-200 text-sm rounded block p-2 min-h-11 w-full mt-0.5 disabled:opacity-50"
                                   :value="entry.end !== null ? toLocalInput(entry.end) : ''"
                                   :disabled="isRunning(entry)"
                                   :placeholder="isRunning(entry) ? 'still running' : ''"
                                   v-on:change="onEditEnd(entry, $event)" />
                         </label>
                    </div>
               </li>
          </ul>
     </section>
</template>
