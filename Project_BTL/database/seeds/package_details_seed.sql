-- QA-Gym package detail seed
-- Assumes current test DB uses GoiTapID:
-- 1 Silver, 2 Gold, 3 Diamond, 4 Student.
-- Safe to run repeatedly because both tables have unique keys.

USE gym_management;

INSERT INTO GoiTapThoiHan
(GoiTapID, SoThang, ThangTang, GiaGoc, GiaBan, TrangThai)
VALUES
-- Silver: monthly 490,000
(1, 1,  0,   490000.00,   490000.00, 'ACTIVE'),
(1, 3,  0,  1470000.00,  1440000.00, 'ACTIVE'),
(1, 6,  0,  2940000.00,  2840000.00, 'ACTIVE'),
(1, 12, 0,  5880000.00,  5580000.00, 'ACTIVE'),

-- Gold: monthly 815,000
(2, 1,  0,   815000.00,   815000.00, 'ACTIVE'),
(2, 3,  0,  2445000.00,  2415000.00, 'ACTIVE'),
(2, 6,  0,  4890000.00,  4790000.00, 'ACTIVE'),
(2, 12, 0,  9780000.00,  9480000.00, 'ACTIVE'),

-- Diamond: exact values from Mobile package-logic.ts
(3, 1,  0,  1850000.00,  1850000.00, 'ACTIVE'),
(3, 3,  0,  5550000.00,  4770000.00, 'ACTIVE'),
(3, 6,  0, 11100000.00,  8520000.00, 'ACTIVE'),
(3, 12, 2, 15480000.00, 10990000.00, 'ACTIVE'),

-- Student: monthly 350,000
(4, 1,  0,   350000.00,   350000.00, 'ACTIVE'),
(4, 3,  0,  1050000.00,  1020000.00, 'ACTIVE'),
(4, 6,  0,  2100000.00,  2000000.00, 'ACTIVE'),
(4, 12, 0,  4200000.00,  3900000.00, 'ACTIVE')
ON DUPLICATE KEY UPDATE
ThangTang = VALUES(ThangTang),
GiaGoc = VALUES(GiaGoc),
GiaBan = VALUES(GiaBan),
TrangThai = VALUES(TrangThai);

INSERT INTO QuyenLoiGoiTap
(GoiTapID, MaQuyenLoi, TenQuyenLoi, MoTa, SoLuong, ThuTu, TrangThai)
VALUES
-- Silver
(1, 'ACCESS_HOURS', 'Tập 08:00 - 16:00', 'Khung giờ truy cập tiêu chuẩn dành cho Silver Pass.', NULL, 1, 'ACTIVE'),
(1, 'GYM_FLOOR', 'Phòng tập tạ máy & cardio', 'Sử dụng khu tạ máy và cardio.', NULL, 2, 'ACTIVE'),
(1, 'SMART_LOCKER', 'Tủ đồ cá nhân', 'Sử dụng tủ đồ trong thời gian tập.', NULL, 3, 'ACTIVE'),
(1, 'SHOWER', 'Phòng tắm', 'Sử dụng khu phòng tắm của câu lạc bộ.', NULL, 4, 'ACTIVE'),

-- Gold
(2, 'ACCESS_HOURS', 'Tập 06:00 - 22:00', 'Khung giờ truy cập mở rộng dành cho Gold VIP.', NULL, 1, 'ACTIVE'),
(2, 'GROUP_X', 'Group-X', 'Tham gia các lớp Group-X theo lịch.', NULL, 2, 'ACTIVE'),
(2, 'YOGA', 'Yoga', 'Tham gia các lớp Yoga theo lịch.', NULL, 3, 'ACTIVE'),
(2, 'SAUNA', 'Sauna', 'Sử dụng khu Sauna.', NULL, 4, 'ACTIVE'),
(2, 'INBODY', 'InBody', 'Theo dõi chỉ số cơ thể bằng InBody.', NULL, 5, 'ACTIVE'),

-- Diamond
(3, 'CHECKIN_24_7', 'Tập luyện không giới hạn 24/7', 'Tự do check-in bất kỳ lúc nào tại toàn bộ chi nhánh QA-Gym.', NULL, 1, 'ACTIVE'),
(3, 'PT_SESSION', '03 Buổi tập chuyên sâu 1-1', 'Huấn luyện cá nhân hoá cùng HLV Pro Master.', 3, 2, 'ACTIVE'),
(3, 'INBODY', 'Phân tích InBody 770 miễn phí', 'Theo dõi tỷ lệ mỡ, cơ nạc và các chỉ số cơ thể.', NULL, 3, 'ACTIVE'),
(3, 'GUEST_PASS', 'Đi cùng 01 bạn đồng hành', 'Quyền lợi khách đi cùng theo chính sách Diamond.', 4, 4, 'ACTIVE'),
(3, 'SAUNA', 'Tổ hợp Sauna Đá Muối Himalaya', 'Sử dụng khu Sauna và tiện ích phục hồi.', NULL, 5, 'ACTIVE'),
(3, 'DETOX', 'Nước Detox, Khăn tập & tiện ích hằng ngày', 'Quyền lợi phục vụ hằng ngày cho hội viên Diamond.', NULL, 6, 'ACTIVE'),
(3, 'PRO_SHOP_DISCOUNT', 'Giảm 15% tại QA Pro Shop', 'Ưu đãi dành cho sản phẩm tại QA Pro Shop.', NULL, 7, 'ACTIVE'),
(3, 'GROUP_X', 'Group-X', 'Tham gia các lớp Group-X theo lịch.', NULL, 8, 'ACTIVE'),
(3, 'YOGA', 'Yoga', 'Tham gia các lớp Yoga theo lịch.', NULL, 9, 'ACTIVE'),
(3, 'SMART_LOCKER', 'Smart Locker', 'Sử dụng tủ locker thông minh.', NULL, 10, 'ACTIVE'),

-- Student
(4, 'ACCESS_HOURS', 'Tập 08:00 - 17:00', 'Khung giờ dành cho gói Student / HSSV.', NULL, 1, 'ACTIVE'),
(4, 'GYM_FLOOR', 'Phòng tập tạ máy & cardio', 'Sử dụng khu tạ máy và cardio.', NULL, 2, 'ACTIVE'),
(4, 'SMART_LOCKER', 'Tủ đồ cá nhân', 'Sử dụng tủ đồ trong thời gian tập.', NULL, 3, 'ACTIVE')
ON DUPLICATE KEY UPDATE
TenQuyenLoi = VALUES(TenQuyenLoi),
MoTa = VALUES(MoTa),
SoLuong = VALUES(SoLuong),
ThuTu = VALUES(ThuTu),
TrangThai = VALUES(TrangThai);

-- Verification
SELECT * FROM GoiTapThoiHan ORDER BY GoiTapID, SoThang;
SELECT * FROM QuyenLoiGoiTap ORDER BY GoiTapID, ThuTu, QuyenLoiID;
