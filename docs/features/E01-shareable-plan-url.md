---
title: Shareable Plan URL
sidebar_label: Shareable URL
id: E01-shareable-plan-url
docKey: shareable-plan-url
category: Sharing & Collaboration
priority: P0
status: Built
tags: [sharing, url-state, no-account, moat, web, privacy-first]
---

# Shareable Plan URL

**Competitor verdict:** Confirmed gap — every serious competitor is app-only; no wake-window competitor offers a web-shareable plan link. This is the core structural moat.

## Problem / user need
A plan is useless if only one person can see it. Partners, grandparents, and sitters all need the same schedule, but app-only competitors trap the plan behind an install and a login. Parents want to just send someone the plan.

## What users actually say
Feedback prizes "privacy-first with no account" and real multi-caregiver sync; the master research names "the web app nobody has" and "state-in-URL, laptop-or-phone, shareable-plan shape" as *the* differentiator to own.

## Competitor comparison
Huckleberry, Napper, Smart Sleep Coach and the trackers are app-only; sharing means installing the app and signing into a shared/second account. None encode the plan in a link openable in any browser. This is genuine white space and the architectural advantage that makes E02–E04, DST plans, and exports nearly free to build ("just render shared state").

## Our approach (spec)
- The **entire plan lives in the URL** — child's birthday/adjusted age, wake time, preferences, schedule settings — serialized into the link (hash/query params), computed client-side.
- **No account, no server profile** to share: copy the link, send it, it opens the same plan on any device/browser.
- **Privacy-first:** state stays in the URL/on-device by default; nothing about the baby is stored server-side.
- Short **copy-link / share-sheet** action; optionally a URL shortener that still resolves to encoded state (evaluate privacy trade-off).
- Foundation for read-only (E02), handoff (E03), and multi-caregiver (E04) variants.

## Scope — MVP
Encode/decode full plan state in the URL; one-tap copy-link and native share; opening a shared link reproduces the plan exactly with no sign-up.

## Scope — later
Optional short links, QR code for the plan, versioned URL schema for backward compatibility, opt-in cross-device sync for those who want persistence.

## Edge cases & gotchas
- **URL length limits** — keep the encoding compact; watch very complex/multi-child plans.
- **Schema evolution:** version the encoding so old links keep working.
- **Sensitive data in URLs** can land in browser history/analytics — minimize PII, avoid names by default, document the trade-off.
- **Tracking logs are on-device, not in the URL** — the link shares the *plan*, not the baby's logged history.

## Evidence & citations
Positioning grounded in the master research ("the web app nobody has"; state-in-URL as the moat). Privacy contrast: Glow's AG settlement / Mozilla flag underscores the value of no server-side PII.

## Effort
Low–Medium, but foundational. Robust state serialization is the main work; it's already the product's intended shape.

## Risks / open questions
Compact, forward-compatible encoding; deciding what (if anything) to ever persist server-side. Balancing shortlinks against the no-server privacy promise.

## Success metric
Links created and opened; share → new-device opens; landing → shared-plan conversion.

## Related features
E02 (read-only mode), E03 (handoff notes), E04 (multi-caregiver), G01 (no-account architecture), G05 (ephemerality), A08 (DST plan sharing).
