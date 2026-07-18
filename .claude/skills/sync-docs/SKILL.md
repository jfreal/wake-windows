---
name: sync-docs
description: Scan the Wake Windows code for @doc keys, detect which features changed, and update the corresponding feature docs in /features to match the current code. Verifies every doc key in the registry has a matching feature doc and that keys tagged in code stay in sync with what the docs claim. Ensures docs never drift from implementation.
user-invokable: true
args:
  - name: scope
    description: "'audit' (report only, default), 'fix' (update stale docs + registry), or a specific doc key to check (e.g. 'wake-window-schedule-generator')"
    required: false
---

Maintain bidirectional traceability between code and the feature docs. Every documented feature has a **doc key** (e.g., `wake-window-schedule-generator`) that appears both in the source code (as a `@doc:<key>` comment) and in its feature doc (as `docKey: <key>` in YAML frontmatter). When code tagged with a key changes, the matching feature doc must be updated to reflect current behavior.

This project is a **Vue 3 + TypeScript + Vite** single-page web app deployed on Netlify. There is no marketing-site / app-domain split, no Eleventy docs hub, and no C#/Razor — those Pheidi-specific checks from the original skill do not apply here and have been removed. The doc pages here are the internal **feature specs** under `/features`, one file per feature.

## Doc Key Convention

### In code (`.ts`, `.vue`, `.css`, `.js` under `src/`)

Tag code that implements a documented feature with a `@doc:<key>` comment:

```ts
// @doc:wake-window-schedule-generator
class SleepRecommendationRepository { ... }
```

```vue
<script setup lang="ts">
// @doc:evidence-tier-badges-citations
const props = defineProps<{ tier: number }>()
</script>
```

Rules:
- Place the `@doc:<key>` tag on the line immediately above (or the same line as) the relevant code.
- One block can carry multiple keys: `// @doc:wake-window-schedule-generator @doc:bedtime-calculator`.
- The tag is a marker, not documentation — keep the comment brief (what it tags, not how it works).
- Use kebab-case keys. In `.vue` files the tag lives inside `<script>` as a JS comment (or as an HTML `<!-- @doc:key -->` in template if needed).

### In feature docs (`/features/*.md`)

Each feature doc declares its key via `docKey:` in frontmatter (already present on all docs):

```markdown
---
title: Wake-Window Schedule Generator
docKey: wake-window-schedule-generator
category: Scheduling & Prediction
priority: P0
status: Proposed
---
```

`status: Proposed` means spec-only (no code yet). Once code is tagged with the key, the feature is effectively **Built** — the skill reconciles this (see Diff, below) and can bump `status` to `Built` in fix mode.

## Registry

The registry lives at `.claude/skills/sync-docs/registry.json`. It maps each doc key to:
- `doc` — the feature-doc path (always under `docs/features/`, `.md`)
- `title`, `category`, `priority`, `status` — mirrored from the doc frontmatter
- `summary` — a one-line description
- `sources` — the code locations (`path:line`) tagged with `@doc:<key>`, **auto-populated during audit**
- `tests` — the E2E spec locations (`path:line`) tagged with `@test:<key>`, **auto-populated during audit**

```json
{
  "wake-window-schedule-generator": {
    "doc": "docs/features/A01-wake-window-schedule-generator.md",
    "title": "Wake-Window Schedule Generator",
    "category": "Scheduling & Prediction",
    "priority": "P0",
    "status": "Proposed",
    "summary": "Birthday + wake time + window lengths -> nap schedule",
    "sources": ["src/models/ScheduleSetting.ts:1", "src/models/SleepRecommendations.ts:3"],
    "tests": ["e2e/wake-window-schedule-generator.spec.ts:1"]
  }
}
```

## Index Coverage

Every registered doc is expected to appear in `docs/features/FEATURE-INDEX.md` (the analog of the old "hub" check). The index groups features into category tables (A. Scheduling, B. Guidance, … G. Brand). A registered doc whose id/title is missing from the index, or filed under a category that doesn't match its `category` frontmatter, is flagged. The `FEATURE-INDEX.md` itself has no `docKey` and is the index, not a feature — it is excluded from the per-doc checks.

## Test Coverage

Every feature has an E2E spec under `e2e/<docKey>.spec.ts` (Playwright), tagged with a `// @test:<docKey>` comment and a `[@feature:<docKey>]` describe title. The invariant: **every `Built` feature must have at least one non-skipped E2E test**, and every feature (Built or Proposed) must have a spec file (Proposed features carry a `test.skip` placeholder so the matrix stays complete).

Tests run against a switchable target via `E2E_BASE_URL` (unset → local `vite preview`; set → that URL, e.g. the live Netlify site). Config: `playwright.config.ts`. Run with `npm run test:e2e` (add `E2E_BASE_URL=…` for the hosted smoke test).

Flag:
- **Built-without-test**: a `Built` feature whose `tests` array is empty, or whose only spec is `test.skip`.
- **Missing spec file**: a registered key with no `e2e/<key>.spec.ts`.
- **Untagged spec**: a spec file missing its `// @test:<key>` tag (breaks traceability).

## Procedure

### Phase 1: Scan

1. **Read the registry** — `.claude/skills/sync-docs/registry.json`.
2. **Scan source files** — grep for `@doc:` across `src/**` (`.ts`, `.vue`, `.js`, `.css`). For each match: extract the key(s), record `path:line`, and read the surrounding code context (function/class/component/section).
3. **Scan feature docs** — for each `docs/features/*.md`, read frontmatter (`docKey`, `title`, `category`, `priority`, `status`) and the body (what it claims the feature does). The **Competitor verdict** line and **Our approach (spec)** section are the primary "claims" to compare against code.
4. **Scan the index** — read `docs/features/FEATURE-INDEX.md`; collect which doc ids/titles are listed and under which category table.

### Phase 2: Diff

For each doc key:

1. Gather all source tagged with that key.
2. Compare against the feature doc — check whether:
   - Numeric values in the doc match the code (e.g., wake-window ranges, default bedtime, gestational-week default in `ScheduleSetting`, tier definitions in `citations.json`).
   - Described behavior matches the current implementation.
   - Examples are still accurate.
   - Tagged code was added/removed since the doc was last updated.
3. Flag discrepancies with specific `path:line` references in both code and doc.
4. **Status reconciliation** — if a doc is `status: Proposed` but code tagged with its key exists, flag it as **Built-but-marked-Proposed** (fix mode bumps it to `Built`). If a doc is `status: Built` but no tagged code exists, flag as **Marked-Built-but-no-code**.
5. **Index coverage** — flag any registered doc missing from `FEATURE-INDEX.md`, or listed under a category that doesn't match its `category` frontmatter.

### Phase 3: Report (audit mode — default)

Output a structured report:

#### Status Summary
| Key | Doc | Sources | Doc status | Sync |
|-----|-----|---------|-----------|------|
| wake-window-schedule-generator | A01-…md | 3 files | Proposed→Built | Current / Stale |

#### Stale Documentation
For each key where the doc doesn't match code: the key, doc path, what changed in code (`path:line`), and what needs updating in the doc (specific sections/values).

#### Unregistered Keys
`@doc:` tags found in code with no registry entry (need to be added to the registry + a feature doc).

#### Orphaned Keys
Registry entries whose key no longer appears in any `@doc:` tag (feature removed, or not built yet — distinguish by `status`).

#### Missing Doc Files
Registry entries whose `docs/features/<file>.md` doesn't exist on disk.

#### Mismatched docKey
Feature docs whose frontmatter `docKey` doesn't match the registry key (or the filename's semantic slug).

#### Status Drift
Docs marked `Proposed` that have live tagged code (→ Built), or marked `Built` with no code.

#### Missing from Index
Registered docs not listed in `FEATURE-INDEX.md`, or filed under the wrong category table.

### Phase 4: Fix (only if scope is 'fix' or a specific key)

1. **Update stale feature docs** — rewrite the sections that don't match code (usually **Our approach (spec)**, **Edge cases**, and any numbers). Edit the body, not the frontmatter, except to add a missing `docKey` or bump `status`. Preserve the doc's structure (the 13-section template) and its user-facing, non-code-doc tone.
2. **Refresh the registry** — re-scan `@doc:` tags and rewrite each entry's `sources` array; mirror `title`/`category`/`priority`/`status` from the doc frontmatter.
3. **Add missing `docKey`** to any doc lacking one (derive from filename: strip the `A01-` style prefix).
4. **Reconcile status** — bump `Proposed`→`Built` where tagged code exists; flag (don't auto-downgrade) `Built`-with-no-code for the user.
5. **Do NOT delete feature docs.** If a feature was removed from code, flag it for the user to decide.
6. **Add missing index rows** — for each "Missing from Index" entry, add a row to the matching category table in `FEATURE-INDEX.md` (id, feature, priority, verdict). Don't invent categories; if `category` doesn't match a table, flag it.
7. **Register unregistered keys** — for each `@doc:` key with no registry entry, add a registry entry and either point it at an existing doc or flag that a new feature doc is needed (don't fabricate a spec).
8. After fixing, re-run audit to confirm everything is in sync.

## Regenerating the registry from scratch

If the registry is lost or badly out of date, rebuild it deterministically: scan every `docs/features/[A-G]*.md` for `docKey` + frontmatter, then scan `src/**` for `@doc:` tags to fill `sources`. (The initial registry was generated exactly this way.)

## Verification Checklist

- [ ] Every `@doc:` tag in code has a matching registry entry
- [ ] Every registry entry has a valid `docs/features/<file>.md` that exists
- [ ] Every feature doc has a `docKey` frontmatter field matching its registry key and filename slug
- [ ] Numeric values in docs match the code (wake-window ranges, default bedtime, gestational-week default, tier definitions)
- [ ] Examples in docs are accurate for the current implementation
- [ ] The registry `sources` arrays are up to date
- [ ] No doc marked `Proposed` has live tagged code (bump to `Built`)
- [ ] No doc marked `Built` lacks tagged code
- [ ] Every registered doc appears in `FEATURE-INDEX.md` under its correct category
- [ ] Every feature has an `e2e/<docKey>.spec.ts` tagged `// @test:<docKey>`
- [ ] Every `Built` feature has at least one non-skipped E2E test
- [ ] `npm run test:e2e` passes (locally or against `E2E_BASE_URL`)
