---
title: Interactive Sleep Troubleshooter (Decision Tree)
sidebar_label: Troubleshooter
id: B05-interactive-troubleshooter
docKey: interactive-troubleshooter
category: Guidance & Credibility
priority: P1
status: Built
tags: [troubleshooter, decision-tree, no-AI, cited, free, differentiator]
---

# Interactive Sleep Troubleshooter (Decision Tree)

**Competitor verdict:** Partial gap — Huckleberry (Ask Robin) and similar offer paid AI chat; a free, no-account, cited decision tree does not exist.

## Problem / user need
When a nap breaks, parents want a fast, trustworthy answer — not a chatbot that guesses, requires an account, or costs money. The two most common questions (early rising, short naps) have well-understood, differentiable causes that map cleanly to a decision tree without any LLM.

## What users actually say
Parents want interpretation, not just charts, and distrust black-box AI. Paywalling previously-free help and account walls are top reputational landmines. A free, transparent troubleshooter directly answers "why won't they sleep?" without those traps.

## Competitor comparison
Berry / Ask Robin-style features use paid AI chat. No competitor offers a free, cited, no-account decision tree. This is on-brand (no black-box AI, decision-trees not LLMs) and a clean wedge.

## Our approach (spec)
A branching **decision tree** (deterministic, no LLM) covering the highest-volume issues:
- **Early rising** (before ~6 AM = still night): branch on overtired/late bedtime vs. too much day sleep vs. light/temperature vs. settling skills.
- **Short naps / "45-minute intruder":** one sleep cycle (~30–45 min), most common ~4–5 mo; branch on age, sleep pressure, and cycle-linking.
- **Split night vs. false start:** false start = waking 30–45 min after bedtime (under/overtired at bedtime); split night = 2–3 h wakeful mid-night, usually too much day sleep / low sleep pressure.

Each terminal answer gives a concrete, range-based suggestion, a "give it ≥1–2 weeks" note, and a **Tier badge + citation** (B01). Free, no account, works offline.

Two additions from the 2026-08 sweep:
- **"Crib hour"** is named and honestly tiered on the cycle-linking leaf (research 08 T10): what it is (leaving a calm baby in the crib for the full hour from nap start so a mid-nap wake-up gets a chance to turn back into sleep), that it is a widespread consultant convention rather than a studied protocol with genuinely mixed reports, and its prerequisite — it only makes sense for a baby who already settles independently and stays content. A fussing baby is done; go get them.
- **Overtired vs undertired** gets a standalone card (`OvertiredUndertired.vue`) outside the trees. The trees disambiguate it in three separate places; the card lifts the shared logic into one cited reference — the tells side by side, time-to-fall-asleep as the single most useful one (watched over 3–4 nights, not judged from one), the earlier-bedtime fix first because it is the gentler mistake if the guess is wrong, and the anti-anxiety corrective that online sleep culture reaches for "overtired" far more often than the evidence supports. It points back at the troubleshooter for the step-by-step version rather than competing with it.

## Scope — MVP
Three trees (early rising, short naps, split-night/false-start). Static branching logic. Cited terminal answers. No account, offline-capable.

## Scope — later
More trees (bedtime resistance, nap-transition confusion, regressions → B06); optionally use local logged data (C-series) to pre-fill answers; deep links from A07 "atypical day" flag.

## Edge cases & gotchas
- Never diagnose medical issues; add "check with your pediatrician" exits for red flags (illness, feeding/weight concerns).
- Keep leaves range-based and non-scolding; overtired and undertired can look similar — disambiguate carefully.
- Treat pre-6 AM wakes as night.

## Evidence & citations
Tier 3, research 02 §§2–4: 45-minute intruder & catnapping (Huckleberry, Taking Cara Babies, Peaceful Sleeper); false start vs. split night (Taking Cara Babies, Cozy Baby Sleep, Baby Sleep Science); early waking causes/fixes and the ≥1–2 week evaluation window (Taking Cara Babies, Little Ones, Huckleberry, Cozy Baby Sleep). Cite by name on each leaf.

## Effort
Medium. Tree authoring + a small deterministic engine; content-heavy but no backend/AI.

## Risks / open questions
Tree completeness without sprawl; overtired/undertired disambiguation accuracy; keeping tone reassuring.

## Success metric
Troubleshooter completion rate; leaf citation-open rate; return usage; qualitative "answered my question free" feedback.

## Related features
B04 (cues), A07 (atypical-day flag), B06 (regressions), B01 (tier badges), G01/G04 (no-account, no-AI).
