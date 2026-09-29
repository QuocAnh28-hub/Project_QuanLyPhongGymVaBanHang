const db = require('../common/db');

const fields = ['MaKhuyenMai','TenKhuyenMai','PhanTramGiam','SoTienGiam','NgayBatDau','NgayKetThuc','DieuKien','TrangThai'];
const values = data => Object.fromEntries(fields.filter(key => data[key] !== undefined).map(key => [key, data[key]]));

exports.getById = (id, callback) => db.query('SELECT * FROM khuyenmai WHERE KhuyenMaiID=?', [id], callback);
exports.getAll = callback => db.query(`
  SELECT k.KhuyenMaiID,k.MaKhuyenMai,k.TenKhuyenMai,k.PhanTramGiam,k.SoTienGiam,k.NgayBatDau,k.NgayKetThuc,k.DieuKien,
    CASE WHEN k.TrangThai='ACTIVE' AND k.NgayKetThuc<NOW() THEN 'EXPIRED' ELSE k.TrangThai END AS TrangThai,
    (SELECT COUNT(*) FROM apdungkhuyenmaigoitap x WHERE x.KhuyenMaiID=k.KhuyenMaiID)+
    (SELECT COUNT(*) FROM apdungkhuyenmaidonhang x WHERE x.KhuyenMaiID=k.KhuyenMaiID)+
    (SELECT COUNT(*) FROM apdungkhuyenmaipt x WHERE x.KhuyenMaiID=k.KhuyenMaiID) AS LuotSuDung,
    (SELECT COALESCE(SUM(SoTienGiam),0) FROM apdungkhuyenmaigoitap x WHERE x.KhuyenMaiID=k.KhuyenMaiID)+
    (SELECT COALESCE(SUM(SoTienGiam),0) FROM apdungkhuyenmaidonhang x WHERE x.KhuyenMaiID=k.KhuyenMaiID)+
    (SELECT COALESCE(SUM(SoTienGiam),0) FROM apdungkhuyenmaipt x WHERE x.KhuyenMaiID=k.KhuyenMaiID) AS TongSoTienGiam
  FROM khuyenmai k ORDER BY k.NgayBatDau DESC,k.KhuyenMaiID DESC`, callback);
exports.getStats = callback => db.query(`SELECT COUNT(*) SoChuongTrinh,
  SUM(TrangThai='ACTIVE' AND NOW() BETWEEN NgayBatDau AND NgayKetThuc) DangActive,
  (SELECT COUNT(*) FROM apdungkhuyenmaigoitap)+(SELECT COUNT(*) FROM apdungkhuyenmaidonhang)+(SELECT COUNT(*) FROM apdungkhuyenmaipt) LuotSuDung,
  (SELECT COALESCE(SUM(SoTienGiam),0) FROM apdungkhuyenmaigoitap)+(SELECT COALESCE(SUM(SoTienGiam),0) FROM apdungkhuyenmaidonhang)+(SELECT COALESCE(SUM(SoTienGiam),0) FROM apdungkhuyenmaipt) TongSoTienGiam
  FROM khuyenmai`, (e, rows) => callback(e, rows?.[0]));
exports.getHistory = callback => db.query(`
  SELECT x.ApDungKhuyenMaiID,k.MaKhuyenMai,k.TenKhuyenMai,'PACKAGE' Loai,x.DangKyID ThamChieuID,x.SoTienGiam,x.NgayApDung FROM apdungkhuyenmaigoitap x JOIN khuyenmai k ON k.KhuyenMaiID=x.KhuyenMaiID
  UNION ALL SELECT x.ApDungKhuyenMaiID,k.MaKhuyenMai,k.TenKhuyenMai,'SHOP',x.DonHangID,x.SoTienGiam,x.NgayApDung FROM apdungkhuyenmaidonhang x JOIN khuyenmai k ON k.KhuyenMaiID=x.KhuyenMaiID
  UNION ALL SELECT x.ApDungKhuyenMaiID,k.MaKhuyenMai,k.TenKhuyenMai,'PT',x.ThuePTID,x.SoTienGiam,x.NgayApDung FROM apdungkhuyenmaipt x JOIN khuyenmai k ON k.KhuyenMaiID=x.KhuyenMaiID
  ORDER BY NgayApDung DESC`, callback);
exports.insert = (data, callback) => { const safe=values(data); db.query('INSERT INTO khuyenmai SET ?',safe,(e,r)=>callback(e,e?null:{KhuyenMaiID:r.insertId,...safe})); };
exports.update = (data,id,callback) => { const safe=values(data); db.query('UPDATE khuyenmai SET ? WHERE KhuyenMaiID=?',[safe,id],(e,r)=>callback(e,e?null:{KhuyenMaiID:Number(id),...safe,affectedRows:r.affectedRows})); };
exports.deactivate = (id, callback) => db.query("UPDATE khuyenmai SET TrangThai='INACTIVE' WHERE KhuyenMaiID=?",[id],callback);
