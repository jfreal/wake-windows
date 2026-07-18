# Wake Windows — Master Credibility & Feature Reference

**What this is:** the single source of truth tying the app's features to cited sleep science and to what competitors do. Use it to (1) build and word features, (2) defend every on-screen claim, and (3) know where the product can win.

**Companion files (in `/research`):**
- `01-wake-window-science.md` — the evidence backbone (sleep needs, wake windows, circadian development).
- `02-sleep-foundations-and-nap-transitions.md` — scheduling logic, nap transitions, night sleep, safe sleep, sleep training.
- `03-competitor-analysis.md` — full competitor benchmark + feature matrix.
- `04-feature-recommendations.md` — prioritized, evidence-tied feature backlog.

**Last researched:** July 2026. ~50+ sources across AAP, AASM, NSF, peer-reviewed studies, clinics, and every major competitor.

---

## The one thing to internalize

**Total sleep-duration numbers are real science. The specific wake-window minute-charts are a popular heuristic, not validated medicine.** The underlying biology (sleep pressure builds during wake, dissipates during sleep) is textbook — but the exact "0–6 weeks = 30–60 min" numbers are consultant conventions that *disagree across sources* and return **zero hits on PubMed**. Yale pediatric sleep physician Dr. Craig Canapari: wake windows are *"not… taught, discussed, or researched in… pediatric sleep medicine."*

This is not a problem for the product — it's the **positioning.** Competitors present wake-window predictions as black-box magic. This app can be the one that **shows its work**: uses the heuristic, labels it honestly, cites the real science underneath, and flags its own uncertainty. That honesty *is* the credibility.

---

## Evidence tiers (use these badges in-app)

| Tier | Meaning | Examples | In-app use |
|---|---|---|---|
| **T1 — Strong** | AAP/AASM policy, RCTs, expert consensus | AASM/NSF sleep durations; AAP 2022 safe sleep; sleep-training efficacy/safety RCTs | Health & safety claims. Cite by name. |
| **T2 — Moderate** | Cohort/longitudinal, large descriptive datasets | Mindell 2016 (156K sessions); Iglowstein 2003 reference values | "Typical" patterns. Cite + note variation. |
| **T3 — Heuristic** | Practitioner conventions | Wake-window charts; nap-transition ages; sample schedules | Adjustable defaults. Label as guidance, never rules. |

---

## The numbers, at a glance

### Tier 1 — 24-hour total sleep (cite these as the backbone)

| Age | Total sleep / 24h | Source |
|---|---|---|
| 0–3 months | 14–17 h | NSF 2015 |
| 4–12 months | 12–16 h | AASM 2016 (AAP-endorsed) |
| 1–2 years | 11–14 h | AASM 2016 |

*AASM issues **no** recommendation under 4 months (insufficient evidence, wide variation).*

### Tier 3 — Wake windows & naps (adjustable defaults; ranges, not targets)

| Age | Wake window | Typical # naps |
|---|---|---|
| 0–4 weeks | 30–60 min | 4–5+ |
| 4–12 weeks | 60–90 min | 4–5 |
| 3–4 months | 75–120 min | 3–4 |
| 5–7 months | 2–3 h | 3 → 2 |
| 7–10 months | 2.5–3.5 h | 2–3 |
| 11–14 months | 3–4 h | 2 |
| 14–24 months | 4–6 h | 2 → 1 |

*First window shortest, last window longest. Includes feeding. Preterm: use adjusted age.*

### Tier 3 — Nap transitions

| Transition | Typical age | Trigger to act |
|---|---|---|
| 4→3 | ~4–6 mo | Fighting the 4th nap |
| 3→2 | ~7–9 mo | Resisting the 3rd nap; handles 2.5–3.5 h windows |
| 2→1 | ~14–18 mo | Fights/skips a nap ≥4×/week for 1–2 weeks |

**Technique:** lengthen windows ~15 min at a time; don't drop a nap abruptly.

---

## Non-negotiable credibility rules

1. **Wake windows = guidance, not medical targets.** Use the numbers; label them Tier 3; show a range.
2. **Health/safety claims = Tier 1 only**, cited by name (AAP, AASM).
3. **Surface AAP 2022 safe sleep** persistently (back to sleep, firm flat surface, room-share ≥6 mo, no loose bedding, no bed-sharing). A sleep app that omits this isn't credible.
4. **Out-of-range values inform, never scold** — tie to normal-variation evidence (Iglowstein 2003). Matches the "reassure, don't grade" brand.
5. **Under ~6 months: cues over clock.** Don't imply newborns belong on rigid schedules.
6. **Preterm: adjusted age**, stated explicitly.
7. **The 4-month change is a permanent *progression*, not a passing regression.** Later "regressions" are developmental windows, not universal events.
8. **Night wakings are normal in year one.** Never imply a baby is "broken."

---

## Competitive picture (who to beat, and how)

**Leader:** Huckleberry (SweetSpot prediction, 5M+ families, Harvard pilot, named advisors). **Challenger:** Napper (cheaper, sleep-only, but *unnamed* experts). Trackers (Baby Tracker, Glow Baby, Nara) win on breadth/price but don't predict.

**Table-stakes (must-have):** fast sleep/feed/diaper logging · age-based wake-window guidance · multi-caregiver sync · trend charts · reminders · iOS+Android parity · freemium.

**Two structural openings this product is built to take:**

1. **The web app nobody has.** Every serious competitor is app-only. This product's state-in-URL, laptop-or-phone, shareable-plan shape *is* the differentiator. Own it.
2. **Transparency + disruption-awareness.** The two loudest competitor complaints are (a) black-box predictions and (b) predictions breaking during teething/illness/regressions. Cited, tiered methodology answers (a); an **"atypical day" flag** answers (b).

**Credibility bars to clear** (from competitors): named pediatric sleep advisor + certified consultant; a public **methodology page** with ranges + citations (this product's Tier badges already do this — the market's single biggest gap); prominent AAP safe-sleep; ideally a small pre/post outcomes study later.

---

## Priority feature shortlist (full backlog in file 04)

**P0 (core + credibility):** schedule generator · corrected-age adjustment · 24h-total check vs AASM/NSF · Tier badges + citations · "guidance not rule" framing · shareable URL · AAP safe-sleep panel · reassuring out-of-range copy.

**P1 (differentiators):** cues-vs-clock by age · first-shortest/last-longest logic · nap-transition detector · **"atypical day" disruption flag** · sleepy-cue reference · bedtime-timing guidance · public methodology page.

**P2 (later):** learn-from-logs personalization · regression/progression explainer · neutral sleep-training overview · twins/multiples.

---

## Where the science is genuinely uncertain (be honest in-app)

- **Exact wake-window minutes** — heuristic, sources disagree, no RCT.
- **Whether wake-window *systems* improve naps** — no controlled evidence; even proponents call them "one piece of the puzzle."
- **"Drowsy but awake"** — never tested in isolation; don't oversell it.
- **12/18/24-month "regressions"** — weakly supported as universal events.
- **Under-4-month sleep needs** — AASM declined to issue a number; expect wide variation.

Displaying this uncertainty, rather than hiding it, is what will make the app more trustworthy than the market leaders.

---

## Key sources (full lists in each file)

- [AASM 2016 Consensus (Paruthi), JCSM](https://jcsm.aasm.org/doi/full/10.5664/jcsm.5866)
- [NSF 2015 (Hirshkowitz), Sleep Health](https://www.sleephealthjournal.org/article/s2352-7218(15)00015-7/fulltext)
- [AAP 2022 Safe Sleep Policy, Pediatrics](https://publications.aap.org/pediatrics/article/150/1/e2022057990/188304/Sleep-Related-Infant-Deaths-Updated-2022)
- [HealthyChildren.org (AAP) — How Many Hours](https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx)
- [Mindell et al. 2016 — infant/toddler sleep patterns, PubMed 27252030](https://pubmed.ncbi.nlm.nih.gov/27252030/)
- [Iglowstein et al. 2003 — sleep duration reference values, Pediatrics](https://doi.org/10.1542/peds.111.2.302)
- [Price et al. 2012 — sleep-training 5-year follow-up, Pediatrics](https://publications.aap.org/pediatrics/article/130/4/643/30241/Five-Year-Follow-up-of-Harms-and-Benefits-of)
- [Dr. Craig Canapari (Yale) — Do Wake Windows Help?](https://drcraigcanapari.com/do-wake-windows-help-kids-nap-better/)
- [JMIR/PMC — Evidence-Based Behavioral Strategies in Children's Sleep Apps](https://pmc.ncbi.nlm.nih.gov/articles/PMC8931643/)
- [Huckleberry — SweetSpot](https://huckleberrycare.com/blog/sweetspot-your-smart-sleep-timing-companion)
- [Smart Sleep Coach by Pampers](https://www.smartsleepcoach.com/)
