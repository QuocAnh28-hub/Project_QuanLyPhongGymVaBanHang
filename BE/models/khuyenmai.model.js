const db = require('../common/db');

const fields = ['MaKhuyenMai','TenKhuyenMai','PhanTramGiam','SoTienGiam','NgayBatDau','NgayKetThuc','DieuKien','GiaTriDonToiThieu','GioiHanSuDung','GioiHanMoiHoiVien','PhamVi','TrangThai'];
const values = data => Object.fromEntries(fields.filter(key => data[key] !== undefined).map(key => [key, data[key]]));

exports.getById = (id, callback) => db.query('SELECT * FROM khuyenmai WHERE KhuyenMaiID=?', [id], callback);
exports.getAll = callback => db.query(`SELECT k.*,
  (SELECT COUNT(*) FROM promotion_success_usage u WHERE u.KhuyenMaiID=k.KhuyenMaiID) LuotSuDung,
  (SELECT COALESCE(SUM(u.SoTienGiam),0) FROM promotion_success_usage u WHERE u.KhuyenMaiID=k.KhuyenMaiID) TongSoTienGiam
  FROM khuyenmai k ORDER BY k.NgayBatDau DESC,k.KhuyenMaiID DESC`, callback);
exports.getStats = callback => db.query(`SELECT COUNT(*) SoChuongTrinh,
  SUM(TrangThai='ACTIVE' AND NOW() BETWEEN NgayBatDau AND NgayKetThuc) DangActive,
  (SELECT COUNT(*) FROM promotion_success_usage) LuotSuDung,
  (SELECT COALESCE(SUM(SoTienGiam),0) FROM promotion_success_usage) TongSoTienGiam FROM khuyenmai`, (e,rows)=>callback(e,rows?.[0]));
exports.getHistory = callback => db.query(`SELECT u.ApDungKhuyenMaiID,k.MaKhuyenMai,k.TenKhuyenMai,u.Loai,u.ThamChieuID,u.SoTienGiam,u.NgayApDung FROM promotion_success_usage u JOIN khuyenmai k ON k.KhuyenMaiID=u.KhuyenMaiID ORDER BY u.NgayApDung DESC`, callback);
const invalid = message => Object.assign(new Error(message), { status: 409, code: 'INVALID_VOUCHER' });
exports.validateUsage = async (q, promotionId, memberId, scope, amount) => {
  // One promotion row lock serializes SUCCESS usage across all three payment flows.
  const [rows] = await q.query("SELECT *,NOW() BETWEEN NgayBatDau AND NgayKetThuc AS InDate FROM khuyenmai WHERE KhuyenMaiID=? FOR UPDATE", [promotionId]);
  const p = rows[0];
  if (!p || p.TrangThai !== 'ACTIVE' || !p.InDate || !['ALL',scope].includes(p.PhamVi) || amount < Number(p.GiaTriDonToiThieu)) throw invalid('Mã không hợp lệ, hết hạn hoặc không đủ điều kiện.');
  // Callers use READ COMMITTED: counts include the previous lock holder's commit.
  const [usage] = await q.query('SELECT COUNT(*) total,COALESCE(SUM(HoiVienID=?),0) personal FROM promotion_success_usage WHERE KhuyenMaiID=?', [memberId,promotionId]);
  if ((p.GioiHanSuDung !== null && Number(usage[0].total) >= p.GioiHanSuDung) || (p.GioiHanMoiHoiVien !== null && Number(usage[0].personal) >= p.GioiHanMoiHoiVien)) throw invalid('Mã đã hết lượt sử dụng.');
  return p;
};
exports.quote = async (q, code, memberId, scope, amount) => {
  if (typeof code !== 'string' || code.length > 50) throw invalid('Mã không hợp lệ.');
  const [rows] = await q.query('SELECT KhuyenMaiID FROM khuyenmai WHERE MaKhuyenMai=?', [code.trim()]);
  if (!rows.length) throw invalid('Mã không tồn tại.');
  const p = await exports.validateUsage(q, rows[0].KhuyenMaiID, memberId, scope, amount);
  const discount = Math.min(amount, Math.max(0, Number(p.SoTienGiam) > 0 ? Number(p.SoTienGiam) : Math.round(amount*Number(p.PhanTramGiam || 0)/100)));
  return { ...p, discount };
};
exports.insert = (data, callback) => { const safe=values(data); db.query('INSERT INTO khuyenmai SET ?',safe,(e,r)=>callback(e,e?null:{KhuyenMaiID:r.insertId,...safe})); };
exports.update = (data,id,callback) => { const safe=values(data); db.query('UPDATE khuyenmai SET ? WHERE KhuyenMaiID=?',[safe,id],(e,r)=>callback(e,e?null:{KhuyenMaiID:Number(id),...safe,affectedRows:r.affectedRows})); };
exports.deactivate = (id, callback) => db.query("UPDATE khuyenmai SET TrangThai='INACTIVE' WHERE KhuyenMaiID=?",[id],callback);
