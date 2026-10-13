const { test } = require('node:test');
const assert = require('node:assert/strict');
const dbPath = require.resolve('../common/db');
let role = 'ADMIN';
let rows = [];
let nextId = 1;
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  query(sql, params, callback) {
    if (typeof params === 'function') { callback = params; params = []; }
    if (sql.includes('FROM taikhoan')) return callback(null, [{ TaiKhoanID: 5, VaiTro: role, TrangThai: 'ACTIVE' }]);
    if (sql.startsWith('SELECT * FROM maytap')) return callback(null, rows.filter(row => !sql.includes("WHERE TrangThai='ACTIVE'") || row.TrangThai === 'ACTIVE'));
    if (sql.startsWith('INSERT INTO maytap')) {
      if (rows.some(row => row.MaMay === params.MaMay)) return callback({ code: 'ER_DUP_ENTRY' });
      const id = nextId++; rows.push({ ...params, MayTapID: id }); return callback(null, { insertId: id });
    }
    if (sql.startsWith('UPDATE maytap')) {
      const row = rows.find(row => row.MayTapID === params[1]);
      if (row) Object.assign(row, params[0]);
      return callback(null, { affectedRows: row ? 1 : 0 });
    }
    if (sql.startsWith('DELETE FROM maytap')) {
      const before = rows.length; rows = rows.filter(row => row.MayTapID !== params[0]);
      return callback(null, { affectedRows: before - rows.length });
    }
    callback(new Error('Unexpected query'));
  },
} };
process.env.AUTH_TOKEN_SECRET = 'gym-equipment-test-secret';
const { signToken } = require('../middleware/auth');
const app = require('../app');
test('equipment CRUD, validation, public visibility and role boundaries', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/maytap`;
  const token = signToken({ TaiKhoanID: 5 });
  const call = (path, method = 'GET', body, authorized = true) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(authorized ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const row = { MaMay: 'test-bike', TenMay: 'Xe đạp', NhomMay: 'CARDIO', NhomCo: 'Chân', MoTa: 'Giới thiệu máy', SoLuong: 2, ViTri: 'Tầng 1', HinhAnh: null, TrangThai: 'ACTIVE' };
  try {
    assert.equal((await call('', 'GET', undefined, false)).status, 401);
    for (const invalid of [{ SoLuong: -1 }, { SoLuong: 1.5 }, { TenMay: '' }, { NhomMay: 'UNKNOWN' }, { TrangThai: 'UNKNOWN' }, { HinhAnh: 'javascript:alert(1)' }]) {
      assert.equal((await call('', 'POST', { ...row, ...invalid })).status, 400);
    }
    const created = await call('', 'POST', row);
    assert.equal(created.status, 201);
    const { MayTapID: id } = await created.json();
    assert.equal((await call('', 'POST', row)).status, 409);
    assert.equal((await (await call('/active', 'GET', undefined, false)).json()).length, 1);
    assert.equal((await call(`/${id}`, 'PUT', { ...row, TrangThai: 'MAINTENANCE' })).status, 200);
    assert.equal((await (await call('/active', 'GET', undefined, false)).json()).length, 0);
    assert.equal((await (await call('')).json()).length, 1);
    for (const forbiddenRole of ['CUSTOMER', 'STAFF']) {
      role = forbiddenRole;
      assert.equal((await call('', 'POST', row)).status, 403);
      assert.equal((await call(`/${id}`, 'PUT', row)).status, 403);
      assert.equal((await call(`/${id}`, 'DELETE')).status, 403);
      assert.equal((await call('/upload-image', 'POST', {})).status, 403);
      assert.equal((await call('/active', 'GET', undefined, false)).status, 200);
    }
    role = 'ADMIN';
    assert.equal((await call(`/${id}`, 'DELETE')).status, 200);
    assert.equal((await call(`/${id}`, 'DELETE')).status, 404);
    assert.equal((await call('/invalid', 'PUT', row)).status, 400);
    assert.equal((await (await call('')).json()).length, 0);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
