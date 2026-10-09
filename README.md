# playwright-automation

E2E suite (Playwright + playwright-bdd) driven by the Excel test case sheet.
Conventions: [`.cursor/rules/e2e-conventions.mdc`](.cursor/rules/e2e-conventions.mdc).

## Setup

```bash
pnpm install
pnpm exec playwright install chromium
cp .env.example .env      # fill BASE_URL (TEST_EMAIL/TEST_PASSWORD optional)
pnpm auth:login           # saves playwright/.auth/user.json for @authenticated scenarios
```

`.env` and `playwright/.auth/` are gitignored — never commit them. Re-run `pnpm auth:login` when tests say the session expired.

## From Excel to automation

1. Export the sheet to `docs/testcases/*.csv` (UTF-8). Columns `caseId`, `Automation`, `Domain`, `Flow`, `Tag` sit after `Note`.
2. `/tc-spec` on a CSV section → spec + tester checklist + proposed Excel values. Copy the values into Excel and re-export.
3. `/tc-automate`:
   - mode `rows` (tester): add cases for flows that already exist — only datasets, Examples and docs change.
   - mode `draft-flow` (engineer): new flow / POM, reviewed by an engineer.
4. `pnpm verify`, then `pnpm test`. Open a PR.

## Commands

| Command | What |
|---------|------|
| `pnpm verify` | typecheck + bddgen + CSV/dataset/Examples sync check |
| `pnpm test` / `pnpm test:ui` | run all scenarios / UI mode |
| `pnpm test:ci` | everything except `@skip-ci` |
| `pnpm check:sync` | sync check only (exit 1 on errors) |
| `pnpm test:scripts` | unit tests of the sync check |
| `pnpm auth:login` | refresh the saved session |
