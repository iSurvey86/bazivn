# HANDOFF — Phiên làm việc (mới nhất ở trên)

> **Máy khác:** `git pull` → đọc block **đầu tiên** dưới đây → tiếp tục chat.  
> **Cuối phiên:** `làm cuối phiên đầy đủ` (= HANDOFF → workflow + HDSD + bump version + changelog khi đủ điều kiện → commit + push). Chi tiết: [README](./README.md).

---

## 2026-10-03 — UI ấm + lá số rõ khung (0.1.1)

**Máy / ngữ cảnh:** Cursor — cuối phiên đầy đủ. App **0.1.1** (từ 0.1.0). Nhánh `main`.

### Đã chốt / đã làm

- **Giữ TypeScript** (Next.js/Node); không chuyển sang JS kiểu ksnpsc.
- Dựng quy trình phiên: `.cursor/rules/session-handoff.mdc`, `docs/phien-lam-viec/`, `docs/changelog/`.
- **Giao diện ấm, nhẹ:** nền kem, accent cam đất; bỏ navy/xám lạnh ở vỏ app. Font Inter, chữ nét hơn.
- **Lá số:** Phó tinh ghi đầy đủ (không viết tắt); bỏ chú thích CA/TA/… ở chân trang.
- **Đại vận:** lưới cột đều, tối đa 2 hàng, không scroll ngang; thần sát dài thì xuống dòng.
- **Khung lá số:** mỗi tiêu đề khung một màu; ô góc **Thông tin**; cột Tuần/Không rộng hơn; căn giữa; nhãn hàng màu xen kẽ.
- Màu ngũ hành trên trụ **tạm giữ nguyên** (chưa đổi palette hành).

### File chính

| Khu vực | File |
|---------|------|
| Theme / shell | `globals.css`, `layout.tsx`, `bazi-ui.tsx`, trang home/bazi, form |
| Lá số | `bazi-classic-chart.tsx`, `bazi-dayun-panel.tsx` |
| Phiên / changelog | `docs/phien-lam-viec/*`, `docs/changelog/*` |
| HDSD | `docs/hdsd/01-lap-va-xem-la-so.md` |

### Việc tiếp

- [ ] User chọn: luận giải AI trên trang lá số, hoặc thanh toán Premium.
- [ ] (Tuỳ) Đổi palette ngũ hành sang tông ấm nếu muốn đồng bộ toàn lá số.
- [ ] Thanh toán: gắn `PremiumBlur`, Stripe/PayOS, webhook.
- [ ] AI: gọi `/api/ai/stream` từ trang lá số; cache theo chart + locale.

### Câu mở phiên sau

```text
Đọc HANDOFF block đầu. App 0.1.1 — UI ấm, lá số rõ khung, phó tinh đầy đủ, Đại vận không scroll ngang. Tiếp: luận giải AI hoặc Premium; (tuỳ) đổi màu ngũ hành.
```

**Lưu trữ ngày:** [2026-10-03-ui-am-la-so-ro-khung.md](./2026-10-03-ui-am-la-so-ro-khung.md)

---

## 2026-10-03 — Dựng mẫu phiên làm việc

**Máy / ngữ cảnh:** Cursor — mang quy trình handoff từ ksnpsc sang BaziVN. App **0.1.0**. Nhánh `main`, commit `b2f4bf1`.

### Đã chốt / đã làm

- Có rule luôn áp dụng `.cursor/rules/session-handoff.mdc` và thư mục `docs/phien-lam-viec/`.
- Bỏ phần riêng ksnpsc: không có `HDSD_VERSION`, `hdsdMeta.js`, `appChangelog.js`, modal «Có gì mới». HDSD và changelog là Markdown.
- **Giữ TypeScript.** App đã chạy Node.js / Next.js giống ksnpsc. Khác ở file nguồn (`.ts`/`.tsx` so với `.js`/`.jsx`). Không chuyển sang JavaScript.
- Trạng thái app tại thời điểm dựng mẫu (chưa sửa code sản phẩm trong phiên này):
  - Đã có form lập lá số, engine tứ trụ, lưu lá số (file local hoặc Supabase), trang xem lá số, xuất ảnh, locale mặc định `vn`.
  - `PremiumBlur` chưa gắn vào trang lá số. Nút mở khóa chỉ báo Stripe/PayOS sẽ nối sau.
  - `POST /api/webhooks/payment` và `POST /api/cron/notify` trả 501.
  - `/api/ai/stream` có luận giải demo; trang lá số chưa gọi API này.

### File chính

| Khu vực | File |
|---------|------|
| Rule | `.cursor/rules/session-handoff.mdc` |
| Phiên | `docs/phien-lam-viec/README.md`, `HANDOFF.md` |
| Changelog | `docs/changelog/README.md`, `CHANGELOG.md` |

### Việc tiếp

- [ ] User chọn hướng: gắn luận giải AI lên trang lá số, hoặc nối thanh toán Premium.
- [ ] Khi làm thanh toán: gắn `PremiumBlur`, thay alert bằng Stripe/PayOS, triển khai webhook (chữ ký, số tiền, idempotency).
- [ ] Khi làm AI: gọi `/api/ai/stream` từ trang lá số; cache theo `chart_id` + locale khi có Supabase.

### Câu mở phiên sau

```text
Đọc HANDOFF block đầu. Giữ TypeScript, không chuyển JS kiểu ksnpsc. App 0.1.0: form + engine + lưu/xem lá số, locale vn. Chưa chọn tiếp luận giải AI hay thanh toán Premium.
```
