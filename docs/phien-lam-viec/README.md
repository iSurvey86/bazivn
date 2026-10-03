# Phiên làm việc — Handoff giữa các máy

Mục đích: đồng bộ **tóm tắt trao đổi** qua git khi đổi máy (Cursor không mang theo lịch sử chat).

Mẫu lấy từ ksnpsc, chỉnh cho BaziVN: repo này chưa có modal HDSD hay màn «Có gì mới» trong app. HDSD và changelog chỉ là file Markdown.

## File

| File | Vai trò |
|------|---------|
| [HANDOFF.md](./HANDOFF.md) | **Đọc đầu tiên** — block mới nhất ở trên |
| `YYYY-MM-DD-*.md` | Lưu trữ theo ngày (copy từ block HANDOFF khi phiên đáng nhớ) |

## Quy trình

**Máy A (cuối phiên) — khuyến nghị:**

```
làm cuối phiên đầy đủ
```

= HANDOFF (+ file ngày nếu cần) → workflow + HDSD + bump version + changelog (khi đổi nghiệp vụ/UX) → commit + push.

| Lệnh ngắn | Phạm vi |
|-----------|---------|
| `làm cuối phiên đầy đủ` | HANDOFF + (workflow / HDSD / version / changelog khi đủ điều kiện) + commit + push |
| `cập nhật HANDOFF → commit + push` | Chỉ HANDOFF + commit + push |
| `cập nhật HANDOFF` | Chỉ sửa HANDOFF (không commit trừ khi nhờ thêm) |

### Bước (1) — HANDOFF

Cập nhật `docs/phien-lam-viec/HANDOFF.md`:

- **Prepend** block mới lên đầu (sau phần hướng dẫn cố định), format:
  - `## YYYY-MM-DD — Tiêu đề ngắn`
  - Đã chốt / đã làm (bullet)
  - File chính (bảng hoặc list)
  - Việc tiếp (checkbox `- [ ]`)
  - Câu mở phiên sau (fenced quote)
  - Link file ngày nếu tạo

Nếu phiên dài hoặc nhiều quyết định: tạo thêm `docs/phien-lam-viec/YYYY-MM-DD-mo-ta-ngan.md` (copy nội dung block) và link từ HANDOFF.

### Bước (2) — workflow, HDSD, version, changelog

**Bắt buộc** trong 「làm cuối phiên đầy đủ」 khi phiên **đổi nghiệp vụ hoặc UX ổn định** (không phải mỗi lần sửa typo). Nếu phiên chỉ typo / không đổi nghiệp vụ: ghi rõ trong HANDOFF «không bump / không sửa workflow·HDSD» rồi bỏ qua bước này.

1. **Workflow:** cập nhật `workflows/*.md` liên quan phiên. Không đụng file không liên quan.
2. **HDSD:** cập nhật `docs/hdsd/*.md` khi đổi hướng dẫn người dùng. Chưa có bài thì tạo file mới trong thư mục đó. Không có `hdsdMeta.js`.
3. **Bump version:** khi người dùng thấy thay đổi rõ trên phần mềm (tính năng / UX ổn định), tăng `version` trong `package.json` (semver patch hoặc minor). Không bump nếu chỉ sửa HANDOFF, workflow, hoặc HDSD.
4. **Changelog:** khi đã bump `package.json`, prepend mục vào `docs/changelog/CHANGELOG.md` (nhóm Mới / Cải thiện / Sửa lỗi, tiếng Việt nghiệp vụ). Chi tiết: `docs/changelog/README.md`. Không có `appChangelog.js`.

### Bước (3) — git

- `git status` / diff → commit message rõ (why) → `git push` (khi lệnh đầy đủ hoặc user yêu cầu push).
- Commit phải gồm cả thay đổi bước (1)+(2) nếu có.

## Phân vai với tài liệu khác

| Nội dung | Nơi ghi |
|----------|---------|
| Trao đổi / TODO phiên / quyết định tạm | `HANDOFF.md` |
| Workflow nghiệp vụ ổn định | `workflows/*.md` |
| Hướng dẫn user | `docs/hdsd/*.md` |
| Nhật ký phiên bản | `docs/changelog/CHANGELOG.md` |

## Dung lượng

Chỉ file `.md` vài KB — không ảnh hưởng app chạy, không commit `.next`, `node_modules`, hay `.data`.
