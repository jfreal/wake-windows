<script setup lang="ts">
import SleepToggle from '../components/SleepToggle.vue'
import QuickLogActions from '../components/QuickLogActions.vue'
import SleepLog from '../components/SleepLog.vue'
import TrendsToday from '../components/TrendsToday.vue'

// @doc:sleep-nap-logging @doc:trends-daily-totals
//
// Log. One enormous toggle, then the corrections, then the week.
//
// Deliberately no forms above the fold and no per-event categories: this app
// logs sleep and nothing else, so the screen only has to do one thing well.
// Everything below the toggle exists for fixing a time you got wrong, which is
// the second-most-common thing that happens here and nowhere near as urgent.
//
// Two columns from `lg`: the control on the left, the record on the right, so
// the toggle stays a target rather than growing to the width of a desk monitor.
</script>

<template>
  <div class="space-y-6">
    <h2 class="display text-3xl text-slate-200 lg:text-4xl">Log</h2>

    <div class="grid gap-6 lg:grid-cols-2 lg:items-start">
      <div class="space-y-4">
        <SleepToggle />
        <QuickLogActions />
      </div>

      <div class="space-y-6">
        <SleepLog />

        <!-- @doc:trends-daily-totals — today's totals and the 7-day shape, from
             the same on-device log the list above writes to. -->
        <TrendsToday />
      </div>
    </div>
  </div>
</template>
