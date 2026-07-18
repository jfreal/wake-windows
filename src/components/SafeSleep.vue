<script setup lang="ts">
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:safe-sleep-panel @doc:accessibility-dark-room
// Safe-sleep guidance is Tier 1 and applies to every nap and night (spec §7).
const essentials = [
     'Place baby fully on their back for every sleep, day and night, until age 1.',
     'Use a firm, flat, non-inclined surface; no soft bedding, pillows, or bumpers.',
     'Room-share without bed-sharing, ideally for the first 6 months.',
]
const sources = getSources(['aap-safesleep-2022', 'nichd-safetosleep', 'lullaby-trust-2025'])
</script>

<template>
     <div class="rounded border border-emerald-700/50 bg-emerald-900/15 p-3">
          <div class="flex flex-wrap items-center gap-2">
               <h2 class="text-emerald-300 text-sm font-semibold uppercase">Safe sleep</h2>
               <TierBadge :tier="1" />
          </div>
          <ul class="mt-2 space-y-1 text-sm text-slate-200 list-disc pl-5">
               <li v-for="point in essentials" :key="point">{{ point }}</li>
          </ul>
          <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
               <a
                    v-for="src in sources"
                    :key="src.id"
                    :href="src.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center min-h-11 text-sky-400 hover:text-sky-300 underline underline-offset-2"
               >{{ src.org }} <span aria-hidden="true" class="text-muted">&nbsp;↗</span></a>
          </div>
     </div>
</template>
