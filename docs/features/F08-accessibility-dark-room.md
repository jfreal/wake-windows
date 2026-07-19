---
title: Accessibility & Dark-Room UX
sidebar_label: Accessibility & dark-room
id: F08-accessibility-dark-room
docKey: accessibility-dark-room
category: Utility & Integrations
priority: P0
status: Built
tags: [accessibility, wcag, dark-room, one-hand, reduced-motion, screen-reader]
---

# Accessibility & Dark-Room UX

**Competitor verdict:** Confirmed gap — nobody markets baby-app accessibility, yet the core use case (one hand, dark room, exhausted) is an accessibility case.

## Problem / user need
The default user is impaired-by-circumstance: half-awake, one-handed, in a dark room, eyes dark-adapted, phone at minimum brightness. That's functionally a low-vision, low-dexterity, high-cognitive-load context — plus real users with permanent disabilities. Meeting WCAG 2.2 AA isn't compliance theater here; it's the product's central design constraint, and no competitor claims it.

## What users actually say
- FEATURE-INDEX F08: "Confirmed gap (nobody markets it)," priority P0, in the MVP row.
- PRODUCT/DESIGN: "built for tired thumbs," one-hand-in-the-dark is the default case; target WCAG 2.2 AA.

## Competitor comparison
The research marks this a **Confirmed gap**: accessibility is unmarketed across competitors. Owning it — with a *public accessibility statement* — is both an ethical baseline and a differentiator no rival is claiming.

## Our approach (spec)
Bake WCAG 2.2 AA into every surface and say so publicly:
- **Dark-room first.** Deep slate surface, low-glare quiet ink; body text ≥4.5:1 (verified, not assumed — `text-muted` #7c899e = 5.04:1 is the floor per DESIGN).
- **One-hand targets.** All interactive elements ≥44px, thumb-reachable.
- **Reduced motion.** `prefers-reduced-motion` honored on every animation.
- **Full keyboard nav** with a visible `sky-400` focus-visible ring (2px, 8.33:1) on all controls.
- **Screen reader.** The 24h bar carries `role="img"` + summarizing `aria-label`; decorative imagery `aria-hidden`; native date/number/select and `<details>` for free semantics.
- **Not color alone.** Tier badges encode meaning by shape (`●`/`◐`) + text; amber-not-red for warnings.
- **Public accessibility statement** page documenting conformance, known gaps, and contact.

## Scope — MVP
- Verified AA contrast across all text/states; 44px targets; focus rings; reduced-motion; screen-reader labels on the signature bar; shape+text tier badges.
- Published accessibility statement.

## Scope — later
- Optional extra-dim / true-black "night" theme for OLED and dark-adapted eyes.
- User text-scaling / larger-tap-target preference.
- Third-party audit and WCAG 2.2 AA conformance report (VPAT-style).

## Edge cases & gotchas
- Contrast on the dark slate surface is easy to fail — verify every state (in-range emerald, out-of-range amber, muted meta), don't assume.
- Dense citation-list links carry the WCAG 2.2 AA 24px minimum target, not the app's 44px control standard — a deliberate trade documented in the accessibility statement's known gaps.
- Reduced-motion must cover the 24h-bar transitions, not just page fades.
- Native controls give free accessibility but must keep visible focus in the dark theme.
- Screen-reader users need the day arc's meaning in text, since color/shape are visual.

## Evidence & citations
FEATURE-INDEX F08 (Confirmed gap, P0, MVP). PRODUCT Accessibility & Inclusion and DESIGN color/contrast rules (Muted Floor, One Accent, Amber-Not-Red, tier shape-encoding). WCAG 2.2 AA as the stated target.

## Effort
Medium, but front-loaded — cheaper built-in than retrofitted; much is already specified in DESIGN.

## Risks / open questions
- Ongoing regression risk: every new component must be re-checked for AA.
- Scope of a formal external audit vs. self-assessment for the statement.

## Success metric
Zero AA contrast/keyboard failures in automated + manual audit; published accessibility statement live.

## Related features
G03 (anti-anxiety mechanics), A02 (24h bar), B01 (tier badges), F07 (offline), and every UI feature (accessibility is cross-cutting).
