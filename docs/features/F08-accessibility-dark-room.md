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
- **Low-glare, verified contrast.** Body text ≥4.5:1 against whatever it sits on — verified, not assumed. The 2026-08 redesign moved the app from a deep-slate dark surface to warm paper (`#F6F0E6`); the floor is now one muted ink, `#6E635C`, which clears AA on the page (5.01:1) *and* on a card (5.65:1). Anything at or below `#AC9F92` is decorative only. See DESIGN §2.
- **One-hand targets.** All interactive elements ≥44px, thumb-reachable. The bottom tab bar is the primary navigation on phones for exactly this reason.
- **Reduced motion.** `prefers-reduced-motion` honored on every animation.
- **Full keyboard nav** with a visible 2px terracotta focus-visible ring on all controls, and a "Skip to content" link ahead of the navigation on every screen.
- **Navigation is announced, not just coloured.** The four screens are a real `<nav>`; the open one carries `aria-current="page"`.
- **Screen reader.** The day strip carries `role="img"` + a summarizing `aria-label`; decorative imagery is `aria-hidden`; native date/number/select and `<details>` give free semantics. The evidence sheet is honestly modal — `aria-modal`, Escape closes, focus moves in on open and returns to the trigger on close.
- **Not color alone.** Tier badges encode meaning by shape (`●`/`◐`/`○`) + text; amber-brown, not red, for warnings.
- **Public accessibility statement** page documenting conformance, known gaps, and contact.

## Scope — MVP
- Verified AA contrast across all text/states; 44px targets; focus rings; reduced-motion; screen-reader labels on the signature bar; shape+text tier badges.
- Published accessibility statement.

## Scope — later
- Optional extra-dim / true-black "night" theme for OLED and dark-adapted eyes.
- User text-scaling / larger-tap-target preference.
- Third-party audit and WCAG 2.2 AA conformance report (VPAT-style).

## Edge cases & gotchas
- Contrast is easy to fail on *filled* surfaces — verify every state (in-range green, out-of-range amber-brown, muted meta, and any ink on a terracotta or night fill), don't assume. White on the lighter terracotta `#C46B4C` measures 3.83:1, which is why filled accents use `#A9502F`.
- Dense citation-list links carry the WCAG 2.2 AA 24px minimum target, not the app's 44px control standard — a deliberate trade documented in the accessibility statement's known gaps.
- The 44px floor now has to hold on **four** screens, not one page. The e2e suite measures every control on each of them, because the way this regresses is a new screen.
- Native controls give free accessibility but must keep visible focus; `color-scheme: light` keeps native pickers matching the page.
- Screen-reader users need the day strip's meaning in text, since color and position are visual. Because the strip is positional its bands can be a few pixels wide, so nothing is written inside one — the Sleep Stats table below carries every figure.

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
