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

003_shop_checkout.sql tạo bảng mới. 004_shop_checkout_warehouse.sql nâng cấp bảng cũ thiếu KhoID: thêm cột nullable và khóa ngoại, giữ nguyên mọi bản ghi và để kho lịch sử chưa biết là NULL. Không tự gán kho, xóa dữ liệu, đổi thanh toán hoặc điều chỉnh tồn kho. Chạy lại an toàn. Lệnh node scripts/migrate-shop-checkout.js áp dụng cả 003 và 004; chỉ chạy khi đã được người quản lý cho phép. Đơn cũ có KhoID NULL không hiển thị QR để thu tiền trước khi nhân viên xử lý kho.

## Tồn kho và cấu hình ngân hàng

Một đơn xuất từ một kho đủ tất cả sản phẩm, ưu tiên SHOP_WAREHOUSE_ID rồi dùng kho hoạt động khác theo quy tắc hiện có; không tự gộp số lượng nhiều kho. Đơn PENDING với thanh toán PENDING giữ số lượng tại kho đã gắn. Số có thể đặt = tồn vật lý trừ lượng giữ cho đơn khác. Giữ hàng và tạo đơn được tuần tự hóa bằng khóa kho trong transaction. Khi xác nhận thu tiền, loại trừ chính đơn đang xác nhận khỏi lượng giữ, trừ tồn vật lý đúng một lần. Hủy đơn giải phóng lượng giữ; không tự hết hạn hoặc hủy khi chưa biết khách đã chuyển tiền hay chưa.

Nếu nhân viên điều chỉnh tồn kho ngoài luồng checkout hoặc dữ liệu cũ đã thiếu hàng, màn thanh toán kiểm tra lại và ẩn QR/hướng dẫn thu tiền, yêu cầu liên hệ nhân viên. Không thể bảo đảm hàng còn đủ nếu tồn kho bị thay đổi ngoài luồng sau khi khách đã quét QR.

Thiếu cấu hình ngân hàng: chặn tạo đơn chuyển khoản trước khi ghi dữ liệu, giữ nguyên giỏ và cho chọn tiền mặt. Lỗi polling/mạng: ẩn QR cũ cho đến khi tải lại trạng thái server. Các test migration chỉ chạy trên database tạm.

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
