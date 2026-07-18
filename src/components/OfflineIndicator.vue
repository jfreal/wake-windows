<script setup lang="ts">
// @doc:offline-mode
// F07 Offline Mode: honest connectivity status + service-worker update flow.
// Everything is computed on-device from the URL, so offline loses nothing —
// this banner says so instead of letting the browser surface errors. The
// paired update prompt is the cache-versioning strategy: registerType
// 'prompt' means a new deploy never silently pins old logic or citations;
// the user refreshes into the new service worker when they choose.
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const offline = ref(!navigator.onLine)
const goOffline = () => { offline.value = true }
const goOnline = () => { offline.value = false }

onMounted(() => {
  window.addEventListener('offline', goOffline)
  window.addEventListener('online', goOnline)
})
onBeforeUnmount(() => {
  window.removeEventListener('offline', goOffline)
  window.removeEventListener('online', goOnline)
})

const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true })
</script>

<template>
  <div v-if="offline" role="status"
    class="sticky top-0 z-50 -mx-4 mb-2 bg-slate-800 border-b border-slate-700 px-4 py-2 text-sm text-slate-200">
    <span class="inline-block w-2 h-2 rounded-full bg-amber-300 mr-2 align-middle" aria-hidden="true"></span>
    Offline — your plan still works. Schedules and guidance are computed on this device.
  </div>

  <div v-else-if="needRefresh" role="status"
    class="sticky top-0 z-50 -mx-4 mb-2 bg-slate-800 border-b border-slate-700 px-4 py-2 text-sm text-slate-200 flex items-center gap-3 flex-wrap">
    <span>Update available — refresh to get the latest guidance and fixes.</span>
    <!-- hover darkens (sky-800): white on sky-600 measures 4.1:1 and fails AA.
         44px targets; slate-400, not muted, clears 4.5:1 on the slate-800 banner. -->
    <button class="bg-sky-700 hover:bg-sky-800 text-white rounded px-3 py-1 min-h-11"
      @click="updateServiceWorker()">Refresh</button>
    <button class="text-slate-400 hover:text-slate-200 underline px-2 py-1 min-h-11"
      @click="needRefresh = false">Not now</button>
  </div>
</template>
