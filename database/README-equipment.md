# Máy tập

Tạo bảng và khởi tạo danh mục 20 loại máy từ nội dung giới thiệu cũ:

```powershell
node BE/scripts/migrate-gym-equipment.js
```

Script sử dụng cấu hình MySQL trong `BE/.env`. Có thể chạy lại: không ghi đè thông tin máy đã được Admin sửa. Số lượng khởi tạo là 1 cho mỗi loại, vị trí để trống; cần cập nhật theo thiết bị thực tế tại phòng.

- Bảng: `maytap`, định nghĩa trong `005_gym_equipment.sql` và `CSDL.sql`.
- Dữ liệu khởi tạo: `seeds/gym_equipment.json`.
- Website: **Máy tập**, chỉ Admin được quản lý. Hỗ trợ ảnh URL hoặc upload JPG/PNG/WEBP tối đa 5 MB.
- API công khai `GET /maytap/active`: chỉ trả máy `ACTIVE`, dùng cho phần giới thiệu trang chủ Mobile.
- API quản trị: `GET/POST /maytap`, `PUT/DELETE /maytap/:id`, `POST /maytap/upload-image`.
- Máy `MAINTENANCE` hoặc `INACTIVE` không hiển thị trên Mobile. Mobile tải lại khi quay về trang chủ và có nút thử lại khi mất kết nối.

Sau khi bổ sung route, khởi động lại backend đang chạy.

## Ảnh giới thiệu

Ảnh minh họa cho 20 loại máy được lưu tại `BE/uploads/equipment/`. Danh sách URL ảnh gốc và trang nguồn nằm trong `seeds/equipment_images.json`: Because It Matters Fitness, Life Fitness, Concept2 và HSE Fitness. Đây là ảnh tham khảo loại máy, không phải ảnh chụp phòng QA-Gym. Máy mở đùi và khép đùi dùng ảnh thiết bị kết hợp hai chức năng.

```powershell
node BE/scripts/import-equipment-images.js
```

Script tải ảnh thiếu, kiểm tra định dạng, bổ sung trường `HinhAnh` cho các máy chưa có ảnh và cập nhật seed cho môi trường mới. Ảnh đã được Admin thay không bị ghi đè. Các file ảnh tải về cần được giữ cùng thư mục `uploads` khi chuyển backend sang máy khác.
