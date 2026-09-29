const db = require('../common/db');

exports.getAdmin = async (from, to) => {
  const q = db.promise();
  const range = [from, to];
  const one = async (sql, params = range) => (await q.query(sql, params))[0];
  const [revenue, revenueByDay, revenueByMethod, members, checkins, checkinsByDay, peakHours,
    shop, topProducts, pt, topTrainers] = await Promise.all([
    one(`SELECT COALESCE(SUM(tt.SoTien),0) total,
      COALESCE(SUM(CASE WHEN tt.DangKyID IS NOT NULL THEN tt.SoTien ELSE 0 END),0) package,
      COALESCE(SUM(CASE WHEN sc.DonHangID IS NOT NULL THEN tt.SoTien ELSE 0 END),0) shop
      FROM thanhtoan tt LEFT JOIN shopcheckout sc ON sc.ThanhToanID=tt.ThanhToanID
      WHERE tt.TrangThai='SUCCESS' AND tt.NgayThanhToan>=? AND tt.NgayThanhToan<?`),
    one(`SELECT DATE(tt.NgayThanhToan) date, SUM(tt.SoTien) amount FROM thanhtoan tt
      WHERE tt.TrangThai='SUCCESS' AND tt.NgayThanhToan>=? AND tt.NgayThanhToan<? GROUP BY DATE(tt.NgayThanhToan) ORDER BY date`),
    one(`SELECT tt.PhuongThucThanhToan method, SUM(tt.SoTien) amount FROM thanhtoan tt
      WHERE tt.TrangThai='SUCCESS' AND tt.NgayThanhToan>=? AND tt.NgayThanhToan<? GROUP BY tt.PhuongThucThanhToan ORDER BY amount DESC`),
    one(`SELECT COUNT(*) total, SUM(TrangThai='ACTIVE') active,
      SUM(NgayDangKy>=? AND NgayDangKy<?) newMembers,
      (SELECT COUNT(*) FROM dangkygoitap WHERE NgayDangKy>=? AND NgayDangKy<?) newRegistrations,
      (SELECT COUNT(*) FROM dangkygoitap WHERE TrangThai='ACTIVE' AND NgayKetThuc BETWEEN CURDATE() AND DATE_ADD(CURDATE(),INTERVAL 7 DAY)) expiring,
      (SELECT COUNT(*) FROM dangkygoitap WHERE TrangThai='EXPIRED' OR NgayKetThuc<CURDATE()) expired
      FROM hoivien`, [from, to, from, to]),
    one(`SELECT COUNT(*) total, SUM(TrangThai='CHECKED_IN') checkedIn, SUM(TrangThai='CHECKED_OUT') checkedOut
      FROM checkin WHERE ThoiGianCheckIn>=? AND ThoiGianCheckIn<?`),
    one(`SELECT DATE(ThoiGianCheckIn) date, COUNT(*) count FROM checkin WHERE ThoiGianCheckIn>=? AND ThoiGianCheckIn<? GROUP BY DATE(ThoiGianCheckIn) ORDER BY date`),
    one(`SELECT HOUR(ThoiGianCheckIn) hour, COUNT(*) count FROM checkin WHERE ThoiGianCheckIn>=? AND ThoiGianCheckIn<? GROUP BY HOUR(ThoiGianCheckIn) ORDER BY count DESC, hour LIMIT 3`),
    one(`SELECT COUNT(*) total, SUM(o.TrangThai='COMPLETED') completed, SUM(o.TrangThai='CANCELLED') cancelled,
      COALESCE(SUM(CASE WHEN tt.TrangThai='SUCCESS' THEN tt.SoTien ELSE 0 END),0) revenue
      FROM donhang o LEFT JOIN shopcheckout sc ON sc.DonHangID=o.DonHangID LEFT JOIN thanhtoan tt ON tt.ThanhToanID=sc.ThanhToanID
      WHERE o.NgayDat>=? AND o.NgayDat<?`),
    one(`SELECT sp.SanPhamID,sp.TenSanPham,SUM(ct.SoLuong) quantity FROM chitietdonhang ct
      JOIN donhang o ON o.DonHangID=ct.DonHangID JOIN sanpham sp ON sp.SanPhamID=ct.SanPhamID
      WHERE o.NgayDat>=? AND o.NgayDat<? AND o.TrangThai<>'CANCELLED' GROUP BY sp.SanPhamID,sp.TenSanPham ORDER BY quantity DESC LIMIT 5`),
    one(`SELECT COUNT(*) total,SUM(TrangThai='PENDING') pending,SUM(TrangThai='CONFIRMED') confirmed,
      SUM(TrangThai='COMPLETED') completed,SUM(TrangThai='CANCELLED') cancelled FROM thuept WHERE NgayDat>=? AND NgayDat<?`),
    one(`SELECT p.PTID,p.HoTen,COUNT(*) rentals FROM thuept t JOIN pt p ON p.PTID=t.PTID
      WHERE t.NgayDat>=? AND t.NgayDat<? GROUP BY p.PTID,p.HoTen ORDER BY rentals DESC LIMIT 5`),
  ]);
  return { range: { from, to }, revenue: { ...revenue[0], pt: null }, revenueByDay, revenueByMethod,
    members: members[0], checkins: checkins[0], checkinsByDay, peakHours,
    shop: shop[0], topProducts, pt: pt[0], topTrainers };
};
