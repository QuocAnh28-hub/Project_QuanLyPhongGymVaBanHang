const { test } = require('node:test');
const assert = require('node:assert/strict');

// Use the actual model with a transaction double; never connect to MySQL.
const dbPath = require.resolve('../common/db');
const db = {};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
const payments = require('../models/thanhtoan.model');

async function cancel(paymentStatus = 'PENDING', registrationStatus = 'PENDING', failAt) {
  const state = { payment: paymentStatus, registration: registrationStatus };
  const calls = [];
  let draft, released = false;
  const transaction = {
    async beginTransaction() { calls.push('begin'); draft = { ...state }; },
    async query(sql) {
      calls.push(sql);
      if (sql.startsWith('SELECT ThanhToanID'))
        return [paymentStatus === null ? [] : [{ ThanhToanID: 5, DangKyID: 9, TrangThai: draft.payment }]];
      if (sql.startsWith('SELECT DangKyID'))
        return [registrationStatus === null ? [] : [{ DangKyID: 9, TrangThai: draft.registration }]];
      const field = sql.startsWith('UPDATE thanhtoan') ? 'payment' : 'registration';
      if (failAt === field) throw new Error('Simulated update failure');
      if (failAt === `${field}-no-row`) return [{ affectedRows: 0 }];
      draft[field] = 'CANCELLED';
      return [{ affectedRows: 1 }];
    },
    async commit() { calls.push('commit'); Object.assign(state, draft); },
    async rollback() { calls.push('rollback'); },
  };
  db.getConnection = callback => callback(null, { promise: () => transaction, release() { released = true; } });
  const result = await new Promise(resolve => payments.cancelPackagePayment(5, (error, data) => resolve({ error, data })));
  assert.equal(released, true);
  return { ...result, state, calls };
}

test('pending payment and registration cancel together after locking both records', async () => {
  const result = await cancel();
  assert.equal(result.error, null);
  assert.deepEqual(result.state, { payment: 'CANCELLED', registration: 'CANCELLED' });
  assert.equal(result.data.DangKyID, 9);
  assert.match(result.calls[1], /FROM thanhtoan .*FOR UPDATE$/);
  assert.match(result.calls[2], /FROM dangkygoitap .*FOR UPDATE$/);
  assert.match(result.calls[3], /^UPDATE thanhtoan/);
  assert.match(result.calls[4], /^UPDATE dangkygoitap/);
  assert.equal(result.calls.at(-1), 'commit');
});

test('successful, active, cancelled or missing records are rejected without updates', async () => {
  for (const [payment, registration, code] of [
    ['SUCCESS', 'ACTIVE', 'PAYMENT_NOT_PENDING'],
    ['PENDING', 'ACTIVE', 'REGISTRATION_NOT_PENDING'],
    ['CANCELLED', 'CANCELLED', 'PAYMENT_NOT_PENDING'],
    ['PENDING', 'CANCELLED', 'REGISTRATION_NOT_PENDING'],
    [null, 'PENDING', 'PAYMENT_NOT_FOUND'],
    ['PENDING', null, 'REGISTRATION_NOT_FOUND'],
  ]) {
    const result = await cancel(payment, registration);
    assert.equal(result.error.code, code);
    assert.deepEqual(result.state, { payment, registration });
    assert.equal(result.calls.some(sql => sql.startsWith('UPDATE')), false);
    assert.equal(result.calls.at(-1), 'rollback');
  }
});

test('either update failing or affecting zero rows rolls back the entire transaction', async () => {
  for (const failure of ['payment', 'registration', 'payment-no-row', 'registration-no-row']) {
    const result = await cancel('PENDING', 'PENDING', failure);
    assert.ok(result.error);
    assert.deepEqual(result.state, { payment: 'PENDING', registration: 'PENDING' });
    assert.equal(result.calls.includes('commit'), false);
    assert.equal(result.calls.at(-1), 'rollback');
  }
});

test('cancellation controller rejects non-admin users', () => {
  const controller = require('../controllers/thanhtoan.controller');
  for (const VaiTro of ['STAFF', 'CUSTOMER']) {
    const response = { status(code) { this.code = code; return this; }, json() {} };
    controller.cancelPackagePayment({ auth: { VaiTro }, params: { ThanhToanID: 5 } }, response);
    assert.equal(response.code, 403);
  }
});
