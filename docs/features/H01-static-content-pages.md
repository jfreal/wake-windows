---
title: Static Content Pages (SEO topic cluster)
sidebar_label: Static content pages
id: H01-static-content-pages
docKey: static-content-pages
category: Reach & Discovery
priority: P1
status: Built
tags: [seo, content, discovery, no-js, static]
---

# Static Content Pages (SEO topic cluster)

**Verdict:** confirmed gap in *our* funnel, not in the market. Every competitor ranks for `{age} sleep schedule`; we had one indexable URL.

## Problem / user need
A parent looking for help does not search for a planner. They search for their baby's age: `4 month old sleep schedule`, `6 month old sleep schedule`, `wake windows by age`. The app answers those questions better than the articles that rank for them — and was invisible to all of them, because the whole site was a single client-rendered route with a one-entry sitemap.

## Evidence
OpenSEO / DataForSEO pull, US + English, 2026-08-21 (full working: `../research/seo-topic-clusters.md`):

| Query | Volume/mo | KD |
|---|---|---|
| 4 month old sleep schedule | 12,100 | 7 |
| 6 month old sleep schedule | 12,100 | 0 |
| 3 month old sleep schedule | 9,900 | 5 |
| 5 month old sleep schedule | 9,900 | 0 |
| 7 month old sleep schedule | 8,100 | 0 |

Live SERP checks for `wake windows by age` and `6 month old sleep schedule` return article pages (Cleveland Clinic, Huckleberry, Taking Cara Babies) and Reddit threads. **No calculator ranks on page one.** That decided the page type: an article that shows the finished day, with the planner as the call to action rather than as the page.

## Our approach (spec)
- One hub at `/sleep-schedule/`, one spoke per age at `/sleep-schedule/{n}-month-old/`.
- Pages are **generated from the app's own models**, not hand-written: the sample day is walked through `ScheduleSetting`, and every published range comes from the Tier-1 bracket in `SleepRecommendations`. `agePages.test.ts` asserts each sample day sits inside its own age bracket, so a page cannot claim something the app would flag as out of range.
- Emitted as static HTML at build time by the `wake-windows-content-pages` plugin in `vite.config.ts`. No router, no SSG framework, nothing added to the client bundle — the app stays a single-route SPA.
- `sitemap.xml` is generated from the emitted routes (it used to be a hand-maintained file listing `/`).
- The CTA deep-links into the planner with the day pre-loaded (`/?s=7-1.5/1.75/1.75/2/2-7.5`), parsed by the existing `applyPlanParams`.
- `src/sw.ts` denylists `/sleep-schedule/*` from the SPA navigation fallback, so an installed PWA gets the article and not the app shell. The pages are still precached, so they work offline.

## Brand filter
- **Show your work.** Every page carries the Tier-1 sources and states plainly that "wake window" is a Tier-2 practice-based heuristic, not a term from the sleep-medicine literature.
- **Ranges, not a stopwatch.** Nap times print as windows rounded to 5-minute marks; the copy says anywhere inside the window counts.
- **No account, no AI.** The pages are inert HTML — no tracking, no third-party fonts or assets, nothing that phones home.

## Scope — shipped
- Hub + five spokes (3, 4, 5, 6, 7 months), the highest-volume/lowest-difficulty tranche.
- Article, FAQPage, and BreadcrumbList structured data per page; canonical, OG, and Twitter meta.
- Dev-server middleware so the pages render under `npm run dev`, not only after a build.

## Not in scope yet
The remaining clusters in `../research/seo-topic-clusters.md`: the rest of the ages (1, 2, 8-12, 18 months, newborn by week), wake-windows-by-age, nap transitions, sleep regressions, nap troubleshooting, and the calculator page. Each is additive — a new entry in `AGE_PAGES` or a sibling renderer.

## Measurement
Search Console is **not connected** to the OpenSEO project, so there is currently no first-party way to see whether any of this lands. Connecting it is the prerequisite for judging tranche two.

## Where it lives
- `src/content/agePages.ts` — page definitions and the model-derived schedule
- `src/content/renderContentPage.ts` — HTML, structured data, sitemap
- `vite.config.ts` — `wakeWindowsContentPages()` (build emit + dev middleware)
- `e2e/static-content-pages.spec.ts` — no-JS render, canonical, CTA round-trip, SW fallback
