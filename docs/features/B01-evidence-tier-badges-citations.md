---
title: Evidence Tier Badges & Inline Citations
sidebar_label: Tier badges & citations
id: B01-evidence-tier-badges-citations
docKey: evidence-tier-badges-citations
category: Guidance & Credibility
priority: P0
status: Built
tags: [credibility, citations, evidence-tiers, transparency, accessibility, differentiator]
---

# Evidence Tier Badges & Inline Citations

**Competitor verdict:** Confirmed gap — no competitor attaches a transparent evidence tier and named citation to each on-screen recommendation.

## Problem / user need
Parents are handed black-box predictions ("nap now") with no way to judge how solid the advice is. The two loudest competitor complaints are opaque predictions and advice that feels made-up. Meanwhile the honest reality is that total-sleep numbers are strong science while wake-window minute-charts are a heuristic that even proponents call "one piece of the puzzle" — and no competitor discloses that difference.

## What users actually say
Reviews praise apps that feel accurate but distrust "magic" predictions they can't verify; forum parents ask "where does this number even come from?" and swap conflicting wake-window charts. The methodology page is the market's single biggest credibility gap.

## Competitor comparison
Huckleberry cites named advisors and a Harvard pilot at the brand level but does not tier or cite individual in-app recommendations. Napper uses unnamed experts. Trackers (Baby Tracker, Glow, Nara) offer no sourcing. Nobody shows a per-recommendation badge + citation.

## Our approach (spec)
Every sleep recommendation renders a small **Tier badge** plus a one-tap citation:
- **T1 — Strong** (AAP/AASM policy, RCTs, consensus): health/safety and 24h totals.
- **T2 — Moderate** (cohort/descriptive, e.g. Mindell 2016, Iglowstein 2003): "typical" patterns.
- **T3 — Heuristic** (practitioner conventions): wake-window minutes, nap-transition ages.

Badges are **color-blind-safe**: distinct shape + text label, never color alone (e.g. filled shield = T1, half shield = T2, dotted outline = T3). Tapping a badge opens a citation card: plain-language claim, tier meaning, named source, and link to B02. Wake-window numbers always show the T3 badge and a "guidance, not a medical rule" line.

## Scope — MVP
Tier badge + citation card on: 24h total check, wake-window ranges, safe-sleep panel. Static tier/source mapping. Accessible (shape+text, screen-reader labels).

## Scope — later
Badges on troubleshooter answers (B05), regression explainer (B06), sleep-training overview (B07); user setting to show/hide inline badges.

## Edge cases & gotchas
- Don't badge-spam; one badge per recommendation block.
- Dark-room / one-hand UX: badges must be legible dimmed and tappable one-handed.
- T3 must never visually outrank T1 — keep hierarchy clear.

## Evidence & citations
Tier framework and numbers from research 00/01. T1: AASM 2016 (Paruthi), NSF 2015 (Hirshkowitz), AAP 2022 safe sleep. T2: Mindell 2016 (PubMed 27252030), Iglowstein 2003. T3: Taking Cara Babies / Huckleberry / Cleveland Clinic wake-window charts (which disagree — itself proof they are heuristics). Canapari: wake windows are "not taught, discussed, or researched in pediatric sleep medicine."

## Effort
Medium. Design system for badges + citation card; a maintained claim→tier→source table. No backend.

## Risks / open questions
Keeping the source table current; avoiding visual clutter; ensuring the "heuristic" label reassures rather than undermines confidence in the tool.

## Success metric
Share of recommendations carrying a badge (target 100%); citation-card open rate; qualitative trust signal in reviews ("finally an app that shows its sources").

## Related features
B02 (methodology page), B03 (safe sleep), A01/A04 (schedule & cues), G03/G04 (anti-anxiety, no-AI stance).
