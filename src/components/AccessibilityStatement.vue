<script setup lang="ts">
// @doc:accessibility-dark-room
// Public accessibility statement (F08): conformance target, what is built,
// known gaps, and a contact. A native <details> panel, matching the
// Sources & Evidence disclosure.
const lastReviewed = 'August 2026'
const contact = 'john.e.farrell@gmail.com'
</script>

<template>
     <details class="rounded border border-slate-800">
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Accessibility
               <span class="text-muted font-normal">— WCAG 2.2 AA target</span>
          </summary>

          <div class="px-3 pb-3 space-y-3 text-xs text-slate-400">
               <p>
                    Wake Windows is built for a parent using one hand, half awake, often in a dark room —
                    which makes accessibility the core design constraint, not an add-on. The target is
                    <span class="text-slate-300">WCAG 2.2 Level AA</span>, self-assessed.
               </p>

               <div>
                    <h3 class="text-slate-300 font-medium mb-1">What this means in practice</h3>
                    <ul class="list-disc pl-5 space-y-1">
                         <li>Every piece of text measures at least 4.5:1 against whatever it sits on. The
                              quietest shade is 5.01:1 on the page and 5.65:1 on a card, so one muted ink
                              is legal on both surfaces rather than needing a lighter twin one step up.</li>
                         <li>All controls (inputs, selects, buttons, toggles, disclosures) are at least 44px
                              tall for one-handed use — that sizing lives in one shared style rule rather
                              than being repeated per control, so it cannot quietly drift. External
                              reference links meet the 24px WCAG 2.2 minimum.</li>
                         <li>Everything is operable by keyboard, with a visible 2px focus ring on every
                              control. A "Skip to content" link is the first stop on every screen, so the
                              four navigation items are never something you have to tab past.</li>
                         <li>The four screens are real navigation: the open one is marked
                              <code>aria-current</code>, so it is announced and not only coloured.</li>
                         <li>All motion is disabled when your system asks for reduced motion.</li>
                         <li>The day strip carries a full text alternative for screen readers; decorative
                              images are hidden from them. The strip shows WHEN each nap falls, so its
                              bands can be a few pixels wide — which is why no figure is written inside
                              one. Every number it encodes is in the Sleep Stats table directly below it.
                              Nothing is only available in the picture.</li>
                         <li>Evidence-tier badges are distinguished by shape (● / ◐) and text, never by
                              color alone; warnings are amber and informational, never red and alarming.</li>
                         <li>Native browser controls (date, number, select, disclosure) are used
                              throughout, so assistive technology gets standard semantics.</li>
                    </ul>
               </div>

               <div>
                    <h3 class="text-slate-300 font-medium mb-1">Known gaps</h3>
                    <ul class="list-disc pl-5 space-y-1">
                         <li>Conformance is self-assessed; no third-party audit has been performed yet.</li>
                         <li>External citation links use the 24px minimum target size rather than the app's
                              44px standard, to keep the reference lists readable.</li>
                         <li>Native date and select pickers are supplied by your browser and may vary in
                              appearance and behavior.</li>
                    </ul>
               </div>

               <p>
                    Found a barrier? Email
                    <a :href="`mailto:${contact}`"
                         class="inline-block py-1.5 text-sky-400 hover:text-sky-300 underline underline-offset-2">{{
                              contact }}</a>
                    and it will be treated as a bug, not a nice-to-have.
               </p>

               <p class="text-muted border-t border-slate-800 pt-2">Statement last reviewed: {{ lastReviewed }}.</p>
          </div>
     </details>
</template>
