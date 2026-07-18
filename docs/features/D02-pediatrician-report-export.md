---
title: Pediatrician-Ready Report & Export
sidebar_label: Doctor Report
id: D02-pediatrician-report-export
docKey: pediatrician-report-export
category: Analytics & Insights
priority: P1
status: Proposed
tags: [analytics, export, pdf, csv, pediatrician, report, local-only]
---

# Pediatrician-Ready Report & Export

**Competitor verdict:** Partial — CSV export is common, but a clean formatted PDF summary is rarer; Nighp's pediatrician-ready PDF is the notable exception while most apps just dump raw CSV.

## Problem / user need
Parents get asked at checkups about sleep, feeding, and diaper patterns and can't recall specifics. They want a clean, printable summary to hand the pediatrician — not to email a raw spreadsheet the doctor won't open on the spot.

## What users actually say
"Pediatrician-ready export" appears among the most-loved features done well. The implicit complaint about competitors: CSV dumps are common but a genuinely readable, printable report is not.

## Competitor comparison
Huckleberry and Nara export CSV; Nighp (Baby Tracker) exports pediatrician-ready PDFs and is praised for it. So a formatted PDF is a real, if partial, gap among the schedulers. We should ship both a clean printable/PDF summary and CSV for parents who want the raw rows.

## Our approach (spec)
- **Printable summary view** rendered from on-device logs: date range picker (e.g., last 7/14/30 days), with daily totals (sleep h, longest stretch, feeds/oz, wet/dirty diaper counts) and a compact averages header.
- **Print-to-PDF** via the browser (no server round-trip; keeps data on-device) plus a **CSV download** of raw entries.
- Neutral, clinical layout — baby's first name/age optional, no scores or judgments, ranges shown against AASM/NSF bands for context.
- Because the plan lives in the URL, the report generates client-side with no account.

## Scope — MVP
Printable/PDF summary for a chosen date range (sleep, feed, diaper totals + averages) and a CSV export of raw entries.

## Scope — later
ICS calendar export of the schedule (see F06), growth/percentile inclusion (C06), configurable fields, one-tap "share to daycare" printable.

## Edge cases & gotchas
- **Midnight-spanning sleep** must attribute correctly in daily rows.
- **Empty ranges:** produce an honest "no data logged" report rather than a broken export.
- **PDF fidelity** across browsers — use a print stylesheet, test Safari/Chrome.
- No PII leaves the device unless the user explicitly saves/shares the file.

## Evidence & citations
Context bands cited from AASM 2016 / NSF 2015 (Tier 1). Percentiles, if added, from WHO/CDC (Fenton for preterm).

## Effort
Medium. Print stylesheet + client-side CSV generation over the local data model; no backend.

## Risks / open questions
Local-only means the report only covers data on that device — cross-device consolidation needs the E04 access model. Clarify it's a summary, not a medical record.

## Success metric
Reports/PDFs generated; CSV downloads; review mentions of using it at a checkup.

## Related features
D01 (totals feed the report), D03 (insights can print alongside), C01–C06 (source data), F06 (calendar export), E03 (handoff/daycare summary).
