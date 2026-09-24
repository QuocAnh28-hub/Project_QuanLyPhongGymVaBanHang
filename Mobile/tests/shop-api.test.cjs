const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/lib/shop-api.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
function api(responses) {
  const calls = [];
  const context = { exports: {}, require: () => ({ baseUrl: 'http://test:3000' }),
    AbortController, setTimeout, clearTimeout,
    fetch: async (url, init) => {
      calls.push({ url, init });
      const response = responses[url.replace('http://test:3000', '')];
      assert.ok(response, `Unexpected API request: ${url}`);
      return { ok: response.status ? response.status < 400 : true, json: async () => response.data };
    },
  };
  vm.runInNewContext(compiled, context);
  return { ...context.exports, calls };
}
const product = { SanPhamID: 17, DanhMucID: 2, TenSanPham: 'Bình lắc', MoTa: null,
  GiaBan: '125000.50', HinhAnh: '/uploads/shaker.jpg', DonViTinh: 'Cái', TrangThai: 'ACTIVE' };

test('catalog uses real IDs, decimal prices, image paths and active categories', async () => {
  const client = api({ '/sanpham': { data: [product, { ...product, SanPhamID: 18, TrangThai: 'INACTIVE' },
    { ...product, SanPhamID: 19, TrangThai: 'OUT_OF_STOCK' }, { ...product, SanPhamID: 20, DanhMucID: 3 }] },
    '/danhmuc': { data: [{ DanhMucID: 2, TrangThai: 'ACTIVE' }, { DanhMucID: 3, TrangThai: 'INACTIVE' }] } });
  const data = await client.getCatalog();
  assert.deepEqual(Array.from(data.products, p => p.SanPhamID), [17, 19]);
  assert.equal(data.products[0].GiaBan, 125000.5);
  assert.equal(data.products[0].HinhAnh, 'http://test:3000/uploads/shaker.jpg');
  assert.equal(data.categories.length, 1);
});
test('search normalization supports Vietnamese without accents', () => {
  assert.equal(api({}).searchKey('ĐỒ UỐNG Điện giải'), 'do uong dien giai');
});
test('detail rejects invalid ID without fetching and preserves not-found message', async () => {
  const client = api({ '/sanpham/17': { status: 404, data: { message: 'Không tìm thấy sản phẩm' } } });
  await assert.rejects(client.getShopProduct(0), /Mã sản phẩm/);
  assert.equal(client.calls.length, 0);
  await assert.rejects(client.getShopProduct(17), /Không tìm thấy sản phẩm/);
});
test('detail cannot expose products from inactive categories', async () => {
  const client = api({ '/sanpham/17': { data: product }, '/danhmuc/2': { data: { TrangThai: 'INACTIVE' } } });
  await assert.rejects(client.getShopProduct(17), /ngừng bán/);
});
test('cart sends product ID and quantity, never client price or member ID', async () => {
  const client = api({ '/giohang/account/7/items': { data: [{ ...product, SoLuong: 2 }] } });
  const cart = await client.updateCart(7, 17, 2);
  assert.equal(cart[0].GiaBan, 125000.5);
  assert.equal(client.calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(client.calls[0].init.body), { productId: 17, quantity: 2 });
  await client.updateCart(7, 17, 0, 'PUT');
  assert.equal(client.calls[1].init.method, 'PUT');
});
test('invalid catalog shape and price show errors rather than fake products', async () => {
  for (const rows of [{}, [{ ...product, GiaBan: 'invalid' }]]) {
    const client = api({ '/sanpham': { data: rows }, '/danhmuc': { data: [] } });
    await assert.rejects(client.getCatalog(), /không hợp lệ/);
  }
});
