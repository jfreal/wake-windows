<script setup lang="ts">
// @doc:no-ai-no-data-training
// Plain-English stance panel: no LLM, no black box, no model trained on
// users — stated precisely (no overclaiming) and framed as transparency +
// privacy, not a missing feature. Sits on the privacy/methodology surface
// beside PrivacyPromise; the concrete arithmetic walk lives with the plan
// itself (HowCalculated.vue, under the nap schedule).
const competitors = [
     {
          name: 'Napper',
          detail: 'sends limited user data to OpenAI and Anthropic to power its AI features',
          url: 'https://napper.app/privacy/',
          linkText: 'privacy policy',
     },
     {
          name: 'Huckleberry',
          detail: 'runs Berry, a conversational AI answering from your logged data behind an account',
          url: 'https://huckleberry.zendesk.com/hc/en-us/articles/44561361627667-What-is-Berry',
          linkText: 'What is Berry?',
     },
     {
          name: 'Robin',
          detail: 'offers Ask Robin, an account-gated AI chat over your baby’s logs',
          url: 'https://www.robinbaby.com/',
          linkText: 'robinbaby.com',
     },
]
</script>

<template>
     <details class="rounded border border-slate-800">
          <!-- py-3: 20px line + 24px padding = 44px tap target (F08) -->
          <summary class="cursor-pointer select-none px-3 py-3 text-slate-300 text-sm font-semibold">
               No AI — on purpose
               <span class="text-muted font-normal">— no LLM, no black box, nothing trained on your data</span>
          </summary>

          <div class="px-3 pb-3 space-y-3 text-xs">
               <p class="text-slate-200 font-medium">
                    We don't use AI. We don't train anything on your data. Here's the arithmetic.
               </p>

               <p class="text-slate-400">
                    Precisely what that means: there is no LLM, no chatbot, and no machine-learned model
                    anywhere in this app — and no model, ours or anyone else's, is trained on you or your
                    baby. Every number on this page is transparent arithmetic: your wake time plus
                    age-appropriate wake-window ranges, walked forward into nap and bedtime windows.
                    Whenever a nap schedule is on screen, its
                    <span class="text-slate-300">"How this was calculated"</span> panel walks that
                    same math with your own numbers.
               </p>

               <p class="text-slate-400">
                    Every recommendation shows its inputs and carries a tier badge with a citation, and the
                    troubleshooter is a deterministic decision tree — the same answers always walk the same,
                    inspectable path. Nothing here is an oracle you have to take on faith.
               </p>

               <p class="text-slate-400">
                    That's a feature, not a gap. An answer you can check beats one you have to trust, and
                    data that never leaves your browser can't train anyone's model. We claim exactly this
                    much and no more: no black box, and nothing learned from users.
               </p>

               <div class="border-t border-slate-800 pt-2 space-y-1.5">
                    <p class="text-slate-400 uppercase tracking-wide">Where the category went instead</p>
                    <p v-for="c in competitors" :key="c.name" class="text-muted">
                         <span class="text-slate-300 font-medium">{{ c.name }}</span> — {{ c.detail }}
                         (<a
                              :href="c.url"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-sky-400 hover:text-sky-300 underline underline-offset-2"
                         >{{ c.linkText }} <span aria-hidden="true">↗</span></a>).
                    </p>
               </div>
          </div>
     </details>
</template>
