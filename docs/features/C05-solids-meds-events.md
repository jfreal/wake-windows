---
title: Solids, Medications & Custom Events
sidebar_label: Solids & meds
id: C05-solids-meds-events
docKey: solids-meds-events
category: Tracking & Logging
priority: P2
status: Proposed
tags: [tracking, solids, first-foods, medication, custom-events]
---

# Solids, Medications & Custom Events

**Competitor verdict:** Common — full trackers include these entry types; the opening is making them fast, reusable, and non-guilt-inducing.

## Problem / user need
Once solids start, parents want to record first foods (and watch for reactions), medication doses (with timing, so caregivers don't double-dose), and one-off events (bath, tummy time, tooth, doctor visit). Meds especially carry a safety need: the next caregiver must see the last dose and time.

## What users actually say
The wished-for list includes **editable/backdatable entries**, a **clean handover summary**, and **multi-caregiver** clarity. Empty-tracker guilt is an explicit landmine — blank "Tummy Time"/milestone sections make tired parents "feel like you're not doing enough," so these trackers should be hidden until used.

## Competitor comparison
Baby Tracker, Glow Baby and Nara offer solids/meds/custom events. Medication reminders and reusable doses exist in some. Our differentiators: local-only, reusable quick-doses, and the ability to log all of this **without interrupting a running sleep timer**.

## Our approach (spec)
Solids: log a food with an optional "first food" flag and a reaction note. Medication: pick from **saved, reusable quick doses** (name + amount you set once, then one tap to log), each stamped with time; the handoff summary surfaces the last dose. Custom events: a free-label entry with timestamp. Critically, any of these can be **logged while a sleep or feed timer is running** — logging an event never stops or resets an active timer. All editable/backdatable, local-only, hidden by default until first used.

## Scope — MVP
- Solids entry with first-food flag + note.
- Medication with saved/reusable quick doses; last-dose visible.
- Custom event (free label) with timestamp.
- Log while a timer runs; editable/backdatable.

## Scope — later
- Allergen introduction checklist; reaction tracking.
- Dose reminders (via F01) — never spammy.
- Event templates / favorites.

## Edge cases & gotchas
- **Log during an active timer:** adding a med/event while a nap timer runs must not pause, stop, or reset that timer (a real failure mode when logs and timers share screens).
- **Midnight bug (MUST fix):** a post-midnight dose/event backdates to the correct day.
- **Background/offline:** entries save offline; no dependence on a foreground session.
- **Meds safety:** last-dose time is prominent so a second caregiver doesn't double-dose; editable if mis-logged.
- **Empty-tracker guilt:** solids/events hidden until the parent opts in.

## Evidence & citations
Feedback synthesis in `features/FEATURE-INDEX.md` (empty-tracker guilt; handover summary; editable entries). Reminder mechanics deferred to `features/F01`.

## Effort
Low–Medium. Three entry types plus a small reusable-dose store and the "don't touch the running timer" guarantee.

## Related features
C01 (Sleep logging), C02 (Feeding), E03 (Handoff notes), F01 (Reminders), C07 (hidden-by-default), D02 (Export).

## Success metric
Event logged mid-timer with zero timer disruptions; a saved dose logged in ≤2 taps; last-dose time visible in handoff.

## Risks / open questions
How much allergen/reaction structure to add without over-medicalizing. Whether meds warrant any reminder in MVP (lean no, to avoid notification spam).
