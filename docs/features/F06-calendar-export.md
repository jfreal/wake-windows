---
title: Calendar Export (ICS)
sidebar_label: Calendar export
id: F06-calendar-export
docKey: calendar-export
category: Utility & Integrations
priority: P2
status: Built
tags: [calendar, ics, export, google-calendar, apple-calendar]
---

# Calendar Export (ICS)

**Competitor verdict:** Confirmed gap — no scheduler pushes naps/bedtime into the user's own calendar.

## Problem / user need
The plan lives in the app; the parent's day lives in their calendar (shared with a partner, a nanny, grandparents). Letting them drop today's naps and bedtime onto Google/Apple Calendar means the schedule shows up where they already look, and it rides existing calendar reminders and sharing — no new app for a caregiver to install.

## What users actually say
- FEATURE-INDEX F06 and D02 both list ICS/calendar export as a Confirmed gap.
- Related wishes: "clean handover summary" and shareable plans — calendar is a familiar sharing rail.

## Competitor comparison
The research marks calendar export a **Confirmed gap**: schedulers keep the plan siloed in-app. This pairs naturally with the product's existing "state-in-URL / shareable plan" wedge (E01) — an ICS file is just another portable, account-free representation of the plan.

## Our approach (spec)
Generate a standards-compliant `.ics` from the current plan, entirely client-side:
- One "Add to calendar" action produces an ICS with VEVENTs for each nap window and bedtime, titled with the range (e.g., "Nap window 9:40–10:10") and a description noting these are Tier 3 guidance ranges, not fixed appointments.
- Works for Google, Apple, and Outlook (all consume ICS). Optional per-event VALARM maps to the F01 pre-nap lead time.
- No server, no account: the file is built in the browser from URL/local state.

## Scope — MVP
- Client-side ICS download for today's plan (naps + bedtime) with range-based titles and a "guidance, not appointments" note.

## Scope — later
- Multi-day export; recurring template.
- Optional per-event alarms mirroring F01 lead times.
- Subscription-style feed (webcal) if it can stay account-free.

## Edge cases & gotchas
- Ranges vs. points: a calendar event has a start/end, which can read as a hard commitment — keep the "guidance range" wording to avoid rigid-schedule anxiety.
- Time zones: write correct `TZID`/UTC so travel/DST doesn't shift events.
- iOS/Android open ICS differently; test the "Add to calendar" hand-off on both.
- Regenerating after edits creates duplicate events unless UIDs are stable — use deterministic UIDs so re-export updates rather than duplicates.

## Evidence & citations
FEATURE-INDEX F06/D02 (Confirmed gap). Brand principles: no account, no lock-in, shareable/portable plan (E01).

## Effort
Low. ICS generation is well-understood and fully client-side.

## Risks / open questions
- Duplicate-event handling on re-export (UID strategy).
- Whether to offer a live subscribing feed without introducing a server/account.

## Success metric
Number of ICS exports per plan view.

## Related features
E01 (shareable URL), D02 (pediatrician-ready export), F01 (alarm lead times), A05 (bedtime).
