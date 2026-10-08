const { createHash, randomUUID } = require('node:crypto');
const db = require('../common/db');
const { transferInfo } = require('../common/shop-payment-qr');

const error = (status, message) => Object.assign(new Error(message), { status });
const id = value => /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const demoEnabled = () => false;
const money = value => {
  const cents = Math.round(Number(value) * 100);
  if (!Number.isSafeInteger(cents) || cents < 0) throw error(409, 'Giá sản phẩm không hợp lệ.');
  return cents;
};
const decimal = cents => (cents / 100).toFixed(2);

async function stockWarehouse(connection, items, preferredId) {
  const [warehouses] = await connection.query("SELECT KhoID FROM kho WHERE TrangThai='ACTIVE' ORDER BY KhoID FOR UPDATE");
  const candidates = [...warehouses.filter(k => k.KhoID===preferredId), ...warehouses.filter(k => k.KhoID!==preferredId)];
  for (const warehouse of candidates) {
    const [stock] = await connection.query('SELECT SanPhamID,SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID IN (?) ORDER BY SanPhamID FOR UPDATE',[warehouse.KhoID,items.map(item=>item.SanPhamID)]);
    if (items.every(item => Number(stock.find(s=>s.SanPhamID===item.SanPhamID)?.SoLuongTon || 0)>=item.SoLuong)) return warehouse.KhoID;
  }
  throw error(409,'Chưa có kho hoạt động nào đủ toàn bộ sản phẩm trong đơn. Vui lòng kiểm tra tồn thực tế hoặc điều chuyển hàng về cùng kho.');
}

async function transaction(res, operation) {
  let connection;
  try {
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return res.json(result);
  } catch (e) {
    if (!e.status) console.error('[shop-checkout]', e.code || e.name);
    if (connection) { try { await connection.rollback(); } catch (_) {} }
    const migrationMissing = e.code === 'ER_NO_SUCH_TABLE';
    return res.status(e.status || 500).json({ message: e.status ? e.message : migrationMissing
      ? 'Chưa cài đặt bảng thanh toán cửa hàng. Hãy chạy migration 003_shop_checkout.sql.'
      : 'Không xử lý được đơn hàng. Vui lòng thử lại; yêu cầu trùng sẽ không tạo thêm đơn.' });
  } finally { connection?.release(); }
}

async function member(connection, accountId) {
  if (!id(accountId)) throw error(400, 'Tài khoản không hợp lệ.');
  // Same account contract as the existing Mobile/cart APIs. The member lock also
  // serializes checkout with cart edits and repeated checkout submissions.
  const [rows] = await connection.query(
    `SELECT h.HoiVienID, h.HoTen, h.SoDienThoai, h.DiaChi FROM hoivien h
     JOIN taikhoan t ON t.TaiKhoanID = h.TaiKhoanID
    WHERE t.TaiKhoanID = ? AND t.TrangThai = 'ACTIVE' AND t.VaiTro = 'CUSTOMER' AND h.TrangThai='ACTIVE' FOR UPDATE`, [Number(accountId)]);
  if (!rows.length) throw error(403, 'Không tìm thấy tài khoản hội viên đang hoạt động.');
  return rows[0];
}

async function cart(connection, memberId) {
  const [items] = await connection.query(
    `SELECT c.SanPhamID, c.SoLuong, s.TenSanPham, s.GiaBan, s.DonViTinh, s.HinhAnh,
            s.TrangThai, d.TrangThai AS DanhMucTrangThai, g.GioHangID
     FROM giohang g JOIN chitietgiohang c ON c.GioHangID = g.GioHangID
     JOIN sanpham s ON s.SanPhamID = c.SanPhamID JOIN danhmuc d ON d.DanhMucID = s.DanhMucID
     WHERE g.HoiVienID = ? AND g.TrangThai = 'ACTIVE' ORDER BY c.SanPhamID FOR UPDATE`, [memberId]);
  if (!items.length) throw error(409, 'Giỏ hàng trống. Vui lòng chọn sản phẩm trước khi thanh toán.');
  let subtotal = 0;
  for (const item of items) {
    if (item.TrangThai !== 'ACTIVE' || item.DanhMucTrangThai !== 'ACTIVE') throw error(409, `${item.TenSanPham} đã hết hàng hoặc ngừng bán.`);
    if (!Number.isInteger(item.SoLuong) || item.SoLuong < 1 || item.SoLuong > 99) throw error(409, 'Số lượng sản phẩm trong giỏ không hợp lệ.');
    subtotal += money(item.GiaBan) * item.SoLuong;
  }
  const shipping = money(process.env.SHOP_SHIPPING_FEE_VND || 0);
  if (!Number.isSafeInteger(subtotal + shipping) || subtotal + shipping > 999999999999999) throw error(409, 'Tổng tiền vượt giới hạn cho phép.');
  const version = hash({ items: items.map(p => [p.SanPhamID, p.SoLuong, String(p.GiaBan)]), shipping });
  return { items, subtotal, shipping, version };
}

const orderSql = `SELECT o.*, x.TenNguoiNhan, x.SoDienThoai, x.CachNhan, x.PhiVanChuyen,
  t.ThanhToanID, t.PhuongThucThanhToan, t.TrangThai AS TrangThaiThanhToan, h.HoaDonID
  FROM donhang o JOIN shopcheckout x ON x.DonHangID = o.DonHangID
  JOIN thanhtoan t ON t.ThanhToanID = x.ThanhToanID
  LEFT JOIN hoadon h ON h.ThanhToanID = t.ThanhToanID`;

async function detail(connection, memberId, orderId) {
  const [rows] = await connection.query(`${orderSql} WHERE o.DonHangID = ? AND o.HoiVienID = ?`, [orderId, memberId]);
  if (!rows.length) throw error(404, 'Không tìm thấy đơn hàng.');
  const [items] = await connection.query(
    `SELECT c.SanPhamID, c.SoLuong, c.DonGia, c.ThanhTien, s.TenSanPham, s.DonViTinh, s.HinhAnh
     FROM chitietdonhang c JOIN sanpham s ON s.SanPhamID = c.SanPhamID WHERE c.DonHangID = ?`, [orderId]);
  return { ...rows[0], items, demoEnabled: false, transfer: rows[0].PhuongThucThanhToan === 'CHUYEN_KHOAN' ? transferInfo(rows[0]) : null };
}

exports.preview = (req, res) => transaction(res, async connection => {
  const customer = await member(connection, req.params.accountId);
  const data = await cart(connection, customer.HoiVienID);
  return { customer, items: data.items, subtotal: decimal(data.subtotal), shipping: decimal(data.shipping),
    cartVersion: data.version, requestKey: randomUUID(), demoEnabled: demoEnabled() };
});

function input(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw error(400, 'Dữ liệu đặt hàng không hợp lệ.');
  const text = key => typeof body[key] === 'string' ? body[key].trim() : '';
  const data = { requestKey: text('requestKey'), cartVersion: text('cartVersion'),
    name: text('name'), phone: text('phone').replace(/\s/g, '').replace(/^\+84/, '0'),
    delivery: text('delivery'), address: text('address'), note: text('note'), paymentMethod: text('paymentMethod') };
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(data.requestKey) || !/^[a-f0-9]{64}$/.test(data.cartVersion)) throw error(400, 'Yêu cầu thanh toán không hợp lệ. Vui lòng tải lại giỏ hàng.');
  if (data.name.length < 2 || data.name.length > 100 || !/^0\d{9}$/.test(data.phone)) throw error(400, 'Nhập tên người nhận (2–100 ký tự) và số điện thoại 10 số.');
  if (!['PICKUP', 'DELIVERY'].includes(data.delivery)) throw error(400, 'Cách nhận hàng không hợp lệ.');
  if (data.delivery === 'DELIVERY' && (data.address.length < 10 || data.address.length > 255)) throw error(400, 'Địa chỉ giao hàng cần từ 10 đến 255 ký tự.');
  if (data.delivery === 'PICKUP') data.address = '';
  if (data.note.length > 500) throw error(400, 'Ghi chú không được quá 500 ký tự.');
  if (!['TIEN_MAT', 'CHUYEN_KHOAN'].includes(data.paymentMethod)) throw error(400, 'Phương thức thanh toán chưa được hỗ trợ.');
  return data;
}

exports.create = (req, res) => transaction(res, async connection => {
  const data = input(req.body);
  const customer = await member(connection, req.params.accountId);
  const requestHash = hash(data);
  const [previous] = await connection.query('SELECT DonHangID, RequestHash FROM shopcheckout WHERE HoiVienID = ? AND RequestKey = ?', [customer.HoiVienID, data.requestKey]);
  if (previous.length) {
    if (previous[0].RequestHash !== requestHash) throw error(409, 'Yêu cầu này đã được dùng cho đơn hàng khác.');
    return detail(connection, customer.HoiVienID, previous[0].DonHangID);
  }
  const current = await cart(connection, customer.HoiVienID);
  if (current.version !== data.cartVersion) throw error(409, 'Giỏ hàng hoặc giá đã thay đổi. Vui lòng tải lại và kiểm tra trước khi đặt hàng.');
  const shipping = data.delivery === 'DELIVERY' ? current.shipping : 0;
  const total = decimal(current.subtotal + shipping);
  const warehouseId = await stockWarehouse(connection,current.items,Number(process.env.SHOP_WAREHOUSE_ID || 1));
  const [order] = await connection.query(
    `INSERT INTO donhang (HoiVienID, TongTien, TrangThai, DiaChiGiaoHang, GhiChu)
     VALUES (?, ?, 'PENDING', ?, ?)`, [customer.HoiVienID, total, data.address || null, data.note || null]);
  for (const item of current.items) {
    await connection.query(
      'INSERT INTO chitietdonhang (DonHangID, SanPhamID, SoLuong, DonGia, ThanhTien) VALUES (?, ?, ?, ?, ?)',
      [order.insertId, item.SanPhamID, item.SoLuong, decimal(money(item.GiaBan)), decimal(money(item.GiaBan) * item.SoLuong)]);
  }
  const [payment] = await connection.query(
    `INSERT INTO thanhtoan (HoiVienID, SoTien, PhuongThucThanhToan, NoiDung, TrangThai)
     VALUES (?, ?, ?, ?, 'PENDING')`, [customer.HoiVienID, total, data.paymentMethod, `Thanh toán đơn hàng #${order.insertId}`]);
  await connection.query(
    `INSERT INTO shopcheckout (DonHangID, ThanhToanID, HoiVienID, KhoID, RequestKey, RequestHash, TenNguoiNhan, SoDienThoai, CachNhan, PhiVanChuyen)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [order.insertId, payment.insertId, customer.HoiVienID, warehouseId, data.requestKey, requestHash, data.name, data.phone, data.delivery, decimal(shipping)]);
  // The cart becomes a pending order atomically. Later additions form a new cart
  // and are never deleted by a delayed payment confirmation.
  await connection.query('DELETE FROM chitietgiohang WHERE GioHangID = ?', [current.items[0].GioHangID]);
  await connection.query("UPDATE giohang SET TrangThai = 'COMPLETED' WHERE GioHangID = ?", [current.items[0].GioHangID]);
  return detail(connection, customer.HoiVienID, order.insertId);
});

exports.get = (req, res) => transaction(res, async connection => {
  const customer = await member(connection, req.params.accountId);
  if (!id(req.params.orderId)) throw error(400, 'Mã đơn hàng không hợp lệ.');
  return detail(connection, customer.HoiVienID, Number(req.params.orderId));
});

exports.byRequest = (req, res) => transaction(res, async connection => {
  const customer = await member(connection, req.params.accountId);
  const [rows] = await connection.query('SELECT DonHangID FROM shopcheckout WHERE HoiVienID = ? AND RequestKey = ?', [customer.HoiVienID, req.params.requestKey]);
  return rows.length ? detail(connection, customer.HoiVienID, rows[0].DonHangID) : null;
});

exports.list = (req, res) => transaction(res, async connection => {
  const customer = await member(connection, req.params.accountId);
  const [orders] = await connection.query(`${orderSql} WHERE o.HoiVienID = ? ORDER BY o.DonHangID DESC`, [customer.HoiVienID]);
  const [items] = await connection.query(`SELECT c.DonHangID,c.SanPhamID,c.SoLuong,c.DonGia,c.ThanhTien,s.TenSanPham,s.DonViTinh,s.HinhAnh
    FROM chitietdonhang c JOIN donhang o USING(DonHangID) JOIN shopcheckout x USING(DonHangID)
    JOIN sanpham s ON s.SanPhamID=c.SanPhamID WHERE o.HoiVienID=? ORDER BY c.ChiTietDonHangID`,[customer.HoiVienID]);
  return orders.map(order=>({...order,items:items.filter(item=>item.DonHangID===order.DonHangID)}));
});

async function confirm(connection, orderId, accountId) {
  if (!id(orderId)) throw error(400, 'Mã đơn hàng không hợp lệ.');
  const [rows] = await connection.query(
    `SELECT o.DonHangID, o.HoiVienID, o.TrangThai, o.TongTien, x.KhoID, t.ThanhToanID, t.TrangThai AS PaymentStatus, t.SoTien
     FROM donhang o JOIN shopcheckout x ON x.DonHangID = o.DonHangID
     JOIN thanhtoan t ON t.ThanhToanID = x.ThanhToanID WHERE o.DonHangID = ? FOR UPDATE`, [Number(orderId)]);
  const order = rows[0];
  if (!order) throw error(404, 'Không tìm thấy đơn hàng.');
  if (order.PaymentStatus !== 'SUCCESS') {
    if (order.PaymentStatus !== 'PENDING' || order.TrangThai !== 'PENDING') throw error(409, 'Đơn hàng không còn chờ thanh toán.');
    if (money(order.SoTien)!==money(order.TongTien)) throw error(409,'Số tiền thanh toán không khớp đơn hàng.');
    const [items] = await connection.query('SELECT SanPhamID,SoLuong FROM chitietdonhang WHERE DonHangID=? ORDER BY SanPhamID FOR UPDATE',[order.DonHangID]);
    if (!items.length) throw error(409,'Đơn hàng không có sản phẩm.');
    const warehouseId = await stockWarehouse(connection,items,order.KhoID);
    if (warehouseId !== order.KhoID) await connection.query('UPDATE shopcheckout SET KhoID=? WHERE DonHangID=?',[warehouseId,order.DonHangID]);
    for (const item of items) {
      const [stock] = await connection.query('UPDATE tonkho SET SoLuongTon=SoLuongTon-? WHERE KhoID=? AND SanPhamID=? AND SoLuongTon>=?',[item.SoLuong,warehouseId,item.SanPhamID,item.SoLuong]);
      if (stock.affectedRows!==1) throw error(409,'Không đủ tồn kho để xác nhận đơn hàng. Vui lòng kiểm tra kho trước khi thu tiền.');
    }
    const [employees] = await connection.query("SELECT NhanVienID FROM nhanvien WHERE TaiKhoanID=? AND TrangThai='ACTIVE'",[accountId]);
    const employee = employees[0]?.NhanVienID || null;
    await connection.query("UPDATE thanhtoan SET TrangThai = 'SUCCESS', NhanVienID=?, NgayThanhToan = NOW() WHERE ThanhToanID = ?", [employee,order.ThanhToanID]);
    await connection.query("UPDATE donhang SET TrangThai = 'CONFIRMED' WHERE DonHangID = ?", [order.DonHangID]);
    await connection.query("INSERT INTO hoadon (ThanhToanID, NhanVienID, TongTien, TrangThai) VALUES (?, ?, ?, 'ACTIVE')", [order.ThanhToanID,employee, order.SoTien]);
  }
  return detail(connection, order.HoiVienID, order.DonHangID);
}

exports.confirmDemo = (req, res) => {
  return res.status(403).json({ message: 'Thanh toán sản phẩm chỉ được xác nhận bởi nhân viên/Admin sau khi nhận tiền.' });
};

exports.confirmManual = (req, res) => {
  if (!['ADMIN','STAFF'].includes(req.auth?.VaiTro)) {
    return res.status(403).json({ message: 'Không có quyền xác nhận đã thu tiền.' });
  }
  return transaction(res, connection => confirm(connection, req.params.orderId,req.auth.TaiKhoanID));
};
