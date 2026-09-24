const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
let account;
let databaseError = null;
require.cache[require.resolve('../common/db')] = { exports: {
  query(sql, params, callback) { callback(databaseError, account ? [account] : []); }
} };
const app = express();
app.use(express.json());
app.use('/auth/admin', require('../routes/admin-auth.route'));

test('Admin login, role/status checks, session validation and logout', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/auth/admin`;
  const post = (body) => fetch(`${base}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const credentials = { email: 'admin@example.test', password: 'test-password' };
  account = { TaiKhoanID: 1, Email: credentials.email, MatKhau: credentials.password, VaiTro: 'Admin', TrangThai: 'ACTIVE' };
  try {
    assert.equal((await post({})).status, 400);
    assert.equal((await post({ ...credentials, password: 'incorrect' })).status, 401);
    account.VaiTro = 'MEMBER';
    assert.equal((await post(credentials)).status, 403);
    account.VaiTro = 'ADMIN'; account.TrangThai = 'LOCKED';
    assert.equal((await post(credentials)).status, 403);
    account.TrangThai = 'ACTIVE';
    databaseError = new Error('offline');
    assert.equal((await post(credentials)).status, 503);
    databaseError = null;
    const response = await post(credentials);
    assert.equal(response.status, 200);
    const session = await response.json();
    assert.equal(session.account.MatKhau, undefined);
    assert.equal(session.token.length, 64);
    assert.ok(session.expiresAt > Date.now());
    const headers = { Authorization: `Bearer ${session.token}` };
    assert.equal((await fetch(`${base}/session`, { headers })).status, 200);
    assert.equal((await fetch(`${base}/session`)).status, 401);
    assert.equal((await fetch(`${base}/session`, { headers: { Authorization: 'Bearer forged' } })).status, 401);
    const realNow = Date.now;
    try {
      Date.now = () => session.expiresAt + 1;
      assert.equal((await fetch(`${base}/session`, { headers })).status, 401);
    } finally { Date.now = realNow; }
    const next = await (await post(credentials)).json();
    const nextHeaders = { Authorization: `Bearer ${next.token}` };
    assert.equal((await fetch(`${base}/logout`, { method: 'POST', headers: nextHeaders })).status, 204);
    assert.equal((await fetch(`${base}/session`, { headers: nextHeaders })).status, 401);
    const revoked = await (await post(credentials)).json();
    account.VaiTro = 'MEMBER';
    assert.equal((await fetch(`${base}/session`, { headers: { Authorization: `Bearer ${revoked.token}` } })).status, 403);
    account = null;
    assert.equal((await post(credentials)).status, 401);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
