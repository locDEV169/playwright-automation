---
name: tc-automate
description: >-
  Generate BDD+DDT Playwright automation from the docs pair written by /tc-spec and
  the Excel columns (caseId / Automation / Domain / Flow). Mode `rows` (tester): add
  dataset + Examples rows for flows that already exist, never touching pages or
  steps. Mode `draft-flow` (engineer): draft a new flow (dataset, POM, fixtures,
  steps, feature) for review. Use when the user invokes /tc-automate.
disable-model-invocation: true
---

# tc-automate — docs + Excel columns → BDD+DDT

Conventions: `.cursor/rules/e2e-conventions.mdc` (read it first). Reference domain: `features/authentication/`.

If the docs pair is missing → stop and ask for `/tc-spec` first.

## Step 0 — Pick the mode

| Mode | Who | Allowed to edit | Use when |
|------|-----|-----------------|----------|
| `rows` | Tester | `features/{domain}/datasets/*.dataset.ts`, `Examples` tables in `features/{domain}/tests/*.feature`, `docs/scenario/**`, `docs/specs/**` | Every Auto row's `Flow` already exists in the dataset `flow` union and its `expect` flags already exist |
| `draft-flow` | Engineer | everything under `features/{domain}/` + docs; `shared/` only if a second domain needs it | A new flow, new `expect` flag or a new domain |

If the user asked for `rows` but a row needs a new flow or expect flag → **stop**, list those rows as "needs engineer (`draft-flow`)", and continue only with the rows that fit.

## Step 1 — Collect cases

1. Read `docs/specs/{domain}/{FLOW}.md` + `docs/scenario/{domain}/{FLOW}_TESTER_VERIFY.md`.
2. Read the CSV rows of that section; keep only `Automation=Auto` with filled Expected.
3. Skip Manual / Out / Open / Conflict / blank Expected — list them under "Out of scope" in the feature header.
4. Read the domain dataset(s) and POM to know existing `flow` values and `expect` flags.

## Step 2 — mode `rows`

For each Auto case:

1. Add a dataset row: `id` = caseId, `tc` = CSV TC ids, `note` = `"TC_…: short intent"`, `flow` from the Excel `Flow` column, `expect` = only flags backed by CSV Expected, inputs the flow reads (e.g. `path`).
2. Add the caseId to the `XxxCaseId` union.
3. Add `| caseId | note |` to the matching Outline's `Examples` (anonymous vs signed-in Outline by tag).
4. Add a `### [caseId]` block to the tester verify doc; set the spec CSV map `caseId` column.

Do not edit `pages/`, `fixtures.ts`, `steps.ts`, `shared/` or `playwright.config.ts`.

## Step 3 — mode `draft-flow`

Order:

1. Dataset (contract in the rule; export `DATASET`, `get{Xxx}Case` throws with known ids).
2. POM `pages/{Flow}Page.ts`: `runCase` switches on `flow`; `expectCase` asserts each set `expect` flag; locators by role/label/text first; waits on responses/elements, not timers.
3. `fixtures.ts`: extend `test` from `shared/fixtures` with the POM fixture.
4. `tests/steps.ts`: the two runner steps only.
5. Feature: Outline(s) per the rule (`Given the user is signed in` for `@authenticated`).
6. Docs: as in mode `rows`.

Mark the summary "needs engineer review" — this mode's output is a draft.

## Step 4 — Verify (both modes)

```bash
pnpm verify                                        # typecheck + bddgen + check:sync
pnpm exec playwright test features/{domain} --reporter=list
```

`pnpm check:sync` must report 0 errors. Read its warnings and fix the ones caused by this change. If `@authenticated` cases fail with "Missing playwright/.auth/user.json" or "Session expired" → ask the user to run `pnpm auth:login`.

## Guardrails

Always:

- Expected only from CSV; dataset ↔ Examples ↔ `### [caseId]` stay in sync.
- One Outline per flow shape; caseIds are intent names, TC ids live in `tc` + `note`.

Never:

- Invent Expected, automate blank Expected / Open / Conflict rows.
- Edit the CSV (propose values instead) or hand-edit `.features-gen/`.
- Add a second sign-in step, module-level state, `waitForTimeout` without `allow-wait:`, or fallback assertions.
- Put credentials, cookies or tokens in any file.

## Summary to the user

```markdown
## Automation
- Mode: rows | draft-flow · Domain: `{domain}`
- Added caseIds: … · Skipped: … (reason) · Needs engineer: …

### Files
- …

### Verify
- pnpm verify: … · playwright: N passed / M failed
```
