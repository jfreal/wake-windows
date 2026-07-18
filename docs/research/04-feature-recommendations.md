# 04 — Feature Recommendations (Science × Competitors → App)

**Purpose:** Turn the research into a concrete, prioritized feature backlog, each item tied to (a) an evidence tier and (b) a competitive rationale.
**Reads with:** `PRODUCT.md` (the app already commits to cited, Tier-1/2-badged guidance, state-in-URL, one-hand-in-the-dark UX).

---

## Feature backlog

Priority: **P0** = table-stakes / core credibility · **P1** = strong differentiator · **P2** = later.

| # | Feature | Pri | Evidence tier | Why (science + competitor rationale) |
|---|---|---|---|---|
| 1 | Birthday → wake-window → nap-schedule generator (already core) | P0 | T3 defaults on T1/T2 backbone | The product's reason to exist. Competitors gate this behind a paywall (Huckleberry/Napper). |
| 2 | **Gestational-age (corrected-age) adjustment** | P0 | T1 | Preemie guidance requires adjusted age. Few competitors surface this; it's a trust signal for an anxious segment already named in PRODUCT.md. |
| 3 | **24h total-sleep check vs AASM/NSF ranges** | P0 | T1 | The defensible headline numbers. Show total sleep the plan produces vs the cited consensus range for the age. |
| 4 | **Tier badges + inline citations on every recommendation** | P0 | — | Already a design principle. This is the #1 under-served credibility lever in the market (see file 03). |
| 5 | **"Guidance, not medical rule" framing on wake windows** | P0 | honesty | Every charting source says windows are guidelines; published charts disagree. Say so plainly — it *builds* trust. |
| 6 | **Cues-vs-clock mode by age** (cues < ~6 mo, by-the-clock ≥ ~6 mo) | P1 | T1/T2 | Circadian rhythm matures ~5–6 mo (Mindell 2016). Scientifically honest and differentiating. |
| 7 | **First-window-shortest / last-window-longest** logic in the generator | P1 | T3 convention | Standard operational rule; makes the schedule feel "right" to experienced parents. |
| 8 | **Nap-transition detector & guidance (4→3→2→1)** | P1 | T3 | Detect the ≥4×/week-for-1–2-weeks pattern; suggest lengthening windows ~15 min at a time. Directly useful, rarely done transparently. |
| 9 | **"Atypical day" / disruption flag** (illness, teething, regression, travel) | P1 | — | The #1 complaint about Huckleberry & Napper is prediction failure during disruptions. Flagging "this looks like an off-day, don't over-adjust" beats the leaders. |
| 10 | Shareable plan via URL (already core) | P0 | — | State-in-URL = partner/caregiver sharing without accounts. No competitor does web sharing. |
| 11 | **Safe-sleep reference panel (AAP 2022)** | P0 | T1 | A credible sleep app must surface AAP safe-sleep. Non-negotiable; Pampers does, most don't. Keep it informational, not alarmist. |
| 12 | Sleepy-cue reference (early vs late/overtired vs undertired) | P1 | T3, clinically endorsed | Helps parents override the clock appropriately under 9 mo. |
| 13 | Bedtime-timing guidance (~7–8 PM; earlier on poor-nap days) | P1 | T1 (routine RCT) + T3 | Bedtime drives night-sleep length more than wake time (Mindell 2016). |
| 14 | Reassuring "normal variation" copy on out-of-range values | P0 | honesty | PRODUCT.md brand: "reassure, don't grade." Iglowstein 2003 shows huge normal variation — cite it. |
| 15 | Optional logging → personalized windows (learn from last N days) | P2 | T2 | The most scientifically defensible way to "do" wake windows (individual variation is large). This is Huckleberry's moat — but a lighter, transparent version. |
| 16 | Regression/progression explainer (4-mo = permanent progression) | P2 | T1/T2 | Frame the 4-month change honestly; de-mystify 8–10 mo (separation anxiety/motor). |
| 17 | Sleep-training methods overview (neutral, supportive) | P2 | T1 | Efficacy + no long-term harm is well-established; the cortisol-harm narrative rests on a weak study. Present inclusively. |
| 18 | Multi-caregiver / multi-baby (twins) support | P2 | — | Twins under-served (only Pampers does 4 profiles). |
| 19 | Methodology page (all ranges + sources in one place) | P1 | — | Transparency = the market's biggest credibility gap. Doubles as SEO/trust asset. |

---

## Guardrails the app should encode (credibility rules)

1. **Never present a wake-window number as a validated medical target.** It's a Tier-3 heuristic on a Tier-1 biological backbone. The generator can *use* the numbers; the copy must *label* them.
2. **Anchor health/safety claims only to Tier 1** (AAP 2022 safe sleep, AASM/NSF durations, RCTs). Cite by name.
3. **Show the disagreement.** When published charts differ, that's a feature — display a range, not a false-precision single number.
4. **Out-of-range = inform, never scold.** Tie to normal-variation evidence (Iglowstein 2003).
5. **Surface AAP safe-sleep** somewhere persistent — a sleep-scheduling app that ignores safe sleep is not credible.
6. **Under ~6 months: cues over clock.** Don't imply newborns should be on rigid schedules (AAP + consultants agree).
7. **Preterm: adjusted age**, stated explicitly.

---

## The two biggest structural bets (from file 03)

1. **Be the web app nobody else is.** Every serious competitor is app-only. Desktop + phone, shareable URL, no app-store cut. This is already the product's shape — lean into it as *the* positioning.
2. **Win on transparency + disruption-awareness.** Cited, tiered methodology + an "atypical day" flag directly targets the two loudest competitor complaints (black-box predictions, and predictions breaking during teething/illness/regressions).
