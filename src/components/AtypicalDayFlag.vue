<script setup lang="ts">
import { ScheduleSetting } from '../models/ScheduleSetting'
import { ATYPICAL_REASONS } from '../models/GuidanceMode'

// @doc:atypical-day-flag
// One-tap "Today is atypical" toggle with optional reason chips. The flag is
// relief, never a demerit: no streaks, no counters, clears in one tap.
const props = defineProps<{ schedule: ScheduleSetting }>()

function toggle() {
     props.schedule.atypical = !props.schedule.atypical
     if (!props.schedule.atypical) props.schedule.atypicalReason = ''
}

function pickReason(id: string) {
     props.schedule.atypicalReason = props.schedule.atypicalReason === id ? '' : id
}
</script>

<template>
     <div class="mt-4">
          <span class="block text-slate-400 text-sm mb-1">Rough day?</span>
          <button
               type="button"
               :aria-pressed="schedule.atypical"
               class="w-full min-h-11 rounded text-sm p-2.5 text-left border transition-colors"
               :class="schedule.atypical
                    ? 'bg-violet-400/10 border-violet-400/50 text-violet-200'
                    : 'bg-slate-800 border-transparent hover:bg-slate-700 text-slate-300'"
               @click="toggle"
          >
               {{ schedule.atypical ? '✓ Today is atypical' : 'Today is atypical' }}
          </button>

          <div v-if="schedule.atypical" role="group" aria-label="Why (optional)" class="flex flex-wrap gap-1.5 mt-2">
               <button
                    v-for="reason in ATYPICAL_REASONS"
                    :key="reason.id"
                    type="button"
                    :aria-pressed="schedule.atypicalReason === reason.id"
                    class="rounded-full border px-2.5 py-1 text-xs transition-colors"
                    :class="schedule.atypicalReason === reason.id
                         ? 'border-violet-400/60 text-violet-200 bg-violet-400/10'
                         : 'border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-500'"
                    @click="pickReason(reason.id)"
               >
                    {{ reason.label }}
               </button>
          </div>
     </div>
</template>
