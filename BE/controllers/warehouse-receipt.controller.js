const db = require('../common/db');
const positiveId = value => Number.isSafeInteger(Number(value)) && Number(value) > 0;

function validateReceipt(body = {}) {
  if (!positiveId(body.KhoID) || !positiveId(body.NhanVienID)) throw new Error('Kho và nhân viên không hợp lệ.');
  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 100) throw new Error('Phiếu nhập phải có từ 1 đến 100 dòng hàng.');
  const seen = new Set();
  let total = 0;
  const items = body.items.map(item => {
    if (!item || !positiveId(item.SanPhamID) || !positiveId(item.SoLuong) || Number(item.SoLuong) > 1000000) throw new Error('Sản phẩm hoặc số lượng không hợp lệ.');
    const price = Number(item.DonGia);
    const cents = Math.round(price * 100);
    if (item.DonGia === null || item.DonGia === '' || !Number.isFinite(price) || price < 0 || Math.abs(price * 100 - cents) > .01) throw new Error('Đơn giá không hợp lệ.');
    const id = Number(item.SanPhamID);
    if (seen.has(id)) throw new Error('Sản phẩm bị trùng trong phiếu nhập.');
    seen.add(id);
    const amount = cents * Number(item.SoLuong);
    total += amount;
    if (!Number.isSafeInteger(total) || total > 999999999999999) throw new Error('Tổng tiền vượt giới hạn.');
    return { SanPhamID: id, SoLuong: Number(item.SoLuong), DonGia: (cents / 100).toFixed(2), ThanhTien: (amount / 100).toFixed(2) };
  });
  const note = typeof body.GhiChu === 'string' ? body.GhiChu.trim() : '';
  if (note.length > 500) throw new Error('Ghi chú tối đa 500 ký tự.');
  return { KhoID: Number(body.KhoID), NhanVienID: Number(body.NhanVienID), GhiChu: note || null, TongTien: (total / 100).toFixed(2), items };
}
exports.validateReceipt = validateReceipt;
exports.create = async (req, res) => {
  let input;
  try { input = validateReceipt(req.body); } catch (e) { return res.status(400).json({ message: e.message }); }
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    const [warehouses] = await connection.query("SELECT KhoID FROM kho WHERE KhoID = ? AND TrangThai = 'ACTIVE' FOR UPDATE", [input.KhoID]);
    const [employees] = await connection.query("SELECT NhanVienID FROM nhanvien WHERE NhanVienID = ? AND TrangThai = 'ACTIVE' FOR UPDATE", [input.NhanVienID]);
    if (!warehouses.length || !employees.length) { const e = new Error('Kho hoặc nhân viên không còn hoạt động.'); e.status = 409; throw e; }
    const ids = input.items.map(item => item.SanPhamID).sort((a, b) => a - b);
    const [products] = await connection.query('SELECT SanPhamID FROM sanpham WHERE SanPhamID IN (?) ORDER BY SanPhamID FOR UPDATE', [ids]);
    if (products.length !== ids.length) { const e = new Error('Có sản phẩm không còn tồn tại.'); e.status = 409; throw e; }
    const [receipt] = await connection.query("INSERT INTO phieunhap (KhoID, NhanVienID, TongTien, GhiChu, TrangThai) VALUES (?, ?, ?, ?, 'PENDING')", [input.KhoID, input.NhanVienID, input.TongTien, input.GhiChu]);
    await connection.query('INSERT INTO chitietphieunhap (PhieuNhapID, SanPhamID, SoLuong, DonGia, ThanhTien) VALUES ?', [input.items.map(i => [receipt.insertId, i.SanPhamID, i.SoLuong, i.DonGia, i.ThanhTien])]);
    await connection.commit();
    res.status(201).json({ PhieuNhapID: receipt.insertId, TrangThai: 'PENDING', TongTien: input.TongTien });
  } catch (e) {
    if (connection) await connection.rollback().catch(() => {});
    res.status(e.status || 500).json({ message: e.status ? e.message : 'Không thể tạo phiếu nhập. Không có dòng hàng nào được lưu riêng lẻ.' });
  } finally { connection?.release(); }
};
exports.transition = async (req, res) => {
  if (!positiveId(req.params.PhieuNhapID) || !['COMPLETED', 'CANCELLED'].includes(req.body?.TrangThai)) return res.status(400).json({ message: 'Trạng thái phiếu nhập không hợp lệ.' });
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    const [receipts] = await connection.query('SELECT PhieuNhapID,KhoID,TrangThai FROM phieunhap WHERE PhieuNhapID=? FOR UPDATE', [Number(req.params.PhieuNhapID)]);
    if (!receipts.length) throw Object.assign(new Error('Không tìm thấy phiếu nhập.'), { status: 404 });
    if (receipts[0].TrangThai !== 'PENDING') throw Object.assign(new Error('Phiếu nhập không còn ở trạng thái PENDING.'), { status: 409 });
    const [warehouses] = await connection.query('SELECT KhoID FROM kho WHERE KhoID=?', [receipts[0].KhoID]);
    if (!warehouses.length) throw Object.assign(new Error('Kho của phiếu nhập không còn tồn tại.'), { status: 409 });
    const [items] = await connection.query('SELECT SanPhamID,SoLuong FROM chitietphieunhap WHERE PhieuNhapID=? ORDER BY SanPhamID FOR UPDATE', [receipts[0].PhieuNhapID]);
    if (!items.length) throw Object.assign(new Error('Phiếu nhập chưa có chi tiết hàng.'), { status: 409 });
    if (req.body.TrangThai === 'COMPLETED') {
      for (const item of items) {
        await connection.query(`INSERT INTO TonKho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,?)
          ON DUPLICATE KEY UPDATE SoLuongTon=SoLuongTon+VALUES(SoLuongTon)`, [receipts[0].KhoID, item.SanPhamID, item.SoLuong]);
      }
    }
    await connection.query('UPDATE phieunhap SET TrangThai=? WHERE PhieuNhapID=?', [req.body.TrangThai, receipts[0].PhieuNhapID]);
    await connection.commit();
    res.json({ message: 'Đã cập nhật phiếu nhập.' });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    res.status(error.status || 500).json({ message: error.status ? error.message : 'Không thể cập nhật phiếu nhập.' });
  } finally { connection?.release(); }
};
