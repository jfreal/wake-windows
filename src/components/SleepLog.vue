<script setup lang="ts">
import { computed, ref } from 'vue'
import {
     type SleepEntry,
     type SleepKind,
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
} from '../models/sleepLog'
import { formatClock, formatDuration } from '../models/time'
import { minutesFromMidnight } from '../models/today'
import { entries, now } from '../stores/sleepLog'
import napUrl from '../assets/sleeping-baby2.png'
import moonUrl from '../assets/moon.png'

// @doc:sleep-nap-logging
// Thin shell over models/sleepLog.ts. All correctness (background-safe elapsed,
// pause/resume, midnight backdating, daily totals) is proven in that module's
// unit tests; this component only renders it and wires user input. Local-only:
// entries live in localStorage (ww.sleepLog.v1), wiped by "Delete all my data".

// The running clock is COMPUTED from stored timestamps; the shared `now` is a
// display-only tick so the elapsed readout advances. Timestamps are the source
// of truth, so backgrounding or restarting the device never loses time.
//
// Both the log and the clock come from stores/sleepLog.ts, which owns the
// single adaptive ticker (1s while something is running, 60s idle, stopped
// while hidden) and the debounced write-back. The "Today" panel above reads the
// same array, so it sees edits made here with no re-parse of localStorage.

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

// "8:45 – 10:00 AM", or "8:45 AM –" while it is still going.
function timeLabel(entry: SleepEntry): string {
     const start = formatClock(minutesFromMidnight(new Date(entry.start)))
     if (entry.end === null) return `${start} –`
     return `${start} – ${formatClock(minutesFromMidnight(new Date(entry.end)))}`
}

// Which entries have their editor open.
//
// The redesign's rule for this screen is "no forms": the log is a list of what
// happened, and the datetime pair that used to sit under every single row turned
// three logged naps into six date fields on screen. Correcting a time is a real
// need and a rare one, so it gets a control (Edit) rather than permanent
// residency. The row itself still shows everything — kind, length, clock times —
// so nothing is hidden behind the toggle except the means of changing it.
const editing = ref(new Set<string>())

function toggleEdit(entry: SleepEntry) {
     const next = new Set(editing.value)
     if (next.has(entry.id)) next.delete(entry.id)
     else next.add(entry.id)
     editing.value = next
}
</script>

<template>
     <section class="mt-8" aria-labelledby="sleep-log-heading">
          <h2 id="sleep-log-heading" class="eyebrow">Sleep &amp; Nap Log</h2>
          <p class="text-muted text-xs mb-3">
               One-tap timing that survives the app closing — the clock is figured from the start time, not a
               counter, so nothing is lost if you background the app or your phone restarts. Every entry is
               editable and can be backdated to any day. Stored on this device only.
          </p>

          <!-- Today's live totals -->
          <div class="flex gap-4 mb-3" aria-live="polite">
               <div>
                    <div class="eyebrow">Naps today</div>
                    <div class="text-xl text-slate-200 tabular-nums">{{ formatDuration(totals.napMs / 60000) }}</div>
               </div>
               <div>
                    <div class="eyebrow">Night today</div>
                    <div class="text-xl text-slate-200 tabular-nums">{{ formatDuration(totals.nightMs / 60000) }}</div>
               </div>
               <div>
                    <div class="eyebrow">Total today</div>
                    <div class="text-xl text-slate-200 tabular-nums font-medium">{{ formatDuration(totals.totalMs / 60000) }}</div>
               </div>
          </div>

          <!-- Neither starting a sleep nor backfilling one happens in here. The
               big circular control and the two quick actions above own those,
               because two controls answering to "start the timer" is one too
               many and the one a tired thumb should find is the one the size of
               the screen. This panel is the record and the corrections. -->

          <!-- Two open timers: allowed (twins / caregiver overlap), but flagged. -->
          <p v-if="running > 1" role="status"
               class="text-amber-400 text-sm p-2 bg-amber-400/10 rounded mt-3">
               &#9888;&#65039; {{ running }} timers are running at once. That's fine for twins or an overlapping
               handoff — just make sure it's intentional.
          </p>

          <p v-if="!entries.length" class="text-muted text-sm mt-3">
               No sleeps logged yet. Tap the big circle above when your baby goes down.
          </p>

          <ul v-if="entries.length" class="card mt-3 overflow-hidden">
               <li v-for="(entry, i) in ordered" :key="entry.id"
                    class="px-4 py-3.5" :class="i > 0 ? 'border-t border-paper-sunk' : ''">
                    <!-- The row: what happened, when, and one way in. Everything
                         that CHANGES the entry is behind Edit; everything that
                         reports on it is right here. -->
                    <div class="flex items-center gap-3.5">
                         <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full"
                              :style="{ background: entry.kind === 'night' ? 'var(--color-cyan-500)' : 'var(--color-violet-500)' }">
                              <img :src="entry.kind === 'night' ? moonUrl : napUrl" alt="" aria-hidden="true"
                                   width="17" height="17" class="h-4 w-4" />
                         </span>
                         <span class="min-w-0 flex-1">
                              <span class="block text-[15px] text-slate-200">
                                   {{ entry.kind === 'night' ? 'Night sleep' : 'Nap' }} ·
                                   <span class="tabular-nums">{{ durationLabel(entry) }}</span>
                                   <span v-if="isRunning(entry)" class="text-xs ml-1.5 px-1.5 py-0.5 rounded-full"
                                        :class="isPaused(entry) ? 'bg-slate-700 text-slate-200' : 'bg-emerald-400/15 text-emerald-400'">
                                        {{ isPaused(entry) ? 'paused' : 'running' }}
                                   </span>
                              </span>
                              <span class="block text-xs text-muted tabular-nums">{{ timeLabel(entry) }}</span>
                         </span>

                         <span class="flex items-center gap-1.5">
                              <template v-if="isRunning(entry)">
                                   <button v-if="!isPaused(entry)" type="button"
                                        class="btn btn-quiet px-3"
                                        v-on:click="pause(entry)">Pause</button>
                                   <button v-else type="button"
                                        class="btn btn-quiet px-3"
                                        v-on:click="resume(entry)">Resume</button>
                                   <!-- Raised tone, not red. Stopping a timer is not
                                        destructive, and red is not in this palette —
                                        out-of-range and warnings are amber-brown so a
                                        tired parent is informed, never alarmed. -->
                                   <button type="button"
                                        class="btn bg-slate-700 hover:bg-slate-600 text-slate-100 px-3"
                                        v-on:click="stop(entry)">Stop</button>
                              </template>
                              <button type="button" class="btn-inline no-underline"
                                   :aria-expanded="editing.has(entry.id)"
                                   v-on:click="toggleEdit(entry)">
                                   {{ editing.has(entry.id) ? 'Done' : 'Edit' }}
                              </button>
                         </span>
                    </div>

                    <!-- Overnight runaway: prompt, never auto-stop or delete. -->
                    <p v-if="isStillAsleepPrompt(entry, now)" role="status"
                         class="text-amber-400 text-sm p-2 bg-amber-400/10 rounded-sm mt-2">
                         Still asleep? This timer has been running over 12 hours. Stop it or edit the end time if the
                         sleep already ended.
                    </p>

                    <div v-if="editing.has(entry.id)" class="mt-3 border-t border-paper-sunk pt-3">
                         <!-- Nap / night label, inferred but overridable.
                              Nap/night keep the day-arc colours on purpose: here
                              they label which kind of sleep this was, the same
                              meaning the two bands carry on the day strip. -->
                         <div role="group" aria-label="Sleep type" class="inline-flex rounded-full overflow-hidden border border-line-strong">
                              <button type="button"
                                   class="btn text-xs px-4 rounded-none"
                                   :class="entry.kind === 'nap' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
                                   :aria-pressed="entry.kind === 'nap'"
                                   v-on:click="toggleKind(entry, 'nap')">Nap</button>
                              <button type="button"
                                   class="btn text-xs px-4 rounded-none"
                                   :class="entry.kind === 'night' ? 'bg-cyan-700 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'"
                                   :aria-pressed="entry.kind === 'night'"
                                   v-on:click="toggleKind(entry, 'night')">Night</button>
                         </div>

                         <!-- Fully editable, backdatable start/end. The date is part of
                              the input, so an entry can move to any day — no clamping to
                              today. -->
                         <div class="flex flex-col sm:flex-row gap-2 mt-2">
                              <label class="flex-1 text-xs text-muted">
                                   Start
                                   <input type="datetime-local"
                                        class="field mt-0.5"
                                        :value="toLocalInput(entry.start)"
                                        v-on:change="onEditStart(entry, $event)" />
                              </label>
                              <label class="flex-1 text-xs text-muted">
                                   End
                                   <input type="datetime-local"
                                        class="field mt-0.5"
                                        :value="entry.end !== null ? toLocalInput(entry.end) : ''"
                                        :disabled="isRunning(entry)"
                                        :placeholder="isRunning(entry) ? 'still running' : ''"
                                        v-on:change="onEditEnd(entry, $event)" />
                              </label>
                         </div>

                         <!-- Quieter ink than its neighbours, and one level in:
                              deleting should never be the easiest thing to hit by
                              accident. -->
                         <button type="button"
                              class="btn btn-quiet px-3 mt-2 text-muted"
                              :aria-label="`Delete this sleep entry`"
                              v-on:click="remove(entry)">Delete</button>
                    </div>
               </li>
          </ul>

          <p class="text-xs text-muted mt-2 px-1 text-pretty">
               Tap Edit on any entry to nudge its time — including to another day. Nothing here leaves
               your device.
          </p>
     </section>
</template>
