const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../controllers/admin-employees.controller.js'), 'utf8');
const res = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
function setup({ target = 2, failInsert = false } = {}) {
  const events = [];
  const connection = {
    beginTransaction: async () => events.push('begin'), commit: async () => events.push('commit'), rollback: async () => events.push('rollback'), release: () => events.push('release'),
    query: async (sql, values) => {
      events.push(sql);
      if (sql.includes("VaiTro = 'ADMIN'")) return [[{ TaiKhoanID: 1 }]];
      if (sql.includes('SELECT TaiKhoanID FROM nhanvien')) return [[{ TaiKhoanID: target }]];
      if (sql.includes('INSERT INTO taikhoan')) return [{ insertId: 5 }];
      if (sql.includes('INSERT INTO nhanvien')) { if (failInsert) throw new Error('insert failed'); assert.equal(values[0].TaiKhoanID, 5); return [{ insertId: 6 }]; }
      return [{ affectedRows: 1 }];
    },
  };
  const context = { exports: {}, require: () => ({ promise: () => ({ getConnection: async () => connection }) }) };
  vm.runInNewContext(source, context);
  return { api: context.exports, events };
}
test('rejects invalid profiles and whitelists profile fields', () => {
  const { api } = setup();
  assert.throws(() => api.profile({ HoTen: ' ', TrangThai: 'ACTIVE' }));
  assert.throws(() => api.profile({ HoTen: 'Test', TrangThai: 'ACTIVE', NgaySinh: '2026-02-30' }));
  const payload = api.profile({ HoTen: 'Test', TrangThai: 'ACTIVE', VaiTro: 'ADMIN', TaiKhoanID: 88, MatKhau: 'hidden' });
  assert.equal(payload.VaiTro, undefined); assert.equal(payload.TaiKhoanID, undefined); assert.equal(payload.MatKhau, undefined);
});
test('prevents self-demotion and rolls back', async () => {
  const { api, events } = setup({ target: 1 }); const response = res();
  await api.access({ params: { id: 3 }, adminAccountId: 1, body: { VaiTro: 'STAFF', TrangThaiTaiKhoan: 'ACTIVE' } }, response);
  assert.equal(response.code, 409); assert.ok(events.includes('rollback')); assert.ok(!events.some(s => s.startsWith('UPDATE')));
});
test('updates another employee account role and status', async () => {
  const { api, events } = setup(); const response = res();
  await api.access({ params: { id: 3 }, adminAccountId: 1, body: { VaiTro: 'STAFF', TrangThaiTaiKhoan: 'LOCKED' } }, response);
  assert.equal(response.code, 200); assert.ok(events.includes('commit'));
});
test('rolls back account creation if employee insert fails', async () => {
  const { api, events } = setup({ failInsert: true }); const response = res();
  await api.create({ body: { HoTen: 'Test', TrangThai: 'ACTIVE', EmailDangNhap: 'staff@example.test', MatKhau: 'test-only-password', VaiTro: 'STAFF' } }, response);
  assert.equal(response.code, 500); assert.ok(events.includes('rollback')); assert.ok(!events.includes('commit')); assert.equal(response.body.MatKhau, undefined);
});
