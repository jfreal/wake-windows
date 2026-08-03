<script setup lang="ts">
import { computed } from 'vue'
import { sources, tiers, meta, getTier } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:methodology-sources-page
// Full citation library grouped by tier, with the "what do these tiers mean?"
// explainer (spec §6).
const byTier = computed(() =>
     [1, 2, 3]
          .map((id) => ({
               tier: getTier(id),
               sources: sources
                    .filter((s) => s.tier === id)
                    .sort((a, b) => a.org.localeCompare(b.org)),
          }))
          // Tier 3 currently labels conventions (e.g. the DST shift ramp)
          // rather than a source library; skip empty groups.
          .filter((group) => group.sources.length > 0)
)
</script>

<template>
     <details class="rounded border border-slate-800">
          <!-- py-3: 20px line + 24px padding = 44px tap target for the disclosure -->
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Sources &amp; Evidence
               <span class="text-muted font-normal">— {{ sources.length }} citations, by tier</span>
          </summary>

          <div class="px-3 pb-3 space-y-5">
               <!-- Tier explainer -->
               <div class="space-y-2">
                    <p class="text-slate-400 text-xs uppercase">What do these tiers mean?</p>
                    <div v-for="t in [tiers['1'], tiers['2'], tiers['3']]" :key="t.id" class="text-xs">
                         <TierBadge :tier="t.id" />
                         <p class="text-slate-400 mt-1">{{ t.description }}</p>
                         <p class="text-muted mt-0.5"><span class="text-slate-400">Applies to:</span> {{ t.appliesTo }}</p>
                    </div>
                    <p class="text-muted text-xs italic">
                         No randomized trial, cohort study, or systematic review validates specific wake-window
                         durations; the term does not appear in the pediatric sleep-medicine literature. Independent
                         medical sources publish wider ranges than consultant brands — a reminder the exact numbers are
                         convention.
                    </p>
               </div>

               <!-- Library by tier -->
               <div v-for="group in byTier" :key="group.tier.id" class="space-y-3">
                    <div class="flex items-center gap-2 border-t border-slate-800 pt-3">
                         <TierBadge :tier="group.tier.id" />
                         <span class="text-muted text-xs">{{ group.sources.length }} sources</span>
                    </div>
                    <div v-for="src in group.sources" :key="src.id" class="text-xs">
                         <div class="flex flex-wrap items-center gap-2">
                              <span class="text-muted uppercase">{{ src.type }}</span>
                              <span class="text-muted">{{ src.year }}</span>
                         </div>
                         <a
                              :href="src.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="inline-block py-1.5 text-sky-400 hover:text-sky-300 underline underline-offset-2"
                         >{{ src.title }} <span aria-hidden="true" class="text-muted">↗</span></a>
                         <div class="text-slate-400">{{ src.org }} · {{ src.venue }}</div>
                         <p class="text-slate-400 mt-0.5">{{ src.credentials }}</p>
                         <p class="text-muted mt-0.5">{{ src.summary }}</p>
                    </div>
               </div>

               <p class="text-muted text-xs border-t border-slate-800 pt-2">
                    Guidance last reviewed: {{ meta.lastVerified }}
               </p>
          </div>
     </details>
</template>
