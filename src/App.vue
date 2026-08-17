<script setup lang="ts">
import OfflineIndicator from './components/OfflineIndicator.vue'
import AppTabs from './components/AppTabs.vue'
import EvidenceSheet from './components/EvidenceSheet.vue'
import SitterView from './components/SitterView.vue'
import HandoffNotes from './components/HandoffNotes.vue'
import TodayView from './views/TodayView.vue'
import LogView from './views/LogView.vue'
import LearnView from './views/LearnView.vue'
import SettingsView from './views/SettingsView.vue'
import { meta } from './models/Citations'
import { schedule, sibling, sitterMode } from './stores/plan'
import { activeTab } from './stores/tabs'
import logoUrl from './assets/logo.png'

// @doc:accessibility-dark-room
//
// The shell.
//
// This file used to BE the information architecture: twenty-odd panels listed
// one after another, each gated on `!sitterMode`, in an order that had become
// the order they were built in. It is now four screens and a nav, and the
// question "where does this belong" has an answer instead of a bottom of a page.
//
//   Today     what happens next, and the day around it
//   Log       one toggle, and the corrections
//   Learn     every cited guidance panel, one tap away
//   Settings  the plan's inputs, sharing, and the privacy promises
//
// @doc:read-only-babysitter-mode
// A shared sitter link renders only the plan: no tabs, no delete-data control,
// no tip jar, no panels that change state — the sitter sees today's schedule and
// the disclaimer and nothing that asks anything of them. `sitterMode` is read
// once in stores/plan.ts so every screen branches on the same value.
</script>

<template>
  <!-- Sitter mode is a different app, not a hidden version of this one: no
       navigation exists in its DOM at all. -->
  <main v-if="sitterMode" class="max-w-2xl mx-auto px-4 py-6">
    <SitterView :schedule="schedule" :sibling="sibling" />
    <!-- @doc:caregiver-handoff-notes — the read-only "since you last had the
         baby" recap. It belongs to the sitter path specifically: the component
         branches internally on view=sitter and renders no editor here, so this
         is the recap only, not a second copy of the note UI. -->
    <HandoffNotes />
    <footer class="mt-8 border-t border-line pt-4 text-muted text-xs space-y-2">
      <p>{{ meta.disclaimer }}</p>
      <p>Guidance last reviewed: {{ meta.lastVerified }}.</p>
    </footer>
  </main>

  <template v-else>
    <!-- Skip link: with a nav rail before the content on desktop, keyboard users
         would otherwise tab through four items to reach the screen itself. -->
    <a href="#screen"
      class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm">
      Skip to content
    </a>

    <!-- The sidebar is full-bleed against the left edge and floors the page, so
         the shell is a flex row rather than a centred column with a rail inside
         it. On a phone the row collapses to one child and the nav moves to the
         bottom edge, where a thumb is. -->
    <div class="flex min-h-screen">
      <AppTabs layout="rail" class="hidden md:flex" />

      <main class="min-w-0 flex-1 px-4 pb-28 md:px-8 md:pb-16 lg:px-12">
        <!-- The mark carries the brand; the descriptive title is for crawlers
             and screen readers, which is the same split the old header had. The
             logo keeps a real `alt` — it is the only image in the app that
             means something on its own. On desktop the sidebar already shows
             it, so the header collapses to the invisible heading. -->
        <header class="pt-5 pb-4 md:pt-8 md:pb-0">
          <h1>
            <img class="h-9 w-auto md:hidden" :src="logoUrl" alt="Wake Windows" width="32" height="36"
              fetchpriority="high" />
            <span class="sr-only">Wake Windows — Infant Nap Schedule &amp; Wake Windows Planner</span>
          </h1>
        </header>

        <OfflineIndicator />

        <!-- pb-28 above clears the fixed tab bar on phones, which would
             otherwise sit on top of the last thing on every screen. -->
        <div id="screen" tabindex="-1" class="mx-auto w-full max-w-[1180px] pt-2">
          <TodayView v-if="activeTab === 'today'" />
          <LogView v-else-if="activeTab === 'log'" />
          <LearnView v-else-if="activeTab === 'learn'" />
          <SettingsView v-else />

          <footer class="mt-10 border-t border-line pt-4 text-muted text-xs space-y-2">
            <p>{{ meta.disclaimer }}</p>
            <p>Guidance last reviewed: {{ meta.lastVerified }}.</p>
          </footer>
        </div>
      </main>
    </div>

    <AppTabs layout="bar" class="md:hidden" />

    <!-- @doc:evidence-tier-badges-citations — one sheet, opened from anywhere. -->
    <EvidenceSheet />
  </template>
</template>
