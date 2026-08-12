# 09 — Coverage Gap Analysis: Can the App Handle What Parents Actually Ask?

**What this is:** every guide topic (doc 06), FAQ (doc 07), and Reddit theme (doc 08) mapped against what the app actually ships today. "Where handled" claims below were verified against the source on 2026-08-12 by inspecting components, models, `citations.json`, and `troubleshooterTrees.ts` — not against the feature briefs. Status: ✅ handled · 🟡 partial · ❌ missing.

> **IMPLEMENTED 2026-08-12.** Every ❌ and 🟡 below was closed the same day (except #27, deliberately out of scope). Shipped: `WindowMechanics.vue` (#19), `NapCaps.vue` (#21), `ContactNaps.vue` (#20), `DaycareGuidance.vue` (#22), `OvertiredUndertired.vue` (#6), `FaqPanel.vue` + `data/faq.ts` + `faq.test.ts` (18 cited Q&As), `models/scheduleTemplates.ts` + tests + preset chips in `ChildInputs.vue` (#25), crib-hour honest treatment in the short-naps tree (#26), nap-strike disambiguation in `NapTransition.vue` (#23), newborn day/night note in `GuidanceMode.ts`/`GuidanceBanner.vue` (#24), daycare/car-nap atypical reasons + counting-rule tips (#12), observed sleep-budget line in `TrendsToday.vue` (#16 — it averages the days actually logged and says so, rather than claiming a 7-day average), preemie adjusted-vs-actual hint in `ChildInputs.vue` (#9), twin practice rules in `SiblingAlignment.vue` (#10), nap-specific safe-sleep bullets in `SafeSleep.vue` (#15), and 17 new sources in `citations.json` (82 total, incl. Mindell 2010, Horváth 2018, Gilchrist 2025, Reynaud 2026, Oster, Possums/NDC, Romper, Mayo). Guardrail audits passed: reminder copy never scolds, sleep-log time entry is typed (`datetime-local`), no streaks/scores anywhere. Verified: 329 unit tests, full Playwright e2e suite (85 passed, 12 skipped), production build clean — counts as of the review pass that followed, which also fixed the blank-gestational-weeks age bug and the observed-average label. **Everything below this banner is the original 2026-08-12 morning audit, preserved unedited as the historical record — its ❌/🟡 marks describe the app before this work, not after.**

**Bottom line (as of the 2026-08-12 morning audit):** the app already handles the *hard* problems unusually well — the three troubleshooter trees cover four of the top-ten FAQs, and the evidence/anti-anxiety architecture matches the community's own consensus ("sleep budgets over stopwatches," "cited ranges over influencer tables") almost exactly. The gaps are almost all **cheap content gaps**, not engineering gaps: the highest-frequency definitional question on the internet ("when does the window start / does feeding count") has zero coverage anywhere in the repo, and neither do contact naps, nap capping, daycare, crib hour, nap strikes, day/night confusion, or the "2-3-4" template vocabulary parents search by.

---

## Scorecard

| # | Theme | Demand evidence | Where handled today (verified) | Status |
|---|---|---|---|---|
| 1 | Wake-window ranges by age, cited | FAQ ★#1 · Reddit T1 HIGH | `Recommendations.vue`, `SleepRecommendations.ts`, `citations.json` tier badges | ✅ |
| 2 | Schedule generation + bedtime + 24h visual | FAQ ★#1 · Reddit T19 | `Summary.vue`, `ScheduleSetting.ts` | ✅ |
| 3 | Short naps / 45-min intruder | FAQ ★#2 · Reddit T4 VERY HIGH | `shortNaps` troubleshooter tree (newborn-normal, intruder, over/under, associations, cycle practice) | ✅ |
| 4 | False starts & split nights | FAQ ★#9 · Reddit T5, T16 | `nightWaking` tree (30–45min branch, 1–3h split-night branch, sleep-budget framing) | ✅ |
| 5 | Early morning waking | FAQ ★#8 · Reddit T11 HIGH | `earlyRising` tree (light, **temperature**, hunger, settling, overtired/too-much-day-sleep, hold-steady) — even covers the viral "cold at 4am" case | ✅ |
| 6 | Overtired vs undertired disambiguation | Reddit T17 HIGH ("central ambiguity") | Branch logic inside all three trees | 🟡 — handled inside trees, but it's the #1 interpretive question; deserves a standalone cited explainer surfaced outside the troubleshooter |
| 7 | Nap transitions 4→3→2→1 | FAQ ★#6 · Reddit T7, T8 HIGH | `NapTransition.vue` + `napTransition.ts` detector & guidance | ✅ |
| 8 | Cues-vs-clock by age | FAQ theme 2 · Reddit T3 HIGH | `GuidanceMode.ts` age-based blend — matches Huckleberry's own Mar-2026 walk-back and community consensus | ✅ |
| 9 | Corrected / adjusted age (preemies) | FAQ theme 12 · Reddit T14 | `ChildInputs.vue`, `ScheduleSetting.ts`, `GuidanceBanner.vue`, `napTransition.ts` | ✅ — consider one line of copy acknowledging "many preemies land between adjusted and actual — follow the baby" (T14 consensus) |
| 10 | Twins / sibling alignment | FAQ theme 13 · Reddit T15 | `SiblingAlignment.vue`, `napOverlap.ts` | ✅ — add the two content rules parents ask for: wake twin #2 within 15–30 min; one sleep surface each (AAP) |
| 11 | DST & travel shifts | FAQ theme 14 | `DstShift.vue` + model | ✅ |
| 12 | Atypical day / disruption recovery | Reddit T20 MED | `AtypicalDayFlag.vue` | 🟡 — flag exists, but the specific "does a 10-min car nap count?" rule (yes; <30 min → add 10–45 min to the window; longer → real nap) appears nowhere |
| 13 | Regressions (incl. 12-month myth) | FAQ theme 10 | `RegressionExplainer.vue` | ✅ |
| 14 | Sleep training overview | FAQ theme 16 | `SleepTrainingOverview.vue` | ✅ |
| 15 | Safe sleep basics | FAQ theme 15 | `SafeSleep.vue` (AAP panel) | 🟡 — nap-specific rules missing: swing/car-seat → transfer ASAP; couch/armchair co-sleep 67× risk; room-share stat |
| 16 | Personalization from history / sleep budget | Reddit T1, T16, T18 HIGH | `PersonalizedWindows.vue/.ts`, `SleepLog`, `TrendsToday`; "budget" appears in `nightWaking` tree | 🟡 — the machinery exists; the *framing* ("compute YOUR baby's 24h total; charts are averages") isn't surfaced as a first-class number |
| 17 | Evidence transparency / "is this even science?" | Reddit T21 MED · anxiety signals | `SourcesEvidence`, `EvidenceGuidance`, `HowCalculated`, `NoAiStance`, `TierBadge`, 65-source `citations.json` incl. Canapari + Flynn-Evans critiques | ✅ — strongest differentiator; doc 08 shows a named, frustrated audience for exactly this |
| 18 | Anti-anxiety mechanics | Anxiety signals (doc 08) | Ranges everywhere, no streaks, `GuidanceBanner`, tone | ✅ — doc 08's five-part "anxiety machine" list is a useful regression checklist |
| 19 | **Wake-window mechanics: when does it start, does feeding count, does settling count** | FAQ ★#3, ★#4 · Reddit T2 HIGH (unresolved on Reddit) | **Nothing.** `HowCalculated.vue` explains the arithmetic but never defines where a window starts/ends; "eyes open" appears nowhere in repo | ❌ |
| 20 | **Contact naps (guilt + safety + weaning) & nursing to sleep** | FAQ ★#10 · Reddit T6 HIGH | **Nothing** ("contact nap" absent from repo) | ❌ |
| 21 | **Nap capping / "should I wake a sleeping baby"** | FAQ ★#7 | **Nothing** ("wake a sleeping," "cap" absent) | ❌ |
| 22 | **Daycare conflicts** | FAQ theme 11 · Reddit T13 HIGH, emotionally loaded | **Nothing** ("daycare" absent) | ❌ |
| 23 | **Nap strikes** (as distinct from transitions) | FAQ theme 5 · Reddit T12 MED | **Nothing** ("nap strike" absent; transition detector is adjacent) | ❌ |
| 24 | **Day/night confusion (newborn)** | FAQ theme 8 | **Nothing** | ❌ |
| 25 | **Named templates ("2-3-4")** | Reddit T9 MED — parents search these exact strings | **Nothing** | ❌ |
| 26 | **Crib hour** (honest, contested treatment) | FAQ theme 4 · Reddit T10 MED | **Nothing** | ❌ |
| 27 | What to do *during* wake windows | Reddit T22 MED | Nothing | ⬜ out of scope — activity content isn't a napping-tool job; note it once in the troubleshooter if ever |

---

## Recommended actions (scope- and brand-filtered)

All of these fit the five brand principles (no account, no AI, ranges, show-your-work, ephemerality) and the 2026-07-21 scope decision (napping & sleep tool only). Ordered by demand-per-unit-effort.

### P0 — content patches to existing components (hours each, top-10-FAQ demand)

1. **"What counts as awake?" explainer (theme 19).** One `<details>` panel beside `HowCalculated.vue`: window starts at wake-up (a real one — sustained eyes-open, not 2am fussing), feeding/changes/play count, settling time doesn't (window ends at lay-down), and *this is exactly why the app shows ranges — ±10 minutes of definitional slop is inside every range*. That last sentence converts the internet's most-annoying ambiguity into an argument for the product's core mechanic. Cite TCB/Happiest Baby/The Bump (T3 tier, agreement-of-experts).
2. **Nap capping stance (theme 21).** Short cited note in `Recommendations.vue` or the schedule summary: consultant consensus caps naps ~2h (multi-nap) / ~3h (one nap) and anchors morning wake [T3]; newest actigraphy (Reynaud 2025 — preschoolers 2–5, so adjacent-age evidence) finds naps trade minimally against night sleep and *end-time* matters more than length [T2 with age caveat]. Present both, tiered — nobody else does.
3. **Safe-sleep nap addendum (theme 15).** Three bullets in `SafeSleep.vue`: every nap on back/firm/flat; swing/car-seat/carrier → transfer ASAP; never doze with baby on couch/armchair (up to 67× risk). All AAP-citable; the app already carries `aap-safesleep-2022`.
4. **Contact-nap reassurance (theme 20).** Belongs in the app's calm register: contact naps are normal and don't ruin independent sleep; safety rule above applies; many babies self-wean ~4–6m; weaning path exists when *the parent* wants it. Could live as a short guidance card or a `shortNaps` tree leaf ("nap happens only on me" branch). Cite TCB/KellyMom + AAP for the safety line.

### P1 — small features / bigger content (days each)

5. **Daycare guidance (theme 22).** A cited explainer — "let daycare be daycare": two schedules coexist fine; early bedtime (to ~6pm) buys back lost day sleep; the car-nap-on-the-way-home rule (<30 min → extend the evening window 10–45 min; ≥30 min → it was a nap). Optionally: a "daycare day" preset on `AtypicalDayFlag` that relaxes the day's ranges. High emotional payoff (doc 08 T13).
6. **Car-nap / disruption rule on `AtypicalDayFlag` (theme 12).** Answer the exact question "what happens to the rest of today?" — the flag already recomputes; add the counting rule copy so parents trust it.
7. **Sleep-budget framing (theme 16).** Surface "your baby's observed 24h total" as a first-class number in `PersonalizedWindows`/`TrendsToday`, with the copy "published charts are averages (Galland 2012: 6m range 8.8–17.0h) — your baby's own total is the better anchor." This is r/sleeptrain's pinned methodology; the app already computes the inputs locally.
8. **Overtired/undertired standalone explainer (theme 6).** Lift the disambiguation logic out of the trees into one cited card (early cues vs late cues; overtiredness needs a cause, undertiredness accrues silently). It's the single most-linked interpretive question.
9. **Nap-strike note (theme 23).** One leaf in the transition detector: "refusing naps <2 weeks + a leap/teething = probably a strike, hold steady; ≥2 weeks + age-appropriate = maybe a transition." Cheap, directly answers a MED-frequency panic.
10. **Day/night confusion note (theme 24).** Age-gated (<10 weeks) line in `GuidanceBanner`: bright days, dark boring nights, wake from naps >2h, resolves by ~8 weeks.

### P2 — later

11. **Named-template presets (theme 25).** Offer "2-3-4" (and 3-3-4) as one-tap presets that fill the wake-window inputs, with an honest caveat for low-sleep-needs babies. Doubles as SEO surface — parents search the literal string.
12. **Crib hour, treated honestly (theme 26).** Short entry in the short-naps tree endnotes: what it is, T3 heuristic, contested, prerequisite independent settling — the honest-tiering treatment is itself differentiating.
13. **In-app FAQ page (B-series).** Doc 07 is effectively the content spec: ~60 cited Q&As reusing `citations.json`. Biggest content lift, but it is literally "the app catalogs every question parents ask."

### Product guardrails confirmed by app-sentiment data (doc 08) — keep, don't break

- User-set windows with ranges = the "override the app's sleep assumption" wish Huckleberry refuses. Core moat; never auto-assert totals.
- No scolding notifications ("overdue for sleep" is Napper's most-hated behavior). If `RemindersNudges` ever fires copy, keep it informational ("nap window opens ~2:10") — worth an audit pass against doc 08's five-part anxiety checklist.
- Typed time entry (Huckleberry's hated picker-wheel). Verify `SleepLog` inputs allow keyboard entry; parents beg for it.
- Free + no account + privacy-first: Reddit threads show organic privacy-policy scrutiny (Nara dissent) and deep paywall resentment (Huckleberry 2021, Little Ones access-revocation). The tip jar + G01/G05 stance is repeatedly, spontaneously validated.
- Ephemerality (G05): "when did you stop tracking?" consensus is 3–9 months with relief — design the good ending on purpose.

### Citation upkeep

- Add to `citations.json`: `mindell-2010-crosscultural`, `horvath-plunkett-2018`, `gilchrist-2025-frontiers`, `reynaud-2025-bmc`, `oster-parentdata-2024`, `possums-2019-sleephealth` (see doc 06 for URLs/claims); manually retrieve PMID 41339164 (*Semin Pediatr Neurol* 2025, robots-blocked).
- Spot-checked existing citations 2026-08-12: `nhs-2025` and `tcb-separation-anxiety` URLs both still resolve (an *older* NHS path 404s; the one in citations.json is fine). No link rot found in the sampled set; a periodic `lastVerified` sweep of all 65 remains worthwhile.
