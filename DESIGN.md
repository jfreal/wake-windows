---
name: Wake Windows
description: A calm, cited nap-schedule planner for parents of infants — four screens on warm paper, built for tired thumbs.
colors:
  paper: "#F6F0E6"        # the page
  paper-sunk: "#EFE7DA"   # a track or an inset well (the day strip, the sheet's math block)
  card: "#FFFDF9"         # panels — LIGHTER than the page, not darker
  line: "#E3D9CB"         # hairline dividers and card borders
  line-strong: "#C9B7A2"  # the one heavier divider; card border on hover
  ink: "#2A2320"          # emphasis text, numerals (13.9:1 on paper)
  ink-body: "#3D352F"     # default body text (10.5:1)
  muted: "#6E635C"        # labels, meta, notes — the quietest text allowed (5.01:1 on paper, 5.65:1 on card)
  decorative: "#AC9F92"   # non-text only (2.9:1); forbidden for real text
  accent: "#A9502F"       # terracotta — links, expanders, focus ring (4.76:1) AND the filled surface (white on it, 5.45:1)
  accent-hover: "#8E4A2E" # link hover, and the primary fill's DARKER hover (6.58:1)
  accent-on: "#7A3C24"    # ink of a pressed toggle on the accent/10 wash
  on-fill: "#FFF7EF"      # text on a terracotta or night fill
  wake: "#C7A470"         # day strip: awake (sun)
  night: "#4E5570"        # day strip: night sleep (moon). Also the "asleep" hero surface.
  nap: "#A9502F"          # day strip: naps (baby). Same value as the accent — see §2.
  in-range: "#3D6350"     # a "You" value inside the guidance range (5.94:1)
  out-range: "#7F5D2C"    # a "You" value outside range + all warnings (5.20:1). Amber-brown, never red.
  safe: "#35594A"         # Safe-sleep panel heading
  tier1: "#3D6350"        # evidence-based badge
  tier2: "#7F5D2C"        # practice-based heuristic badge
  tier3: "#6E635C"        # practitioner convention — deliberately a NEUTRAL, not a hue (see §2)
typography:
  display:
    fontFamily: "Faustina, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.125rem, 4vw, 3.75rem)"
    fontWeight: 500
    lineHeight: 1.15
    fontFeature: "tabular-nums"
  body:
    fontFamily: "'Hanken Grotesk Variable', Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Hanken Grotesk Variable', Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
    fontFeature: "uppercase"
  meta:
    fontFamily: "'Hanken Grotesk Variable', Inter, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  badge:
    fontFamily: "'Hanken Grotesk Variable', Inter, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: "0.875rem"   # 14px — buttons are pills, fields and callouts are soft
  lg: "1.25rem"    # 20px — panels
  2xl: "1.75rem"   # 28px — the hero, the sheet
  full: "9999px"   # every button, every chip, the day strip, the log toggle
spacing:
  field: "0.625rem"
  panel: "1rem"
  section: "1.5rem"
controlHeight: "2.75rem"  # 44px. Every button, toggle, chip, input and select. Not negotiable.
elevation:
  lift: "0 14px 30px -14px rgba(42,35,32,.45)"   # the hero, the log toggle
  sheet: "0 -18px 44px -20px rgba(42,35,32,.5)"  # the evidence sheet / drawer
components:
  # These live as real CSS classes in src/style.css (@layer components), not as
  # utility strings repeated at each call site — see "The One Sizing Place Rule".
  card:                # .card — bg card, 1px line border, radius lg
    backgroundColor: "{colors.card}"
    borderColor: "{colors.line}"
    rounded: "{rounded.lg}"
  eyebrow:             # .eyebrow — the one section label in the app
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  display:             # .display — Faustina, tabular numerals
    typography: "{typography.display}"
  field:               # .field — input / select / textarea
    backgroundColor: "#E5DBCC"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    minHeight: "{controlHeight}"
  button-quiet:        # .btn .btn-quiet — the default button. Almost everything.
    backgroundColor: "#E5DBCC"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    minHeight: "{controlHeight}"
  button-primary:      # .btn .btn-primary — starts something.
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    minHeight: "{controlHeight}"
  button-inline:       # .btn-inline — text-weight button that reads as a link
    textColor: "{colors.accent}"
    typography: "{typography.meta}"
    minHeight: "{controlHeight}"
  tier-badge:          # TierBadge.vue — pill, tier ink on a 12% wash of itself
    rounded: "{rounded.full}"
    typography: "{typography.badge}"
    padding: "0.125rem 0.5rem"
---

# Design System: Wake Windows

## 1. Overview

**Creative North Star: "The Night-Feed Companion"**

Wake Windows answers one question — *when does the baby sleep next* — for a parent holding a
phone in one hand at 3am. The whole system is tuned for that moment: warm paper that reads as
calm rather than clinical, a single countdown as the largest thing on screen, and everything
else demoted behind it. It is a tool, not a brand experience; it should disappear into the task
and get out of the way. Authority comes from cited, tiered sources, never from decoration or
tone. The voice is plain and unalarmed: a parent who is already worried must never be made to
feel they are failing.

**The app is four screens, and the split is the design.**

| Screen | What it holds |
| --- | --- |
| **Today** | The countdown, the day strip, the plain-language reassurance note, the day as a list, and the three normal-range bands. |
| **Log** | One enormous asleep/awake toggle, then the corrections, then the week. |
| **Learn** | Every cited guidance panel, as a topic library. Reading one changes nothing about your plan. |
| **Settings** | The plan's inputs, the ways it leaves this device, and the promises about what does not. |

This replaced a single ~25-panel scroll in which the schedule, the log, fourteen guidance
panels and the policy stances all sat at the same level. The countdown a parent came for
arrived at the same visual weight as the tier explainer. Nothing was deleted in the move —
it was ranked.

Density is deliberately low. Color is restrained: one terracotta accent for anything
interactive, with one earned exception — the warm-to-cool **day arc** of the day strip
(sun → nap → night, read as literal time-of-day) — and the emerald **Safe-sleep** panel, the
one surface allowed a tint because its content is non-negotiable.

This system explicitly rejects the **generic baby-app pastel** aesthetic — no pastel-pink/blue,
no rounded-blob nursery stickers, no cartoon flourish. Warmth is carried by paper tone and
restraint, not by decoration. It equally rejects the **cold medical dashboard** (no gray-on-gray
EHR density, no alarm-red), **anxious/alarmist framing** (out-of-range reads calm and
informational, never red and scolding), and **generic SaaS scaffold** (no hero-metric template,
no identical card grids, no gradient text).

**Key Characteristics:**
- Warm paper, light. Cards are *lighter* than the page, and every surface break carries a hairline.
- One countdown, above everything, on every visit.
- Restrained color: one terracotta accent; semantic colors earn their place.
- Evidence forward: every recommendation carries a tier badge, and every number opens a sheet
  that shows the arithmetic on the parent's own figures.
- Amber-brown, not red. Out-of-range informs; it does not alarm.

## 2. Colors

Warm paper carrying dark ink, one terracotta accent, and a small vocabulary of semantic colors
that only appear where they mean something.

**How the palette is applied.** The tokens above are wired into Tailwind's `slate`, `sky`,
`orange`, `cyan` and `violet` scales in `src/style.css`, because the roles those names carried
were always semantic — "body", "surface one step up", "emphasis ink", "the interactive family".
The slate ramp is inverted end to end: `slate-900` is the lightest value now and `slate-100` the
darkest. That is why the theme change is one file rather than four hundred edits across forty
templates, and why `bg-slate-800` still means "the surface one step up from the page" wherever
it appears.

### Primary
- **Terracotta** (`#A9502F`): The single interactive family. Links, expanders, the focus ring,
  the one primary fill, and the pressed-toggle wash. Hover **darkens** to `#8E4A2E` in both
  directions — as link ink it goes darker, and as a fill it goes darker too, because white on
  a lighter terracotta fails AA.

### Secondary — The Day Arc
The day strip's three colours, read left to right as literal time-of-day. Warm to cool.
- **Waking Sun** (`#C7A470`): Awake time. Paired with the sun icon.
- **Nap Terracotta** (`#A9502F`): Daytime naps. Paired with the sleeping-baby icon.
- **Night** (`#4E5570`): Night sleep. Paired with the moon icon. Also the surface of the hero
  and the log toggle while the baby is asleep.

### Tertiary — Semantic & Evidence
- **In-Range Green** (`#3D6350`): A value inside the published range.
- **Out-of-Range Amber-Brown** (`#7F5D2C`): A value outside range, and every warning.
  Deliberately not red. Warnings sit on a 10% wash of the same colour.
- **Safe Green** (`#35594A`): Heading of the Safe-sleep panel — the one tinted surface.
- **Tier 1 Green** (`#3D6350`) / **Tier 2 Amber-Brown** (`#7F5D2C`) / **Tier 3 Neutral**
  (`#6E635C`). Tier 3 has no hue on purpose: green reads "backed", amber-brown reads "take as
  an estimate", and a plain neutral reads "this is just what practitioners do", claiming
  nothing. It also keeps a third hue out of a restrained palette.

### Neutral
- **Paper** (`#F6F0E6`): The page.
- **Paper Sunk** (`#EFE7DA`): A track or an inset well — the day strip's groove, the "your
  numbers" block inside a sheet.
- **Card** (`#FFFDF9`): Panels. On paper a panel is lighter than the page, which is the
  opposite of the dark theme this replaced and the reason every card also needs its border.
- **Line** (`#E3D9CB`) / **Line Strong** (`#C9B7A2`): Hairlines, and the one heavier divider.
- **Ink** (`#2A2320`, 13.9:1) → **Body Ink** (`#3D352F`, 10.5:1) → **Muted** (`#6E635C`).
- **Decorative** (`#AC9F92`): Non-text only. 2.9:1 — forbidden for real text.

### Named Rules

**The One Accent Rule.** Terracotta is the only interactive family. If it is terracotta ink,
you can press it; if you can press it, it is terracotta.

**Nap is the accent, and that is deliberate.** In the dark theme the day-arc colours were
forbidden from ever becoming interaction states, because `violet` meant "nap" and nothing else.
Here nap and accent are the same value, and the equivalence is the point: terracotta means
*sleep is the thing happening or the thing to do* — the nap band on the strip, the hero while
the baby is awake, the log toggle, the nap dot in the day list. The rule that survives is the
narrower one: **`#C7A470` wake and `#4E5570` night are never interaction states.** They are
blocks of the day, everywhere, always.

**The Amber-Not-Red Rule.** Out-of-range and warning states are `#7F5D2C`, never red. A tired
parent reading their plan must be informed, not alarmed. Red is forbidden in this system —
including for a Stop button, which is not destructive: raise the surface tone instead and let
position and label carry the weight.

**The Muted Floor Rule.** `#6E635C` is the floor for real text, and it is legal on *both* the
paper body (5.01:1) and a card (5.65:1) — which is why this theme needs one muted shade where
the dark one needed two. The handoff palette's `#8A7C70` is **not** in this system: it measures
3.48:1 on paper, and this app publishes an accessibility statement claiming AA. Anything at or
below `#AC9F92` is decorative only.

**A colour is only "verified" against the surface it lands on.** Every tier ink, every muted
shade, every ink on a filled surface has been measured on *each* surface it renders on. This is
also why the filled accent is `#A9502F` rather than the handoff's lighter `#C46B4C`: white on
that measures 3.83:1, so it can carry a 60px numeral and nothing else.

## 3. Typography

**Display:** Faustina — headings, screen titles, and every large numeral.
**UI / body:** Hanken Grotesk — everything else.

Both are **self-hosted** (`@fontsource`), never loaded from Google. This app is an offline-first
PWA whose whole pitch is that nothing about your baby leaves the phone; a `fonts.gstatic.com`
link would break the offline shell *and* hand a third party an IP address on every open.

`tabular-nums` on all figures so schedule times and ranges stay column-aligned as they change.

### Hierarchy
- **Countdown** (Faustina 500, `text-6xl`): The hero figure. The loudest type in the app, and
  the only thing at that size.
- **Screen / article title** (Faustina 500, `text-3xl`).
- **Panel heading** (Faustina 500, `text-lg`).
- **Body** (400, `text-sm`, line-height 1.5): The default.
- **Eyebrow** (`.eyebrow` — 400, `text-xs`, UPPERCASE, `tracking-[0.14em]`): Section headers.
- **Meta** (400, `text-xs`): Hints, source notes, the disclaimer.
- **Badge** (500, `text-[11px]`): Tier badge text only.

### Named Rules

**The One Section Label Rule.** `.eyebrow` is the sectioning device, and it is the *only* one.
Tracked uppercase is now correct — on paper, a tracked small label is what separates a section
from the prose above it — but there is exactly one such treatment and it lives in one class.
The dark theme's rule forbidding tracking existed because an untracked uppercase label was
already doing this job; adding a tracked variant would have created a second device. The
underlying rule is unchanged: **one sectioning device, not two.**

**The Tabular Rule.** Every number the user reads against another number uses `tabular-nums`.
Non-negotiable; misaligned digits read as sloppy.

## 4. Elevation

Three elevations, and no others:

| Token | Where |
| --- | --- |
| flat + hairline | Every card. Tone alone is enough one step from the page. |
| `--shadow-lift` | The Today hero and the Log toggle — the two things that float above their screen. |
| `--shadow-sheet` | The evidence sheet / drawer, which is genuinely over the page. |

### Named Rule
**The Earned Shadow Rule.** A shadow means "this layer is above the page", and only two things
in the app are. Everywhere else, separate surfaces with tone and a hairline. This is a real
change from the dark theme's absolute no-shadow rule: on a dark surface a shadow is invisible,
so tone was the only tool; on paper a soft shadow is the legible way to say "modal". It is a
vocabulary of three, not a licence. Glassmorphism and blur are still forbidden.

## 5. Components

The component feel is **sturdy and reassuring**: clear affordances, generous tap targets for
tired hands, dependable and quiet. Nothing tactile-loud, nothing that reinvents a standard
control.

Every control class in this section is a real CSS class in `src/style.css` (`@layer
components`), not a utility string copied around the templates.

### Inputs / Fields — `.field`
Warm fill, ink text, `rounded-sm`, full-width, `min-h-11`. Native `<input type="date/number/
datetime-local">`, `<select>` and `<textarea>` — standard controls, not reinvented. A global
terracotta `focus-visible` ring (2px, 2px offset) applies to every interactive element.
Placeholders use the muted ink, set globally; never overridden per field.

### Buttons — `.btn` plus one weight
`.btn` carries the shared pill shape and the 44px height; a weight class carries the colour.

- **`.btn-quiet`** — the default, and almost everything. Warm fill, ink text.
- **`.btn-primary`** — where something actually starts. Terracotta fill with white, **darkening**
  on hover.
- **`.btn-inline`** — a text-weight button that reads as a link, padded to 44px without drawing
  a box.
- **`.btn-chip`** — pill toggle (the atypical-day reasons). Still 44px tall.
- **Toggles** (`aria-pressed`) build on `.btn` / `.btn-chip` and supply their own on/off colours.
  A pressed state is not a third weight.

### Named Rule
**The One Sizing Place Rule.** The 44px control height lives in `.btn` / `.btn-chip` / `.field`
and nowhere else. It is not `min-h-11` typed at each call site. This is not tidiness: when it
was per-call-site it had already drifted to 36px across six buttons in the sleep log and 26px on
the atypical-day chips, while the public accessibility statement still claimed 44px everywhere.
A standard repeated by hand is a standard that quietly stops being true. The e2e suite now
measures every control on **all four screens**, because the way this breaks is a new screen.

### Layout — one column, then two
Every screen is a single column on a phone and **two from `lg`**, in the same order, wrapped:

| Screen | Left | Right |
| --- | --- | --- |
| Today | hero, day strip, the ranges | the note, guidance, the schedule, what's logged |
| Log | the toggle + quick actions | the entries, then the week |
| Settings | the plan and what refines it | what acts on it, and the promises about it |

Learn is the exception: a card grid (`sm:2 / xl:3`), because sixteen full-width rows is a scroll
and sixteen cards is a library you can scan.

Nothing appears in one layout that is missing from the other. The two-column form exists so a
control does not grow to the width of a desk monitor — the Log toggle is a *target*, and a 900px
circle is not a better one.

### Navigation — `AppTabs`
One component in two layouts: a bar pinned to the bottom edge on a phone, and a full **sidebar**
from `md` up — card fill, right border, sticky and full height, carrying the mark, the nav, whose
plan this is, and the evidence link. Same list, same order, same labels either way; building a
separate desktop nav is how the two stop agreeing about what the app contains. Labels are
**always visible**; an icon-only tab bar is smaller and, at 3am, a guess. Marked up as a real
`<nav>` of buttons with `aria-current` on the open one, and a "Skip to content" link ahead of it.

On a wide screen the sidebar carries the brand mark and its `alt`, and the page header collapses
to its invisible `<h1>`. One mark on screen, not two.

### Signature — The Countdown Hero
The identity component. A `rounded-2xl` filled panel carrying, in order: a small uppercase
kicker with an icon, the countdown in Faustina at 60px, one sentence naming **both ends of the
window**, and a footer with "Where this time comes from" beside the one-tap sleep toggle. The
surface is terracotta while the baby is awake and night blue while asleep — the colour *is* the
state.

The figure counts down to when the window **opens**, and stops at zero rather than counting into
a deficit. A parent 20 minutes into a window is not late, and the app never says so.

### Signature — The Day Strip
Midnight to midnight, left to right, with a 3px marker for right now. It replaced a three-block
proportional bar that answered "how much of the day is nap/night/awake" — a question the stats
table already answered in words — while the question a parent has in a dark nursery is "where am
I in the day". Position carries that; proportion did not, and a nap at 9am and a nap at 4pm were
indistinguishable before.

Because segments are positional they can be a few pixels wide, so **nothing is ever written
inside a band**. The strip carries `role="img"` with an aria-label summarising the day, and the
**Sleep Stats** table directly below carries every figure the picture encodes. That is the
condition that lets the strip be a thin ribbon: *anything the picture shows must exist as text
nearby.*

### Signature — The Evidence Sheet
One modal surface, opened from anywhere: a bottom sheet on a phone, a right-hand drawer from `sm`
up, same markup either way. It carries the tier badge, plain-language reasoning, **the arithmetic
on the user's own numbers**, and the citation with a working link. Every number on Today is a
button that opens it.

This is what lets the home screen be short: fourteen always-open explainer panels became one
sheet with fourteen things to say. It is honestly modal — `aria-modal`, Escape closes, the
backdrop closes, focus moves in on open and back to the trigger on close.

The dismiss differs by form, and only because the form differs: the phone sheet is short, so the
"Got it" button at the end of it is the natural exit; the drawer is a full-height scroll, so it
needs a `×` that is always in view. Neither is decoration, and there is never both.

### The "why?" chip — `TierWhyButton`
`◐ Tier 2 · why?` beside a section heading: the badge and the explainer trigger as one control.
A tier badge next to a heading was already a claim about the evidence under it, so making that
same pill the button that opens the reasoning means nobody has to learn that the badge is one
thing and the ⓘ beside it is another.

**The pill is 22px and the button is 44px.** Those are not in conflict — the target is the
transparent box around the pill. Shrinking the target to match the badge would have been the easy
version and the 44px rule broken quietly.

### Lists that edit — the Edit affordance
The Log screen lists what happened; the means of changing it is a control, not a permanent form.
Three logged naps used to render six datetime fields, which is a form pretending to be a record.
Every row still shows everything — kind, length, clock times, running state — and **only the
means of changing it** sits behind `Edit`. Same rule in Settings, from the other side: the plan
inputs are a settings *list* (label + one-line purpose left, control right-aligned, one hairline
row each), so the plan can be read back without reading a form.

### Signature — The Tier Badge
A pill: tier ink on a 12% wash **mixed from that same ink**, so a tier can never end up with a
tint that does not match its text. It encodes tier by **shape as well as colour** — a solid `●`
for Tier 1, a half `◐` for Tier 2, a hollow `○` for Tier 3 — so it survives colour-blindness.
Never distinguish tiers by colour alone.

## 6. Do's and Don'ts

### Do:
- **Do** keep terracotta as the only interactive family. If it's terracotta, you can press it.
- **Do** render out-of-range and warning states in `#7F5D2C`, framed as information a parent can
  act on calmly.
- **Do** attach a tier badge to every recommendation, and encode the tier by **shape (`●`/`◐`/`○`)
  as well as colour**.
- **Do** put every number behind an evidence sheet that shows the arithmetic on the user's own
  figures. "No AI" is a claim you have to be able to *demonstrate*.
- **Do** give every card a hairline. On paper, a lighter fill alone is not a boundary.
- **Do** use `text-muted` (`#6E635C`) as the floor for real text, on any surface.
- **Do** measure a colour against **every surface it lands on**.
- **Do** use `tabular-nums` on every figure the user compares against another.
- **Do** size controls with `.btn` / `.btn-chip` / `.field`. (The One Sizing Place Rule.)
- **Do** make sure anything the day strip encodes still exists as text nearby.
- **Do** ask which of the four screens a new panel belongs to before building it. If the answer
  is "Today", ask again — Today is the countdown and the day, and nothing else.
- **Do** give a small control a 44px transparent target rather than making the visible thing
  bigger. Badge-sized is a look; tap-sized is a rule.
- **Do** put editing behind a control on a screen whose job is to *show*. A list that renders a
  form per row is a form.

### Don't:
- **Don't** introduce **generic baby-app pastel** — no pastel-pink/blue, no nursery-blob shapes,
  no cartoon stickers. Warmth comes from paper tone, not decoration.
- **Don't** use **red** anywhere — not even for Stop. (The Amber-Not-Red Rule.)
- **Don't** let `#C7A470` wake or `#4E5570` night become an interaction state. Those two mean a
  block of the day, everywhere, always.
- **Don't** use `#8A7C70` or anything at or below `#AC9F92` for real text — they fail AA on
  paper. (The Muted Floor Rule.)
- **Don't** use the lighter terracotta `#C46B4C` under white text: it measures 3.83:1.
- **Don't** add a shadow to anything that is not floating above the page. Three elevations, and
  the third is the modal sheet. (The Earned Shadow Rule.)
- **Don't** add a second sectioning device. `.eyebrow` is it.
- **Don't** load a webfont from a CDN. Self-host or use the fallback stack — offline and privacy
  are both product promises here.
- **Don't** ship **generic SaaS scaffold**: no hero-metric template, no identical card grids, no
  gradient text.
- **Don't** nest a card in a card in a card. A disclosure replaces the content in its frame; set
  a sub-block off with a rule and a label, not a third box.
- **Don't** reinvent standard controls — keep native date/number/select and `<details>`.
- **Don't** let a panel rebuild its own copy of the plan, the log, or the open tab from
  `window.location` / `localStorage`. There is one reactive plan (`stores/plan.ts`), one log
  (`stores/sleepLog.ts`), one tab (`stores/tabs.ts`) and one sheet (`stores/sheet.ts`). A private
  copy goes stale silently, which is how the calendar export came to ship the plan as it was at
  page load.
