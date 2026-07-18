# Wake Windows — Status

## What it is
A Vue 3 + TypeScript + Vite app that helps parents of infants plan nap schedules
from wake windows, baby age (with gestational-age adjustment), and bedtime. It
computes nap/night/wake totals, draws a 24-hour sleep bar, renders an actual nap
clock schedule, and compares the plan against published sleep recommendations by
age bracket. Schedules are shareable via URL query string (`?bd=…&s=…`).

## Stack (current)

| Tool | Version |
|------|---------|
| Vue | 3.5.x |
| Vite | 6.4.x |
| TypeScript | 5.9.x |
| Tailwind CSS | 4.3.x (via `@tailwindcss/vite`, CSS-first) |
| Vitest | 4.0.x |
| vue-tsc | 3.2.x |

- `npm run dev` — dev server
- `npm run build` — `vue-tsc --noEmit && vite build`
- `npm test` — Vitest (142 tests)

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
    time.ts                   formatClock(minutes) helper
    *.test.ts                 Vitest unit tests
```

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
`vue-tsc` typecheck clean · `vite build` clean · 60/60 tests pass · all Vue/TS
modules transform through the dev server with no Vite errors or template warnings.

## Possible future work
- Migrate the two named commercial sources' brackets beyond their current 3–7 mo range
  (currently only the general-guidance source spans the full age range).
- Highlight the bracket matching the baby's current age in `Recommendations.vue`.
- Add ESLint + Prettier.
- Input validation UX (clamp negative/oversized wake windows in the UI, not just warn).
