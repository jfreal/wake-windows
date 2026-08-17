<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { schedule, sibling } from '../stores/plan'
import { goTab } from '../stores/tabs'

// @doc:wake-window-schedule-generator
//
// The four ways a typed plan can be arithmetically impossible.
//
// Rendered in two places on purpose. It belongs beside the INPUTS, because every
// message names the field to go fix and a parent who types 10 gestational weeks
// should be told on the screen where they typed it. It also belongs on TODAY,
// because that is where the broken plan is actually visible — a day strip with
// no nap in it needs an explanation next to it, not two taps away. Splitting
// them was the version where you could break the plan in Settings and get no
// feedback at all.

const props = defineProps<{
  /** Offer a jump to the inputs. False when this IS the inputs screen. */
  linkToSettings?: boolean
}>()

function warningsFor(s: ScheduleSetting): string[] {
  const warnings: string[] = []
  if (s.totalNap < 0) {
    warnings.push("Total nap time is negative. Your wake windows may be too long for the given wake time and bedtime.")
  }
  if (s.totalNightSleep < 0) {
    warnings.push("Night sleep is negative. Check your desired wake time and bedtime.")
  }
  if (s.totalNightSleep > 14) {
    warnings.push("Night sleep exceeds 14 hours. Check your desired wake time and bedtime.")
  }
  if (s.weeks < 20 || s.weeks > 44) {
    warnings.push("Weeks in womb should typically be between 20 and 44.")
  }
  return warnings
}

const warnings = computed(() => [
  ...warningsFor(schedule),
  ...(sibling.value ? warningsFor(sibling.value).map((w) => `Baby B: ${w}`) : []),
])

const showLink = computed(() => props.linkToSettings === true)
</script>

<template>
  <!-- Amber and informational, never red: a parent who has mistyped a number is
       not in trouble. -->
  <div aria-live="polite" v-if="warnings.length" class="space-y-1.5">
    <p v-for="warning in warnings" :key="warning"
      class="text-amber-400 text-sm p-3 bg-amber-400/10 rounded-sm">
      &#9888;&#65039; {{ warning }}
      <button v-if="showLink" type="button" class="btn-inline" v-on:click="goTab('settings')">
        Open plan settings
      </button>
    </p>
  </div>
</template>
