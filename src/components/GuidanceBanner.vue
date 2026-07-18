<script setup lang="ts">
import { ref, computed } from 'vue'
import {
     effectiveGuidanceMode,
     MODE_GUIDANCE,
     cuesReliabilityNote,
     ATYPICAL_MESSAGE,
     ATYPICAL_REASONS,
} from '../models/GuidanceMode'
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:cues-vs-clock-mode @doc:atypical-day-flag
// Age-driven cues-vs-clock banner (corrected age) with a cited one-line
// rationale; on an atypical day it leads with the calm reassurance message
// and drops to cues-first framing.
const props = defineProps<{ months: number; atypical: boolean; atypicalReason: string }>()

const mode = computed(() => effectiveGuidanceMode(props.months, props.atypical))
const guidance = computed(() => MODE_GUIDANCE[mode.value])
const olderNote = computed(() => (props.atypical ? null : cuesReliabilityNote(props.months)))
const reasonLabel = computed(
     () => ATYPICAL_REASONS.find((r) => r.id === props.atypicalReason)?.label ?? null
)
const showSources = ref(false)
</script>

<template>
     <div>
          <div v-if="atypical" class="rounded bg-violet-400/10 border border-violet-400/30 p-3 mb-2" role="status">
               <p class="text-violet-200 text-sm">
                    {{ ATYPICAL_MESSAGE }}
                    <span v-if="reasonLabel" class="text-violet-300/80 whitespace-nowrap">({{ reasonLabel }})</span>
               </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
               <span class="inline-flex items-center rounded border border-sky-400/60 text-sky-300 px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap uppercase tracking-wide">
                    {{ guidance.label }}
               </span>
               <span class="text-slate-300 text-sm font-medium">{{ guidance.headline }}</span>
          </div>

          <p class="text-muted text-xs mt-1">
               {{ guidance.rationale }}
               <span v-if="olderNote"> {{ olderNote }}</span>
          </p>

          <div class="flex flex-wrap items-center gap-2 mt-1">
               <TierBadge :tier="guidance.tier" />
               <button
                    type="button"
                    class="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-2"
                    :aria-expanded="showSources"
                    @click="showSources = !showSources"
               >
                    {{ showSources ? 'Hide' : `Sources (${guidance.sourceIds.length})` }}
               </button>
          </div>

          <div v-if="showSources" class="mt-2 space-y-2 pl-3">
               <div v-for="src in getSources(guidance.sourceIds)" :key="src.id" class="text-xs">
                    <div class="flex flex-wrap items-center gap-2">
                         <TierBadge :tier="src.tier" />
                         <span class="text-muted uppercase tracking-wide">{{ src.type }}</span>
                         <span class="text-muted">{{ src.year }}</span>
                    </div>
                    <a
                         :href="src.url"
                         target="_blank"
                         rel="noopener noreferrer"
                         class="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                    >{{ src.title }} <span aria-hidden="true" class="text-muted">↗</span></a>
                    <div class="text-slate-400">{{ src.org }} · {{ src.venue }}</div>
                    <p class="text-muted mt-0.5">{{ src.summary }}</p>
               </div>
          </div>
     </div>
</template>
