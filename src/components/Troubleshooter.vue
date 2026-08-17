<script setup lang="ts">
import { computed, ref } from 'vue'
import {
     answeredSteps,
     chooseOption,
     createSession,
     currentNode,
     goBack,
     type LeafKind,
     type TroubleshooterSession,
     type TroubleshooterTree,
} from '../models/Troubleshooter'
import { troubleshooterTrees } from '../data/troubleshooterTrees'
import { getSources } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:interactive-troubleshooter
// Deterministic decision-tree walker (no LLM, no account, works offline): the
// trees are typed data in data/troubleshooterTrees.ts; this component only
// renders the current node and records choices.

const session = ref<TroubleshooterSession | null>(null)

const node = computed(() => (session.value ? currentNode(session.value) : null))
const question = computed(() => (node.value?.kind === 'question' ? node.value : null))
const leaf = computed(() => (node.value?.kind === 'leaf' ? node.value : null))
const steps = computed(() => (session.value ? answeredSteps(session.value) : []))
const leafSources = computed(() => (leaf.value?.sourceIds ? getSources(leaf.value.sourceIds) : []))

// Reassurance leans green, the pediatrician exit leans amber, advice stays
// neutral. These are left-edge-free full borders on a single card — the answer
// is not nested inside another card (it replaces the question in place), so the
// panel never stacks a box in a box in a box.
const leafStyles: Record<LeafKind, string> = {
     advice: 'border-slate-700 bg-slate-800/60',
     reassurance: 'border-emerald-400/30 bg-emerald-400/5',
     medical: 'border-amber-400/40 bg-amber-400/10',
}

function start(tree: TroubleshooterTree) {
     session.value = createSession(tree)
}
function pick(index: number) {
     if (session.value) session.value = chooseOption(session.value, index)
}
function back() {
     if (session.value) session.value = goBack(session.value)
}
function exit() {
     session.value = null
}
</script>

<template>
     <h2 class="eyebrow">Sleep Troubleshooter</h2>
     <p class="text-muted text-xs mb-2">
          Pick the problem and answer a few questions to narrow down the likely cause. This is a plain
          decision tree — every answer is pre-written and cited, no AI, no account, nothing leaves your
          browser. It never diagnoses; anything medical goes to your pediatrician.
     </p>

     <!-- Tree picker -->
     <div v-if="!session" class="space-y-2">
          <button
               v-for="tree in troubleshooterTrees"
               :key="tree.id"
               type="button"
               class="btn btn-quiet w-full justify-start flex-col items-start gap-0 py-2.5 px-2.5 text-left"
               v-on:click="start(tree)"
          >
               <span class="font-medium">{{ tree.title }}</span>
               <!-- muted-raised: the tagline sits on a slate-800 fill, where plain
                    `muted` measures 4.13:1 — under the floor. -->
               <span class="block text-muted-raised text-xs mt-0.5">{{ tree.tagline }}</span>
          </button>
     </div>

     <!-- One frame, not two: the walk-through owns the border, and the answer
          card below replaces the question inside it rather than nesting under a
          second one. -->
     <div v-else class="rounded border border-slate-800 p-3">
          <div class="flex items-center justify-between gap-2 mb-2">
               <span class="text-slate-300 text-sm font-semibold">{{ session.tree.title }}</span>
               <div class="shrink-0 flex items-center gap-1">
                    <button
                         v-if="steps.length"
                         type="button"
                         class="btn-inline"
                         v-on:click="back"
                    >← Back</button>
                    <button
                         type="button"
                         class="btn-inline"
                         v-on:click="exit"
                    >All problems</button>
               </div>
          </div>

          <!-- Answered so far -->
          <ol v-if="steps.length" class="mb-3 space-y-1">
               <li v-for="(step, i) in steps" :key="i" class="text-xs text-muted">
                    {{ step.prompt }}
                    <span class="text-slate-300">— {{ step.answer }}</span>
               </li>
          </ol>

          <div aria-live="polite">
               <!-- Question node -->
               <div v-if="question">
                    <p class="text-slate-200 text-sm font-medium mb-2">{{ question.prompt }}</p>
                    <p v-if="question.help" class="text-muted text-xs mb-2">{{ question.help }}</p>
                    <div class="space-y-2">
                         <button
                              v-for="(option, i) in question.options"
                              :key="option.next"
                              type="button"
                              class="btn btn-quiet w-full justify-start px-2.5 text-left"
                              v-on:click="pick(i)"
                         >{{ option.label }}</button>
                    </div>
               </div>

               <!-- Leaf node -->
               <div v-else-if="leaf" class="rounded border p-3" :class="leafStyles[leaf.leafKind]">
                    <p class="text-sm font-semibold" :class="leaf.leafKind === 'medical' ? 'text-amber-300' : 'text-slate-200'">
                         {{ leaf.title }}
                    </p>
                    <p v-for="(paragraph, i) in leaf.body" :key="i" class="text-slate-300 text-sm mt-2">{{ paragraph }}</p>

                    <!-- The suggestion is set off by a rule and a label, not by a
                         third nested box. Uppercase without extra tracking, matching
                         the app's section labels — one uppercase treatment, not two. -->
                    <div v-if="leaf.suggestion" class="mt-3 border-t border-slate-700 pt-2.5">
                         <p class="eyebrow mb-1">Try this</p>
                         <p class="text-slate-200 text-sm">{{ leaf.suggestion }}</p>
                    </div>

                    <p v-if="leaf.patienceNote" class="text-muted-raised text-xs italic mt-3">{{ leaf.patienceNote }}</p>

                    <div v-if="leaf.tier" class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                         <TierBadge :tier="leaf.tier" />
                         <span v-for="src in leafSources" :key="src.id" class="text-xs">
                              <a
                                   :href="src.url"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   :title="src.title"
                                   class="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                              >{{ src.org }} <span aria-hidden="true" class="text-muted">↗</span></a>
                         </span>
                    </div>

                    <button
                         type="button"
                         class="btn btn-quiet mt-3"
                         v-on:click="exit"
                    >Troubleshoot another problem</button>
               </div>
          </div>
     </div>
</template>
