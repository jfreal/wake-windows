---
title: 24-Hour Visual Day Breakdown
sidebar_label: Visual day
id: A02-24h-visual-day-breakdown
docKey: 24h-visual-day-breakdown
category: Scheduling & Prediction
priority: P0
status: Built
tags: [visualization, clock, timeline, dark-room, accessibility, mvp]
---

# 24-Hour Visual Day Breakdown

**Competitor verdict:** Table-stakes — a visual clock/timeline is expected; Napper's clock is loved, but its busy redesign was criticized, so calm and readable is the differentiator.

## Problem / user need
Parents parse a plan faster as a picture than as a list. They want an at-a-glance view of the whole day — wake blocks, naps, bedtime — that reads instantly, including at 3 a.m. in a dark nursery with one hand on a phone.

## What users actually say
Napper's circular "clock" view is genuinely loved, but users criticized a redesign that made it busy and harder to read. Separately, "daily totals at a glance" is a repeated request, and dark-room / one-hand UX is a confirmed, unmarketed gap (research 00; FEATURE-INDEX F08). The takeaway: keep it calm.

## Competitor comparison
Most schedulers show a list or a timeline; Napper's clock is the standout loved visual. No competitor markets a deliberately low-glare, dark-room-friendly rendering. That is the opening here.

## Our approach (spec)
- Render the generated plan (A01) as both a **24-hour circular clock** and a **linear timeline**; user picks the default.
- Sleep blocks and wake blocks visually distinct but low-contrast-friendly; naps show as ranges (bands), not razor-thin ticks — reinforcing "ranges, not a stopwatch."
- Persistent **daily totals** (total sleep, total wake, nap count) with a Tier 1 badge comparing to AASM/NSF ranges.
- **Dark-room mode:** dimmable, warm/low-blue palette, large tap targets, no bright white flashes; readable one-handed.
- Static SVG-style rendering — no animation, no clutter. Learn from Napper: calm beats busy.

## Scope — MVP
- Circular clock + linear timeline of one day's plan.
- Daily totals with Tier 1 range check.
- Dark-room dimming and high-legibility layout.

## Scope — later
- Overlay logged actuals vs. planned (once C01 tracking exists).
- Multi-day / week strip; twins overlay (A09).

## Edge cases & gotchas
- Days that cross midnight must render cleanly (avoid the "midnight bug" that plagues competitors).
- Very fragmented newborn days have many small blocks — group gracefully; don't produce visual noise.
- Never color-code as pass/fail; out-of-range totals inform, never scold.

## Evidence & citations
- Daily-total ranges: **Tier 1** — AASM 2016 (4–12 mo 12–16h; 1–2 yr 11–14h), NSF 2015 (0–3 mo 14–17h).
- Dark room / blackout for sleep: research 02 §4 (light leaks wake babies) supports a low-light rendering.

## Effort
Medium. SVG/canvas rendering over the A01 data model; theming for dark mode.

## Risks / open questions
- Balancing information density against the "keep it calm" lesson from Napper's redesign backlash.
- Accessibility contrast vs. low-glare dimming — needs testing at true low brightness.

## Success metric
Plan is legible at lowest brightness one-handed; users can state next nap and daily total within a couple of seconds of glancing.

## Related features
A01 (plan source), A05 (bedtime), A09 (twins overlay), C01 (actuals overlay), F08 (dark-room/one-hand UX), B01 (tier badges).
