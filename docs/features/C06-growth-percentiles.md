---
title: Growth Measurements & Percentiles
sidebar_label: Growth & percentiles
id: C06-growth-percentiles
docKey: growth-percentiles
category: Tracking & Logging
priority: P2
status: Proposed
tags: [tracking, growth, weight, height, percentiles, WHO, CDC, Fenton, preemie]
---

# Growth Measurements & Percentiles

**Competitor verdict:** Common — trackers plot weight/height, but many use a black-box percentile. Computing it locally with cited standards and Fenton for preemies is the honest edge.

## Problem / user need
Parents record weight, length/height, and head circumference and want to see where the baby falls on a percentile curve between pediatrician visits — for reassurance, not diagnosis. Preemie parents specifically need corrected-age curves (Fenton), which most general trackers ignore.

## What users actually say
The brand's own principles demand **no black-box** — parents distrust magic numbers. The research file stresses **corrected/gestational-age adjustment** as a partial market gap and lists preterm handling as a non-negotiable credibility rule. A "report card" that *interprets* data (not just plots it) is wished-for, but must stay transparent.

## Competitor comparison
Growth charts are common in full trackers. Corrected-age and **Fenton preterm** curves are rare — an opening consistent with A03 (corrected-age adjustment). Our differentiators: percentiles **computed on-device** from published WHO/CDC/Fenton reference tables, with the source named, and no data leaving the device.

## Our approach (spec)
Enter weight, length/height, head circumference with a date. The app plots each on age-appropriate curves: **WHO** (0–24 mo, per AAP guidance), **CDC** (2+ yr), and **Fenton** for preterm infants using corrected age. Percentiles are **computed locally** from bundled LMS reference tables — no server call, no account. Each chart names its source and reminds that percentiles describe, they don't grade (tracking a curve matters more than the number). Editable/backdatable entries. Hidden by default until first used.

## Scope — MVP
- Weight/height/head entry with date; editable/backdatable.
- Local percentile computation on WHO/CDC curves.
- Fenton curves + corrected age for preemies.
- Source named on each chart; reassuring framing.

## Scope — later
- Growth-velocity view; trend annotations.
- Export growth chart in the PDF report (D02).
- Unit toggles (kg/lb, cm/in) with safe conversion.

## Edge cases & gotchas
- **No black-box:** percentiles are transparent arithmetic from cited LMS tables, matching brand principle 2 — never an opaque score.
- **Preemie correction:** corrected age drives curve selection (Fenton); stated explicitly.
- **Midnight bug (MUST fix):** a measurement dated post-midnight lands on the intended day.
- **Offline:** reference tables are bundled; computation works fully offline, no account.
- **Reassure, don't scold:** a low or high percentile informs, never flags the baby as "behind."
- Unit conversions never silently rescale stored raw values.

## Evidence & citations
WHO/CDC growth standards (per AAP guidance); Fenton preterm curves; corrected-age rules in `research/00-MASTER` (non-negotiable credibility rules) and `features/A03`. Interpretation-not-just-charts wish in `features/FEATURE-INDEX.md`.

## Effort
Medium. Bundling LMS tables and computing percentiles is straightforward; the charting UI and preterm branching are the work.

## Related features
A03 (Corrected age), D01 (Trends), D02 (Export), B01 (Tier badges/citations), C07 (hidden-by-default).

## Success metric
Percentiles match published WHO/CDC/Fenton references within rounding; preterm entries use corrected age automatically; zero network calls for computation.

## Risks / open questions
Which exact WHO/CDC datasets and cutoff ages to bundle. How much velocity interpretation to offer without drifting toward diagnosis.
