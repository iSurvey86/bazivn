# Changelog — hướng dẫn duy trì

## Mục đích

Ghi **có gì mới theo từng phiên bản phần mềm**. BaziVN chưa có modal «Có gì mới» trong app — nguồn duy nhất là file Markdown này.

| Tài liệu | Vai trò |
|----------|---------|
| `docs/changelog/CHANGELOG.md` | Nhật ký người dùng / Git |
| HANDOFF / HDSD | Không thay changelog |

## Khi nào ghi

Khi bump `version` trong `package.json` vì user thấy thay đổi rõ (tính năng / UX). Không ghi nếu chỉ sửa HANDOFF, workflow, hoặc HDSD.

## Cách viết

- Tiếng Việt, mô tả **nghiệp vụ** (màn hình, hành động).
- Nhóm: **Mới** / **Cải thiện** / **Sửa lỗi**.
- Không ghi secret.
- Mới nhất ở **đầu** file.

## Cuối phiên đầy đủ

Khi đã bump `package.json`, prepend mục tương ứng vào `CHANGELOG.md`.
