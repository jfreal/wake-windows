# 06 — External Guide Catalog: Wake Windows & Nap Schedules (2026 web sweep)

**What this is:** a catalog of every significant guide, medical page, and study on infant wake windows and nap schedules found in a fresh internet sweep (compiled 2026-08-12). All URLs were fetched and verified live at compile time unless marked otherwise. Companion to `01-wake-window-science.md` (deep science) and `09-app-coverage-gap-analysis.md` (what the app does with all this).

**Headline findings of the sweep:**

1. **No medical body publishes wake windows.** AAP, NHS, WHO, AASM, Mayo, and Nemours publish total-sleep hour bands only; AAP has never mentioned wake windows anywhere (page last updated Aug 2026). Every source publishing a full 0–24m window table sells something.
2. **Cleveland Clinic broke ranks (Apr 2024)** — first major medical institution to publish a wake-window table (MD-reviewed, no studies cited). Mainstream medicine is adopting consultant vocabulary, not consultant evidence.
3. **The consultant tables are copied, not converged.** Taking Cara Babies and Napper publish *identical* tables. Ranges at the same age differ up to 3× between vendors (7–10 months: TCB 2.5–3.5h vs Sleep Foundation 1.5–6h).
4. **As of 2025 there is still no objective wake-window dataset.** The newest scoping review (Gilchrist et al. 2025, Frontiers in Neuroscience — Happiest Baby–affiliated authors incl. Karp) covers 35 studies of 0–6m sleep and tracks *night-sleep* metrics only — daytime sleep, naps, and wake windows remain effectively unmeasured in the objective literature (verified 2026-08-12: the review does not address them directly).
5. **The concept's origin is traceable to a consultant, not a lab** — early-2000s sleep consultant Kylee Money (Romper investigation, Apr 2024).

This is all *good news for this product*: ranges-not-stopwatches with tier badges is the only honest way to present this material, and nobody else is doing it.

---

## Source catalog

### Medical / authoritative (publish hours, not windows)

| Source | URL | Key claims | Notes |
|---|---|---|---|
| AAP / HealthyChildren | healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx | Endorses AASM bands: 4–12m 12–16h incl. naps; 1–2y 11–14h. **Zero mention of wake windows.** | Updated Aug 2026. Already in citations.json (`aap-sleepneeds`). |
| AASM position statement | aasm.org/advocacy/position-statements/child-sleep-duration-health-advisory/ | Same bands. **No guidance under 4 months** — "insufficient evidence, wide normal variation." | Upstream of everyone. In citations.json (`paruthi-2016`). |
| NHS (Best Start in Life) | nhs.uk/best-start-in-life/baby/baby-basics/newborn-and-baby-sleeping-advice-for-parents/your-babys-sleep-patterns/ | Newborns ~8 up to ~18h/day (deliberately wide); 12–24m ~12–15h incl. naps. Normalizes irregularity; no windows, no nap counts. | Modified Mar 2026. (App's existing `nhs-2025` URL still resolves — verified 2026-08-12.) |
| WHO 2019 | who.int/news/item/24-04-2019-to-grow-up-healthy-children-need-to-sit-less-and-play-more | 0–3m 14–17h; 4–11m 12–16h; 1–2y 11–14h. | In citations.json (`who-2019`). |
| Mayo Clinic | mayoclinic.org/healthy-lifestyle/infant-and-toddler-health/in-depth/baby-naps/art-20047421 | Newborns re-sleep after 1–2h awake (their only awake-time figure). 4m–1y: ≥2 naps; morning nap dropped **10–12m** (earlier than consultants). 1y+: one 1–2h nap. | Dated May 2025. **Not yet in citations.json.** |
| Cleveland Clinic wake windows | health.clevelandclinic.org/wake-windows-by-age | 0–1m 0.5–1h; 1–3m 1–2h; 3–4m 1.25–2.5h; 5–7m 2–4h; 7–10m 2.5–4.5h; 10–12m 3–6h. MD-reviewed, no citations. | Apr 2024. In citations.json (`cleveland-wake-windows`). |
| Sleep Foundation (newborn windows) | sleepfoundation.org/baby-sleep/newborn-wake-windows | Widest ranges published anywhere: 7–10m 1.5–6h; 10–12m 3–7.5h. Frames windows as observational aid, not prescription. | Updated Jul 2025. In citations.json. |
| Nemours KidsHealth | kidshealth.org/en/parents/naps.html | 4–12m 12–16h, 2–3 naps; one nap **by 18m**; no windows. | Reviewed 2020. Not in citations.json. |

### Peer-reviewed (the actual evidence base)

| Study | URL | Finding | In citations.json? |
|---|---|---|---|
| Iglowstein 2003, *Pediatrics* | pubmed.ncbi.nlm.nih.gov/12563055/ | Percentile curves; IQR 2.5h at 6m — huge normal variability. 96.4% napping at 1.5y → 35.4% at 4y. | ✅ |
| Galland 2012, *Sleep Med Rev* | doi.org/10.1016/j.smrv.2011.06.001 | 34 studies, ~67k subjects. Naps/day: 0–5m mean 3.1 (1.2–5.0); 6–11m 2.2; 1–2y 1.2. Best normative nap data. | ✅ |
| Paruthi 2016 AASM consensus | jcsm.aasm.org/doi/10.5664/jcsm.5866 | The hour bands; <4m explicitly excluded. | ✅ |
| Mindell 2010 cross-cultural, *Sleep Medicine* | socsci3.tau.ac.il/clinic/articles/Mindell%202010%20cross-cultural%20infant%20sleep.pdf (verified mirror) | n=29,287, 17 countries. Bedtimes vary ~3h by culture but "minimal differences for daytime sleep" — **naps look biological, bedtimes cultural.** | ❌ **add** |
| Horváth & Plunkett 2018, *Nat Sci Sleep* | dovepress.com/spotlight-on-daytime-napping-during-early-childhood-peer-reviewed-fulltext-article-NSS | Naps developmentally necessary (memory/word learning); duration ~3.5h at 1m → ~1h at 2y. | ❌ **add** |
| Gilchrist, Aylward, Laine & Karp 2025, *Front Neurosci* | frontiersin.org/journals/neuroscience/articles/10.3389/fnins.2025.1581325/full | 35-study scoping review of 0–6m sleep maturation; tracks night-sleep metrics only — **daytime sleep/wake windows remain unmeasured** in the objective literature. | ❌ **add** |
| Reynaud et al. 2025/2026, *BMC Public Health* | link.springer.com/article/10.1186/s12889-025-26063-z | Actigraphy, **preschoolers ages 2–5** (adjacent-age evidence for a 0–24m app): 1h more nap → only ~13.6 min less night sleep, effects "clinically marginal"; **nap end-time matters more than duration.** Softens hard nap-capping doctrine. | ❌ **add** |
| "Optimizing infant and toddler sleep," *Semin Pediatr Neurol*, late 2025 | pubmed.ncbi.nlm.nih.gov/41339164/ | Current clinical review on sleep consolidation. **Found but not retrievable this sweep (CAPTCHA/robots) — pull manually.** | ❌ flag |

### Expert / consultant guides (what parents actually read)

| Source | URL(s) | Windows published | Stance |
|---|---|---|---|
| Huckleberry | huckleberrycare.com/blog/first-year-of-sleep-expectations · /baby-sleep-schedule-by-age-nap-and-sleep-chart · /wake-windows-vs-by-the-clock-schedules-which-is-right-for-my-child | 0–2m 30–90min → 10–12m 3–4h → 22–24m up to 6h | MD-reviewed. **Mar 2026 walk-back:** windows before ~6m, clock-based after (circadian dominance). Matches the app's cues-vs-clock model. |
| Taking Cara Babies | takingcarababies.com/blogs/sleep-basics/wake-windows-and-baby-sleep · /blogs/sleep-schedules/nap-schedules-5-months-to-24-months | 0–4w 30–60min → 14–24m 4–6h | RN. Largest audience. Table **identical to Napper's.** |
| Napper | napper.app/en/blog/baby-sleep/wake-windows-by-age/ | Identical to TCB | "A tool, not a goal." |
| Precious Little Sleep | preciouslittlesleep.com/are-you-keeping-baby-awake-too-long/ · /baby-drop-naps/ | 0–6w 45–60min → 9–12m ~3h | Hard-line overtiredness doctrine ("the #1 baby sleep mistake"). |
| Little Ones | littleones.co/blogs/our-blog/baby-sleep-schedule · /the-importance-of-awake-windows | Notably **shorter**: 5m max 2–2.5h | "Cues AND clock." Reddit reputation is poor (see 08). |
| Happiest Baby (Karp) | happiestbaby.com/blogs/baby/wake-windows | NB 45–60min → 15–24m 4–6h | No citations; cortisol rationale. |
| Pampers / Smart Sleep Coach | pampers.com/en-us/baby/sleep/article/why-wake-windows-are-more-important-than-the-clock | 0–4w "10min–2h" (unusually honest scatter) | Cues over clock. |
| Baby Sleep Site | babysleepsite.com/naps/baby-naps-chart-how-many-how-long/ | 0–11w 30min–1h → 18m–3y 5–6h | Warns against 2→1 before 15–18m. |
| Baby Sleep Science (Flynn-Evans, PhD — NASA fatigue researcher) | babysleepscience.com/single-post/the-science-behind-wake-windows-and-why-they-don-t-matter-as-much-as-you-think | n/a — critique | Two-process-model critique (Feb 2025): windows model only *acute* pressure; rigid use causes split nights, early waking, "orthosomnia." Already in citations.json (`flynnevans-critique`). |
| Dr. Craig Canapari (Yale) | drcraigcanapari.com/wake-windows | Reprints a table while disputing its basis | "Zero PubMed hits for the term." In citations.json (`canapari-critique`). |
| ParentData (Emily Oster) | parentdata.org/babies/are-newborn-wake-windows-real/ | n/a | "No data that speaks to this choice." Updated Oct 2025. ❌ **add** |
| Hey Sleepy Baby | heysleepybaby.com/hey-sleepy-baby-wake-windows/ | n/a | "Essentially made up"; fine as optional starting guide. |
| Possums / NDC (Dr. Pamela Douglas) | possums.org/science · program eval: *Sleep Health* 2019 (sciencedirect.com/science/article/abs/pii/S2352721818301372) | n/a — **rejects windows entirely** | "Routines are therefore useless…" Cued care + circadian anchors. The strongest counter-position; worth citing for balance. ❌ **add** |
| La Leche League USA | lllusa.org/why-breastfed-babies-wake-during-the-night/ | n/a | Night waking biologically normal; anti-clock. |
| Romper (journalism) | romper.com/parenting/wake-windows-infant-sleep-evidence-based | n/a | Apr 2024 investigation; origin traced to consultant Kylee Money. ❌ **add** |

---

## Wake-window ranges: cross-source comparison

"—" = source publishes nothing for that band. Native age bands in parentheses where they straddle.

| Source | 0–3m | 3–6m | 6–9m | 9–12m | 12–18m | 18–24m |
|---|---|---|---|---|---|---|
| Huckleberry | 30–90min (0–2m); 1–2h (3m) | 1.5–2.5h (4–5m); 2–3h (6m) | 2.5–3.5h | 3–4h | ~3.25–5h | up to 5.25–6h |
| Cleveland Clinic | 0.5–1h; 1–2h | 1.25–2.5h; 2–4h (5–7m) | 2–4.5h | 2.5–6h | — | — |
| Sleep Foundation | 0.5–1.5h; 1–3h | 1–3h; 1.5–4.5h (5–7m) | 1.5–6h (7–10m) | 3–7.5h | — | — |
| Taking Cara Babies / Napper | 30–60min; 60–90min | 75–120min; 2–3h (5–7m) | 2.5–3.5h | 3–4h | 3–4h → 4–6h | 4–6h |
| Precious Little Sleep | 45–60min; 1–1.75h | ~2h | 2–3h | ~3h | (3–4h implied) | — |
| Baby Sleep Site | 30min–1h; ~1–2h | ~2h (5–6m) | 2–3h | 3–4h | 3–5h | 5–6h |
| Happiest Baby | 45–60min; 1–2h | 75min–2.5h; 2–4h | 2.5–4.5h | 3–5h | 3–5h → 4–6h | 4–6h |
| Pampers | 10min–2h; 45min–2h | 1.5–3h | 2.25–3.5h | 3–4h | 4–6h | 4–6h |
| Little Ones | ~1h → ~2h | 2–2.5h | 2–3.5h | 3–4h | 3–4h+ | (5h+ implied) |
| AAP / NHS / WHO / AASM / Mayo / Nemours | *no wake windows published at any age* | | | | | |

**Spread at 7–10m: 1.5–6h across sources — a 4.5-hour disagreement.** The app's range-based UI should make this spread visible rather than pick a winner.

## Nap-transition guidance comparison

| Source | 4→3 | 3→2 | 2→1 | 1→0 |
|---|---|---|---|---|
| Huckleberry | ~4–5m | ~8–9m | 14–18m | beyond 24m |
| Taking Cara Babies | (implied ~5m) | 6.5–8m | 13–18m | 2–4y |
| Precious Little Sleep | 3–6m | 6–12m | 12–18m, rarely <1y | 3–5y |
| Little Ones | ~3m | 6–8m | 12–18m (most ~14–15m) | — |
| Baby Sleep Site | ~5–6m | ~8–9m | 15–18m ("don't rush at 12m") | 2.5–3.5y |
| Mayo Clinic | — | 3rd nap optional | **10–12m** (earlier than consultants) | by ~5y |
| Nemours | — | — | by 18m | 3–5y |
| Galland 2012 (data) | mean 3.1 naps 0–5m | mean 2.2 naps 6–11m | mean 1.2 naps 1–2y | — |
| Iglowstein 2003 (data) | — | — | — | 96% nap at 18m → 35% at 4y |

Note the medical-vs-consultant conflict on 2→1: Mayo says the morning nap commonly drops at 10–12m; consultants say 13–18m. The app's transition detector should acknowledge both (Tier badges do this well).

## Points of disagreement / evidence critiques (summary)

- Existence of evidence: consultants and (now) Cleveland Clinic publish tables; Canapari, Oster, Flynn-Evans, Hey Sleepy Baby, Romper, and the 2025 Frontiers review all confirm no direct evidence for specific numbers.
- Range width: up to 3× disagreement at the same age (see table).
- Overtiredness doctrine (PLS/TCB) vs. two-process-model critique (Flynn-Evans) + Reynaud 2025 (nap timing > duration; naps barely trade against night sleep — preschool-age data, apply with care under 24m).
- Windows-vs-clock: even Huckleberry now says clock after ~6m; the app's `GuidanceMode` age-based blend matches the strongest current position.
- Total-sleep "needs" stated by consultants sit above population means (Galland, Iglowstein) whose variance is so large that single targets misclassify many normal babies — AASM formalized this by refusing to set <4m numbers.
- Wholesale rejection: Possums/NDC and LLL reject scheduling entirely; Mindell 2010 offers the nuance (daytime sleep biological, bedtimes cultural).
- Conflict-of-interest gradient: full-table publishers all sell something; no-stake medical bodies publish no tables.

## New since 2024 (chronological)

1. Cleveland Clinic wake-window table (Apr 2024) — mainstream-medical adoption of the vocabulary.
2. Romper investigation (Apr 2024) — origin story; Canapari/Vyas quotes.
3. ParentData verdict maintained (updated Oct 2025).
4. Baby Sleep Science two-process critique + "orthosomnia" framing (Feb 2025).
5. Gilchrist/Karp scoping review (Apr 2025) — objective literature still measures night sleep only; wake windows remain unstudied.
6. Reynaud actigraphy study (2025/2026, preschoolers 2–5) — nap end-time > duration; night-sleep cost of naps clinically marginal.
7. *Seminars in Pediatric Neurology* review (late 2025, PMID 41339164) — flagged for manual retrieval.
8. No new AAP guidance; NHS unchanged (Mar 2026); consultant ecosystem actively refreshing tables 2025–2026; Huckleberry's Mar 2026 windows-vs-clock piece is a subtle walk-back.
9. Douglas/NDC interview (Dec 2025) — current rejectionist articulation: mybabymoonibclc.com/en/post/baby-sleep-interview-with-dr-pamela-douglas-on-the-ndc-possum-approach

## Recommended citations.json additions

`mindell-2010-crosscultural`, `horvath-plunkett-2018`, `gilchrist-2025-frontiers`, `reynaud-2025-bmc`, `oster-parentdata-2024`, `possums-2019-sleephealth` (+ optional `romper-2024` as journalism, T3), and a manual pull of PMID 41339164. All URLs above verified live 2026-08-12 except the two marked robots-blocked (use DOI landing pages).
