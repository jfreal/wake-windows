---
title: Bedtime Calculator + Preferred-Bedtime Cap
sidebar_label: Bedtime calculator
id: A05-bedtime-calculator
docKey: bedtime-calculator
category: Scheduling & Prediction
priority: P1
status: Built
tags: [bedtime, scheduling, differentiator, anti-anxiety, partial-gap]
---

# Bedtime Calculator + Preferred-Bedtime Cap

**Competitor verdict:** Partial gap — apps compute a bedtime but users beg to *cap* it, because predictors keep pushing bedtime toward ~9 p.m. after a rough nap day.

## Problem / user need
Bedtime should follow the last nap by the last (longest) wake window — but pure window math on a bad-nap day can spit out a late, unwanted bedtime (e.g. ~9 p.m.), which parents find unworkable and stressful. Parents want to set a preferred bedtime window and have the tool respect it, adjusting the day around it rather than marching past it.

## What users actually say
Parents explicitly ask to cap bedtime because apps keep suggesting a late one (FEATURE-INDEX A05). This is a recurring, concrete request — a partial gap the market hasn't cleanly solved.

## Competitor comparison
Schedulers derive bedtime from the last window but generally don't let the user pin a target bedtime and reflow the plan to hit it. Adding a user-set cap is the differentiator.

## Our approach (spec)
- **Base calc:** bedtime = last nap end + last wake window (longest of the day, per the first-shortest/last-longest convention).
- **Preferred-bedtime cap (opt-in):** user sets a target window, e.g. 6:45–7:30 p.m. The generator then:
  - On short/skipped-nap days, recommends an **earlier "bridge" bedtime** toward the cap to limit overtiredness (consultant guidance: earlier bedtime on poor-nap days).
  - If pure math overshoots the cap, surfaces options transparently: shorten/add a catnap, or accept a slightly-off window — shown as choices, never a scold.
- Anchor to the evidence that most babies on a stable 1–2 nap schedule do best ~7:00–8:00 p.m., and that later bedtime → shorter night (Mindell 2016). Show the citation with the recommendation.

## Scope — MVP (v1 differentiator)
- Bedtime derived from last nap + last window.
- Optional preferred-bedtime window with earlier-bedtime nudge on poor-nap days.

## Scope — later
- Auto-suggest a bridge bedtime during nap transitions (A06) and atypical days (A07).
- Learn a family's realistic bedtime from local history (A10).

## Edge cases & gotchas
- Don't let the cap force an absurdly long final window on a great-nap day — cap is a target, show the trade-off.
- Very late last nap can make the preferred cap unreachable; present the tension honestly rather than silently ignoring the cap.
- Under ~6 months, bedtime is looser (cues mode, A04) — soften the cap framing.

## Evidence & citations
- Bedtime ~7:00–8:00 p.m. on stable 1–2 nap schedules; earlier bedtime on poor-nap days: **Tier 2/3** — research 02 §3.
- Later bedtime → shorter night sleep; bedtime has greater influence than wake time: **Tier 2** — Mindell 2016 (research 01 §3).
- Last window longest: research 01 §2 convention.

## Effort
Low–Medium. Extends A01 math with a user constraint and branch logic.

## Risks / open questions
- UX for expressing "I hit the cap by trading off X" without inducing guilt.
- How aggressively to pull bedtime earlier on bad-nap days before it feels like over-correction.

## Success metric
Users can set a preferred bedtime and get a plan that respects it; late-bedtime complaints (the ~9 p.m. problem) drop.

## Related features
A01 (window math), A04 (cues under 6 mo), A06 (transition bridge bedtimes), A07 (atypical day), A10 (personalization), G03 (anti-anxiety framing).
