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
  require.cache[modulePath].exports = {
    promise: () => ({ getConnection: async () => bridge }),
    query: (sql, params, callback) => {
      if (typeof params === 'function') { callback=params; params=[]; }
      connection.query(sql,params).then(([rows])=>callback(null,rows),callback);
    },
  };
  const controller = require('../controllers/shop-checkout.controller');
  await connection.beginTransaction();
  try {
    process.env.SHOP_PAYMENT_MODE = 'manual';
    process.env.SHOP_SHIPPING_FEE_VND = '15000';
    process.env.NODE_ENV = 'test';
    const [account] = await connection.query("INSERT INTO taikhoan (Email, MatKhau) VALUES (?, ?)", [`checkout-${randomUUID()}@example.invalid`, randomUUID()]);
    const [member] = await connection.query('INSERT INTO hoivien (TaiKhoanID, HoTen, SoDienThoai) VALUES (?, ?, ?)', [account.insertId, 'Checkout Test', '0912345678']);
    const [admin] = await connection.query("INSERT INTO taikhoan (Email,MatKhau,VaiTro) VALUES (?,?,'ADMIN')",[`checkout-admin-${randomUUID()}@example.invalid`,randomUUID()]);
    const adminAuth={TaiKhoanID:admin.insertId,VaiTro:'ADMIN'};
    const [staffAccount]=await connection.query("INSERT INTO taikhoan (Email,MatKhau,VaiTro) VALUES (?,?,'STAFF')",[`checkout-staff-${randomUUID()}@example.invalid`,randomUUID()]);
    const [staff]=await connection.query('INSERT INTO nhanvien (TaiKhoanID,HoTen) VALUES (?,?)',[staffAccount.insertId,'Checkout Staff']);
    const staffAuth={TaiKhoanID:staffAccount.insertId,VaiTro:'STAFF'};
    const [warehouse] = await connection.query('INSERT INTO kho (TenKho) VALUES (?)',['Checkout fixture warehouse']);
    process.env.SHOP_WAREHOUSE_ID=String(warehouse.insertId);
    const [category] = await connection.query('INSERT INTO danhmuc (TenDanhMuc) VALUES (?)', ['Checkout Test']);
    const [product] = await connection.query('INSERT INTO sanpham (DanhMucID, TenSanPham, GiaBan) VALUES (?, ?, ?)', [category.insertId, 'Checkout Test Product', '125000.50']);
    await connection.query('UPDATE sanpham SET HinhAnh=? WHERE SanPhamID=?',['https://example.invalid/product.png',product.insertId]);
    await connection.query('INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,20)',[warehouse.insertId,product.insertId]);
    const [cart] = await connection.query('INSERT INTO giohang (HoiVienID) VALUES (?)', [member.insertId]);
    const resetCart = async () => {
      await connection.query("UPDATE giohang SET TrangThai = 'ACTIVE' WHERE GioHangID = ?", [cart.insertId]);
      await connection.query('INSERT INTO chitietgiohang (GioHangID, SanPhamID, SoLuong) VALUES (?, ?, 2) ON DUPLICATE KEY UPDATE SoLuong = 2', [cart.insertId, product.insertId]);
    };
    const call = async (method, body = {}, params = {}, headers = {}, auth) => {
      const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.body = data; return this; } };
      await controller[method]({ params: { accountId: String(account.insertId), ...params }, body, headers, auth }, res);
      return res;
    };
    const payload = preview => ({ requestKey: preview.requestKey, cartVersion: preview.cartVersion,
      name: 'Checkout Test', phone: '0912345678', delivery: 'DELIVERY', address: '123 Test Street', note: 'Test only', paymentMethod: 'CHUYEN_KHOAN' });
    await resetCart();
    const preview = await call('preview');
    assert.equal(preview.statusCode, 200);
    assert.equal(preview.body.subtotal, '250001.00');
    assert.equal(preview.body.shipping, '15000.00');
    assert.equal(preview.body.items[0].HinhAnh,'https://example.invalid/product.png');
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
      assert.equal(order.items[0].HinhAnh,'https://example.invalid/product.png');
      assert.equal(order.items[0].ThanhTien, '250001.00');
      assert.equal(order.TenNguoiNhan, request.name);
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
    await t.test('manual confirmation rejects customers and server keys; demo cannot mark payment successful', async () => {
      assert.equal((await call('confirmManual', {}, { orderId: order.DonHangID })).statusCode, 403);
      assert.equal((await call('confirmDemo', {}, { orderId: order.DonHangID })).statusCode, 403);
      process.env.SHOP_PAYMENT_CONFIRM_KEY = 'test-server-secret';
      assert.equal((await call('confirmManual', {}, { orderId: order.DonHangID }, { authorization: 'Bearer wrong' })).statusCode, 403);
      assert.equal((await call('confirmManual', {}, { orderId: order.DonHangID }, {}, {TaiKhoanID:account.insertId,VaiTro:'CUSTOMER'})).statusCode,403);
    });
    await t.test('successful payment creates one invoice and does not delete new cart contents', async () => {
      await resetCart();
      const params = { orderId: order.DonHangID };
      const headers = { authorization: 'Bearer test-server-secret' };
      const result = await call('confirmManual', {}, params, headers,adminAuth);
      assert.equal(result.statusCode, 200, JSON.stringify(result.body));
      assert.equal(result.body.TrangThaiThanhToan, 'SUCCESS');
      assert.equal(result.body.TrangThai, 'CONFIRMED');
      assert.ok(result.body.HoaDonID);
      const again = await call('confirmManual', {}, params, headers,adminAuth);
      assert.equal(again.body.HoaDonID, result.body.HoaDonID);
      const [invoices] = await connection.query('SELECT * FROM hoadon WHERE ThanhToanID = ?', [order.ThanhToanID]);
      assert.equal(invoices.length, 1);
      assert.equal(invoices[0].TongTien, '265001.00');
      const [items] = await connection.query('SELECT * FROM chitietgiohang WHERE GioHangID = ?', [cart.insertId]);
      assert.equal(items[0].SoLuong, 2);
      const [[stock]]=await connection.query('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);
      assert.equal(stock.SoLuongTon,18);
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
    await t.test('pickup excludes shipping; demo is blocked even outside production', async () => {
      const quote = await call('preview');
      const created = await call('create', { ...payload(quote.body), delivery: 'PICKUP', paymentMethod: 'TIEN_MAT' });
      assert.equal(created.body.TongTien, '250001.00');
      assert.equal(created.body.DiaChiGiaoHang, null);
      process.env.SHOP_PAYMENT_MODE = 'demo';
      process.env.NODE_ENV = 'production';
      assert.equal((await call('confirmDemo', {}, { orderId: created.body.DonHangID })).statusCode, 403);
      process.env.NODE_ENV = 'test';
      assert.equal((await call('confirmDemo', {}, { orderId: created.body.DonHangID })).statusCode,403);
      const result = await call('confirmManual', {}, { orderId: created.body.DonHangID },{},staffAuth);
      assert.equal(result.body.TrangThaiThanhToan, 'SUCCESS');
      assert.ok(result.body.HoaDonID);
      const [[payment]]=await connection.query('SELECT NhanVienID FROM thanhtoan WHERE ThanhToanID=?',[created.body.ThanhToanID]);
      assert.equal(payment.NhanVienID,staff.insertId);
    });
    await t.test('empty cart and unknown customer are rejected; history comes from DB', async () => {
      assert.equal((await call('preview')).statusCode, 409);
      assert.equal((await call('get', {}, { accountId: '2147483647', orderId: order.DonHangID })).statusCode, 403);
      const history=(await call('list')).body;
      assert.equal(history.length, 2);
      for (const saved of history) {
        assert.equal(saved.items.length,1);
        assert.equal(saved.items[0].SanPhamID,product.insertId);
        assert.equal(saved.items[0].SoLuong,2);
        assert.equal(saved.items[0].HinhAnh,'https://example.invalid/product.png');
        assert.equal(saved.items[0].ThanhTien,'250001.00');
      }
    });
    await t.test('real HTTP middleware enforces JWT, ownership and admin confirmation',async()=>{
      const app=require('../app');
      const { signToken }=require('../middleware/auth');
      const server=app.listen(0,'127.0.0.1');
      await new Promise(resolve=>server.once('listening',resolve));
      const url=`http://127.0.0.1:${server.address().port}`;
      const token=signToken({TaiKhoanID:account.insertId});
      const adminToken=signToken({TaiKhoanID:admin.insertId});
      const staffToken=signToken({TaiKhoanID:staffAccount.insertId});
      const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
      try{
       assert.equal((await fetch(`${url}/donhang/checkout/${account.insertId}`)).status,401);
       assert.equal((await fetch(`${url}/donhang/checkout/${account.insertId}`,{headers:{Authorization:'Bearer test-server-secret'}})).status,401);
       assert.equal((await fetch(`${url}/donhang/account/${admin.insertId}/orders`,{headers})).status,403);
       assert.equal((await fetch(`${url}/donhang/${order.DonHangID}/confirm-payment`,{method:'POST',headers})).status,403);
       const retry=await fetch(`${url}/donhang/checkout/${account.insertId}`,{method:'POST',headers,body:JSON.stringify(request)});
       assert.equal(retry.status,200);assert.equal((await retry.json()).DonHangID,order.DonHangID);
       assert.equal((await fetch(`${url}/donhang/${order.DonHangID}/confirm-payment`,{method:'POST',headers:{Authorization:`Bearer ${adminToken}`}})).status,200);
       assert.equal((await fetch(`${url}/donhang/${order.DonHangID}/confirm-payment`,{method:'POST',headers:{Authorization:`Bearer ${staffToken}`}})).status,200);
      }finally{await new Promise(resolve=>server.close(resolve));}
    });
    await t.test('stock conflict and cancelled order never become SUCCESS',async()=>{
      await resetCart();
      const quote=await call('preview');
      const created=await call('create',{...payload(quote.body),paymentMethod:'TIEN_MAT'});
      const [[original]]=await connection.query('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);
      await connection.query('UPDATE tonkho SET SoLuongTon=0 WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);
      assert.equal((await call('confirmManual',{}, {orderId:created.body.DonHangID},{},staffAuth)).statusCode,409);
      const unchanged=await call('get',{}, {orderId:created.body.DonHangID});
      assert.equal(unchanged.body.TrangThaiThanhToan,'PENDING');assert.equal(unchanged.body.HoaDonID,null);
      await connection.query('UPDATE tonkho SET SoLuongTon=? WHERE KhoID=? AND SanPhamID=?',[original.SoLuongTon,warehouse.insertId,product.insertId]);
      await connection.query("UPDATE donhang SET TrangThai='CANCELLED' WHERE DonHangID=?",[created.body.DonHangID]);
      assert.equal((await call('confirmManual',{}, {orderId:created.body.DonHangID},{},adminAuth)).statusCode,409);
    });
    await t.test('checkout selects another stocked warehouse and recovers old wrong warehouse links',async()=>{
      const [alternate]=await connection.query('INSERT INTO kho (TenKho) VALUES (?)',['Alternate stocked warehouse']);
      await connection.query('UPDATE tonkho SET SoLuongTon=0 WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);
      await connection.query('INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,10)',[alternate.insertId,product.insertId]);
      await resetCart();
      const quote=await call('preview');const created=await call('create',payload(quote.body));
      assert.equal(created.statusCode,200,JSON.stringify(created.body));
      const [[link]]=await connection.query('SELECT KhoID FROM shopcheckout WHERE DonHangID=?',[created.body.DonHangID]);
      assert.equal(link.KhoID,alternate.insertId);
      await connection.query('UPDATE shopcheckout SET KhoID=? WHERE DonHangID=?',[warehouse.insertId,created.body.DonHangID]);
      const confirmed=await call('confirmManual',{}, {orderId:created.body.DonHangID},{},adminAuth);
      assert.equal(confirmed.statusCode,200,JSON.stringify(confirmed.body));
      const [[stock]]=await connection.query('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[alternate.insertId,product.insertId]);assert.equal(stock.SoLuongTon,8);
      const again=await call('confirmManual',{}, {orderId:created.body.DonHangID},{},adminAuth);assert.equal(again.statusCode,200);
      const [[after]]=await connection.query('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[alternate.insertId,product.insertId]);assert.equal(after.SoLuongTon,8);
    });
    await t.test('missing bank config blocks transfer creation but leaves the cart and allows cash',async()=>{
      const oldBank=process.env.SHOP_BANK_ACCOUNT;
      delete process.env.SHOP_BANK_ACCOUNT;
      try {
        await resetCart();const quote=await call('preview');assert.equal(quote.body.bankTransferAvailable,false);
        const failed=await call('create',payload(quote.body));assert.equal(failed.statusCode,409);
        const [[cartState]]=await connection.query('SELECT COUNT(*) n FROM chitietgiohang WHERE GioHangID=?',[cart.insertId]);assert.equal(cartState.n,1);
        const cash=await call('create',{...payload(quote.body),paymentMethod:'TIEN_MAT'});assert.equal(cash.statusCode,200,JSON.stringify(cash.body));
        await connection.query("UPDATE donhang SET TrangThai='CANCELLED' WHERE DonHangID=?",[cash.body.DonHangID]);
      } finally { if(oldBank===undefined)delete process.env.SHOP_BANK_ACCOUNT;else process.env.SHOP_BANK_ACCOUNT=oldBank; }
    });
    await t.test('pending orders retain stock; cancellation releases it; existing QR blocks on external stock loss',async()=>{
      await connection.query('UPDATE tonkho SET SoLuongTon=2 WHERE SanPhamID=?',[product.insertId]);
      // Keep just the configured warehouse available for this fixture product.
      await connection.query('UPDATE tonkho SET SoLuongTon=0 WHERE SanPhamID=? AND KhoID<>?',[product.insertId,warehouse.insertId]);
      await resetCart();const quote=await call('preview');const created=await call('create',payload(quote.body));assert.equal(created.statusCode,200,JSON.stringify(created.body));
      assert(created.body.transfer);assert.equal(created.body.paymentBlockReason,null);
      await resetCart();const secondQuote=await call('preview');assert.equal((await call('create',payload(secondQuote.body))).statusCode,409);
      const [[physical]]=await connection.query('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);assert.equal(physical.SoLuongTon,2);
      await connection.query('UPDATE tonkho SET SoLuongTon=0 WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);
      const blocked=await call('get',{}, {orderId:created.body.DonHangID});assert.equal(blocked.body.transfer,null);assert(blocked.body.paymentBlockReason);
      await connection.query('UPDATE tonkho SET SoLuongTon=2 WHERE KhoID=? AND SanPhamID=?',[warehouse.insertId,product.insertId]);
      await connection.query("UPDATE donhang SET TrangThai='CANCELLED' WHERE DonHangID=?",[created.body.DonHangID]);
      const cancelled=await call('get',{}, {orderId:created.body.DonHangID});assert.equal(cancelled.body.transfer,null);
      assert.equal((await call('create',payload(secondQuote.body))).statusCode,200);
    });
  } finally {
    await connection.rollback();
    connection.release();
    require.cache[modulePath].exports = originalExports;
    for (const [name, value] of Object.entries({ SHOP_PAYMENT_MODE: previousMode, SHOP_SHIPPING_FEE_VND: previousFee, SHOP_PAYMENT_CONFIRM_KEY: previousKey, SHOP_WAREHOUSE_ID:previousWarehouse, NODE_ENV: previousEnvironment })) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    await db.promise().end();
  }
});
