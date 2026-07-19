<script setup lang="ts">
import { ScheduleSetting } from '../models/ScheduleSetting'

// @doc:sibling-twins-alignment @doc:wake-window-schedule-generator
// One child's schedule inputs (birthday, gestational weeks, wake time, wake
// windows, bedtime). Extracted from Summary.vue so a plan can hold a second
// child; `idPrefix` keeps label/input ids unique per child (empty for Baby A,
// so original single-child ids and links to them keep working).
const props = defineProps<{
  schedule: ScheduleSetting
  idPrefix: string
}>()

// Half-hour clock options matching the original hand-written lists: value ""
// is 12:00, ".5" is 12:30, then "1"…"11.5".
const hourOptions = Array.from({ length: 24 }, (_, i) => {
  const h = Math.floor(i / 2)
  const half = i % 2 === 1
  return {
    // Numeric string values (12:00 = "0", not "") paired with v-model.number
    // below: the selects must yield numbers, or `(bed + 12) * 60` in
    // bedtimeMinutes string-concatenates. "" can't round-trip either —
    // Number("") is 0, which no longer re-matches an <option value="">.
    value: String(i / 2),
    label: `${h === 0 ? 12 : h}:${half ? '30' : '00'}`,
  }
})

function addWW() {
  props.schedule.wws.push(1)
}

function removeWW(index: number) {
  if (props.schedule.wws.length <= 1) return // keep at least one wake window
  props.schedule.wws.splice(index, 1)
}
</script>

<template>
  <label :for="`${idPrefix}bd`" class="block text-slate-400 text-sm mb-1">Birthday</label>
  <div class="mb-4">
    <input :id="`${idPrefix}bd`" type="date"
      class="peer bg-slate-800 text-slate-200 text-sm rounded block p-2.5 min-h-11 w-full"
      v-model="schedule.birthdayDate" required />
    <span class="hidden peer-invalid:block text-amber-100 text-sm mt-1">Please enter a birthdate.</span>
  </div>

  <label :for="`${idPrefix}weeks`" class="block text-slate-400 text-sm mb-1">Weeks in Womb</label>
  <input :id="`${idPrefix}weeks`" type="number"
    class="bg-slate-800 text-slate-200 text-sm rounded block p-2.5 min-h-11 w-full mb-4" placeholder="Weeks" min="20"
    max="44" step="1" v-model="schedule.weeks" />

  <label :for="`${idPrefix}dwt`" class="block text-slate-400 text-sm mb-1">Desired Wake Time</label>
  <select :id="`${idPrefix}dwt`" class="bg-slate-800 text-slate-200 text-sm rounded block p-2.5 min-h-11 w-full mb-4 text-right"
    v-model.number="schedule.dwt">
    <option v-for="opt in hourOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
  </select>

  <span :id="`${idPrefix}ww-label`" class="block text-slate-400 text-sm mb-1">Wake Windows</span>
  <div role="group" :aria-labelledby="`${idPrefix}ww-label`" class="mb-4">
    <div v-for="(find, index) in schedule.wws" class="flex items-center gap-2 mb-1">
      <input type="number" class="bg-slate-800 text-slate-200 text-sm rounded p-2.5 min-h-11 w-full" placeholder="Hours"
        v-model.number="schedule.wws[index]" min="0" max="6" step="0.25" :aria-label="`Wake window ${index + 1} (hours)`" />
      <button type="button"
        class="shrink-0 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-lg rounded min-h-11 min-w-11 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="schedule.wws.length <= 1" :aria-label="`Remove wake window ${index + 1}`"
        v-on:click="removeWW(index)">−</button>
    </div>
    <button type="button"
      class="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 text-lg rounded min-h-11 min-w-11"
      aria-label="Add wake window" v-on:click="addWW">+</button>
  </div>

  <label :for="`${idPrefix}bed`" class="block text-slate-400 text-sm mb-1">Bedtime</label>
  <select :id="`${idPrefix}bed`" class="bg-slate-800 text-slate-200 text-sm rounded block p-2.5 min-h-11 w-full text-right"
    v-model.number="schedule.bed">
    <option v-for="opt in hourOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>
