<script setup lang="ts">
import { computed } from 'vue'
import { effectiveGuidanceMode, windowSlopMinutes } from '../models/GuidanceMode'
import { formatClock } from '../models/time'
import { minutesFromMidnight } from '../models/today'
import { schedule, sibling } from '../stores/plan'
import { openSheet } from '../stores/sheet'
import { now } from '../stores/sleepLog'
import PlanWarnings from '../components/PlanWarnings.vue'
import TodayHero from '../components/TodayHero.vue'
import DayStrip from '../components/DayStrip.vue'
import RestOfDay from '../components/RestOfDay.vue'
import NormalRanges from '../components/NormalRanges.vue'
import RecentSleep from '../components/RecentSleep.vue'
import GuidanceBanner from '../components/GuidanceBanner.vue'
import AtypicalDayFlag from '../components/AtypicalDayFlag.vue'
import NapTransition from '../components/NapTransition.vue'
import SiblingAlignment from '../components/SiblingAlignment.vue'
import TierWhyButton from '../components/TierWhyButton.vue'

// @doc:wake-window-schedule-generator @doc:anti-anxiety-mechanics
//
// Today. The answer, then the day, then the evidence — in that order and no
// other, because the order IS the redesign.
//
// One column on a phone; two from `lg`, where the countdown and the picture of
// the day sit on the left and the things you read *about* that day — the
// reassurance note, the schedule, what has actually been logged — sit on the
// right. It is the same content in the same order, wrapped: nothing appears on
// one that is missing from the other.
//
// What is deliberately NOT here: the plan inputs (Settings), the log's editing
// controls (Log), and every guidance panel (Learn). This screen used to carry
// all of them, which meant the countdown a parent came for arrived at the same
// visual weight as the tier explainer. Anything that does not help answer "what
// now" has moved.

// @doc:cues-vs-clock-mode @doc:atypical-day-flag
const guidanceMode = computed(() => effectiveGuidanceMode(schedule.monthsSinceBirth, schedule.atypical))
const windowSlop = computed(() => windowSlopMinutes(guidanceMode.value))
const cuesFirst = computed(() => guidanceMode.value !== 'clock')

const ageLabel = computed(() =>
  `${schedule.monthsSinceBirth} months · ${schedule.weeksSinceBirth} weeks`)

// "Saturday 16 August · it's 2:14 PM" — the desktop header line. Locale-aware
// rather than hand-formatted, so it reads correctly outside en-US.
const dateLabel = computed(() =>
  new Date(now.value).toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  }))
const clockLabel = computed(() => formatClock(minutesFromMidnight(new Date(now.value))))

// @doc:anti-anxiety-mechanics
// The reassurance note. It is a fixed Tier 1 statement, not a daily verdict on
// how the day went — a component that grades the day is precisely what this app
// has committed to not being. It says the same calm thing every day because the
// evidence says the same calm thing every day.
function openWhyNormal() {
  openSheet({
    tier: 1,
    title: 'Healthy babies vary this much',
    body: [
      'Longitudinal data following the same children for years shows a wide normal band at every '
      + 'age — roughly a two- to three-hour spread in total daily sleep among perfectly healthy '
      + 'infants.',
      'A short nap or a stretched window moves you around inside that band. It does not move you '
      + 'out of it, and there is nothing to make up for tomorrow.',
      'If you find yourself checking the clock more than the baby, that is the signal to put the '
      + 'phone down.',
    ],
    sourceIds: ['iglowstein-2003'],
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div>
        <h2 class="display text-3xl text-slate-200 lg:text-4xl">Today</h2>
        <p class="text-sm text-muted mt-1">
          <span class="hidden sm:inline">{{ dateLabel }} · it's {{ clockLabel }} · </span>{{ ageLabel }}
        </p>
      </div>
    </div>

    <PlanWarnings link-to-settings />

    <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
      <!-- Left: the answer, and the picture of the day it comes from. -->
      <div class="space-y-6">
        <TodayHero :schedule="schedule" :slop-minutes="windowSlop" />

        <DayStrip :schedule="schedule" />

        <NormalRanges :schedule="schedule" />
      </div>

      <!-- Right: what to read about that day. -->
      <div class="space-y-6">
        <!-- @doc:anti-anxiety-mechanics -->
        <section class="card p-5">
          <h2 class="display text-xl text-slate-200">Today is fine</h2>
          <p class="text-sm text-slate-300 leading-relaxed mt-1.5 text-pretty">
            Short naps, stretched windows and a late bedtime all sit inside normal. Healthy babies
            vary this much day to day — there is nothing to make up for tomorrow.
          </p>
          <div class="flex flex-wrap items-center gap-2 mt-2">
            <TierWhyButton :tier="1" v-on:click="openWhyNormal" />
            <button type="button" class="btn-inline no-underline" v-on:click="openWhyNormal">
              Why we can say that
            </button>
          </div>
        </section>

        <!-- @doc:cues-vs-clock-mode @doc:atypical-day-flag -->
        <GuidanceBanner :months="schedule.monthsSinceBirth" :atypical="schedule.atypical"
          :atypical-reason="schedule.atypicalReason" />

        <RestOfDay :schedule="schedule" :slop-minutes="windowSlop" :cues-first="cuesFirst" />

        <!-- @doc:sleep-nap-logging — the record beside the plan, read-only. -->
        <RecentSleep />
      </div>
    </div>

    <!-- Full width, below the fold on every size: things that only sometimes
         have something to say. -->
    <div class="space-y-6">
      <!-- @doc:nap-transition-detector — dismissible readiness prompt; only
           speaks up when the log actually suggests a transition. -->
      <NapTransition />

      <!-- @doc:atypical-day-flag — one tap, and the whole day gets more slack. -->
      <AtypicalDayFlag :schedule="schedule" />

      <!-- @doc:sibling-twins-alignment — a second child's day stacked against
           the first, with the shared quiet block called out. -->
      <SiblingAlignment v-if="sibling" :a="schedule" :b="sibling" />
    </div>
  </div>
</template>
