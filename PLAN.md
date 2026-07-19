# Wake Windows — Status

## What it is
A Vue 3 + TypeScript + Vite app that helps parents of infants plan nap schedules
from wake windows, baby age (with gestational-age adjustment), and bedtime. It
computes nap/night/wake totals, draws a 24-hour sleep bar, renders an actual nap
clock schedule, and compares the plan against published sleep recommendations by
age bracket. Schedules are shareable via URL query string (`?bd=…&s=…`, plus
`&shift=spring|fall` when a DST transition plan is selected).

## Stack (current)

| Tool | Version |
|------|---------|
| Vue | 3.5.x |
| Vite | 6.4.x |
| TypeScript | 5.9.x |
| Tailwind CSS | 4.3.x (via `@tailwindcss/vite`, CSS-first) |
| Vitest | 4.0.x |
| vue-tsc | 3.2.x |
| vite-plugin-pwa | 1.3.x (Workbox `generateSW`) |

- `npm run dev` — dev server
- `npm run build` — `vue-tsc --noEmit && vite build`
- `npm test` — Vitest (143 tests)

## Architecture

```text
src/
  main.ts                     Entry — mounts Vue app
  App.vue                     Root shell (max-width, mobile padding)
  style.css                   @import "tailwindcss" + base tokens
  components/
    Summary.vue               <script setup> — inputs, bar chart, stats,
                              nap schedule, warnings, URL persistence
    Recommendations.vue       Per-source bracket tables + validation
  components/
    EvidenceGuidance.vue      Age-tied tier display: per-metric Tier 1/2
                              badges + tap-to-expand credentialed sources
    SafeSleep.vue             Prominent Tier 1 safe-sleep essentials
    SourcesEvidence.vue       Full citation library by tier + tier explainer
    TierBadge.vue             Tier 1/2/3 badge (color + shape, a11y-safe)
    Troubleshooter.vue        B05 decision-tree troubleshooter UI: tree picker,
                              question walker, cited Tier 3 answer leaves
    DstShift.vue              A08 DST shift tool: spring/fall presets, day-by-day
                              ramp with mini 24h strips and ±15-min ranges
  data/
    citations.json            Source library + per-age-band recommendations
                              (copied from ../../.research/citations.json)
    troubleshooterTrees.ts    The three B05 trees as typed data (early rising,
                              short naps, false start vs split night)
  models/
    ScheduleSetting.ts        Core model: sleep math, gestational age,
                              napTimes / wake / bedtime (all unit-tested)
    SleepRecommendations.ts   Bracket data + validation (now tier-tagged)
    Citations.ts              Typed access to citations.json: sources, tiers,
                              age-band lookup (unit-tested)
    Troubleshooter.ts         B05 deterministic decision-tree engine: session
                              walk/back, structural tree validation (unit-tested)
    DstShift.ts               A08 shift math: 4-day ±15-min/day DST ramp,
                              URL param mapping (unit-tested)
    time.ts                   formatClock(minutes) helper
    *.test.ts                 Vitest unit tests
  components/
    OfflineIndicator.vue      F07 offline banner ("your plan still works") +
                              service-worker update prompt (refresh path)
```

## Offline / PWA (F07)

The app is an installable PWA. `vite-plugin-pwa` (Workbox `generateSW`,
`registerType: 'prompt'`) precaches the entire build — shell, JS (citations.json
is bundled into the JS via import, so evidence content works offline), CSS,
icons. `OfflineIndicator.vue` shows an honest "Offline — your plan still works"
banner on connectivity loss and an explicit "Update available — Refresh" prompt
when a new deploy's service worker is waiting. Updates are announced, not
forced: the prompt is dismissible, so a user who picks "Not now" keeps the old
worker (and its logic/citations) until they refresh or the prompt reappears on
a later visit. Icons live in `public/` (generated from
`assets/logo.png`); `netlify.toml` serves `sw.js` and `manifest.webmanifest`
with `max-age=0, must-revalidate` and hashed `/assets/*` as immutable. No user
data lives in the SW cache — plan state stays in the URL.

## Evidence tiers (spec §6)

Every recommendation carries a Tier 1 (evidence-based) / Tier 2 (practice-based
heuristic) badge. Total-sleep and nap-count metrics are Tier 1; specific
wake-window durations are Tier 2 and labeled as not trial-validated. Sources
expand inline to show author credentials, organization, year, and a working
link; a "Sources & Evidence" panel lists the full library by tier with a tier
explainer; a persistent footer carries the medical disclaimer + lastVerified.
State lives in a single `reactive(ScheduleSetting)` in `Summary.vue`; URL sync is
handled in a `watch` (keyed on the schedule shorthand **and** birthday).

## History
This project was modernized from a stale 2022 template (Vite 3 / TS 4.6 / Tailwind 3.1,
Options API, ~12 logic bugs, no tests). Completed:
- Dependency upgrade to the stack above; Tailwind migrated to v4 (Vite plugin,
  `@import "tailwindcss"`, no PostCSS/autoprefixer config).
- Original bug list fixed (validation logic, gestational-age math, debug remnants,
  side-effect-in-computed, dead code).
- Vitest suite added (47 tests across the model layer).
- Features added: nap clock schedule, expanded age coverage (newborn → 24 mo via a
  general-guidance source), mobile-responsive layout.

## Verified
`vue-tsc` typecheck clean · `vite build` clean · full Vitest suite passes (count
tracked in the Stack section above) · all Vue/TS modules transform through the
dev server with no Vite errors or template warnings.

## Possible future work
- Migrate the two named commercial sources' brackets beyond their current 3–7 mo range
  (currently only the general-guidance source spans the full age range).
- Highlight the bracket matching the baby's current age in `Recommendations.vue`.
- Add ESLint + Prettier.
- Input validation UX (clamp negative/oversized wake windows in the UI, not just warn).
