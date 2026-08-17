# Wake Windows — Status

## What it is
A Vue 3 + TypeScript + Vite app that helps parents of infants plan nap schedules
from wake windows, baby age (with gestational-age adjustment), and bedtime. It
computes nap/night/wake totals, draws the day as a midnight-to-midnight strip
with a now-marker, renders an actual nap clock schedule, and compares the plan
against published sleep recommendations by age bracket. Schedules are shareable
via URL query string (`?bd=…&s=…`, plus `&shift=spring|fall` when a DST
transition plan is selected, and `&tab=…&topic=…` for the open screen).

## Screens

The app is four tabs, not one scroll. `stores/tabs.ts` owns which is open;
`plan.ts` folds it into the canonical query, so a screen is a place you can link
to (`?tab=learn&topic=safe-sleep`).

| Screen | Holds |
|---|---|
| **Today** | Countdown hero, day strip + Sleep Stats, reassurance note, guidance banner, nap schedule, normal-range bands, nap-transition prompt, atypical-day flag, sibling alignment. |
| **Log** | The one big asleep/awake toggle, the editable entry list, today's totals and the 7-day sparkline. |
| **Learn** | 16 cited guidance topics as a library — safe sleep, cues, overtired/undertired, the 4-month change, sleep training, contact naps, daycare, the troubleshooter, the arithmetic walk, FAQ, the full comparison table, the source library. |
| **Settings** | Plan inputs (+ sibling), personalization, DST shift, reminders, white noise, sitter link, handoff notes, calendar export, the privacy/no-AI stances, delete-all. |

Each screen is one column on a phone and two from `lg` (Learn is a card grid);
navigation is a bottom bar on a phone and a sticky sidebar from `md`.

A shared sitter link (`?view=sitter`) renders none of this: no navigation exists
in its DOM at all, only the read-only plan and the handoff recap.

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

Type is self-hosted via `@fontsource/faustina` + `@fontsource-variable/hanken-grotesk`,
bundled through Vite and precached by the service worker — never a Google Fonts
CDN link, which would break the offline shell and leak an IP on every open.

- `npm run dev` — dev server
- `npm run build` — `vue-tsc --noEmit && vite build`
- `npm test` — Vitest (347 tests)
- `npm run test:e2e` — Playwright (90 tests + 12 stubs for unbuilt features)

## Architecture

```text
src/
  main.ts                     Entry — mounts Vue app
  App.vue                     Shell: tab rail / bottom bar, header, footer,
                              the sitter branch, and the evidence sheet
  style.css                   @import "tailwindcss" + the paper palette wired
                              into Tailwind's scales + self-hosted fonts
  views/
    TodayView.vue             Countdown, day strip, note, schedule, ranges
    LogView.vue               Toggle, entries, week
    LearnView.vue             The 16-topic library + article view
    SettingsView.vue          Plan inputs, sharing, stances, delete
  stores/
    plan.ts                   The one reactive plan + the canonical URL writer
    sleepLog.ts               The one log + the one adaptive display ticker
    tabs.ts                   Which screen is open (+ which Learn topic)
    sheet.ts                  The one evidence sheet's content
  components/
    AppTabs.vue               Nav, in two layouts (bottom bar / desktop sidebar)
    TodayHero.vue             The countdown; terracotta awake, night asleep
    DayStrip.vue              Midnight-to-midnight strip + Sleep Stats table
    RestOfDay.vue             Wake, each nap window, bedtime — as ranges
    NormalRanges.vue          Three published ranges with the plan marked on
    RecentSleep.vue           Today's logged sleeps beside the plan, read-only
    SleepToggle.vue           The one big asleep/awake control
    QuickLogActions.vue       Add past sleep / add last night
    EvidenceSheet.vue         Bottom sheet / drawer: tier, why, math, source
    TierWhyButton.vue         "◐ Tier 2 · why?" — badge and trigger in one
    PlanWarnings.vue          The four impossible-plan messages
    Recommendations.vue       Per-source bracket tables + validation
    EvidenceGuidance.vue      Age-tied tier display: per-metric Tier 1/2
                              badges + tap-to-expand credentialed sources
    SafeSleep.vue             Prominent Tier 1 safe-sleep essentials
    SourcesEvidence.vue       Full citation library by tier + tier explainer
    TierBadge.vue             Tier 1/2/3 badge (color + shape, a11y-safe)
    Troubleshooter.vue        B05 decision-tree troubleshooter UI: tree picker,
                              question walker, cited Tier 3 answer leaves
    DstShift.vue              A08 DST shift tool: spring/fall presets, day-by-day
                              ramp with mini 24h strips and ±15-min ranges
    NoAiStance.vue            G04 stance panel: precise no-LLM / no-training
                              claims + competitor AI data-flow citations
    HowCalculated.vue         G04 "how this was calculated": the plan's
                              arithmetic spelled out with the user's own numbers
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
    today.ts                  The Today screen's arithmetic as pure functions:
                              day segments, "what happens next", band geometry
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
Every number on the Today screen is a button that opens one evidence sheet
(`stores/sheet.ts` + `EvidenceSheet.vue`) carrying the tier, the plain-language
reason, the arithmetic on the parent's own figures, and the citation link.

State lives in a single `reactive(ScheduleSetting)` in `stores/plan.ts`; the
address bar is rewritten from a debounced `watch` on the canonical query, which
folds in the DST preset, the atypical flag and the open tab/topic.

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
