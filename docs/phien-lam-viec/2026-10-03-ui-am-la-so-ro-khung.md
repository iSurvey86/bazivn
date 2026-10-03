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
