const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { hashPassword, verifyPassword, isHash } = require('../common/password');
const dbPath = require.resolve('../common/db');
let authAccount;
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  query(_sql, _params, callback) { callback(null, authAccount ? [authAccount] : []); },
  promise() { return { query: async () => [[]] }; },
} };
process.env.AUTH_TOKEN_SECRET = 'test-only-secret-with-enough-entropy';
const { requireRole, requireSelfOrRole, signToken } = require('../middleware/auth');

test('legacy password verifies once and bcrypt verifies afterwards', async () => {
  assert.equal(await verifyPassword('Legacy123!', 'Legacy123!'), true);
  const hash = await hashPassword('Legacy123!');
  assert.equal(isHash(hash), true);
  assert.equal(await verifyPassword('Legacy123!', hash), true);
  assert.equal(await verifyPassword('wrong', hash), false);
});

test('role and self authorization reject customer admin access and account 5 reading 7', () => {
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json() { return this; } });
  let next = false;
  const admin = response();
  requireRole('ADMIN')({ auth: { VaiTro: 'CUSTOMER' } }, admin, () => { next = true; });
  assert.equal(admin.code, 403);
  assert.equal(next, false);
  const other = response();
  requireSelfOrRole('TaiKhoanID', 'ADMIN', 'STAFF')({ auth: { TaiKhoanID: 5, VaiTro: 'CUSTOMER' }, params: { TaiKhoanID: 7 } }, other, () => { next = true; });
  assert.equal(other.code, 403);
});

test('clients use backend auth and account responses do not select password', () => {
  const root = path.join(__dirname, '..', '..');
  const mobile = fs.readFileSync(path.join(root, 'Mobile/src/context/AuthContext.tsx'), 'utf8');
  const model = fs.readFileSync(path.join(root, 'BE/models/taikhoan.model.js'), 'utf8');
  const website = fs.readFileSync(path.join(root, 'Website/src/services/catalog.ts'), 'utf8');
  assert.doesNotMatch(mobile, /getAccounts\(|\.MatKhau\s*===|const SEED/);
  assert.match(mobile, /restoreAccount\(\)/);
  assert.match(model, /SELECT TaiKhoanID, Email, VaiTro, TrangThai, NgayTao/);
  assert.match(website, /adminFetch/);
});

test('change password verifies old hash and stores a new hash', async () => {
  const model = require('../models/taikhoan.model');
  const controller = require('../controllers/taikhoan.controller');
  const oldGet = model.getPasswordById, oldChange = model.changePassword;
  const currentHash = await hashPassword('Current123!');
  let stored;
  model.getPasswordById = (_id, callback) => callback(null, [{ TaiKhoanID: 5, MatKhau: currentHash, TrangThai: 'ACTIVE' }]);
  model.changePassword = (_id, password, callback) => { stored = password; callback(null, true); };
  try {
    await new Promise((resolve, reject) => {
      const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { try { assert.equal(this.statusCode, 200); assert.ok(body.message); resolve(); } catch (error) { reject(error); } } };
      controller.changePassword({ params: { TaiKhoanID: 5 }, body: { MatKhauHienTai: 'Current123!', MatKhauMoi: 'Next4567!' } }, res);
    });
    assert.equal(isHash(stored), true);
    assert.equal(await verifyPassword('Next4567!', stored), true);
  } finally { model.getPasswordById = oldGet; model.changePassword = oldChange; }
});

test('reset password route hashes before database update', () => {
  const source = fs.readFileSync(path.join(__dirname, '../routes/recovery.route.js'), 'utf8');
  assert.match(source, /await hashPassword\(password\)/);
});

test('protected API rejects anonymous, CUSTOMER admin access, and account 5 reading 7', async () => {
  authAccount = { TaiKhoanID: 5, Email: 'member@example.test', VaiTro: 'CUSTOMER', TrangThai: 'ACTIVE' };
  const app = require('../app');
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { Authorization: `Bearer ${signToken(authAccount)}` };
  try {
    assert.equal((await fetch(`${base}/taikhoan`)).status, 401);
    assert.equal((await fetch(`${base}/taikhoan`, { headers })).status, 403);
    assert.equal((await fetch(`${base}/hoivien/account/7`, { headers })).status, 403);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
