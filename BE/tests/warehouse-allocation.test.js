const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../controllers/shop-checkout.controller.js'), 'utf8');
const allocator = source.slice(source.indexOf('async function stockWarehouse'), source.indexOf('async function transaction'));
const context = { error: (status, message) => Object.assign(new Error(message), { status }) };
vm.runInNewContext(`${allocator}\nthis.allocate = stockWarehouse;`, context);
function connection(reserved = []) {
  return { query: async (sql, params) => {
    if (sql.includes('FROM kho')) return [[{ KhoID: 1, TenKho: 'Kho đồ tập' }, { KhoID: 2, TenKho: 'Kho thực phẩm' }]];
    if (sql.includes('FROM tonkho')) return [[{ KhoID: 1, SanPhamID: 1, SoLuongTon: 10 }, { KhoID: 2, SanPhamID: 44, SoLuongTon: 5 }]];
    assert.equal(params[0], 99, 'Current order must not reserve against itself');
    assert.ok(!sql.includes('WHERE x.KhoID'), 'Mixed orders must reserve food in the food warehouse');
    return [reserved];
  } };
}
test('mixed orders allocate gear and food from their own warehouses', async () => {
  const items = [{ SanPhamID: 1, SoLuong: 2 }, { SanPhamID: 44, SoLuong: 3 }];
  assert.equal(await context.allocate(connection(), items, 1, 99), 1);
  assert.equal(items[0].KhoID, 1);
  assert.equal(items[1].KhoID, 2);
});
test('food-only order uses food warehouse', async () => {
  assert.equal(await context.allocate(connection(), [{ SanPhamID: 44, SoLuong: 2 }], 1, 99), 2);
});
test('pending mixed orders prevent overselling food', async () => {
  await assert.rejects(context.allocate(connection([{ SanPhamID: 44, quantity: 4 }]),
    [{ SanPhamID: 1, SoLuong: 1 }, { SanPhamID: 44, SoLuong: 2 }], 1, 99), { status: 409 });
});
