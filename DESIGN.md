---
name: Wake Windows
description: A calm, cited nap-schedule planner for parents of infants — a dark-room utility built for tired thumbs.
colors:
  bg: "#0f172a"          # slate-900 — body / app surface
  surface: "#1e293b"     # slate-800 — inputs, callout tints, panel fills
  border: "#1e293b"      # slate-800 — hairline dividers (default)
  border-strong: "#334155" # slate-700 — the one heavier divider (Total Sleep row)
  ink: "#e2e8f0"         # slate-200 — emphasis text, list copy
  ink-body: "#cbd5e1"    # slate-300 — default body text
  ink-label: "#94a3b8"   # slate-400 — section labels, field labels (6.96:1 on bg)
  muted: "#7c899e"       # accessible muted text ON THE BODY — meta, notes, footnotes (5.04:1 on bg)
  muted-raised: "#8894a9" # the same role on a slate-800 panel (4.78:1 there; plain muted is only 4.13:1)
  decorative: "#64748b"  # slate-500 — non-text only (link underlines, glyphs); fails AA as text
  accent: "#38bdf8"      # sky-400 — links, expanders, the only interactive accent
  accent-hover: "#7dd3fc" # sky-300 — link/expander hover
  accent-fill: "#0369a1" # sky-700 — the one primary button fill (5.93:1 with white)
  accent-fill-hover: "#075985" # sky-800 — primary hover DARKENS (sky-600 + white = 4.1:1, fails)
  accent-on: "#bae6fd"   # sky-200 — text of a pressed toggle on the sky-400/10 on-state fill
  wake: "#f97316"        # orange-500 — 24h bar: awake time (sun)
  night: "#06b6d4"       # cyan-500 — 24h bar: night sleep (moon)
  nap: "#8b5cf6"         # violet-500 — 24h bar: naps (baby). NEVER an interactive state.
  in-range: "#34d399"    # emerald-400 — "You" value inside the guidance range
  out-range: "#fbbf24"   # amber-400 — "You" value outside range + all warnings
  safe: "#6ee7b7"        # emerald-300 — Safe-sleep panel heading
  tier1: "#27b06a"       # evidence-based badge (border + text); 6.38:1 on bg, 5.23:1 on slate-800
  tier2: "#c9940c"       # practice-based heuristic badge; 6.57:1 on bg, 5.38:1 on slate-800
  tier3: "#94a3b8"       # practitioner convention — deliberately a NEUTRAL, not a hue (see §2)
typography:
  body:
    fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  stat:
    fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
    fontFeature: "uppercase"
  meta:
    fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.4
  badge:
    fontFamily: "Inter, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: "0.25rem"
  lg: "0.5rem"
spacing:
  field: "0.625rem"
  panel: "0.75rem"
  section: "1.5rem"
controlHeight: "2.75rem"  # 44px. Every button, toggle, chip, input and select. Not negotiable.
components:
  # These five live as real CSS classes in src/style.css (@layer components), not
  # as utility strings repeated at each call site — see "The One Sizing Place Rule".
  field:               # .field — input / select / textarea
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0.625rem"
    minHeight: "{controlHeight}"
  button-quiet:        # .btn .btn-quiet — the default button. Almost everything.
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 1rem"
    minHeight: "{controlHeight}"
  button-primary:      # .btn .btn-primary — starts something. Two uses, total.
    backgroundColor: "{colors.accent-fill}"
    textColor: "#ffffff"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 1rem"
    minHeight: "{controlHeight}"
  button-inline:       # .btn-inline — text-weight button that reads as a link
    textColor: "{colors.accent}"
    typography: "{typography.meta}"
    minHeight: "{controlHeight}"
  tier-badge-1:
    textColor: "{colors.tier1}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.375rem"
  tier-badge-2:
    textColor: "{colors.tier2}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.375rem"
  tier-badge-3:
    textColor: "{colors.tier3}"
    typography: "{typography.badge}"
    rounded: "{rounded.sm}"
    padding: "0.125rem 0.375rem"
  safe-sleep-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.75rem"
---

# Design System: Wake Windows

## 1. Overview

**Creative North Star: "The Night-Feed Companion"**

Wake Windows is a quiet dark-room utility for a sleep-deprived parent holding a phone
in one hand at 3am. The whole system is tuned for that moment: a deep slate surface
that won't scorch dark-adapted eyes, low-glare quiet ink, and a single clear reading —
the schedule and the 24-hour bar — sitting above everything else. It is a tool, not a
brand experience; it should disappear into the task of "when does the baby nap next,"
then get out of the way. Authority comes from cited, tiered sources shown in-line, never
from decoration or tone. The voice is plain and unalarmed: a parent who is already worried
must never be made to feel they are failing.

Density is deliberately low. One narrow column of inputs on the left, the day's readout on
the right, generous vertical rhythm (`1.5rem` between sections) so nothing crowds. Color is
Restrained by default — a single `sky-400` accent for anything interactive — with two earned
exceptions: the warm-to-cool **day arc** of the 24-hour bar (orange wake → cyan night → violet
nap, read as literal time-of-day, not decoration) and the emerald **Safe-sleep** panel, the
one surface allowed to carry a tint because its content is non-negotiable.

This system explicitly rejects the **generic baby-app pastel** aesthetic — no cutesy
pastel-pink/blue, no rounded-blob nursery stickers, no cartoon flourish. Warmth is carried by
tone and restraint, not by decoration. It equally rejects the **cold medical dashboard**
(no gray-on-gray EHR density, no alarm-red), **anxious/alarmist framing** (out-of-range reads
amber and informational, never red and scolding), and **generic SaaS scaffold** (no hero-metric
template, no tracked-uppercase eyebrow on every section, no identical card grids, no gradient text).

**Key Characteristics:**
- Deep slate dark theme, tuned for a dark room and one-handed phone use.
- Restrained color: one `sky-400` accent; semantic colors (emerald/amber) earn their place.
- Flat by default — depth from tonal layering + hairline borders, never shadows.
- Evidence forward: every recommendation carries a Tier 1/2 badge and cited sources.
- Amber, not red. Out-of-range informs; it does not alarm.

## 2. Colors

A deep-slate dark palette carrying quiet ink, one sky accent, and a small vocabulary of
semantic colors that only appear where they mean something.

### Primary
- **Sky Signal** (`#38bdf8`, sky-400): The single interactive accent. Links, source expanders,
  and the "↗" out-links. Hover lifts to **Sky Signal Light** (`#7dd3fc`, sky-300). It appears
  nowhere decorative — if it is `sky-400`, it is something you can click.

### Secondary — The Day Arc
The 24-hour bar's three segments, read left to right as literal time-of-day. Warm to cool.
- **Waking Sun** (`#f97316`, orange-500): Awake time. Paired with the sun icon.
- **Night Cyan** (`#06b6d4`, cyan-500): Night sleep. Paired with the moon icon.
- **Nap Violet** (`#8b5cf6`, violet-500): Daytime naps. Paired with the sleeping-baby icon.

### Tertiary — Semantic & Evidence
- **In-Range Emerald** (`#34d399`, emerald-400): A "You" value that falls inside the guidance range.
- **Out-of-Range Amber** (`#fbbf24`, amber-400): A "You" value outside range, and every warning.
  Deliberately amber, never red. Warnings sit on a 10% amber wash (`bg-amber-400/10`).
- **Safe Emerald** (`#6ee7b7`, emerald-300): Heading of the Safe-sleep panel, on an
  `emerald-900/15` fill inside an `emerald-700/50` hairline — the one tinted surface.
- **Tier 1 Green** (`#27b06a`): Evidence-based badge, border + text. 6.38:1 on the body and
  5.23:1 on a slate-800 panel — badges appear on both, so both have to clear AA at 11px.
- **Tier 2 Goldenrod** (`#c9940c`): Practice-based heuristic badge, border + text. 6.57 / 5.38:1.
- **Tier 3 Neutral** (`#94a3b8`, slate-400): Practitioner convention — the weakest tier, and the
  only one with no hue. That is the point: green reads "backed", goldenrod reads "take as an
  estimate", and a plain neutral reads "this is just what practitioners do", claiming nothing.
  It also keeps a third hue out of a Restrained palette. (It replaced `#d06848`, which was both
  undocumented and an orange-red — the one colour this system forbids — and which measured
  4.01:1 on slate-800 panels.)

### Neutral
- **App Slate** (`#0f172a`, slate-900): The body / app background. The dark room.
- **Surface Slate** (`#1e293b`, slate-800): Input fields, panel fills, and every default
  hairline divider. One step up from the body.
- **Divider Slate** (`#334155`, slate-700): The single heavier divider — the "Total Sleep" total row.
- **Ink** (`#e2e8f0`, slate-200): Emphasis and list copy. (14.5:1)
- **Body Ink** (`#cbd5e1`, slate-300): Default body and data text. (12:1)
- **Label Ink** (`#94a3b8`, slate-400): Section and field labels. (6.96:1)
- **Muted Ink** (`#7c899e`): Meta, notes, ranges, footnotes — the quietest *text* allowed
  **on the body**. (5.04:1) Exposed as the `text-muted` utility.
- **Muted Ink Raised** (`#8894a9`): The same role on a `slate-800` panel. (4.78:1 there, 5.83:1
  on the body.) Exposed as `text-muted-raised`.
- **Decorative Slate** (`#64748b`, slate-500): Non-text only — link-underline color, `↗` glyphs.
  Measures 3.75:1, so it is **forbidden for real text**; use `text-muted` instead.

### Named Rules
**The One Accent Rule.** `sky` is the only interactive family — `sky-400` for links and
expanders, `sky-700` for the one filled primary button, `sky-400/10` + `sky-200` for a pressed
toggle. If something is sky, you can press it; if you can press it, it is sky. Never decorative.

The corollary matters as much: **the day-arc colours never become interaction states.**
`violet-500` means "nap", a literal block of the day, everywhere it appears — the 24-hour bar,
the sibling tracks, the DST strip, the sparkline, the nap/night label on a log entry. A violet
"this toggle is on" gives one colour two jobs, and it is the mistake this rule exists to catch.

**The Amber-Not-Red Rule.** Out-of-range and warning states are amber (`#fbbf24`), never red.
A tired parent reading their plan must be informed, not alarmed. Red is forbidden in this system
— including for a Stop button, which is not destructive: raise the surface tone instead
(`slate-700` on `slate-800`) and let position and label carry the weight.

**The Muted Floor Rule.** Quiet text has two shades because it sits on two surfaces.
`text-muted` (`#7c899e`) is the floor on the `slate-900` body at 5.04:1; on a `slate-800` fill
it drops to 4.13:1 and **`text-muted-raised` (`#8894a9`, 4.78:1) is the floor instead**. On a
`slate-700` fill neither clears AA — use `slate-300`. `slate-500` and below (slate-500 = 3.75:1,
slate-600 = 2.36:1) fail everywhere and are prohibited for real text; `slate-500` survives only
as a decorative underline / glyph colour. This applies to placeholders too — the global
`::placeholder` rule in `style.css` is slate-400, and no field may override it downward.

**A colour is only "verified" against the surface it lands on.** Every tier badge, every muted
shade, every pressed-toggle ink in this system has been measured on *each* surface it renders
on, not just on the body. A token that passes at 5:1 on `slate-900` can be at 4.0:1 one panel up.

## 3. Typography

**Body Font:** Inter (with Avenir, Helvetica, Arial, sans-serif fallback)

**Character:** One humanist sans doing all the work — headings, labels, data, body. No display
pairing; a product tool does not need one. `tabular-nums` on all figures so schedule times and
ranges stay column-aligned as they change.

### Hierarchy
- **Stat** (bold 700, 1.25rem / `text-xl`): The schedule shorthand and the 24-hour bar's hour
  figures. The loudest type in the app, and it is still only 20px.
- **Body** (400, 0.875rem / `text-sm`, line-height 1.5): The default. List copy, table cells,
  nap-schedule rows, guidance values. Prose capped at ~65–75ch (the `max-w-3xl` column).
- **Label** (400, 0.875rem / `text-sm`, UPPERCASE): Section headers ("Summary", "Sleep Stats",
  "Nap Schedule") and field labels. Uppercase **is** the sectioning device — see the rule below.
- **Meta** (400, 0.75rem / `text-xs`): Age ranges, source notes, tier explainers, disclaimer.
- **Badge** (medium 500, 0.6875rem / `text-[11px]`, line-height 1): Tier badge text only.

### Named Rules
**The Uppercase-Is-The-Section Rule.** Small uppercase `slate-400` labels are the section
rhythm of this app and are already load-bearing. Because they exist, adding a second eyebrow —
a tracked all-caps kicker above them — is forbidden. One sectioning device, not two.

That includes sub-labels *inside* panels ("What changes", "Try this", "Where the category went
instead"). Uppercase is fine; **uppercase plus `tracking-wide` is not**, because letterspacing is
what turns a label into a kicker. There is exactly one uppercase treatment in this app, and
adding tracking to a handful of places quietly creates a second one.

**The Tabular Rule.** Every number the user reads against another number (`You` vs `Range`,
nap start–end times) uses `tabular-nums`. Non-negotiable; misaligned digits read as sloppy.

## 4. Elevation

Flat. There is not a single `box-shadow` in the system, and there should not be. Depth is
conveyed entirely by **tonal layering** — the `slate-800` surface sitting one step above the
`slate-900` body — and by hairline `slate-800` borders (`slate-700` for the one emphasized
total row). On a dark theme tuned for a dark room, shadows would be invisible anyway; a
lighter surface reads as "closer" far more legibly.

### Named Rules
**The No-Shadow Rule.** Surfaces are distinguished by tone and hairline borders, never by
shadow. If you reach for a `box-shadow` to separate two things, raise the surface tone or add a
`slate-800` border instead. Glassmorphism and blur are forbidden.

## 5. Components

The component feel is **sturdy and reassuring**: clear affordances, generous tap targets for
tired hands, dependable and quiet. Nothing tactile-loud, nothing that reinvents a standard control.

Every control class in this section is a real CSS class in `src/style.css` (`@layer components`),
not a utility string copied around the templates. See the sizing rule at the end of the section.

### Inputs / Fields — `.field`
- **Style:** `slate-800` fill, `slate-200` text, `text-sm`, `rounded-sm` (4px), `0.625rem`
  padding, full-width, `min-h-11`. Native `<input type="date/number/datetime-local">`, `<select>`
  and `<textarea>` — standard controls, not reinvented.
- **Focus:** A global `sky-400` `focus-visible` ring (2px, 2px offset) is applied to all
  interactive elements in `style.css` — 8.33:1 on the body. Placeholders use `slate-400`,
  set globally; never overridden per field.
- **Invalid:** A `peer-invalid` amber hint ("please enter a birthdate") appears below the field.
- **Disabled:** 50% opacity (`.field:disabled`).

### Buttons — `.btn` plus one weight
`.btn` carries the shared shape and the 44px height; a weight class carries the colour.

- **`.btn-quiet`** — the default, and almost everything: Copy sitter link, Add to calendar,
  Add past sleep, Pause/Resume/Delete, troubleshooter options, `+`/`−` step buttons (with
  `.btn-icon` for the 44×44 square). `slate-800` fill, `hover:slate-700`, `slate-200`.
  The app is input-driven and URL-persisted, so there is nothing to "submit".
- **`.btn-primary`** — the two places something actually *starts*: "Start sleep timer" and the
  service-worker "Refresh". `sky-700` fill with white (5.93:1), **darkening** to `sky-800` on
  hover, because white on `sky-600` measures 4.1:1 and fails. Two uses is the budget; a third
  means the hierarchy has stopped meaning anything.
- **`.btn-inline`** — a text-weight button that reads as a link (← Back, Sources (3), View
  breakdown). `sky-400`, underlined, padded out to 44px without drawing a box.
- **`.btn-chip`** — pill toggle (the atypical-day reasons). Still 44px tall; a pill is a shape,
  not a licence for a 26px target.
- **Toggles** (`aria-pressed`) build on `.btn` / `.btn-chip` and add their own on/off colours —
  on is `bg-sky-400/10 border-sky-400/50 text-sky-200` (11.3:1). A pressed state is not a third
  weight.
- **States honored:** default, hover, `focus-visible` (global sky-400 ring), `aria-pressed`, and
  `disabled` (40% opacity — the remove button disables at the last remaining window).

### Named Rule
**The One Sizing Place Rule.** The 44px control height lives in `.btn` / `.btn-chip` / `.field`
and nowhere else. It is not `min-h-11` typed at each call site. This is not tidiness: when it was
per-call-site it had already drifted to 36px across six buttons in the sleep log and 26px on the
atypical-day chips, while the public accessibility statement still claimed 44px everywhere.
A standard repeated by hand is a standard that quietly stops being true.

### Tables (Guidance comparison)
- **Style:** borderless except `border-t border-slate-800` between rows. Three columns:
  label + TierBadge, **You** (`emerald-400` in range / `amber-400` out), **Range** (`slate-400`).
  All figures `tabular-nums`, right-aligned.

### Panels / Callouts
- **Safe-sleep panel:** `rounded-sm`, `emerald-700/50` border, `emerald-900/15` fill, `slate-200`
  list copy, `emerald-300` uppercase heading + Tier 1 badge. The only tinted surface in the app.
- **Warning row:** `amber-400` text on `bg-amber-400/10`, `rounded-sm`, `⚠️` prefix. Informational, not alarming.
- **Sources & Evidence:** a native `<details>`/`<summary>` disclosure with a `slate-800` border. Standard, keyboard-accessible.

### Signature — The 24-Hour Bar
The identity component. A `flex h-10` row of three proportional segments (widths = each phase's
share of 24h): **Waking Sun** orange, **Night Cyan**, **Nap Violet**, left end `rounded-l-lg`,
right end `rounded-r-lg`. Each segment is itself `flex items-center justify-between` — icon left
(`sun.png` / `moon.png` / `sleeping-baby2.png`, `aria-hidden`), hour count right in **dark
`slate-950` text** (white failed on the bright segments). `slate-950` reads 7.2 / 8.3 / 4.58:1 on
orange / cyan / violet — i.e. it clears the full 4.5:1 body-text bar on all three, so the figure
stays legal at any size. `slate-900` was only legal at `text-xl` via the large-text exemption
(4.06:1 on violet), which silently became a failure the moment the figure stepped down to 14px.
The row carries `role="img"` with an `aria-label` summarizing the split, so the visualization has
a text alternative. This is the one place saturated color is not just allowed but required — it is
a data visualization of the day, read warm-to-cool as time-of-day.

**Each segment is its own `@container`**, and what it shows depends on how wide *that band* is,
not on the viewport — a 4h nap band is ~100px on a laptop and ~57px on a phone. It degrades in
steps rather than falling off a cliff: under 80px the decorative icon is dropped and the figure
steps down to `text-sm` and centres; only under 28px, where nothing legible fits, does the figure
go too. A band never renders a clipped number. Note the query measures the **content box**, so
those thresholds sit inside the `px-1.5` padding — a band whose border box is 57px is querying
45px, which is the kind of off-by-a-padding that makes a breakpoint fire one step early.

Nothing is lost when a band does go bare: the Sleep Stats table directly below carries all three
figures, and so does the `aria-label`. **Anything the bar can hide must exist in text nearby** —
that is the condition that makes hiding it acceptable.

The width transition is the one deliberate layout-property animation in the system: width *is*
the data, and scaling instead would distort the icon and the digits. Three boxes, one row,
300ms, input-driven — and `motion-safe:` only.

### Signature — The Tier Badge
An `inline-flex` pill: 1px border + text in the tier color (`#27b06a` Tier 1, `#c9940c` Tier 2,
`#94a3b8` Tier 3), `rounded-sm`, `text-[11px]`. Critically, it encodes tier by **shape as well as
color** — a solid `●` for Tier 1, a half `◐` for Tier 2, a hollow `○` for Tier 3 — so it survives
color-blindness. Never distinguish tiers by color alone. Badges render on the body *and* on
`slate-800` panels, so all three colours are verified against both.

## 6. Do's and Don'ts

### Do:
- **Do** keep `sky` as the only interactive family — `sky-400` links/expanders/focus rings, `sky-700` the one primary fill, `sky-400/10` + `sky-200` a pressed toggle. If it's sky, you can press it.
- **Do** render out-of-range and warning states in **amber** (`#fbbf24`), framed as information a parent can act on calmly.
- **Do** attach a tier badge to every recommendation, and encode the tier by **shape (`●`/`◐`/`○`) as well as color**.
- **Do** keep surfaces flat — separate them with tone (`slate-800` on `slate-900`) and hairline borders.
- **Do** keep the global `sky-400` `focus-visible` ring on every interactive element (applied in `style.css`) — required for WCAG 2.2 AA.
- **Do** keep body text at `slate-300` or lighter; use `text-muted` (`#7c899e`) as the floor on the body and `text-muted-raised` (`#8894a9`) as the floor on a `slate-800` panel.
- **Do** measure a colour against **every surface it lands on**, not just the body — one panel up can cost a full point of contrast.
- **Do** use `tabular-nums` on every figure the user compares against another.
- **Do** size controls with `.btn` / `.btn-chip` / `.field`, which carry the 44px height — never by typing `min-h-11` at the call site. (The One Sizing Place Rule.)
- **Do** make sure anything a responsive rule can hide (a 24-hour-bar figure, an icon) still exists as text nearby.

### Don't:
- **Don't** introduce **generic baby-app pastel** — no pastel-pink/blue, no nursery-blob shapes, no cartoon stickers. Warmth comes from tone, not decoration.
- **Don't** use **red** anywhere — not even for Stop. Out-of-range is amber; a "stop" is a raised slate tone. A worried parent must be informed, not alarmed. (The Amber-Not-Red Rule.)
- **Don't** let a day-arc colour (`orange-500` wake, `cyan-500` night, `violet-500` nap) become an interaction state. Those three mean a block of the day, everywhere, always. (The One Accent Rule.)
- **Don't** drift toward a **cold medical dashboard** — no gray-on-gray density, no clinical alarm styling.
- **Don't** add a **tracked-uppercase eyebrow** above the existing uppercase section labels, and don't add `tracking-wide` to a sub-label inside a panel — tracking is what makes a label a kicker. (The Uppercase-Is-The-Section Rule.)
- **Don't** ship **generic SaaS scaffold**: no hero-metric template, no identical card grids, no gradient text (`background-clip:text`).
- **Don't** add `box-shadow`, glassmorphism, or blur to convey depth — raise the tone or add a `slate-800` border. (The No-Shadow Rule.)
- **Don't** nest a card in a card in a card. A disclosure/answer replaces the content in its frame; set a sub-block off with a rule and a label, not a third box.
- **Don't** use `slate-500` or darker for real text anywhere, including as a per-field `placeholder:` override — it fails AA. (The Muted Floor Rule.)
- **Don't** use a colored `border-left`/`border-right` >1px as an accent stripe. (The former `border-l-2` source indent in EvidenceGuidance is now plain `pl-3` padding.)
- **Don't** reinvent standard controls — keep native date/number/select and `<details>`; the tool should disappear into the task.
- **Don't** let a panel rebuild its own copy of the plan or the sleep log from `window.location` / `localStorage`. There is one reactive plan (`stores/plan.ts`) and one reactive log (`stores/sleepLog.ts`); a private copy goes stale silently, which is how the calendar export came to ship the plan as it was at page load.
