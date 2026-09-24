const { test } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../common/db');
let connection;
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true,
  exports: { promise: () => ({ getConnection: async () => connection }) } };
const register = require('../controllers/register.controller');
const valid = { name: ' Test Member ', email: ' TEST@example.com ', phone: '+84 912345678', password: 'test12345' };

async function run(body, mode) {
  const calls = [];
  connection = {
    beginTransaction: async () => calls.push('begin'),
    commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'),
    release: () => calls.push('release'),
    query: async (sql, data) => {
      calls.push({ sql, data });
      if (sql.startsWith('SELECT')) return [mode === 'phone' ? [{ HoiVienID: 1 }] : []];
      if (sql.includes('taikhoan')) {
        if (mode === 'email') throw Object.assign(new Error(), { code: 'ER_DUP_ENTRY' });
        return [{ insertId: 12 }];
      }
      if (mode === 'failure') throw new Error('insert failed');
      return [{ insertId: 34 }];
    },
  };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.body = data; return this; } };
  await register({ body }, res);
  return { res, calls };
}

test('reject invalid input before writing', async () => {
  for (const body of [{}, { ...valid, password: '12345678' }, { ...valid, phone: 'abc' }]) {
    const { res, calls } = await run(body);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(calls, []);
  }
});
test('create normalized customer and linked member, without returning password', async () => {
  const { res, calls } = await run({ ...valid, VaiTro: 'ADMIN' });
  assert.equal(res.statusCode, 201);
  const inserts = calls.filter(call => call.sql?.startsWith('INSERT'));
  assert.equal(inserts[0].data.VaiTro, 'CUSTOMER');
  assert.equal(inserts[0].data.Email, 'test@example.com');
  assert.equal(inserts[1].data.TaiKhoanID, 12);
  assert.equal(inserts[1].data.SoDienThoai, '0912345678');
  assert.equal(inserts[1].data.HoTen, 'Test Member');
  assert.ok(!JSON.stringify(res.body).includes(valid.password));
  assert.deepEqual(calls.slice(-2), ['commit', 'release']);
});
test('duplicate email/phone rolls back and returns conflict', async () => {
  for (const mode of ['phone', 'email']) {
    const { res, calls } = await run(valid, mode);
    assert.equal(res.statusCode, 409);
    assert.ok(!calls.includes('commit'));
    assert.deepEqual(calls.slice(-2), ['rollback', 'release']);
  }
});
test('member failure rolls back account creation', async () => {
  const { res, calls } = await run(valid, 'failure');
  assert.equal(res.statusCode, 500);
  assert.ok(!calls.includes('commit'));
  assert.deepEqual(calls.slice(-2), ['rollback', 'release']);
});
