---
title: Home/Lock-Screen Widgets & Live Activities
sidebar_label: Widgets & Live Activities
id: F02-widgets-live-activities
docKey: widgets-live-activities
category: Utility & Integrations
priority: P1
status: Proposed
tags: [widgets, live-activities, lock-screen, pwa, glance]
---

# Home/Lock-Screen Widgets & Live Activities

**Competitor verdict:** Most-wished-for — a glanceable "time until next nap"; and it must not be paywalled (Huckleberry paywalling widgets read as a "blatant cash grab").

## Problem / user need
The recurring question is "how long until the next nap?" Parents want that answer without unlocking a phone and opening an app. A home/lock-screen widget or a Live Activity showing the countdown range is repeatedly the most-wished-for utility. The added landmine: charging for it. Paywalling a previously-free or obviously-basic widget is exactly the behavior reviews punish hardest.

## What users actually say
- Most-wished-for: "one-tap widget/Lock-Screen logging" and "daily totals on the home screen." (FEATURE-INDEX)
- Most-hated: "Paywalling previously-free features via an update ('blatant cash grab')."

## Competitor comparison
Native apps (Huckleberry, Napper) ship widgets; the complaint is monetization and lock-in, not absence. As a web app, Wake Windows cannot ship a true iOS WidgetKit widget or a Live Activity — those are native-only APIs. Honest constraint, real opportunity: nobody offers this account-free.

## Our approach (spec)
Deliver the *glance* the widget promises within web constraints, never behind a paywall:
1. **Installed PWA + lock-screen presence.** A persistent Web Notification (service worker) showing "Next nap ~in 40 min (9:40–10:10)," updated on a schedule — the closest web equivalent to a Live Activity on the lock screen.
2. **Home-screen shortcut** to a stripped "glance" view that opens straight to the countdown range and daily totals.
3. **Badging** via the Badging API where supported.
A native companion (see F03) could later host a true widget, but the web glance ships first and stays free.

## Scope — MVP
- Installable PWA with a dedicated `/glance` route: big countdown range + today's sleep total, dark-room styled.
- Updating lock-screen notification (opt-in) as the Live-Activity stand-in.

## Scope — later
- Optional thin native companion (F03) purely to host a real WidgetKit widget / Live Activity and Wear tile.
- Multiple widget sizes / next-3-events glance.

## Edge cases & gotchas
- True iOS Live Activities and Android home-screen widgets are **native-only**; be explicit in UI that the web version is a notification-based glance, not a system widget.
- Updating notifications is throttled by the OS; show a range so slight staleness never reads as "wrong."
- No account → glance state comes from the URL/local data on that device only.

## Evidence & citations
FEATURE-INDEX most-wished-for list and the anti-paywall stance; brand principle "no lock-in / tip jar."

## Effort
Medium for the PWA glance + notification; High if a native companion is later added.

## Risks / open questions
- Web can only approximate a Live Activity; expectation management is critical.
- Is a native companion worth the maintenance vs. the brand's web-first ethos?

## Success metric
PWA install rate and daily opens of the `/glance` route.

## Related features
F01 (nudges), F03 (Watch/native companion), D01 (daily totals), G02 (tip-jar, never paywall).
