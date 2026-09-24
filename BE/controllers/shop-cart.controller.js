const db = require('../common/db');

const positiveId = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
const fail = (status, message) => Object.assign(new Error(message), { status });

// Account identity follows the existing Mobile API contract. Resolve the member
// on the server; never accept a cart/member ID supplied by the client.
async function handle(req, res) {
  const accountId = Number(req.params.accountId);
  const productId = Number(req.body?.productId);
  const quantity = req.body?.quantity;
  const writing = req.method !== 'GET';
  if (!positiveId(req.params.accountId) || (writing &&
      (!positiveId(req.body?.productId) || !Number.isInteger(quantity) || quantity < (req.method === 'PUT' ? 0 : 1) || quantity > 99))) {
    return res.status(400).json({ message: 'Sản phẩm hoặc số lượng không hợp lệ (tối đa 99).' });
  }
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    // Serialize cart writes, including the first cart creation, for this member.
    const [members] = await connection.query(
      `SELECT h.HoiVienID FROM hoivien h JOIN taikhoan t ON t.TaiKhoanID = h.TaiKhoanID
       WHERE t.TaiKhoanID = ? AND t.TrangThai = 'ACTIVE' AND t.VaiTro = 'CUSTOMER' FOR UPDATE`, [accountId]);
    if (!members.length) throw fail(403, 'Vui lòng đăng nhập bằng tài khoản hội viên đang hoạt động.');
    const memberId = members[0].HoiVienID;
    const [carts] = await connection.query('SELECT GioHangID, TrangThai FROM giohang WHERE HoiVienID = ?', [memberId]);
    let cartId = carts[0]?.GioHangID;
    if (writing) {
      if (quantity > 0) {
        const [products] = await connection.query(
          `SELECT s.SanPhamID FROM sanpham s JOIN danhmuc d ON d.DanhMucID = s.DanhMucID
           WHERE s.SanPhamID = ? AND s.TrangThai = 'ACTIVE' AND d.TrangThai = 'ACTIVE' FOR UPDATE`, [productId]);
        if (!products.length) throw fail(409, 'Sản phẩm đã hết hàng hoặc ngừng bán.');
      }
      if (!cartId) {
        const [result] = await connection.query('INSERT INTO giohang (HoiVienID) VALUES (?)', [memberId]);
        cartId = result.insertId;
      } else if (carts[0].TrangThai !== 'ACTIVE') {
        await connection.query('DELETE FROM chitietgiohang WHERE GioHangID = ?', [cartId]);
        await connection.query("UPDATE giohang SET TrangThai = 'ACTIVE' WHERE GioHangID = ?", [cartId]);
      }
      const [items] = await connection.query('SELECT SoLuong FROM chitietgiohang WHERE GioHangID = ? AND SanPhamID = ?', [cartId, productId]);
      const next = req.method === 'POST' ? Number(items[0]?.SoLuong || 0) + quantity : quantity;
      if (next > 99) throw fail(409, 'Mỗi sản phẩm được chọn tối đa 99 đơn vị.');
      if (next === 0) {
        await connection.query('DELETE FROM chitietgiohang WHERE GioHangID = ? AND SanPhamID = ?', [cartId, productId]);
      } else {
        await connection.query(`INSERT INTO chitietgiohang (GioHangID, SanPhamID, SoLuong) VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE SoLuong = ?`, [cartId, productId, next, next]);
      }
    }
    const [items] = await connection.query(
      `SELECT s.*, c.SoLuong, d.TenDanhMuc, d.TrangThai AS DanhMucTrangThai
       FROM chitietgiohang c JOIN giohang g ON g.GioHangID = c.GioHangID
       JOIN sanpham s ON s.SanPhamID = c.SanPhamID JOIN danhmuc d ON d.DanhMucID = s.DanhMucID
       WHERE g.HoiVienID = ? AND g.TrangThai = 'ACTIVE' ORDER BY c.ChiTietGioHangID`, [memberId]);
    await connection.commit();
    return res.json(items);
  } catch (error) {
    if (connection) await connection.rollback();
    return res.status(error.status || 500).json({ message: error.status ? error.message : 'Không cập nhật được giỏ hàng. Vui lòng thử lại.' });
  } finally {
    connection?.release();
  }
}

module.exports = handle;
