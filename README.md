# playwright-automation

E2E suite (Playwright + playwright-bdd) driven by the Excel test case sheet.
Conventions: [`AGENTS.md`](AGENTS.md). Skills (`tc-spec`, `tc-automate`, `business-analysis-engineer`) live in [`.agents/skills/`](.agents/skills/) — the open Agent Skills format, so any tool that reads `.agents/skills/` can use them.

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env      # fill BASE_URL (TEST_EMAIL/TEST_PASSWORD optional)
pnpm auth:login           # saves playwright/.auth/user.json for @authenticated scenarios
```

`.env` and `playwright/.auth/` are gitignored — never commit them. Re-run `pnpm auth:login` when tests say the session expired.

## Start a new project

The repo ships a worked example (`features/sample/`, `docs/specs/sample/`, `docs/scenario/sample/`, `docs/testcases/sample_testcase.csv`). For a real project:

1. Replace `docs/testcases/sample_testcase.csv` with the exported sheet — `pnpm check:sync` expects exactly one CSV.
2. Delete the sample domain and its docs once the first real domain exists.
3. Rewrite the project adapters: `scripts/auth-login.ts` (sign-in flow) and the route in `shared/steps/common.steps.ts`.
4. Fill `.env`.

## From CSV to a verified feature

Use this workflow for a new CSV section or feature. The order matters: `/tc-automate` requires the spec and tester checklist created by `/tc-spec`, so it must run after that skill.

### 1. Prepare the source CSV

Export the Excel sheet to `docs/testcases/*.csv` as UTF-8. Keep the original columns and add `caseId`, `Automation`, `Domain`, `Flow`, and optional `Tag` after `Note`.

### 2. Analyze the section and write its spec

Run the `business-analysis-engineer` skill first to clarify the business flow, rules, risks, and open questions. Use its 15-section report; do not turn unknowns or blank Expected results into requirements. The `tc-spec` skill specifically requires this analysis for larger or conflict-heavy sections.

Then run `/tc-spec` for the CSV section. It creates:

- `docs/specs/{domain}/{FLOW}.md`
- `docs/scenario/{domain}/{FLOW}_TESTER_VERIFY.md`

It also proposes the metadata values to add to Excel; it does not edit the CSV or create automation code. Review the spec and tester checklist, and resolve any `Open` or `Conflict` cases with the tester/PO before automating them.

### 3. Apply the proposed CSV metadata

Copy the agreed `caseId`, `Automation`, `Domain`, `Flow`, and optional `Tag` values into Excel, then export the CSV again. Only mark a case `Auto` when its Expected results is filled and automatable. Blank Expected results stays `Out`.

### 4. Generate the Playwright feature

Run `/tc-automate` using the updated CSV and the docs pair from `/tc-spec`. Choose the mode based on the work needed:

- `rows` (tester): use when cases fit an existing dataset flow and existing `expect` flags. This updates dataset rows, feature Examples, and testcase docs; it does not change page objects or steps.
- `draft-flow` (engineer): use for a new domain, flow, or `expect` flag. This drafts the dataset, page object, fixtures, steps, and feature. An engineer should review the draft.

Check that each generated case and its assertions correspond to that CSV case's Steps and Expected results. The sync check confirms that IDs and artifacts line up; it cannot prove that the implementation semantically matches the CSV.

### 5. Verify the feature

Run repository checks, then the tests for the domain:

```bash
pnpm verify
pnpm exec playwright test features/{domain} --reporter=list
```

Replace `{domain}` with the path used in the CSV `Domain` column. `pnpm verify` runs typecheck, BDD generation, and CSV/dataset/Examples synchronization. The Playwright command exercises browser behavior. For the full suite, use `pnpm test` instead. If authenticated tests report a missing or expired session, run `pnpm auth:login` and retry.

## Commands

| Command | What |
|---------|------|
| `pnpm verify` | typecheck + bddgen + CSV/dataset/Examples sync check |
| `pnpm test` / `pnpm test:ui` | run all scenarios / UI mode |
| `pnpm test:ci` | everything except `@skip-ci` |
| `pnpm check:sync` | sync check only (exit 1 on errors) |
| `pnpm test:scripts` | unit tests of the sync check |
| `pnpm auth:login` | refresh the saved session |
