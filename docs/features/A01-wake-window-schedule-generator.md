---
title: Wake-Window Schedule Generator
sidebar_label: Schedule generator
id: A01-wake-window-schedule-generator
docKey: wake-window-schedule-generator
category: Scheduling & Prediction
priority: P0
status: Built
tags: [core, scheduling, wake-windows, no-account, mvp]
---

# Wake-Window Schedule Generator

**Competitor verdict:** Table-stakes — every serious scheduler predicts nap timing; our wedge is doing it free, in the browser, with no account and transparent, cited math.

## Problem / user need
A tired parent wants to know "when should the baby nap next?" without a subscription, a sign-up wall, or a black-box guess. They need a full day's plan in ten seconds from three inputs they already know: birthday, this morning's wake time, and the baby's age-typical window lengths.

## What users actually say
Reviews praise "accurate, self-learning nap prediction" and a "genuinely-free-with-no-tricks" experience (Nara is singled out for the latter). The loudest anxiety is the flip side: a "rigid schedule" or "countdown you can't meet" is stressful. So the plan must present as ranges, never a stopwatch, and never scold when the baby is off-book.

## Competitor comparison
Huckleberry (SweetSpot) and Napper both predict, but as app-only, account-gated, black-box outputs. None is a shareable web plan and none shows the arithmetic behind the prediction. That transparency plus the no-account web shape is the opening (research 00, "two structural openings").

## Our approach (spec)
Deterministic arithmetic, no model:
1. Compute age (adjusted if preterm — see A03).
2. Look up the age-band wake window range (Tier 3 table below).
3. Look up typical nap count for the band.
4. From wake time, lay out: window → nap → window → nap ... to bedtime.
5. Apply the convention **first window shortest, last window longest**, distributing the range across the day.
6. Each window **includes feeding time** (window counts crib-out to crib-in).
Show every step: "Wake 7:00 + first window 2h → nap ~9:00." Attach a Tier 3 badge + citation to the window numbers and a Tier 1 badge to the 24h-total sanity check (AASM 2016 / NSF 2015).

## Scope — MVP
- Three inputs (birthday, wake time, band-default windows) → full-day plan.
- Ranges shown (e.g. "9:00–9:30"), not single times.
- Editable window lengths with the default range visible.
- 24h-total check against AASM/NSF displayed as reassurance, not a grade.

## Scope — later
- Personalize windows from local logged history (A10).
- Nap-transition awareness (A06), atypical-day flag (A07), bedtime cap (A05).

## Edge cases & gotchas
- Under ~4 months / ~6 months: bias toward cues, not clock (see A04); label the schedule as loose.
- Very short or skipped naps shift the rest of the day — recompute from the actual crib-in time.
- Don't imply a missed window is a failure; out-of-range informs, never scolds.

## Evidence & citations
- Wake-window numbers: **Tier 3** heuristic; sources disagree (Taking Cara Babies, Huckleberry, Cleveland Clinic). Label as guidance.
- 24h totals: **Tier 1** — AASM 2016 (4–12 mo: 12–16h), NSF 2015 (0–3 mo: 14–17h).
- Conventions (first-shortest/last-longest, includes feeding, crib-out to crib-in): research 01 §2.

## Effort
Medium. Pure arithmetic + a citation/badge layer; no backend, no model.

## Risks / open questions
- Presenting heuristic numbers with authority they don't have — mitigated by the Tier 3 badge and honest "guidance, not a rule" copy.
- How prominently to nudge toward cues under 6 months without undercutting the tool's usefulness.

## Success metric
Time-to-first-plan under ~10 seconds; a plan generated without any account creation.

## Related features
A02 (visual day), A03 (corrected age), A04 (cues vs clock), A05 (bedtime cap), A06 (transitions), A07 (atypical day), A10 (personalization), B01 (tier badges), E01 (shareable URL).
