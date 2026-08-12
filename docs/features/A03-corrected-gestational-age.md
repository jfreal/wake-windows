---
title: Corrected / Gestational-Age Adjustment
sidebar_label: Corrected age
id: A03-corrected-gestational-age
docKey: corrected-gestational-age
category: Scheduling & Prediction
priority: P0
status: Built
tags: [preterm, corrected-age, credibility, tier1, mvp]
---

# Corrected / Gestational-Age Adjustment

**Competitor verdict:** Partial gap — corrected age is mostly handled only inside preemie-specific apps; general schedulers rarely bake it into wake-window math.

## Problem / user need
Parents of preterm babies get scheduling advice that's wrong for their child because it uses chronological age. A baby born 6 weeks early is developmentally younger than the calendar says, so their wake windows, nap counts, and sleep needs track adjusted (corrected) age, not birth date.

## What users actually say
This audience is underserved by mainstream schedulers and pushed toward separate preemie apps. Handling it inline — and stating it explicitly — is both a credibility signal and an inclusivity win the market mostly skips.

## Competitor comparison
General predictors (Huckleberry, Napper) center full-term chronological age; corrected-age handling is typically siloed in dedicated preemie tools. A no-account web scheduler that asks one extra optional question closes the gap without a separate product.

## Our approach (spec)
- Optional input: "Was your baby born early?" → due date (or weeks premature).
- **Corrected age = chronological age − (40 weeks − gestational age at birth).**
- Feed corrected age into the A01 generator, the A02 totals check, and A04's cues-vs-clock threshold.
- State it plainly on-screen: "Using corrected age (X weeks) because baby was born Y weeks early." Never hide the adjustment.
- Standard guidance is to correct until ~2 years; expose that as the default with a note, since this app's scope runs to ~15–24 months anyway.
- Carry a Tier 1 badge: adjusted age for preterm infants is standard pediatric practice.

## Scope — MVP
- Due-date / weeks-early input, corrected-age computation, explicit on-screen statement, and propagation into A01 and the totals check.
- **The preemie note**, shown under the "Weeks in Womb" input whenever gestational age is 20–36 weeks: names the adjusted age the plan is using, says adjusted age is the standard starting point through about age two, and adds the nuance parents ask for (research 08 T14) — many preemies land somewhere between adjusted and actual age, and the baby outranks both numbers.

## Scope — later
- Fenton preterm growth percentiles if growth tracking (C06) ships.
- Taper/blend of correction as the child approaches 2 years.

## Edge cases & gotchas
- Correction can push a baby into a younger wake-window band than their birthday implies — expected; make the "why" visible.
- Late-preterm (34–36 wk) still merits correction; don't gate it to only very-early births.
- Once corrected age passes ~2 years, stop correcting; communicate the transition rather than silently switching.
- **A cleared "Weeks in Womb" field must not read as prematurity**, and it used to at both levels. An emptied `<input type="number">` hands back `''` (Vue's looseToNumber leaves a non-numeric string alone), and `''` behaves as 0 in arithmetic:
  - In the model, `40 - weeks` became 40 — forty weeks premature — so `monthsSinceBirth` knocked nine months off the plan mid-keystroke, silently swapping the age band, the guidance mode (A04), and the offered templates (A01). `usableGestationalWeeks` now reads a missing or non-numeric value as **no correction: 40**. Numeric but out-of-range values are left alone deliberately — the schedule warning already calls those out, and quietly clamping a typed number would hide the mistake instead.
  - In the panel, `weeks < 37` was true for `''`, so the note told a full-term parent their baby was born early. It is gated on a real gestational number (20 ≤ weeks < 37), matching the schedule warning's own 20–44 range.
  Covered by `ScheduleSetting.test.ts` (blank/whitespace/non-numeric/NaN all yield the uncorrected age) and `e2e/corrected-gestational-age.spec.ts`.
- The normalization is a module function, not a `private` getter: a private member makes `ScheduleSetting` fail to match the type `reactive()` produces for it, and every schedule in the app comes out of a `reactive()` call.

## Evidence & citations
- "Preterm: use adjusted (corrected) age" — **Tier 1** convention reinforced across research: research 00 credibility rule 6; research 01 §2 operational conventions; research 02 §10.

## Effort
Low. A date-difference calculation plus a clear label, wired into existing age lookups.

## Risks / open questions
- When exactly to stop correcting (common guidance is 2 years, sometimes 18 months) — pick a default and document it.
- Wording so parents don't read the adjustment as their baby being "behind."

## Success metric
Preterm users receive a plan matching corrected age, with the adjustment visibly explained, from a single optional input.

## Related features
A01 (schedule generator), A04 (cues-vs-clock threshold), A02 (totals check), C06 (growth percentiles), B01 (tier badges).
