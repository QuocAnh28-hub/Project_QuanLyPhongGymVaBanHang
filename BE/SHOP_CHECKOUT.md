# Thanh toán sản phẩm

Luồng độc lập với thanh toán gói tập/PT.

1. Mobile gửi JWT, lưu requestKey và toàn bộ nội dung yêu cầu trước khi gửi.
2. BE lấy giá từ database; transaction tạo đơn và thanh toán PENDING, shopcheckout có KhoID, rồi chuyển giỏ thành đơn.
3. VietQR được tạo tại chỗ với tài khoản đã cấu hình, số tiền và nội dung QAGYM DH<DonHangID> TT<ThanhToanID>. Không gọi dịch vụ ảnh QR bên ngoài.
4. Website Admin: Hóa đơn → chọn giao dịch sản phẩm → Xác nhận đã nhận tiền, chỉ sau khi kiểm tra tiền thực nhận.
5. Transaction kiểm tra/trừ kho, đặt SUCCESS/CONFIRMED và tạo một hóa đơn. Xác nhận lại không trừ kho hoặc tạo hóa đơn trùng.

## Cấu hình

BE/.env: SHOP_WAREHOUSE_ID, SHOP_SHIPPING_FEE_VND, SHOP_BANK_BIN, SHOP_BANK_ACCOUNT, SHOP_BANK_NAME.
Mobile: EXPO_PUBLIC_API_URL trỏ tới BE; điện thoại dùng IP LAN của máy chạy BE. authenticatedFetch thêm JWT hiện có.

POST /donhang/:orderId/confirm-payment yêu cầu JWT của STAFF/ADMIN. Không dùng SHOP_PAYMENT_CONFIRM_KEY. Khách hàng và khóa bí mật cũ bị từ chối. Endpoint demo trả 403 kể cả khi SHOP_PAYMENT_MODE=demo. Không giả lập giao dịch ngân hàng, không tự xác nhận khi hiển thị/quét QR.

## SQL

003_shop_checkout.sql hiện tạo KhoID NOT NULL cùng khóa ngoại tới kho. Database dự án đã có đúng cột này, không cần ALTER hay sửa dữ liệu. Cài đặt mới chạy node scripts/migrate-shop-checkout.js. Database cũ thiếu KhoID cần migration bổ sung và xác định kho của đơn cũ trước khi dùng.

## Gửi lặp và mất mạng

Giữ nguyên khóa và toàn bộ nội dung khi phản hồi bị mất. GET /donhang/account/:accountId/request/:requestKey khôi phục đơn; gửi lại cùng yêu cầu trả đơn cũ. Cùng khóa nhưng khác nội dung trả 409. Nếu kiểm tra khôi phục mất mạng, tiếp tục giữ yêu cầu. HTTP 400/409 chỉ cho sửa yêu cầu sau khi kiểm tra không có đơn đã tạo. Mobile thăm dò mỗi 5 giây; lỗi mạng có thông báo và nút tải lại.

## Kiểm tra

BE:
- node tests/shop-checkout.integration.js
- node tests/shop-checkout.concurrent.js
- node --test tests/shop-cart.test.js tests/shop-payment-qr.test.js

Mobile:
- node --test tests/shop-api.test.cjs tests/checkout-api.test.cjs
- npx tsc --noEmit

Integration rollback dữ liệu thử. Concurrency dùng database tạm rồi xóa. Không xác nhận thanh toán của người dùng thật.
