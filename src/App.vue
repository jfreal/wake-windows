<script setup lang="ts">
import OfflineIndicator from './components/OfflineIndicator.vue'
import Summary from './components/Summary.vue'
import TrendsToday from './components/TrendsToday.vue'
import SleepLog from './components/SleepLog.vue'
import PrivacyPromise from './components/PrivacyPromise.vue'
import CalendarExport from './components/CalendarExport.vue'
import NoAiStance from './components/NoAiStance.vue'
import AccessibilityStatement from './components/AccessibilityStatement.vue'
import TipJar from './components/TipJar.vue'
import DeleteData from './components/DeleteData.vue'
import { meta } from './models/Citations'

// @doc:accessibility-dark-room

// @doc:read-only-babysitter-mode
// A shared sitter link renders only the plan: no delete-data control, tip jar,
// or app panels — the sitter sees today's schedule and the disclaimer, nothing
// that changes state or asks anything of them.
const sitterMode = new URLSearchParams(window.location.search).get('view') === 'sitter';
</script>

<template>
  <main class="max-w-3xl mx-auto px-4">

    <!-- @doc:read-only-babysitter-mode — the update prompt renders Refresh /
         Not-now buttons, so it stays out of the read-only sitter view. -->
    <OfflineIndicator v-if="!sitterMode" />

    <Summary />

    <!-- @doc:trends-daily-totals — glanceable "Today" totals + 7-day sparkline,
         built purely from on-device logs. Additive; hidden in the read-only
         sitter view like the other state-reading panels. -->
    <TrendsToday v-if="!sitterMode" />

    <!-- @doc:sleep-nap-logging — logging mutates on-device data, so it is hidden
         in the read-only sitter view, like the other state-changing panels. -->
    <SleepLog v-if="!sitterMode" />

    <div v-if="!sitterMode" class="mt-6">
      <PrivacyPromise />
    </div>

    <!-- @doc:calendar-export — client-side .ics export of today's naps + bedtime.
         State-reading only, but hidden in the read-only sitter view like the
         other app panels. -->
    <div v-if="!sitterMode" class="mt-6">
      <CalendarExport />
    </div>

    <!-- @doc:no-ai-no-data-training — stance sits with the privacy promise;
         the arithmetic walk it points to lives under the nap schedule. -->
    <div v-if="!sitterMode" class="mt-3">
      <NoAiStance />
    </div>

    <div v-if="!sitterMode" class="mt-3">
      <AccessibilityStatement />
    </div>

    <footer class="mt-8 border-t border-slate-800 pt-3 pb-6 text-muted text-xs space-y-3">
      <template v-if="!sitterMode">
        <DeleteData />
        <TipJar />
      </template>
      <p>{{ meta.disclaimer }}</p>
      <p class="mt-1">Guidance last reviewed: {{ meta.lastVerified }}.</p>
    </footer>
  </main>
</template>
