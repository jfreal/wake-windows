# 01 — The Science of Wake Windows & Infant Sleep Needs

**Scope:** Newborn to ~15 months.
**Purpose:** The evidence backbone for the app. Separates *well-established science* from *community heuristic* so every in-app claim can be tiered and cited honestly.
**Last researched:** July 2026.

---

## Evidence tiers used throughout

| Tier | Meaning | Use in app |
|---|---|---|
| **Tier 1 — Strong** | AAP/AASM policy, peer-reviewed RCTs, expert-consensus statements (RAND/UCLA methodology) | Health/safety claims, headline sleep-need numbers. Cite by name. |
| **Tier 2 — Moderate/observational** | Cohort & longitudinal studies, large descriptive datasets | Population averages, "typical" patterns. Cite, note variation. |
| **Tier 3 — Consultant heuristic** | Widely-used practitioner conventions (wake-window charts, sample schedules) | Adjustable defaults only. Label as guidance, never medical rules. |

---

## The honest headline (read this first)

1. **Total 24-hour sleep-duration recommendations are Tier 1** — consensus-backed by expert panels. They are given as *24-hour totals including naps*, as ranges, not nap-by-nap prescriptions.
2. **"Wake windows" as a specific numbered system is Tier 3 — a community/parenting heuristic, not a validated clinical protocol.** The *underlying biology* (homeostatic sleep pressure) is real and textbook; the *specific minute-by-age numbers* are not derived from or validated by peer-reviewed research.
3. **Published wake-window charts disagree with each other** — itself a sign they are heuristics, not measured constants.
4. A PubMed search for "wake windows" returns essentially nothing. Yale pediatric sleep physician **Dr. Craig Canapari**: *"This is not a concept that is taught, discussed, or researched in medical school or in the world of pediatric sleep medicine."*

**Design consequence:** Build the backbone on AASM/NSF totals (Tier 1). Ship wake windows as *flexible starting ranges* with an explicit "guidance, not medical rule" disclaimer. Personalizing to the baby's own logged data is the most scientifically defensible way to "do" wake windows.

---

## 1. Tier 1 — Consensus sleep-duration recommendations

### AASM 2016 Consensus (Paruthi et al.) — endorsed by the AAP

13-member panel, 864 articles reviewed, modified RAND Appropriateness Method. Endorsed by AAP, Sleep Research Society, AAST. Numbers are total sleep per 24h **including naps**.

| Age | Recommended total sleep / 24h |
|---|---|
| **< 4 months** | **No recommendation** — evidence insufficient, wide normal variation |
| 4–12 months | **12–16 hours** |
| 1–2 years | 11–14 hours |
| 3–5 years | 10–13 hours |

Sources: [AASM Consensus Statement, JCSM (Paruthi 2016)](https://jcsm.aasm.org/doi/full/10.5664/jcsm.5866) · [AASM Child Sleep Duration Health Advisory](https://aasm.org/advocacy/position-statements/child-sleep-duration-health-advisory/) · [PubMed 27707447](https://pubmed.ncbi.nlm.nih.gov/27707447/)

### National Sleep Foundation 2015 (Hirshkowitz et al.)

18-member panel, RAND/UCLA method. NSF **does** issue a newborn number (AASM does not).

| Age group | Recommended sleep / 24h |
|---|---|
| Newborns (0–3 months) | **14–17 hours** |
| Infants (4–11 months) | **12–15 hours** |
| Toddlers (1–2 years) | 11–14 hours |

Sources: [NSF recommendations, Sleep Health (Hirshkowitz 2015)](https://www.sleephealthjournal.org/article/s2352-7218(15)00015-7/fulltext) · [PubMed 29073412](https://pubmed.ncbi.nlm.nih.gov/29073412/)

### AAP / HealthyChildren.org practical framing

Newborns sleep ~16–17 h/day but only 1–2 h at a stretch; regular sleep cycles don't appear until ~6 months; infants 4–12 months should get 12–16 h including 2–3 daytime naps.

Sources: [HealthyChildren.org — How Many Hours](https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx) · [HealthyChildren.org Sleep hub](https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/default.aspx)

---

## 2. Tier 3 — Wake windows by age (the heuristic layer — sources disagree)

There is **no single official wake-window chart.** The most-cited published charts, side by side. All sources stress these are *ranges, not timers*, and lengthen with age.

| Age band | Taking Cara Babies | Huckleberry | Cleveland Clinic |
|---|---|---|---|
| 0–6 weeks | 30–60 min | 30–90 min | 0.5–1 hr |
| 6–12 weeks | 60–90 min | ~1–2 hr | 1–2 hr |
| 3–4 months | 75–120 min | 1–2 hr | 1.25–2.5 hr |
| 4–6 months | 2–3 hr (5–7 mo) | 1.5–2.5 hr | 2–4 hr (5–7 mo) |
| 6–9 months | 2–3.5 hr | 2–3.5 hr | 2.5–4.5 hr |
| 9–12 months | 2.5–4 hr | 2.5–4 hr | 3–6 hr |
| 12–15 months | 3–4 hr | 3–4 hr | 3–6 hr |

Sources: [Taking Cara Babies — Wake Windows](https://www.takingcarababies.com/blogs/sleep-basics/wake-windows-and-baby-sleep) · [Huckleberry — wake windows by age](https://huckleberrycare.com/blog/first-year-of-sleep-expectations) · [Cleveland Clinic — Wake Windows by Age](https://health.clevelandclinic.org/wake-windows-by-age)

**Operational conventions (important for the app's math):**
- A wake window is counted **from when the baby comes out of the crib to when they're placed back in.**
- The window **includes** feeding time.
- The **first** window of the day is usually the **shortest**; the **last** (before bedtime) is usually the **longest**.
- The 5–20 min it takes to fall asleep counts as rest, not wake time.
- For **preterm** babies, use **adjusted (corrected) age**.

---

## 3. Tier 1/2 — Total, night, and nap sleep + nap counts by age

Combining consensus totals (Tier 1) with descriptive data (Mindell 2016; Iglowstein 2003 — Tier 2) and consultant sample schedules (Tier 3). Splits are **averages**; individual variation is very wide.

| Age band | Total / 24h | Typical night | Typical nap total | Typical # naps |
|---|---|---|---|---|
| 0–6 weeks | ~14–17 h | Not consolidated; 1–2 h stretches; day/night often reversed | Spread across day | 4–5+ (irregular) |
| 6–12 weeks | ~15–16 h | Longer stretches emerge | Several naps | 4–5 |
| 3–4 months | ~14.5–15 h | Bedtime becomes earlier/regular | ~4–5 h | 3–4 |
| 4–6 months | ~14–15 h | ~10–11 h consolidating | ~3–4 h | 3 (→ dropping) |
| 6–9 months | ~14 h | ~10.5–11 h | ~2.5–3.5 h | 2–3 (3→2 transition) |
| 9–12 months | ~13–14 h | ~11 h | ~2–3 h | 2 |
| 12–15 months | ~13 h (AASM 1–2 yr: 11–14) | ~11 h | ~2–3 h | 2 (→ often 1 by 14–18 mo) |

**Key peer-reviewed nuances:**
- **Mindell 2016** (156,989 sleep sessions, 841 children, app-logged): sleep patterns only start to organize clearly at **5–6 months**. Morning wake time becomes remarkably stable from 5–36 months, while **bedtime varies more and has the greater influence on night-sleep length** (later bedtime → shorter night). Daytime naps consolidate *later* than night sleep.
- **Iglowstein 2003** (Pediatrics reference values): huge individual variation — at 6 months, daytime sleep ranged from ~2.5 h (25th pct) to ~4.5 h (75th pct). This variability is exactly why fixed wake-window numbers are hard to defend and why personalization wins.

Sources: [Mindell et al. 2016, PubMed 27252030](https://pubmed.ncbi.nlm.nih.gov/27252030/) · [Iglowstein et al. 2003, Pediatrics](https://doi.org/10.1542/peds.111.2.302) · [Huckleberry — first-year expectations](https://huckleberrycare.com/blog/first-year-of-sleep-expectations) · [Cleveland Clinic — Sleep in Your Baby's First Year](https://my.clevelandclinic.org/health/articles/14300-sleep-in-your-babys-first-year)

---

## 4. Where wake windows come from — biology vs. heuristic

### What IS well-supported (Tier 1 physiology)
Wake windows are a lay repackaging of the **homeostatic sleep drive** ("Process S," Borbély two-process model). Sleep pressure builds during wakefulness — mediated partly by **adenosine** accumulation — and dissipates during sleep. Sleep drive builds fast in infancy and more slowly with age, which is genuinely why babies nap 4–5×/day, toddlers 1×, and school-age children stop. Textbook physiology.

Sources: [Sleep physiology and disorders in childhood, Nat Sci Sleep 2011, PMC3630965](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3630965/) · [Adenosine & sleep regulation, PMID 21401496](https://pubmed.ncbi.nlm.nih.gov/21401496/)

### What is NOT well-supported (Tier 3 overlay)
- The **term is absent from medical/research literature** (Canapari; PubMed zero hits).
- The **specific age-based minute numbers "do not seem to be based on any scientific evidence"** (Canapari). Different sites publish different numbers.
- **No controlled evidence that wake-window *systems* improve naps.** Even wake-window-promoting sources concede this: Huckleberry calls them *"a helpful framework… only one piece of the puzzle."*
- The best *descriptive* datasets (Iglowstein 2003; Mindell 2016) give population averages but **do not test or validate a wake-window protocol.**

Sources: [Canapari — Do Wake Windows Help?](https://drcraigcanapari.com/do-wake-windows-help-kids-nap-better/) · [Romper — No Proof Wake Windows Work](https://www.romper.com/parenting/wake-windows-infant-sleep-evidence-based) · [Hey Sleepy Baby — Are wake windows evidence based?](https://heysleepybaby.com/hey-sleepy-baby-wake-windows/)

---

## 5. Melatonin & circadian development timeline (Tier 1/2)

| Stage | What's happening |
|---|---|
| Birth – ~6 weeks | Endogenous melatonin **minimal**; essentially **no functioning circadian rhythm**. Sleep driven by homeostatic pressure + hunger. Day–night reversal is normal. |
| ~6–9 weeks | Circadian rhythmicity begins to emerge; a melatonin rise at sunset appears. |
| ~8–12 weeks | Melatonin secretion increases and entrains to the light–dark cycle; day–night reversal usually resolves. |
| ~3–4 months | Circadian rhythm maturing; sleep cycles/architecture maturing (the "4-month" change). |
| ~5–6 months | Night sleep consolidates; internal clock plays a larger role — **"by-the-clock" scheduling becomes more feasible.** |

**Design consequence:** weight **cues over the clock before ~6 months**; offer a **by-the-clock mode after ~6 months**. Daytime light exposure + darkness for sleep help entrain the clock.

Sources: [Rivkees 2007, Development of Circadian Rhythms, PMC2713064](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2713064/) · [McGraw et al. 1999, SLEEP](https://academic.oup.com/sleep/article-pdf/22/3/303/13661327/sleep-22-3-303.pdf) · [Melatonin rhythmicity systematic review, Children (MDPI) 2024](https://www.mdpi.com/2227-9067/11/10/1197) · [Light exposure & newborn circadian rhythm, PMC6175794](https://pmc.ncbi.nlm.nih.gov/articles/PMC6175794/) · [HealthyChildren.org — Reversing Day-Night Reversal](https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/Reversing-Day-Night-Reversal.aspx)

---

## 6. Sleepy cues, over- & under-tiredness (Tier 3, clinically endorsed)

**Early ("catch it now") cues:** slowing/decreased activity, glazed/staring look, droopy eyelids, breaking eye contact, reduced responsiveness, red/pink eyebrow area, less interest in play. **Ideal window to start settling.**

**Late / overtired signs:** yawning and eye-rubbing (often *late*), fussiness → frantic crying, arching away, clinginess, hard to settle. Overtiredness triggers a **cortisol + adrenaline surge** → "wired," second wind, fragmented sleep, short catnaps.

**Undertired signs (window too short):** baby plays/babbles happily in the crib, takes only a short catnap, or resists — distinct from overtired resistance.

**Reliability note:** cues are most useful **under ~6–9 months**; older babies' cues become less reliable → shift toward age-appropriate schedules. Cleveland Clinic tip: note the *clock time* cues appear, then put baby down ~5 min *before* that mark next time.

Sources: [Taking Cara Babies — Newborn Sleepy Cues](https://www.takingcarababies.com/blogs/newborn/understanding-newborn-sleepy-cues) · [Cleveland Clinic — 15 Signs Your Baby Is Tired](https://health.clevelandclinic.org/how-can-i-tell-when-my-baby-is-tired) · [Pathways.org — Sleep Cues](https://pathways.org/sleep-cues-to-tell-if-baby-is-sleepy) · [Huckleberry — Overtired baby](https://huckleberrycare.com/blog/how-to-get-an-overtired-baby-to-sleep-signs-of-an-overtired-child) · [Healthline — Recognize an Overtired Baby](https://www.healthline.com/health/baby/how-to-recognize-an-overtired-baby)

---

## 7. Expert cautions about rigidly following wake windows

- **Guidelines, not rules** — every charting source says this explicitly.
- **Watch the baby, not the clock — especially under 9 months.**
- **Don't put newborns on rigid schedules** (AAP + Huckleberry).
- **Adjust gradually** — even 10–15 min matters; no drastic changes.
- **Expect disruption** from illness, travel, teething, growth spurts, milestones.
- **Preemie caution:** use adjusted age.
- **Skeptical clinical view (Canapari):** the systems are "overly complicated," hard to implement with tired parents, and lack evidence of benefit — *"any plan beats no plan,"* but fix bad night sleep first and rely on signs of sleepiness.

Sources: [Huckleberry](https://huckleberrycare.com/blog/first-year-of-sleep-expectations) · [Taking Cara Babies](https://www.takingcarababies.com/blogs/sleep-basics/wake-windows-and-baby-sleep) · [Canapari](https://drcraigcanapari.com/do-wake-windows-help-kids-nap-better/)

---

## Full source list — file 01

- [AASM Consensus Statement (Paruthi 2016), JCSM](https://jcsm.aasm.org/doi/full/10.5664/jcsm.5866)
- [AASM methodology paper, PubMed 27707447](https://pubmed.ncbi.nlm.nih.gov/27707447/)
- [AASM Child Sleep Duration Health Advisory](https://aasm.org/advocacy/position-statements/child-sleep-duration-health-advisory/)
- [NSF sleep duration recommendations (Hirshkowitz 2015), Sleep Health](https://www.sleephealthjournal.org/article/s2352-7218(15)00015-7/fulltext)
- [NSF recommendations, PubMed 29073412](https://pubmed.ncbi.nlm.nih.gov/29073412/)
- [HealthyChildren.org (AAP) — How Many Hours](https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx)
- [HealthyChildren.org (AAP) — Sleep hub](https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/default.aspx)
- [SleepFoundation.org — How Much Sleep Do Babies & Kids Need](https://www.sleepfoundation.org/children-and-sleep/how-much-sleep-do-kids-need)
- [Mindell et al. 2016, PubMed 27252030](https://pubmed.ncbi.nlm.nih.gov/27252030/)
- [Iglowstein et al. 2003, Pediatrics](https://doi.org/10.1542/peds.111.2.302)
- [Sleep physiology in childhood, PMC3630965](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3630965/)
- [Adenosine & sleep, PubMed 21401496](https://pubmed.ncbi.nlm.nih.gov/21401496/)
- [Henderson et al. 2011, consolidation of nocturnal sleep, PubMed 21051245](https://pubmed.ncbi.nlm.nih.gov/21051245/)
- [Rivkees 2007, PMC2713064](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2713064/)
- [McGraw et al. 1999, SLEEP](https://academic.oup.com/sleep/article-pdf/22/3/303/13661327/sleep-22-3-303.pdf)
- [Melatonin rhythmicity systematic review, Children (MDPI) 2024](https://www.mdpi.com/2227-9067/11/10/1197)
- [Light exposure & newborn circadian rhythm, PMC6175794](https://pmc.ncbi.nlm.nih.gov/articles/PMC6175794/)
- [HealthyChildren.org — Reversing Day-Night Reversal](https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/Reversing-Day-Night-Reversal.aspx)
- [Taking Cara Babies — Wake Windows](https://www.takingcarababies.com/blogs/sleep-basics/wake-windows-and-baby-sleep)
- [Taking Cara Babies — Newborn Sleepy Cues](https://www.takingcarababies.com/blogs/newborn/understanding-newborn-sleepy-cues)
- [Huckleberry — wake windows by age](https://huckleberrycare.com/blog/first-year-of-sleep-expectations)
- [Huckleberry — Decoding baby sleep cues](https://huckleberrycare.com/blog/decoding-baby-sleep-cues-nurturing-healthy-sleep-habits-from-the-start)
- [Huckleberry — Overtired baby](https://huckleberrycare.com/blog/how-to-get-an-overtired-baby-to-sleep-signs-of-an-overtired-child)
- [Cleveland Clinic — Wake Windows by Age](https://health.clevelandclinic.org/wake-windows-by-age)
- [Cleveland Clinic — 15 Signs Your Baby Is Tired](https://health.clevelandclinic.org/how-can-i-tell-when-my-baby-is-tired)
- [Cleveland Clinic — Sleep in Baby's First Year](https://my.clevelandclinic.org/health/articles/14300-sleep-in-your-babys-first-year)
- [Canapari — Do Wake Windows Help?](https://drcraigcanapari.com/do-wake-windows-help-kids-nap-better/)
- [Canapari — Harnessing Sleep Drive](https://drcraigcanapari.com/harnessing-sleep-drive-for-a-better-bedtime/)
- [Romper — No Proof Wake Windows Work](https://www.romper.com/parenting/wake-windows-infant-sleep-evidence-based)
- [Hey Sleepy Baby — Are wake windows evidence based?](https://heysleepybaby.com/hey-sleepy-baby-wake-windows/)
- [Pathways.org — Sleep Cues](https://pathways.org/sleep-cues-to-tell-if-baby-is-sleepy)
- [Healthline — Recognize an Overtired Baby](https://www.healthline.com/health/baby/how-to-recognize-an-overtired-baby)
