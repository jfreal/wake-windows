---
title: Offline Mode
sidebar_label: Offline mode
id: F07-offline-mode
docKey: offline-mode
category: Utility & Integrations
priority: P1
status: Proposed
tags: [offline, pwa, service-worker, local-first, no-account]
---

# Offline Mode

**Competitor verdict:** Confirmed gap — schedulers demand a connection (and often an account) exactly where parents have neither: dark nurseries, hospitals, basements.

## Problem / user need
The core moments — a night feed, a hospital stay, a basement nap — are often where connectivity is worst. Apps that require a login or a live server fail there. Because Wake Windows has no account and keeps state in the URL and on-device, working offline isn't a bolt-on; it's the natural shape of the product. The parent should get their plan and log a nap with zero bars.

## What users actually say
- Most-hated: "Mandatory accounts + no offline mode in hospitals/basements." (FEATURE-INDEX)
- FEATURE-INDEX F07: "Confirmed gap for schedulers; natural for no-account."

## Competitor comparison
The research flags offline as a **Confirmed gap** for schedulers and notes competitors are app-and-server bound. This is a place the brand's architecture wins by default — "the web app nobody has," per the master research's structural opening.

## Our approach (spec)
Make the whole core usable with no network via a PWA:
- **Service worker** precaches the app shell, fonts, and evidence/citation content so a plan renders and recomputes offline.
- **Plan state from the URL + local storage** means no server round-trip to generate a schedule; edits and any local logging (C-series) persist on-device.
- **Installable PWA** with an offline fallback page; a clear "offline — your plan still works" indicator instead of a spinner or error.
- Citations and the safe-sleep panel are bundled, so credibility content survives offline too.

## Scope — MVP
- Service worker precaching app shell + core content; installable manifest.
- Full schedule generation and 24h breakdown offline from URL/local state.
- Honest offline indicator.

## Scope — later
- Offline persistence of local logs (C-series) with on-reconnect sanity (no server sync needed — data stays local).
- Background sync for queued notifications (F01) when supported.

## Edge cases & gotchas
- Cache versioning: stale service workers can pin old logic/citations — ship a clear update/refresh strategy.
- iOS PWA storage can be evicted under pressure; warn that clearing site data erases local logs (ties to G05 ephemerality — a feature, but must be communicated).
- Web push (F01) still needs connectivity to *deliver*; scheduling works offline, delivery does not — be honest.
- No account means no cross-device recovery; that's intentional, but state it.

## Evidence & citations
FEATURE-INDEX most-hated (mandatory accounts + no offline) and F07 (Confirmed gap). Master research structural opening: "the web app nobody has." Brand: no account, privacy-first, local-first.

## Effort
Medium. Service-worker/PWA setup and cache-versioning discipline are the main cost; the no-server architecture does the rest.

## Risks / open questions
- Cache-invalidation bugs are the classic PWA failure mode.
- Storage eviction on iOS could surprise users who expect persistence.

## Success metric
Successful plan renders while offline (measurable via service-worker cache hits) and PWA install rate.

## Related features
G01 (no-account architecture), G05 (ephemerality/deletion), F01 (nudges), F02 (glance), C01/C02 (local logging).
