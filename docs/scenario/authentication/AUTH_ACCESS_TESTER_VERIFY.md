# Kiểm chứng thủ công: Authentication & access

**Dành cho:** Tester / Manual QA
**Feature (automation):** `features/authentication/tests/01_auth_access.feature`
**Spec kỹ thuật:** [`AUTH_ACCESS.md`](../../specs/authentication/AUTH_ACCESS.md)
**CSV:** Section **Login** — **TC_1–TC_2**

> Chỉ assert Expected CSV / hành vi đã chốt. **Không invent** ô Expected trống.

---

## 0. Tổng quan

| Slice | CSV | Verify v1? |
|-------|-----|------------|
| Google login | TC_1 | Manual (`pnpm auth:login`) |
| — | TC_2 | OUT (Expected trống) |
| AuthGuard / callback / JWT / session | Harness | Có (auto) |

---

## 1. Pre-condition chung

1. `.env` có `BASE_URL`.
2. Case anonymous: trình duyệt sạch (tag `@unauthenticated` tự xoá session).
3. Case signed-in: đã chạy `pnpm auth:login`.

---

## 2. Checklist

### 2.1 TC_1 — Google login (Manual)

| | |
|--|--|
| **Steps** | 1. Chạy `pnpm auth:login` 2. Đăng nhập Google |
| **Expected (CSV)** | Login thành công; chuyển tới màn Mail mặc định |
| **Pass?** | ☐ |

### 2.2 [guardRedirectMail] — Harness ✅

| | |
|--|--|
| **Steps** | Không cookie → mở `/mail` |
| **Expected** | Ở `/login`, `redirect` = `/mail`, không có cookie `accessToken` |
| **Pass?** | ☐ |

### 2.3 [guardRedirectChat] — Harness ✅

| | |
|--|--|
| **Steps** | Không cookie → mở `/chat` |
| **Expected** | Ở `/login`, `redirect` = `/chat`, không có cookie `accessToken` |
| **Pass?** | ☐ |

### 2.4 [guardRedirectMailQuery] — Harness ✅

| | |
|--|--|
| **Steps** | Không cookie → mở `/mail?folder=inbox` |
| **Expected** | Ở `/login`, `redirect` = `/mail?folder=inbox` |
| **Pass?** | ☐ |

### 2.5 [callbackNoParams] — Harness ✅

| | |
|--|--|
| **Steps** | Mở `/auth/callback` không tham số |
| **Expected** | Không có cookie `accessToken`, không vào `/mail` |
| **Pass?** | ☐ |

### 2.6 [callbackInvalidParams] — Harness ✅

| | |
|--|--|
| **Steps** | Mở `/auth/callback?code=…&state=…` (giá trị sai) |
| **Expected** | Không có cookie; ở `/login`, `/auth/callback` hoặc `/error` |
| **Pass?** | ☐ |

### 2.7 [callbackErrorThenOpenMail] — Harness ✅

| | |
|--|--|
| **Steps** | Callback lỗi → mở `/mail` |
| **Expected** | Về `/login?redirect=` chứa `/mail` |
| **Pass?** | ☐ |

### 2.8 [expiredJwtOpenMail] — Harness ✅

| | |
|--|--|
| **Steps** | Gắn cookie `accessToken` JWT hết hạn → mở `/mail` |
| **Expected** | Cookie bị xoá, ở `/login` |
| **Pass?** | ☐ |

### 2.9 [malformedJwtOpenMail] — Harness ✅

| | |
|--|--|
| **Steps** | Gắn cookie `accessToken` hỏng → mở `/mail` |
| **Expected** | Cookie bị xoá, ở `/login` |
| **Pass?** | ☐ |

### 2.10 [expiredJwtOpenChat] — Harness ✅

| | |
|--|--|
| **Steps** | Gắn JWT hết hạn → mở `/chat` |
| **Expected** | Cookie bị xoá, `/login?redirect=` chứa `/chat` |
| **Pass?** | ☐ |

### 2.11 [signedInOpenMail] — Harness ✅

| | |
|--|--|
| **Steps** | Đã `pnpm auth:login` → mở `/mail` |
| **Expected** | Ở lại `/mail`, không bị đưa về `/login` |
| **Pass?** | ☐ |

### 2.12 [signedInOpenChat] — Harness ✅

| | |
|--|--|
| **Steps** | Đã `pnpm auth:login` → mở `/chat` |
| **Expected** | Ở lại `/chat`, không bị đưa về `/login` |
| **Pass?** | ☐ |

---

## 3. Open / conflicts

| ID | Issue | Action |
|----|-------|--------|
| TC_2 | Expected trống | Chờ PO |
| callbackInvalidParams | Route lỗi chưa chốt | Chấp nhận 3 route, chờ PO |
