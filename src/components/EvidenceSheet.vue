<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { closeSheet, sheet } from '../stores/sheet'
import { getSources, getTier } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:evidence-tier-badges-citations @doc:accessibility-dark-room
// @doc:no-ai-no-data-training
//
// The one evidence surface: a bottom sheet on a phone, a right-hand drawer from
// `sm` up. Same markup either way — the difference is which edge it is pinned to
// and which way it slides, so there is one dialog to keep accessible rather than
// two that drift apart.
//
// Modal, and honestly so: `aria-modal`, Escape closes, the backdrop closes, and
// focus moves to the sheet on open and back to the trigger on close. A sheet
// that traps a screen-reader user behind a page they can still tab into is worse
// than no sheet.

const panel = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null
let previousOverflow = ''

// "Tier 2" beside "Practice-based heuristic": the badge names the tier, this
// says what it means, so the sheet never assumes you already know the scale.
const tierMeaning = computed(() => (sheet.value ? getTier(sheet.value.tier).label : ''))

watch(sheet, async (value, previous) => {
  if (value && !previous) {
    opener = document.activeElement as HTMLElement | null
    // Document-level, not bound to the wrapper: clicking the sheet's own prose
    // blurs to <body> in several browsers, and a handler scoped to the wrapper
    // would then never see the keystroke — so Escape would quietly stop working
    // the moment someone touched the text they came to read.
    document.addEventListener('keydown', onKeydown)
    // Nothing under a modal should scroll. Without this a flick outside the
    // sheet moves the page behind the scrim, so dismissing it returns the
    // reader somewhere other than where they left.
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    await nextTick()
    panel.value?.focus()
  } else if (!value && previous) {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = previousOverflow
    opener?.focus()
    opener = null
  }
})

// Unmounting with a sheet open (a tab switch driven from elsewhere) must not
// leave the page unscrollable or the listener attached.
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (sheet.value) document.body.style.overflow = previousOverflow
})

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]),'
  + ' textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeSheet()
    return
  }
  if (event.key !== 'Tab') return

  // Keep Tab inside the panel.
  //
  // `aria-modal` tells assistive tech the rest of the page is inert; it does
  // nothing to the tab order. Without this, tabbing past the last control in
  // the sheet lands on the schedule behind the scrim — which is still fully
  // operable, so a keyboard user can edit the plan through a modal they cannot
  // see they have left.
  const focusable = Array.from(
    panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
  ).filter((el) => el.offsetParent !== null || el === document.activeElement)
  if (!focusable.length) return

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement

  if (event.shiftKey && (active === first || active === panel.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <div v-if="sheet" class="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
    <!-- The scrim is a button, not a div with a click handler: it is a real
         control ("dismiss"), so it should be one for anything that isn't a
         mouse. -->
    <button type="button" class="absolute inset-0 bg-[rgba(42,35,32,.42)]"
      aria-label="Close" v-on:click="closeSheet"></button>

    <div ref="panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1"
      class="relative w-full max-h-[85vh] overflow-y-auto bg-card px-5 pb-8 pt-3
             rounded-t-2xl shadow-[var(--shadow-sheet)]
             sm:w-[468px] sm:max-w-[92vw] sm:max-h-none sm:h-full sm:rounded-t-none
             sm:border-l sm:border-line sm:px-8 sm:pt-7 sm:shadow-[-24px_0_60px_-30px_rgba(42,35,32,.5)]">
      <!-- Grab handle: phone affordance only; the drawer has an edge instead. -->
      <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden="true"></div>

      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-2.5 flex-wrap">
          <TierBadge :tier="sheet.tier" />
          <span class="text-xs text-muted">{{ tierMeaning }}</span>
        </div>
        <!-- The drawer has no "Got it" button at the bottom of a tall scroll, so
             it needs a dismiss that is always in view. On a phone the sheet is
             short and the button at the end is the natural exit, so this is the
             wide-screen affordance only. -->
        <button type="button" aria-label="Close"
          class="hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-full text-xl text-muted hover:bg-paper-sunk"
          v-on:click="closeSheet">×</button>
      </div>

      <h2 id="sheet-title" class="display text-2xl text-slate-200 mt-3 text-pretty sm:text-3xl">{{ sheet.title }}</h2>

      <p v-for="(paragraph, i) in sheet.body" :key="i"
        class="text-slate-300 text-sm leading-relaxed mt-3 text-pretty">{{ paragraph }}</p>

      <!-- @doc:no-ai-no-data-training — the arithmetic, on the parent's own
           numbers. This is the whole answer to "where did this time come from":
           there is no model and no server, just these lines. -->
      <div v-if="sheet.math?.length" class="mt-4 rounded-lg bg-paper-sunk p-4">
        <h3 class="eyebrow">Your numbers</h3>
        <dl class="mt-2 space-y-1.5">
          <div v-for="row in sheet.math" :key="row.label" class="flex justify-between gap-4 text-sm">
            <dt class="text-slate-300">{{ row.label }}</dt>
            <dd class="text-slate-400 tabular-nums text-right">{{ row.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="mt-4 border-t border-line pt-3">
        <h3 class="eyebrow">Source</h3>
        <p v-if="sheet.sourceNote" class="text-muted text-xs mt-1.5 text-pretty">{{ sheet.sourceNote }}</p>
        <ul v-if="sheet.sourceIds?.length" class="mt-1.5 space-y-1.5">
          <li v-for="source in getSources(sheet.sourceIds)" :key="source.id" class="text-xs text-muted text-pretty">
            {{ source.leadAuthor || source.org }}<span v-if="source.year"> ({{ source.year }})</span> —
            {{ source.title }}.
            <a :href="source.url" target="_blank" rel="noopener noreferrer" class="link-ext">
              Read the original <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </div>

      <button type="button" class="btn btn-quiet w-full mt-5 sm:hidden" v-on:click="closeSheet">Got it</button>
    </div>
  </div>
</template>
