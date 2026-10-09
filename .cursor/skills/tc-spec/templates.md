# Templates — spec & tester verify

Reference pair in this repo: `docs/specs/authentication/AUTH_ACCESS.md` + `docs/scenario/authentication/AUTH_ACCESS_TESTER_VERIFY.md`.

## Spec

```markdown
# Spec: {Title}

**Source:** CSV section **{Section}** — **TC_x–TC_y**
**Feature (automation):** `features/{domain}/tests/{nn}_{flow}.feature` | `None yet`
**Dataset:** `features/{domain}/datasets/{flow}.dataset.ts` | `None yet`
**Tester checklist:** [`{FLOW}_TESTER_VERIFY.md`](../../scenario/{domain}/{FLOW}_TESTER_VERIFY.md)

> **FACT:** …
> **OUT:** blank Expected — không invent.
> **CONFLICT:** … (nếu có)

## 1. Phạm vi

| Mục | In / Out |
|-----|----------|
| TC_… | **In** / Manual / Out |

## 2. Business flow

```text
1. …
```

## 3. CSV map

| TC | Title / intent | Expected (CSV) | Automation | caseId |
|----|----------------|----------------|------------|--------|
| TC_… | … | … | Auto / Manual / Out / Open / Conflict | … |

## 4. Conflicts & notes

| Item | Detail |
|------|--------|

## 5. Business rules

| Rule | Statement | Source |
|------|-----------|--------|
| BR-001 | … | TC_… |

## 6. UI glossary (FACT only)

| UI | Copy |
|----|------|

## 7. Open questions

1. …

## 8. Next

`/tc-automate` mode `rows` (existing flows) or `draft-flow` (new flows).
```

## Tester verify

```markdown
# Kiểm chứng thủ công: {Title}

**Dành cho:** Tester / Manual QA
**Feature (automation):** `features/{domain}/tests/{nn}_{flow}.feature` | `None yet`
**Spec kỹ thuật:** [`{FLOW}.md`](../../specs/{domain}/{FLOW}.md)
**CSV:** Section **{Section}** — **TC_x–TC_y**

> Chỉ assert Expected CSV. **Không invent** ô Expected trống.

## 0. Tổng quan

| Slice | CSV | Verify v1? |
|-------|-----|------------|
| … | TC_… | Có / Manual / OUT |

## 1. Pre-condition chung

1. …

## 2. Checklist

### 2.1 [caseId] — TC_… ✅|⏸|⛔

| | |
|--|--|
| **Precondition** | … |
| **Steps** | 1. … 2. … |
| **Expected (CSV)** | … |
| **Pass?** | ☐ |

## 3. Open / conflicts

| ID | Issue | Action |
|----|-------|--------|
| TC_… | Expected trống | Chờ PO |
```

`### [caseId]` headings are checked by `pnpm check:sync` — keep the id exactly as in the dataset.
