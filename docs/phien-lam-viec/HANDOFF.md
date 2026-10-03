# HANDOFF — Phiên làm việc (mới nhất ở trên)

> **Máy khác:** `git pull` → đọc block **đầu tiên** dưới đây → tiếp tục chat.  
> **Cuối phiên:** `làm cuối phiên đầy đủ` (= HANDOFF → workflow + HDSD + bump version + changelog khi đủ điều kiện → commit + push). Chi tiết: [README](./README.md).

---

## 2026-10-03 — Shen Sha 2.0 + Đại vận UX + polish lá số (0.2.0)

**Máy / ngữ cảnh:** Cursor — cuối phiên đầy đủ. App **0.2.0** (từ 0.1.1). Engine Core **0.3.2-core / lock-rc** đã commit. Nhánh `main`.

### Đã chốt / đã làm

- **Shen Sha Catalog 2.0.0:** 7 nhóm mới + `specialDayMarkers` tách `shenSha[]`; Đào Hoa chỉ display; màu cat/hung; danh sách dấu phẩy.
- **Đại vận UX:** xuất PNG 5 dòng; panel web 2 cột VI (quan hệ / cấu trúc / thần sát); click kỳ mở panel (`bazi-no-export`).
- **Lá số UI:** bỏ Khí trạng, Dụng thần, Nhật trụ đặc thù, Dữ liệu cấu trúc; Lưu niên chi tiết 2 cột + đồng bộ fontsize; tuổi/năm tách dòng.
- **Sửa:** nhãn quan hệ dính chữ (`relationNameToVi` + `relationLabelVi`); bỏ ghi chú «không phán tốt/xấu»; dedupe dòng Mộ Khố.

### File chính

| Khu vực | File |
|---------|------|
| Shen Sha v2 | `src/lib/shen-sha/*`, `bazi-shen-sha.ts`, `public/bcao/BAZIVN-shensha-*.json` |
| Đại vận | `bazi-dayun-detail.ts`, `bazi-dayun-detail-panel.tsx`, `bazi-classic-chart.tsx` |
| Relations | `src/lib/core/relations.ts` |
| Changelog catalog | [2026-10-03-shensha-catalog-v2-changelog.md](./2026-10-03-shensha-catalog-v2-changelog.md) |

### Việc tiếp

- [ ] Nghiệm thu UI lá số + panel Đại vận trên trình duyệt.
- [ ] (Tuỳ) Luận giải AI trên trang lá số, hoặc thanh toán Premium.
- [ ] Không mở lại khóa Core 0.3.2 trừ bug nghiệm thu.

### Câu mở phiên sau

```text
Đọc HANDOFF block đầu. App 0.2.0 — Shen Sha 2.0, panel Đại vận 2 cột, lá số đã bỏ khung thừa. Core lock-rc 0.3.2 giữ nguyên. Tiếp: nghiệm thu UI hoặc AI/Premium.
```

**Lưu trữ ngày:** [2026-10-03-shensha-dayun-ui.md](./2026-10-03-shensha-dayun-ui.md)

---

## 2026-10-03 — Chốt DEV BRIEF Core (P0/P1) trước khóa phiên

**Máy / ngữ cảnh:** Cursor — tiếp thu 3 phản biện vào brief; chưa bắt đầu code Sprint 1. Nhánh `main`.

### Đã chốt / đã làm

- Brief Core khóa trước phiên bản: P0 timezone/Jie/Yun · `timezoneSensitive` · monthCommand nguồn/version · hoàn thiện `relations[]`; P1 boundary · UI Dịch Mã · giữ Đào Hoa/Thiên Câu.
- **P0.1:** tách DoD **VN Civil** vs **Global Instant-Consistent** — không nói “timezone đang sai hoàn toàn”; rủi ro thấp hơn nếu chỉ HCM + civil local.
- **P0.4:** `computeStemBranchRelations` đã có — **refine + test**, không rewrite.
- Giữ nguyên: Dạ Tý version hóa, Lộc/Nhận ngoài shen-sha, không usefulGod/directions, % ngũ hành chỉ viz.
- Golden case: `05/05/2026 23:46` `Asia/Ho_Chi_Minh` nữ — log 10 field raw; không nghiệm thu bằng ảnh UI.
- Audit 4 khối code: `public/bcao/BAZIVN-4-khoi-code-kiem-tra-dut-diem.docx`.

### File chính

| Khu vực | File |
|---------|------|
| Brief chốt | [2026-10-03-dev-brief-core-truoc-khoa-phien.md](./2026-10-03-dev-brief-core-truoc-khoa-phien.md) |
| Code audit Word | `public/bcao/BAZIVN-4-khoi-code-kiem-tra-dut-diem.docx` |
| Core liên quan | `jieqi-boundaries.ts`, `month-command.ts`, `relations.ts`, `astrology-engine.ts`, `bazi-shen-sha.ts` |

### Việc tiếp

- [ ] Sprint 1: Timezone/Jie/Yun (DoD-A trước) → MonthCommand source/version → regression + golden case log.
- [ ] Sprint 2: Audit relations → Boundary → UI Thần sát.
- [ ] Sprint 3: Khóa BaziFacts + Classical Reasoning.

### Câu mở phiên sau

```text
Đọc HANDOFF block đầu + docs/phien-lam-viec/2026-10-03-dev-brief-core-truoc-khoa-phien.md. Brief Core đã chốt (DoD-A VN / DoD-B Global). Bắt đầu Sprint 1 khi user bảo 「bắt đầu」.
```

**Lưu trữ ngày:** [2026-10-03-dev-brief-core-truoc-khoa-phien.md](./2026-10-03-dev-brief-core-truoc-khoa-phien.md)

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
