<script setup lang="ts">
import Summary from './components/Summary.vue'
import { meta } from './models/Citations'
</script>

<template>
  <div class="max-w-3xl mx-auto px-4">

    <Summary />

    <footer class="mt-8 border-t border-slate-800 pt-3 pb-6 text-slate-500 text-xs">
      <p>{{ meta.disclaimer }}</p>
      <p class="mt-1">Guidance last reviewed: {{ meta.lastVerified }}.</p>
    </footer>
  </div>
</template>
