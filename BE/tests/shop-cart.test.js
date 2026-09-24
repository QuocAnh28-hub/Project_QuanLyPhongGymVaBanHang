
const { test } = require('node:test');
const assert = require('node:assert/strict');

const dbPath = require.resolve('../common/db');
let connection;
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true,
  exports: { promise: () => ({ getConnection: async () => connection }) } };
const handle = require('../controllers/shop-cart.controller');

async function run({ method = 'POST', body = { productId: 5, quantity: 2 }, accountId = '7', member = true,
  available = true, existing = 3, cart = { GioHangID: 9, TrangThai: 'ACTIVE' }, failure = false } = {}) {
  const calls = [];
  connection = {
    beginTransaction: async () => calls.push('begin'), commit: async () => calls.push('commit'),
    rollback: async () => calls.push('rollback'), release: () => calls.push('release'),
    query: async (sql, values) => {
      calls.push({ sql, values });
      if (sql.includes('SELECT h.HoiVienID')) return [member ? [{ HoiVienID: 8 }] : []];
      if (sql.includes('SELECT GioHangID')) return [cart ? [cart] : []];
      if (sql.includes('SELECT s.SanPhamID')) return [available ? [{ SanPhamID: 5 }] : []];
      if (sql.includes('SELECT SoLuong')) return [existing ? [{ SoLuong: existing }] : []];
      if (sql.includes('INSERT INTO giohang')) return [{ insertId: 10 }];
      if (failure && sql.includes('INSERT INTO chitietgiohang')) throw new Error('db unavailable');
      if (sql.includes('SELECT s.*')) return [[{ SanPhamID: 5, SoLuong: 5, GiaBan: '10000.00' }]];
      return [{}];
    },
  };
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await handle({ method, body, params: { accountId } }, res);
  return { res, calls, writes: calls.filter(c => /^(INSERT|UPDATE|DELETE)/.test(c.sql)) };
}

test('reject invalid IDs and quantities before any database work', async () => {
  for (const options of [{ accountId: '0' }, { accountId: '7x' }, { body: {} },
    { body: { productId: 5, quantity: 0 } }, { body: { productId: 5, quantity: 1.5 } },
    { body: { productId: 5, quantity: 100 } }, { body: { productId: 5, quantity: '2' } }]) {
    const { res, calls } = await run(options);
    assert.equal(res.statusCode, 400); assert.deepEqual(calls, []);
  }
});
test('resolve active customer member and add to existing quantity', async () => {
  const { res, calls, writes } = await run();
  assert.equal(res.statusCode, 200);
  assert.deepEqual(writes[0].values, [9, 5, 5, 5]);
  const memberQuery = calls.find(c => c.sql?.includes('SELECT h.HoiVienID'));
  assert.match(memberQuery.sql, /FOR UPDATE/);
  assert.match(memberQuery.sql, /t.TrangThai = 'ACTIVE'/);
  assert.deepEqual(memberQuery.values, [7]);
  assert.deepEqual(calls.slice(-2), ['commit', 'release']);
});
test('unavailable product and missing customer cannot mutate the cart', async () => {
  for (const [options, status] of [[{ available: false }, 409], [{ member: false }, 403]]) {
    const { res, calls, writes } = await run(options);
    assert.equal(res.statusCode, status); assert.deepEqual(writes, []);
    assert.deepEqual(calls.slice(-2), ['rollback', 'release']);
  }
});
test('cumulative quantity cannot exceed limit', async () => {
  const { res, writes } = await run({ existing: 98 });
  assert.equal(res.statusCode, 409); assert.deepEqual(writes, []);
});
test('PUT replaces quantity and zero removes unavailable products', async () => {
  const updated = await run({ method: 'PUT' });
  assert.deepEqual(updated.writes[0].values, [9, 5, 2, 2]);
  const removed = await run({ method: 'PUT', body: { productId: 5, quantity: 0 }, available: false });
  assert.equal(removed.res.statusCode, 200);
  assert.match(removed.writes[0].sql, /^DELETE FROM chitietgiohang/);
  assert.deepEqual(removed.writes[0].values, [9, 5]);
});
test('create member cart on first addition; GET does not create a cart', async () => {
  const added = await run({ cart: null, existing: 0 });
  assert.deepEqual(added.writes[0].values, [8]);
  assert.deepEqual(added.writes[1].values, [10, 5, 2, 2]);
  const read = await run({ method: 'GET', body: undefined, cart: null });
  assert.equal(read.res.statusCode, 200); assert.deepEqual(read.writes, []);
});
test('completed cart is cleared before being reused', async () => {
  const { writes } = await run({ cart: { GioHangID: 9, TrangThai: 'COMPLETED' }, existing: 0 });
  assert.match(writes[0].sql, /^DELETE/); assert.match(writes[1].sql, /^UPDATE giohang/);
  assert.deepEqual(writes[2].values, [9, 5, 2, 2]);
});
test('database failure rolls back and releases connection without leaking SQL errors', async () => {
  const { res, calls } = await run({ failure: true });
  assert.equal(res.statusCode, 500); assert.ok(!JSON.stringify(res.body).includes('db unavailable'));
  assert.ok(!calls.includes('commit')); assert.deepEqual(calls.slice(-2), ['rollback', 'release']);
});
