---
title: "Atypical Day" / Disruption Flag
sidebar_label: Atypical-day flag
id: A07-atypical-day-flag
docKey: atypical-day-flag
category: Scheduling & Prediction
priority: P1
status: Built
tags: [disruption, illness, teething, regression, travel, accuracy]
---

# "Atypical Day" / Disruption Flag

**Competitor verdict:** Confirmed gap — directly answers the #1 accuracy complaint: predictions break during illness, teething, and regressions.

## Problem / user need
The loudest complaint about black-box predictors is that they fall apart exactly when life gets hard — a sick, teething, travelling, or mid-regression baby throws off every prediction, and the app keeps insisting on times that no longer fit. Parents then distrust the whole tool. They need permission to say "today is weird" and have the app respond with reassurance instead of a broken schedule.

## What users actually say
Two of the loudest competitor complaints are (a) black-box predictions and (b) predictions breaking during teething/illness/regressions. The master file names this the product's second structural opening: "an 'atypical day' flag answers (b)."

## Competitor comparison
No wake-window scheduler lets a parent mark a day as disrupted and adjusts its guidance. Predictors keep learning from bad days or keep pushing stale times, which is precisely what generates the angry accuracy reviews.

## Our approach (spec)
- One-tap **"Today is atypical"** toggle with reasons: illness, teething, travel, regression, vaccination, **daycare day, car/stroller nap**, other. The last two came out of the 2026-08 research sweep (08 T13, T20) — they are the disruptions parents actually reach for, and both have a concrete counting rule rather than only a mood.
- **Reason-specific tips** (`ATYPICAL_TIPS`), shown under the chips when a reason with a rule is picked; most reasons have none and show nothing extra:
  - *Car/stroller nap* — under ~30 minutes, stretch the next wake window a little and carry on; longer, count it as a real nap and let the day shift. One motion nap changes nothing long-term.
  - *Daycare day* — daycare naps run on daycare rules; if today's ran short, an earlier bedtime (even ~6:00 PM) absorbs it better than a late rescue nap.
  Tips are held to the same tone rule as everything else and tested for it: never "you missed", "off track", "behind schedule", or "should have".
- When set, the app shows a calmer message: **"Atypical day — don't over-adjust. Follow cues today; your normal plan will still be here tomorrow."** Windows widen visually or shift to a cues-first framing.
- Critically, an atypical day is **excluded from any local-history personalization (A10)** and **suppresses transition detection (A06)** — one rough week shouldn't rewrite the baseline.
- Ground it in the science: night wakings and rough patches are normal; the 4-month change is a permanent progression, later "regressions" are developmental windows, not failures. Never imply the baby is "broken."

## Scope — MVP
The toggle + reasons, the reassuring copy, visually widened windows with cues-first framing, and URL persistence (`at=<reason>` rides the shareable link). The exclusion hooks into personalization (A10) and transition detection (A06) land with those features — neither is built yet.

## Scope — later
Auto-suggest a flag when logged data deviates sharply from baseline; a gentle "still atypical?" check-in after a few days.

## Edge cases & gotchas
- Don't let a flag become guilt or a streak-breaker — it's relief, not a demerit.
- A long teething/regression stretch may span many days; make the flag easy to keep or clear.
- Distinguish "atypical day" from a genuine nap transition (A06), which is a permanent change, not a disruption.
- New reason ids only ever *add* to the accepted set, so an older shared link with `at=daycare` that used to fall back to "other" now resolves properly — and an unknown reason still flags the day rather than dropping the flag.
- The reason rides its own query param, so a hyphenated id (`car-nap`) can't collide with the `-` delimiters in the schedule shorthand (`s=7-2/2/2/2-7`).
- The two new reasons are also the two places elsewhere in the app that point *at* this flag: the contact-naps and daycare panels both tell parents that a car-nap or chaotic daycare day is exactly what the toggle is for.

## Evidence & citations
Tier 1/2 biology for regressions/night wakings (research file 02 §6–7); Tier 3 for disruption handling. The positioning is from the master file's "transparency + disruption-awareness" opening.

## Effort
Low — a state flag plus copy and two integration hooks (A06, A10).

## Risks / open questions
How aggressively to widen windows vs. simply reassure? Keep it reassurance-first to avoid overcorrecting.

## Success metric
Flag usage on disrupted days; retention/return after a rough patch; review sentiment on "didn't break when my baby got sick."

## Related features
A06 (suppresses detection), A10 (excludes flagged days), B06 (regression explainer), G03 (anti-anxiety mechanics).
