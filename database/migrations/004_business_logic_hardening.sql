-- Apply after 003. Historical receipts minus paid orders initialize new inventory once.
CREATE TABLE IF NOT EXISTS business_migrations (Version INT PRIMARY KEY, AppliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
DELIMITER $$
DROP PROCEDURE IF EXISTS harden_business_004$$
CREATE PROCEDURE harden_business_004()
BEGIN
  IF NOT EXISTS (SELECT 1 FROM business_migrations WHERE Version=4) THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shopcheckout' AND COLUMN_NAME='KhoID') THEN
      ALTER TABLE shopcheckout ADD KhoID INT NULL, ADD FOREIGN KEY (KhoID) REFERENCES kho(KhoID);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shopcheckout' AND COLUMN_NAME='KhuyenMaiID') THEN
    ALTER TABLE shopcheckout ADD KhuyenMaiID INT NULL, ADD SoTienGiam DECIMAL(15,2) NOT NULL DEFAULT 0,
      ADD FOREIGN KEY (KhuyenMaiID) REFERENCES khuyenmai(KhuyenMaiID);
    END IF;
    -- Existing pending orders require an explicitly configured active warehouse.
    UPDATE shopcheckout SET KhoID=(SELECT MIN(KhoID) FROM kho WHERE TrangThai='ACTIVE') WHERE KhoID IS NULL;
    IF NOT EXISTS (SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='tonkho') THEN
    CREATE TABLE tonkho (
      KhoID INT NOT NULL, SanPhamID INT NOT NULL, SoLuongTon BIGINT NOT NULL DEFAULT 0,
      PRIMARY KEY (KhoID,SanPhamID), CHECK (SoLuongTon>=0),
      FOREIGN KEY (KhoID) REFERENCES kho(KhoID),
      FOREIGN KEY (SanPhamID) REFERENCES sanpham(SanPhamID)
    );
    -- Legacy oversold quantities have no physical stock to carry forward.
    INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon)
      SELECT m.KhoID,m.SanPhamID,GREATEST(SUM(m.Quantity),0) FROM (
        SELECT p.KhoID,c.SanPhamID,SUM(c.SoLuong) Quantity FROM phieunhap p
          JOIN chitietphieunhap c ON c.PhieuNhapID=p.PhieuNhapID
          WHERE p.TrangThai='COMPLETED' GROUP BY p.KhoID,c.SanPhamID
        UNION ALL
        SELECT s.KhoID,c.SanPhamID,-SUM(c.SoLuong) FROM shopcheckout s
          JOIN thanhtoan t ON t.ThanhToanID=s.ThanhToanID AND t.TrangThai='SUCCESS'
          JOIN chitietdonhang c ON c.DonHangID=s.DonHangID
          WHERE s.KhoID IS NOT NULL GROUP BY s.KhoID,c.SanPhamID
      ) m GROUP BY m.KhoID,m.SanPhamID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='dangkygoitap' AND COLUMN_NAME='KhuyenMaiID') THEN
    ALTER TABLE dangkygoitap ADD KhuyenMaiID INT NULL,
      ADD SoTienGiam DECIMAL(15,2) NOT NULL DEFAULT 0,
      ADD FOREIGN KEY (KhuyenMaiID) REFERENCES khuyenmai(KhuyenMaiID);
    END IF;
    UPDATE dangkygoitap d JOIN apdungkhuyenmaigoitap a ON a.DangKyID=d.DangKyID
      SET d.KhuyenMaiID=a.KhuyenMaiID,d.SoTienGiam=a.SoTienGiam WHERE d.KhuyenMaiID IS NULL;
    DELETE a FROM apdungkhuyenmaigoitap a WHERE NOT EXISTS
      (SELECT 1 FROM thanhtoan t WHERE t.DangKyID=a.DangKyID AND t.TrangThai='SUCCESS');
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='thanhtoan' AND COLUMN_NAME='ActivationMode') THEN
      ALTER TABLE thanhtoan ADD ActivationMode ENUM('QUEUE_AFTER_CURRENT','REPLACE_NOW') NOT NULL DEFAULT 'QUEUE_AFTER_CURRENT';
      UPDATE thanhtoan SET ActivationMode='REPLACE_NOW' WHERE DangKyID IS NOT NULL AND NoiDung LIKE '%REPLACE_NOW%';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='thanhtoan' AND COLUMN_NAME='ThuePTID') THEN
    ALTER TABLE thanhtoan ADD ThuePTID INT NULL, ADD UNIQUE KEY UQ_ThanhToan_PT (ThuePTID),
      ADD FOREIGN KEY (ThuePTID) REFERENCES thuept(ThuePTID);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='thuept' AND COLUMN_NAME='KhuyenMaiID') THEN
    ALTER TABLE thuept ADD KhuyenMaiID INT NULL, ADD SoTienGiam DECIMAL(15,2) NOT NULL DEFAULT 0,
      ADD FOREIGN KEY (KhuyenMaiID) REFERENCES khuyenmai(KhuyenMaiID);
    END IF;
    -- Existing bookings have no proven receipt: retain a pending payment.
    INSERT INTO thanhtoan (ThuePTID,HoiVienID,SoTien,PhuongThucThanhToan,NoiDung,TrangThai)
      SELECT ThuePTID,HoiVienID,GiaThue,'TIEN_MAT',CONCAT('PT #',ThuePTID),
        CASE WHEN TrangThai='CANCELLED' THEN 'CANCELLED' ELSE 'PENDING' END FROM thuept b
      WHERE NOT EXISTS (SELECT 1 FROM thanhtoan t WHERE t.ThuePTID=b.ThuePTID);
    UPDATE thuept b JOIN thanhtoan t ON t.ThuePTID=b.ThuePTID AND t.TrangThai='PENDING'
      SET b.TrangThai='PENDING' WHERE b.TrangThai='CONFIRMED';
    CREATE TABLE IF NOT EXISTS xacminhhssv (
      XacMinhID INT AUTO_INCREMENT PRIMARY KEY, HoiVienID INT NOT NULL UNIQUE,
      TenTruong VARCHAR(200) NOT NULL, MaHSSV VARCHAR(100) NOT NULL, NgayHetHan DATE NOT NULL,
      TrangThai ENUM('PENDING','VERIFIED','REJECTED') NOT NULL DEFAULT 'PENDING',
      NgayGui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, NgayDuyet DATETIME NULL,
      FOREIGN KEY (HoiVienID) REFERENCES hoivien(HoiVienID)
    );
    CREATE TABLE IF NOT EXISTS baoluugoitap (
      BaoLuuID INT AUTO_INCREMENT PRIMARY KEY, DangKyID INT NOT NULL,
      NgayBatDau DATE NOT NULL, NgayKetThuc DATE NOT NULL,
      TrangThai ENUM('PENDING','APPROVED','COMPLETED','REJECTED') NOT NULL DEFAULT 'PENDING',
      NgayGui DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, NgayDuyet DATETIME NULL,
      CHECK (NgayKetThuc>=NgayBatDau), FOREIGN KEY (DangKyID) REFERENCES dangkygoitap(DangKyID)
    );
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='khuyenmai' AND COLUMN_NAME='GiaTriDonToiThieu') THEN
    ALTER TABLE khuyenmai ADD GiaTriDonToiThieu DECIMAL(15,2) NOT NULL DEFAULT 0,
      ADD GioiHanSuDung INT NULL, ADD GioiHanMoiHoiVien INT NULL,
      ADD PhamVi ENUM('PACKAGE','SHOP','PT','ALL') NOT NULL DEFAULT 'ALL',
      ADD CHECK (GiaTriDonToiThieu>=0), ADD CHECK (GioiHanSuDung IS NULL OR GioiHanSuDung>=0),
      ADD CHECK (GioiHanMoiHoiVien IS NULL OR GioiHanMoiHoiVien>=0);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='hoadon' AND NON_UNIQUE=0 AND COLUMN_NAME='ThanhToanID') THEN
      ALTER TABLE hoadon ADD UNIQUE KEY UQ_HoaDon_Payment (ThanhToanID);
    END IF;
    INSERT INTO business_migrations (Version) VALUES (4);
  END IF;
END$$
CALL harden_business_004()$$
DROP PROCEDURE harden_business_004$$
DELIMITER ;
CREATE OR REPLACE VIEW promotion_success_usage AS
  SELECT a.ApDungKhuyenMaiID,a.KhuyenMaiID,d.HoiVienID,'PACKAGE' Loai,a.DangKyID ThamChieuID,a.SoTienGiam,a.NgayApDung
    FROM apdungkhuyenmaigoitap a JOIN dangkygoitap d ON d.DangKyID=a.DangKyID
    WHERE EXISTS (SELECT 1 FROM thanhtoan t WHERE t.DangKyID=a.DangKyID AND t.TrangThai='SUCCESS')
  UNION ALL
  SELECT a.ApDungKhuyenMaiID,a.KhuyenMaiID,d.HoiVienID,'SHOP',a.DonHangID,a.SoTienGiam,a.NgayApDung
    FROM apdungkhuyenmaidonhang a JOIN donhang d ON d.DonHangID=a.DonHangID
    JOIN shopcheckout s ON s.DonHangID=d.DonHangID JOIN thanhtoan t ON t.ThanhToanID=s.ThanhToanID AND t.TrangThai='SUCCESS'
  UNION ALL
  SELECT a.ApDungKhuyenMaiID,a.KhuyenMaiID,d.HoiVienID,'PT',a.ThuePTID,a.SoTienGiam,a.NgayApDung
    FROM apdungkhuyenmaipt a JOIN thuept d ON d.ThuePTID=a.ThuePTID
    JOIN thanhtoan t ON t.ThuePTID=d.ThuePTID AND t.TrangThai='SUCCESS';
