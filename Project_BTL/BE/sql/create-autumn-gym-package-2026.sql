-- Autumn membership. Prices below are BEFORE coupon THU2026GYM10.
-- No registration or payment is created. Reruns do not duplicate the package.
START TRANSACTION;
INSERT INTO goitap (TenGoi,Tier,MoTa,ThoiHan,Gia,TrangThai,NgayTao)
SELECT 'Mùa Thu 2026','GOLD PASS',
 'Tập gym 06:00–22:00, sử dụng khu cardio, máy tập sức mạnh và 8 lớp nhóm mỗi tháng. Thời hạn từ 3 tháng. Nhập mã THU2026GYM10 khi đăng ký trong thời gian chương trình để giảm thêm 10%.',
 30,590000,'ACTIVE',NOW()
WHERE NOT EXISTS(SELECT 1 FROM goitap WHERE TenGoi='Mùa Thu 2026');
SET @autumn_package=(SELECT GoiTapID FROM goitap WHERE TenGoi='Mùa Thu 2026' ORDER BY GoiTapID LIMIT 1);

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai)
SELECT @autumn_package,t.months,0,t.original_price,t.sale_price,'ACTIVE'
FROM (SELECT 3 months,1770000 original_price,1590000 sale_price
 UNION ALL SELECT 6,3540000,2990000
 UNION ALL SELECT 12,7080000,5590000) t
WHERE NOT EXISTS(SELECT 1 FROM goitapthoihan existing WHERE existing.GoiTapID=@autumn_package AND existing.SoThang=t.months);

INSERT INTO quyenloigoitap (GoiTapID,MaQuyenLoi,TenQuyenLoi,MoTa,SoLuong,ThuTu,TrangThai)
SELECT @autumn_package,b.code,b.title,b.description,b.quantity,b.sort_order,'ACTIVE'
FROM (SELECT 'ACCESS_HOURS' code,'Tập 06:00–22:00' title,'Sử dụng khu gym và cardio trong giờ mở cửa.' description,NULL quantity,1 sort_order
 UNION ALL SELECT 'LOCKER','Tủ đồ trong buổi tập','Sử dụng một tủ đồ cá nhân trong thời gian tập.',1,2
 UNION ALL SELECT 'GROUP_CLASS','8 lớp nhóm mỗi tháng','Tham gia lớp nhóm theo lịch phòng tập, đặt chỗ trước.',8,3
 UNION ALL SELECT 'ASSESSMENT','Đánh giá thể lực đầu kỳ','Đánh giá thể lực và tư vấn mục tiêu khi bắt đầu gói.',1,4) b
WHERE NOT EXISTS(SELECT 1 FROM quyenloigoitap existing WHERE existing.GoiTapID=@autumn_package AND existing.MaQuyenLoi=b.code);
COMMIT;
