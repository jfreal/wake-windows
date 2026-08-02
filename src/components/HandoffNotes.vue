<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseHandoff } from '../models/planUrl'
import { effectiveGuidanceMode, windowSlopMinutes } from '../models/GuidanceMode'
import { formatClock, formatClockRange, formatDuration } from '../models/time'
import { lastNapSnapshot, sinceLastNap, clockMinutesOf, type LastNapSnapshot } from '../models/handoffSummary'
import { loadJSON, saveJSON, storageKey } from '../models/storage'
import { planLink, planParams, schedule, sitterMode } from '../stores/plan'
import { entries } from '../stores/sleepLog'
import napUrl from '../assets/sleeping-baby2.png'

// @doc:caregiver-handoff-notes
// Caregiver handoff: an outgoing caregiver leaves a free-text note; the app
// pairs it with a rule-based "Since you last had the baby" summary (last nap +
// next window) and attaches both to a read-only handoff link (extends E01/E02).
// The incoming caregiver opens one link and sees plan + what-just-happened.
//
// Two faces, one component:
//   - Editing (parent) view: note field + live preview + Copy handoff link.
//   - Read-only (sitter) view: static text only — NO controls, so the E02
//     "zero edit controls in sitter mode" guarantee holds. Renders nothing when
//     the link carries no handoff (a plain sitter link stays unchanged).
// The summary is transparent arithmetic, never a model (G04 no-AI stance).

// The plan drives the "next window" range, and comes from stores/plan.ts in
// both modes — the live one, so the recap a parent is about to send matches the
// schedule they just edited rather than the one the page loaded with.

// The clock is read once at load, like SitterView — a live-ticking "so far" is
// out of scope for the MVP; a refresh re-reads it. (The plan is live; only the
// "now" it is measured against is fixed.)
const now = Date.now();
const nowDate = new Date(now);
const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

// --- note (editing view) ---------------------------------------------------
// Persisted on-device so a reload doesn't lose a half-written handoff. Wiped by
// "Delete all my data" like every other key.
const NOTE_KEY = storageKey('handoffNote', 1);
const note = ref<string>(sitterMode ? '' : loadJSON<string>(NOTE_KEY, ''));
function onNoteInput() {
  saveJSON(NOTE_KEY, note.value);
}

// --- since-last summary ----------------------------------------------------
// Editing view reads the live on-device log; sitter view reads the snapshot
// that rode in on the link (their device has no log of its own). The editing
// side is a computed over the shared log store, so a nap logged in the panel
// below shows up in the recap without a refresh.
const handoff = sitterMode ? parseHandoff(planParams) : null;
const napSnap = computed<LastNapSnapshot | null>(() => sitterMode
  ? (handoff?.lastNap ?? null)
  : lastNapSnapshot(entries));
const since = computed(() => sinceLastNap(napSnap.value, now));

// In the sitter view the note is whatever rode in on the link.
const shownNote = computed(() => (sitterMode ? (handoff?.note ?? '') : note.value.trim()));

// Next nap window from the plan (range, never a countdown). Same guidance-mode
// widening as the parent/sitter views so the handoff reads identically.
const slop = windowSlopMinutes(effectiveGuidanceMode(schedule.monthsSinceBirth, schedule.atypical));
const nextNap = computed(() => schedule.nextNapWindowAt(slop, nowMinutes));

// A handoff summary is worth showing when there's a note, a last nap, or a next
// window to hand over. In sitter mode a link with no handoff renders nothing.
const hasSummary = computed(() =>
  Boolean(shownNote.value) || since.value !== null || nextNap.value !== null);
const showSitterPanel = computed(() => sitterMode && handoff !== null && hasSummary.value);

// --- since-last phrasing (transparent arithmetic) --------------------------
const napLine = computed(() => {
  const s = since.value;
  if (!s) return null;
  const dur = formatDuration(s.durationMs / 60000);
  if (s.inProgress) {
    // Mid-handoff nap → "so far", not a blank.
    return `Asleep since ${formatClock(clockMinutesOf(s.start))} · ${dur} so far`;
  }
  const range = formatClockRange(clockMinutesOf(s.start), clockMinutesOf(s.end as number));
  return `Last nap ${range} · ${dur}`;
});

const nextLine = computed(() => {
  const w = nextNap.value;
  // "no more today" (not "no more naps today") on purpose: the latter contains
  // the substring "naps today", which Playwright's substring getByText would
  // collide with the SleepLog "Naps today" totals label.
  return w ? `~${formatClockRange(w.earliest, w.latest)}` : 'no more today';
});

// --- copy handoff link (editing view) --------------------------------------
const copyState = ref<'idle' | 'copied' | 'failed'>('idle');

/** Build the read-only handoff link: the live plan plus the note and last-nap
 * snapshot. `planLink` is the single link builder shared with the sitter link,
 * so the two can't drift by one of them forgetting a param — and it reads plan
 * state directly rather than scraping the address bar, so it is right even
 * before the debounced URL write has landed. */
function buildHandoffLink(): string {
  return planLink({
    view: 'sitter',
    note: note.value.trim() || null,
    napStart: napSnap.value?.start ?? null,
    napEnd: napSnap.value?.end ?? null,
  });
}

const handoffLink = ref('');
async function copyHandoffLink() {
  handoffLink.value = buildHandoffLink();
  try {
    await navigator.clipboard.writeText(handoffLink.value);
    copyState.value = 'copied';
  } catch {
    copyState.value = 'failed';
  }
}
</script>

<template>
  <!-- @doc:caregiver-handoff-notes -->

  <!-- Editing (parent) view: note field + live preview + copy link. -->
  <section v-if="!sitterMode" class="mt-6">
    <h2 class="text-slate-400 text-sm uppercase font-normal">Caregiver handoff</h2>
    <p class="text-muted text-xs mb-2">
      Leave a note for whoever has the baby next — it travels with a read-only link, next to today's plan
      and a quick "since you last had the baby" recap built from your logs. No account, nothing to edit on
      their end.
    </p>

    <label for="handoff-note" class="sr-only">Handoff note</label>
    <!-- No placeholder colour override: the global ::placeholder rule in
         style.css is slate-400 (4.5:1 on the slate-800 field); slate-500 here
         measured 3.07:1. -->
    <textarea id="handoff-note" v-model="note" v-on:input="onNoteInput" rows="2"
      class="w-full bg-slate-800 text-slate-200 text-sm rounded p-2"
      placeholder="e.g. Fed at 2pm, a bit cranky, next nap ~4."></textarea>

    <!-- Live preview of what the incoming caregiver will see. -->
    <div class="mt-3 bg-slate-800/60 rounded-lg p-3">
      <span class="text-slate-400 text-xs uppercase">Since you last had the baby</span>
      <p v-if="napLine" class="text-slate-200 text-sm mt-1">{{ napLine }}</p>
      <p v-else class="text-slate-400 text-sm mt-1">No naps logged yet.</p>
      <p class="text-slate-300 text-sm mt-1">
        Next nap <span class="tabular-nums">{{ nextLine }}</span>
      </p>
      <!-- Feed line intentionally absent: the C02 feeding log isn't built yet,
           so there's no source to read. It lights up here once C02 lands
           (do not fabricate a last feed). -->
    </div>

    <button type="button" class="btn btn-quiet mt-3"
      v-on:click="copyHandoffLink">Copy handoff link</button>
    <span v-if="copyState === 'copied'" role="status" class="ml-2 text-emerald-400 text-sm">Copied!</span>
    <p v-if="copyState === 'failed'" class="text-slate-300 text-xs mt-2 break-all select-all">{{ handoffLink }}</p>
  </section>

  <!-- Read-only (sitter) view: static text only, no controls. Renders nothing
       for a plain sitter link that carries no handoff. -->
  <section v-else-if="showSitterPanel" class="mt-6 bg-slate-800 rounded-lg p-4">
    <span class="flex items-center gap-2 text-slate-400 text-sm uppercase">
      <img :src="napUrl" class="h-5 w-5" alt="" aria-hidden="true" width="20" height="20" /> Since you last had the baby
    </span>
    <p v-if="shownNote" class="text-slate-200 mt-2 whitespace-pre-line">{{ shownNote }}</p>
    <p v-if="napLine" class="text-slate-300 text-sm mt-2 tabular-nums">{{ napLine }}</p>
    <p class="text-slate-300 text-sm mt-1">
      Next nap <span class="tabular-nums">{{ nextLine }}</span>
    </p>
    <!-- muted-raised: this panel sits on slate-800, where plain `muted` is 4.13:1. -->
    <p class="text-muted-raised text-xs mt-2">A recap of what just happened — times are ranges, not deadlines.</p>
  </section>
</template>
