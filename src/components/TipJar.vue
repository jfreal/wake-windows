<script setup lang="ts">
// @doc:tip-jar-monetization
// Single unobtrusive tip-jar link, one-time payments only. Every feature is
// free whether or not you tip; the link must never grow into nag-ware,
// paywalls, or a "pro" tier.
//
// Processor: Buy Me a Coffee (one-time supported, no tipper account needed).
// TODO(placeholder): swap in the real page slug once the BMC account exists.
const TIP_URL = 'https://buymeacoffee.com/REPLACE-WITH-YOUR-PAGE'
</script>

<template>
     <p class="text-muted text-xs">
          Free to use, funded by an optional
          <a
               :href="TIP_URL"
               target="_blank"
               rel="noopener noreferrer"
               class="inline-flex items-center min-h-6 px-0.5 text-sky-400 hover:text-sky-300 underline underline-offset-2"
          >tip jar <span aria-hidden="true">↗</span></a>
          — a one-time thank-you if this helped.
          <span class="text-slate-400">No subscription, ever.</span>
          No auto-renew, no paywalled features, no ads.
     </p>
</template>
