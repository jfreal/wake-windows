---
title: Milestones, Journal & Photos
sidebar_label: Milestones & journal
id: C07-milestones-journal
docKey: milestones-journal
category: Tracking & Logging
priority: P2
status: Proposed
tags: [tracking, milestones, journal, photos, optional, privacy]
---

# Milestones, Journal & Photos

**Competitor verdict:** Common — most full trackers bolt on milestones and photo journals, and they are the single clearest source of empty-tracker guilt. Ours is explicitly optional and off by default.

## Problem / user need
Some parents love capturing firsts, jotting notes, and attaching photos as a keepsake. Others find these sections a source of pressure. The need is genuine but strictly opt-in — and, because it involves baby photos, it is the most privacy-sensitive tracker in the app.

## What users actually say
**Empty-tracker guilt** is a named landmine: blank "Tummy Time"/milestone sections make tired parents "feel like you're not doing enough," and the explicit fix is to **hide unused trackers by default**. Parents also wish for **privacy-first with no account** — which matters most when the data is family photos.

## Competitor comparison
Baby Tracker, Glow Baby and others include milestones and photo journals, often front-and-center and often cloud-synced. That prominence is exactly what generates the guilt complaint. Our differentiators: off by default, no account, photos stored **on-device only**, and no lock-in.

## Our approach (spec)
Milestones, journal, and photos are a **single optional module, hidden by default**. A parent must actively turn it on; until then it never appears, adds no empty cards, and generates no nudges. When enabled: an optional age-based milestone checklist (no "overdue" flagging), free-text journal entries, and photo attachments stored locally. Everything is editable/backdatable and exportable, and everything can be deleted in one action (ephemerality). No streaks, no completion score. Local-only.

## Scope — MVP
- Off-by-default module the parent opts into.
- Optional milestone checklist (no overdue/scolding).
- Journal notes; local photo attachments.
- Editable/backdatable; one-click delete.

## Scope — later
- Simple keepsake export (photo + milestone timeline) via D02.
- Month/age auto-grouping of entries.
- Optional milestone reference content (neutral, cited).

## Edge cases & gotchas
- **Empty-tracker guilt (core design driver):** the module and its cards do not exist in the UI until enabled — no blank prompts, ever.
- **No scolding:** an unreached milestone is never flagged "late"; developmental ranges vary (ties to brand anti-anxiety principle).
- **Photo privacy:** images stay on-device; no upload, no account, deletable in one tap (ephemerality / no lock-in).
- **Midnight bug (MUST fix):** a post-midnight journal entry or milestone dates to the intended day.
- **Offline:** fully functional offline; no sync dependency.
- Large photo libraries: warn on device-storage limits rather than silently failing.

## Evidence & citations
Feedback synthesis in `features/FEATURE-INDEX.md` (empty-tracker guilt → hide by default; privacy-first wish). Brand principles (anti-anxiety, ephemerality, on-device) in `research/00-MASTER` and the index brand filter.

## Effort
Low–Medium. Content models are simple; local photo storage/quotas and the strict off-by-default gating are the main considerations.

## Related features
C05 (Custom events), D02 (Export), G03 (Anti-anxiety mechanics), G05 (One-click deletion), G01 (Privacy-first).

## Success metric
Zero milestone/journal UI shown to users who haven't enabled it; opted-in users can export and one-tap-delete; no "overdue" language anywhere.

## Risks / open questions
Device photo-storage limits on a web/PWA context. Whether any milestone reference content risks implying a rigid timeline (keep it range-based and cited).
