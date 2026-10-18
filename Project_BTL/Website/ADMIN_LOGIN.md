# Đăng nhập quản trị

- Chạy BE bằng `npm start` (mặc định cổng 3000), sau đó chạy Website bằng `npm run dev`.
- Vite chuyển `/api` sang `http://localhost:3000`. Khi triển khai, đặt `VITE_API_BASE_URL` bằng URL backend hoặc cấu hình reverse proxy `/api`.
- Đăng nhập bằng Email/MatKhau của tài khoản có `VaiTro = Admin` (không phân biệt hoa thường) và `TrangThai = ACTIVE` trong bảng `taikhoan`.
- API: `POST /auth/admin/login` với `{ email, password }`; `GET /auth/admin/session` và `POST /auth/admin/logout` dùng `Authorization: Bearer <token>`.
- Phiên hết hạn sau 12 giờ. Chọn ghi nhớ dùng localStorage; bỏ chọn dùng sessionStorage. Không lưu mật khẩu. Phiên phía server lưu trong bộ nhớ, bị hủy khi BE khởi động lại.
- SSO, FIDO2 và Authenticator chưa được tích hợp. Số liệu và nhãn giám sát bên trái là nội dung minh họa theo thiết kế, chưa kết nối dữ liệu vận hành.
- API đăng nhập tương thích định dạng mật khẩu hiện tại của BE. Phạm vi này chỉ kiểm soát truy cập Dashboard; các API CRUD hiện hữu chưa được bổ sung middleware phân quyền.
- Kiểm thử API với cơ sở dữ liệu giả lập: `node --test BE/tests/admin-auth.test.js` từ thư mục gốc.
