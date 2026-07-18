---
title: Diaper Log
sidebar_label: Diaper log
id: C04-diaper-log
docKey: diaper-log
category: Tracking & Logging
priority: P2
status: Proposed
tags: [tracking, diaper, wet, dirty, mixed, one-tap]
---

# Diaper Log

**Competitor verdict:** Table-stakes — every tracker has it, so the only way to win is by not making it annoying. Don't force extra taps.

## Problem / user need
Parents log diapers to reassure themselves (and pediatricians) that intake/output is normal, especially in the newborn weeks. It is the highest-frequency, lowest-thought log there is — so tap count matters more than anything. The wrong design turns a one-second action into three taps.

## What users actually say
A market leader (Huckleberry) drew **complaints for splitting pee and poop** into separate actions, adding taps to a trivial log. The most-loved list is dominated by **fast one-hand/one-tap logging**. The lesson is explicit: keep "mixed" a single tap; don't force parents to disambiguate output they don't care to separate.

## Competitor comparison
Diaper logging is universal across trackers. The differentiator is friction: Huckleberry's split pee/poop flow is a documented irritant. Our opening is the fewest possible taps plus no-account/local storage.

## Our approach (spec)
Three primary one-tap buttons: **Wet**, **Dirty**, **Mixed**. A tap logs immediately with the current timestamp — no confirmation modal, no follow-up prompt. **Mixed stays one tap** (never a wet-tap-then-dirty-tap sequence). Optional details (color/consistency, leak, size) are tucked behind an expandable, never required. Entries are editable and backdatable. Daily counts show on trends. Local-only.

## Scope — MVP
- One-tap Wet / Dirty / Mixed logging with instant timestamp.
- Editable/backdatable entries; daily counts.
- Optional details collapsed by default.

## Scope — later
- Color/consistency reference (newborn output guidance).
- Rash note; brand/size tracking.
- Quick "log at earlier time" for a caught-up-later diaper.

## Edge cases & gotchas
- **Don't force extra taps:** Mixed is a first-class one-tap button, learning from Huckleberry's split-output complaints.
- **Midnight bug (MUST fix):** a 3am change backdates to the right day; overnight counts bucket correctly.
- **Background/offline:** logging works fully offline; no timer involved, so nothing to lose on app close.
- **Editable:** a mis-tapped Wet can be changed to Mixed without deleting/re-adding.
- Rapid double-log (two diapers close together) both persist; no dedupe that eats a real entry.

## Evidence & citations
Feedback synthesis in `features/FEATURE-INDEX.md` (Huckleberry split pee/poop complaint; one-tap logging most-loved). No competitor facts invented.

## Effort
Low. Three buttons, one entry type, an optional collapsed detail panel.

## Related features
C01 (Sleep logging), C02 (Feeding), D01 (Trends & totals), F08 (Dark-room/one-hand UX), C07 (hidden-by-default).

## Success metric
Diaper logged in exactly 1 tap for the common case; Mixed never requires >1 tap; edit rate low (design got the primary action right).

## Risks / open questions
Whether to show newborn output-color guidance in MVP (probably later). How to hide the tracker until first use without hiding it from newborn parents who need it most.
