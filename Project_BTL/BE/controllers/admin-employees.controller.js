const db = require('../common/db');
const { hashPassword } = require('../common/password');
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const id = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;
function profile(body = {}) {
  const text = key => typeof body[key] === 'string' ? body[key].trim() : '';
  if (!text('HoTen') || text('HoTen').length > 100) throw fail('Họ tên phải từ 1 đến 100 ký tự.');
  for (const key of ['Email', 'ChucVu']) if (text(key).length > 100) throw fail(`${key} tối đa 100 ký tự.`);
  if (text('Email') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('Email'))) throw fail('Email không hợp lệ.');
  if (text('SoDienThoai') && !/^\+?[\d\s()-]{8,20}$/.test(text('SoDienThoai'))) throw fail('Điện thoại không hợp lệ.');
  if (text('GioiTinh') && !['NAM', 'NU', 'KHAC'].includes(text('GioiTinh'))) throw fail('Giới tính không hợp lệ.');
  if (!['ACTIVE', 'INACTIVE', 'BLOCKED'].includes(text('TrangThai'))) throw fail('Trạng thái nhân viên không hợp lệ.');
  for (const key of ['NgaySinh', 'NgayVaoLam']) {
    const value = text(key);
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value)) throw fail('Ngày không hợp lệ.');
  }
  return Object.fromEntries(['HoTen', 'NgaySinh', 'GioiTinh', 'SoDienThoai', 'Email', 'ChucVu', 'NgayVaoLam', 'TrangThai'].map(key => [key, text(key) || null]));
}
const publicSql = `SELECT n.*, t.Email AS EmailDangNhap, t.VaiTro, t.TrangThai AS TrangThaiTaiKhoan
 FROM nhanvien n JOIN taikhoan t ON t.TaiKhoanID = n.TaiKhoanID`;
exports.list = async (_req, res) => {
  try { const [rows] = await db.promise().query(`${publicSql} ORDER BY n.NhanVienID DESC`); res.json(rows); }
  catch { res.status(500).json({ message: 'Không thể tải danh sách nhân viên.' }); }
};
async function transaction(res, work) {
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    res.json(result);
  } catch (e) {
    if (connection) await connection.rollback().catch(() => {});
    res.status(e.status || (e.code === 'ER_DUP_ENTRY' ? 409 : 500)).json({ message: e.status ? e.message : e.code === 'ER_DUP_ENTRY' ? 'Email đăng nhập đã được sử dụng.' : 'Không thể lưu nhân viên.' });
  } finally { connection?.release(); }
}
exports.create = (req, res) => transaction(res, async connection => {
  const fields = profile(req.body);
  const email = String(req.body.EmailDangNhap || '').trim();
  const password = req.body.MatKhau;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100) throw fail('Email đăng nhập không hợp lệ.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 255) throw fail('Mật khẩu phải từ 8 đến 255 ký tự.');
  if (!['STAFF', 'ADMIN'].includes(req.body.VaiTro)) throw fail('Vai trò nhân viên không hợp lệ.');
  const [account] = await connection.query("INSERT INTO taikhoan (Email, MatKhau, VaiTro, TrangThai) VALUES (?, ?, ?, 'ACTIVE')", [email, await hashPassword(password), req.body.VaiTro]);
  const [employee] = await connection.query('INSERT INTO nhanvien SET ?', [{ ...fields, TaiKhoanID: account.insertId }]);
  return { NhanVienID: employee.insertId };
});
exports.update = (req, res) => transaction(res, async connection => {
  if (!id(req.params.id)) throw fail('Mã nhân viên không hợp lệ.');
  const fields = profile(req.body);
  const [rows] = await connection.query('SELECT TaiKhoanID FROM nhanvien WHERE NhanVienID = ? FOR UPDATE', [Number(req.params.id)]);
  if (!rows.length) throw fail('Không tìm thấy nhân viên.', 404);
  if (Number(rows[0].TaiKhoanID) === Number(req.adminAccountId) && fields.TrangThai !== 'ACTIVE') throw fail('Không thể tự ngừng hoạt động hoặc khóa hồ sơ của mình.', 409);
  await connection.query('UPDATE nhanvien SET ? WHERE NhanVienID = ?', [fields, Number(req.params.id)]);
  return { message: 'Đã cập nhật hồ sơ.' };
});
exports.access = (req, res) => transaction(res, async connection => {
  if (!id(req.params.id) || !['STAFF', 'ADMIN'].includes(req.body?.VaiTro) || !['ACTIVE', 'LOCKED'].includes(req.body?.TrangThaiTaiKhoan)) throw fail('Quyền hoặc trạng thái tài khoản không hợp lệ.');
  // Serialize administrator changes so simultaneous requests cannot remove all administrators.
  const [admins] = await connection.query("SELECT TaiKhoanID FROM taikhoan WHERE VaiTro = 'ADMIN' AND TrangThai = 'ACTIVE' ORDER BY TaiKhoanID FOR UPDATE");
  if (!admins.some(a => Number(a.TaiKhoanID) === Number(req.adminAccountId))) throw fail('Bạn không còn quyền quản trị.', 403);
  const [rows] = await connection.query('SELECT TaiKhoanID FROM nhanvien WHERE NhanVienID = ? FOR UPDATE', [Number(req.params.id)]);
  if (!rows.length) throw fail('Không tìm thấy nhân viên.', 404);
  const target = Number(rows[0].TaiKhoanID);
  if (target === Number(req.adminAccountId) && (req.body.VaiTro !== 'ADMIN' || req.body.TrangThaiTaiKhoan !== 'ACTIVE')) throw fail('Không thể tự khóa hoặc hạ quyền tài khoản đang đăng nhập.', 409);
  await connection.query('UPDATE taikhoan SET VaiTro = ?, TrangThai = ? WHERE TaiKhoanID = ?', [req.body.VaiTro, req.body.TrangThaiTaiKhoan, target]);
  return { message: 'Đã cập nhật quyền truy cập.' };
});
exports.profile = profile;
