<script setup lang="ts">
import { computed } from 'vue'
import { ScheduleSetting } from '../models/ScheduleSetting'
import { templatesForMonths, matchesTemplate, applyTemplate } from '../models/scheduleTemplates'

// @doc:sibling-twins-alignment @doc:wake-window-schedule-generator
// One child's schedule inputs (birthday, gestational weeks, wake time, wake
// windows, bedtime). Extracted from Summary.vue so a plan can hold a second
// child; `idPrefix` keeps label/input ids unique per child (empty for Baby A,
// so original single-child ids and links to them keep working).
const props = defineProps<{
  schedule: ScheduleSetting
  idPrefix: string
}>()

// @doc:wake-window-schedule-generator — named templates ("2-3-4") as one-tap
// starting points that fill the wake-window inputs. Age-gated in the model;
// everything stays editable after applying, so a template is a sketch, not a
// commitment.
const templates = computed(() => templatesForMonths(props.schedule.monthsSinceBirth))

// @doc:corrected-gestational-age — the preemie nuance parents ask about
// (research/08 T14): adjusted age drives the plan, but many preemies land
// between adjusted and actual — the baby outranks both numbers.
//
// Guarded on the same 20–44 range the schedule warning uses, and deliberately
// not a bare `weeks < 37`: an emptied number input hands back '' (Vue casts it
// with looseToNumber, which leaves a non-numeric string alone), and `'' < 37`
// is true — a parent clearing the field to retype it would be told their
// full-term baby was born early, quoting an adjusted age of 0 mo.
const preterm = computed(() => {
  const w = Number(props.schedule.weeks)
  return Number.isFinite(w) && w >= 20 && w < 37
})

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
  <!-- A settings LIST, not a stacked form: label and its one-line "what this is
       for" on the left, the control right-aligned, one hairline row each. The
       inputs are answers to questions asked about once a month, and reading the
       plan back should be possible without reading a form.

       `.field` / `.btn` carry the shared 44px control sizing (style.css), so the
       one-handed-in-the-dark target size can't drift control by control. -->
  <div class="divide-y divide-paper-sunk">
    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <label :for="`${idPrefix}bd`" class="min-w-0">
        <span class="block text-[15px] text-slate-200">Birthday</span>
        <span class="block text-xs text-muted">drives corrected age and the whole plan</span>
      </label>
      <div class="w-full sm:w-48">
        <input :id="`${idPrefix}bd`" type="date" class="field peer"
          v-model="schedule.birthdayDate" required />
        <span class="hidden peer-invalid:block text-amber-400 text-xs mt-1">Please enter a birthdate.</span>
      </div>
    </div>

    <div class="py-3">
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label :for="`${idPrefix}weeks`" class="min-w-0">
          <span class="block text-[15px] text-slate-200">Weeks in Womb</span>
          <span class="block text-xs text-muted">gestational age at birth — 40 if full term</span>
        </label>
        <input :id="`${idPrefix}weeks`" type="number" class="field w-full sm:w-48 text-right"
          placeholder="Weeks" min="20" max="44" step="1" v-model="schedule.weeks" />
      </div>
      <p v-if="preterm" class="text-muted text-xs mt-2 text-pretty">
        Born early — this plan uses adjusted age ({{ schedule.monthsSinceBirth }} mo), the standard
        starting point through about age two. Many preemies land somewhere between adjusted and
        actual age; follow your baby over either number.
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <label :for="`${idPrefix}dwt`" class="min-w-0">
        <span class="block text-[15px] text-slate-200">Desired Wake Time</span>
        <span class="block text-xs text-muted">when their day usually starts</span>
      </label>
      <select :id="`${idPrefix}dwt`" class="field w-full sm:w-48 text-right"
        v-model.number="schedule.dwt">
        <option v-for="opt in hourOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
      <label :for="`${idPrefix}bed`" class="min-w-0">
        <span class="block text-[15px] text-slate-200">Bedtime</span>
        <span class="block text-xs text-muted">the target the day is built back from</span>
      </label>
      <select :id="`${idPrefix}bed`" class="field w-full sm:w-48 text-right"
        v-model.number="schedule.bed">
        <option v-for="opt in hourOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>
  </div>

  <!-- The one input that is a list rather than a value, so it gets its own
       block below the rows instead of being squeezed into one. -->
  <span :id="`${idPrefix}ww-label`" class="block text-[15px] text-slate-200 mt-4 mb-1">Wake Windows</span>
  <p class="text-xs text-muted mb-2">how long they can comfortably stay awake, in order</p>
  <div role="group" :aria-labelledby="`${idPrefix}ww-label`">
    <div v-for="(find, index) in schedule.wws" class="flex items-center gap-2 mb-1">
      <input type="number" class="field" placeholder="Hours"
        v-model.number="schedule.wws[index]" min="0" max="6" step="0.25" :aria-label="`Wake window ${index + 1} (hours)`" />
      <button type="button" class="btn btn-quiet btn-icon shrink-0 text-slate-300"
        :disabled="schedule.wws.length <= 1" :aria-label="`Remove wake window ${index + 1}`"
        v-on:click="removeWW(index)">−</button>
    </div>
    <button type="button" class="btn btn-quiet btn-icon text-slate-300"
      aria-label="Add wake window" v-on:click="addWW">+</button>

    <!-- @doc:wake-window-schedule-generator — named templates parents search
         for ("2-3-4"). One tap fills the inputs above; still fully editable. -->
    <div v-if="templates.length" role="group" aria-label="Common schedule shapes"
      class="flex flex-wrap gap-1.5 mt-2">
      <button v-for="t in templates" :key="t.id" type="button" class="btn-chip transition-colors"
        :aria-pressed="matchesTemplate(schedule.wws, t)" :title="t.description"
        :class="matchesTemplate(schedule.wws, t)
          ? 'border-sky-400/60 text-sky-200 bg-sky-400/10'
          : 'border-slate-700 text-slate-400 hover:text-slate-300 hover:border-slate-500'"
        v-on:click="applyTemplate(schedule.wws, t)">
        {{ t.label }}
      </button>
    </div>
    <p v-if="templates.length" class="text-muted text-xs mt-1">
      Common shapes at this age, as a starting sketch — every window stays yours to edit, and
      low-sleep-needs babies often need longer windows than any template.
    </p>
  </div>
</template>
