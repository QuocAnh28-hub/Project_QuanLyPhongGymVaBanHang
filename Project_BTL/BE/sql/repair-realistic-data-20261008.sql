-- Audited cleanup and replacement of fictional demo data.

-- Requires the private pre-change backup; review before rerunning.

START TRANSACTION;

DELETE FROM thongbao WHERE CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.ThanhToanID')) AS UNSIGNED) IN (6, 8, 9, 10, 11, 12, 14, 15, 21, 40, 41, 42, 43, 47, 48);

DELETE FROM hoadon WHERE ThanhToanID IN (6, 8, 9, 10, 11, 12, 14, 15, 21, 40, 41, 42, 43, 47, 48);

DELETE FROM thanhtoan WHERE ThanhToanID IN (6, 8, 9, 10, 11, 12, 14, 15, 21, 40, 41, 42, 43, 47, 48);

DELETE FROM dangkygoitap WHERE DangKyID IN (7, 8, 10, 11, 12, 15, 16, 19, 20, 21, 22, 23, 24, 25, 9);

DELETE FROM goitap WHERE GoiTapID IN (6, 12);

DELETE FROM thongbao WHERE CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.ThuePTID')) AS UNSIGNED) IN (4, 5);

DELETE FROM thuept WHERE ThuePTID IN (4, 5);

UPDATE goitap SET TenGoi=TRIM(REPLACE(TenGoi,'DIAMOND TEST BACKEND','Diamond toàn diện'));

UPDATE sanpham SET TenSanPham='Pre-workout không caffeine 30 khẩu phần', MoTa='Dinh dưỡng thể thao trước buổi tập; sử dụng theo hướng dẫn trên nhãn.' WHERE TenSanPham='Pre-workout Test';

UPDATE sanpham SET TenSanPham='Dây kéo lưng cotton' WHERE SanPhamID=5 AND TenSanPham='Dây kéo lưng';

UPDATE sanpham SET TenSanPham='Dây kéo lưng có đệm cổ tay' WHERE SanPhamID=26 AND TenSanPham='Dây kéo lưng';

UPDATE sanpham SET TenSanPham='Găng tay tập gym có đệm' WHERE SanPhamID=4 AND TenSanPham='Găng tay tập gym';

UPDATE sanpham SET TenSanPham='Găng tay tập gym thoáng khí' WHERE SanPhamID=29 AND TenSanPham='Găng tay tập gym';

UPDATE goitapthoihan t JOIN goitap g USING(GoiTapID) SET t.GiaGoc=g.Gia*t.SoThang, t.GiaBan=ROUND(t.GiaBan/1000)*1000 WHERE t.GoiTapID NOT IN (1,2,3,4);

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Ngọc Linh', `ChieuCao` = 155, `CanNang` = 49.3 WHERE `HoiVienID`=13;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Ngọc Linh' WHERE HoiVienID=13;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Minh Quân', `ChieuCao` = 168, `CanNang` = 60.7 WHERE `HoiVienID`=14;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Minh Quân' WHERE HoiVienID=14;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Thu Hà', `ChieuCao` = 157, `CanNang` = 55.5 WHERE `HoiVienID`=15;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Thu Hà' WHERE HoiVienID=15;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Quốc Bảo', `ChieuCao` = 170, `CanNang` = 67.9 WHERE `HoiVienID`=16;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Quốc Bảo' WHERE HoiVienID=16;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Hải Yến', `ChieuCao` = 159, `CanNang` = 61.9 WHERE `HoiVienID`=17;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Hải Yến' WHERE HoiVienID=17;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Đức Huy', `ChieuCao` = 172, `CanNang` = 60.6 WHERE `HoiVienID`=18;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Đức Huy' WHERE HoiVienID=18;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Phương Mai', `ChieuCao` = 161, `CanNang` = 55.7 WHERE `HoiVienID`=19;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Phương Mai' WHERE HoiVienID=19;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Tuấn Kiệt', `ChieuCao` = 174, `CanNang` = 68.1 WHERE `HoiVienID`=20;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Tuấn Kiệt' WHERE HoiVienID=20;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Thanh Trúc', `ChieuCao` = 163, `CanNang` = 62.4 WHERE `HoiVienID`=21;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Thanh Trúc' WHERE HoiVienID=21;

UPDATE `hoivien` SET `HoTen` = 'Nguyễn Gia Khánh', `ChieuCao` = 176, `CanNang` = 75.9 WHERE `HoiVienID`=22;

UPDATE shopcheckout SET TenNguoiNhan='Nguyễn Gia Khánh' WHERE HoiVienID=22;

UPDATE `hoivien` SET `HoTen` = 'Trần Khánh Vy', `ChieuCao` = 165, `CanNang` = 55.8 WHERE `HoiVienID`=23;

UPDATE shopcheckout SET TenNguoiNhan='Trần Khánh Vy' WHERE HoiVienID=23;

UPDATE `hoivien` SET `HoTen` = 'Trần Anh Dũng', `ChieuCao` = 178, `CanNang` = 68.1 WHERE `HoiVienID`=24;

UPDATE shopcheckout SET TenNguoiNhan='Trần Anh Dũng' WHERE HoiVienID=24;

UPDATE `hoivien` SET `HoTen` = 'Trần Bảo Ngọc', `ChieuCao` = 167, `CanNang` = 62.8 WHERE `HoiVienID`=25;

UPDATE shopcheckout SET TenNguoiNhan='Trần Bảo Ngọc' WHERE HoiVienID=25;

UPDATE `hoivien` SET `HoTen` = 'Trần Thành Đạt', `ChieuCao` = 180, `CanNang` = 76.1 WHERE `HoiVienID`=26;

UPDATE shopcheckout SET TenNguoiNhan='Trần Thành Đạt' WHERE HoiVienID=26;

UPDATE `hoivien` SET `HoTen` = 'Trần Thùy Chi', `ChieuCao` = 155, `CanNang` = 58.9 WHERE `HoiVienID`=27;

UPDATE shopcheckout SET TenNguoiNhan='Trần Thùy Chi' WHERE HoiVienID=27;

UPDATE `hoivien` SET `HoTen` = 'Trần Hoàng Long', `ChieuCao` = 182, `CanNang` = 67.9 WHERE `HoiVienID`=28;

UPDATE shopcheckout SET TenNguoiNhan='Trần Hoàng Long' WHERE HoiVienID=28;

UPDATE `hoivien` SET `HoTen` = 'Trần Minh Anh', `ChieuCao` = 157, `CanNang` = 53 WHERE `HoiVienID`=29;

UPDATE shopcheckout SET TenNguoiNhan='Trần Minh Anh' WHERE HoiVienID=29;

UPDATE `hoivien` SET `HoTen` = 'Trần Nhật Nam', `ChieuCao` = 167, `CanNang` = 62.8 WHERE `HoiVienID`=30;

UPDATE shopcheckout SET TenNguoiNhan='Trần Nhật Nam' WHERE HoiVienID=30;

UPDATE `hoivien` SET `HoTen` = 'Trần Mỹ Hạnh', `ChieuCao` = 159, `CanNang` = 59.4 WHERE `HoiVienID`=31;

UPDATE shopcheckout SET TenNguoiNhan='Trần Mỹ Hạnh' WHERE HoiVienID=31;

UPDATE `hoivien` SET `HoTen` = 'Trần Quang Vinh', `ChieuCao` = 169, `CanNang` = 70 WHERE `HoiVienID`=32;

UPDATE shopcheckout SET TenNguoiNhan='Trần Quang Vinh' WHERE HoiVienID=32;

UPDATE `hoivien` SET `HoTen` = 'Lê Ngọc Linh', `ChieuCao` = 161, `CanNang` = 53.1 WHERE `HoiVienID`=33;

UPDATE shopcheckout SET TenNguoiNhan='Lê Ngọc Linh' WHERE HoiVienID=33;

UPDATE `hoivien` SET `HoTen` = 'Lê Minh Quân', `ChieuCao` = 171, `CanNang` = 62.9 WHERE `HoiVienID`=34;

UPDATE shopcheckout SET TenNguoiNhan='Lê Minh Quân' WHERE HoiVienID=34;

UPDATE `hoivien` SET `HoTen` = 'Lê Thu Hà', `ChieuCao` = 163, `CanNang` = 59.8 WHERE `HoiVienID`=35;

UPDATE shopcheckout SET TenNguoiNhan='Lê Thu Hà' WHERE HoiVienID=35;

UPDATE `hoivien` SET `HoTen` = 'Lê Quốc Bảo', `ChieuCao` = 173, `CanNang` = 70.3 WHERE `HoiVienID`=36;

UPDATE shopcheckout SET TenNguoiNhan='Lê Quốc Bảo' WHERE HoiVienID=36;

UPDATE `hoivien` SET `HoTen` = 'Lê Hải Yến', `ChieuCao` = 165, `CanNang` = 66.7 WHERE `HoiVienID`=37;

UPDATE shopcheckout SET TenNguoiNhan='Lê Hải Yến' WHERE HoiVienID=37;

UPDATE `hoivien` SET `HoTen` = 'Lê Đức Huy', `ChieuCao` = 175, `CanNang` = 62.8 WHERE `HoiVienID`=38;

UPDATE shopcheckout SET TenNguoiNhan='Lê Đức Huy' WHERE HoiVienID=38;

UPDATE `hoivien` SET `HoTen` = 'Lê Phương Mai', `ChieuCao` = 167, `CanNang` = 60 WHERE `HoiVienID`=39;

UPDATE shopcheckout SET TenNguoiNhan='Lê Phương Mai' WHERE HoiVienID=39;

UPDATE `hoivien` SET `HoTen` = 'Lê Tuấn Kiệt', `ChieuCao` = 177, `CanNang` = 70.5 WHERE `HoiVienID`=40;

UPDATE shopcheckout SET TenNguoiNhan='Lê Tuấn Kiệt' WHERE HoiVienID=40;

UPDATE `hoivien` SET `HoTen` = 'Lê Thanh Trúc', `ChieuCao` = 155, `CanNang` = 56.5 WHERE `HoiVienID`=41;

UPDATE shopcheckout SET TenNguoiNhan='Lê Thanh Trúc' WHERE HoiVienID=41;

UPDATE `hoivien` SET `HoTen` = 'Lê Gia Khánh', `ChieuCao` = 179, `CanNang` = 78.5 WHERE `HoiVienID`=42;

UPDATE shopcheckout SET TenNguoiNhan='Lê Gia Khánh' WHERE HoiVienID=42;

UPDATE `hoivien` SET `HoTen` = 'Phạm Khánh Vy', `ChieuCao` = 157, `CanNang` = 50.5 WHERE `HoiVienID`=43;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Khánh Vy' WHERE HoiVienID=43;

UPDATE `hoivien` SET `HoTen` = 'Phạm Anh Dũng', `ChieuCao` = 181, `CanNang` = 70.4 WHERE `HoiVienID`=44;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Anh Dũng' WHERE HoiVienID=44;

UPDATE `hoivien` SET `HoTen` = 'Phạm Bảo Ngọc', `ChieuCao` = 159, `CanNang` = 56.9 WHERE `HoiVienID`=45;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Bảo Ngọc' WHERE HoiVienID=45;

UPDATE `hoivien` SET `HoTen` = 'Phạm Thành Đạt', `ChieuCao` = 183, `CanNang` = 78.7 WHERE `HoiVienID`=46;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Thành Đạt' WHERE HoiVienID=46;

UPDATE `hoivien` SET `HoTen` = 'Phạm Thùy Chi', `ChieuCao` = 161, `CanNang` = 63.5 WHERE `HoiVienID`=47;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Thùy Chi' WHERE HoiVienID=47;

UPDATE `hoivien` SET `HoTen` = 'Phạm Hoàng Long', `ChieuCao` = 168, `CanNang` = 57.9 WHERE `HoiVienID`=48;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Hoàng Long' WHERE HoiVienID=48;

UPDATE `hoivien` SET `HoTen` = 'Phạm Minh Anh', `ChieuCao` = 163, `CanNang` = 57.1 WHERE `HoiVienID`=49;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Minh Anh' WHERE HoiVienID=49;

UPDATE `hoivien` SET `HoTen` = 'Phạm Nhật Nam', `ChieuCao` = 170, `CanNang` = 65 WHERE `HoiVienID`=50;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Nhật Nam' WHERE HoiVienID=50;

UPDATE `hoivien` SET `HoTen` = 'Phạm Mỹ Hạnh', `ChieuCao` = 165, `CanNang` = 64 WHERE `HoiVienID`=51;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Mỹ Hạnh' WHERE HoiVienID=51;

UPDATE `hoivien` SET `HoTen` = 'Phạm Quang Vinh', `ChieuCao` = 172, `CanNang` = 72.5 WHERE `HoiVienID`=52;

UPDATE shopcheckout SET TenNguoiNhan='Phạm Quang Vinh' WHERE HoiVienID=52;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Ngọc Linh', `ChieuCao` = 167, `CanNang` = 57.2 WHERE `HoiVienID`=53;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Ngọc Linh' WHERE HoiVienID=53;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Minh Quân', `ChieuCao` = 174, `CanNang` = 65.1 WHERE `HoiVienID`=54;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Minh Quân' WHERE HoiVienID=54;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Thu Hà', `ChieuCao` = 155, `CanNang` = 54.1 WHERE `HoiVienID`=55;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Thu Hà' WHERE HoiVienID=55;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Quốc Bảo', `ChieuCao` = 176, `CanNang` = 72.8 WHERE `HoiVienID`=56;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Quốc Bảo' WHERE HoiVienID=56;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Hải Yến', `ChieuCao` = 157, `CanNang` = 60.4 WHERE `HoiVienID`=57;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Hải Yến' WHERE HoiVienID=57;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Đức Huy', `ChieuCao` = 178, `CanNang` = 65 WHERE `HoiVienID`=58;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Đức Huy' WHERE HoiVienID=58;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Phương Mai', `ChieuCao` = 159, `CanNang` = 54.4 WHERE `HoiVienID`=59;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Phương Mai' WHERE HoiVienID=59;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Tuấn Kiệt', `ChieuCao` = 180, `CanNang` = 72.9 WHERE `HoiVienID`=60;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Tuấn Kiệt' WHERE HoiVienID=60;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Thanh Trúc', `ChieuCao` = 161, `CanNang` = 60.9 WHERE `HoiVienID`=61;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Thanh Trúc' WHERE HoiVienID=61;

UPDATE `hoivien` SET `HoTen` = 'Hoàng Gia Khánh', `ChieuCao` = 182, `CanNang` = 81.2 WHERE `HoiVienID`=62;

UPDATE shopcheckout SET TenNguoiNhan='Hoàng Gia Khánh' WHERE HoiVienID=62;

UPDATE `hoivien` SET `HoTen` = 'Vũ Khánh Vy', `ChieuCao` = 163, `CanNang` = 54.5 WHERE `HoiVienID`=63;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Khánh Vy' WHERE HoiVienID=63;

UPDATE `hoivien` SET `HoTen` = 'Vũ Anh Dũng', `ChieuCao` = 167, `CanNang` = 60 WHERE `HoiVienID`=64;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Anh Dũng' WHERE HoiVienID=64;

UPDATE `hoivien` SET `HoTen` = 'Vũ Bảo Ngọc', `ChieuCao` = 165, `CanNang` = 61.3 WHERE `HoiVienID`=65;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Bảo Ngọc' WHERE HoiVienID=65;

UPDATE `hoivien` SET `HoTen` = 'Vũ Thành Đạt', `ChieuCao` = 169, `CanNang` = 67.1 WHERE `HoiVienID`=66;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Thành Đạt' WHERE HoiVienID=66;

UPDATE `hoivien` SET `HoTen` = 'Vũ Thùy Chi', `ChieuCao` = 167, `CanNang` = 68.3 WHERE `HoiVienID`=67;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Thùy Chi' WHERE HoiVienID=67;

UPDATE `hoivien` SET `HoTen` = 'Vũ Hoàng Long', `ChieuCao` = 171, `CanNang` = 59.9 WHERE `HoiVienID`=68;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Hoàng Long' WHERE HoiVienID=68;

UPDATE `hoivien` SET `HoTen` = 'Vũ Minh Anh', `ChieuCao` = 155, `CanNang` = 51.7 WHERE `HoiVienID`=69;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Minh Anh' WHERE HoiVienID=69;

UPDATE `hoivien` SET `HoTen` = 'Vũ Nhật Nam', `ChieuCao` = 173, `CanNang` = 67.3 WHERE `HoiVienID`=70;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Nhật Nam' WHERE HoiVienID=70;

UPDATE `hoivien` SET `HoTen` = 'Vũ Mỹ Hạnh', `ChieuCao` = 157, `CanNang` = 57.9 WHERE `HoiVienID`=71;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Mỹ Hạnh' WHERE HoiVienID=71;

UPDATE `hoivien` SET `HoTen` = 'Vũ Quang Vinh', `ChieuCao` = 175, `CanNang` = 75 WHERE `HoiVienID`=72;

UPDATE shopcheckout SET TenNguoiNhan='Vũ Quang Vinh' WHERE HoiVienID=72;

UPDATE thanhtoan SET DangKyID=1 WHERE ThanhToanID=1 AND DangKyID IS NULL;

UPDATE thanhtoan SET DangKyID=2 WHERE ThanhToanID=2 AND DangKyID IS NULL;

UPDATE thanhtoan SET DangKyID=3 WHERE ThanhToanID=4 AND DangKyID IS NULL;

UPDATE thuept t JOIN lichpt l USING(LichPTID) SET t.TrangThai='CANCELLED',t.GhiChu='Đã hủy do chưa xác nhận trước giờ tập.' WHERE t.TrangThai='PENDING' AND TIMESTAMP(l.NgayLam,l.GioBatDau)<NOW();

UPDATE thuept t JOIN lichpt l USING(LichPTID) SET t.TrangThai='COMPLETED' WHERE t.TrangThai='CONFIRMED' AND TIMESTAMP(l.NgayLam,l.GioKetThuc)<NOW();

UPDATE thuept SET GhiChu='Buổi huấn luyện cá nhân: đánh giá tư thế và kỹ thuật vận động.' WHERE GhiChu='ccc';

UPDATE lichpt l SET TrangThai='BOOKED' WHERE EXISTS(SELECT 1 FROM thuept t WHERE t.LichPTID=l.LichPTID AND t.TrangThai IN ('PENDING','CONFIRMED','COMPLETED'));

UPDATE lichpt l SET TrangThai='AVAILABLE' WHERE TrangThai='BOOKED' AND NOT EXISTS(SELECT 1 FROM thuept t WHERE t.LichPTID=l.LichPTID AND t.TrangThai IN ('PENDING','CONFIRMED','COMPLETED'));

UPDATE apdungkhuyenmaigoitap a JOIN dangkygoitap d USING(DangKyID) JOIN goitapthoihan t USING(GoiTapThoiHanID) JOIN khuyenmai k USING(KhuyenMaiID) SET a.SoTienGiam=LEAST(t.GiaBan,ROUND((t.GiaBan*k.PhanTramGiam/100+k.SoTienGiam)/1000)*1000) WHERE d.HoiVienID IN (13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72);

UPDATE dangkygoitap d JOIN goitapthoihan t USING(GoiTapThoiHanID) SET d.GiaThanhToan=t.GiaBan-COALESCE((SELECT SUM(a.SoTienGiam) FROM apdungkhuyenmaigoitap a WHERE a.DangKyID=d.DangKyID),0) WHERE d.HoiVienID IN (13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72);

UPDATE thanhtoan p JOIN dangkygoitap d USING(DangKyID) SET p.SoTien=d.GiaThanhToan;

UPDATE dangkygoitap d JOIN goitapthoihan t USING(GoiTapThoiHanID) SET d.NgayKetThuc=DATE_SUB(DATE_ADD(d.NgayBatDau,INTERVAL (t.SoThang+t.ThangTang) MONTH),INTERVAL 1 DAY) WHERE d.NgayKetThuc>=d.NgayBatDau;

UPDATE dangkygoitap d SET d.TrangThai='CANCELLED' WHERE d.TrangThai='PENDING' AND EXISTS(SELECT 1 FROM thanhtoan p WHERE p.DangKyID=d.DangKyID AND p.TrangThai='CANCELLED');

UPDATE dangkygoitap SET TrangThai='EXPIRED' WHERE TrangThai='ACTIVE' AND NgayKetThuc<CURDATE();

UPDATE dangkygoitap d JOIN (SELECT HoiVienID,MAX(NgayKetThuc) lastEnd FROM (SELECT * FROM dangkygoitap) base WHERE TrangThai='ACTIVE' AND NgayBatDau<=CURDATE() AND NgayKetThuc>=CURDATE() GROUP BY HoiVienID) active USING(HoiVienID) JOIN goitapthoihan t USING(GoiTapThoiHanID) SET d.NgayBatDau=DATE_ADD(active.lastEnd,INTERVAL 1 DAY),d.NgayKetThuc=DATE_SUB(DATE_ADD(DATE_ADD(active.lastEnd,INTERVAL 1 DAY),INTERVAL (t.SoThang+t.ThangTang) MONTH),INTERVAL 1 DAY),d.TrangThai='PENDING' WHERE d.NgayBatDau>CURDATE() AND d.TrangThai='ACTIVE';

INSERT INTO goitap (TenGoi,Tier,MoTa,ThoiHan,Gia,TrangThai,NgayTao) VALUES ('Fitness cuối tuần','SILVER PASS','Tập thứ Bảy và Chủ nhật, 06:00–22:00.',30,290000,'ACTIVE','2026-09-01 09:00:00');

SET @new_gym_plan=LAST_INSERT_ID();

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,1,0,290000,290000,'ACTIVE');

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,3,0,870000,827000,'ACTIVE');

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,6,0,1740000,1566000,'ACTIVE');

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,12,0,3480000,3132000,'ACTIVE');

INSERT INTO quyenloigoitap (GoiTapID,MaQuyenLoi,TenQuyenLoi,MoTa,SoLuong,ThuTu) VALUES (@new_gym_plan,'ACCESS_HOURS','Tập thứ Bảy và Chủ nhật, 06:00–22:00.','Tập thứ Bảy và Chủ nhật, 06:00–22:00.',NULL,1),(@new_gym_plan,'LOCKER','Tủ đồ trong buổi tập','Sử dụng tủ đồ cá nhân trong thời gian tập.',1,2);

INSERT INTO goitap (TenGoi,Tier,MoTa,ThoiHan,Gia,TrangThai,NgayTao) VALUES ('Gym và Yoga buổi tối','GOLD PASS','Tập gym 17:00–22:00 và tham gia 8 lớp Yoga mỗi tháng.',30,750000,'ACTIVE','2026-09-01 09:00:00');

SET @new_gym_plan=LAST_INSERT_ID();

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,1,0,750000,750000,'ACTIVE');

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,3,0,2250000,2138000,'ACTIVE');

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,6,0,4500000,4050000,'ACTIVE');

INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,12,0,9000000,8100000,'ACTIVE');

INSERT INTO quyenloigoitap (GoiTapID,MaQuyenLoi,TenQuyenLoi,MoTa,SoLuong,ThuTu) VALUES (@new_gym_plan,'ACCESS_HOURS','Tập gym 17:00–22:00 và tham gia 8 lớp Yoga mỗi tháng.','Tập gym 17:00–22:00 và tham gia 8 lớp Yoga mỗi tháng.',NULL,1),(@new_gym_plan,'LOCKER','Tủ đồ trong buổi tập','Sử dụng tủ đồ cá nhân trong thời gian tập.',1,2);

INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayDangKy,NgayBatDau,NgayKetThuc,GiaThanhToan,TrangThai) VALUES (1,1,1,'2026-10-01 08:30:00','2026-10-01','2026-10-31',490000,'ACTIVE');

SET @replacement_registration=LAST_INSERT_ID();

INSERT INTO thanhtoan (DangKyID,HoiVienID,NhanVienID,SoTien,PhuongThucThanhToan,NgayThanhToan,NoiDung,TrangThai) VALUES (@replacement_registration,1,1,490000,'CHUYEN_KHOAN','2026-10-01 08:35:00','Thanh toán gói Khởi Đầu tháng 10','SUCCESS');

INSERT INTO hoadon (ThanhToanID,NhanVienID,NgayLap,TongTien) VALUES (LAST_INSERT_ID(),1,'2026-10-01 08:36:00',490000);

UPDATE `donhang` SET `NgayDat` = '2026-10-01 09:00:00' WHERE `DonHangID`=28;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 09:00:00' WHERE `ThanhToanID`=109;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 09:00:00' WHERE DonHangID=28;

UPDATE thongbao SET NgayTao='2026-10-01 09:00:00',NoiDung='Đơn hàng #28: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=28;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 10:07:00' WHERE `DonHangID`=29;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 10:07:00' WHERE `ThanhToanID`=110;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 10:07:00' WHERE DonHangID=29;

UPDATE thongbao SET NgayTao='2026-10-02 10:07:00',NoiDung='Đơn hàng #29: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=29;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 11:14:00' WHERE `DonHangID`=30;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 11:14:00' WHERE `ThanhToanID`=111;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 11:14:00' WHERE DonHangID=30;

UPDATE thongbao SET NgayTao='2026-10-03 11:14:00',NoiDung='Đơn hàng #30: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=30;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 12:21:00' WHERE `DonHangID`=31;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 12:21:00' WHERE `ThanhToanID`=112;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 12:21:00' WHERE DonHangID=31;

UPDATE thongbao SET NgayTao='2026-10-04 12:21:00',NoiDung='Đơn hàng #31: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=31;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 13:28:00' WHERE `DonHangID`=32;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 13:28:00' WHERE `ThanhToanID`=113;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 13:28:00' WHERE DonHangID=32;

UPDATE thongbao SET NgayTao='2026-10-05 13:28:00',NoiDung='Đơn hàng #32: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=32;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 14:35:00' WHERE `DonHangID`=33;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 14:35:00' WHERE `ThanhToanID`=114;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 14:35:00' WHERE DonHangID=33;

UPDATE thongbao SET NgayTao='2026-10-06 14:35:00',NoiDung='Đơn hàng #33: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=33;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 15:42:00' WHERE `DonHangID`=34;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 15:42:00' WHERE `ThanhToanID`=115;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 15:42:00' WHERE DonHangID=34;

UPDATE thongbao SET NgayTao='2026-10-01 15:42:00',NoiDung='Đơn hàng #34: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=34;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 16:49:00' WHERE `DonHangID`=35;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 16:49:00' WHERE `ThanhToanID`=116;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 16:49:00' WHERE DonHangID=35;

UPDATE thongbao SET NgayTao='2026-10-02 16:49:00',NoiDung='Đơn hàng #35: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=35;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 17:56:00' WHERE `DonHangID`=36;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 17:56:00' WHERE `ThanhToanID`=117;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 17:56:00' WHERE DonHangID=36;

UPDATE thongbao SET NgayTao='2026-10-03 17:56:00',NoiDung='Đơn hàng #36: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=36;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 18:03:00' WHERE `DonHangID`=37;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 18:03:00' WHERE `ThanhToanID`=118;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 18:03:00' WHERE DonHangID=37;

UPDATE thongbao SET NgayTao='2026-10-04 18:03:00',NoiDung='Đơn hàng #37: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=37;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 09:10:00' WHERE `DonHangID`=38;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 09:10:00' WHERE `ThanhToanID`=119;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 09:10:00' WHERE DonHangID=38;

UPDATE thongbao SET NgayTao='2026-10-05 09:10:00',NoiDung='Đơn hàng #38: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=38;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 10:17:00' WHERE `DonHangID`=39;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 10:17:00' WHERE `ThanhToanID`=120;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 10:17:00' WHERE DonHangID=39;

UPDATE thongbao SET NgayTao='2026-10-06 10:17:00',NoiDung='Đơn hàng #39: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=39;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 11:24:00' WHERE `DonHangID`=40;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 11:24:00' WHERE `ThanhToanID`=121;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 11:24:00' WHERE DonHangID=40;

UPDATE thongbao SET NgayTao='2026-10-01 11:24:00',NoiDung='Đơn hàng #40: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=40;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 12:31:00' WHERE `DonHangID`=41;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 12:31:00' WHERE `ThanhToanID`=122;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 12:31:00' WHERE DonHangID=41;

UPDATE thongbao SET NgayTao='2026-10-02 12:31:00',NoiDung='Đơn hàng #41: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=41;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 13:38:00' WHERE `DonHangID`=42;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 13:38:00' WHERE `ThanhToanID`=123;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 13:38:00' WHERE DonHangID=42;

UPDATE thongbao SET NgayTao='2026-10-03 13:38:00',NoiDung='Đơn hàng #42: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=42;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 14:45:00' WHERE `DonHangID`=43;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 14:45:00' WHERE `ThanhToanID`=124;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 14:45:00' WHERE DonHangID=43;

UPDATE thongbao SET NgayTao='2026-10-04 14:45:00',NoiDung='Đơn hàng #43: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=43;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 15:52:00' WHERE `DonHangID`=44;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 15:52:00' WHERE `ThanhToanID`=125;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 15:52:00' WHERE DonHangID=44;

UPDATE thongbao SET NgayTao='2026-10-05 15:52:00',NoiDung='Đơn hàng #44: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=44;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 16:59:00' WHERE `DonHangID`=45;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 16:59:00' WHERE `ThanhToanID`=126;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 16:59:00' WHERE DonHangID=45;

UPDATE thongbao SET NgayTao='2026-10-06 16:59:00',NoiDung='Đơn hàng #45: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=45;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 17:06:00' WHERE `DonHangID`=46;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 17:06:00' WHERE `ThanhToanID`=127;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 17:06:00' WHERE DonHangID=46;

UPDATE thongbao SET NgayTao='2026-10-01 17:06:00',NoiDung='Đơn hàng #46: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=46;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 18:13:00' WHERE `DonHangID`=47;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 18:13:00' WHERE `ThanhToanID`=128;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 18:13:00' WHERE DonHangID=47;

UPDATE thongbao SET NgayTao='2026-10-02 18:13:00',NoiDung='Đơn hàng #47: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=47;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 09:20:00' WHERE `DonHangID`=48;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 09:20:00' WHERE `ThanhToanID`=129;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 09:20:00' WHERE DonHangID=48;

UPDATE thongbao SET NgayTao='2026-10-03 09:20:00',NoiDung='Đơn hàng #48: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=48;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 10:27:00' WHERE `DonHangID`=49;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 10:27:00' WHERE `ThanhToanID`=130;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 10:27:00' WHERE DonHangID=49;

UPDATE thongbao SET NgayTao='2026-10-04 10:27:00',NoiDung='Đơn hàng #49: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=49;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 11:34:00' WHERE `DonHangID`=50;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 11:34:00' WHERE `ThanhToanID`=131;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 11:34:00' WHERE DonHangID=50;

UPDATE thongbao SET NgayTao='2026-10-05 11:34:00',NoiDung='Đơn hàng #50: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=50;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 12:41:00' WHERE `DonHangID`=51;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 12:41:00' WHERE `ThanhToanID`=132;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 12:41:00' WHERE DonHangID=51;

UPDATE thongbao SET NgayTao='2026-10-06 12:41:00',NoiDung='Đơn hàng #51: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=51;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 13:48:00' WHERE `DonHangID`=52;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 13:48:00' WHERE `ThanhToanID`=133;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 13:48:00' WHERE DonHangID=52;

UPDATE thongbao SET NgayTao='2026-10-01 13:48:00',NoiDung='Đơn hàng #52: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=52;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 14:55:00' WHERE `DonHangID`=53;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 14:55:00' WHERE `ThanhToanID`=134;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 14:55:00' WHERE DonHangID=53;

UPDATE thongbao SET NgayTao='2026-10-02 14:55:00',NoiDung='Đơn hàng #53: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=53;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 15:02:00' WHERE `DonHangID`=54;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 15:02:00' WHERE `ThanhToanID`=135;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 15:02:00' WHERE DonHangID=54;

UPDATE thongbao SET NgayTao='2026-10-03 15:02:00',NoiDung='Đơn hàng #54: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=54;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 16:09:00' WHERE `DonHangID`=55;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 16:09:00' WHERE `ThanhToanID`=136;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 16:09:00' WHERE DonHangID=55;

UPDATE thongbao SET NgayTao='2026-10-04 16:09:00',NoiDung='Đơn hàng #55: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=55;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 17:16:00' WHERE `DonHangID`=56;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 17:16:00' WHERE `ThanhToanID`=137;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 17:16:00' WHERE DonHangID=56;

UPDATE thongbao SET NgayTao='2026-10-05 17:16:00',NoiDung='Đơn hàng #56: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=56;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 18:23:00' WHERE `DonHangID`=57;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 18:23:00' WHERE `ThanhToanID`=138;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 18:23:00' WHERE DonHangID=57;

UPDATE thongbao SET NgayTao='2026-10-06 18:23:00',NoiDung='Đơn hàng #57: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=57;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 09:30:00' WHERE `DonHangID`=58;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 09:30:00' WHERE `ThanhToanID`=139;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 09:30:00' WHERE DonHangID=58;

UPDATE thongbao SET NgayTao='2026-10-01 09:30:00',NoiDung='Đơn hàng #58: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=58;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 10:37:00' WHERE `DonHangID`=59;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 10:37:00' WHERE `ThanhToanID`=140;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 10:37:00' WHERE DonHangID=59;

UPDATE thongbao SET NgayTao='2026-10-02 10:37:00',NoiDung='Đơn hàng #59: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=59;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 11:44:00' WHERE `DonHangID`=60;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 11:44:00' WHERE `ThanhToanID`=141;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 11:44:00' WHERE DonHangID=60;

UPDATE thongbao SET NgayTao='2026-10-03 11:44:00',NoiDung='Đơn hàng #60: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=60;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 12:51:00' WHERE `DonHangID`=61;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 12:51:00' WHERE `ThanhToanID`=142;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 12:51:00' WHERE DonHangID=61;

UPDATE thongbao SET NgayTao='2026-10-04 12:51:00',NoiDung='Đơn hàng #61: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=61;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 13:58:00' WHERE `DonHangID`=62;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 13:58:00' WHERE `ThanhToanID`=143;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 13:58:00' WHERE DonHangID=62;

UPDATE thongbao SET NgayTao='2026-10-05 13:58:00',NoiDung='Đơn hàng #62: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=62;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 14:05:00' WHERE `DonHangID`=63;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 14:05:00' WHERE `ThanhToanID`=144;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 14:05:00' WHERE DonHangID=63;

UPDATE thongbao SET NgayTao='2026-10-06 14:05:00',NoiDung='Đơn hàng #63: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=63;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 15:12:00' WHERE `DonHangID`=64;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 15:12:00' WHERE `ThanhToanID`=145;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 15:12:00' WHERE DonHangID=64;

UPDATE thongbao SET NgayTao='2026-10-01 15:12:00',NoiDung='Đơn hàng #64: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=64;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 16:19:00' WHERE `DonHangID`=65;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 16:19:00' WHERE `ThanhToanID`=146;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 16:19:00' WHERE DonHangID=65;

UPDATE thongbao SET NgayTao='2026-10-02 16:19:00',NoiDung='Đơn hàng #65: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=65;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 17:26:00' WHERE `DonHangID`=66;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 17:26:00' WHERE `ThanhToanID`=147;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 17:26:00' WHERE DonHangID=66;

UPDATE thongbao SET NgayTao='2026-10-03 17:26:00',NoiDung='Đơn hàng #66: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=66;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 18:33:00' WHERE `DonHangID`=67;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 18:33:00' WHERE `ThanhToanID`=148;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 18:33:00' WHERE DonHangID=67;

UPDATE thongbao SET NgayTao='2026-10-04 18:33:00',NoiDung='Đơn hàng #67: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=67;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 09:40:00' WHERE `DonHangID`=68;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 09:40:00' WHERE `ThanhToanID`=149;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 09:40:00' WHERE DonHangID=68;

UPDATE thongbao SET NgayTao='2026-10-05 09:40:00',NoiDung='Đơn hàng #68: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=68;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 10:47:00' WHERE `DonHangID`=69;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 10:47:00' WHERE `ThanhToanID`=150;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 10:47:00' WHERE DonHangID=69;

UPDATE thongbao SET NgayTao='2026-10-06 10:47:00',NoiDung='Đơn hàng #69: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=69;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 11:54:00' WHERE `DonHangID`=70;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 11:54:00' WHERE `ThanhToanID`=151;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 11:54:00' WHERE DonHangID=70;

UPDATE thongbao SET NgayTao='2026-10-01 11:54:00',NoiDung='Đơn hàng #70: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=70;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 12:01:00' WHERE `DonHangID`=71;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 12:01:00' WHERE `ThanhToanID`=152;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 12:01:00' WHERE DonHangID=71;

UPDATE thongbao SET NgayTao='2026-10-02 12:01:00',NoiDung='Đơn hàng #71: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=71;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 13:08:00' WHERE `DonHangID`=72;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 13:08:00' WHERE `ThanhToanID`=153;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 13:08:00' WHERE DonHangID=72;

UPDATE thongbao SET NgayTao='2026-10-03 13:08:00',NoiDung='Đơn hàng #72: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=72;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 14:15:00' WHERE `DonHangID`=73;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 14:15:00' WHERE `ThanhToanID`=154;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 14:15:00' WHERE DonHangID=73;

UPDATE thongbao SET NgayTao='2026-10-04 14:15:00',NoiDung='Đơn hàng #73: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=73;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 15:22:00' WHERE `DonHangID`=74;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 15:22:00' WHERE `ThanhToanID`=155;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 15:22:00' WHERE DonHangID=74;

UPDATE thongbao SET NgayTao='2026-10-05 15:22:00',NoiDung='Đơn hàng #74: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=74;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 16:29:00' WHERE `DonHangID`=75;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 16:29:00' WHERE `ThanhToanID`=156;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 16:29:00' WHERE DonHangID=75;

UPDATE thongbao SET NgayTao='2026-10-06 16:29:00',NoiDung='Đơn hàng #75: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=75;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 17:36:00' WHERE `DonHangID`=76;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 17:36:00' WHERE `ThanhToanID`=157;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 17:36:00' WHERE DonHangID=76;

UPDATE thongbao SET NgayTao='2026-10-01 17:36:00',NoiDung='Đơn hàng #76: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=76;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 18:43:00' WHERE `DonHangID`=77;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 18:43:00' WHERE `ThanhToanID`=158;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 18:43:00' WHERE DonHangID=77;

UPDATE thongbao SET NgayTao='2026-10-02 18:43:00',NoiDung='Đơn hàng #77: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=77;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 09:50:00' WHERE `DonHangID`=78;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 09:50:00' WHERE `ThanhToanID`=159;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 09:50:00' WHERE DonHangID=78;

UPDATE thongbao SET NgayTao='2026-10-03 09:50:00',NoiDung='Đơn hàng #78: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=78;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 10:57:00' WHERE `DonHangID`=79;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 10:57:00' WHERE `ThanhToanID`=160;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 10:57:00' WHERE DonHangID=79;

UPDATE thongbao SET NgayTao='2026-10-04 10:57:00',NoiDung='Đơn hàng #79: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=79;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 11:04:00' WHERE `DonHangID`=80;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 11:04:00' WHERE `ThanhToanID`=161;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 11:04:00' WHERE DonHangID=80;

UPDATE thongbao SET NgayTao='2026-10-05 11:04:00',NoiDung='Đơn hàng #80: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=80;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 12:11:00' WHERE `DonHangID`=81;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 12:11:00' WHERE `ThanhToanID`=162;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 12:11:00' WHERE DonHangID=81;

UPDATE thongbao SET NgayTao='2026-10-06 12:11:00',NoiDung='Đơn hàng #81: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=81;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 13:18:00' WHERE `DonHangID`=82;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 13:18:00' WHERE `ThanhToanID`=163;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 13:18:00' WHERE DonHangID=82;

UPDATE thongbao SET NgayTao='2026-10-01 13:18:00',NoiDung='Đơn hàng #82: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=82;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 14:25:00' WHERE `DonHangID`=83;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 14:25:00' WHERE `ThanhToanID`=164;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 14:25:00' WHERE DonHangID=83;

UPDATE thongbao SET NgayTao='2026-10-02 14:25:00',NoiDung='Đơn hàng #83: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=83;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 15:32:00' WHERE `DonHangID`=84;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 15:32:00' WHERE `ThanhToanID`=165;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 15:32:00' WHERE DonHangID=84;

UPDATE thongbao SET NgayTao='2026-10-03 15:32:00',NoiDung='Đơn hàng #84: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=84;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 16:39:00' WHERE `DonHangID`=85;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 16:39:00' WHERE `ThanhToanID`=166;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 16:39:00' WHERE DonHangID=85;

UPDATE thongbao SET NgayTao='2026-10-04 16:39:00',NoiDung='Đơn hàng #85: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=85;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 17:46:00' WHERE `DonHangID`=86;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 17:46:00' WHERE `ThanhToanID`=167;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 17:46:00' WHERE DonHangID=86;

UPDATE thongbao SET NgayTao='2026-10-05 17:46:00',NoiDung='Đơn hàng #86: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=86;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 18:53:00' WHERE `DonHangID`=87;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 18:53:00' WHERE `ThanhToanID`=168;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 18:53:00' WHERE DonHangID=87;

UPDATE thongbao SET NgayTao='2026-10-06 18:53:00',NoiDung='Đơn hàng #87: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=87;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 09:00:00' WHERE `DonHangID`=88;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 09:00:00' WHERE `ThanhToanID`=169;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 09:00:00' WHERE DonHangID=88;

UPDATE thongbao SET NgayTao='2026-10-01 09:00:00',NoiDung='Đơn hàng #88: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=88;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 10:07:00' WHERE `DonHangID`=89;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 10:07:00' WHERE `ThanhToanID`=170;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 10:07:00' WHERE DonHangID=89;

UPDATE thongbao SET NgayTao='2026-10-02 10:07:00',NoiDung='Đơn hàng #89: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=89;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 11:14:00' WHERE `DonHangID`=90;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 11:14:00' WHERE `ThanhToanID`=171;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 11:14:00' WHERE DonHangID=90;

UPDATE thongbao SET NgayTao='2026-10-03 11:14:00',NoiDung='Đơn hàng #90: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=90;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 12:21:00' WHERE `DonHangID`=91;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 12:21:00' WHERE `ThanhToanID`=172;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 12:21:00' WHERE DonHangID=91;

UPDATE thongbao SET NgayTao='2026-10-04 12:21:00',NoiDung='Đơn hàng #91: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=91;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 13:28:00' WHERE `DonHangID`=92;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 13:28:00' WHERE `ThanhToanID`=173;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 13:28:00' WHERE DonHangID=92;

UPDATE thongbao SET NgayTao='2026-10-05 13:28:00',NoiDung='Đơn hàng #92: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=92;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 14:35:00' WHERE `DonHangID`=93;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 14:35:00' WHERE `ThanhToanID`=174;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 14:35:00' WHERE DonHangID=93;

UPDATE thongbao SET NgayTao='2026-10-06 14:35:00',NoiDung='Đơn hàng #93: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=93;

UPDATE `donhang` SET `NgayDat` = '2026-10-01 15:42:00' WHERE `DonHangID`=94;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-01 15:42:00' WHERE `ThanhToanID`=175;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-01 15:42:00' WHERE DonHangID=94;

UPDATE thongbao SET NgayTao='2026-10-01 15:42:00',NoiDung='Đơn hàng #94: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=94;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 16:49:00' WHERE `DonHangID`=95;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 16:49:00' WHERE `ThanhToanID`=176;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 16:49:00' WHERE DonHangID=95;

UPDATE thongbao SET NgayTao='2026-10-02 16:49:00',NoiDung='Đơn hàng #95: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=95;

UPDATE `donhang` SET `NgayDat` = '2026-10-03 17:56:00' WHERE `DonHangID`=96;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-03 17:56:00' WHERE `ThanhToanID`=177;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-03 17:56:00' WHERE DonHangID=96;

UPDATE thongbao SET NgayTao='2026-10-03 17:56:00',NoiDung='Đơn hàng #96: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=96;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 18:03:00' WHERE `DonHangID`=97;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 18:03:00' WHERE `ThanhToanID`=178;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 18:03:00' WHERE DonHangID=97;

UPDATE thongbao SET NgayTao='2026-10-04 18:03:00',NoiDung='Đơn hàng #97: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=97;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 09:10:00' WHERE `DonHangID`=98;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 09:10:00' WHERE `ThanhToanID`=179;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 09:10:00' WHERE DonHangID=98;

UPDATE thongbao SET NgayTao='2026-10-05 09:10:00',NoiDung='Đơn hàng #98: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=98;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 10:17:00' WHERE `DonHangID`=99;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 10:17:00' WHERE `ThanhToanID`=180;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 10:17:00' WHERE DonHangID=99;

UPDATE thongbao SET NgayTao='2026-10-06 10:17:00',NoiDung='Đơn hàng #99: Đã hoàn tất.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=99;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 11:24:00' WHERE `DonHangID`=100;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 11:24:00' WHERE `ThanhToanID`=181;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 11:24:00' WHERE DonHangID=100;

UPDATE thongbao SET NgayTao='2026-10-07 11:24:00',NoiDung='Đơn hàng #100: Đang chuẩn bị giao hàng.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=100;

UPDATE `donhang` SET `NgayDat` = '2026-10-08 12:31:00' WHERE `DonHangID`=101;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-08 12:31:00' WHERE `ThanhToanID`=182;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-08 12:31:00' WHERE DonHangID=101;

UPDATE thongbao SET NgayTao='2026-10-08 12:31:00',NoiDung='Đơn hàng #101: Đã xác nhận.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=101;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 13:38:00' WHERE `DonHangID`=102;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 13:38:00' WHERE `ThanhToanID`=183;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 13:38:00' WHERE DonHangID=102;

UPDATE thongbao SET NgayTao='2026-10-07 13:38:00',NoiDung='Đơn hàng #102: Chờ thanh toán.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=102;

UPDATE `donhang` SET `NgayDat` = '2026-10-02 14:45:00' WHERE `DonHangID`=103;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-02 14:45:00' WHERE `ThanhToanID`=184;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-02 14:45:00' WHERE DonHangID=103;

UPDATE thongbao SET NgayTao='2026-10-02 14:45:00',NoiDung='Đơn hàng #103: Đã hủy.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=103;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 15:52:00' WHERE `DonHangID`=104;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 15:52:00' WHERE `ThanhToanID`=185;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 15:52:00' WHERE DonHangID=104;

UPDATE thongbao SET NgayTao='2026-10-07 15:52:00',NoiDung='Đơn hàng #104: Đang chuẩn bị giao hàng.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=104;

UPDATE `donhang` SET `NgayDat` = '2026-10-08 16:59:00' WHERE `DonHangID`=105;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-08 16:59:00' WHERE `ThanhToanID`=186;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-08 16:59:00' WHERE DonHangID=105;

UPDATE thongbao SET NgayTao='2026-10-08 16:59:00',NoiDung='Đơn hàng #105: Đã xác nhận.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=105;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 17:06:00' WHERE `DonHangID`=106;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 17:06:00' WHERE `ThanhToanID`=187;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 17:06:00' WHERE DonHangID=106;

UPDATE thongbao SET NgayTao='2026-10-07 17:06:00',NoiDung='Đơn hàng #106: Chờ thanh toán.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=106;

UPDATE `donhang` SET `NgayDat` = '2026-10-06 18:13:00' WHERE `DonHangID`=107;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-06 18:13:00' WHERE `ThanhToanID`=188;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-06 18:13:00' WHERE DonHangID=107;

UPDATE thongbao SET NgayTao='2026-10-06 18:13:00',NoiDung='Đơn hàng #107: Đã hủy.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=107;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 09:20:00' WHERE `DonHangID`=108;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 09:20:00' WHERE `ThanhToanID`=189;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 09:20:00' WHERE DonHangID=108;

UPDATE thongbao SET NgayTao='2026-10-07 09:20:00',NoiDung='Đơn hàng #108: Đang chuẩn bị giao hàng.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=108;

UPDATE `donhang` SET `NgayDat` = '2026-10-08 10:27:00' WHERE `DonHangID`=109;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-08 10:27:00' WHERE `ThanhToanID`=190;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-08 10:27:00' WHERE DonHangID=109;

UPDATE thongbao SET NgayTao='2026-10-08 10:27:00',NoiDung='Đơn hàng #109: Đã xác nhận.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=109;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 11:34:00' WHERE `DonHangID`=110;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 11:34:00' WHERE `ThanhToanID`=191;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 11:34:00' WHERE DonHangID=110;

UPDATE thongbao SET NgayTao='2026-10-07 11:34:00',NoiDung='Đơn hàng #110: Chờ thanh toán.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=110;

UPDATE `donhang` SET `NgayDat` = '2026-10-05 12:41:00' WHERE `DonHangID`=111;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-05 12:41:00' WHERE `ThanhToanID`=192;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-05 12:41:00' WHERE DonHangID=111;

UPDATE thongbao SET NgayTao='2026-10-05 12:41:00',NoiDung='Đơn hàng #111: Đã hủy.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=111;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 13:48:00' WHERE `DonHangID`=112;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 13:48:00' WHERE `ThanhToanID`=193;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 13:48:00' WHERE DonHangID=112;

UPDATE thongbao SET NgayTao='2026-10-07 13:48:00',NoiDung='Đơn hàng #112: Đang chuẩn bị giao hàng.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=112;

UPDATE `donhang` SET `NgayDat` = '2026-10-08 14:55:00' WHERE `DonHangID`=113;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-08 14:55:00' WHERE `ThanhToanID`=194;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-08 14:55:00' WHERE DonHangID=113;

UPDATE thongbao SET NgayTao='2026-10-08 14:55:00',NoiDung='Đơn hàng #113: Đã xác nhận.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=113;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 15:02:00' WHERE `DonHangID`=114;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 15:02:00' WHERE `ThanhToanID`=195;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 15:02:00' WHERE DonHangID=114;

UPDATE thongbao SET NgayTao='2026-10-07 15:02:00',NoiDung='Đơn hàng #114: Chờ thanh toán.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=114;

UPDATE `donhang` SET `NgayDat` = '2026-10-04 16:09:00' WHERE `DonHangID`=115;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-04 16:09:00' WHERE `ThanhToanID`=196;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-04 16:09:00' WHERE DonHangID=115;

UPDATE thongbao SET NgayTao='2026-10-04 16:09:00',NoiDung='Đơn hàng #115: Đã hủy.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=115;

UPDATE `donhang` SET `NgayDat` = '2026-10-07 17:16:00' WHERE `DonHangID`=116;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-07 17:16:00' WHERE `ThanhToanID`=197;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-07 17:16:00' WHERE DonHangID=116;

UPDATE thongbao SET NgayTao='2026-10-07 17:16:00',NoiDung='Đơn hàng #116: Đang chuẩn bị giao hàng.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=116;

UPDATE `donhang` SET `NgayDat` = '2026-10-08 18:23:00' WHERE `DonHangID`=117;

UPDATE `thanhtoan` SET `NgayThanhToan` = '2026-10-08 18:23:00' WHERE `ThanhToanID`=198;

UPDATE apdungkhuyenmaidonhang SET NgayApDung='2026-10-08 18:23:00' WHERE DonHangID=117;

UPDATE thongbao SET NgayTao='2026-10-08 18:23:00',NoiDung='Đơn hàng #117: Đã xác nhận.' WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=117;

UPDATE donhang SET GhiChu='Đã giao hàng và hoàn tất đơn.' WHERE TrangThai='COMPLETED' AND GhiChu='Khách chờ xác nhận.';

UPDATE phieunhap p SET p.TongTien=COALESCE((SELECT SUM(ct.SoLuong*ct.DonGia) FROM chitietphieunhap ct WHERE ct.PhieuNhapID=p.PhieuNhapID),0);

UPDATE chitietdonhang SET ThanhTien=SoLuong*DonGia;

UPDATE chitietphieunhap SET ThanhTien=SoLuong*DonGia;

UPDATE hoadon h JOIN thanhtoan p USING(ThanhToanID) SET h.TongTien=p.SoTien,h.NgayLap=p.NgayThanhToan;

UPDATE thongbao SET NoiDung=REPLACE(NoiDung,'DIAMOND TEST BACKEND','Diamond toàn diện') WHERE NoiDung LIKE '%DIAMOND TEST BACKEND%';

UPDATE goitap SET MoTa=CASE GoiTapID WHEN 22 THEN 'Tập gym buổi sáng 06:00–12:00; dành cho hội viên có thẻ sinh viên còn hiệu lực.' WHEN 23 THEN 'Tập giờ trưa 11:00–15:00; phù hợp nhân viên văn phòng.' WHEN 24 THEN 'Tập gym 06:00–22:00, sử dụng khu cardio và máy tập sức mạnh.' WHEN 25 THEN 'Tập gym toàn thời gian, kèm 8 lớp nhóm mỗi tháng.' WHEN 26 THEN 'Tập toàn thời gian, kèm đánh giá thể lực và khu giãn cơ phục hồi.' WHEN 27 THEN 'Tập toàn thời gian, lớp nhóm và khu phục hồi; hỗ trợ theo dõi mục tiêu.' ELSE MoTa END WHERE GoiTapID BETWEEN 22 AND 27;

UPDATE khuyenmai SET DieuKien='Giảm 500.000đ cho gói tập từ 3 tháng, giá trị trước giảm tối thiểu 2.000.000đ; không cộng dồn.' WHERE SoTienGiam=500000 AND DieuKien LIKE '%flow Mobile%';

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:14:00', `ThoiGianCheckOut` = '2026-09-21 09:23:00' WHERE `CheckInID`=14;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:15:00', `ThoiGianCheckOut` = '2026-09-24 09:25:00' WHERE `CheckInID`=15;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:16:00', `ThoiGianCheckOut` = '2026-09-27 09:27:00' WHERE `CheckInID`=16;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:17:00', `ThoiGianCheckOut` = '2026-09-30 09:29:00' WHERE `CheckInID`=17;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:18:00', `ThoiGianCheckOut` = '2026-10-03 09:31:00' WHERE `CheckInID`=18;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:19:00', `ThoiGianCheckOut` = '2026-10-06 09:33:00' WHERE `CheckInID`=19;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:20:00', `ThoiGianCheckOut` = '2026-09-22 19:35:00' WHERE `CheckInID`=20;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:21:00', `ThoiGianCheckOut` = '2026-09-25 19:37:00' WHERE `CheckInID`=21;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:22:00', `ThoiGianCheckOut` = '2026-09-28 19:39:00' WHERE `CheckInID`=22;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:23:00', `ThoiGianCheckOut` = '2026-10-01 19:41:00' WHERE `CheckInID`=23;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:24:00', `ThoiGianCheckOut` = '2026-10-04 19:43:00' WHERE `CheckInID`=24;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:25:00', `ThoiGianCheckOut` = '2026-10-07 19:45:00' WHERE `CheckInID`=25;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:26:00', `ThoiGianCheckOut` = '2026-09-21 11:47:00' WHERE `CheckInID`=26;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:27:00', `ThoiGianCheckOut` = '2026-09-24 11:49:00' WHERE `CheckInID`=27;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:28:00', `ThoiGianCheckOut` = '2026-09-27 11:51:00' WHERE `CheckInID`=28;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:29:00', `ThoiGianCheckOut` = '2026-09-30 11:53:00' WHERE `CheckInID`=29;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:30:00', `ThoiGianCheckOut` = '2026-10-03 11:55:00' WHERE `CheckInID`=30;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:31:00', `ThoiGianCheckOut` = '2026-10-06 11:57:00' WHERE `CheckInID`=31;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:32:00', `ThoiGianCheckOut` = '2026-09-22 18:59:00' WHERE `CheckInID`=32;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:33:00', `ThoiGianCheckOut` = '2026-09-25 19:01:00' WHERE `CheckInID`=33;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:34:00', `ThoiGianCheckOut` = '2026-09-28 19:03:00' WHERE `CheckInID`=34;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:35:00', `ThoiGianCheckOut` = '2026-10-01 19:05:00' WHERE `CheckInID`=35;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:36:00', `ThoiGianCheckOut` = '2026-10-04 19:07:00' WHERE `CheckInID`=36;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:37:00', `ThoiGianCheckOut` = '2026-10-07 19:09:00' WHERE `CheckInID`=37;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:38:00', `ThoiGianCheckOut` = '2026-09-21 11:11:00' WHERE `CheckInID`=38;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:39:00', `ThoiGianCheckOut` = '2026-09-24 11:13:00' WHERE `CheckInID`=39;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:40:00', `ThoiGianCheckOut` = '2026-09-27 11:15:00' WHERE `CheckInID`=40;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:41:00', `ThoiGianCheckOut` = '2026-09-30 11:17:00' WHERE `CheckInID`=41;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:42:00', `ThoiGianCheckOut` = '2026-10-03 11:19:00' WHERE `CheckInID`=42;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:43:00', `ThoiGianCheckOut` = '2026-10-06 11:21:00' WHERE `CheckInID`=43;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:44:00', `ThoiGianCheckOut` = '2026-09-22 21:23:00' WHERE `CheckInID`=44;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:00:00', `ThoiGianCheckOut` = '2026-09-25 20:40:00' WHERE `CheckInID`=45;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:01:00', `ThoiGianCheckOut` = '2026-09-28 19:56:00' WHERE `CheckInID`=46;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:02:00', `ThoiGianCheckOut` = '2026-10-01 19:58:00' WHERE `CheckInID`=47;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:03:00', `ThoiGianCheckOut` = '2026-10-04 20:00:00' WHERE `CheckInID`=48;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:04:00', `ThoiGianCheckOut` = '2026-10-07 20:02:00' WHERE `CheckInID`=49;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:05:00', `ThoiGianCheckOut` = '2026-09-21 09:04:00' WHERE `CheckInID`=50;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:06:00', `ThoiGianCheckOut` = '2026-09-24 09:06:00' WHERE `CheckInID`=51;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:07:00', `ThoiGianCheckOut` = '2026-09-27 09:08:00' WHERE `CheckInID`=52;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:08:00', `ThoiGianCheckOut` = '2026-09-30 09:10:00' WHERE `CheckInID`=53;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:09:00', `ThoiGianCheckOut` = '2026-10-03 09:12:00' WHERE `CheckInID`=54;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:10:00', `ThoiGianCheckOut` = '2026-10-06 09:14:00' WHERE `CheckInID`=55;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:11:00', `ThoiGianCheckOut` = '2026-09-22 19:16:00' WHERE `CheckInID`=56;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:12:00', `ThoiGianCheckOut` = '2026-09-25 19:18:00' WHERE `CheckInID`=57;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:13:00', `ThoiGianCheckOut` = '2026-09-28 19:20:00' WHERE `CheckInID`=58;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:14:00', `ThoiGianCheckOut` = '2026-10-01 19:22:00' WHERE `CheckInID`=59;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:15:00', `ThoiGianCheckOut` = '2026-10-04 19:24:00' WHERE `CheckInID`=60;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:16:00', `ThoiGianCheckOut` = '2026-10-07 19:26:00' WHERE `CheckInID`=61;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:17:00', `ThoiGianCheckOut` = '2026-09-21 11:28:00' WHERE `CheckInID`=62;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:18:00', `ThoiGianCheckOut` = '2026-09-24 11:30:00' WHERE `CheckInID`=63;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:19:00', `ThoiGianCheckOut` = '2026-09-27 11:32:00' WHERE `CheckInID`=64;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:20:00', `ThoiGianCheckOut` = '2026-09-30 11:34:00' WHERE `CheckInID`=65;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:21:00', `ThoiGianCheckOut` = '2026-10-03 11:36:00' WHERE `CheckInID`=66;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:22:00', `ThoiGianCheckOut` = '2026-10-06 11:38:00' WHERE `CheckInID`=67;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:23:00', `ThoiGianCheckOut` = '2026-09-22 18:40:00' WHERE `CheckInID`=68;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:24:00', `ThoiGianCheckOut` = '2026-09-25 18:42:00' WHERE `CheckInID`=69;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:25:00', `ThoiGianCheckOut` = '2026-09-28 18:44:00' WHERE `CheckInID`=70;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:26:00', `ThoiGianCheckOut` = '2026-10-01 18:46:00' WHERE `CheckInID`=71;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:27:00', `ThoiGianCheckOut` = '2026-10-04 18:48:00' WHERE `CheckInID`=72;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:28:00', `ThoiGianCheckOut` = '2026-10-07 18:50:00' WHERE `CheckInID`=73;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:29:00', `ThoiGianCheckOut` = '2026-09-21 10:52:00' WHERE `CheckInID`=74;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:30:00', `ThoiGianCheckOut` = '2026-09-24 10:54:00' WHERE `CheckInID`=75;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:31:00', `ThoiGianCheckOut` = '2026-09-27 10:56:00' WHERE `CheckInID`=76;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:32:00', `ThoiGianCheckOut` = '2026-09-30 10:58:00' WHERE `CheckInID`=77;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:33:00', `ThoiGianCheckOut` = '2026-10-03 11:00:00' WHERE `CheckInID`=78;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:34:00', `ThoiGianCheckOut` = '2026-10-06 11:02:00' WHERE `CheckInID`=79;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:35:00', `ThoiGianCheckOut` = '2026-09-22 21:04:00' WHERE `CheckInID`=80;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:36:00', `ThoiGianCheckOut` = '2026-09-25 21:06:00' WHERE `CheckInID`=81;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:37:00', `ThoiGianCheckOut` = '2026-09-28 21:08:00' WHERE `CheckInID`=82;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:38:00', `ThoiGianCheckOut` = '2026-10-01 21:10:00' WHERE `CheckInID`=83;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:39:00', `ThoiGianCheckOut` = '2026-10-04 21:12:00' WHERE `CheckInID`=84;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:40:00', `ThoiGianCheckOut` = '2026-10-07 21:14:00' WHERE `CheckInID`=85;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:41:00', `ThoiGianCheckOut` = '2026-09-21 10:16:00' WHERE `CheckInID`=86;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:42:00', `ThoiGianCheckOut` = '2026-09-24 10:18:00' WHERE `CheckInID`=87;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:43:00', `ThoiGianCheckOut` = '2026-09-27 10:20:00' WHERE `CheckInID`=88;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:44:00', `ThoiGianCheckOut` = '2026-09-30 10:22:00' WHERE `CheckInID`=89;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:00:00', `ThoiGianCheckOut` = '2026-10-03 09:39:00' WHERE `CheckInID`=90;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:01:00', `ThoiGianCheckOut` = '2026-10-06 09:41:00' WHERE `CheckInID`=91;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:02:00', `ThoiGianCheckOut` = '2026-09-22 18:57:00' WHERE `CheckInID`=92;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:03:00', `ThoiGianCheckOut` = '2026-09-25 18:59:00' WHERE `CheckInID`=93;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:04:00', `ThoiGianCheckOut` = '2026-09-28 19:01:00' WHERE `CheckInID`=94;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:05:00', `ThoiGianCheckOut` = '2026-10-01 19:03:00' WHERE `CheckInID`=95;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:06:00', `ThoiGianCheckOut` = '2026-10-04 19:05:00' WHERE `CheckInID`=96;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:07:00', `ThoiGianCheckOut` = '2026-10-07 19:07:00' WHERE `CheckInID`=97;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:08:00', `ThoiGianCheckOut` = '2026-09-21 11:09:00' WHERE `CheckInID`=98;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:09:00', `ThoiGianCheckOut` = '2026-09-24 11:11:00' WHERE `CheckInID`=99;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:10:00', `ThoiGianCheckOut` = '2026-09-27 11:13:00' WHERE `CheckInID`=100;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:11:00', `ThoiGianCheckOut` = '2026-09-30 11:15:00' WHERE `CheckInID`=101;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:12:00', `ThoiGianCheckOut` = '2026-10-03 11:17:00' WHERE `CheckInID`=102;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:13:00', `ThoiGianCheckOut` = '2026-10-06 11:19:00' WHERE `CheckInID`=103;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:14:00', `ThoiGianCheckOut` = '2026-09-22 18:21:00' WHERE `CheckInID`=104;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:15:00', `ThoiGianCheckOut` = '2026-09-25 18:23:00' WHERE `CheckInID`=105;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:16:00', `ThoiGianCheckOut` = '2026-09-28 18:25:00' WHERE `CheckInID`=106;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:17:00', `ThoiGianCheckOut` = '2026-10-01 18:27:00' WHERE `CheckInID`=107;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:18:00', `ThoiGianCheckOut` = '2026-10-04 18:29:00' WHERE `CheckInID`=108;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:19:00', `ThoiGianCheckOut` = '2026-10-07 18:31:00' WHERE `CheckInID`=109;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:20:00', `ThoiGianCheckOut` = '2026-09-21 10:33:00' WHERE `CheckInID`=110;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:21:00', `ThoiGianCheckOut` = '2026-09-24 10:35:00' WHERE `CheckInID`=111;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:22:00', `ThoiGianCheckOut` = '2026-09-27 10:37:00' WHERE `CheckInID`=112;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:23:00', `ThoiGianCheckOut` = '2026-09-30 10:39:00' WHERE `CheckInID`=113;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:24:00', `ThoiGianCheckOut` = '2026-10-03 10:41:00' WHERE `CheckInID`=114;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:25:00', `ThoiGianCheckOut` = '2026-10-06 10:43:00' WHERE `CheckInID`=115;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:26:00', `ThoiGianCheckOut` = '2026-09-22 20:45:00' WHERE `CheckInID`=116;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:27:00', `ThoiGianCheckOut` = '2026-09-25 20:47:00' WHERE `CheckInID`=117;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:28:00', `ThoiGianCheckOut` = '2026-09-28 20:49:00' WHERE `CheckInID`=118;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:29:00', `ThoiGianCheckOut` = '2026-10-01 20:51:00' WHERE `CheckInID`=119;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:30:00', `ThoiGianCheckOut` = '2026-10-04 20:53:00' WHERE `CheckInID`=120;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:31:00', `ThoiGianCheckOut` = '2026-10-07 20:55:00' WHERE `CheckInID`=121;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:32:00', `ThoiGianCheckOut` = '2026-09-21 09:57:00' WHERE `CheckInID`=122;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:33:00', `ThoiGianCheckOut` = '2026-09-24 09:59:00' WHERE `CheckInID`=123;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:34:00', `ThoiGianCheckOut` = '2026-09-27 10:01:00' WHERE `CheckInID`=124;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:35:00', `ThoiGianCheckOut` = '2026-09-30 10:03:00' WHERE `CheckInID`=125;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:36:00', `ThoiGianCheckOut` = '2026-10-03 10:05:00' WHERE `CheckInID`=126;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:37:00', `ThoiGianCheckOut` = '2026-10-06 10:07:00' WHERE `CheckInID`=127;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:38:00', `ThoiGianCheckOut` = '2026-09-22 20:09:00' WHERE `CheckInID`=128;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:39:00', `ThoiGianCheckOut` = '2026-09-25 20:11:00' WHERE `CheckInID`=129;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:40:00', `ThoiGianCheckOut` = '2026-09-28 20:13:00' WHERE `CheckInID`=130;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:41:00', `ThoiGianCheckOut` = '2026-10-01 20:15:00' WHERE `CheckInID`=131;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:42:00', `ThoiGianCheckOut` = '2026-10-04 20:17:00' WHERE `CheckInID`=132;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:43:00', `ThoiGianCheckOut` = '2026-10-07 20:19:00' WHERE `CheckInID`=133;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:44:00', `ThoiGianCheckOut` = '2026-09-21 12:21:00' WHERE `CheckInID`=134;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:00:00', `ThoiGianCheckOut` = '2026-09-24 11:38:00' WHERE `CheckInID`=135;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:01:00', `ThoiGianCheckOut` = '2026-09-27 11:40:00' WHERE `CheckInID`=136;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:02:00', `ThoiGianCheckOut` = '2026-09-30 11:42:00' WHERE `CheckInID`=137;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:03:00', `ThoiGianCheckOut` = '2026-10-03 10:58:00' WHERE `CheckInID`=138;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:04:00', `ThoiGianCheckOut` = '2026-10-06 11:00:00' WHERE `CheckInID`=139;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:05:00', `ThoiGianCheckOut` = '2026-09-22 18:02:00' WHERE `CheckInID`=140;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:06:00', `ThoiGianCheckOut` = '2026-09-25 18:04:00' WHERE `CheckInID`=141;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:07:00', `ThoiGianCheckOut` = '2026-09-28 18:06:00' WHERE `CheckInID`=142;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:08:00', `ThoiGianCheckOut` = '2026-10-01 18:08:00' WHERE `CheckInID`=143;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:09:00', `ThoiGianCheckOut` = '2026-10-04 18:10:00' WHERE `CheckInID`=144;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:10:00', `ThoiGianCheckOut` = '2026-10-07 18:12:00' WHERE `CheckInID`=145;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:11:00', `ThoiGianCheckOut` = '2026-09-21 10:14:00' WHERE `CheckInID`=146;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:12:00', `ThoiGianCheckOut` = '2026-09-24 10:16:00' WHERE `CheckInID`=147;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:13:00', `ThoiGianCheckOut` = '2026-09-27 10:18:00' WHERE `CheckInID`=148;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:14:00', `ThoiGianCheckOut` = '2026-09-30 10:20:00' WHERE `CheckInID`=149;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:15:00', `ThoiGianCheckOut` = '2026-10-03 10:22:00' WHERE `CheckInID`=150;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:16:00', `ThoiGianCheckOut` = '2026-10-06 10:24:00' WHERE `CheckInID`=151;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:17:00', `ThoiGianCheckOut` = '2026-09-22 20:26:00' WHERE `CheckInID`=152;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:18:00', `ThoiGianCheckOut` = '2026-09-25 20:28:00' WHERE `CheckInID`=153;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:19:00', `ThoiGianCheckOut` = '2026-09-28 20:30:00' WHERE `CheckInID`=154;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:20:00', `ThoiGianCheckOut` = '2026-10-01 20:32:00' WHERE `CheckInID`=155;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:21:00', `ThoiGianCheckOut` = '2026-10-04 20:34:00' WHERE `CheckInID`=156;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:22:00', `ThoiGianCheckOut` = '2026-10-07 20:36:00' WHERE `CheckInID`=157;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:23:00', `ThoiGianCheckOut` = '2026-09-21 09:38:00' WHERE `CheckInID`=158;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:24:00', `ThoiGianCheckOut` = '2026-09-24 09:40:00' WHERE `CheckInID`=159;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:25:00', `ThoiGianCheckOut` = '2026-09-27 09:42:00' WHERE `CheckInID`=160;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:26:00', `ThoiGianCheckOut` = '2026-09-30 09:44:00' WHERE `CheckInID`=161;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:27:00', `ThoiGianCheckOut` = '2026-10-03 09:46:00' WHERE `CheckInID`=162;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:28:00', `ThoiGianCheckOut` = '2026-10-06 09:48:00' WHERE `CheckInID`=163;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:29:00', `ThoiGianCheckOut` = '2026-09-22 19:50:00' WHERE `CheckInID`=164;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:30:00', `ThoiGianCheckOut` = '2026-09-25 19:52:00' WHERE `CheckInID`=165;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:31:00', `ThoiGianCheckOut` = '2026-09-28 19:54:00' WHERE `CheckInID`=166;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:32:00', `ThoiGianCheckOut` = '2026-10-01 19:56:00' WHERE `CheckInID`=167;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:33:00', `ThoiGianCheckOut` = '2026-10-04 19:58:00' WHERE `CheckInID`=168;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:34:00', `ThoiGianCheckOut` = '2026-10-07 20:00:00' WHERE `CheckInID`=169;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:35:00', `ThoiGianCheckOut` = '2026-09-21 12:02:00' WHERE `CheckInID`=170;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:36:00', `ThoiGianCheckOut` = '2026-09-24 12:04:00' WHERE `CheckInID`=171;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:37:00', `ThoiGianCheckOut` = '2026-09-27 12:06:00' WHERE `CheckInID`=172;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:38:00', `ThoiGianCheckOut` = '2026-09-30 12:08:00' WHERE `CheckInID`=173;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:39:00', `ThoiGianCheckOut` = '2026-10-03 12:10:00' WHERE `CheckInID`=174;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:40:00', `ThoiGianCheckOut` = '2026-10-06 12:12:00' WHERE `CheckInID`=175;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:41:00', `ThoiGianCheckOut` = '2026-09-22 19:14:00' WHERE `CheckInID`=176;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:42:00', `ThoiGianCheckOut` = '2026-09-25 19:16:00' WHERE `CheckInID`=177;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:43:00', `ThoiGianCheckOut` = '2026-09-28 19:18:00' WHERE `CheckInID`=178;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:44:00', `ThoiGianCheckOut` = '2026-10-01 19:20:00' WHERE `CheckInID`=179;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:00:00', `ThoiGianCheckOut` = '2026-10-04 18:37:00' WHERE `CheckInID`=180;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:01:00', `ThoiGianCheckOut` = '2026-10-07 18:39:00' WHERE `CheckInID`=181;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:02:00', `ThoiGianCheckOut` = '2026-09-21 10:41:00' WHERE `CheckInID`=182;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:03:00', `ThoiGianCheckOut` = '2026-09-24 10:43:00' WHERE `CheckInID`=183;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:04:00', `ThoiGianCheckOut` = '2026-09-27 09:59:00' WHERE `CheckInID`=184;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:05:00', `ThoiGianCheckOut` = '2026-09-30 10:01:00' WHERE `CheckInID`=185;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:06:00', `ThoiGianCheckOut` = '2026-10-03 10:03:00' WHERE `CheckInID`=186;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:07:00', `ThoiGianCheckOut` = '2026-10-06 10:05:00' WHERE `CheckInID`=187;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:08:00', `ThoiGianCheckOut` = '2026-09-22 20:07:00' WHERE `CheckInID`=188;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:09:00', `ThoiGianCheckOut` = '2026-09-25 20:09:00' WHERE `CheckInID`=189;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:10:00', `ThoiGianCheckOut` = '2026-09-28 20:11:00' WHERE `CheckInID`=190;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:11:00', `ThoiGianCheckOut` = '2026-10-01 20:13:00' WHERE `CheckInID`=191;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:12:00', `ThoiGianCheckOut` = '2026-10-04 20:15:00' WHERE `CheckInID`=192;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:13:00', `ThoiGianCheckOut` = '2026-10-07 20:17:00' WHERE `CheckInID`=193;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:14:00', `ThoiGianCheckOut` = '2026-09-21 09:19:00' WHERE `CheckInID`=194;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:15:00', `ThoiGianCheckOut` = '2026-09-24 09:21:00' WHERE `CheckInID`=195;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:16:00', `ThoiGianCheckOut` = '2026-09-27 09:23:00' WHERE `CheckInID`=196;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:17:00', `ThoiGianCheckOut` = '2026-09-30 09:25:00' WHERE `CheckInID`=197;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:18:00', `ThoiGianCheckOut` = '2026-10-03 09:27:00' WHERE `CheckInID`=198;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:19:00', `ThoiGianCheckOut` = '2026-10-06 09:29:00' WHERE `CheckInID`=199;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:20:00', `ThoiGianCheckOut` = '2026-09-22 19:31:00' WHERE `CheckInID`=200;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:21:00', `ThoiGianCheckOut` = '2026-09-25 19:33:00' WHERE `CheckInID`=201;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:22:00', `ThoiGianCheckOut` = '2026-09-28 19:35:00' WHERE `CheckInID`=202;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:23:00', `ThoiGianCheckOut` = '2026-10-01 19:37:00' WHERE `CheckInID`=203;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:24:00', `ThoiGianCheckOut` = '2026-10-04 19:39:00' WHERE `CheckInID`=204;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:25:00', `ThoiGianCheckOut` = '2026-10-07 19:41:00' WHERE `CheckInID`=205;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:26:00', `ThoiGianCheckOut` = '2026-09-21 11:43:00' WHERE `CheckInID`=206;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:27:00', `ThoiGianCheckOut` = '2026-09-24 11:45:00' WHERE `CheckInID`=207;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:28:00', `ThoiGianCheckOut` = '2026-09-27 11:47:00' WHERE `CheckInID`=208;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:29:00', `ThoiGianCheckOut` = '2026-09-30 11:49:00' WHERE `CheckInID`=209;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:30:00', `ThoiGianCheckOut` = '2026-10-03 11:51:00' WHERE `CheckInID`=210;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:31:00', `ThoiGianCheckOut` = '2026-10-06 11:53:00' WHERE `CheckInID`=211;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:32:00', `ThoiGianCheckOut` = '2026-09-22 18:55:00' WHERE `CheckInID`=212;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:33:00', `ThoiGianCheckOut` = '2026-09-25 18:57:00' WHERE `CheckInID`=213;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:34:00', `ThoiGianCheckOut` = '2026-09-28 18:59:00' WHERE `CheckInID`=214;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:35:00', `ThoiGianCheckOut` = '2026-10-01 19:01:00' WHERE `CheckInID`=215;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:36:00', `ThoiGianCheckOut` = '2026-10-04 19:03:00' WHERE `CheckInID`=216;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:37:00', `ThoiGianCheckOut` = '2026-10-07 19:05:00' WHERE `CheckInID`=217;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:38:00', `ThoiGianCheckOut` = '2026-09-21 11:07:00' WHERE `CheckInID`=218;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:39:00', `ThoiGianCheckOut` = '2026-09-24 11:09:00' WHERE `CheckInID`=219;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:40:00', `ThoiGianCheckOut` = '2026-09-27 11:11:00' WHERE `CheckInID`=220;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:41:00', `ThoiGianCheckOut` = '2026-09-30 11:13:00' WHERE `CheckInID`=221;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:42:00', `ThoiGianCheckOut` = '2026-10-03 11:15:00' WHERE `CheckInID`=222;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:43:00', `ThoiGianCheckOut` = '2026-10-06 11:17:00' WHERE `CheckInID`=223;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:44:00', `ThoiGianCheckOut` = '2026-09-22 21:19:00' WHERE `CheckInID`=224;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:00:00', `ThoiGianCheckOut` = '2026-09-25 20:36:00' WHERE `CheckInID`=225;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:01:00', `ThoiGianCheckOut` = '2026-09-28 20:38:00' WHERE `CheckInID`=226;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:02:00', `ThoiGianCheckOut` = '2026-10-01 20:40:00' WHERE `CheckInID`=227;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:03:00', `ThoiGianCheckOut` = '2026-10-04 20:42:00' WHERE `CheckInID`=228;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:04:00', `ThoiGianCheckOut` = '2026-10-07 20:44:00' WHERE `CheckInID`=229;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:05:00', `ThoiGianCheckOut` = '2026-09-21 09:00:00' WHERE `CheckInID`=230;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:06:00', `ThoiGianCheckOut` = '2026-09-24 09:02:00' WHERE `CheckInID`=231;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:07:00', `ThoiGianCheckOut` = '2026-09-27 09:04:00' WHERE `CheckInID`=232;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:08:00', `ThoiGianCheckOut` = '2026-09-30 09:06:00' WHERE `CheckInID`=233;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:09:00', `ThoiGianCheckOut` = '2026-10-03 09:08:00' WHERE `CheckInID`=234;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:10:00', `ThoiGianCheckOut` = '2026-10-06 09:10:00' WHERE `CheckInID`=235;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:11:00', `ThoiGianCheckOut` = '2026-09-22 19:12:00' WHERE `CheckInID`=236;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:12:00', `ThoiGianCheckOut` = '2026-09-25 19:14:00' WHERE `CheckInID`=237;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:13:00', `ThoiGianCheckOut` = '2026-09-28 19:16:00' WHERE `CheckInID`=238;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:14:00', `ThoiGianCheckOut` = '2026-10-01 19:18:00' WHERE `CheckInID`=239;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:15:00', `ThoiGianCheckOut` = '2026-10-04 19:20:00' WHERE `CheckInID`=240;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:16:00', `ThoiGianCheckOut` = '2026-10-07 19:22:00' WHERE `CheckInID`=241;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:17:00', `ThoiGianCheckOut` = '2026-09-21 11:24:00' WHERE `CheckInID`=242;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:18:00', `ThoiGianCheckOut` = '2026-09-24 11:26:00' WHERE `CheckInID`=243;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:19:00', `ThoiGianCheckOut` = '2026-09-27 11:28:00' WHERE `CheckInID`=244;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:20:00', `ThoiGianCheckOut` = '2026-09-30 11:30:00' WHERE `CheckInID`=245;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:21:00', `ThoiGianCheckOut` = '2026-10-03 11:32:00' WHERE `CheckInID`=246;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:22:00', `ThoiGianCheckOut` = '2026-10-06 11:34:00' WHERE `CheckInID`=247;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:23:00', `ThoiGianCheckOut` = '2026-09-22 18:36:00' WHERE `CheckInID`=248;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:24:00', `ThoiGianCheckOut` = '2026-09-25 18:38:00' WHERE `CheckInID`=249;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:25:00', `ThoiGianCheckOut` = '2026-09-28 18:40:00' WHERE `CheckInID`=250;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:26:00', `ThoiGianCheckOut` = '2026-10-01 18:42:00' WHERE `CheckInID`=251;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:27:00', `ThoiGianCheckOut` = '2026-10-04 18:44:00' WHERE `CheckInID`=252;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:28:00', `ThoiGianCheckOut` = '2026-10-07 18:46:00' WHERE `CheckInID`=253;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:29:00', `ThoiGianCheckOut` = '2026-09-21 10:48:00' WHERE `CheckInID`=254;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:30:00', `ThoiGianCheckOut` = '2026-09-24 10:50:00' WHERE `CheckInID`=255;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:31:00', `ThoiGianCheckOut` = '2026-09-27 10:52:00' WHERE `CheckInID`=256;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:32:00', `ThoiGianCheckOut` = '2026-09-30 10:54:00' WHERE `CheckInID`=257;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:33:00', `ThoiGianCheckOut` = '2026-10-03 10:56:00' WHERE `CheckInID`=258;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:34:00', `ThoiGianCheckOut` = '2026-10-06 10:58:00' WHERE `CheckInID`=259;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:35:00', `ThoiGianCheckOut` = '2026-09-22 21:00:00' WHERE `CheckInID`=260;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:36:00', `ThoiGianCheckOut` = '2026-09-25 21:02:00' WHERE `CheckInID`=261;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:37:00', `ThoiGianCheckOut` = '2026-09-28 21:04:00' WHERE `CheckInID`=262;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:38:00', `ThoiGianCheckOut` = '2026-10-01 21:06:00' WHERE `CheckInID`=263;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:39:00', `ThoiGianCheckOut` = '2026-10-04 21:08:00' WHERE `CheckInID`=264;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:40:00', `ThoiGianCheckOut` = '2026-10-07 21:10:00' WHERE `CheckInID`=265;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:41:00', `ThoiGianCheckOut` = '2026-09-21 10:12:00' WHERE `CheckInID`=266;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:42:00', `ThoiGianCheckOut` = '2026-09-24 10:14:00' WHERE `CheckInID`=267;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:43:00', `ThoiGianCheckOut` = '2026-09-27 10:16:00' WHERE `CheckInID`=268;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:44:00', `ThoiGianCheckOut` = '2026-09-30 10:18:00' WHERE `CheckInID`=269;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:00:00', `ThoiGianCheckOut` = '2026-10-03 09:35:00' WHERE `CheckInID`=270;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:01:00', `ThoiGianCheckOut` = '2026-10-06 09:37:00' WHERE `CheckInID`=271;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:02:00', `ThoiGianCheckOut` = '2026-09-22 19:39:00' WHERE `CheckInID`=272;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:03:00', `ThoiGianCheckOut` = '2026-09-25 19:41:00' WHERE `CheckInID`=273;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:04:00', `ThoiGianCheckOut` = '2026-09-28 19:43:00' WHERE `CheckInID`=274;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:05:00', `ThoiGianCheckOut` = '2026-10-01 19:45:00' WHERE `CheckInID`=275;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:06:00', `ThoiGianCheckOut` = '2026-10-04 19:01:00' WHERE `CheckInID`=276;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:07:00', `ThoiGianCheckOut` = '2026-10-07 19:03:00' WHERE `CheckInID`=277;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:08:00', `ThoiGianCheckOut` = '2026-09-21 11:05:00' WHERE `CheckInID`=278;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:09:00', `ThoiGianCheckOut` = '2026-09-24 11:07:00' WHERE `CheckInID`=279;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:10:00', `ThoiGianCheckOut` = '2026-09-27 11:09:00' WHERE `CheckInID`=280;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:11:00', `ThoiGianCheckOut` = '2026-09-30 11:11:00' WHERE `CheckInID`=281;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:12:00', `ThoiGianCheckOut` = '2026-10-03 11:13:00' WHERE `CheckInID`=282;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:13:00', `ThoiGianCheckOut` = '2026-10-06 11:15:00' WHERE `CheckInID`=283;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:14:00', `ThoiGianCheckOut` = '2026-09-22 18:17:00' WHERE `CheckInID`=284;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:15:00', `ThoiGianCheckOut` = '2026-09-25 18:19:00' WHERE `CheckInID`=285;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:16:00', `ThoiGianCheckOut` = '2026-09-28 18:21:00' WHERE `CheckInID`=286;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:17:00', `ThoiGianCheckOut` = '2026-10-01 18:23:00' WHERE `CheckInID`=287;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:18:00', `ThoiGianCheckOut` = '2026-10-04 18:25:00' WHERE `CheckInID`=288;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:19:00', `ThoiGianCheckOut` = '2026-10-07 18:27:00' WHERE `CheckInID`=289;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:20:00', `ThoiGianCheckOut` = '2026-09-21 10:29:00' WHERE `CheckInID`=290;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:21:00', `ThoiGianCheckOut` = '2026-09-24 10:31:00' WHERE `CheckInID`=291;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:22:00', `ThoiGianCheckOut` = '2026-09-27 10:33:00' WHERE `CheckInID`=292;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:23:00', `ThoiGianCheckOut` = '2026-09-30 10:35:00' WHERE `CheckInID`=293;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:24:00', `ThoiGianCheckOut` = '2026-10-03 10:37:00' WHERE `CheckInID`=294;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:25:00', `ThoiGianCheckOut` = '2026-10-06 10:39:00' WHERE `CheckInID`=295;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:26:00', `ThoiGianCheckOut` = '2026-09-22 20:41:00' WHERE `CheckInID`=296;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:27:00', `ThoiGianCheckOut` = '2026-09-25 20:43:00' WHERE `CheckInID`=297;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:28:00', `ThoiGianCheckOut` = '2026-09-28 20:45:00' WHERE `CheckInID`=298;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:29:00', `ThoiGianCheckOut` = '2026-10-01 20:47:00' WHERE `CheckInID`=299;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:30:00', `ThoiGianCheckOut` = '2026-10-04 20:49:00' WHERE `CheckInID`=300;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:31:00', `ThoiGianCheckOut` = '2026-10-07 20:51:00' WHERE `CheckInID`=301;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 08:32:00', `ThoiGianCheckOut` = '2026-09-21 09:53:00' WHERE `CheckInID`=302;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 08:33:00', `ThoiGianCheckOut` = '2026-09-24 09:55:00' WHERE `CheckInID`=303;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 08:34:00', `ThoiGianCheckOut` = '2026-09-27 09:57:00' WHERE `CheckInID`=304;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 08:35:00', `ThoiGianCheckOut` = '2026-09-30 09:59:00' WHERE `CheckInID`=305;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 08:36:00', `ThoiGianCheckOut` = '2026-10-03 10:01:00' WHERE `CheckInID`=306;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 08:37:00', `ThoiGianCheckOut` = '2026-10-06 10:03:00' WHERE `CheckInID`=307;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 18:38:00', `ThoiGianCheckOut` = '2026-09-22 20:05:00' WHERE `CheckInID`=308;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 18:39:00', `ThoiGianCheckOut` = '2026-09-25 20:07:00' WHERE `CheckInID`=309;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 18:40:00', `ThoiGianCheckOut` = '2026-09-28 20:09:00' WHERE `CheckInID`=310;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 18:41:00', `ThoiGianCheckOut` = '2026-10-01 20:11:00' WHERE `CheckInID`=311;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 18:42:00', `ThoiGianCheckOut` = '2026-10-04 20:13:00' WHERE `CheckInID`=312;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 18:43:00', `ThoiGianCheckOut` = '2026-10-07 20:15:00' WHERE `CheckInID`=313;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 10:44:00', `ThoiGianCheckOut` = '2026-09-21 12:17:00' WHERE `CheckInID`=314;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 10:00:00', `ThoiGianCheckOut` = '2026-09-24 11:34:00' WHERE `CheckInID`=315;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 10:01:00', `ThoiGianCheckOut` = '2026-09-27 11:36:00' WHERE `CheckInID`=316;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 10:02:00', `ThoiGianCheckOut` = '2026-09-30 11:38:00' WHERE `CheckInID`=317;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 10:03:00', `ThoiGianCheckOut` = '2026-10-03 11:40:00' WHERE `CheckInID`=318;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 10:04:00', `ThoiGianCheckOut` = '2026-10-06 11:42:00' WHERE `CheckInID`=319;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 17:05:00', `ThoiGianCheckOut` = '2026-09-22 18:44:00' WHERE `CheckInID`=320;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 17:06:00', `ThoiGianCheckOut` = '2026-09-25 18:46:00' WHERE `CheckInID`=321;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 17:07:00', `ThoiGianCheckOut` = '2026-09-28 18:02:00' WHERE `CheckInID`=322;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 17:08:00', `ThoiGianCheckOut` = '2026-10-01 18:04:00' WHERE `CheckInID`=323;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 17:09:00', `ThoiGianCheckOut` = '2026-10-04 18:06:00' WHERE `CheckInID`=324;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 17:10:00', `ThoiGianCheckOut` = '2026-10-07 18:08:00' WHERE `CheckInID`=325;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-21 09:11:00', `ThoiGianCheckOut` = '2026-09-21 10:10:00' WHERE `CheckInID`=326;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-24 09:12:00', `ThoiGianCheckOut` = '2026-09-24 10:12:00' WHERE `CheckInID`=327;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-27 09:13:00', `ThoiGianCheckOut` = '2026-09-27 10:14:00' WHERE `CheckInID`=328;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-30 09:14:00', `ThoiGianCheckOut` = '2026-09-30 10:16:00' WHERE `CheckInID`=329;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-03 09:15:00', `ThoiGianCheckOut` = '2026-10-03 10:18:00' WHERE `CheckInID`=330;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-06 09:16:00', `ThoiGianCheckOut` = '2026-10-06 10:20:00' WHERE `CheckInID`=331;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-22 19:17:00', `ThoiGianCheckOut` = '2026-09-22 20:22:00' WHERE `CheckInID`=332;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-25 19:18:00', `ThoiGianCheckOut` = '2026-09-25 20:24:00' WHERE `CheckInID`=333;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-09-28 19:19:00', `ThoiGianCheckOut` = '2026-09-28 20:26:00' WHERE `CheckInID`=334;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-01 19:20:00', `ThoiGianCheckOut` = '2026-10-01 20:28:00' WHERE `CheckInID`=335;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-04 19:21:00', `ThoiGianCheckOut` = '2026-10-04 20:30:00' WHERE `CheckInID`=336;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-07 19:22:00', `ThoiGianCheckOut` = '2026-10-07 20:32:00' WHERE `CheckInID`=337;

UPDATE `checkin` SET `ThoiGianCheckIn` = '2026-10-08 19:25:00', `ThoiGianCheckOut` = '2026-10-08 20:37:00' WHERE `CheckInID`=385;

COMMIT;