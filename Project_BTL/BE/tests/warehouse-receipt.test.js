const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../controllers/warehouse-receipt.controller.js'), 'utf8');
function setup(failItems = false) {
  const events = [];
  const connection = {
    beginTransaction: async () => events.push('begin'),
    commit: async () => events.push('commit'),
    rollback: async () => events.push('rollback'),
    release: () => events.push('release'),
    query: async sql => {
      if (sql.includes('FROM kho')) return [[{ KhoID: 1 }]];
      if (sql.includes('FROM nhanvien')) return [[{ NhanVienID: 2 }]];
      if (sql.includes('FROM sanpham')) return [[{ SanPhamID: 3 }]];
      if (sql.includes('INSERT INTO phieunhap')) { events.push('header'); return [{ insertId: 9 }]; }
      if (sql.includes('INSERT INTO chitietphieunhap')) {
        events.push('items');
        if (failItems) throw new Error('simulated database failure');
        return [{ affectedRows: 1 }];
      }
      throw new Error('Unexpected SQL');
    },
  };
  const context = { exports: {}, require: () => ({ promise: () => ({ getConnection: async () => connection }) }) };
  vm.runInNewContext(source, context);
  return { api: context.exports, events };
}
const input = () => ({ KhoID: 1, NhanVienID: 2, items: [{ SanPhamID: 3, SoLuong: 2, DonGia: 10.25 }] });
const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
test('calculates totals and rejects duplicate, empty, negative and fractional quantity inputs', () => {
  const { api } = setup();
  assert.equal(api.validateReceipt(input()).TongTien, '20.50');
  assert.throws(() => api.validateReceipt({ ...input(), items: [] }));
  assert.throws(() => api.validateReceipt({ ...input(), items: [input().items[0], input().items[0]] }));
  for (const item of [{ SoLuong: -1 }, { SoLuong: 1.5 }, { DonGia: -1 }, { DonGia: 1.234 }]) {
    assert.throws(() => api.validateReceipt({ ...input(), items: [{ ...input().items[0], ...item }] }));
  }
});
test('commits header and items together', async () => {
  const { api, events } = setup(); const res = response();
  await api.create({ body: input() }, res);
  assert.equal(res.code, 201);
  assert.deepEqual(events, ['begin', 'header', 'items', 'commit', 'release']);
});
test('rolls back entire receipt when item insertion fails', async () => {
  const { api, events } = setup(true); const res = response();
  await api.create({ body: input() }, res);
  assert.equal(res.code, 500);
  assert.deepEqual(events, ['begin', 'header', 'items', 'rollback', 'release']);
});
