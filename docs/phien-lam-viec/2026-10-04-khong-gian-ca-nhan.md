# 2026-10-04 — Không gian cá nhân + nền ban mai (0.4.0)

**Máy / ngữ cảnh:** Cursor — cuối phiên đầy đủ. App **0.4.0** (từ 0.3.0). Nhánh `main`.

### Đã chốt / đã làm

- Nền shell «ban mai trên giấy»: `public/brand/bg-shell-morning-paper.jpg` + `.bazi-page-bg`.
- **Không gian cá nhân** theo mockup `public/slidebar`: sidebar cố định + 7 mục (tổng quan, tứ trụ, đại vận, nhật ký, khuyến nghị, liên hệ, cài đặt).
- Demo 1 user; ghép mã/tên/trụ từ đơn reading gần nhất nếu có.
- CTA từ trang chủ và màn sau đăng ký → `/account/overview`.
- Auth / RLS / PDF thật — chưa.

### File chính

| Khu vực | File |
|---------|------|
| Account | `src/lib/account/*`, `src/components/account/*`, `src/app/[locale]/account/*` |
| Nền | `public/brand/`, `globals.css` |
| Mockup nguồn | `public/slidebar/*.txt` |
| Workflow / HDSD | `workflows/04.khong_gian_ca_nhan.md`, `docs/hdsd/03-khong-gian-ca-nhan.md` |

### Việc tiếp

- [ ] Supabase Auth + gắn user_id với reading order / chart (chỉ chủ đơn đọc).
- [ ] Cập nhật tiến độ luận giải từ CSKH/admin (không chỉ demo %).
- [ ] Xuất PDF mệnh thư thật; PayOS webhook.
- [ ] Nhật ký nghiệm chứng lưu server.

### Câu mở phiên sau

```text
Đọc HANDOFF block đầu. App 0.4.0 — không gian cá nhân sidebar (mockup slidebar), nền ban mai. Tiếp: Auth + tiến độ thật / PDF / PayOS.
```
