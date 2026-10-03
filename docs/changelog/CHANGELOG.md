# Changelog

Mới nhất ở trên. Chỉ thêm mục khi bump `version` trong `package.json`.

## 0.3.0

### Mới

- Đăng ký luận giải / mệnh thư: chọn nguồn lá số, trường phái, khóa kiểm tra, thanh toán demo, cấp Mã mệnh thư.
- Phương thức A (độc lập), B (nghiệm chứng quá khứ), C (hiệu chỉnh / tìm giờ sinh khi không rõ giờ).
- Form sau thanh toán theo phương thức; QR thanh toán demo.

### Cải thiện

- Tick **Không rõ giờ sinh** trên form lập lá số và form sửa; dùng tạm 12:00, sau thanh toán mở C.
- Mã mệnh thư alphabet an toàn, khóa lúc thanh toán; mô tả trường phái theo nhu cầu người dùng.

### Sửa lỗi

- Tách format mã khỏi module `fs` — hết lỗi build khi mở checkout trên client.

## 0.2.0

### Mới

- Catalog Thần sát 2.0 (thêm nhóm phụ trợ; đánh dấu ngày đặc biệt tách riêng, không lẫn danh sách thần sát).
- Panel chi tiết Đại vận (2 cột): quan hệ với nguyên cục, cấu trúc, thần sát — chỉ hiện trên web.

### Cải thiện

- Lá số gọn hơn: bỏ khung Khí trạng, Dụng thần, Nhật trụ đặc thù, Dữ liệu cấu trúc.
- Lưu niên năm chọn: bố cục 2 cột, đồng bộ cỡ chữ; tuổi và năm tách dòng.
- Xuất PNG Đại vận gọn 5 dòng; thần sát tô màu cát/hung, ngăn bằng dấu phẩy.

### Sửa lỗi

- Nhãn quan hệ can/chi không còn dính chữ (ví dụ «Tý Mùi hại»).

## 0.1.1

### Cải thiện

- Giao diện tông ấm, nhẹ; thanh thương hiệu và form lập lá số dễ đọc hơn.
- Lá số: mỗi khung một màu tiêu đề; ô Thông tin; căn giữa cột; cột Tuần/Không rộng hơn.
- Phó tinh ghi tên đầy đủ; bỏ chú thích viết tắt dưới chân trang.
- Đại vận xếp lưới hai hàng, cột đều, không kéo ngang; thần sát dài xuống dòng.

## 0.1.0

### Mới

- Lập và xem lá số tứ trụ. Locale mặc định tiếng Việt.
