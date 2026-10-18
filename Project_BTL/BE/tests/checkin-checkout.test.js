const { test } = require('node:test');
const assert = require('node:assert/strict');

// Real HTTP routes/controller/model; a DB double keeps all tests away from MySQL.
let role = 'ADMIN';
const session = { CheckInID: 7, HoiVienID: 8, HoTen: 'Test Member', SoDienThoai: '0912345678',
  AnhDaiDien: '/uploads/members/avatar.png', ThoiGianDaTap: 3600,
  ThoiGianCheckIn: '2026-10-07 10:00:00', ThoiGianCheckOut: null, TrangThai: 'CHECKED_IN' };
const dbPath = require.resolve('../common/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  query(sql, args, callback) {
    if (typeof args === 'function') { callback = args; args = []; }
    if (sql.includes('SELECT TaiKhoanID, Email, VaiTro'))
      return callback(null, [{ TaiKhoanID: 5, Email: 'admin@example.test', VaiTro: role, TrangThai: 'ACTIVE' }]);
    if (sql.startsWith('UPDATE checkin')) {
      assert.match(sql, /ThoiGianCheckOut = NOW\(\)/);
      assert.match(sql, /WHERE CheckInID = \? AND TrangThai = 'CHECKED_IN' AND ThoiGianCheckOut IS NULL/);
      const allowed = args[0] === session.CheckInID && session.TrangThai === 'CHECKED_IN' && session.ThoiGianCheckOut === null;
      if (allowed) { session.ThoiGianCheckOut = '2026-10-07 11:00:00'; session.TrangThai = 'CHECKED_OUT'; }
      return callback(null, { affectedRows: allowed ? 1 : 0 });
    }
    if (sql.includes('FROM checkin WHERE CheckInID'))
      return callback(null, args[0] === session.CheckInID ? [{ ...session }] : []);
    if (sql.includes('FROM checkin ci INNER JOIN hoivien')) {
      assert.match(sql, /hv.AnhDaiDien/);
      assert.match(sql, /TIMESTAMPDIFF/);
      return callback(null, [{ ...session }]);
    }
    throw new Error(`Unexpected query (checkout must not inspect membership/payment): ${sql}`);
  },
} };
process.env.AUTH_TOKEN_SECRET = 'local-checkout-test-secret';
process.env.CHECKIN_GATE_KEY = 'gate-key-must-not-be-needed-by-admin';
const { signToken } = require('../middleware/auth');
const app = require('../app');

test('admin checkout bypasses gate key, updates metrics, rejects repeats and missing sessions', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { Authorization: `Bearer ${signToken({ TaiKhoanID: 5 })}` };
  const post = (id, authenticated = true) => fetch(`${base}/checkin/admin/${id}/checkout`, { method: 'POST', headers: authenticated ? headers : {} });
  const today = () => fetch(`${base}/checkin/admin/today`, { headers }).then(response => response.json());
  try {
    assert.equal((await post(7, false)).status, 401);
    role = 'CUSTOMER';
    assert.equal((await post(7)).status, 403);
    role = 'STAFF';
    assert.equal((await today()).metrics.present, 1);
    const response = await post(7);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.data.TrangThai, 'CHECKED_OUT');
    assert.ok(result.data.ThoiGianCheckOut);
    const time = result.data.ThoiGianCheckOut;
    const repeated = await post(7);
    assert.equal(repeated.status, 409);
    const repeatedBody = await repeated.json();
    assert.equal(repeatedBody.code, 'ALREADY_CHECKED_OUT');
    assert.equal(repeatedBody.message, 'Hội viên đã check-out');
    assert.equal(session.ThoiGianCheckOut, time);
    const missing = await post(999);
    assert.equal(missing.status, 404);
    assert.equal((await missing.json()).code, 'CHECKIN_NOT_FOUND');
    assert.equal((await post('invalid')).status, 400);
    const updated = await today();
    assert.equal(updated.metrics.present, 0);
    assert.equal(updated.metrics.checkedOut, 1);
    assert.equal(updated.rows[0].AnhDaiDien, session.AnhDaiDien);
    // An inconsistent old row with an existing exit time must also never be rewritten.
    session.TrangThai = 'CHECKED_IN';
    assert.equal((await post(7)).status, 409);
    assert.equal(session.ThoiGianCheckOut, time);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
