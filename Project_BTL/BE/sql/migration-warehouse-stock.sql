-- Upgrade databases created before warehouse stock tracking.
-- Run CREATE first. Add shopcheckout.KhoID only if the column is missing.
CREATE TABLE IF NOT EXISTS tonkho (
  KhoID INT NOT NULL,
  SanPhamID INT NOT NULL,
  SoLuongTon INT NOT NULL DEFAULT 0,
  NgayCapNhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (KhoID, SanPhamID),
  CONSTRAINT FK_TonKho_Kho FOREIGN KEY (KhoID) REFERENCES kho(KhoID)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT FK_TonKho_SanPham FOREIGN KEY (SanPhamID) REFERENCES sanpham(SanPhamID)
    ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Nullable because historical orders do not record their fulfillment warehouse.
ALTER TABLE shopcheckout
  ADD COLUMN KhoID INT NULL,
  ADD CONSTRAINT FK_ShopCheckout_Kho FOREIGN KEY (KhoID) REFERENCES kho(KhoID)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Only initialize previously untracked rows; never overwrite current stock.
-- Historical sales with an unknown warehouse require a later stock reconciliation.
INSERT INTO tonkho (KhoID, SanPhamID, SoLuongTon)
SELECT p.KhoID, c.SanPhamID, SUM(c.SoLuong)
FROM phieunhap p
JOIN chitietphieunhap c ON c.PhieuNhapID = p.PhieuNhapID
LEFT JOIN tonkho t ON t.KhoID = p.KhoID AND t.SanPhamID = c.SanPhamID
WHERE p.TrangThai = 'COMPLETED' AND t.KhoID IS NULL
GROUP BY p.KhoID, c.SanPhamID;
