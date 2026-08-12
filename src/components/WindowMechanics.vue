<script setup lang="ts">
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:wake-window-schedule-generator @doc:anti-anxiety-mechanics
// "What counts as awake?" — the definitional questions parents ask most and
// argue about endlessly (does the window start at eyes-open? does feeding
// count? does settling time count?), answered once, next to the schedule the
// answers apply to. Research file 08-reddit-field-notes.md T2 found this
// genuinely unresolved among parents; the honest resolution is that every
// convention differs by a few minutes — which is exactly the slop the range
// display already absorbs. The panel converts the internet's most-annoying
// ambiguity into the reason this app shows ranges.
const sources = getSources(['tcb-wake-windows', 'cleveland-wake-windows', 'oster-parentdata-2024'])
</script>

<template>
     <details class="rounded border border-slate-800">
          <!-- py-3: 20px line + 24px padding = 44px tap target (F08) -->
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               What counts as awake?
               <span class="text-muted font-normal">— where a wake window starts and ends</span>
          </summary>
          <div class="px-3 pb-3 space-y-2 text-xs text-slate-400">
               <p>
                    <span class="text-slate-200">The window starts at the real wake-up</span> — baby alert
                    with eyes open for a while. A few minutes of dozy fussing with eyes mostly closed still
                    counts as sleep, not the start of the day.
               </p>
               <p>
                    <span class="text-slate-200">Everything awake counts:</span> feeding, diaper changes,
                    and play are all part of the window. It does not reset after a feed.
               </p>
               <p>
                    <span class="text-slate-200">Settling time doesn't count against you.</span> The window
                    ends when you lay baby down — taking 5–20 quiet minutes to actually fall asleep after
                    that is normal rest time, not overtime.
               </p>
               <p>
                    Parents debate these definitions endlessly ("eyes open to eyes shut" vs "out of the crib
                    to back in the crib"), and published sources genuinely differ by 10–15 minutes. That
                    disagreement is precisely why this app shows every time as a range: any reasonable
                    definition lands inside it. Measure however suits your family — consistently — and
                    don't chase the minutes.
               </p>
               <p>
                    <TierBadge :tier="3" />
                    <span class="mt-1 block">
                         These are practitioner conventions, not studied definitions — one more reason
                         ranges are the honest display.
                    </span>
               </p>
               <div class="flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-800 pt-2">
                    <a
                         v-for="src in sources"
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
