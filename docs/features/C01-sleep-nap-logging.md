---
title: Sleep & Nap Logging
sidebar_label: Sleep logging
id: C01-sleep-nap-logging
docKey: sleep-nap-logging
category: Tracking & Logging
priority: P1
status: Proposed
tags: [tracking, sleep, naps, timer, offline, editable]
---

# Sleep & Nap Logging

**Competitor verdict:** Table-stakes — everyone logs sleep, but the leaders keep shipping the same failures (midnight bug, background-timer death, clumsy edits). Winning here is about not breaking.

## Problem / user need
Parents log naps and night sleep to see totals, spot patterns, and feed the wake-window schedule. They do it exhausted, one-handed, often in the dark. The logging must survive real life: the app getting backgrounded, a timer left running overnight, a nap remembered an hour later.

## What users actually say
"Fast one-hand/one-tap logging" and "daily totals at a glance" are among the most-loved features. The most-cited flaw of a market leader is the **midnight bug** — you can't backdate an entry logged after 12:00am. Another leader's **background timer stops** when you leave the app. Users beg for **editable/backdatable entries**.

## Competitor comparison
Every tracker and scheduler logs sleep. Napper's visual "clock" day view is loved; its midnight backdating flaw is its single most-cited complaint. Smart Sleep Coach's background timer is documented to stop when the app closes. None of these are hard problems — they're neglected ones.

## Our approach (spec)
One tap starts a sleep timer; one tap stops it. The running timer is a **pausable** (baby stirred, false start) and **background-safe** clock computed from a stored start timestamp, not a foreground counter — so it is correct whether the app is open, closed, or reopened tomorrow. Every entry is a plain start/end pair the user can **freely edit or backdate**, including across midnight. Nap vs. night is inferred from time of day but user-overridable. Totals update live on the home screen. Local-only, no account.

## Scope — MVP
- One-tap start/stop; pause/resume.
- Background-safe timestamp-based timer.
- Fully editable start/end; backdate to any date/time.
- Nap/night labeling; daily totals.

## Scope — later
- Sleep quality/notes tag; location (crib/contact/car).
- Auto-suggested end time from typical nap length.
- Keep-screen-awake option during rock-to-sleep.

## Edge cases & gotchas
- **Midnight bug (MUST fix):** an entry created at 1am can be dated to "yesterday"; edits never clamp to today.
- **Background death:** timer derives from stored timestamps, so closing the app or a phone restart never loses time.
- **Overnight timer:** a sleep running >12h prompts "still asleep?" without auto-deleting.
- **Two open timers:** allow, but warn (twins/caregiver overlap).
- Overlapping/duplicate edits resolve by last-write, all reversible.

## Evidence & citations
Feedback synthesis in `features/FEATURE-INDEX.md` (most-loved / most-hated). Sleep-duration context: AASM 2016; NSF 2015 (`research/00-MASTER`).

## Effort
Medium. Timer state model + edit UI are the core; correctness (midnight, background) is where the effort must go.

## Related features
D01 (Trends & totals), A01 (Schedule generator), F02 (Widgets), C02 (Feeding log), F08 (Dark-room UX).

## Success metric
Median log created/edited in under 3 taps; zero midnight-backdating failures; timers survive app restart in 100% of sessions.

## Risks / open questions
Web/PWA background timing relies on stored timestamps (fine) but push-style "still asleep?" nudges need F01. How aggressively to auto-split a timer that crosses midnight for totals?
