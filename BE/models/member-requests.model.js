const db = require('../common/db');
const fail = (status, message) => Object.assign(new Error(message), { status });
const date = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(new Date(`${value}T00:00:00Z`).getTime()) && new Date(`${value}T00:00:00Z`).toISOString().slice(0,10) === value;

async function transaction(operation) {
  const c = await db.promise().getConnection();
  try {
    await c.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
    await c.beginTransaction();
    const result = await operation(c);
    await c.commit();
    return result;
  }
  catch (e) { await c.rollback().catch(() => {}); throw e; }
  finally { c.release(); }
}
async function member(q, accountId) {
  const [rows] = await q.query('SELECT HoiVienID FROM hoivien WHERE TaiKhoanID=? FOR UPDATE', [accountId]);
  if (!rows.length) throw fail(404, 'Member not found.');
  return rows[0].HoiVienID;
}
exports.requireStudent = async (q, memberId, packageName) => {
  if (!/HSSV|học sinh|sinh viên/i.test(packageName)) return;
  const [rows] = await q.query("SELECT XacMinhID FROM xacminhhssv WHERE HoiVienID=? AND TrangThai='VERIFIED' AND NgayHetHan>=CURDATE() FOR UPDATE", [memberId]);
  if (!rows.length) throw fail(403, 'Student verification is required and must not be expired.');
};
exports.getStudent = async accountId => {
  const [rows] = await db.promise().query(`SELECT x.*,DATE_FORMAT(x.NgayHetHan,'%Y-%m-%d') expiryDate FROM xacminhhssv x JOIN hoivien h ON h.HoiVienID=x.HoiVienID WHERE h.TaiKhoanID=?`, [accountId]);
  return rows[0] || null;
};
exports.listStudents = async () => (await db.promise().query('SELECT x.*,h.HoTen FROM xacminhhssv x JOIN hoivien h ON h.HoiVienID=x.HoiVienID ORDER BY x.NgayGui DESC'))[0];
exports.submitStudent = (accountId, input) => transaction(async q => {
  const memberId = await member(q, accountId);
  if (typeof input.TenTruong !== 'string' || !input.TenTruong.trim() || input.TenTruong.length>200 || typeof input.MaHSSV !== 'string' || !input.MaHSSV.trim() || input.MaHSSV.length>100 || !date(input.NgayHetHan)) throw fail(400, 'Invalid student information.');
  const [valid] = await q.query('SELECT ?>=CURDATE() valid', [input.NgayHetHan]);
  if (!valid[0].valid) throw fail(400, 'Student card has expired.');
  await q.query(`INSERT INTO xacminhhssv (HoiVienID,TenTruong,MaHSSV,NgayHetHan) VALUES (?,?,?,?)
    ON DUPLICATE KEY UPDATE TenTruong=VALUES(TenTruong),MaHSSV=VALUES(MaHSSV),NgayHetHan=VALUES(NgayHetHan),TrangThai='PENDING',NgayGui=NOW(),NgayDuyet=NULL`, [memberId,input.TenTruong.trim(),input.MaHSSV.trim(),input.NgayHetHan]);
  return { TrangThai: 'PENDING' };
});
exports.reviewStudent = (id, status) => transaction(async q => {
  if (!['VERIFIED','REJECTED'].includes(status)) throw fail(400, 'Invalid decision.');
  const [rows] = await q.query('SELECT *,NgayHetHan>=CURDATE() valid FROM xacminhhssv WHERE XacMinhID=? FOR UPDATE', [id]);
  if (!rows.length) throw fail(404, 'Request not found.');
  if (rows[0].TrangThai !== 'PENDING' || (status==='VERIFIED' && !rows[0].valid)) throw fail(409, 'Request is not pending or card is expired.');
  await q.query('UPDATE xacminhhssv SET TrangThai=?,NgayDuyet=NOW() WHERE XacMinhID=?', [status,id]);
  return { TrangThai: status };
});
exports.listFreezes = async accountId => (await db.promise().query(`SELECT b.*,h.HoTen,d.HoiVienID FROM baoluugoitap b
  JOIN dangkygoitap d ON d.DangKyID=b.DangKyID JOIN hoivien h ON h.HoiVienID=d.HoiVienID
  WHERE (? IS NULL OR h.TaiKhoanID=?) ORDER BY b.NgayGui DESC`, [accountId,accountId]))[0];
exports.requestFreeze = (accountId, input) => transaction(async q => {
  const memberId = await member(q, accountId);
  if (!Number.isSafeInteger(Number(input.DangKyID)) || Number(input.DangKyID)<=0 || !date(input.NgayBatDau) || !date(input.NgayKetThuc) || input.NgayKetThuc<input.NgayBatDau) throw fail(400,'Invalid freeze period.');
  const [rows] = await q.query(`SELECT d.* FROM dangkygoitap d WHERE d.DangKyID=? AND d.HoiVienID=? AND d.TrangThai='ACTIVE'
    AND d.NgayBatDau<=CURDATE() AND d.NgayKetThuc>=CURDATE() AND ?>=CURDATE() AND ?<=d.NgayKetThuc
    AND EXISTS (SELECT 1 FROM thanhtoan t WHERE t.DangKyID=d.DangKyID AND t.TrangThai='SUCCESS') FOR UPDATE`, [input.DangKyID,memberId,input.NgayBatDau,input.NgayBatDau]);
  if (!rows.length) throw fail(409,'An active paid package is required.');
  const [existing] = await q.query("SELECT BaoLuuID FROM baoluugoitap WHERE DangKyID=? AND TrangThai IN ('PENDING','APPROVED') FOR UPDATE", [input.DangKyID]);
  if (existing.length) throw fail(409,'A freeze request is already pending or approved.');
  const [result] = await q.query('INSERT INTO baoluugoitap (DangKyID,NgayBatDau,NgayKetThuc) VALUES (?,?,?)', [input.DangKyID,input.NgayBatDau,input.NgayKetThuc]);
  return { BaoLuuID: result.insertId, TrangThai: 'PENDING' };
});
exports.reviewFreeze = (id, status) => transaction(async q => {
  if (!['APPROVED','REJECTED'].includes(status)) throw fail(400,'Invalid decision.');
  const [refs] = await q.query('SELECT d.HoiVienID FROM baoluugoitap b JOIN dangkygoitap d ON d.DangKyID=b.DangKyID WHERE b.BaoLuuID=?', [id]);
  if (!refs.length) throw fail(404,'Request not found.');
  await q.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [refs[0].HoiVienID]);
  const [rows] = await q.query(`SELECT b.*,d.HoiVienID,d.TrangThai PackageStatus,
    b.NgayBatDau>=CURDATE() AND b.NgayBatDau<=d.NgayKetThuc AND d.NgayBatDau<=CURDATE() AND d.NgayKetThuc>=CURDATE() IsFuture,DATEDIFF(b.NgayKetThuc,b.NgayBatDau)+1 Days
    FROM baoluugoitap b JOIN dangkygoitap d ON d.DangKyID=b.DangKyID WHERE b.BaoLuuID=? FOR UPDATE`, [id]);
  const r = rows[0];
  if (r.TrangThai !== 'PENDING') throw fail(409,'Request is no longer pending.');
  if (status==='APPROVED') {
    const [paid] = await q.query("SELECT ThanhToanID FROM thanhtoan WHERE DangKyID=? AND TrangThai='SUCCESS' FOR UPDATE", [r.DangKyID]);
    const [sessions] = await q.query("SELECT CheckInID FROM checkin WHERE HoiVienID=? AND TrangThai='CHECKED_IN' AND ThoiGianCheckOut IS NULL FOR UPDATE", [r.HoiVienID]);
    if (!r.IsFuture || r.PackageStatus!=='ACTIVE' || !paid.length || sessions.length) throw fail(409,'Package is not eligible for freezing.');
    // Keep the paid upcoming queue after the extended current package.
    await q.query(`UPDATE dangkygoitap SET NgayBatDau=DATE_ADD(NgayBatDau,INTERVAL ? DAY),NgayKetThuc=DATE_ADD(NgayKetThuc,INTERVAL ? DAY)
      WHERE HoiVienID=? AND DangKyID<>? AND TrangThai='ACTIVE' AND NgayBatDau>CURDATE()
        AND EXISTS (SELECT 1 FROM thanhtoan t WHERE t.DangKyID=dangkygoitap.DangKyID AND t.TrangThai='SUCCESS')`, [r.Days,r.Days,r.HoiVienID,r.DangKyID]);
  }
  await q.query('UPDATE baoluugoitap SET TrangThai=?,NgayDuyet=NOW() WHERE BaoLuuID=?', [status,id]);
  return { TrangThai: status };
});
exports.completeDueFreezes = () => transaction(async q => {
  const [due] = await q.query("SELECT b.BaoLuuID,d.HoiVienID FROM baoluugoitap b JOIN dangkygoitap d ON d.DangKyID=b.DangKyID WHERE b.TrangThai='APPROVED' AND b.NgayKetThuc<CURDATE() ORDER BY d.HoiVienID,b.BaoLuuID");
  for (const item of due) {
    await q.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [item.HoiVienID]);
    const [rows] = await q.query("SELECT *,DATEDIFF(NgayKetThuc,NgayBatDau)+1 Days FROM baoluugoitap WHERE BaoLuuID=? AND TrangThai='APPROVED' AND NgayKetThuc<CURDATE() FOR UPDATE", [item.BaoLuuID]);
    if (!rows.length) continue;
    await q.query('UPDATE dangkygoitap SET NgayKetThuc=DATE_ADD(NgayKetThuc,INTERVAL ? DAY) WHERE DangKyID=?', [rows[0].Days,rows[0].DangKyID]);
    await q.query("UPDATE baoluugoitap SET TrangThai='COMPLETED' WHERE BaoLuuID=?", [item.BaoLuuID]);
  }
});
