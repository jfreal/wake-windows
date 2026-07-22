---
title: White-Noise & Sleep Sounds
sidebar_label: White noise & sounds
id: F05-white-noise-sounds
docKey: white-noise-sounds
category: Utility & Integrations
priority: P2
status: Built
tags: [white-noise, sounds, audio, optional, scope-question]
---

# White-Noise & Sleep Sounds

**Competitor verdict:** Table-stakes-ish / common — Napper ships 30+ sounds; nice-to-have but off-mission, so keep it strictly optional.

## Problem / user need
Some parents want a white-noise or lullaby player in the same app that tells them when to nap, so they aren't juggling two apps at 3am. It's a genuine convenience — but it's adjacent to the core job (the schedule), not central, and it risks bloating a tool meant to disappear.

## What users actually say
- FEATURE-INDEX F05: "Common (Napper 30+); optional."
- Design north star is a tool that "does its job and gets out of the way" — an audio library pulls against that if it becomes a headline feature.

## Competitor comparison
Napper bundles 30+ sounds; several trackers include a player. It's common enough to be near-table-stakes for sleep apps, but it is not a differentiator and no competitor is criticized for lacking it. This is a "decide if worth it" feature, and the honest recommendation is: ship only a minimal, clearly-optional player, or skip and link out.

## Our approach (spec)
Keep it optional, lightweight, and never in the way:
- A small, opt-in audio panel offering a few royalty-free loops (white/pink/brown noise, a simple fan/rain) via the Web Audio API, with a timer that respects the schedule (e.g., "play until next window").
- Hidden by default so it never adds empty-tracker guilt or clutter; the schedule stays the headline.
- Fully local assets so it works offline (F07) and needs no account.

## Scope — MVP
**Built** (the "if built" MVP). Shipped: an opt-in panel hidden behind an "Add white noise" toggle (off by default), 5 looping tracks — white, pink, brown noise plus filter-shaped fan and rain — all **synthesised in-browser via the Web Audio API** (no bundled/licensed audio, nothing to inflate the PWA cache), play/stop, a volume slider, and a 15/30/45/60-min sleep timer. Sound only ever starts from an explicit track tap (user gesture; no autoplay), and the panel carries an honest note that a locked phone may pause playback. Fully local, works offline (F07), no account. Hidden in the read-only sitter view. Reusable noise-buffer/timer/volume math lives in `src/models/whiteNoise.ts` (unit-tested); `WhiteNoise.vue` only wires it into Web Audio nodes and the UI.

## Scope — later
- Small curated library (rain, ocean, fan); volume fade-out.
- "Play through the nap" tying the timer to the current window.

## Edge cases & gotchas
- Autoplay policies block audio without a user gesture — require an explicit tap.
- Background audio on mobile web is unreliable when the screen locks; a locked-screen white-noise machine is a native strength, so under-promise on web.
- Bundling many audio files inflates the PWA cache; keep the set tiny and lazy-loaded.
- Licensing: use genuinely royalty-free/self-generated noise to avoid rights issues.

## Evidence & citations
FEATURE-INDEX F05 ("Napper 30+; optional"). Brand principles: quiet by default, no bloat, offline-capable.

## Effort
Low if minimal (generated noise); Medium if a curated licensed library.

## Risks / open questions
- Does it dilute focus on the schedule? Strong argument to skip or keep tiny.
- Mobile-web background-audio limits may disappoint users expecting a full sound machine.

## Success metric
If shipped: enable rate and per-session play time — low engagement justifies removing it.

## Related features
F07 (offline audio), F01 (schedule-aware timer), C07 (keep optional to avoid clutter).
