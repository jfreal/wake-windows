---
title: Nap-Transition Detector & Guidance (4→3→2→1)
sidebar_label: Nap-transition detector
id: A06-nap-transition-detector
docKey: nap-transition-detector
category: Scheduling & Prediction
priority: P1
status: Built
tags: [naps, transitions, scheduling, tier-3, heuristic]
---

# Nap-Transition Detector & Guidance

**Competitor verdict:** Partial — schedulers publish transition *blog articles*, but none watch for the readiness signals and adjust the plan for you.

## Problem / user need
Dropping a nap is one of the most confusing moments in a baby's first two years. Parents can't tell a real transition from a passing bad patch, so they either drop too early (overtired) or hold on too long (nap resistance, split nights, early waking). They want the tool to say "these signs suggest your baby may be ready to move from 3 naps to 2 — here's how to do it gently."

## What users actually say
Users want prediction that "self-learns" and interprets what's happening, not just static charts. The feedback wishlist calls out a "report card" that *interprets* the data rather than dumping numbers.

## Competitor comparison
Huckleberry, Taking Cara Babies, and Little Ones all publish good transition guides, but as articles — the parent must self-diagnose. No wake-window scheduler detects readiness from the child's own pattern and nudges the schedule accordingly.

## Our approach (spec)
- Track readiness signals against the Tier-3 transition table: **4→3** (~4–6 mo, fighting the 4th nap), **3→2** (~7–9 mo, resisting the 3rd nap, handles 2.5–3.5 h windows), **2→1** (~14–18 mo, fights/skips a nap **≥4×/week for 1–2 weeks**).
- When signals cluster (nap resistance + short/skipped naps + early waking + split nights, together and age-appropriate), surface a gentle, dismissible prompt: "This looks like it could be a transition."
- Guidance uses the standard technique: **lengthen wake windows ~15 min at a time**, don't drop a nap abruptly. For 2→1, shift the morning nap ~15 min later every few days toward ~5 h after wake / no earlier than ~11:00 AM.
- Everything carries a **Tier 3 badge**: this is practitioner convention, not validated medicine; label as guidance, offer, never command.

## Scope — MVP
Detect the three transitions from logged or self-reported signals; show the ~15-min lengthening plan on the 24h visual; Tier-3 badge + citation.

## Scope — later
Alternating-schedule support (children commonly flip between old and new for weeks); "bridge" early-bedtime suggestion during the 2→1 switch.

## Edge cases & gotchas
- Distinguish a real transition from a temporary regression — require the signal cluster, not one bad nap.
- Under ~6 months, stay cues-over-clock; never push a rigid schedule.
- No-account/local-only: detection runs on-device from local history or manual toggles.

## Evidence & citations
Tier 3, broadly consistent across consultants. Transition ages and the ≥4×/week-for-1–2-weeks trigger and the ~15-min technique are from research file 02 §1. Sources: Huckleberry nap transitions, Taking Cara Babies 2-to-1, Little Ones.

## Effort
Medium — reuses the generator; adds a signal-detection rule set and a lengthening plan renderer.

## Risks / open questions
Over-flagging erodes trust; keep the prompt conservative and dismissible. How much local history is needed before detection is reliable?

## Success metric
Prompt shown → accepted rate; qualitative "it caught the transition before I did."

## Related features
A01 (generator), A02 (24h visual), A07 (atypical-day flag — suppress detection during disruptions), A10 (local-history personalization), B06 (regression explainer).
