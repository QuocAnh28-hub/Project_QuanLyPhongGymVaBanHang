-- Complete the audit: promotions, legacy orders, stock ledger and timestamps.
START TRANSACTION;

-- Keep actual attendance recorded today, rather than applying demo time variation.
UPDATE checkin SET ThoiGianCheckIn='2026-10-08 07:53:38',
  ThoiGianCheckOut='2026-10-08 08:29:24' WHERE CheckInID=385;

-- Newly seeded pending/in-transit orders may not have a future creation time.
UPDATE donhang d JOIN shopcheckout s USING(DonHangID)
SET d.NgayDat=TIMESTAMP(CURDATE(),MAKETIME(7,MOD(d.DonHangID,60),0))
WHERE s.RequestKey LIKE 'demo20261007-%' AND d.NgayDat>NOW();
UPDATE thanhtoan p JOIN shopcheckout s USING(ThanhToanID) JOIN donhang d USING(DonHangID)
SET p.NgayThanhToan=d.NgayDat WHERE s.RequestKey LIKE 'demo20261007-%';
UPDATE apdungkhuyenmaidonhang a JOIN donhang d USING(DonHangID)
SET a.NgayApDung=d.NgayDat;
UPDATE thongbao n JOIN donhang d
ON d.DonHangID=CAST(JSON_UNQUOTE(JSON_EXTRACT(n.ActionPayload,'$.DonHangID')) AS UNSIGNED)
SET n.NgayTao=d.NgayDat WHERE n.Loai='ORDER_STATUS' AND n.NgayTao>NOW();

-- Consolidate identical campaigns, preserving their applications and discounts.
UPDATE apdungkhuyenmaidonhang SET KhuyenMaiID=6 WHERE KhuyenMaiID IN (7,8,9);
UPDATE apdungkhuyenmaigoitap SET KhuyenMaiID=10 WHERE KhuyenMaiID IN (11,12,13);
UPDATE apdungkhuyenmaipt SET KhuyenMaiID=14 WHERE KhuyenMaiID IN (15,16,17);
DELETE FROM khuyenmai WHERE KhuyenMaiID IN (7,8,9,11,12,13,15,16,17);
UPDATE khuyenmai SET MaKhuyenMai='THU2026SHOP10',TenKhuyenMai='Mua sắm mùa thu giảm 10%',
  DieuKien='Giảm 10% cho sản phẩm tại cửa hàng, không cộng dồn ưu đãi.' WHERE KhuyenMaiID=6;
UPDATE khuyenmai SET MaKhuyenMai='THU2026GYM10',TenKhuyenMai='Đăng ký gói tập mùa thu giảm 10%',
  DieuKien='Giảm 10% khi đăng ký gói tập từ 3 tháng, không cộng dồn ưu đãi.' WHERE KhuyenMaiID=10;
UPDATE khuyenmai SET MaKhuyenMai='THU2026PT5',TenKhuyenMai='Buổi huấn luyện cá nhân giảm 5%',
  DieuKien='Giảm 5% cho buổi huấn luyện cá nhân, không cộng dồn ưu đãi.' WHERE KhuyenMaiID=14;

-- Legacy PT prices include their applied promotions, just like newer bookings.
UPDATE thuept t JOIN pt p USING(PTID)
SET t.GiaThue=p.GiaThue-COALESCE((SELECT SUM(a.SoTienGiam) FROM apdungkhuyenmaipt a WHERE a.ThuePTID=t.ThuePTID),0)
WHERE t.ThuePTID IN (1,2);
UPDATE thanhtoan SET SoTien=200000,NoiDung='Thanh toán buổi PT #2 sau giảm 100.000đ' WHERE ThanhToanID=5;

-- Complete old confirmed demo order, and attach all three legacy orders to checkout.
UPDATE donhang SET TrangThai='COMPLETED',GhiChu='Đã nhận hàng tại quầy, áp dụng giảm 100.000đ.' WHERE DonHangID=2;
INSERT INTO thanhtoan (HoiVienID,NhanVienID,SoTien,PhuongThucThanhToan,NgayThanhToan,NoiDung,TrangThai)
SELECT d.HoiVienID,1,d.TongTien,'CHUYEN_KHOAN',d.NgayDat,CONCAT('Thanh toán đơn hàng #',d.DonHangID),'SUCCESS'
FROM donhang d WHERE d.DonHangID IN (2,3)
AND NOT EXISTS(SELECT 1 FROM thanhtoan p WHERE p.NoiDung=CONCAT('Thanh toán đơn hàng #',d.DonHangID));
INSERT INTO shopcheckout (DonHangID,ThanhToanID,HoiVienID,KhoID,RequestKey,RequestHash,TenNguoiNhan,SoDienThoai,CachNhan,PhiVanChuyen)
SELECT d.DonHangID,p.ThanhToanID,d.HoiVienID,1,CONCAT('legacy-order-',d.DonHangID),
  SHA2(CONCAT('legacy-order-',d.DonHangID),256),h.HoTen,COALESCE(h.SoDienThoai,'0900000000'),'PICKUP',0
FROM donhang d JOIN hoivien h USING(HoiVienID)
JOIN thanhtoan p ON p.NoiDung=CONCAT('Thanh toán đơn hàng #',d.DonHangID)
WHERE d.DonHangID IN (1,2,3) AND NOT EXISTS(SELECT 1 FROM shopcheckout s WHERE s.DonHangID=d.DonHangID);
UPDATE donhang SET DiaChiGiaoHang=NULL WHERE DonHangID IN (1,2,3);

-- Opening replenishment explains stock for original products that previously had no receipts.
INSERT INTO phieunhap (KhoID,NhanVienID,NgayNhap,TongTien,GhiChu,TrangThai)
SELECT 1,2,'2026-08-31 09:00:00',0,'Nhập bổ sung hàng đầu tháng 9 - đối soát kho','COMPLETED'
WHERE NOT EXISTS(SELECT 1 FROM phieunhap WHERE GhiChu='Nhập bổ sung hàng đầu tháng 9 - đối soát kho');
INSERT INTO chitietphieunhap (PhieuNhapID,SanPhamID,SoLuong,DonGia,ThanhTien)
SELECT p.PhieuNhapID,s.SanPhamID,20,ROUND(s.GiaBan*0.65/1000)*1000,20*ROUND(s.GiaBan*0.65/1000)*1000
FROM phieunhap p CROSS JOIN sanpham s WHERE p.GhiChu='Nhập bổ sung hàng đầu tháng 9 - đối soát kho'
AND s.SanPhamID BETWEEN 1 AND 8
AND NOT EXISTS(SELECT 1 FROM chitietphieunhap c WHERE c.PhieuNhapID=p.PhieuNhapID AND c.SanPhamID=s.SanPhamID);
UPDATE phieunhap p SET TongTien=(SELECT SUM(ThanhTien) FROM chitietphieunhap c WHERE c.PhieuNhapID=p.PhieuNhapID)
WHERE p.GhiChu='Nhập bổ sung hàng đầu tháng 9 - đối soát kho';
INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon,NgayCapNhat)
SELECT p.KhoID,c.SanPhamID,SUM(c.SoLuong)-COALESCE((SELECT SUM(cd.SoLuong) FROM chitietdonhang cd
  JOIN donhang d USING(DonHangID) JOIN shopcheckout s USING(DonHangID)
  WHERE s.KhoID=p.KhoID AND cd.SanPhamID=c.SanPhamID AND d.TrangThai IN ('CONFIRMED','PROCESSING','COMPLETED')),0),NOW()
FROM phieunhap p JOIN chitietphieunhap c USING(PhieuNhapID)
WHERE p.TrangThai='COMPLETED' GROUP BY p.KhoID,c.SanPhamID
ON DUPLICATE KEY UPDATE SoLuongTon=VALUES(SoLuongTon),NgayCapNhat=VALUES(NgayCapNhat);

INSERT INTO hoadon (ThanhToanID,NhanVienID,NgayLap,TongTien,TrangThai)
SELECT p.ThanhToanID,p.NhanVienID,p.NgayThanhToan,p.SoTien,'ACTIVE' FROM thanhtoan p
WHERE p.TrangThai='SUCCESS' AND NOT EXISTS(SELECT 1 FROM hoadon h WHERE h.ThanhToanID=p.ThanhToanID);
UPDATE hoadon h JOIN thanhtoan p USING(ThanhToanID) SET h.TongTien=p.SoTien,h.NgayLap=p.NgayThanhToan;
COMMIT;
