const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dbPath = require.resolve('../common/db');
const db = {};
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: db };
const registrations = require('../models/dangkygoitap.model');
const payments = require('../models/thanhtoan.model');

function register(mode, maxEnd = null, pending = []) {
  const calls = [];
  const query = async (sql, params = []) => {
    calls.push({ sql, params });
    if (sql.includes('FROM hoivien h')) return [[{ HoiVienID: 9, HoiVienTrangThai: 'ACTIVE', TaiKhoanTrangThai: 'ACTIVE', VaiTro: 'CUSTOMER' }]];
    if (sql.includes('FROM goitap g')) return [[{ GoiTapID: 2, TenGoi: 'Diamond', GoiTapThoiHanID: 3, SoThang: 3, ThangTang: 0, GiaGoc: 100, GiaBan: 100, GoiTapTrangThai: 'ACTIVE', ThoiHanTrangThai: 'ACTIVE' }]];
    if (sql.includes("d.TrangThai = 'PENDING'")) return [pending];
    if (sql.includes('MAX(d.NgayKetThuc)')) return [[{ MaxNgayKetThuc: maxEnd, Today: '2026-10-01' }]];
    if (sql.includes('INSERT INTO dangkygoitap')) return [{ insertId: 77 }];
    throw new Error(`Unexpected SQL: ${sql}`);
  };
  db.getConnection = callback => callback(null, { promise: () => ({ beginTransaction: async () => {}, query, commit: async () => {}, rollback: async () => {} }), release() {} });
  return new Promise(resolve => registrations.register({ TaiKhoanID: 5, GoiTapID: 2, GoiTapThoiHanID: 3, NgayBatDau: '2026-10-05', ActivationMode: mode }, (error, result) => resolve({ error, result, calls })));
}

test('QUEUE schedules after the last package and REPLACE predicts today', async () => {
  const queued = await register('QUEUE_AFTER_CURRENT', '2026-12-31');
  assert.equal(queued.result.NgayBatDau, '2027-01-01');
  assert.equal(queued.result.TinhTrangSuDung, 'UPCOMING');
  assert.equal(queued.result.ActivationMode, 'QUEUE_AFTER_CURRENT');
  const replaced = await register('REPLACE_NOW', '2026-12-31');
  assert.equal(replaced.result.NgayBatDau, '2026-10-01');
  assert.equal(replaced.result.TinhTrangSuDung, 'CURRENT');
});

test('one pending registration blocks every package for the same member', async () => {
  const blocked = await register('QUEUE_AFTER_CURRENT', null, [{ DangKyID: 66 }]);
  assert.equal(blocked.error.status, 409);
  assert.equal(blocked.error.code, 'PENDING_EXISTS');
  assert.deepEqual(blocked.error.data, { DangKyID: 66 });
});

test('owned memberships return one current and every upcoming in DB order', async () => {
  db.query = (_sql, _params, callback) => callback(null, [
    { DangKyID: 1, TinhTrangSuDung: 'CURRENT' },
    { DangKyID: 2, TinhTrangSuDung: 'UPCOMING' },
    { DangKyID: 3, TinhTrangSuDung: 'UPCOMING' },
  ]);
  const owned = await new Promise((resolve, reject) => registrations.getOwnedMembershipsByAccount(5, (error, result) => error ? reject(error) : resolve(result)));
  assert.equal(owned.current.DangKyID, 1);
  assert.deepEqual(owned.upcoming.map(item => item.DangKyID), [2, 3]);
});

test('REPLACE confirmation ends current and shifts upcoming packages after the new package', async () => {
  const calls = [];
  const query = async (sql, params = []) => {
    calls.push({ sql, params });
    if (sql.startsWith('SELECT * FROM thanhtoan')) return [[{ ThanhToanID: 10, DangKyID: 20, HoiVienID: 9, NhanVienID: null, SoTien: 100, TrangThai: 'PENDING', NoiDung: 'PACKAGE_ACTIVATION:REPLACE_NOW' }]];
    if (sql.includes('SELECT d.DangKyID,th.SoThang')) return [[{ DangKyID: 30, SoThang: 1, ThangTang: 0 }, { DangKyID: 31, SoThang: 1, ThangTang: 0 }]];
    if (sql.includes('d.HoiVienID,d.NgayBatDau')) return [[{ DangKyID: 20, HoiVienID: 9, NgayBatDau: '2026-10-01', NgayKetThuc: '2027-01-01', TrangThai: 'PENDING', SoThang: 3, ThangTang: 0, Today: '2026-10-01' }]];
    if (sql.startsWith('SELECT HoiVienID FROM hoivien')) return [[]];
    if (sql.startsWith('UPDATE dangkygoitap d')) return [{ affectedRows: 1 }];
    if (sql.startsWith('UPDATE thanhtoan')) return [{ affectedRows: 1 }];
    if (sql.includes("SET TrangThai='ACTIVE'")) return [{ affectedRows: 1 }];
    if (sql.startsWith('UPDATE dangkygoitap SET NgayBatDau')) return [{ affectedRows: 1 }];
    if (sql.startsWith('INSERT INTO hoadon')) return [{ insertId: 40 }];
    if (sql.startsWith('SELECT HoaDonID')) return [[{ HoaDonID: 40 }]];
    throw new Error(`Unexpected SQL: ${sql}`);
  };
  db.getConnection = callback => callback(null, { promise: () => ({ beginTransaction: async () => {}, query, commit: async () => {}, rollback: async () => {} }), release() {} });
  const result = await new Promise((resolve, reject) => payments.confirmPackagePayment(10, (error, value) => error ? reject(error) : resolve(value)));
  assert.equal(result.ActivationMode, 'REPLACE_NOW');
  assert.equal(result.TinhTrangSuDung, 'CURRENT');
  assert.ok(calls.some(call => call.sql.includes('DATE_SUB(CURDATE()')));
  assert.equal(calls.filter(call => call.sql.startsWith('UPDATE dangkygoitap SET NgayBatDau')).length, 2);
});

test('Mobile requires explicit mode, renders upcoming without QR, and notification reflects schedule', () => {
  const root = path.join(__dirname, '..', '..');
  const enrollment = fs.readFileSync(path.join(root, 'Mobile/src/app/package-enrollment.tsx'), 'utf8');
  const detail = fs.readFileSync(path.join(root, 'Mobile/src/app/membership-detail.tsx'), 'utf8');
  const notification = fs.readFileSync(path.join(root, 'BE/controllers/thanhtoan.controller.js'), 'utf8');
  assert.match(enrollment, /Vui lòng chọn thời điểm kích hoạt gói mới/);
  assert.match(enrollment, /QUEUE_AFTER_CURRENT/);
  assert.match(enrollment, /REPLACE_NOW/);
  assert.doesNotMatch(enrollment, /getActiveMembership|getEnrollment/);
  assert.match(detail, /GÓI ĐÃ MUA - CHỜ KÍCH HOẠT/);
  assert.match(detail, /upcoming\.map/);
  assert.match(notification, /sẽ kích hoạt từ/);
});
