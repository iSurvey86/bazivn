# 2026-10-04 — Đăng ký luận giải / mệnh thư (0.3.0)

**Máy / ngữ cảnh:** Cursor — cuối phiên đầy đủ. App **0.3.0** (từ 0.2.0). Nhánh `main`.

### Đã chốt / đã làm

- Luồng đăng ký: modal nguồn + trường phái → khóa kiểm tra → intake → checkout demo → cấp mã → collect theo A/B/C.
- **Mã mệnh thư:** 8 ký tự alphabet an toàn (không 0/O/1/I), chữ+số, không lặp; cấp/khóa lúc thanh toán; hiển thị liền; tra cứu chỉ upper.
- **A/B/C:** có giờ → A/B; tick Không rõ giờ → chỉ C «Hiệu chỉnh, tìm giờ sinh».
- Tick Không rõ giờ trên form lập lá số, form sửa reading, intake.
- B: wizard nghiệm chứng (nhiều lĩnh vực, ngày/tháng/năm, phần 3–4).
- C: wizard khoảng giờ + ≥8 mốc + phần 3–4.
- QR demo checkout; nút giả webhook; tách `code-format.ts` khỏi `fs` (fix client).
- Store local `.data/reading-orders`.

### File chính

| Khu vực | File |
|---------|------|
| Reading lib | `src/lib/reading/*` |
| Reading UI | `src/components/reading/*` |
| Routes | `src/app/[locale]/reading/`, `src/app/api/reading/` |
| Form lập/sửa | `bazi-calculator-form.tsx`, `reading-basic-form.tsx`, `charts/repository.ts` |
| Workflow / HDSD | `workflows/03.dang_ky_luan_giai.md`, `docs/hdsd/02-dang-ky-luan-giai.md` |

### Việc tiếp

- [ ] PayOS/Stripe + webhook thật; bỏ/giới hạn nút demo.
- [ ] Tài khoản riêng + tiến độ luận giải từng mục (chỉ chủ đơn đọc).
- [ ] CSKH tra cứu theo mã; UNIQUE index DB khi lên production.
- [ ] Nghiệm thu end-to-end A/B/C trên trình duyệt.

### Câu mở phiên sau

```text
Đọc HANDOFF block đầu. App 0.3.0 — đăng ký luận giải, mã mệnh thư khóa lúc thanh toán, A/B/C + QR demo. Tiếp: PayOS/webhook hoặc tài khoản + tiến độ luận giải.
```
