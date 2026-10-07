const { test } = require('node:test');
const assert = require('node:assert/strict');

// Real routes/controllers/model with an in-memory DB double: no MySQL writes.
let role = 'ADMIN';
let membership = {
  TaiKhoanID: 5, HoiVienID: 8, DangKyID: 12, HoTen: 'Test Member', SoDienThoai: '0912345678',
  AnhDaiDien: '/uploads/members/avatar.png', TenGoi: 'Annual', NgayBatDau: '2026-01-01',
  NgayKetThuc: '2026-12-31', SoNgayConLai: 85, TrangThaiTaiKhoan: 'ACTIVE',
  TrangThaiHoiVien: 'ACTIVE', TrangThaiDangKy: 'ACTIVE', TinhTrangNgay: 'OK',
};
let payment = 'SUCCESS';
let state = { codes: [], sessions: [] };
const statements = [];
let nextQr = 1;
let pending = Promise.resolve();

function execute(sql, args = [], data = state) {
  statements.push(sql);
  if (sql.includes('SELECT TaiKhoanID, Email, VaiTro'))
    return [{ TaiKhoanID: 5, Email: 'test@example.test', VaiTro: role, TrangThai: 'ACTIVE' }];
  if (sql.includes('FROM taikhoan tk') && sql.includes('selected.DangKyID'))
    return [{ ...membership, TrangThaiThanhToan: payment }];
  if (sql.startsWith('INSERT INTO maqr')) {
    const id = nextQr++;
    data.codes.push({ MaQRID: id, MaCode: args[0], NgayHetHan: new Date(args[1] * 1000), TrangThai: 'ACTIVE' });
    return { insertId: id };
  }
  if (sql.startsWith('SELECT MaCode FROM maqr')) return data.codes.filter(row => row.MaQRID === args[0]);
  if (sql.includes('FROM maqr WHERE MaCode')) return data.codes.filter(row => row.MaCode === args[0]);
  if (sql.startsWith('SELECT HoiVienID FROM hoivien')) return [{ HoiVienID: membership.HoiVienID }];
  if (sql.includes('FROM dangkygoitap dk') && sql.includes('INNER JOIN hoivien'))
    return args[0] === membership.DangKyID && args[1] === membership.HoiVienID ? [{ ...membership }] : [];
  if (sql.includes('SELECT TrangThai FROM thanhtoan')) return payment ? [{ TrangThai: payment }] : [];
  if (sql.startsWith('SELECT CheckInID FROM checkin'))
    return data.sessions.filter(row => row.HoiVienID === args[0] && row.TrangThai === 'CHECKED_IN');
  if (sql.includes('INSERT INTO checkin')) {
    const row = { CheckInID: data.sessions.length + 1, HoiVienID: args[0], MaQRID: args[1],
      TrangThai: 'CHECKED_IN', ThoiGianCheckIn: new Date().toISOString(), ThoiGianCheckOut: null };
    data.sessions.push(row);
    return { insertId: row.CheckInID };
  }
  if (sql.startsWith('UPDATE maqr')) {
    data.codes.find(row => row.MaQRID === args[0]).TrangThai = 'INACTIVE';
    return { affectedRows: 1 };
  }
  if (sql.includes('FROM checkin WHERE CheckInID')) return data.sessions.filter(row => row.CheckInID === args[0]);
  if (sql.includes('FROM checkin ci INNER JOIN hoivien'))
    return data.sessions.map(row => ({ ...row, HoTen: membership.HoTen, SoDienThoai: membership.SoDienThoai }));
  throw new Error(`Unexpected query: ${sql}`);
}
const db = {
  query(sql, args, callback) {
    if (typeof args === 'function') { callback = args; args = []; }
    try { callback(null, execute(sql, args)); } catch (error) { callback(error); }
  },
  promise: () => ({ query: async (sql, args) => [execute(sql, args)] }),
  getConnection(callback) {
    let draft, unlock;
    const query = {
      async beginTransaction() {
        const previous = pending;
        pending = new Promise(resolve => { unlock = resolve; });
        await previous;
        draft = structuredClone(state);
      },
      query: async (sql, args) => [execute(sql, args, draft)],
      async commit() { state = draft; unlock(); },
      async rollback() { unlock(); },
    };
    callback(null, { promise: () => query, release() {} });
  },
};
const dbPath = require.resolve('../common/db');
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
process.env.AUTH_TOKEN_SECRET = 'local-checkin-auth-secret';
process.env.CHECKIN_TOKEN_SECRET = 'local-checkin-qr-secret';
const { signToken } = require('../middleware/auth');
const app = require('../app');

test('QR and short code preview, eligibility, confirmation, replay and active-session protection', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { Authorization: `Bearer ${signToken({ TaiKhoanID: 5 })}`, 'Content-Type': 'application/json' };
  async function post(path, body, authenticated = true) {
    const response = await fetch(base + path, { method: 'POST', headers: authenticated ? headers : { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  }
  const preview = code => post('/checkin/admin/preview', { code });
  const confirm = code => post('/checkin/admin/confirm', { code });
  async function issue() {
    const response = await post('/checkin/token', { TaiKhoanID: 5 });
    assert.equal(response.status, 200);
    assert.match(response.body.shortCode, /^QR-[A-Z0-9]+-[A-F0-9]{8}$/);
    assert.ok(response.body.shortCode.length < 25);
    return response.body;
  }
  try {
    const qr = await issue();
    let before = statements.length;
    const result = await preview(qr.shortCode.toLowerCase());
    assert.equal(result.status, 200);
    assert.equal(result.body.HoiVienID, 8);
    assert.equal(result.body.AnhDaiDien, membership.AnhDaiDien);
    assert.equal(result.body.TenGoi, membership.TenGoi);
    assert.equal(result.body.eligible, true);
    assert.equal(result.body.token, qr.token);
    assert.equal(result.body.expiresAt, qr.expiresAt);
    assert.ok(statements.slice(before).every(sql => /^\s*SELECT/.test(sql)));
    assert.equal(state.sessions.length, 0);
    assert.equal(state.codes[0].TrangThai, 'ACTIVE');
    assert.equal((await preview(qr.token)).body.HoTen, membership.HoTen);
    assert.equal((await post('/checkin/scan', { token: qr.token })).body.eligible, true);
    assert.equal(state.sessions.length, 0);

    for (const [field, value, code] of [
      ['TrangThaiTaiKhoan', 'INACTIVE', 'ACCOUNT_NOT_ACTIVE'],
      ['TrangThaiHoiVien', 'INACTIVE', 'MEMBER_NOT_ACTIVE'],
      ['TrangThaiDangKy', 'INACTIVE', 'MEMBERSHIP_NOT_ACTIVE'],
      ['TinhTrangNgay', 'MEMBERSHIP_NOT_STARTED', 'MEMBERSHIP_NOT_STARTED'],
      ['TinhTrangNgay', 'MEMBERSHIP_EXPIRED', 'MEMBERSHIP_EXPIRED'],
    ]) {
      const previous = membership[field];
      membership[field] = value;
      const invalid = await preview(qr.token);
      assert.equal(invalid.status, 200);
      assert.equal(invalid.body.eligible, false);
      assert.equal(invalid.body.reasons[0].code, code);
      assert.equal((await confirm(qr.shortCode)).status, 403);
      assert.equal(state.sessions.length, 0);
      assert.equal(state.codes[0].TrangThai, 'ACTIVE');
      membership[field] = previous;
    }
    payment = 'PENDING';
    assert.equal((await preview(qr.token)).body.reasons[0].code, 'PAYMENT_NOT_SUCCESS');
    assert.equal((await confirm(qr.shortCode)).status, 403);
    payment = 'SUCCESS';
    assert.equal((await preview('QR-1-00000000')).status, 400);
    assert.equal((await preview(qr.token + 'tampered')).status, 401);
    assert.equal((await preview('QR-0001-' + qr.shortCode.split('-')[2])).status, 400);
    assert.equal((await post('/checkin/admin/preview', { code: qr.token }, false)).status, 401);
    assert.equal((await post('/checkin/scan', { token: qr.token }, false)).status, 401);
    role = 'CUSTOMER';
    assert.equal((await preview(qr.shortCode)).status, 403);
    assert.equal((await confirm(qr.token)).status, 403);
    assert.equal((await post('/checkin/scan', { token: qr.token })).status, 403);
    role = 'STAFF';
    assert.equal((await preview(qr.shortCode)).status, 200);
    const second = await issue();
    const confirmations = await Promise.all([confirm(qr.shortCode), confirm(second.token)]);
    assert.deepEqual(confirmations.map(x => x.status).sort(), [201, 409]);
    assert.equal(state.sessions.length, 1);
    assert.equal(state.sessions[0].TrangThai, 'CHECKED_IN');
    assert.ok(statements.some(sql => sql === 'SELECT HoiVienID FROM hoivien WHERE HoiVienID = ? FOR UPDATE'));
    const used = confirmations[0].status === 201 ? qr : second;
    const unused = confirmations[0].status === 201 ? second : qr;
    assert.equal((await confirm(used.token)).status, 409);
    assert.equal((await confirm(used.shortCode)).status, 409);
    assert.equal((await preview(used.shortCode)).status, 409);
    assert.equal((await preview(unused.shortCode)).body.reasons[0].code, 'ALREADY_CHECKED_IN');
    const today = await fetch(base + '/checkin/admin/today', { headers }).then(response => response.json());
    assert.equal(today.metrics.present, 1);
    assert.equal(today.rows[0].HoiVienID, 8);
    state.codes.find(row => row.MaCode === unused.token).NgayHetHan = new Date(Date.now() - 1000);
    assert.equal((await preview(unused.shortCode)).status, 410);
    assert.equal((await confirm(unused.shortCode)).status, 410);
    assert.equal(state.sessions.length, 1);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
