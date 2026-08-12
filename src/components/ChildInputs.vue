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
const preterm = computed(() => props.schedule.weeks < 37)

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
  <!-- `.field` / `.btn` carry the shared 44px control sizing (style.css), so the
       one-handed-in-the-dark target size can't drift control by control. -->
  <label :for="`${idPrefix}bd`" class="block text-slate-400 text-sm mb-1">Birthday</label>
  <div class="mb-4">
    <input :id="`${idPrefix}bd`" type="date" class="field peer"
      v-model="schedule.birthdayDate" required />
    <span class="hidden peer-invalid:block text-amber-100 text-sm mt-1">Please enter a birthdate.</span>
  </div>

  <label :for="`${idPrefix}weeks`" class="block text-slate-400 text-sm mb-1">Weeks in Womb</label>
  <input :id="`${idPrefix}weeks`" type="number" class="field" placeholder="Weeks" min="20"
    max="44" step="1" v-model="schedule.weeks" />
  <p v-if="preterm" class="text-muted text-xs mt-1 mb-4">
    Born early — this plan uses adjusted age ({{ schedule.monthsSinceBirth }} mo), the standard
    starting point through about age two. Many preemies land somewhere between adjusted and
    actual age; follow your baby over either number.
  </p>
  <div v-else class="mb-4"></div>

  <label :for="`${idPrefix}dwt`" class="block text-slate-400 text-sm mb-1">Desired Wake Time</label>
  <select :id="`${idPrefix}dwt`" class="field mb-4 text-right"
    v-model.number="schedule.dwt">
    <option v-for="opt in hourOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
  </select>

  <span :id="`${idPrefix}ww-label`" class="block text-slate-400 text-sm mb-1">Wake Windows</span>
  <div role="group" :aria-labelledby="`${idPrefix}ww-label`" class="mb-4">
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

  <label :for="`${idPrefix}bed`" class="block text-slate-400 text-sm mb-1">Bedtime</label>
  <select :id="`${idPrefix}bed`" class="field text-right"
    v-model.number="schedule.bed">
    <option v-for="opt in hourOptions" :key="opt.label" :value="opt.value">{{ opt.label }}</option>
  </select>
</template>
