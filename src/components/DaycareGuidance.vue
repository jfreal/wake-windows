<script setup lang="ts">
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:atypical-day-flag @doc:anti-anxiety-mechanics
// Daycare vs the home schedule — one of the most emotionally loaded recurring
// parent questions (research/08 T13: "Daycare naps are sending me into a
// spiral"). The community's own settled answer is genuinely calming — "let
// daycare be daycare" — and fits this app's register exactly: two schedules
// can coexist, the early bedtime buys back the deficit, and none of it is a
// failure. Includes the car-nap-on-the-way-home counting rule, which parents
// ask about constantly and no app answers.
const sources = getSources(['tcb-daycare'])
</script>

<template>
     <details class="rounded border border-slate-800">
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Daycare days
               <span class="text-muted font-normal">— two schedules can coexist</span>
          </summary>

          <div class="px-3 pb-3 space-y-3">
               <div class="rounded border border-emerald-400/30 bg-emerald-400/5 p-3">
                    <div class="flex flex-wrap items-center gap-2">
                         <h3 class="text-emerald-300 text-sm font-semibold">Let daycare be daycare</h3>
                         <TierBadge :tier="3" />
                    </div>
                    <p class="mt-1.5 text-sm text-slate-200">
                         Babies handle two schedules better than the internet suggests: one rhythm at
                         daycare, another at home, and sleep still works out. Rough daycare naps are an
                         adjustment phase and a daycare-environment fact — not a sign your home routine is
                         broken, and not something you can fix from the office. Run your plan at home and let
                         daycare days be what they are.
                    </p>
               </div>

               <ul class="space-y-2 text-sm text-slate-300 list-disc pl-5">
                    <li>
                         <span class="text-slate-100">Short-nap daycare day?</span> The fix is an earlier
                         bedtime — even as early as ~6:00 PM — rather than squeezing in a late rescue nap at
                         home. One early night absorbs the deficit.
                    </li>
                    <li>
                         <span class="text-slate-100">The car nap on the way home:</span> under ~30 minutes,
                         treat it as a catnap — stretch the evening wake window a little and keep bedtime.
                         Longer, and it was a real nap — shift bedtime later accordingly. Either way, one car
                         nap doesn't undo anything.
                    </li>
                    <li>
                         <span class="text-slate-100">Worth sharing with providers:</span> your current wake
                         windows and wind-down routine (the sitter link above sends exactly that), plus asking
                         about white noise or a quieter crib spot. Small environment tweaks move daycare naps
                         more than schedule demands do.
                    </li>
                    <li>
                         <span class="text-slate-100">Napping at daycare but not at home</span> (or the
                         reverse) is common — routine and the peer effect differ. It says nothing about your
                         parenting.
                    </li>
               </ul>

               <p class="text-muted text-xs">
                    Marking a chaotic daycare day with "Today is atypical" above loosens the evening's
                    windows — that's the intended use.
               </p>

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
