# Kiểm chứng thủ công: Sample - open app pages

**Dành cho:** Tester / Manual QA
**Feature (automation):** `features/sample/tests/01_sample.feature`
**Spec kỹ thuật:** [`SAMPLE.md`](../../specs/sample/SAMPLE.md)
**CSV:** Section **Sample** — **TC_1–TC_4**

> Chỉ assert Expected CSV. **Không invent** ô Expected trống.

## 0. Tổng quan

| Slice | CSV | Verify v1? |
|-------|-----|------------|
| Mở trang | TC_1, TC_2 | Có |
| Đăng nhập | TC_3 | Manual |
| Expected trống | TC_4 | OUT |

## 1. Pre-condition chung

1. `.env` có `BASE_URL`.
2. Trình duyệt chưa đăng nhập (tag `@unauthenticated` tự xoá session).

## 2. Checklist

### 2.1 [homeOpens] — TC_1 ✅

| | |
|--|--|
| **Precondition** | User is not signed in |
| **Steps** | 1. Open BASE_URL `/` |
| **Expected (CSV)** | Page responds without HTTP error |
| **Pass?** | ☐ |

### 2.2 [homeOpensWithQuery] — TC_2 ✅

| | |
|--|--|
| **Precondition** | User is not signed in |
| **Steps** | 1. Open BASE_URL `/?e2e=1` |
| **Expected (CSV)** | Page responds without HTTP error |
| **Pass?** | ☐ |

### 2.3 TC_3 — Sign in with a real account ⏸ (Manual)

| | |
|--|--|
| **Precondition** | Valid account |
| **Steps** | 1. Run `pnpm auth:login` |
| **Expected (CSV)** | Session is saved |
| **Pass?** | ☐ |

## 3. Open / conflicts

| ID | Issue | Action |
|----|-------|--------|
| TC_4 | Expected trống | Chờ PO |
