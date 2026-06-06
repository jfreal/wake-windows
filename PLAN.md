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
- `npm test` — Vitest (47 tests)

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
  models/
    ScheduleSetting.ts        Core model: sleep math, gestational age,
                              napTimes / wake / bedtime (all unit-tested)
    SleepRecommendations.ts   Recommendation data + validation
    time.ts                   formatClock(minutes) helper
    *.test.ts                 Vitest unit tests
```
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
`vue-tsc` typecheck clean · `vite build` clean · 47/47 tests pass · dev server renders
(dark theme, nap schedule, recommendation tables) with no console/Vite errors.

## Possible future work
- Migrate the two named commercial sources' brackets beyond their current 3–7 mo range
  (currently only the general-guidance source spans the full age range).
- Highlight the bracket matching the baby's current age in `Recommendations.vue`.
- Add ESLint + Prettier.
- Input validation UX (clamp negative/oversized wake windows in the UI, not just warn).
