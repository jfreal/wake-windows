---
title: No-AI / No-Data-Training Stance
sidebar_label: No AI / no training
id: G04-no-ai-no-data-training
docKey: no-ai-no-data-training
category: Brand & Product
priority: P1
status: Built
tags: [no-ai, transparency, privacy, arithmetic, show-your-work]
---

# No-AI / No-Data-Training Stance

**Competitor verdict:** Confirmed gap — everyone is racing to add AI; a transparent-arithmetic counter-position is unoccupied.

## Problem / user need
Parents are told to trust a black box that spits out a nap time with no explanation, while their baby's data quietly trains someone's model. A worried parent deserves to know *how* a recommendation was reached and to be certain their child's sleep logs aren't feeding an LLM.

## What users actually say
The founder is "sure his kids' data is in a database somewhere" and never signed up to train anything. Broadly, parents want interpretation they can trust and "show your work," not an oracle. The category's AI race makes the data-provenance question louder, not quieter.

## Competitor comparison
- **Napper** sends limited user data to OpenAI/Anthropic to power its AI features.
- **Huckleberry's Berry AI** and **Robin's Ask Robin** run conversational, account-gated AI off logged data — and don't cite sources.
- None offers a transparent, no-model alternative that explains its math.

## Our approach (spec)
- **No LLM. No black box. No model trained on your baby's data.** Predictions are transparent arithmetic: wake time + age-appropriate wake-window ranges → nap and bedtime windows.
- **Show your work.** Every recommendation carries a Tier badge + citation (B01). A parent can see exactly why 9:15–9:45 was suggested.
- Troubleshooting is a **deterministic decision tree** (B05), not a chatbot — same inputs always yield the same, inspectable path.
- A plain-English stance on the methodology/privacy page: "We don't use AI. We don't train anything on your data. Here's the arithmetic."

## Scope — MVP
The arithmetic engine is already the product's shape; add the explicit "no AI, no training" statement and ensure every output exposes its inputs and citation.

## Scope — later
An expandable "how this was calculated" view on any window; a signed methodology note.

## Edge cases & gotchas
- Don't overclaim: "no AI" means no model trained on users and no black box — say it precisely.
- Keep the arithmetic legible; if logic grows complex, still avoid opaque ML.
- Personalization from local history (A10) must stay transparent arithmetic, not a trained model.

## Evidence & citations
[Napper — Privacy Policy (data to OpenAI/Anthropic)](https://napper.app/privacy/) · [Huckleberry — Berry AI](https://huckleberry.zendesk.com/hc/en-us/articles/44561361627667-What-is-Berry) · [Robin — Ask Robin](https://www.robinbaby.com/)

## Effort
Low — mostly a positioning statement plus surfacing existing arithmetic.

## Risks / open questions
"AI" is a marketing expectation for some users; frame the absence as a feature (transparency + privacy), not a limitation.

## Success metric
Engagement with "how this was calculated"; trust mentions re: no-AI/no-training in reviews.

## Related features
B01 (tier badges + citations), B05 (decision-tree troubleshooter), G01 (no-account), G03 (anti-anxiety mechanics).
