<script setup lang="ts">
import { computed } from 'vue'
import { activeTab, goTab, TAB_LABELS, TABS, type TabKey } from '../stores/tabs'
import { openSheet } from '../stores/sheet'
import { schedule } from '../stores/plan'
import logoUrl from '../assets/logo.png'

// @doc:accessibility-dark-room
//
// The four screens, as navigation.
//
// One component in two layouts: a thumb-reachable bar pinned to the bottom edge
// on a phone, a full sidebar from `md` up. Both drive the same list in the same
// order with the same labels, because they are the same navigation — building a
// separate desktop nav is how the two stop agreeing about what the app contains.
//
// Labels are always visible. An icon-only tab bar is smaller and, at 3am, a
// guess — and the icons here would be guessing hardest exactly where it matters
// ("Log" and "Learn" both start with L and both look like a list).
//
// Marked up as real navigation: a <nav> of buttons with aria-current on the open
// one, so the current screen is announced rather than only coloured.

defineProps<{ layout: 'bar' | 'rail' }>()

// Simple line glyphs, sized to the 24px box. They support the label, they do not
// replace it — which is why none of them has to carry meaning on its own.
const PATHS: Record<TabKey, string> = {
  today: 'M12 7v5l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  log: 'M5 5h14M5 12h14M5 19h9',
  learn: 'M4 5.5A1.5 1.5 0 0 1 5.5 4H19v14H5.5A1.5 1.5 0 0 0 4 19.5V5.5ZM19 18v2H5.5',
  settings: 'M6 6h12M6 12h12M6 18h12M9 4v4M15 10v4M11 16v4',
}

const ageLabel = computed(() =>
  `${schedule.monthsSinceBirth} months · ${schedule.weeksSinceBirth} weeks`)

function openTiers() {
  openSheet({
    tier: 1,
    title: 'What the tiers mean',
    body: [
      'Tier 1 — evidence-based. Backed by peer-reviewed research or a professional body such as '
      + 'the AAP. Total sleep, nap counts and safe-sleep guidance sit here.',
      'Tier 2 — practice-based heuristic. Widely used by clinicians and sleep consultants, but not '
      + 'established by trial. Wake-window minutes and nap-transition methods sit here.',
      'Tier 3 — practitioner convention. A plausible mechanism with no direct study of the '
      + 'specific protocol, like the ~15 min/day daylight-saving ramp.',
      'Every number in this app is labelled so you know how hard to hold it. Nothing here is '
      + 'medical advice, and nothing about your baby leaves your phone.',
    ],
    sourceNote: 'Full source list under Learn → “Where these numbers come from”.',
  })
}
</script>

<template>
  <!-- ---------------------------------------------------------------- rail -->
  <!-- The desktop sidebar is a surface, not a floating list: card fill and a
       right border, so the nav reads as the app's frame and the screen beside
       it reads as the page. It also carries the two things a phone puts in a
       header and a footer — who this plan is for, and the disclaimer — because
       there is room for them here and they should not scroll away. -->
  <aside v-if="layout === 'rail'"
    class="sticky top-0 flex h-screen w-56 shrink-0 flex-col gap-7 border-r border-line bg-card px-5 py-7 lg:w-64">
    <div class="flex items-center gap-3 px-2">
      <!-- Decorative: the wordmark beside it says "Wake Windows" in text, so an
           alt here would have a screen reader announce the brand twice. -->
      <span class="grid h-11 w-11 shrink-0 place-items-center rounded-[15px] bg-cyan-500">
        <img :src="logoUrl" alt="" aria-hidden="true" width="28" height="28" class="h-7 w-auto" />
      </span>
      <span class="min-w-0">
        <span class="display block text-lg text-slate-200 leading-tight">Wake Windows</span>
        <span class="block text-xs text-muted">On this device only</span>
      </span>
    </div>

    <nav aria-label="Main navigation" class="flex flex-col gap-1">
      <button v-for="tab in TABS" :key="tab" type="button"
        :aria-current="activeTab === tab ? 'page' : undefined"
        class="flex min-h-12 items-center gap-3 rounded-sm px-3.5 text-left text-[15px]"
        :class="activeTab === tab
          ? 'bg-sky-400/10 text-sky-400'
          : 'text-slate-300 hover:bg-slate-800'"
        v-on:click="goTab(tab)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
          stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
          class="shrink-0" aria-hidden="true">
          <path :d="PATHS[tab]" />
        </svg>
        <span>{{ TAB_LABELS[tab] }}</span>
      </button>
    </nav>

    <div class="mt-auto flex flex-col gap-2 px-2">
      <div class="border-t border-paper-sunk pt-4">
        <p class="text-sm text-slate-300">This plan</p>
        <p class="text-xs text-muted tabular-nums">{{ ageLabel }}</p>
      </div>
      <button type="button" class="btn-inline no-underline self-start px-0" v-on:click="openTiers">
        How we label evidence
      </button>
      <!-- The gist only. The full disclaimer + review date live once, in the
           page footer — saying the same legal sentence twice on one screen
           makes both copies easier to stop reading. -->
      <p class="text-[11.5px] leading-relaxed text-muted">
        General information, not medical advice.
      </p>
    </div>
  </aside>

  <!-- ----------------------------------------------------------------- bar -->
  <nav v-else aria-label="Main"
    class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]">
    <button v-for="tab in TABS" :key="tab" type="button"
      :aria-current="activeTab === tab ? 'page' : undefined"
      class="flex min-h-12 flex-col items-center justify-center gap-1 py-2 text-[11px]"
      :class="activeTab === tab ? 'text-sky-400' : 'text-muted'"
      v-on:click="goTab(tab)">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
        stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
        class="shrink-0" aria-hidden="true">
        <path :d="PATHS[tab]" />
      </svg>
      <span>{{ TAB_LABELS[tab] }}</span>
    </button>
  </nav>
</template>
