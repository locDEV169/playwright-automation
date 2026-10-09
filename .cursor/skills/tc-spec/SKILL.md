---
name: tc-spec
description: >-
  Turn one CSV section of the Excel test case sheet (docs/testcases/*.csv) into a
  spec + tester checklist pair under docs/specs and docs/scenario, and propose the
  caseId / Automation / Domain / Flow values for the Excel columns. Docs only, no
  code. Use when the user invokes /tc-spec or asks to analyze a CSV section before
  automating it.
disable-model-invocation: true
---

# tc-spec — CSV section → docs

Writes **docs only**. Code is `/tc-automate`. Conventions: `.cursor/rules/e2e-conventions.mdc` (read it first).

```text
docs/testcases/*.csv  →  /tc-spec  →  docs/specs/{domain}/{FLOW}.md
                                      docs/scenario/{domain}/{FLOW}_TESTER_VERIFY.md
                                      + proposed Excel column values
                      →  /tc-automate
```

## Step 0 — Inputs

Ask once if missing:

- CSV **section name** (e.g. `Login`, `Manufacturer Form`) and optional TC range.
- `{domain}`: reuse an existing `features/{domain}` or `docs/specs/{domain}` folder; otherwise kebab-case of the section.
- `{FLOW}`: SCREAMING_SNAKE intent, e.g. `AUTH_ACCESS`.

## Step 1 — Read

1. The CSV section (header row starts with `No`; read columns by name).
2. Existing `docs/specs/{domain}/` + `docs/scenario/{domain}/` and `features/{domain}/` if present.
3. Existing dataset `flow` values of the domain (needed for the `Flow` proposal).

Priority of truth: CSV → existing automation → existing docs → user notes. Mismatch → **CONFLICT**.

Rows:

| CSV state | Label |
|-----------|-------|
| Expected filled | FACT |
| Expected blank | OUT — do not invent |
| Ambiguous / needs PO | OPEN |
| CSV vs code/docs differ | CONFLICT |
| Continuation row (empty Title) | same case chain as the row above |
| Duplicate TC id in the file | CONFLICT until the key is agreed |

## Step 2 — Analysis

- Section ≤ ~15 TCs and no conflicts → analyze in the main context.
- Larger or conflict-heavy → spawn `@business-analysis-engineer` with the CSV path + section, existing docs/features paths, and: "15-section report, do not invent blank Expected, list conflicts".

Never turn an OPEN item into a rule.

## Step 3 — Write docs

Use [templates.md](templates.md). One section → one docs pair (split only if the user asks).

- Spec: FACT map for engineers (scope, flow, CSV map, conflicts, rules, glossary, open questions).
- Tester verify: one `### [caseId]` block per planned automated case + Manual/OUT blocks; Pass criteria only from CSV Expected.
- Vietnamese prose is fine; TC ids, paths and UI copy stay exact.
- No credentials, cookies or tokens in docs.

## Step 4 — Propose Excel values

Output a table the tester copies into the Excel sheet (this skill never edits the CSV):

| TC | caseId | Automation | Domain | Flow | Reason |
|----|--------|------------|--------|------|--------|

- `Auto` only when Expected is filled and the behavior is automatable.
- `Flow` = an existing dataset flow when one fits; otherwise write `new: <name>` (engineer work in `/tc-automate` mode `draft-flow`).

## Step 5 — Checklist

- [ ] Both docs exist and link to each other
- [ ] Every IN TC has CSV Expected or is OUT/OPEN/CONFLICT
- [ ] Blank Expected not filled in
- [ ] Excel proposal table included
- [ ] No code created

## Summary to the user

```markdown
## Spec docs
- Section: … (TC_…–TC_…) · Domain: `{domain}`
- Files: `docs/specs/{domain}/{FLOW}.md`, `docs/scenario/{domain}/{FLOW}_TESTER_VERIFY.md`
- Auto: … · Manual: … · Out: … · Open/Conflict: …

### Excel values to fill
(table)

### Next
- Existing flows only → `/tc-automate` mode `rows` (tester)
- Any `new:` flow → `/tc-automate` mode `draft-flow` (engineer)
```
