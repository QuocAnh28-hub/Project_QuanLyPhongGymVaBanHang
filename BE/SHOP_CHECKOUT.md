# Giỏ hàng và thanh toán sản phẩm

## Khởi chạy

Trong thư mục `BE`:

```powershell
node scripts/migrate-shop-checkout.js
npm start
```

Migration `database/migrations/003_shop_checkout.sql` tạo bảng `shopcheckout` để liên kết đơn hàng với thanh toán, lưu thông tin người nhận và khóa chống gửi trùng. Chạy lại migration không xóa dữ liệu.

Các trang Mobile sử dụng `EXPO_PUBLIC_API_URL` như API giỏ hàng hiện tại. Trên điện thoại thật, đặt URL này thành IP máy chạy BE.

## Luồng dữ liệu

1. Giỏ hàng → Thanh toán: BE đọc lại sản phẩm, số lượng, giá và trạng thái bán; trả tổng tiền và phiên bản giỏ hàng.
2. Đặt hàng: một transaction ghi `donhang`, `chitietdonhang`, `thanhtoan` (PENDING), `shopcheckout`; xóa các dòng giỏ đã chuyển thành đơn và đặt `giohang.TrangThai = COMPLETED`.
3. Xác nhận đã thu tiền: một transaction cập nhật `thanhtoan = SUCCESS`, `donhang = CONFIRMED`, tạo `hoadon`. `CONFIRMED` là đã xác nhận, chưa phải đã giao hàng.
4. Mobile tự kiểm tra trạng thái 5 giây/lần khi màn thanh toán đang mở. Đơn đã tạo xuất hiện trong mục Đơn hàng và có thể mở lại để thanh toán.

BE tính tiền từ CSDL, không nhận tổng tiền/trạng thái do Mobile chỉ định. Mỗi lần đặt hàng có một `requestKey`; gửi lại cùng yêu cầu trả về đơn cũ. Mobile lưu yêu cầu trước khi gửi để khôi phục nếu mất mạng. Giá/giỏ thay đổi sẽ yêu cầu xem lại trước khi đặt.

Ảnh sản phẩm vẫn dùng ảnh shaker mặc định. Chưa áp dụng mã giảm giá/điểm thưởng vì chưa có quy tắc được xác định cho luồng này. Phí giao hàng lấy từ `SHOP_SHIPPING_FEE_VND`, mặc định 0; nhận tại CLB luôn 0.

## Chuyển khoản / tiền mặt

Mặc định `SHOP_PAYMENT_MODE=manual`. Màn chuyển khoản dùng ảnh VietQR có sẵn của dự án, hiển thị số tiền và nội dung `QAGYM DH<DonHangID> TT<ThanhToanID>` để đối soát. Không tự đánh dấu thành công khi khách bấm đã chuyển tiền.

Đặt `SHOP_PAYMENT_CONFIRM_KEY` trong `BE/.env` thành một khóa bí mật dành cho nhân viên/server, khởi động lại BE. Sau khi kiểm tra thực sự đã nhận tiền, gọi:

```http
POST /donhang/<DonHangID>/confirm-payment
Authorization: Bearer <SHOP_PAYMENT_CONFIRM_KEY>
```

Không đưa khóa này vào Mobile. API xác nhận có thể gọi lại mà không tạo thêm hóa đơn. Đây là xác nhận thủ công, chưa có webhook ngân hàng/cổng thanh toán. API khách hàng tiếp tục dùng `accountId` theo hợp đồng hiện tại của dự án; chưa có xác thực phiên phía server. Cần tích hợp xác thực phiên trước khi triển khai công khai.

## Demo bài tập

Trong `BE/.env`:

```dotenv
NODE_ENV=development
SHOP_PAYMENT_MODE=demo
```

Khởi động lại BE. Sau khi đặt hàng, màn thanh toán hiện nút **Mô phỏng thanh toán thành công**. Nút này gọi API, ghi SUCCESS/CONFIRMED và lập hóa đơn thật trong CSDL nhưng không thu tiền thật. Chế độ demo không hoạt động với `NODE_ENV=production`, và không hiển thị QR thu tiền thật.

## API

| Method | Đường dẫn | Công dụng |
| --- | --- | --- |
| GET | `/donhang/checkout/:accountId` | Xem lại giỏ, thông tin nhận hàng, phí giao |
| POST | `/donhang/checkout/:accountId` | Tạo đơn PENDING từ giỏ |
| GET | `/donhang/account/:accountId/orders` | Danh sách đơn của luồng mới |
| GET | `/donhang/account/:accountId/orders/:orderId` | Chi tiết đơn, thanh toán, hóa đơn |
| GET | `/donhang/account/:accountId/request/:requestKey` | Khôi phục đơn theo yêu cầu đã gửi |
| POST | `/donhang/account/:accountId/orders/:orderId/demo-confirm` | Xác nhận mô phỏng, chỉ khi bật demo |
| POST | `/donhang/:orderId/confirm-payment` | Nhân viên xác nhận đã thu tiền |

Các đơn cũ chưa có liên kết thanh toán không xuất hiện trong danh sách Mobile mới; không suy đoán ghép đơn với thanh toán theo số tiền/ngày.

## Kiểm tra

```powershell
node tests/shop-cart.test.js
node tests/shop-checkout.integration.js
```

Integration test cần MySQL và migration 003. Test tạo dữ liệu riêng bên trong transaction, dùng savepoint kiểm tra ghi đơn/thanh toán/hóa đơn và rollback tất cả dữ liệu thử ở cuối. Bộ test không kiểm tra UI trên thiết bị hay cổng thanh toán ngân hàng.
