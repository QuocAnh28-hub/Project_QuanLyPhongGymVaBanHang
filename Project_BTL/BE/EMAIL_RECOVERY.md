# Khôi phục mật khẩu qua email

Điền các biến sau trong `BE/.env` (xem `.env.example`):

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="QA-Gym <your-email@gmail.com>"
```

Với Gmail, bật xác minh hai bước và tạo App Password cho tài khoản gửi mail; dùng App Password ở `SMTP_PASS`. Không dùng mật khẩu đăng nhập Gmail. Có thể thay cấu hình bằng SMTP của nhà cung cấp khác. Cổng 587 sử dụng STARTTLS; cổng 465 sử dụng TLS ngay khi kết nối. Tham khảo https://nodemailer.com/smtp và https://nodemailer.com/usage/using-gmail/.

Khởi động lại BE bằng `npm run dev` hoặc `npm start`. Mobile chỉ cần `EXPO_PUBLIC_API_URL` trỏ tới BE; tuyệt đối không đưa mật khẩu SMTP vào biến `EXPO_PUBLIC_*`.

## API

- `POST /auth/forgot-password`: `{ "email": "..." }`. Gửi OTP 6 số cho CUSTOMER/ACTIVE; phản hồi chung kể cả khi email không tồn tại.
- `POST /auth/verify-otp`: `{ "email": "...", "code": "123456" }`. Trả `resetToken` khi mã hợp lệ.
- `POST /auth/reset-password`: `{ "email": "...", "resetToken": "...", "password": "..." }`. Cập nhật mật khẩu trong MySQL.

OTP có hạn 2 phút, tối đa 5 lần nhập; gửi lại sau 60 giây, tối đa 5 yêu cầu/email/giờ và 20 yêu cầu/IP/giờ. Token đặt lại có hạn 5 phút, chỉ dùng một lần. Mã và token không được ghi log; chỉ lưu hash trong bộ nhớ BE. Khởi động lại BE sẽ hủy phiên khôi phục. Thiết kế hiện tại dành cho một tiến trình BE; cần chuyển store và bộ giới hạn sang Redis/DB trước khi chạy nhiều tiến trình.

Mật khẩu vẫn sử dụng định dạng hiện tại của API đăng nhập. API CRUD tài khoản hiện có trả về mật khẩu và cho phép sửa tài khoản không qua xác thực; luồng OTP không khắc phục các lỗ hổng đó. Trước khi triển khai công khai cần chuyển xác thực sang BE, hash mật khẩu, bảo vệ API tài khoản và thu hồi phiên khi đổi mật khẩu.

## Kiểm tra

Chạy `node --test tests/recovery.test.js` trong BE. Test dùng mail và DB giả, không gửi email thật.

Kiểm tra thực tế: dùng email của một hội viên đang ACTIVE, mở Quên mật khẩu, nhận mã trong hộp thư/thư rác, xác thực và đổi mật khẩu. Đăng nhập lại bằng mật khẩu mới; mật khẩu cũ phải thất bại. Kiểm tra thêm mã sai, mã hết hạn và gửi lại mã.
