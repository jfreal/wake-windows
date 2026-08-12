<script setup lang="ts">
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:wake-window-schedule-generator @doc:evidence-tier-badges-citations
// "Should I wake a sleeping baby?" — a top-ten parent FAQ (research/07) with
// zero prior coverage in the app. Presented the way nobody else does: the
// consultant capping convention (Tier 3) side by side with the newest
// actigraphy evidence that softens it (Tier 1, adjacent-age) — both cited, so
// the parent can hold the tension honestly instead of inheriting one camp's
// certainty.
const conventionSources = getSources(['tcb-wake-sleeping', 'huckleberry-day-sleep', 'mayo-baby-naps'])
const evidenceSources = getSources(['reynaud-2026-bmc'])
</script>

<template>
     <details class="rounded border border-slate-800">
          <!-- py-3: 20px line + 24px padding = 44px tap target (F08) -->
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Should I wake a sleeping baby?
               <span class="text-muted font-normal">— nap caps, honestly tiered</span>
          </summary>
          <div class="px-3 pb-3 space-y-2 text-xs text-slate-400">
               <p>
                    <TierBadge :tier="3" />
                    <span class="mt-1 block">
                         <span class="text-slate-200">The consultant convention says sometimes, yes.</span>
                         Cap any single nap around ~2 hours on a multi-nap day (~3 hours once on one nap), end
                         the last nap early enough that a full wake window fits before bed, and start the day
                         at a consistent time. The logic: very long naps can eat the sleep pressure the night
                         needs, and show up as bedtime battles, split nights, or 5 AM starts.
                    </span>
               </p>
               <p>
                    <TierBadge :tier="1" />
                    <span class="mt-1 block">
                         <span class="text-slate-200">The newest measured evidence is gentler.</span> An
                         actigraphy study of 2–5-year-olds found an hour of extra napping cost only ~14
                         minutes of night sleep — and a nap's <span class="text-slate-200">end time</span>
                         mattered more than its length. That's older children, so apply it loosely under
                         two — but it's a real reason not to hover over a napping baby with a stopwatch.
                    </span>
               </p>
               <p>
                    A fair reading of both: if nights are going fine, let naps be naps. If bedtime
                    resistance, split nights, or early mornings have crept in, a gentle cap on marathon
                    naps — especially <span class="text-slate-200">late-ending</span> ones — is a
                    reasonable first lever. And a baby sleeping through a needed feed is a feeding
                    question for your pediatrician, not a schedule call.
               </p>
               <div class="flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-800 pt-2">
                    <a
                         v-for="src in [...conventionSources, ...evidenceSources]"
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
</template>
