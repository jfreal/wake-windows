---
title: Read-Only Babysitter / Grandparent Mode
sidebar_label: Babysitter Mode
id: E02-read-only-babysitter-mode
docKey: read-only-babysitter-mode
category: Sharing & Collaboration
priority: P1
status: Built
tags: [sharing, read-only, babysitter, grandparent, url-state, no-account]
---

# Read-Only Babysitter / Grandparent Mode

**Competitor verdict:** Partial gap — the major schedulers offer only full-access shared logins; a true read-only "here's the plan and next nap/bed" view is missing.

## Problem / user need
Handing the baby to a sitter or grandparent means either giving them full edit access to your app account or re-explaining the schedule by text. What they actually need is narrow: see today's plan and the next nap/bedtime — without the power (or risk) of editing or messing up your data.

## What users actually say
Wished-for handoff/summary support; the research verdict is that schedulers do "full-access shared logins only — no read-only view." A lightweight read-only link is the clean fix.

## Competitor comparison
Huckleberry and Nara give co-caregivers full-access shared logins only. Daycare apps (Brightwheel, Daily Connect) have read-only roles but aren't wake-window schedulers. Combining a read-only role with our schedule is open space, made almost free by the URL-state design (E01).

## Our approach (spec)
- Generate a **read-only share link** (a variant of the E01 plan URL) that renders today's plan plus **next nap and next bedtime** prominently.
- **No edit controls** — the sitter can't change times, log over your data, or alter the plan; they just see it.
- Works in any browser, **no account, no install** — ideal for a grandparent on a laptop.
- Optional: a "live" read-only view that recomputes next-window as the clock advances, still range-based (not a scolding countdown).

## Scope — MVP
Read-only URL that shows today's schedule + next nap/bed, with editing disabled. Copy-link and share action from the plan.

**As built:** the sitter link is the plan URL plus `view=sitter` (e.g. `?bd=…&s=…&view=sitter`). `SitterView.vue` renders next nap and next bedtime as ±15-minute ranges (`ScheduleSetting.nextNapWindow` / `bedtimeWindow`) plus the full day plan; the sitter page contains zero interactive controls (no inputs, buttons, or links — the delete-data/tip-jar footer is hidden too). "Next" is computed once at page load, not as a live countdown. A "Copy sitter link" action in the normal plan view copies the URL to the clipboard, falling back to showing the link for manual copy. Times are labeled as clock times in the baby's home time zone.

## Scope — later
Optional expiry on the link, pairing with a handoff note (E03), a simplified "big text, dark-room" sitter layout, toggle to reveal safe-sleep reminders.

## Edge cases & gotchas
- **Read-only must truly be read-only** — no hidden edit affordances; guard against a shared link granting write access.
- **Time-zone:** if the sitter's device is in another zone, render in the plan's zone and label it.
- **Ranges, not a clock** — show "next nap ~11:00–11:30," never a guilt-inducing countdown.
- Link revocation isn't possible with pure URL-state; note that and consider optional expiry.

## Evidence & citations
Positioning grounded in the handoff/babysitter brief (schedulers = full-access only; Pebbi/daycare apps own adjacent read-only roles). Next-window guidance is Tier 3, ranges per brand rules.

## Effort
Medium. Read-only rendering of shared state + a "next window" computation; reuses E01.

## Risks / open questions
Whether to add optional expiry/revocation given stateless URLs. Keeping it lightweight and tied to the schedule, not a full logging suite.

## Success metric
Read-only links created and opened; sitter/grandparent usage; review mentions of easy handoff.

## Related features
E01 (URL foundation), E03 (handoff notes), E04 (multi-caregiver), F08 (dark-room UX), A05 (bedtime).
