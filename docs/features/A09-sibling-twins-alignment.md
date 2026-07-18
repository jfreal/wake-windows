---
title: Sibling / Twins Schedule Alignment
sidebar_label: Sibling/twins alignment
id: A09-sibling-twins-alignment
docKey: sibling-twins-alignment
category: Scheduling & Prediction
priority: P1
status: Proposed
tags: [twins, siblings, multiples, overlap, scheduling, confirmed-gap]
---

# Sibling / Twins Schedule Alignment

**Competitor verdict:** Confirmed gap — many apps track multiple children; none align two schedules to engineer a shared quiet block.

## Problem / user need
A parent of twins or two close-in-age children does painful mental math every day to find a window where both are asleep at once — often the only break they get. No app helps. This one is **personally motivated: the builder is a twin parent,** and twin parents today fall back to spreadsheets to hand-calculate overlaps.

## What users actually say
The wishlist explicitly asks for "native twins support with which-baby/which-side." The briefs rank this the #2 differentiator: "clean white space; no one *aligns* two schedules."

## Competitor comparison
Smart Sleep Coach is the tell — up to 4 profiles with "individual schedules" and "parallel timers," i.e., tracked side-by-side, not coordinated. TwinTracker, Baby Daybook, and Nara all track each baby *separately*. Nobody computes or optimizes the overlap.

## Our approach (spec)
- Add **two (or more) children** to one plan.
- Generate each child's wake-window schedule, then **compute and highlight the overlapping nap window(s)** — the shared "quiet block."
- Offer an **"optimize for overlap"** toggle: within each child's acceptable, labeled Tier-3 wake-window range, nudge nap times to *maximize* the overlap — **never pushing outside the ranges**, and framing overlap as best-effort, not a target.
- Show a **dual-track 24h visual** (the existing breakdown, stacked) with the overlap band called out.
- Shareable via URL like any plan.

## Scope — MVP
Two children, stacked 24h view with the overlap band highlighted.

## Scope — later
"Optimize for overlap" as a fast-follow; 3+ children; per-child feeding/which-side tracking.

## Edge cases & gotchas
- Never sacrifice a child's appropriate schedule to force overlap — nudges stay inside labeled ranges.
- Different ages mean different nap counts; the overlap may be short or occasional — present honestly, no guilt if it's small.
- Local-only/no-account: two schedules still live in the URL/on-device.

## Evidence & citations
Tier 3 wake-window ranges per child (research files 00/02); the alignment approach and range guardrail are from file 05 Brief 2. Sources: Smart Sleep Coach (parallel timers), TwinTracker.

## Effort
Medium — the generator already exists; this is a second instance + an overlap calc + a stacked view.

## Risks / open questions
Niche demand (twins + close siblings). It's a loyalty/word-of-mouth hook, not a mass-acquisition driver — low downside since it reuses the core engine.

## Success metric
% of multi-child plans created; qualitative "this is the only app that does this" feedback.

## Related features
A01 (generator), A02 (24h visual), A08 (DST for both), E01 (shareable URL), C02 (which-side feeding).
