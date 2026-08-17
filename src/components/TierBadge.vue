<script setup lang="ts">
import { computed } from 'vue'
import { getTier } from '../models/Citations'

// @doc:evidence-tier-badges-citations @doc:accessibility-dark-room
const props = defineProps<{ tier: number }>()
const t = computed(() => getTier(props.tier))
// Shape, not color alone, distinguishes the tiers for accessibility.
const glyph = computed(() => (props.tier === 1 ? '●' : props.tier === 2 ? '◐' : '○'))
</script>

<template>
     <!-- On paper a hairline-only pill disappears into the page, so the badge
          carries a wash of its own colour behind it. The wash is mixed FROM the
          tier colour rather than hard-coded per tier, so a tier can never end up
          with a tint that doesn't match its ink. -->
     <span
          class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap"
          :style="{ color: t.color, background: `color-mix(in srgb, ${t.color} 12%, #fffdf9)` }"
          :title="t.description"
     >
          <span aria-hidden="true">{{ glyph }}</span>
          <span>{{ t.shortLabel }} · {{ t.label }}</span>
     </span>
</template>
