<script setup lang="ts">
import { computed } from 'vue'
import { getTier } from '../models/Citations'

const props = defineProps<{ tier: number }>()
const t = computed(() => getTier(props.tier))
// Shape, not color alone, distinguishes the tiers for accessibility.
const glyph = computed(() => (props.tier === 1 ? '●' : '◐'))
</script>

<template>
     <span
          class="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-medium leading-none whitespace-nowrap"
          :style="{ color: t.color, borderColor: t.color }"
          :title="t.description"
     >
          <span aria-hidden="true">{{ glyph }}</span>
          <span>{{ t.shortLabel }} · {{ t.label }}</span>
     </span>
</template>
