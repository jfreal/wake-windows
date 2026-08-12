<script setup lang="ts">
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:anti-anxiety-mechanics @doc:safe-sleep-panel
// Contact naps & naps on the go — a top-ten parent question (research/07 §6)
// carrying real guilt ("am I building a bad habit?") and a real safety edge
// case (dozing off together on a couch). Reassurance-first like everything
// here: normal, bonding-positive, nothing to fix — with the one hard safety
// rule stated plainly and the transition path offered only for when the
// PARENT wants it. No prior coverage anywhere in the app or research corpus.
const reassuranceSources = getSources(['tcb-contact-naps', 'kellymom-comfort'])
const safetySources = getSources(['aap-safesleep-2022'])
const motionSources = getSources(['aap-safesleep-2022', 'tcb-daycare'])
</script>

<template>
     <details class="rounded border border-slate-800">
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Contact naps &amp; naps on the go
               <span class="text-muted font-normal">— normal, with one hard safety rule</span>
          </summary>

          <div class="px-3 pb-3 space-y-3">
               <!-- Reassurance runs first, as always. -->
               <div class="rounded border border-emerald-400/30 bg-emerald-400/5 p-3">
                    <div class="flex flex-wrap items-center gap-2">
                         <h3 class="text-emerald-300 text-sm font-semibold">Contact naps are not a bad habit</h3>
                         <TierBadge :tier="3" />
                    </div>
                    <p class="mt-1.5 text-sm text-slate-200">
                         Napping on a parent is normal, comforting, and good for bonding — it doesn't ruin
                         independent sleep, and many babies simply outgrow it around 4–6 months on their own.
                         The same goes for nursing to sleep: it's biologically normal, and settling without it
                         is a milestone babies reach when ready, not a habit you have to break today.
                    </p>
                    <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                         <a v-for="src in reassuranceSources" :key="src.id" :href="src.url" target="_blank"
                              rel="noopener noreferrer" :title="src.title" class="link-ext min-h-11"
                         >{{ src.org }} <span aria-hidden="true" class="text-muted">↗</span></a>
                    </div>
               </div>

               <!-- The one hard rule, in the safe-sleep register (Tier 1, emerald border style
                    reserved for safety elsewhere; amber here would read as a scold — this is
                    calm, load-bearing safety information). -->
               <div class="rounded border border-slate-700 bg-slate-800/40 p-3">
                    <div class="flex flex-wrap items-center gap-2">
                         <h3 class="text-slate-100 text-sm font-semibold">The one hard rule</h3>
                         <TierBadge :tier="1" />
                    </div>
                    <p class="mt-1.5 text-sm text-slate-300">
                         A contact nap needs an <span class="text-slate-100">awake adult</span>. If you feel
                         yourself drifting, move baby to their firm, flat sleep space first — falling asleep
                         together on a couch or armchair is the single riskiest infant sleep arrangement (the
                         AAP cites up to a ~67-fold increase in sleep-related death risk). A planned nap in
                         the crib is far safer than an accidental nap in a recliner.
                    </p>
                    <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                         <a v-for="src in safetySources" :key="src.id" :href="src.url" target="_blank"
                              rel="noopener noreferrer" :title="src.title" class="link-ext min-h-11"
                         >{{ src.org }} <span aria-hidden="true" class="text-muted-raised">↗</span></a>
                    </div>
               </div>

               <!-- Motion naps + the counting rule. -->
               <div class="text-sm text-slate-300 space-y-2">
                    <p>
                         <span class="text-slate-100 font-medium">Stroller, carrier, and car naps count.</span>
                         There's no good evidence motion sleep is meaningfully less restorative — the practical
                         issues are just that these naps run shorter and can become the only way baby naps.
                         Per the AAP, move baby from a car seat, swing, or carrier to a firm, flat surface as
                         soon as practical. For the schedule: a car catnap under ~30 minutes → stretch the
                         next wake window a little; longer → count it as a real nap.
                    </p>
                    <p class="text-muted text-xs">
                         Caught out by a car nap today? The "Today is atypical" flag above loosens the whole
                         day's windows — that's what it's for.
                    </p>
               </div>

               <!-- Transition path — offered, never prescribed. -->
               <div class="text-sm text-slate-300 space-y-2 border-t border-slate-800 pt-3">
                    <p>
                         <span class="text-slate-100 font-medium">If — and only if — you want out</span>
                         (back-to-work deadlines are the usual reason): go gradually. Keep wake windows
                         age-appropriate, then practice one or two crib naps a day with baby going down
                         drowsy but more awake, in the same dark, white-noise environment they'll wake in
                         mid-nap. Expect nights to consolidate before naps do, and expect the transition to
                         take weeks, not days. Until then, contact naps for some naps and crib naps for
                         others is a perfectly fine mix.
                    </p>
                    <div class="flex flex-wrap items-center gap-2">
                         <TierBadge :tier="3" />
                         <span class="text-muted text-xs">Practitioner convention — a gentle path, not a deadline.</span>
                    </div>
                    <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                         <a v-for="src in motionSources" :key="src.id" :href="src.url" target="_blank"
                              rel="noopener noreferrer" :title="src.title" class="link-ext min-h-11"
                         >{{ src.org }} <span aria-hidden="true" class="text-muted">↗</span></a>
                    </div>
               </div>
          </div>
     </details>
</template>
