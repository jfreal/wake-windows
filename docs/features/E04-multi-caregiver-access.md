---
title: Multi-Caregiver Access (Local-First, Per-Person)
sidebar_label: Multi-Caregiver
id: E04-multi-caregiver-access
docKey: multi-caregiver-access
category: Sharing & Collaboration
priority: P1
status: Proposed
tags: [sharing, multi-caregiver, sync, per-person, local-first, no-shared-password]
---

# Multi-Caregiver Access (Local-First, Per-Person)

**Competitor verdict:** Partial gap — fixes the widely-disliked shared-login and broken-sync gripes; competitors offer full-access shared logins, not per-person access, and their sync breaks on handoff.

## Problem / user need
Two parents (plus maybe a grandparent) share care but not a phone. Competitors force a single shared login/password, and their sync famously breaks — the loudest failure being "one person starts a timer, the other can't end it." Parents want each caregiver on their own device, seeing the same truth, able to hand off a running timer.

## What users actually say
Most-hated: "broken caregiver sync" and "can't-hand-off-a-running-timer." Most-wished-for: "per-caregiver logins (not shared password)" and "real-time multi-caregiver sync." This directly targets two named landmines.

## Competitor comparison
Huckleberry/Nara use full-access shared logins; broken sync and non-transferable running timers are recurring complaints. Per-caregiver, password-free access with reliable handoff of an in-progress timer is the differentiator — enabled by our URL-state/local-first design rather than a shared account.

## Our approach (spec)
- **Per-person access, no shared password:** each caregiver opens the plan via their own link/device; identity is a lightweight local label ("Mom," "Dad," "Grandma"), not an account.
- **One can start a timer, another can end it:** a running nap/feed timer is part of shared state, so a caregiver on a second device can stop/edit it. This is the explicit must-fix.
- **Local-first with reliable reconciliation:** on-device logs sync through a conflict-tolerant mechanism (last-writer-wins with edit history, or CRDT-style merge) — evaluate a minimal opt-in sync channel that preserves the no-account promise.
- **Editable/backdatable entries** so a caregiver can fix another's entry (and no midnight bug).

## Scope — MVP
Two caregivers on separate devices sharing one plan; a running timer started on device A can be ended/edited on device B; per-person labels; editable entries.

## Scope — later
More caregivers, per-person contribution view (feeds into D01), presence ("Dad has the baby"), offline-then-merge, opt-in encrypted sync for cross-device history.

## Edge cases & gotchas
- **Concurrent edits / conflict resolution** — define deterministic merge; keep an edit trail so nothing silently vanishes.
- **Offline handoff:** must reconcile cleanly when both devices reconnect (F07 offline mode).
- **Timer transfer** must not double-count or lose elapsed time.
- **No shared password** ≠ no privacy — links grant access, so document link-sharing carefully; consider optional expiry.
- Kill the **midnight backdating bug**.

## Evidence & citations
Grounded in the named "most-hated" feedback (broken sync, non-transferable timers) and "most-wished-for" (per-caregiver logins). Architecture leans on the state-in-URL/local-first moat from the master research.

## Effort
Medium–High. Reliable multi-device reconciliation of a running timer is the hard part; the rest reuses E01–E03.

## Risks / open questions
Achieving reliable sync without a mandatory account/server — the central design tension. Whether a minimal opt-in sync backend is needed, and how to keep it privacy-first. Conflict-resolution UX.

## Success metric
Multi-device plans in use; successful cross-device timer handoffs; drop in sync-related complaints; review mentions of "finally, no shared login."

## Related features
E01 (URL foundation), E02 (read-only), E03 (handoff notes), C01/C02 (timers/logging), F07 (offline), D01 (per-person totals), G01 (no-account).
