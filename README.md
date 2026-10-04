# Làm theo lời Bác

Website học tập môn Tư tưởng Hồ Chí Minh, gồm hành trình tư liệu có chuyển động khi cuộn, 10 chủ đề trò chơi với 64 tình huống, 19 mốc thời gian và sổ tay lý thuyết.

Bản công khai: [Làm theo lời Bác](https://minhdq245.github.io/lam-theo-loi-bac/).

GitHub Actions tự triển khai GitHub Pages khi có cập nhật trên nhánh `main`. File HTML gốc được dùng để tạo trang `index.html` trong bản triển khai; chỉ cần sửa `lam-theo-loi-bac.html` và thư mục `assets`.

## Mở website

Trong thư mục dự án, chạy:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Mở [website trên máy](http://127.0.0.1:4173/lam-theo-loi-bac.html).

Có thể mở trực tiếp `lam-theo-loi-bac.html` để đọc và chơi. Nên dùng địa chỉ HTTP ở trên để trình phát YouTube nhận được thông tin nguồn trang. Âm nhạc và Google Fonts cần Internet; ảnh tư liệu đã được lưu trong dự án.

## Các phần chính

- `lam-theo-loi-bac.html`: nội dung, bộ máy trò chơi, dòng thời gian, lý thuyết và cấu trúc trang.
- `assets/experience.css`: giao diện giấy ngà, đỏ trầm, bố cục máy tính/điện thoại và hiệu ứng.
- `assets/experience.js`: xuất hiện khi cuộn, parallax, thanh tiến độ, xem ảnh lớn, nguồn tư liệu và nhạc.
- `assets/heritage.css` và `assets/heritage.js`: nền ảnh thật, cờ Đảng/cờ Tổ quốc và ảnh lịch sử theo từng chủ đề.
- `assets/images/`: ảnh tư liệu và ảnh nền, gồm nguồn Báo Nhân Dân, TTXVN, các bảo tàng và VOV.
- `assets/sources.json`: nguồn, tác giả và thông tin quyền ảnh của từng tư liệu. Có thể đọc ngay trong website qua “Nguồn ảnh & âm nhạc”.

Nhạc chỉ tải khi mở “Giai điệu về Bác”; chọn ca khúc và bấm phát trong video. Đóng khung nhạc để dừng. Trình phát có liên kết mở YouTube trực tiếp khi nhúng không khả dụng.

Website hỗ trợ nền sáng/tối, lưu điểm trên trình duyệt, thao tác bàn phím, chú thích ảnh và tùy chọn giảm chuyển động của hệ điều hành. Khi di chuyển hoặc chia sẻ dự án, giữ nguyên thư mục `assets` bên cạnh file HTML.

Ảnh từ các báo Việt Nam được ghi nguồn gốc và đơn vị cung cấp trong mục nguồn tư liệu; không được gán giấy phép mở. Quốc kỳ và cờ Đảng dùng SVG theo mẫu Wikimedia Commons; cờ Đảng được ghi công và liên kết CC BY-SA 3.0.
