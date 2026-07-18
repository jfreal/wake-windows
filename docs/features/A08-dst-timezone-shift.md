---
title: Daylight Saving & Time-Zone Shift Tool
sidebar_label: DST & travel shift
id: A08-dst-timezone-shift
docKey: dst-timezone-shift
category: Scheduling & Prediction
priority: P1
status: Proposed
tags: [dst, travel, timezone, scheduling, transition]
---

# Daylight Saving & Time-Zone Shift Tool

**Competitor verdict:** Partial — missing from every wake-window *scheduler*; only Hatch (light/sound hardware) automates it. No scheduler does.

## Problem / user need
DST wrecks a hard-won schedule twice a year, and every trip across time zones does the same. Parents get generic blog advice ("put down 15 minutes earlier") but no tool that recalculates the plan and walks them through the shift day by day.

## What users actually say
The feature briefs flag this as "an easy win; missing from every scheduler." The pain is well documented; the fix is simple date math, but nobody in the category has built it.

## Competitor comparison
Wake-window schedulers offer only manual nudges or articles (e.g., Smart Sleep Coach's DST blog post). **Hatch** automates it with a "Daylight Savings Assistant" that shifts 15 min/day — but that's hardware, not a scheduler. So this is a real gap *in our category*, not an industry first.

## Our approach (spec)
- A **"Shift my schedule"** action with two modes: **DST** (spring-forward / fall-back presets) and **Travel** (pick a new time zone).
- Generate a **gradual transition plan** — auto-shift nap, bedtime, and wake times **~15 min/day over 3–5 days** (the standard consultant approach) — rendered day by day on the existing 24h visual.
- Shareable via URL so both caregivers follow the identical step plan.
- Keep everything in labeled ranges, not exact clock targets; carry the Tier-3 badge.

## Scope — MVP
DST spring + fall presets producing a 4-day, ~15-min/day step plan on the 24h visual.

## Scope — later
Travel mode with time-zone picker; auto-detect a time-zone change and offer the tool; choose shift direction/length for large jumps.

## Edge cases & gotchas
- Large time-zone jumps may need more than 5 days — let the user extend the ramp.
- Don't over-engineer for newborns (cues over clock under ~6 months).
- Respect the preferred-bedtime cap (A05) so the shifted plan doesn't drift too late.

## Evidence & citations
Tier 3 (consultant convention: ~15 min/day gradual shift), research file 05 Brief 5. Do not claim novelty — Hatch exists. The honest claim is "the first *scheduler* to do it, free, no account."

## Effort
Low — date math over the existing schedule plus a stepped-day renderer.

## Risks / open questions
Marketing must avoid overclaiming past Hatch. How to present the fall-back (gaining an hour) vs. spring-forward asymmetry clearly?

## Success metric
Tool use clustered around DST dates and detected time-zone changes; shares of the shift plan.

## Related features
A01 (generator), A02 (24h visual), A05 (bedtime cap), E01 (shareable URL).
