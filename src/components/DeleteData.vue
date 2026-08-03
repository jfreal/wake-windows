<script lang="ts">
// @doc:ephemerality-data-deletion
// One-click "delete all my data": clears site storage, strips the plan from
// the URL, and reloads to a fresh default state so nothing of the user's
// survives in memory either. A `#deleted` hash carries the one-shot "it
// worked" flag across the reload — deliberately not storage, since storage
// is exactly what we just promised to empty.
//
// This runs at module scope so the flag is read before Summary's URL watcher
// rewrites the address bar (which drops the hash).
const cameFromDelete = window.location.hash === '#deleted'
if (cameFromDelete) {
     history.replaceState(null, '', window.location.pathname)
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { stopPersisting } from '../stores/sleepLog'

const justDeleted = ref(cameFromDelete)

function deleteAll() {
     // Shut the sleep-log store's write-back down FIRST. It debounces saves, so
     // a write queued moments ago — or its flush-on-hidden, which a reload can
     // trigger — would land after the clear and write the log straight back out.
     stopPersisting()
     // Storage can throw in some privacy modes; deletion must still proceed.
     try { localStorage.clear() } catch { /* nothing stored anyway */ }
     try { sessionStorage.clear() } catch { /* nothing stored anyway */ }
     history.replaceState(null, '', window.location.pathname + '#deleted')
     window.location.reload()
}
</script>

<template>
     <div>
          <p
               v-if="justDeleted"
               role="status"
               class="rounded border border-emerald-700/50 bg-emerald-900/15 p-3 text-sm text-emerald-300 mb-3"
          >
               All gone. The plan was removed from this browser's link and this device's
               storage for this site is empty; the page restarted with defaults. Nothing was
               ever stored on a server. If you shared your plan link with someone, that copy
               lives wherever you sent it — this cleared everything on your side.
          </p>

          <div class="flex flex-col sm:flex-row sm:items-center gap-2">
               <button
                    type="button"
                    class="btn btn-quiet shrink-0 text-slate-300"
                    v-on:click="deleteAll"
               >Delete all my data</button>
               <p class="text-muted text-xs">
                    One click, really gone — your plan lives only in the link and on this device.
                    This tool is temporary by design: when your baby outgrows naps you won't need
                    it, and there's no account to close and no subscription to cancel.
               </p>
          </div>
     </div>
</template>
