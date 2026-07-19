---
title: Caregiver Handoff Notes & Summary
sidebar_label: Handoff Notes
id: E03-caregiver-handoff-notes
docKey: caregiver-handoff-notes
category: Sharing & Collaboration
priority: P1
status: Built
tags: [sharing, handoff, notes, summary, caregiver, local-first]
---

# Caregiver Handoff Notes & Summary

**Competitor verdict:** Partial gap — Pebbi owns AI handovers and daycare apps own reports, but the major *schedulers* have neither; combining a handoff with wake-window scheduling is open.

## Problem / user need
Every handoff — to a partner mid-night, a grandparent, a sitter — starts with re-explaining what just happened and what's next. "Last down at 7:40, took 20 min, next nap ~11:15; teething, fussy." Full-access sync doesn't answer "here's the plan plus the last wake, in one glance."

## What users actually say
Most-wished-for includes "a clean handover summary." The brief confirms schedulers lack handoff notes and identifies combining it with scheduling as the opening.

## Competitor comparison
Pebbi is built entirely around AI handovers/night-shift notes; Brightwheel and Daily Connect own daycare reports and read-only roles. Huckleberry/Nara offer full-access shared logins but no handoff note. We combine a lightweight note with the schedule — and, true to brand, the "since you last had the baby" summary is **transparent arithmetic, not AI**.

## Our approach (spec)
- A **handoff note field**: free text the outgoing caregiver leaves ("fed at 2pm, cranky, next nap ~4").
- An auto **"Since you last had the baby" summary** computed from on-device logs: last nap (start/end/duration), last feed, and the **next window** (range). Purely rule-based — no model.
- Attach the note + summary to a **read-only handoff link** (extends E01/E02) so the incoming caregiver opens one link and sees plan + what-just-happened.
- Reassuring, range-based tone; never a scolding "you're late" framing.

## Scope — MVP
A single handoff note field + auto last-nap / last-feed / next-window summary, viewable via a shareable link.

## Scope — later
Multiple timestamped notes, per-shift log, "acknowledge handoff" tap, printable daycare/pediatrician summary (ties to D02), quick-tag chips (teething, fussy, congested).

## Edge cases & gotchas
- **In-progress nap/feed** at handoff — show "asleep since 1:40 (so far)" rather than a blank.
- **Midnight/DST** must not distort "since last" math.
- **Local-first data:** the summary reflects logs on the device that generated the link — reconcile with E04 for multi-device truth.
- Keep it lightweight; don't drift into a full logging/handover suite (Pebbi's territory).

## Evidence & citations
Positioning from the handoff/babysitter brief (Pebbi + daycare apps as adjacent owners; schedulers lack it). Next-window guidance Tier 3; the summary is deterministic, supporting the no-AI stance (G04).

## Effort
Medium. Note field + summary computation over local logs + attach-to-link rendering; reuses E01/E02.

## Risks / open questions
Consistency of "since last" across devices without a server. How much note structure to add before it feels heavy.

## Success metric
Handoff notes created; handoff links opened; review mentions of smoother handoffs.

## Related features
E01 (URL), E02 (read-only), E04 (multi-caregiver), D02 (printable summary), C01/C02 (log source), G04 (no-AI).
