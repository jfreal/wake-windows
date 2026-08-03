<script setup lang="ts">
import { ref, computed } from 'vue'
import { recommendationForMonths, getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:evidence-tier-badges-citations @doc:sleepy-cues-reference @doc:accessibility-dark-room
const props = defineProps<{ months: number }>()

const rec = computed(() => recommendationForMonths(props.months))
const open = ref<Record<number, boolean>>({})

function toggle(i: number) {
     open.value[i] = !open.value[i]
}
</script>

<template>
     <div v-if="rec">
          <div class="flex items-baseline justify-between gap-3">
               <h2 class="text-slate-400 text-sm uppercase font-normal">Evidence-based guidance</h2>
               <!-- text-muted, not slate-500: real text must clear the 4.5:1 floor -->
               <span class="text-muted text-xs whitespace-nowrap">{{ rec.ageLabel }}</span>
          </div>

          <ul class="mt-2 space-y-2">
               <li
                    v-for="(item, i) in rec.items"
                    :key="item.metric"
                    class="border-t border-slate-800 pt-2"
               >
                    <div class="flex items-start justify-between gap-3">
                         <div class="min-w-0">
                              <div class="flex flex-wrap items-center gap-2">
                                   <span class="text-slate-300 text-sm font-medium">{{ item.metric }}</span>
                                   <TierBadge :tier="item.tier" />
                              </div>
                              <div class="text-slate-200 text-sm">{{ item.value }}</div>
                              <p v-if="item.note" class="text-muted text-xs mt-0.5">{{ item.note }}</p>
                         </div>
                         <button
                              type="button"
                              class="btn-inline shrink-0"
                              :aria-expanded="!!open[i]"
                              @click="toggle(i)"
                         >
                              {{ open[i] ? 'Hide' : `Sources (${item.sourceIds.length})` }}
                         </button>
                    </div>

                    <div v-if="open[i]" class="mt-2 space-y-2 pl-3">
                         <div
                              v-for="src in getSources(item.sourceIds)"
                              :key="src.id"
                              class="text-xs"
                         >
                              <div class="flex flex-wrap items-center gap-2">
                                   <TierBadge :tier="src.tier" />
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
               </li>
          </ul>
     </div>
</template>
