<script setup lang="ts">
import { getSources, type CitationSource } from '../models/Citations'
import TierBadge from './TierBadge.vue'

// @doc:sleep-training-overview
// Static, cited, deliberately neutral overview of sleep-training methods (B07,
// G03). Sleep training is one of the most guilt-laden topics in early parenting,
// so this panel names the methods without ranking them, gives an honest read of
// the efficacy and long-term-safety evidence, puts the widely-shared "cortisol
// harm" study in context, and keeps the under-4-month readiness caveat prominent.
// No LLM, no account — plain content plus tier badges and citations, matching the
// SafeSleep / RegressionExplainer panel pattern.

// The methods, described plainly and in no particular order — none is presented
// as "best." Definitions only; the efficacy/safety evidence lives in its own
// tier-badged cards below.
interface Method {
     name: string
     body: string
}
const methods: Method[] = [
     {
          name: 'Unmodified extinction ("cry it out")',
          body: 'Baby is put down awake and settles without checks until a set morning time. Fast in trials, but many parents find it the hardest to carry out.',
     },
     {
          name: 'Graduated extinction (Ferber / timed check-ins)',
          body: 'Brief, timed check-ins that gradually lengthen — offering reassurance without feeding or picking up, so the baby practises settling.',
     },
     {
          name: 'Bedtime fading / positive routines',
          body: 'Temporarily move bedtime later to match natural sleepiness, then shift it earlier as settling gets easier, paired with a calm, consistent pre-sleep routine.',
     },
     {
          name: 'Scheduled awakenings',
          body: 'Gently rouse the baby a short while before a habitual night waking to pre-empt it, then phase the wakings out.',
     },
     {
          name: 'Chair method / camping out',
          body: 'A parent stays beside the crib and moves progressively farther away over successive nights, fading their presence rather than the checks.',
     },
     {
          name: 'Parent education (prevention)',
          body: 'Teaching sleep-supportive routines and responses early, before problems set in — the most preventive, lowest-key option.',
     },
]

// Cited claim cards. Each carries a tier badge and the sources behind it.
interface Claim {
     heading: string
     tier: number
     body: string[]
     sources: CitationSource[]
}

const efficacy: Claim = {
     heading: 'Do they work? — the efficacy evidence',
     tier: 1,
     body: [
          'An American Academy of Sleep Medicine task force reviewed 52 studies: 94% found behavioral methods effective, and over 80% of treated children showed a clinically meaningful improvement that held at 3–6 month follow-up.',
          'Separately, a randomized trial of 405 families found that simply adding a consistent nightly bedtime routine shortened the time to fall asleep and reduced night wakings — and a later 10,000-child analysis found the benefit dose-dependent (more consistent is better). A routine alone is a gentle place to start.',
     ],
     sources: getSources(['mindell-2006-aasm', 'mindell-2009-routine-rct']),
}

const safety: Claim = {
     heading: 'Is it safe long-term? — the follow-up evidence',
     tier: 1,
     body: [
          'A randomized trial followed 326 children to age six. Compared with controls, there were no differences in emotional or behavioral problems, sleep, stress hormones (cortisol), the child–parent relationship, attachment, or maternal mental health.',
          'The authors concluded these techniques have no marked long-lasting effects, good or bad — so families who choose them can do so with confidence.',
     ],
     sources: getSources(['price-2012-followup']),
}

// The cortisol concern, handled with care: correct the myth without dismissing
// the very real feelings behind it (spec §edge-cases, G03).
const cortisol: Claim = {
     heading: 'What about the "cortisol harms your baby" study?',
     tier: 3,
     body: [
          'That fear is understandable — no parent wants to cause their baby stress. It traces to a single small study: 25 infants, no comparison group, no starting baseline, and just two days of data. That is far too little to show that sleep training harms babies.',
          'It is fair to feel uneasy, and it is also fair to know the science: the strongest, longest study we have (above) found no lasting harm. Both things can be true.',
     ],
     sources: getSources(['middlemiss-2012']),
}

// Readiness caveat kept prominent, and paired with safe sleep (B03).
const readiness: Claim = {
     heading: 'When is it appropriate? — readiness',
     tier: 1,
     body: [
          'Sleep training is not appropriate under about 4 months; the evidence base sits at roughly 4–6 months and older, once night feeds and newborn sleep patterns have matured. Expert guidelines deliberately issue no sleep-shaping advice below 4 months.',
          'Whatever you choose — a formal method, just a bedtime routine, or waiting — is a valid, loving choice. There is no wrong one here. Whichever path you take, keep every sleep a safe sleep.',
     ],
     sources: getSources(['mindell-2006-aasm', 'paruthi-2016']),
}

const claims: Claim[] = [efficacy, safety, cortisol, readiness]
</script>

<template>
     <details class="rounded border border-slate-800">
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               Sleep-training methods
               <span class="text-muted font-normal">— a neutral, cited overview</span>
          </summary>

          <div class="px-3 pb-3 space-y-3">
               <p class="text-xs text-slate-400">
                    Sleep training is personal, and it is easy to feel judged from every direction.
                    This is a plain menu of the common methods and an honest read of the evidence —
                    no ranking, no pressure. Training, a bedtime routine, or choosing not to train are
                    all valid, loving choices.
               </p>

               <!-- The methods menu: definitions only, in no particular order. -->
               <div class="rounded border border-slate-800 bg-slate-800/40 p-3">
                    <h3 class="text-slate-100 text-sm font-semibold">The methods, in no particular order</h3>
                    <p class="mt-1 text-xs text-slate-400">
                         None of these is "best." Different families land in different places, and
                         that is fine.
                    </p>
                    <dl class="mt-2 space-y-2">
                         <div v-for="method in methods" :key="method.name">
                              <dt class="text-sm font-semibold text-slate-200">{{ method.name }}</dt>
                              <dd class="text-sm text-slate-300">{{ method.body }}</dd>
                         </div>
                    </dl>
               </div>

               <!-- One card per cited claim (efficacy, safety, cortisol context, readiness). -->
               <div
                    v-for="claim in claims"
                    :key="claim.heading"
                    class="rounded border border-slate-800 bg-slate-800/40 p-3"
               >
                    <div class="flex flex-wrap items-center gap-2">
                         <h3 class="text-slate-100 text-sm font-semibold">{{ claim.heading }}</h3>
                         <TierBadge :tier="claim.tier" />
                    </div>

                    <p v-for="(paragraph, i) in claim.body" :key="i" class="mt-2 text-sm text-slate-300">
                         {{ paragraph }}
                    </p>

                    <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                         <a
                              v-for="src in claim.sources"
                              :key="src.id"
                              :href="src.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              :title="src.title"
                              class="link-ext min-h-11"
                         >{{ src.org }} <span aria-hidden="true" class="text-muted">↗</span></a>
                    </div>
               </div>
          </div>
     </details>
</template>
