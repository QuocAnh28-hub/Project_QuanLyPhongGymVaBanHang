-- Correct the warehouse of the unpaid order; do not alter stock or confirm money.
START TRANSACTION;
UPDATE shopcheckout s JOIN donhang d USING(DonHangID) JOIN thanhtoan p USING(ThanhToanID)
SET s.KhoID=10
WHERE s.DonHangID=134 AND s.KhoID=1 AND d.TrangThai='PENDING' AND p.TrangThai='PENDING'
AND EXISTS(SELECT 1 FROM kho WHERE KhoID=10 AND TrangThai='ACTIVE')
AND NOT EXISTS(SELECT 1 FROM chitietdonhang c LEFT JOIN tonkho t ON t.KhoID=10 AND t.SanPhamID=c.SanPhamID
  WHERE c.DonHangID=s.DonHangID AND COALESCE(t.SoLuongTon,0)<c.SoLuong);
COMMIT;
