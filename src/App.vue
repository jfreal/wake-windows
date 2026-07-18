<script setup lang="ts">
import OfflineIndicator from './components/OfflineIndicator.vue'
import Summary from './components/Summary.vue'
import PrivacyPromise from './components/PrivacyPromise.vue'
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

    <OfflineIndicator />

    <Summary />

    <div v-if="!sitterMode" class="mt-6">
      <PrivacyPromise />
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
