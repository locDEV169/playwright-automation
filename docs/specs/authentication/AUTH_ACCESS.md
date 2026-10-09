# Spec: Authentication & access

**Source:** CSV section **Login** — **TC_1–TC_2** (+ harness cases không có trong CSV)
**Feature (automation):** `features/authentication/tests/01_auth_access.feature`
**Dataset:** `features/authentication/datasets/authAccess.dataset.ts`
**Tester checklist:** [`AUTH_ACCESS_TESTER_VERIFY.md`](../../scenario/authentication/AUTH_ACCESS_TESTER_VERIFY.md)

> **FACT:** Expected chỉ lấy từ CSV. Harness case là kiểm thử kỹ thuật cho AuthGuard, không map vào TC nào.
> **OUT:** TC_2 — Steps và Expected trống, không invent.

---

## 1. Phạm vi

| Mục | In / Out |
|-----|----------|
| TC_1 Google login thành công → màn Mail | **Manual** — chạy qua `pnpm auth:login` (không chạy trong suite, Google OAuth không ổn định khi tự động hoá) |
| TC_2 User đã từng login | **Out** — Expected trống |
| AuthGuard redirect khi thiếu cookie `accessToken` | **In** — harness |
| `/auth/callback` thiếu / sai tham số | **In** — harness |
| JWT hết hạn / hỏng bị xoá | **In** — harness |
| Session đã lưu mở được `/mail`, `/chat` | **In** — harness |

---

## 2. Business flow

```text
Anonymous: mở route bảo vệ → AuthGuard → /login?redirect={đường dẫn gốc đã encode}
Callback lỗi: /auth/callback không tạo cookie accessToken → vẫn phải login
JWT: AuthContext decode exp → hết hạn / hỏng → xoá cookie → về /login
Signed-in: storageState có accessToken → mở thẳng /mail, /chat
```

---

## 3. CSV map

| TC | Title / intent | Expected (CSV) | Automation |
|----|----------------|----------------|------------|
| TC_1 | Verify user login thành công | Login thành công; chuyển tới màn Mail mặc định | Manual (`pnpm auth:login`) |
| TC_2 | — | (trống) | Out |

Harness caseIds (`tc: []`): `guardRedirectMail`, `guardRedirectChat`, `guardRedirectMailQuery`, `callbackNoParams`, `callbackInvalidParams`, `callbackErrorThenOpenMail`, `expiredJwtOpenMail`, `malformedJwtOpenMail`, `expiredJwtOpenChat`, `signedInOpenMail`, `signedInOpenChat`.

---

## 4. Conflicts & notes

| Item | Detail |
|------|--------|
| Callback error route | Chưa có route lỗi riêng được xác nhận — chấp nhận `/login`, `/auth/callback` hoặc `/error` |
| Invalid callback params | Dùng `code` + `state` giả; hình dạng tham số thật chưa được xác nhận |

---

## 5. Business rules

| Rule | Statement | Source |
|------|-----------|--------|
| BR-001 | Thiếu cookie `accessToken` → redirect `/login?redirect=` giữ nguyên path + query | Hành vi app (harness) |
| BR-002 | JWT hết hạn hoặc hỏng → cookie bị xoá, user về trạng thái chưa đăng nhập | Hành vi app (harness) |

---

## 6. Open questions

1. Route lỗi chính thức của `/auth/callback` là gì?
2. Có thêm TC trong CSV cho các harness case không (để đổi `tc: []` thành TC thật)?
3. TC_2 sẽ được bổ sung Steps / Expected không?

---

## 7. Next

Thêm case cho flow có sẵn: `/tc-automate` mode `rows`. Chạy `pnpm verify` rồi `pnpm test`.
