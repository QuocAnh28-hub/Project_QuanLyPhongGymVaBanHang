const fs=require('fs');
const path=require('path');
const assert=require('assert/strict');
require('dotenv').config({path:path.join(__dirname,'../.env')});
const mysql=require('mysql2/promise');
const checks={
 testPackages:"SELECT COUNT(*) n FROM goitap WHERE TenGoi LIKE '%test%' OR Gia>100000000",
 testProducts:"SELECT COUNT(*) n FROM sanpham WHERE TenSanPham LIKE '%test%'",
 invalidMembershipDates:'SELECT COUNT(*) n FROM dangkygoitap WHERE NgayKetThuc<NgayBatDau',
 inconsistentMembershipPayments:'SELECT COUNT(*) n FROM thanhtoan p JOIN dangkygoitap d USING(DangKyID) WHERE p.HoiVienID<>d.HoiVienID OR p.SoTien<>d.GiaThanhToan',
 inconsistentInvoices:'SELECT COUNT(*) n FROM hoadon h JOIN thanhtoan p USING(ThanhToanID) WHERE h.TongTien<>p.SoTien',
 missingPaidInvoices:"SELECT COUNT(*) n FROM thanhtoan p WHERE p.TrangThai='SUCCESS' AND NOT EXISTS(SELECT 1 FROM hoadon h WHERE h.ThanhToanID=p.ThanhToanID)",
 futureOrders:'SELECT COUNT(*) n FROM donhang WHERE NgayDat>NOW()',
 futurePayments:'SELECT COUNT(*) n FROM thanhtoan WHERE NgayThanhToan>NOW()',
 futureCheckIns:'SELECT COUNT(*) n FROM checkin WHERE ThoiGianCheckIn>NOW() OR ThoiGianCheckOut>NOW()',
 invalidCheckOuts:"SELECT COUNT(*) n FROM checkin WHERE ThoiGianCheckOut<ThoiGianCheckIn OR (TrangThai='CHECKED_OUT' AND ThoiGianCheckOut IS NULL) OR (TrangThai='CHECKED_IN' AND ThoiGianCheckOut IS NOT NULL)",
 staleActiveCheckIns:"SELECT COUNT(*) n FROM checkin WHERE TrangThai='CHECKED_IN' AND ThoiGianCheckIn<DATE_SUB(NOW(),INTERVAL 6 HOUR)",
 incorrectReceiptTotals:'SELECT COUNT(*) n FROM phieunhap p WHERE TongTien<>COALESCE((SELECT SUM(ThanhTien) FROM chitietphieunhap c WHERE c.PhieuNhapID=p.PhieuNhapID),0)',
 incorrectOrderTotals:'SELECT COUNT(*) n FROM donhang d LEFT JOIN shopcheckout s USING(DonHangID) WHERE d.TongTien<>COALESCE((SELECT SUM(ThanhTien) FROM chitietdonhang c WHERE c.DonHangID=d.DonHangID),0)-COALESCE((SELECT SUM(SoTienGiam) FROM apdungkhuyenmaidonhang a WHERE a.DonHangID=d.DonHangID),0)+COALESCE(s.PhiVanChuyen,0)',
 incorrectLineTotals:'SELECT COUNT(*) n FROM chitietdonhang WHERE ThanhTien<>SoLuong*DonGia OR SoLuong<=0',
 incorrectStockLedger:"SELECT COUNT(*) n FROM tonkho t WHERE t.SoLuongTon<>COALESCE((SELECT SUM(c.SoLuong) FROM chitietphieunhap c JOIN phieunhap p USING(PhieuNhapID) WHERE p.KhoID=t.KhoID AND c.SanPhamID=t.SanPhamID AND p.TrangThai='COMPLETED'),0)-COALESCE((SELECT SUM(c.SoLuong) FROM chitietdonhang c JOIN donhang d USING(DonHangID) JOIN shopcheckout s USING(DonHangID) WHERE s.KhoID=t.KhoID AND c.SanPhamID=t.SanPhamID AND d.TrangThai IN ('CONFIRMED','PROCESSING','COMPLETED')),0)",
 negativeStock:'SELECT COUNT(*) n FROM tonkho WHERE SoLuongTon<0',
 duplicateActiveMemberships:"SELECT COUNT(*) n FROM (SELECT HoiVienID,COUNT(*) cnt FROM dangkygoitap WHERE TrangThai='ACTIVE' AND CURDATE() BETWEEN NgayBatDau AND NgayKetThuc GROUP BY HoiVienID HAVING cnt>1) x",
 invalidPtRelations:'SELECT COUNT(*) n FROM thuept t JOIN lichpt l USING(LichPTID) WHERE t.PTID<>l.PTID OR l.GioBatDau>=l.GioKetThuc',
 duplicatePtBookings:"SELECT COUNT(*) n FROM (SELECT LichPTID,COUNT(*) cnt FROM thuept WHERE TrangThai IN ('PENDING','CONFIRMED','COMPLETED') GROUP BY LichPTID HAVING cnt>1) x",
 incorrectPtPrices:'SELECT COUNT(*) n FROM thuept t JOIN pt p USING(PTID) WHERE t.GiaThue<>p.GiaThue-COALESCE((SELECT SUM(SoTienGiam) FROM apdungkhuyenmaipt a WHERE a.ThuePTID=t.ThuePTID),0)',
};
(async()=>{
 const c=await mysql.createConnection({host:process.env.DB_HOST,port:+(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME});
 const result={};
 try{
  await c.query("SET time_zone='+07:00'");
  for(const [name,sql]of Object.entries(checks)){const [[r]]=await c.query(sql);result[name]=Number(r.n);}
  const [fks]=await c.query('SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL');
  for(const fk of fks){const [[r]]=await c.query('SELECT COUNT(*) n FROM ?? a LEFT JOIN ?? b ON a.??=b.?? WHERE a.?? IS NOT NULL AND b.?? IS NULL',[fk.TABLE_NAME,fk.REFERENCED_TABLE_NAME,fk.COLUMN_NAME,fk.REFERENCED_COLUMN_NAME,fk.COLUMN_NAME,fk.REFERENCED_COLUMN_NAME]);assert.equal(r.n,0,`Foreign key ${fk.TABLE_NAME}.${fk.COLUMN_NAME}`);}
  result.foreignKeyOrphans=0;
  fs.writeFileSync(path.join(__dirname,'data-audit-report.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  assert(Object.values(result).every(n=>n===0),'Remaining anomalies in audit report');
 }finally{await c.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
