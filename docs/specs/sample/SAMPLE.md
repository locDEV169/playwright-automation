# Spec: Sample - open app pages

**Source:** CSV section **Sample** — **TC_1–TC_4**
**Feature (automation):** `features/sample/tests/01_sample.feature`
**Dataset:** `features/sample/datasets/sample.dataset.ts`
**Tester checklist:** [`SAMPLE_TESTER_VERIFY.md`](../../scenario/sample/SAMPLE_TESTER_VERIFY.md)

> **FACT:** Expected chỉ lấy từ CSV `docs/testcases/sample_testcase.csv`.
> **OUT:** TC_4 — Expected trống, không invent.
> Đây là ví dụ mẫu. Khi áp dụng cho dự án thật, xoá cặp docs này cùng `features/sample/` và CSV mẫu.

## 1. Phạm vi

| Mục | In / Out |
|-----|----------|
| TC_1 Mở trang chủ | **In** |
| TC_2 Mở trang chủ kèm query | **In** |
| TC_3 Đăng nhập bằng tài khoản thật | Manual — chạy qua `pnpm auth:login` |
| TC_4 Expected trống | Out |

## 2. Business flow

```text
1. User chưa đăng nhập mở một path của app (BASE_URL + path).
2. App trả response không lỗi HTTP.
```

## 3. CSV map

| TC | Title / intent | Expected (CSV) | Automation | caseId |
|----|----------------|----------------|------------|--------|
| TC_1 | Open home page | Page responds without HTTP error | Auto | `homeOpens` |
| TC_2 | Open home page with query | Page responds without HTTP error | Auto | `homeOpensWithQuery` |
| TC_3 | Sign in with a real account | Session is saved | Manual | — |
| TC_4 | Example with blank Expected | (trống) | Out | — |

## 4. Conflicts & notes

| Item | Detail |
|------|--------|
| — | Không có |

## 5. Business rules

| Rule | Statement | Source |
|------|-----------|--------|
| BR-001 | Mở một path của app thì response không lỗi HTTP | TC_1, TC_2 |

## 6. UI glossary (FACT only)

| UI | Copy |
|----|------|
| — | Không có (chỉ kiểm tra HTTP response) |

## 7. Open questions

1. Không có.

## 8. Next

`/tc-automate` mode `rows` (existing flows) or `draft-flow` (new flows).
