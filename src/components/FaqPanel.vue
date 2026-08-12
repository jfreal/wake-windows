<script setup lang="ts">
import { faqEntries } from '../data/faq'
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:evidence-tier-badges-citations @doc:methodology-sources-page
// "Parents ask" — the FAQ catalog rendered as native <details> accordions:
// one question per disclosure, cited short answer inside, tier badge on every
// answer. Content lives in data/faq.ts (curated from research/07 + /08) and is
// integrity-tested in data/faq.test.ts. State-free, no account, no tracking of
// what anyone opens.
</script>

<template>
     <details class="rounded border border-slate-800">
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Parents ask
               <span class="text-muted font-normal">— {{ faqEntries.length }} common questions, answered with sources</span>
          </summary>

          <div class="px-3 pb-3 space-y-1">
               <p class="text-xs text-slate-400 pb-1">
                    The questions that come up most, each with the short honest answer and where it comes
                    from. Ranges and reassurance, as always — none of this is medical advice.
               </p>

               <details v-for="e in faqEntries" :key="e.id" class="rounded border border-slate-800 bg-slate-800/30">
                    <summary class="cursor-pointer select-none px-3 py-3 text-slate-200 text-sm">
                         {{ e.question }}
                    </summary>
                    <div class="px-3 pb-3 space-y-2">
                         <p class="text-sm text-slate-300">{{ e.answer }}</p>
                         <p v-if="e.inApp" class="text-muted-raised text-xs">
                              In this app: {{ e.inApp }}.
                         </p>
                         <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <TierBadge :tier="e.tier" />
                              <a
                                   v-for="src in getSources(e.sourceIds)"
                                   :key="src.id"
                                   :href="src.url"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   :title="src.title"
                                   class="link-ext min-h-11"
                              >{{ src.org }} <span aria-hidden="true" class="text-muted-raised">↗</span></a>
                         </div>
                    </div>
               </details>
          </div>
     </details>
</template>
