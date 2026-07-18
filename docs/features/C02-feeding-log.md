---
title: Feeding Log
sidebar_label: Feeding log
id: C02-feeding-log
docKey: feeding-log
category: Tracking & Logging
priority: P1
status: Proposed
tags: [tracking, feeding, nursing, bottle, which-side, timer]
---

# Feeding Log

**Competitor verdict:** Table-stakes with a top delighter inside it — "which side did I nurse last" is praised everywhere and cheap to nail.

## Problem / user need
Nursing parents need to time each side, remember which breast to start on next, and track bottle amounts — while holding a feeding baby, often at 3am. Bottle-feeders need quick ounce/ml entry. The recall burden ("was it left or right last time?") is real and universally felt.

## What users actually say
"Which side did I nurse last" appears explicitly in the most-loved list and is a top delighter across apps. Fast one-hand/one-tap logging is repeatedly praised. Twins parents specifically wish for "which-baby/which-side" support in a native way.

## Competitor comparison
Most trackers offer nursing timers and a last-side indicator; Baby Tracker and Glow Baby are known for feeding logs. The feature is common but the **execution** (one-handed timers, a glanceable last-side prompt, editability) varies. No web/no-account competitor does it.

## Our approach (spec)
A nursing session has an **L** and **R** timer; tap a side to start, tap to pause/switch, tap to stop. The app stores which side ended last and surfaces a prominent **"Start on: R"** prompt at the next feed (derived, always overridable). Bottle entries capture amount (oz/ml, unit remembered) plus optional breastmilk/formula. **Keep-screen-awake** is offered while a nursing timer runs so the screen doesn't dim mid-feed. All entries editable and backdatable. Local-only.

## Scope — MVP
- Per-side L/R nursing timers; pause/switch/stop.
- "Which side last" + "start on next" prompt.
- Bottle amount with unit; type (breastmilk/formula).
- Editable/backdatable; live daily feed total/count.

## Scope — later
- Twins: which-baby selector on the same screen.
- Per-side duration stats; average feed length.
- Solids handoff to C05 while a feed timer runs.

## Edge cases & gotchas
- **Midnight bug (MUST fix):** a 2am feed backdates cleanly to the correct day.
- **Background death:** timers are timestamp-based, so a backgrounded/closed app keeps correct elapsed time.
- **Keep-screen-awake:** enabled during an active nursing timer (a documented gap parents want).
- **One-tap:** starting a side is a single tap; no side-selection modal.
- Falling asleep on the breast: a long-running feed prompts "still feeding?" without deleting.
- Both sides in one session tracked; last-side = last one stopped.

## Evidence & citations
Feedback synthesis in `features/FEATURE-INDEX.md` (most-loved: "which side did I nurse last"; twins wish). No competitor facts invented beyond documented common features.

## Effort
Medium. Two coupled timers + last-side state + bottle entry. UI polish (one hand, big targets) is the real work.

## Related features
C01 (Sleep logging, shared timer engine), C03 (Pumping), C05 (Solids/meds), F08 (Dark-room UX), A09 (Twins).

## Success metric
Feed logged in ≤2 taps; last-side prompt shown at ≥95% of nursing sessions; screen stays awake through full feeds.

## Risks / open questions
How to present twins which-baby without adding taps for single-baby users (hide by default). Whether to estimate volume from nursing time (no — avoid false precision).
