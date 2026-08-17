<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  addSibling,
  planLink,
  removeSibling,
  schedule,
  shiftMode,
  sibling,
} from '../stores/plan'
import { openSheet } from '../stores/sheet'
import { scheduleShorthand } from '../models/planUrl'
import ChildInputs from '../components/ChildInputs.vue'
import PlanWarnings from '../components/PlanWarnings.vue'
import PersonalizedWindows from '../components/PersonalizedWindows.vue'
import DstShift from '../components/DstShift.vue'
import RemindersNudges from '../components/RemindersNudges.vue'
import WhiteNoise from '../components/WhiteNoise.vue'
import CalendarExport from '../components/CalendarExport.vue'
import HandoffNotes from '../components/HandoffNotes.vue'
import PrivacyPromise from '../components/PrivacyPromise.vue'
import NoAiStance from '../components/NoAiStance.vue'
import DeleteData from '../components/DeleteData.vue'
import TipJar from '../components/TipJar.vue'

// @doc:shareable-plan-url @doc:read-only-babysitter-mode
//
// Settings. The plan's inputs, the ways it leaves this device, and the promises
// about what does not.
//
// The inputs used to be the left-hand column of the home screen, permanently on
// display. They are answers to questions asked roughly once a month — birthday,
// gestational weeks, wake time, bedtime, wake-window lengths — and they were
// competing with a countdown that changes every minute. Moving them here is the
// single biggest reason the Today screen fits on a phone.
//
// Two columns from `lg`: the plan itself on the left, everything that acts on it
// or promises something about it on the right.

// @doc:read-only-babysitter-mode — built from the same canonical query as the
// address bar, so the sitter link carries the whole plan.
const sitterLink = computed(() => planLink({ view: 'sitter' }))

const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
async function copySitterLink() {
  try {
    await navigator.clipboard.writeText(sitterLink.value)
    copyState.value = 'copied'
  } catch {
    // Clipboard can be unavailable (permissions, non-secure context); show the
    // link itself so it can be copied by hand.
    copyState.value = 'failed'
  }
}

function openTiers() {
  openSheet({
    tier: 1,
    title: 'What the tiers mean',
    body: [
      'Tier 1 — evidence-based. Backed by peer-reviewed research or a professional body such as '
      + 'the AAP. Your total-sleep and nap-count ranges sit here, and so does the safe-sleep '
      + 'guidance.',
      'Tier 2 — practice-based heuristic. Widely used by clinicians and sleep consultants, but not '
      + 'established by trial. Your wake-window minutes sit here — which is why every nap time in '
      + 'this app is a range rather than a time.',
      'Tier 3 — practitioner convention. A plausible mechanism with no direct study of the '
      + 'specific protocol, like the ~15 min/day daylight-saving ramp.',
      'Every number is labelled so you know how hard to hold it. Nothing here is medical advice, '
      + 'and nothing about your baby leaves your phone.',
    ],
    sourceNote: 'Full source list under Learn → “Where these numbers come from”.',
  })
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="display text-3xl text-slate-200 lg:text-4xl">Settings</h2>

    <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
      <!-- Left: the plan. -->
      <div class="space-y-6">
        <section aria-labelledby="plan-heading">
          <h3 id="plan-heading" class="eyebrow">Your plan</h3>

          <!-- The shorthand: wake hour, each wake window, bedtime hour. It is
               the plan's identity — the same string that rides the URL — so it
               belongs where the plan is edited, reading back what the controls
               below add up to. -->
          <p class="display text-2xl text-slate-200 mt-1">{{ scheduleShorthand(schedule) }}</p>

          <!-- Beside the inputs, where the mistake was made. -->
          <div class="mt-3">
            <PlanWarnings />
          </div>

          <div class="card p-5 mt-3">
            <h4 v-if="sibling" class="eyebrow mb-2">Baby A</h4>
            <ChildInputs :schedule="schedule" id-prefix="" />
          </div>

          <!-- @doc:sibling-twins-alignment — a second child is opt-in; one child
               stays the default shape of the app. -->
          <div v-if="!sibling" class="mt-3">
            <button type="button" class="btn btn-quiet" v-on:click="addSibling">+ Add sibling / twin</button>
            <p class="text-muted text-xs mt-1.5">
              Plan two children together and see when their naps line up.
            </p>
          </div>

          <div v-else class="card p-5 mt-3">
            <div class="flex items-center justify-between gap-2 mb-2">
              <h4 class="eyebrow">Baby B</h4>
              <button type="button" class="btn btn-quiet" v-on:click="removeSibling">Remove</button>
            </div>
            <p class="display text-2xl text-slate-200 mb-2">{{ scheduleShorthand(sibling) }}</p>
            <ChildInputs :schedule="sibling" id-prefix="b-" />
          </div>
        </section>

        <!-- @doc:personalized-from-local-history — opt-in refinement from the
             baby's own logged history. The age plan is complete without it. -->
        <PersonalizedWindows :schedule="schedule" />

        <!-- @doc:dst-timezone-shift -->
        <DstShift :schedule="schedule" v-model="shiftMode" />
      </div>

      <!-- Right: what acts on the plan, and what we promise about it. -->
      <div class="space-y-6">
        <section class="card p-5" aria-labelledby="handoff-heading">
          <h3 id="handoff-heading" class="display text-xl text-slate-200">Handing off</h3>
          <p class="text-sm text-muted mt-1.5 text-pretty">
            A read-only page with today's next nap and bedtime. No account, nothing they can change.
          </p>
          <div class="flex flex-wrap items-center gap-2 mt-3">
            <button type="button" class="btn btn-quiet" v-on:click="copySitterLink">Copy sitter link</button>
            <span v-if="copyState === 'copied'" role="status" class="text-emerald-400 text-sm">Copied!</span>
          </div>
          <p v-if="copyState === 'failed'" class="text-slate-300 text-xs mt-2 break-all select-all">{{ sitterLink }}</p>

          <!-- @doc:calendar-export — client-side .ics of today's naps + bedtime.
               The other way the plan leaves this device, so it sits in the same
               card as the sitter link rather than somewhere else entirely. -->
          <div class="border-t border-paper-sunk mt-4 pt-4">
            <CalendarExport />
          </div>
        </section>

        <!-- @doc:caregiver-handoff-notes -->
        <HandoffNotes />

        <!-- @doc:reminders-nudges — opt-in pre-nap wind-down nudge. -->
        <RemindersNudges />

        <!-- @doc:white-noise-sounds — opt-in sound machine, hidden until on. -->
        <WhiteNoise />

        <button type="button" class="card w-full p-5 text-left hover:border-line-strong"
          v-on:click="openTiers">
          <span class="display block text-xl text-slate-200">How we label evidence</span>
          <span class="block text-sm text-muted mt-1 text-pretty">
            What Tier 1 and Tier 2 mean, and which parts of your plan are which.
          </span>
        </button>

        <PrivacyPromise />

        <!-- @doc:no-ai-no-data-training -->
        <NoAiStance />

        <div class="border-t border-line pt-5 space-y-3">
          <DeleteData />
          <TipJar />
        </div>
      </div>
    </div>
  </div>
</template>
