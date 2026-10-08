const db=require('../common/db');
const fields=['MaKhuyenMai','TenKhuyenMai','PhanTramGiam','SoTienGiam','NgayBatDau','NgayKetThuc','DieuKien','TrangThai'];
const values=data=>Object.fromEntries(fields.filter(key=>data[key]!==undefined).map(key=>[key,data[key]]));
// One row per application. EXISTS avoids counting multiple payment attempts twice.
const usageSql=`
 SELECT x.ApDungKhuyenMaiID,x.KhuyenMaiID,'PACKAGE' Loai,x.DangKyID ThamChieuID,x.SoTienGiam,x.NgayApDung,
 CASE WHEN d.TrangThai='CANCELLED' THEN 'CANCELLED'
 WHEN EXISTS(SELECT 1 FROM thanhtoan t WHERE t.DangKyID=x.DangKyID AND t.TrangThai='SUCCESS') THEN 'SUCCESS'
 WHEN EXISTS(SELECT 1 FROM thanhtoan t WHERE t.DangKyID=x.DangKyID AND t.TrangThai='PENDING') THEN 'PENDING'
 WHEN EXISTS(SELECT 1 FROM thanhtoan t WHERE t.DangKyID=x.DangKyID AND t.TrangThai='FAILED') THEN 'FAILED'
 WHEN EXISTS(SELECT 1 FROM thanhtoan t WHERE t.DangKyID=x.DangKyID AND t.TrangThai='CANCELLED') THEN 'CANCELLED'
 ELSE 'UNVERIFIED' END TinhTrangThanhToan
 FROM apdungkhuyenmaigoitap x JOIN dangkygoitap d USING(DangKyID)
 UNION ALL
 SELECT x.ApDungKhuyenMaiID,x.KhuyenMaiID,'SHOP',x.DonHangID,x.SoTienGiam,x.NgayApDung,
 CASE WHEN o.TrangThai='CANCELLED' THEN 'CANCELLED'
 WHEN EXISTS(SELECT 1 FROM shopcheckout s JOIN thanhtoan t USING(ThanhToanID) WHERE s.DonHangID=x.DonHangID AND t.TrangThai='SUCCESS') THEN 'SUCCESS'
 WHEN EXISTS(SELECT 1 FROM shopcheckout s JOIN thanhtoan t USING(ThanhToanID) WHERE s.DonHangID=x.DonHangID AND t.TrangThai='PENDING') THEN 'PENDING'
 WHEN EXISTS(SELECT 1 FROM shopcheckout s JOIN thanhtoan t USING(ThanhToanID) WHERE s.DonHangID=x.DonHangID AND t.TrangThai='FAILED') THEN 'FAILED'
 WHEN EXISTS(SELECT 1 FROM shopcheckout s JOIN thanhtoan t USING(ThanhToanID) WHERE s.DonHangID=x.DonHangID AND t.TrangThai='CANCELLED') THEN 'CANCELLED'
 ELSE 'UNVERIFIED' END
 FROM apdungkhuyenmaidonhang x JOIN donhang o USING(DonHangID)
 UNION ALL
 SELECT x.ApDungKhuyenMaiID,x.KhuyenMaiID,'PT',x.ThuePTID,x.SoTienGiam,x.NgayApDung,
 CASE WHEN t.TrangThai='CANCELLED' THEN 'CANCELLED' ELSE 'UNVERIFIED' END
 FROM apdungkhuyenmaipt x JOIN thuept t USING(ThuePTID)`;
const stateSql=`CASE WHEN k.TrangThai='INACTIVE' THEN 'STOPPED'
 WHEN k.TrangThai='EXPIRED' OR k.NgayKetThuc<NOW() THEN 'EXPIRED'
 WHEN k.NgayBatDau>NOW() THEN 'UPCOMING' ELSE 'ACTIVE' END`;
exports.getById=(id,callback)=>db.query('SELECT * FROM khuyenmai WHERE KhuyenMaiID=?',[id],callback);
exports.getAll=callback=>db.query(`SELECT k.*,DATE_FORMAT(k.NgayBatDau,'%Y-%m-%d %H:%i:%s') NgayBatDau,
 DATE_FORMAT(k.NgayKetThuc,'%Y-%m-%d %H:%i:%s') NgayKetThuc,${stateSql} TinhTrang,
 COALESCE(a.LuotSuDung,0) LuotSuDung,COALESCE(a.TongSoTienGiam,0) TongSoTienGiam
 FROM khuyenmai k LEFT JOIN (SELECT KhuyenMaiID,COUNT(*) LuotSuDung,SUM(SoTienGiam) TongSoTienGiam
 FROM (${usageSql}) applied WHERE TinhTrangThanhToan='SUCCESS' GROUP BY KhuyenMaiID) a USING(KhuyenMaiID)
 ORDER BY k.NgayBatDau DESC,k.KhuyenMaiID DESC`,callback);
exports.getStats=callback=>db.query(`SELECT COUNT(*) SoChuongTrinh,
 COALESCE(SUM(${stateSql}='ACTIVE'),0) DangActive,
 (SELECT COUNT(*) FROM (${usageSql}) applied WHERE TinhTrangThanhToan='SUCCESS') LuotSuDung,
 (SELECT COALESCE(SUM(SoTienGiam),0) FROM (${usageSql}) applied WHERE TinhTrangThanhToan='SUCCESS') TongSoTienGiam
 FROM khuyenmai k`,(e,rows)=>callback(e,rows?.[0]));
exports.getHistory=callback=>db.query(`SELECT a.ApDungKhuyenMaiID,a.KhuyenMaiID,k.MaKhuyenMai,k.TenKhuyenMai,
 a.Loai,a.ThamChieuID,a.SoTienGiam,DATE_FORMAT(a.NgayApDung,'%Y-%m-%d %H:%i:%s') NgayApDung,a.TinhTrangThanhToan
 FROM (${usageSql}) a JOIN khuyenmai k USING(KhuyenMaiID) ORDER BY a.NgayApDung DESC,a.ApDungKhuyenMaiID DESC`,callback);
exports.insert=(data,callback)=>{const safe=values(data);db.query('INSERT INTO khuyenmai SET ?',safe,(e,r)=>callback(e,e?null:{KhuyenMaiID:r.insertId,...safe}));};
exports.update=(data,id,callback)=>{const safe=values(data);db.query('UPDATE khuyenmai SET ? WHERE KhuyenMaiID=?',[safe,id],(e,r)=>callback(e,e?null:{KhuyenMaiID:Number(id),...safe,affectedRows:r.affectedRows}));};
exports.deactivate=(id,callback)=>db.query("UPDATE khuyenmai SET TrangThai='INACTIVE' WHERE KhuyenMaiID=?",[id],callback);
