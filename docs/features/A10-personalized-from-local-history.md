---
title: Personalized Windows from Local History (optional)
sidebar_label: Local-history personalization
id: A10-personalized-from-local-history
docKey: personalized-from-local-history
category: Scheduling & Prediction
priority: P2
status: Proposed
tags: [personalization, on-device, no-account, no-ai, privacy, stats]
---

# Personalized Windows from Local History

**Competitor verdict:** Table-stakes for the leaders, but ours is no-account and no-AI — transparent arithmetic on the baby's own recent pattern, not a black-box model.

## Problem / user need
Generic age-based windows are a great starting point, but every baby varies. Parents who log a few days want the plan to reflect *their* child's actual pattern — without surrendering data to a cloud account or an opaque model they can't inspect.

## What users actually say
The most-loved feature across reviews is "accurate, self-learning nap prediction." But the same market is racing to add AI, and Napper even sends limited data to OpenAI/Anthropic. The wish is refinement *plus* privacy — which no leader offers together.

## Competitor comparison
Huckleberry's SweetSpot sharpens only after **~5 days** (meaningfully after 1–2 weeks) and requires an account; Robin needs ~14 days of logs. All the personalizing predictors are account-gated black boxes. We can refine from day one of logging, on-device, with math the user can see.

## Our approach (spec)
- **Optional, opt-in.** The age-based plan is complete without it (no cold-start dependency).
- Refine windows from the baby's **own last-N-days pattern** using **simple, inspectable statistics** (e.g., median/typical wake-to-sleep interval), computed **entirely on-device**. No account, no server, no ML model, no data training.
- **Show the work:** "Based on your last 7 days, your baby's mornings run ~10 min longer than the age default — nudged to match." Always adjustable, always reversible to the default.
- Stay within reason: personalization nudges the range, it doesn't invent a schedule. Keep the Tier-3 badge.
- **Exclude atypical days (A07)** so illness/teething/travel don't poison the baseline.

## Scope — MVP
On-device N-day median adjustment of wake windows with a plain-language "why we changed this" explainer and a one-tap reset.

## Scope — later
Nap-length-aware tuning; confidence indicator as more days accrue; feed into A06 transition detection.

## Edge cases & gotchas
- Too little data → don't personalize; say so, keep the age default.
- Outliers/atypical days must be excluded (A07).
- No-account means history is local; clearing data resets personalization (that's the privacy trade, stated plainly).

## Evidence & citations
Tier 3 (heuristic tuning of Tier-3 windows). Contrast anchor: Huckleberry SweetSpot ~5-day cold-start (research file 05 Brief 7). No-AI stance per master file principle 2 and G04.

## Effort
Low–Medium — local stats over logged sessions plus an explainer UI.

## Risks / open questions
How many days before nudging (avoid noise)? How to communicate that clearing local data resets learning without sounding like a downside?

## Success metric
Opt-in rate; retention of personalized vs. default users; "it matched my baby without an account" sentiment.

## Related features
C01 (sleep logging feeds it), A07 (excludes atypical days), A06 (transition detection), G01/G04 (no-account, no-AI), A01 (generator).
