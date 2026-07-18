---
title: Cues-vs-Clock Mode by Age
sidebar_label: Cues vs clock
id: A04-cues-vs-clock-mode
docKey: cues-vs-clock-mode
category: Scheduling & Prediction
priority: P1
status: Proposed
tags: [circadian, cues, differentiator, anti-anxiety, confirmed-gap]
---

# Cues-vs-Clock Mode by Age

**Competitor verdict:** Confirmed gap — nobody frames scheduling as cues-first under ~6 months and by-the-clock after; competitors put newborns on clock-driven predictions.

## Problem / user need
Under ~6 months a baby has little functioning circadian rhythm; sleep is driven by homeostatic pressure and hunger, so watching the baby beats watching the clock. Presenting a rigid timed schedule to a newborn parent is both scientifically wrong and a known anxiety trigger. The tool should lead with cues early and shift to clock-based scheduling as the circadian system matures.

## What users actually say
"Rigid-schedule anxiety" — a countdown you can't meet — is one of the most-hated dynamics (research 00). Framing early scheduling around the baby's signals directly answers that stress instead of amplifying it.

## Competitor comparison
Predictors surface a clock time from birth onward with no developmental framing. No competitor explicitly says "watch cues now, clock later," making this a clean positioning gap that also reinforces the anti-anxiety brand.

## Our approach (spec)
- Age-driven mode, keyed to corrected age (A03):
  - **Under ~6 months (esp. under ~4 months):** Cues mode is primary. Windows shown as loose ranges; UI foregrounds a sleepy-cues reference (B04) and "watch the baby, not the clock" copy.
  - **~6 months and up:** Clock mode becomes primary as the internal clock matures and morning wake stabilizes; the A01 plan takes the lead, cues remain a secondary check.
- Smooth handoff, not a hard switch: around 5–6 months present both, weighting cues.
- Tie the framing to a Tier 1/2 citation (circadian/melatonin maturation) so the mode change is transparent, not arbitrary.

## Scope — MVP (if pulled into MVP)
- Age-based default mode with a one-line rationale and citation.
- Cues-mode surfaces the sleepy-cues reference; clock-mode surfaces the A01 plan.

## Scope — later
- Let personalized history (A10) inform when a given baby is ready to lean clock-ward.
- User override to force a mode, with a gentle evidence note.

## Edge cases & gotchas
- Preterm babies: use corrected age for the threshold (A03).
- Don't hard-cut at exactly 6 months — maturation is gradual and individual (Iglowstein variation).
- Cues become less reliable after ~9 months; clock should clearly lead by then.

## Evidence & citations
- Circadian maturation / "by-the-clock feasible ~5–6 months": **Tier 1/2** — research 01 §5 (Rivkees 2007; McGraw 1999; melatonin review). Design consequence stated there: weight cues over clock before ~6 months.
- "Under ~6 months: cues over clock" — research 00 credibility rule 5.
- Mindell 2016 (**Tier 2**): patterns organize ~5–6 months; morning wake stabilizes — supports clock-mode onset.
- Cue reliability best under ~6–9 months: research 01 §6.

## Effort
Low–Medium. Mostly framing/branching logic over A01 plus links to B04.

## Risks / open questions
- Exact threshold and how visibly to nudge without making the tool feel less useful to newborn parents.
- Ensuring cues mode still gives something concrete, not just "watch your baby."

## Success metric
Under-6-month users see cues-first framing (not a rigid countdown); mode rationale is visible and cited.

## Related features
A01 (plan), A03 (corrected-age threshold), B04 (sleepy-cues reference), A10 (personalization), G03 (anti-anxiety mechanics).
