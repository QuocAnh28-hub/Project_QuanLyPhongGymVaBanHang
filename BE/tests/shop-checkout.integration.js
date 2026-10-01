// Real MySQL test. All fixtures and writes live inside one outer transaction and
// are rolled back. Controller transactions use savepoints in this test only.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const db = require('../common/db');

test('shop checkout persists consistent orders and invoices, handles retries and rolls back failures', async t => {
  const connection = await db.promise().getConnection();
  const previousMode = process.env.SHOP_PAYMENT_MODE;
  const previousFee = process.env.SHOP_SHIPPING_FEE_VND;
  const previousKey = process.env.SHOP_PAYMENT_CONFIRM_KEY;
  const previousWarehouse = process.env.SHOP_WAREHOUSE_ID;
  const previousEnvironment = process.env.NODE_ENV;
  let injectedFailure = false;
  const bridge = {
    beginTransaction: () => connection.query('SAVEPOINT checkout_operation'),
    commit: () => connection.query('RELEASE SAVEPOINT checkout_operation'),
    rollback: () => connection.query('ROLLBACK TO SAVEPOINT checkout_operation'),
    release: () => {},
    query: (sql, args) => {
      if (injectedFailure && sql.startsWith('INSERT INTO shopcheckout')) throw new Error('injected write failure');
      return connection.query(sql, args);
    },
  };
  const modulePath = require.resolve('../common/db');
  const originalExports = require.cache[modulePath].exports;
  require.cache[modulePath].exports = { promise: () => ({ getConnection: async () => bridge }) };
  const controller = require('../controllers/shop-checkout.controller');
  await connection.beginTransaction();
  try {
    process.env.SHOP_PAYMENT_MODE = 'manual';
    process.env.SHOP_SHIPPING_FEE_VND = '15000';
    process.env.NODE_ENV = 'test';
    const [account] = await connection.query("INSERT INTO taikhoan (Email, MatKhau) VALUES (?, ?)", [`checkout-${randomUUID()}@example.invalid`, randomUUID()]);
    const [member] = await connection.query('INSERT INTO hoivien (TaiKhoanID, HoTen, SoDienThoai) VALUES (?, ?, ?)', [account.insertId, 'Checkout Test', '0912345678']);
    const [category] = await connection.query('INSERT INTO danhmuc (TenDanhMuc) VALUES (?)', ['Checkout Test']);
    const [product] = await connection.query('INSERT INTO sanpham (DanhMucID, TenSanPham, GiaBan) VALUES (?, ?, ?)', [category.insertId, 'Checkout Test Product', '125000.50']);
    const [warehouse] = await connection.query('INSERT INTO kho (TenKho) VALUES (?)', ['Checkout Test Warehouse']);
    process.env.SHOP_WAREHOUSE_ID = String(warehouse.insertId);
    await connection.query('INSERT INTO TonKho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,100)', [warehouse.insertId, product.insertId]);
    const [cart] = await connection.query('INSERT INTO giohang (HoiVienID) VALUES (?)', [member.insertId]);
    const resetCart = async () => {
      await connection.query("UPDATE giohang SET TrangThai = 'ACTIVE' WHERE GioHangID = ?", [cart.insertId]);
      await connection.query('INSERT INTO chitietgiohang (GioHangID, SanPhamID, SoLuong) VALUES (?, ?, 2) ON DUPLICATE KEY UPDATE SoLuong = 2', [cart.insertId, product.insertId]);
    };
    const call = async (method, body = {}, params = {}, headers = {}) => {
      const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.body = data; return this; } };
      await controller[method]({ params: { accountId: String(account.insertId), ...params }, body, headers }, res);
      return res;
    };
    const payload = preview => ({ requestKey: preview.requestKey, cartVersion: preview.cartVersion,
      name: 'Checkout Test', phone: '0912345678', delivery: 'DELIVERY', address: '123 Test Street', note: 'Test only', paymentMethod: 'CHUYEN_KHOAN' });
    await resetCart();
    const preview = await call('preview');
    assert.equal(preview.statusCode, 200);
    assert.equal(preview.body.subtotal, '250001.00');
    assert.equal(preview.body.shipping, '15000.00');
    const request = payload(preview.body);
    let order;

    await t.test('invalid input and changed price cannot create orders', async () => {
      const invalid = await call('create', { ...request, phone: 'abc' });
      assert.equal(invalid.statusCode, 400);
      await connection.query('UPDATE sanpham SET GiaBan = 1 WHERE SanPhamID = ?', [product.insertId]);
      assert.equal((await call('create', request)).statusCode, 409);
      await connection.query('UPDATE sanpham SET GiaBan = 125000.50 WHERE SanPhamID = ?', [product.insertId]);
      const [rows] = await connection.query('SELECT * FROM donhang WHERE HoiVienID = ?', [member.insertId]);
      assert.equal(rows.length, 0);
    });
    await t.test('out-of-stock products cannot be purchased', async () => {
      await connection.query("UPDATE sanpham SET TrangThai = 'OUT_OF_STOCK' WHERE SanPhamID = ?", [product.insertId]);
      assert.equal((await call('create', request)).statusCode, 409);
      await connection.query("UPDATE sanpham SET TrangThai = 'ACTIVE' WHERE SanPhamID = ?", [product.insertId]);
    });
    await t.test('atomic creation uses DB prices and saves recipient, detail, payment and link', async () => {
      const result = await call('create', { ...request, TongTien: 1, TrangThai: 'SUCCESS' });
      assert.equal(result.statusCode, 200, JSON.stringify(result.body));
      order = result.body;
      assert.equal(order.TongTien, '265001.00');
      assert.equal(order.TrangThaiThanhToan, 'PENDING');
      assert.equal(order.HoaDonID, null);
      assert.equal(order.items.length, 1);
      assert.equal(order.items[0].DonGia, '125000.50');
      assert.equal(order.items[0].ThanhTien, '250001.00');
      assert.equal(order.TenNguoiNhan, request.name);
      const [links] = await connection.query('SELECT KhoID FROM shopcheckout WHERE DonHangID=?', [order.DonHangID]);
      assert.equal(links[0].KhoID, warehouse.insertId);
      const [pendingStock] = await connection.query('SELECT SoLuongTon FROM TonKho WHERE KhoID=? AND SanPhamID=?', [warehouse.insertId, product.insertId]);
      assert.equal(pendingStock[0].SoLuongTon, 100);
      const [items] = await connection.query('SELECT * FROM chitietgiohang WHERE GioHangID = ?', [cart.insertId]);
      assert.equal(items.length, 0);
    });
    await t.test('retry returns the original order; reused key with changed data is rejected', async () => {
      const result = await call('create', request);
      assert.equal(result.body.DonHangID, order.DonHangID);
      assert.equal((await call('create', { ...request, note: 'changed' })).statusCode, 409);
      const recovered = await call('byRequest', {}, { requestKey: request.requestKey });
      assert.equal(recovered.body.DonHangID, order.DonHangID);
      const [rows] = await connection.query('SELECT * FROM donhang WHERE HoiVienID = ?', [member.insertId]);
      assert.equal(rows.length, 1);
    });
    await t.test('manual confirmation requires server key; demo is disabled by default', async () => {
      assert.equal((await call('confirmManual', {}, { orderId: order.DonHangID })).statusCode, 403);
      assert.equal((await call('confirmDemo', {}, { orderId: order.DonHangID })).statusCode, 403);
      process.env.SHOP_PAYMENT_CONFIRM_KEY = 'test-server-secret';
      assert.equal((await call('confirmManual', {}, { orderId: order.DonHangID }, { authorization: 'Bearer wrong' })).statusCode, 403);
    });
    await t.test('successful payment creates one invoice and does not delete new cart contents', async () => {
      await resetCart();
      const params = { orderId: order.DonHangID };
      const headers = { authorization: 'Bearer test-server-secret' };
      const result = await call('confirmManual', {}, params, headers);
      assert.equal(result.statusCode, 200, JSON.stringify(result.body));
      assert.equal(result.body.TrangThaiThanhToan, 'SUCCESS');
      assert.equal(result.body.TrangThai, 'CONFIRMED');
      assert.ok(result.body.HoaDonID);
      const again = await call('confirmManual', {}, params, headers);
      assert.equal(again.body.HoaDonID, result.body.HoaDonID);
      const [stock] = await connection.query('SELECT SoLuongTon FROM TonKho WHERE KhoID=? AND SanPhamID=?', [warehouse.insertId, product.insertId]);
      assert.equal(stock[0].SoLuongTon, 98);
      const [invoices] = await connection.query('SELECT * FROM hoadon WHERE ThanhToanID = ?', [order.ThanhToanID]);
      assert.equal(invoices.length, 1);
      assert.equal(invoices[0].TongTien, '265001.00');
      const [items] = await connection.query('SELECT * FROM chitietgiohang WHERE GioHangID = ?', [cart.insertId]);
      assert.equal(items[0].SoLuong, 2);
    });
    await t.test('late database failure rolls back all partial order writes and keeps the cart', async () => {
      const quote = await call('preview');
      injectedFailure = true;
      const result = await call('create', payload(quote.body));
      injectedFailure = false;
      assert.equal(result.statusCode, 500);
      const [orders] = await connection.query('SELECT * FROM donhang WHERE HoiVienID = ?', [member.insertId]);
      const [payments] = await connection.query('SELECT * FROM thanhtoan WHERE HoiVienID = ?', [member.insertId]);
      const [items] = await connection.query('SELECT * FROM chitietgiohang WHERE GioHangID = ?', [cart.insertId]);
      assert.equal(orders.length, 1); assert.equal(payments.length, 1); assert.equal(items.length, 1);
    });
    await t.test('pickup excludes shipping; demo can finish payment only outside production', async () => {
      const quote = await call('preview');
      const created = await call('create', { ...payload(quote.body), delivery: 'PICKUP', paymentMethod: 'TIEN_MAT' });
      assert.equal(created.body.TongTien, '250001.00');
      assert.equal(created.body.DiaChiGiaoHang, null);
      process.env.SHOP_PAYMENT_MODE = 'demo';
      process.env.NODE_ENV = 'production';
      assert.equal((await call('confirmDemo', {}, { orderId: created.body.DonHangID })).statusCode, 403);
      process.env.NODE_ENV = 'test';
      const result = await call('confirmDemo', {}, { orderId: created.body.DonHangID });
      assert.equal(result.body.TrangThaiThanhToan, 'SUCCESS');
      assert.ok(result.body.HoaDonID);
    });
    await t.test('insufficient stock rolls back payment, order and invoice', async () => {
      await resetCart();
      await connection.query('UPDATE chitietgiohang SET SoLuong=2 WHERE GioHangID=? AND SanPhamID=?', [cart.insertId, product.insertId]);
      const quote = await call('preview');
      const created = await call('create', payload(quote.body));
      await connection.query('UPDATE TonKho SET SoLuongTon=1 WHERE KhoID=? AND SanPhamID=?', [warehouse.insertId, product.insertId]);
      const result = await call('confirmManual', {}, { orderId: created.body.DonHangID }, { authorization: 'Bearer test-server-secret' });
      assert.equal(result.statusCode, 409);
      assert.equal(result.body.code, 'INSUFFICIENT_STOCK');
      const [orders] = await connection.query('SELECT TrangThai FROM donhang WHERE DonHangID=?', [created.body.DonHangID]);
      const [payments] = await connection.query('SELECT TrangThai FROM thanhtoan WHERE ThanhToanID=?', [created.body.ThanhToanID]);
      const [invoices] = await connection.query('SELECT HoaDonID FROM hoadon WHERE ThanhToanID=?', [created.body.ThanhToanID]);
      assert.equal(orders[0].TrangThai, 'PENDING');
      assert.equal(payments[0].TrangThai, 'PENDING');
      assert.equal(invoices.length, 0);
    });
    await t.test('empty cart and unknown customer are rejected; history comes from DB', async () => {
      assert.equal((await call('preview')).statusCode, 409);
      assert.equal((await call('get', {}, { accountId: '2147483647', orderId: order.DonHangID })).statusCode, 403);
      assert.equal((await call('list')).body.length, 3);
    });
  } finally {
    await connection.rollback();
    connection.release();
    require.cache[modulePath].exports = originalExports;
    for (const [name, value] of Object.entries({ SHOP_PAYMENT_MODE: previousMode, SHOP_SHIPPING_FEE_VND: previousFee, SHOP_PAYMENT_CONFIRM_KEY: previousKey, SHOP_WAREHOUSE_ID: previousWarehouse, NODE_ENV: previousEnvironment })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    await db.promise().end();
  }
});
