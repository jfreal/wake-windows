---
title: Ephemerality & One-Click Data Deletion
sidebar_label: Ephemerality / delete
id: G05-ephemerality-data-deletion
docKey: ephemerality-data-deletion
category: Brand & Product
priority: P1
status: Built
tags: [ephemeral, data-deletion, no-lock-in, no-auto-renew, privacy]
---

# Ephemerality & One-Click Data Deletion

**Competitor verdict:** Confirmed gap â€” everyone wants to retain you forever; a tool that admits you'll grow out of it is unoccupied.

## Problem / user need
Wake-window scheduling is a phase â€” you need it for months, then your child outgrows it. Every competitor is built to keep you: retained accounts, dormant subscriptions, data you can't fully delete. Parents end up paying for tools they no longer use because auto-renew stayed on, and their child's data lingers in a database indefinitely.

## What users actually say
The founder "paid for tools he no longer needed because auto-renew was on" and is "sure his kids' data is in a database somewhere." He wants a tool that "goes away when you're done." Billing-trap complaints (charges after cancel, no reminder) are, at root, about products that refuse to let you leave.

## Competitor comparison
The category optimizes for retention and lifetime value: accounts persist, deletion is buried or partial, and subscriptions bleed money after use ends. None frames graceful exit as a feature.

## Our approach (spec)
- **"It goes away when you're done."** One-click **delete everything** â€” because data lives on-device / in-URL (G01), deletion is real and immediate, not a support ticket.
- **No lock-in:** the plan is a URL; there's nothing to export-then-abandon and no account to close.
- **No dormant auto-renew bleed:** there's no subscription to forget (G02), so there's no recurring charge to outlive your need.
- The product **admits you'll grow out of it** â€” copy that says, honestly, "when your baby ages out of naps, you won't need us; thanks for stopping by." A one-time tip, not a lifetime hostage.

## Scope â€” MVP
A visible one-click "delete all my data" that clears on-device/URL state, plus plain-language confirmation that nothing remains. Copy acknowledging the tool is temporary by design.

## Scope â€” later
Optional "email me a copy before I delete" (client-side export); a gentle "still using this?" check-in that never becomes a retention nag.

## Edge cases & gotchas
- Deletion must be genuinely complete (local storage, cache, any shared URL guidance) â€” no orphaned data.
- If opt-in sync ever exists, it needs its own explicit server-side delete.
- Don't turn "still using this?" into engagement bait â€” that betrays the whole stance.

## Evidence & citations
[FEATURE-INDEX â€” auto-renew/billing landmines & privacy](./FEATURE-INDEX.md) Â· Glow â€” [California AG settlement](https://oag.ca.gov/news/press-releases/attorney-general-becerra-announces-landmark-settlement-against-glow-inc-%E2%80%93) Â· founder brief (twin parent, auto-renew traps, "goes away when you're done").

## Effort
Low â€” clearing local/URL state plus copy; near-free given the G01 architecture.

## Risks / open questions
"Graceful exit" runs counter to standard retention economics â€” but that's the point, and the tip jar (G02) means retention isn't the business model.

## Success metric
Use of one-click delete (as a trust signal, not a loss); zero "can't cancel / still being charged" complaints; positive review sentiment on "let me leave cleanly."

## Related features
G01 (on-device/URL state), G02 (no subscription/auto-renew), F07 (offline mode).
