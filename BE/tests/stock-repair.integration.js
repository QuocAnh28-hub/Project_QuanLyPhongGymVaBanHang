// Uses the repaired local catalog; all test writes roll back.
const test = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const db = require('../common/db');

test('repaired products support mixed checkout and receipt completion updates stock once', async () => {
  const connection = await db.promise().getConnection();
  const modulePath = require.resolve('../common/db');
  const original = require.cache[modulePath].exports;
  const bridge = {
    query: (...args) => connection.query(...args),
    beginTransaction: () => connection.query('SAVEPOINT stock_operation'),
    commit: () => connection.query('RELEASE SAVEPOINT stock_operation'),
    rollback: () => connection.query('ROLLBACK TO SAVEPOINT stock_operation'),
    release: () => {},
  };
  require.cache[modulePath].exports = { promise: () => ({ getConnection: async () => bridge }) };
  const checkout = require('../controllers/shop-checkout.controller');
  const receipt = require('../controllers/warehouse-receipt.controller');
  await connection.beginTransaction();
  try {
    const [before] = await connection.query('SELECT KhoID,SanPhamID,SoLuongTon FROM tonkho WHERE SanPhamID IN (60,68) ORDER BY SanPhamID');
    assert.equal(before.length, 2);
    const [account] = await connection.query('INSERT INTO taikhoan (Email,MatKhau) VALUES (?,?)', [`stock-test-${randomUUID()}@example.invalid`, randomUUID()]);
    const [member] = await connection.query('INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,?)', [account.insertId, 'Stock regression test']);
    const [cart] = await connection.query('INSERT INTO giohang (HoiVienID) VALUES (?)', [member.insertId]);
    await connection.query('INSERT INTO chitietgiohang (GioHangID,SanPhamID,SoLuong) VALUES (?,60,1),(?,68,1)', [cart.insertId, cart.insertId]);
    const call = async (controller, method, params, body = {}, auth) => {
      const res = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.body = data; return this; } };
      await controller[method]({ params, body, auth }, res);
      return res;
    };
    const params = { accountId: String(account.insertId) };
    const preview = await call(checkout, 'preview', params);
    assert.equal(preview.code, 200, JSON.stringify(preview.body));
    const order = await call(checkout, 'create', params, {
      requestKey: preview.body.requestKey, cartVersion: preview.body.cartVersion,
      name: 'Stock test', phone: '0912345678', delivery: 'PICKUP', paymentMethod: 'TIEN_MAT',
    });
    assert.equal(order.code, 200, JSON.stringify(order.body));
    const [[admin]] = await connection.query("SELECT TaiKhoanID FROM taikhoan WHERE VaiTro='ADMIN' LIMIT 1");
    const confirmed = await call(checkout, 'confirmManual', { orderId: String(order.body.DonHangID) }, {}, { TaiKhoanID: admin.TaiKhoanID, VaiTro: 'ADMIN' });
    assert.equal(confirmed.code, 200, JSON.stringify(confirmed.body));
    const [after] = await connection.query('SELECT SanPhamID,SoLuongTon FROM tonkho WHERE SanPhamID IN (60,68) ORDER BY SanPhamID');
    after.forEach((row, index) => assert.equal(row.SoLuongTon, before[index].SoLuongTon - 1));
    const [[employee]] = await connection.query("SELECT NhanVienID FROM nhanvien WHERE TrangThai='ACTIVE' LIMIT 1");
    const [header] = await connection.query("INSERT INTO phieunhap (KhoID,NhanVienID,TongTien,TrangThai) VALUES (2,?,10,'PENDING')", [employee.NhanVienID]);
    await connection.query('INSERT INTO chitietphieunhap (PhieuNhapID,SanPhamID,SoLuong,DonGia,ThanhTien) VALUES (?,68,5,2,10)', [header.insertId]);
    const receiptParams = { PhieuNhapID: String(header.insertId) };
    assert.equal((await call(receipt, 'transition', receiptParams, { TrangThai: 'COMPLETED' })).code, 200);
    assert.equal((await call(receipt, 'transition', receiptParams, { TrangThai: 'COMPLETED' })).code, 409);
    const [[stock]] = await connection.query('SELECT SoLuongTon FROM tonkho WHERE KhoID=2 AND SanPhamID=68');
    assert.equal(stock.SoLuongTon, before[1].SoLuongTon - 1 + 5);
  } finally {
    await connection.rollback();
    require.cache[modulePath].exports = original;
    connection.release();
    await db.promise().end();
  }
});
