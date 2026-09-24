const db = require('../common/db');

module.exports = async (req, res) => {
  const { name, email, phone, password } = req.body || {};
  if (![name, email, phone, password].every(value => typeof value === 'string')) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin đăng ký.' });
  }
  const HoTen = name.trim();
  const Email = email.trim().toLowerCase();
  const SoDienThoai = phone.replace(/\s/g, '').replace(/^\+84/, '0');
  if (!HoTen || HoTen.length > 100 || Email.length > 100 || !/^\S+@\S+\.\S+$/.test(Email) ||
      !/^0[35789]\d{8}$/.test(SoDienThoai) || password.length < 8 || password.length > 255 ||
      !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return res.status(400).json({ message: 'Thông tin không hợp lệ. Kiểm tra họ tên, email, số điện thoại và mật khẩu (8–255 ký tự, gồm chữ và số).' });
  }
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    const [existing] = await connection.query(
      'SELECT HoiVienID FROM hoivien WHERE REPLACE(SoDienThoai, \' \', \'\') = ? LIMIT 1 FOR UPDATE', [SoDienThoai]);
    if (existing.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'Số điện thoại đã được sử dụng.' });
    }
    // Keep the password format compatible with the existing login API.
    const [account] = await connection.query('INSERT INTO taikhoan SET ?', {
      Email, MatKhau: password, VaiTro: 'CUSTOMER', TrangThai: 'ACTIVE',
    });
    const [member] = await connection.query('INSERT INTO hoivien SET ?', {
      TaiKhoanID: account.insertId, HoTen, Email, SoDienThoai, TrangThai: 'ACTIVE',
    });
    await connection.commit();
    return res.status(201).json({
      message: 'Đăng ký thành công.',
      data: { TaiKhoanID: account.insertId, HoiVienID: member.insertId, Email, HoTen, SoDienThoai },
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    return res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      message: error.code === 'ER_DUP_ENTRY' ? 'Email đã được sử dụng.' : 'Không thể đăng ký lúc này. Vui lòng thử lại.',
    });
  } finally {
    if (connection) connection.release();
  }
};
