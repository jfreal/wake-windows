# Feature Index — Wake Windows

**What this is:** the master map of every feature in scope, grounded in competitor coverage and real user feedback (app-store reviews, Reddit, forums). Each feature has its own doc in `/features` you can implement independently.

**Scope decision:** *Everything, including local-only tracking* — tracking/logging features are spec'd to run **on-device / no account**, staying true to the brand. You decide later what to actually build; this documents the full territory so nothing is skipped.

**Companion research:** `../research/00–05` (science, competitors, differentiators, feedback). Every science claim is tiered (T1 strong / T2 observational / T3 heuristic) and cited there.

---

## The brand filter — apply to every feature

Every doc is written against these five principles. If a feature can't be built within them, that's flagged in its doc.

1. **No account. Privacy-first.** Plan lives in the URL; tracking data lives on-device. No mandatory sign-up, no data sold, no data used to train anything.
2. **No black-box AI.** Predictions are transparent arithmetic + cited ranges. Decision-tree troubleshooting, not an LLM. "No AI" = no model trained on you.
3. **Ranges, not a stopwatch.** Show windows as ranges; no streaks, scores, or "you missed it" guilt. Out-of-range informs, never scolds.
4. **Show your work.** Every recommendation carries a Tier badge + citation. Trust is earned by transparency.
5. **It goes away when you're done.** No lock-in, no auto-renew. Funded by an optional tip jar. The tool has a job, does it, and lets you leave.

---

## What users actually said (the feedback that shaped this)

**Most-loved (do these well):** accurate, self-learning nap prediction; proactive *pre-nap* nudge (~30 min heads-up); fast one-hand/one-tap logging; "which side did I nurse last"; real-time multi-caregiver sync; daily totals at a glance; pediatrician-ready export; genuinely-free-with-no-tricks (Nara is praised for this).

**Most-hated (avoid these landmines):**
- **Paywalling previously-free features** via an update ("blatant cash grab") — Napper & Huckleberry's angriest reviews.
- **Billing traps:** charges after a glitchy cancel, no pre-renewal reminder, ignored refund emails → chargebacks, per-caregiver pricing, annual-only lock-in. *(Your tip jar sidesteps all of this — lean on it.)*
- **Broken caregiver sync** and can't-hand-off-a-running-timer.
- **The "midnight bug":** can't backdate an entry logged after 12:00am (Napper's single most-cited flaw).
- **Background timer stops** when you leave the app (Smart Sleep Coach).
- **Ad/upsell spam even to paid users** and **notification spam** (Glow).
- **Empty-tracker guilt:** blank "Tummy Time"/milestone sections make tired parents "feel like you're not doing enough." → hide unused trackers by default.
- **Rigid-schedule anxiety:** a countdown you can't meet is stressful. → ranges, not a clock.
- **Mandatory accounts + no offline mode** in hospitals/basements.

**Most-wished-for:** one-tap widget/Lock-Screen logging; Apple Watch app; voice/Siri logging; offline mode; editable/backdatable entries; per-caregiver logins (not shared password); daily totals on the home screen; a "report card" that *interprets* the data; native twins support with which-baby/which-side; a clean handover summary; privacy-first with no account.

---

## Feature catalog

Priority: **P0** = core/credibility · **P1** = strong differentiator · **P2** = later/optional.
Verdict: from the competitor fact-check (Confirmed gap / Partial / Table-stakes).

### A. Scheduling & Prediction Engine

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| A01 | Wake-window schedule generator (core) | P0 | Table-stakes (but free+no-account is the wedge) |
| A02 | 24-hour visual day breakdown | P0 | Table-stakes; Napper's "clock" is loved |
| A03 | Corrected / gestational-age adjustment | P0 | Partial gap (mostly preemie-only apps) |
| A04 | Cues-vs-clock mode by age | P1 | Confirmed gap (nobody frames it this way) |
| A05 | Bedtime calculator + preferred-bedtime cap | P1 | Partial gap (users beg to cap bedtime) |
| A06 | Nap-transition detector & guidance (4→3→2→1) | P1 | Partial gap |
| A07 | "Atypical day" / disruption flag | P1 | Confirmed gap (the #1 accuracy complaint) |
| A08 | DST & travel time-zone shift tool | P1 | Partial gap (only Hatch automates) |
| A09 | Sibling / twins schedule alignment | P1 | **Confirmed gap** (nobody aligns two schedules) |
| A10 | Personalized windows from local history (optional) | P2 | Table-stakes for leaders, but ours is no-account/no-AI |

### B. Guidance & Credibility Content

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| B01 | Evidence tier badges + inline citations | P0 | **Confirmed gap** (nobody cites transparently) |
| B02 | Methodology / sources page | P1 | Confirmed gap |
| B03 | AAP safe-sleep reference panel | P0 | Partial (Pampers does; most don't) |
| B04 | Sleepy-cues reference | P1 | Partial |
| B05 | Interactive sleep troubleshooter (decision tree) | P1 | Partial gap (others use AI chat, not free cited trees) |
| B06 | Regression / progression explainer | P2 | Partial |
| B07 | Sleep-training methods overview (neutral) | P2 | Table-stakes-ish |

### C. Tracking & Logging (local-only)

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| C01 | Sleep/nap logging (pausable, background-safe, editable) | P1 | Table-stakes; kill the midnight bug |
| C02 | Feeding log (nursing L/R, bottle, "which side last") | P1 | Table-stakes; a top delighter |
| C03 | Pumping log | P2 | Table-stakes |
| C04 | Diaper log | P2 | Table-stakes; don't force extra taps |
| C05 | Solids / meds / custom events | P2 | Common |
| C06 | Growth measurements + WHO/CDC percentiles | P2 | Common (Fenton for preemies) |
| C07 | Milestones / journal / photos | P2 | Common; keep optional (empty-tracker guilt) |

### D. Analytics & Insights

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| D01 | Trends & daily totals at a glance | P1 | Table-stakes; users beg for home-screen totals |
| D02 | Pediatrician-ready report / export (PDF/CSV/ICS) | P1 | Partial (CSV common, formatted PDF rarer) |
| D03 | Insights "report card" (interprets data, no AI) | P2 | Confirmed gap (users want interpretation, not just charts) |

### E. Sharing & Collaboration

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| E01 | Shareable plan URL | P0 | **Confirmed gap** (no web-share competitor) |
| E02 | Read-only babysitter / grandparent mode | P1 | Partial gap (schedulers only do full-access) |
| E03 | Caregiver handoff notes / summary | P1 | Partial gap (Pebbi owns it; combine w/ schedule) |
| E04 | Multi-caregiver access (local-first, per-person) | P1 | Partial (fixes shared-password gripe) |

### F. Utility & Integrations

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| F01 | Reminders & pre-nap nudges | P1 | Table-stakes; the ~30-min heads-up is loved |
| F02 | Home/Lock-Screen widgets + Live Activities | P1 | Most-wished-for; don't paywall it |
| F03 | Apple Watch / Wear OS companion | P2 | #1 single wished-for item |
| F04 | Voice / Siri Shortcuts logging | P2 | Wished-for (Robin's whole pitch) |
| F05 | White-noise / sleep sounds | P2 | Common (Napper 30+); optional |
| F06 | Calendar export (ICS) | P2 | Confirmed gap |
| F07 | Offline mode | P1 | Confirmed gap for schedulers; natural for no-account |
| F08 | Accessibility & dark-room / one-hand UX | P0 | **Confirmed gap** (nobody markets it) |

### G. Brand / Product / Monetization

| Doc | Feature | Pri | Verdict |
|---|---|---|---|
| G01 | No-account / privacy-first architecture | P0 | Partial gap (only a logger does no-account) |
| G02 | Tip-jar monetization (no subscription/auto-renew) | P0 | **Confirmed gap** (kills the #1 reputational landmine) |
| G03 | Anti-anxiety mechanics (ranges, no streaks) | P0 | Not-a-tagline gap; win on mechanics |
| G04 | No-AI / no-data-training stance | P1 | Confirmed gap (everyone's racing to add AI) |
| G05 | Ephemerality & one-click data deletion | P1 | **Confirmed gap** (everyone wants to retain you forever) |

---

## Suggested build order (MVP → v1 → later)

**MVP (the honest core):** A01, A02, A03, B01, B03, E01, F08, G01, G02, G03, G05. → A tired parent gets a cited, range-based plan in ten seconds, on any device, with no account and no guilt — and can leave a tip.

**v1 (the differentiators):** A04, A05, A06, A07, A08, A09, B02, B04, B05, D01, F07, G04.

**Later (depth for those who want it):** the C-series tracking (local-only), D02/D03, E02–E04, F01–F06, B06, B07, A10.

**Guardrail:** you said finishing matters most. The MVP row is a complete, shippable, differentiated product on its own. Everything else is optional expansion — treat the C/D/E/F series as "only if it stays simple and never adds an account."
