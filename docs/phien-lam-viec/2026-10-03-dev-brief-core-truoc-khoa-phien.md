# BAZIVN — DEV BRIEF SỬA CORE TRƯỚC KHI KHÓA PHIÊN BẢN

> Đã chốt 2026-10-03 sau phản biện + tiếp thu 3 chỉnh: P0.1 tách VN/Global, P0.4 refine relations (không rewrite), DoD-A / DoD-B.  
> Code audit tham chiếu: `public/bcao/BAZIVN-4-khoi-code-kiem-tra-dut-diem.docx`

## Mục tiêu

Core lập lá số chỉ xuất **dữ liệu lịch pháp / cấu trúc deterministic**. Không trộn suy luận Dụng thần. Loại rủi ro sai **Tiết khí, tháng trụ, khởi vận, Nhân nguyên, Fact Graph**.

**Không sửa thêm** (nếu test đang pass): công thức Tứ trụ, Trường Sinh, bảng Dịch Mã, Đào Hoa/Hàm Trì, Lộc/Nhận.

---

## P0 — BẮT BUỘC TRƯỚC KHI KHÓA CORE

### P0.1. Chuẩn hóa timezone cho Tiết khí / Lập Xuân / Yun theo phạm vi sản phẩm

Với cấu hình hiện tại nếu BaziVN **chỉ phục vụ `Asia/Ho_Chi_Minh` và người dùng nhập trực tiếp civil local time**, rủi ro vận hành thực tế thấp hơn hệ thống multi-timezone. Tuy nhiên, nếu sản phẩm tuyên bố đạt chuẩn **“vô khuyết”, tái lập theo instant hoặc hỗ trợ toàn cầu**, bắt buộc phải chuẩn hóa clock giữa birth time và clock mà thư viện sử dụng cho Jie/Lập Xuân/Yun.

Yêu cầu kỹ thuật (khi làm Global / khi khóa “vô khuyết”):

- Tách rõ `localCivilTime` và `libraryTermClock`.
- Không so birth civil với giờ Jie nếu hai clock không cùng chuẩn.
- Xác minh chính thức `lunar-typescript` dùng clock nào cho Jie/Lập Xuân/Yun.
- Normalize về cùng absolute instant trước khi tính: `minutesToPrevJie` / `minutesToNextJie` / `minutesToLiChun` / `daysFromJie` / `getYun()/getStartSolar()`.
- `getStartSolar()` convert về timezone nơi sinh để hiển thị.
- **Không** hard-code kiểu −1 giờ cho Việt Nam — timezone adapter tổng quát.

Definition of Done **hai cấp** — xem mục DoD-A / DoD-B bên dưới.

### P0.2. Sửa `timezoneSensitive`

Hiện: `timezone !== "Asia/Ho_Chi_Minh"` — sai bản chất.

Thay bằng: sensitivity theo **khoảng cách tới boundary sau khi normalize timezone**; chỉ bật khi sát Jie / Lập Xuân / ranh giờ.

### P0.3. Chuẩn hóa Nhân nguyên tư lệnh (`monthCommand`)

Flow `daysFromJie` (đảo dấu) + `computeMonthCommand()` ổn về cấu trúc.

Bảng `REN_YUAN_SI_LING_V1` cần **chốt nguồn học thuật duy nhất**, rule-set có version:

- `sourceId`, `sourceTitle`, `tableVersion`, `schedule`, `method`
- Chỉ **một** rule-set default; không pha nhiều bảng cổ trong cùng mode.

Ví dụ mode:

```text
monthCommandMode:
- ziPingZhenQuan_v1
- anotherClassicalSource_v1
```

### P0.4. Hoàn thiện Fact Graph quan hệ Can–Chi

Hệ thống **đã có skeleton `computeStemBranchRelations()` và đã tích hợp vào Core**. Việc còn lại là **audit và hoàn thiện schema** (refine + test, **không rewrite từ đầu** nếu implementation đúng):

- Can hợp/khắc;
- Chi hợp/xung/hình/hại/phá;
- Tam hợp / Tam hội;
- `sourceId`;
- phân biệt **hợp** với **hợp hóa**;
- **tranh hợp / hợp nhiều chiều**;
- test đầy đủ các tổ hợp.

Debug JSON `relations[]`: `type`, `members`, `name`, `sourceId`.

---

## P1 — HOÀN THIỆN SAU P0

5. **Boundary Engine** — `nearZi` không đánh cả 22:00–00:59; cửa sổ ±5/±10′; ranh giờ chi 23,1,3,…,21; circular quanh 00:00.  
6. **UI binding Dịch Mã** — không sửa bảng backend; kiểm tra index/merge/cache/pillar.  
7. **Giữ Đào Hoa/Hàm Trì** một entity `tao_hua_xian_chi`.  
8. **Giữ Thiên Câu** (天勾); không đổi lại Cẩu/Cầu trên UI mới.

## GIỮ NGUYÊN

9. Dạ Tý: `midnight_00` | `zi_start_23`  
10. Lộc/Nhận trong `dayMasterQiStates`, ngoài shen-sha  
11. `usefulGod = null`, `directions = null`  
12. Ngũ hành % chỉ visualization  

---

## Definition of Done

### DoD-A — Core Việt Nam (VN Civil Mode)

- `Asia/Ho_Chi_Minh`; civil local input nhất quán  
- Jie / Lập Xuân / Yun ổn định tại Việt Nam  
- Dạ Tý đúng convention  
- Nhân nguyên đúng rule-set có nguồn/version  
- `relations[]` đầy đủ (sau audit P0.4)  
- Tests biên Việt Nam pass  

### DoD-B — Core toàn cầu (Global / Instant-Consistent Mode)

- Cùng absolute instant từ timezone khác nhau → Year/Month/Jie/Yun nhất quán theo instant  
- Timezone conversion có kiểm thử; không hard-code UTC+7/UTC+8  
- DST/history-aware nếu tuyên bố hỗ trợ  
- Global boundary tests pass  

Team **không bị ép** xây full global time engine nếu roadmap chỉ VN; kiến trúc không khóa đường mở DoD-B sau.

---

## Golden regression case (giữ nguyên)

```text
Birth: 05/05/2026 23:46
Timezone: Asia/Ho_Chi_Minh
Gender: Female
```

Bắt buộc log raw (10 field):

```text
birthLocal
birthAbsolute
libraryTermClock
prevJie
nextJie
minutesFromPrevJie
daysFromJie
monthCommand
yunStartRaw
yunStartLocal
```

**Không nghiệm thu bằng ảnh UI.** Nghiệm thu: raw facts + unit test + snapshot schema.

---

## Thứ tự triển khai

1. **Sprint 1:** Timezone/Jie/Yun (theo DoD-A trước; stub/adapter cho DoD-B) → MonthCommand source/version → regression  
2. **Sprint 2:** Audit `relations[]` → Boundary Engine → UI binding Thần sát  
3. **Sprint 3:** Khóa schema `BaziFacts`, version Core → Classical Reasoning Engine  

## Kiến trúc mục tiêu

```text
Birth input → Timezone / convention normalization
  → Deterministic Core Calculator → BaziFacts
  → Classical Reasoning Engine → AI Narrator
```

AI không tự tính lại facts Core đã xuất deterministic.
