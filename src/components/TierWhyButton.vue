<script setup lang="ts">
import { computed } from 'vue'
import { getTier } from '../models/Citations'

// @doc:evidence-tier-badges-citations
//
// "Tier 2 · why?" — the badge and the explainer trigger, as one control.
//
// A tier badge beside a section heading was already a claim about the evidence
// under it; making that same pill the button that opens the reasoning means a
// parent never has to learn that the badge is one thing and the ⓘ next to it is
// another. One target, one meaning, next to the heading it qualifies.
//
// The pill is 22px and the BUTTON is 44px. Those are not in conflict: the target
// is the transparent box around the pill, so the control meets the app's 44px
// floor without a fat badge shouting next to a 12px eyebrow. Shrinking the
// target instead would have been the easy version and a rule broken quietly.

const props = defineProps<{ tier: number }>()

const t = computed(() => getTier(props.tier))
const glyph = computed(() => (props.tier === 1 ? '●' : props.tier === 2 ? '◐' : '○'))
</script>

<template>
  <button type="button" class="inline-flex min-h-11 items-center group">
    <span
      class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10.5px] uppercase tracking-[0.08em] whitespace-nowrap group-hover:brightness-95"
      :style="{ color: t.color, background: `color-mix(in srgb, ${t.color} 12%, #fffdf9)` }">
      <span aria-hidden="true">{{ glyph }}</span>
      <span>{{ t.shortLabel }} · why?</span>
    </span>
    <span class="sr-only">— {{ t.label }}. Opens the reasoning and the sources.</span>
  </button>
</template>
