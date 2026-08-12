<script setup lang="ts">
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:interactive-troubleshooter @doc:anti-anxiety-mechanics
// Overtired vs undertired — the single most-asked interpretive question in
// parent communities (research/08 T17 calls it "the community's central
// ambiguity"). The troubleshooter disambiguates it inside three separate
// trees; this card lifts the shared logic into one standalone, cited
// reference — including the anti-anxiety corrective that the internet
// over-diagnoses overtiredness.
const sources = getSources(['tcb-short-naps', 'babysleepscience-wakings', 'flynnevans-critique'])
</script>

<template>
     <details class="rounded border border-slate-800">
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Overtired or undertired?
               <span class="text-muted font-normal">— the two look confusingly alike</span>
          </summary>

          <div class="px-3 pb-3 space-y-3">
               <p class="text-xs text-slate-400">
                    Both can cause bedtime tears, short naps, and night wakings — which is why half the
                    internet says "shorten the windows" and the other half says "stretch them." These are
                    the tells practitioners actually use.
               </p>

               <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="rounded border border-slate-800 bg-slate-800/40 p-3">
                         <h3 class="text-slate-100 text-sm font-semibold">Leans overtired</h3>
                         <ul class="mt-1.5 space-y-1 text-sm text-slate-300 list-disc pl-5">
                              <li>Crashes asleep in under ~5 minutes</li>
                              <li>Distressed, rigid, hard to soothe going down</li>
                              <li>Wakes crying ~30–45 min in</li>
                              <li>Usually has a cause you can name — a skipped nap, travel, illness, a big day</li>
                         </ul>
                    </div>
                    <div class="rounded border border-slate-800 bg-slate-800/40 p-3">
                         <h3 class="text-slate-100 text-sm font-semibold">Leans undertired</h3>
                         <ul class="mt-1.5 space-y-1 text-sm text-slate-300 list-disc pl-5">
                              <li>Takes 20+ minutes to fall asleep</li>
                              <li>Content or playful in the crib; "party" wakings</li>
                              <li>Wakes cheerful, clearly done</li>
                              <li>Accrues silently — windows that fit last month quietly got too short</li>
                         </ul>
                    </div>
               </div>

               <div class="text-sm text-slate-300 space-y-2">
                    <p>
                         <span class="text-slate-100 font-medium">The most useful single tell is
                         time-to-fall-asleep,</span> watched over 3–4 nights rather than judged from one.
                         Still ambiguous? Try the earlier-bedtime (overtired) fix first — it's the gentler
                         mistake if the guess is wrong.
                    </p>
                    <p>
                         Worth knowing: online sleep culture reaches for "overtired" far more often than the
                         evidence supports, and sleep researchers point out that as babies grow, undertiredness
                         is the quieter, likelier drift — sleep needs fall on their own schedule. If your baby
                         seems happy and nights are fine, neither label needs to apply at all.
                    </p>
               </div>

               <div class="flex flex-wrap items-center gap-2">
                    <TierBadge :tier="3" />
                    <span class="text-muted text-xs">
                         Practitioner heuristics — useful patterns, not diagnoses. The step-by-step version
                         lives in the troubleshooter above.
                    </span>
               </div>

               <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs border-t border-slate-800 pt-2">
                    <a
                         v-for="src in sources"
                         :key="src.id"
                         :href="src.url"
                         target="_blank"
                         rel="noopener noreferrer"
                         :title="src.title"
                         class="link-ext min-h-11"
                    >{{ src.org }} <span aria-hidden="true" class="text-muted">↗</span></a>
               </div>
          </div>
     </details>
</template>
