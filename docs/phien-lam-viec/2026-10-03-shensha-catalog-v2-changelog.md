# Changelog — Shen Sha Catalog v2.0.0

**Date:** 2026-10-03  
**Engine calculator:** unchanged `0.3.2-core` / rule `bazi-core-2026-10-03-lock-rc`  
**Shen Sha catalog:** `1.x (13 entities)` → **`2.0.0` (24 groups)**

## Summary

Mở rộng Thần Sát phụ trợ theo hướng Tử Bình / 《三命通會》.  
**Không** sửa lịch pháp, Tứ trụ, Hybrid TZ, Dạ Tý, Đại vận, monthCommand, relations, Lộc/Nhận, Trường Sinh, XunKong.

## Old → New

| | Count |
|---|---|
| Legacy natal entities (giữ công thức) | 13 |
| Nhóm mới trong `shenSha[]` | 7 |
| `specialDayMarkers` (không gộp `shenSha[]`) | 4 |
| **Tổng nhóm catalog** | **24** |

### 13 legacy (keys giữ nguyên)

`noble`, `wenchang`, `blood`, `tao_hua_xian_chi`, `horse`, `canopy`, `jie`, `void`, `tai`, `general`, `lonely`, `widow`, `tian_gou`

### 7 nhóm mới

1. Thiên Đức — `sanming.tiande.month.v1`
2. Nguyệt Đức — `sanming.yuede.month.v1`
3. Học Đường — `sanming.xuetang.dayStemChangSheng.v1`
4. Từ Quán — `sanming.ciguan.dayStemLinGuan.v1`
5. Kim Dư — `sanming.jinyu.luPlus2.v1`
6. Nguyên Thần — `sanming.yuanchen.genderYear.v1`
7. Thiên La / Địa Võng — `sanming.tianluodiwang.pair.v1` (runtime keys: `tian_luo`, `di_wang`)

### 4 special day markers

`kuiGang`, `yinYangMisalignment`, `fourWaste`, `tenEvilGreatDefeat`

## Invariants

- Mọi entity: `weightClass = "auxiliary"`
- `usefulGod` / `directions` vẫn `null` trong Core
- Lộc / Nhận **không** vào `shenSha[]` (ở `dayMasterQiStates`)
- Không Vong dùng `xunKong` hiện có — không nhân đôi
- Đào Hoa / Hàm Trì vẫn một entity `tao_hua_xian_chi`
- `traditionalTone` chỉ display — không thành score

## Artifacts

- `public/bcao/BAZIVN-shensha-catalog-v2.json`
- `public/bcao/BAZIVN-shensha-v2-acceptance.json`
- Module: `src/lib/shen-sha/`
- Tests: `src/lib/shen-sha/shen-sha-v2.test.ts`
