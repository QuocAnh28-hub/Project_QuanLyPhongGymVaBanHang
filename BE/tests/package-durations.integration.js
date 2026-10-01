const { test } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../common/db');

test('admin synchronizes every package duration without deleting history', async () => {
  const connection = await db.promise().getConnection();
  const bridge = {
    promise: () => bridge,
    beginTransaction: () => connection.query('SAVEPOINT package_duration_operation'),
    commit: () => connection.query('RELEASE SAVEPOINT package_duration_operation'),
    rollback: () => connection.query('ROLLBACK TO SAVEPOINT package_duration_operation'),
    release: () => {},
    query: (sql, args) => connection.query(sql, args),
  };
  const dbPath = require.resolve('../common/db');
  const originalDb = require.cache[dbPath].exports;
  require.cache[dbPath].exports = {
    getConnection: callback => callback(null, bridge),
    query(sql, args, callback) {
      if (typeof args === 'function') { callback = args; args = []; }
      connection.query(sql, args).then(([rows]) => callback(null, rows), callback);
    },
  };
  delete require.cache[require.resolve('../models/goitap.model')];
  delete require.cache[require.resolve('../controllers/goitap.controller')];
  const packages = require('../models/goitap.model');
  const controller = require('../controllers/goitap.controller');
  const save = (id, data) => new Promise((resolve, reject) => packages.saveAdmin(id, data, (error, result) => error ? reject(error) : resolve(result)));
  const duration = (SoThang, GiaBan, ThangTang = 0, extra = {}) => ({ SoThang, ThangTang, GiaGoc: GiaBan + 50000, GiaBan, TrangThai: 'ACTIVE', ...extra });
  await connection.beginTransaction();
  try {
    const base = { TenGoi: 'MULTI DURATION TEST', MoTa: 'test', TrangThai: 'ACTIVE', QuyenLoi: [], ThoiHan: [duration(1, 200000), duration(3, 550000), duration(6, 1000000), duration(8, 1500000), duration(12, 2200000, 1)] };
    const created = await save(null, base);
    const id = created.GoiTapID;
    let [rows] = await connection.query('SELECT * FROM GoiTapThoiHan WHERE GoiTapID=? ORDER BY SoThang', [id]);
    assert.deepEqual(rows.map(row => Number(row.SoThang)), [1, 3, 6, 8, 12]);
    const activeDetail = await new Promise((resolve, reject) => packages.getActiveDetailById(id, (error, result) => error ? reject(error) : resolve(result)));
    assert.equal(activeDetail.ThoiHan.length, 5);
    assert.equal(Number(activeDetail.ThoiHan.find(row => Number(row.SoThang) === 12).ThangTang), 1);
    const adminList = await new Promise((resolve, reject) => packages.getAll((error, result) => error ? reject(error) : resolve(result)));
    assert.equal(adminList.find(row => Number(row.GoiTapID) === id).ThoiHan.length, 5);
    const eightId = rows.find(row => Number(row.SoThang) === 8).GoiTapThoiHanID;

    await save(id, { ...base, ThoiHan: [duration(1, 200000), duration(3, 550000), duration(8, 1600000), duration(12, 2200000, 1), duration(18, 3000000)] });
    [rows] = await connection.query('SELECT * FROM GoiTapThoiHan WHERE GoiTapID=? ORDER BY SoThang', [id]);
    assert.equal(rows.find(row => Number(row.SoThang) === 6).TrangThai, 'INACTIVE');
    assert.equal(Number(rows.find(row => Number(row.SoThang) === 8).GiaBan), 1600000);
    assert.equal(rows.find(row => Number(row.SoThang) === 8).GoiTapThoiHanID, eightId);
    assert.equal(rows.filter(row => Number(row.SoThang) === 8).length, 1);
    assert.ok(rows.some(row => Number(row.SoThang) === 18));

    const duplicateResponse = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
    controller.create({ body: { ...base, ThoiHan: [duration(8, 1), duration(8, 2)] } }, duplicateResponse);
    assert.equal(duplicateResponse.statusCode, 400);
  } finally {
    await connection.rollback();
    connection.release();
    require.cache[dbPath].exports = originalDb;
    await db.promise().end();
  }
});
