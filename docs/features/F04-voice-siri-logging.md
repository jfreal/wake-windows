---
title: Voice & Siri Shortcuts Logging
sidebar_label: Voice / Siri logging
id: F04-voice-siri-logging
docKey: voice-siri-logging
category: Utility & Integrations
priority: P2
status: Proposed
tags: [siri, shortcuts, voice, hands-free, web-limits]
---

# Voice & Siri Shortcuts Logging

**Competitor verdict:** Confirmed demand — hands-free "start nap" is Robin's entire pitch; real demand, but deep voice-assistant hooks are native-only.

## Problem / user need
During a feed or a car ride, tapping anything is hard. Saying "start nap" and having it logged is the ideal. The research names voice/Siri logging as wished-for and points to Robin, whose whole pitch is hands-free logging — evidence the demand is real and specific.

## What users actually say
- Most-wished-for: "voice/Siri logging." (FEATURE-INDEX)
- FEATURE-INDEX F04 verdict: "Wished-for (Robin's whole pitch)."

## Competitor comparison
Robin centers hands-free logging; native trackers expose Siri Shortcuts. A web app has no direct Siri intent API — it cannot register App Intents. But the assistant ecosystems can *drive* a web app through URLs, which is exactly the shape of this product (state-in-URL). That's the wedge.

## Our approach (spec)
Lean on URL-driven state so voice assistants can trigger logging without a native app:
1. **Shareable Shortcut recipes.** Publish user-installable Apple Shortcuts (and Android equivalents) that open a deep link like `/log?event=nap-start&t=now`, which logs to on-device data and returns a confirmation. "Hey Siri, start nap" runs the Shortcut.
2. **Web Speech API dictation** (where supported) inside the app for an in-page "tap-and-say" logging control.
3. Clear one-time setup guide; nothing account-bound.

## Scope — MVP
- Deep-link logging endpoints (`/log?event=…`) that write locally and confirm.
- A downloadable Apple Shortcut + Android Quick Setting/Assistant routine and setup docs.

## Scope — later
- In-app Web Speech dictation for quick notes / event capture.
- Parameterized Shortcuts (which baby, which side) tying to twins/feeding features.

## Edge cases & gotchas
- No web API registers a true Siri intent; the Shortcut is user-installed glue — be transparent it's a bridge, not native Siri integration.
- Deep links opening a browser tab are clunkier than a silent native intent; minimize by confirming with a lightweight page.
- Web Speech API support and language coverage are uneven across browsers.
- Local-only data means the log lands on the device that ran the Shortcut.

## Evidence & citations
FEATURE-INDEX most-wished-for and F04 verdict citing Robin. Brand principle: state-in-URL / no account makes URL-triggered logging natural.

## Effort
Low–Medium: deep-link endpoints are small; the polish is in the Shortcut recipes and docs.

## Risks / open questions
- Shortcut opening a browser may feel less seamless than expected.
- Discoverability of a downloadable Shortcut vs. a built-in integration.

## Success metric
Number of Shortcut installs and successful `/log` deep-link events.

## Related features
F03 (Watch), C01 (nap logging), C02 (feeding / which-side), E04 (per-caregiver), G01 (no-account/URL state).
