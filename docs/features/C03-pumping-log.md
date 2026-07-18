---
title: Pumping Log
sidebar_label: Pumping log
id: C03-pumping-log
docKey: pumping-log
category: Tracking & Logging
priority: P2
status: Proposed
tags: [tracking, pumping, breastmilk, export, oz]
---

# Pumping Log

**Competitor verdict:** Table-stakes — a standard entry type in full trackers, rarely a differentiator, but expected by pumping parents.

## Problem / user need
Parents who pump need to record ounces (or ml) expressed per session, often per side, to manage supply and a milk stash. It is quick, repetitive logging that must be one-handed and correct at odd hours. Many also want to hand a clean record to a pediatrician or lactation consultant.

## What users actually say
Pumping tracking is a common expectation among trackers rather than a headline delighter. The broadly wished-for items that touch it are **editable/backdatable entries**, **daily totals at a glance**, and **pediatrician-ready export** — parents want the numbers to add up and to leave the app easily.

## Competitor comparison
Full-breadth trackers (Baby Tracker, Glow Baby, Nara) include pumping alongside feeding and diapers. Sleep-only schedulers generally don't. The feature is common; the openings are no-account/local storage and a genuinely clean export.

## Our approach (spec)
A pumping entry captures amount (oz/ml, unit remembered), optional per-side (L/R) split, optional duration, and a timestamp. Entries are editable and backdatable. Daily and rolling totals display on the trends view. Pumping data is included in the shared **PDF/CSV export** (see D02) so a parent can hand off a stash/supply record without an account. Local-only; hidden by default until first used, to avoid empty-tracker guilt.

## Scope — MVP
- Amount entry with remembered unit; timestamp.
- Editable/backdatable; daily total.
- Included in PDF/CSV export note (D02).

## Scope — later
- Per-side split and duration.
- Stash/inventory running balance (added minus fed).
- Optional pumping session timer reusing the C01/C02 engine.

## Edge cases & gotchas
- **Midnight bug (MUST fix):** a late-night pump backdates to the correct day; totals bucket correctly across midnight.
- **Background death:** if a session timer is offered later, it is timestamp-based and survives app close.
- **One-tap-ish:** amount entry defaults to the last-used value for fast repeat logging.
- Zero-output sessions are loggable (supply tracking).
- Unit switching (oz↔ml) never silently rescales stored numbers.

## Evidence & citations
Feedback synthesis in `features/FEATURE-INDEX.md` (editable entries, daily totals, pediatrician export). Export mechanics in `features/D02` (referenced, not duplicated).

## Effort
Low. A simple entry type plus inclusion in the existing export pipeline.

## Related features
C02 (Feeding log), D01 (Trends & totals), D02 (Export PDF/CSV), C07 (hidden-by-default pattern).

## Success metric
Pump logged in ≤2 taps; pumping rows appear correctly in exported PDF/CSV; totals reconcile with per-entry sum.

## Risks / open questions
Whether to build stash inventory now or defer (defer — keep MVP simple). How much per-side detail parents actually want vs. one number.
