---
title: Anti-Anxiety Mechanics (Ranges, No Streaks)
sidebar_label: Anti-anxiety mechanics
id: G03-anti-anxiety-mechanics
docKey: anti-anxiety-mechanics
category: Brand & Product
priority: P0
status: Proposed
tags: [ux, ranges, non-judgmental, no-streaks, copy, mechanics]
---

# Anti-Anxiety Mechanics

**Competitor verdict:** Not a clean gap for the tagline (Napper owns "non-judgmental"), real opportunity in the mechanics — win on concrete UI, not a slogan.

## Problem / user need
Sleep apps quietly make tired parents feel like they're failing: a single "you missed the window" time, every night-waking tallied, streaks and badges, and blank tracker sections that read as "you're not doing enough." A worried parent must not be made to feel they're behind.

## What users actually say
Huckleberry draws repeated complaints that rigid SweetSpot times cause guilt/anxiety — parents describe "fighting" the clock. Smart Sleep Coach's gamified "You're now a sleep novice!" reinforcement is pressuring to some. "Empty-tracker guilt" (blank Tummy Time/milestone sections) is a documented landmine, as is "rigid-schedule anxiety" from a countdown you can't meet.

## Competitor comparison
Napper markets "a gentle, understanding friend who's there to help, not judge" — so the *positioning* is taken. But no competitor solves the pain in *execution*: they still show single target times, streaks, and always-visible empty trackers.

## Our approach (spec — the mechanics)
- **Ranges, not a single target time.** "Aim for roughly 9:15–9:45," never "9:23." This reduces the "I missed it" failure feeling and is more scientifically honest (Tier-3 windows are ranges anyway).
- **No streaks, no scores, no grades.** Nothing to break, nothing to lose.
- **Out-of-range informs, never scolds.** Reassuring, plain copy tied to normal-variation evidence (Iglowstein 2003) — "this is within normal variation," not "you're off track."
- **Hide unused trackers by default** to kill empty-tracker guilt; parents opt in to what they want to see.
- Reassuring copy on regressions/night wakings ("this is normal and expected"). Never imply a baby is "behind" or "broken."

## Scope — MVP
Range-based schedule display + non-judgmental out-of-range copy + no streak mechanics + hidden-by-default optional trackers. Encode these as design rules in the component library, not one-off screens.

## Scope — later
Reassurance micro-copy library for regressions; a "why ranges" explainer linked from any window.

## Edge cases & gotchas
- Ranges must still be actionable — too wide and they're useless; keep to the cited window.
- Out-of-range copy must never read as passive-aggressive; test tone with real tired parents.
- Don't accidentally reintroduce guilt via progress bars or completion percentages.

## Evidence & citations
[Napper — "help, not judge" (TechRadar)](https://www.techradar.com/computing/websites-apps/napper) · [Smart Sleep Coach — gamification](https://screensdesign.com/showcase/smart-sleep-coach-by-pamperstm) · Iglowstein 2003 (normal-variation sleep-duration reference; research file 00).

## Effort
Low — mostly copy and display choices.

## Risks / open questions
Don't lead marketing with "non-judgmental" (Napper owns it). Lead with the mechanic: "ranges, not a stopwatch." Let tone speak for itself.

## Success metric
Lower bounce on out-of-range results; positive review sentiment on "not stressful / didn't make me feel judged."

## Related features
A01/A02 (schedule + visual), B01 (tier badges), G01 (no-account), G04 (no-AI).
