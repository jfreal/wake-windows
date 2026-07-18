---
title: Trends & Daily Totals at a Glance
sidebar_label: Daily Totals
id: D01-trends-daily-totals
docKey: trends-daily-totals
category: Analytics & Insights
priority: P1
status: Proposed
tags: [analytics, trends, daily-totals, home-screen, charts, local-only]
---

# Trends & Daily Totals

**Competitor verdict:** Table-stakes — everyone charts trends, but parents beg for the day's totals surfaced *on the home screen* instead of buried two taps deep in a graphs tab.

## Problem / user need
An exhausted parent's most common question is simple: "How much has the baby slept and eaten today?" Most apps make you leave the logging screen, open an analytics tab, and read a chart to answer it. The number people actually want — total sleep hours, feed count/oz today — is treated as a report, not a glanceable fact.

## What users actually say
"Daily totals at a glance" is listed among the most-loved things done well and among the most-wished-for ("daily totals on the home screen"). The recurring gripe is that totals are "buried in graphs elsewhere."

## Competitor comparison
Trend charts are table-stakes; the leaders (Huckleberry, Napper) and trackers (Baby Tracker, Glow Baby, Nara) all chart history. The differentiator is placement and honesty, not the existence of charts. No competitor is called out for putting the running daily totals front-and-center on the primary screen.

## Our approach (spec)
- A persistent **Today** summary block on the home screen: total sleep (h:m), nap count, feed count, and total oz/mL — updating live from on-device logs.
- Numbers shown as **ranges/context vs. the age-appropriate AASM/NSF total-sleep band** (Tier 1), so the total is informative, never a grade.
- Below it, **simple 7/14-day trend sparklines** (sleep total, feeds) — transparent, plotted from the parent's own local data, no model.
- Everything computed on-device; no account, no server call.

## Scope — MVP
Today totals block (sleep h, nap count, feed count/oz) + a 7-day sleep-total sparkline. Tap-through to a fuller trends view.

## Scope — later
14/30-day windows, feed volume trend, weekday vs. weekend view, per-caregiver contribution breakdown, export hook into D02.

## Edge cases & gotchas
- **Midnight boundary:** define "today" clearly and let sleep spanning midnight split correctly (avoid the Napper "midnight bug").
- **Sparse data:** show honest partial totals; never blank-shame an empty day (empty-tracker guilt).
- **In-progress nap/feed:** count elapsed time toward the running total, labeled "so far."

## Evidence & citations
Total-sleep context bands: AASM 2016 (12–16 h at 4–12 mo) and NSF 2015 (14–17 h at 0–3 mo) — Tier 1. Wake-window/nap-count context is Tier 3, labeled as guidance.

## Effort
Low–Medium. Aggregation over local logs plus a lightweight sparkline; reuses the 24h-visual data layer.

## Risks / open questions
Requires C-series logging to exist to be useful. Risk of clutter — keep the block to four numbers max.

## Success metric
% of sessions where the Today block is viewed; reduced taps to reach totals; positive review mentions of "totals right there."

## Related features
D02 (report export), D03 (insights report card), C01/C02 (logging), A02 (24h visual).
