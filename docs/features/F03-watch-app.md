---
title: Apple Watch / Wear OS Companion
sidebar_label: Watch companion
id: F03-watch-app
docKey: watch-app
category: Utility & Integrations
priority: P2
status: Proposed
tags: [apple-watch, wear-os, wearable, native, web-limits]
---

# Apple Watch / Wear OS Companion

**Competitor verdict:** Confirmed demand — the #1 single wished-for item; but a genuine watch app is native-only, so a web app must be honest about the gap.

## Problem / user need
Hands are full. A wearable that shows "time until next nap" and logs "nap started" from the wrist is the single most-requested feature in the research. It is the purest expression of the app's context: one hand, no phone, dark room.

## What users actually say
- Most-wished-for list is led by "Apple Watch app." (FEATURE-INDEX)
- FEATURE-INDEX table F03: "#1 single wished-for item."

## Competitor comparison
Some native competitors offer Watch complications/logging; the research flags it as the top single wish, implying coverage is thin or paywalled. As a **web app, Wake Windows cannot ship a watchOS or Wear OS app** — those require native SDKs, an App Store/Play presence, and an account model the brand rejects. This is the most constrained feature in the catalog and must not overpromise.

## Our approach (spec)
Get most of the value without a native watch app:
1. **Watch notifications relay.** If the parent installs the PWA and enables the pre-nap nudge (F01), paired Apple Watch / Wear notifications mirror phone notifications automatically — the countdown reaches the wrist with zero extra build.
2. **Watch-browser glance.** A tiny, high-contrast `/glance` route degrades gracefully on the watch browser where one exists.
3. **Optional thin native companion (later, only if warranted).** A minimal watchOS/Wear tile showing the countdown range and a single "nap started" tap that writes to local data — kept deliberately small and still account-free. This is the one place a native surface may earn its keep.

## Scope — MVP
- Ensure F01 notifications are watch-friendly (short title, range in body) so they relay to the wrist for free.
- Document the limitation plainly in a Help entry.

## Scope — later
- Thin native watch tile/complication: countdown + one-tap nap start, syncing to the device's local plan.
- Wear OS parity.

## Edge cases & gotchas
- No true web API reaches watchOS complications; a real complication requires native code — say so.
- A native companion reintroduces app-store review, update maintenance, and possible account pressure; guard the no-account principle.
- Relayed notifications depend on the phone's PWA push (iOS: Home-Screen install required).

## Evidence & citations
FEATURE-INDEX most-wished-for and F03 verdict ("#1 single wished-for item"). Brand principles: no account, built for one hand in a dark room.

## Effort
Low for the notification relay; High for any native companion.

## Risks / open questions
- Is a native watch app worth breaking web-first purity? Likely only if demand is proven post-launch.
- App-store account requirements could conflict with the no-account promise.

## Success metric
Qualitative: does the wrist notification satisfy the "next nap?" glance without opening a phone? Later: native-tile adoption if built.

## Related features
F01 (nudges relay to wrist), F02 (glance/native companion), F04 (voice logging), F07 (offline).
