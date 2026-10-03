# 2026-10-03 — Shen Sha 2.0 + Đại vận UX + polish lá số

**Máy / ngữ cảnh:** Cursor — cuối phiên đầy đủ. App **0.2.0** (từ 0.1.1). Engine Core đã khóa **0.3.2-core / lock-rc** (commit sẵn trên `main`). Nhánh `main`.

### Đã chốt / đã làm

- **Core lock-rc** (đã commit trước polish UI): hybrid TZ mặc định, monthCommand 1.1.0, half/arch, tranh hợp; acceptance pack sạch.
- **Shen Sha Catalog 2.0.0:** 7 nhóm mới + `specialDayMarkers` tách khỏi `shenSha[]`; Đào Hoa chỉ hiển thị; màu cat/hung; dấu phẩy.
- **Đại vận UX:** xuất PNG 5 dòng; panel chi tiết web 2 cột VI (quan hệ, Lộc/Nhận/Đáo vị/Mộ, thần sát); click kỳ → mở panel.
- **Lá số UI:** bỏ khung Khí trạng / Dụng thần / Nhật trụ đặc thù / Dữ liệu cấu trúc; Lưu niên tuổi/năm tách dòng; chi tiết Lưu niên 2 cột + đồng bộ `text-xs`; legend chỉ swatch.
- **Sửa:** nhãn quan hệ dính chữ (Core `nameVi` + `relationLabelVi`); bỏ ghi chú «không phán tốt/xấu»; tàng can / thần sát tô màu hành / cat-hung.

### File chính

| Khu vực | File |
|---------|------|
| Shen Sha v2 | `src/lib/shen-sha/*`, `bazi-shen-sha.ts`, `public/bcao/BAZIVN-shensha-*.json` |
| Đại vận | `bazi-dayun-detail.ts`, `bazi-dayun-detail-panel.tsx`, `bazi-classic-chart.tsx` |
| Relations VI | `src/lib/core/relations.ts` |
| Form / boundary | `bazi-calculator-form.tsx`, `bazi-day-boundary-panel.tsx` |

### Việc tiếp

- [ ] User nghiệm thu UI lá số + panel Đại vận trên trình duyệt.
- [ ] (Tuỳ) Luận giải AI trên trang lá số, hoặc thanh toán Premium.
- [ ] Không mở lại khóa Core 0.3.2 trừ khi có bug nghiệm thu.
