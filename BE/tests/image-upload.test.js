const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

// Exercise real authorization and upload routes without connecting to MySQL.
const dbPath = require.resolve('../common/db');
let role = 'ADMIN';
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: {
  query(_sql, _params, callback) {
    callback(null, [{ TaiKhoanID: 5, Email: 'upload@example.test', VaiTro: role, TrangThai: 'ACTIVE' }]);
  },
} };
process.env.AUTH_TOKEN_SECRET = 'image-upload-local-test-secret';
const { signToken } = require('../middleware/auth');
const app = require('../app');

test('image upload validation, authorization and static delivery', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const headers = { Authorization: `Bearer ${signToken({ TaiKhoanID: 5 })}` };
  const files = [];
  async function send(endpoint, bytes, type, filename, authenticated = true) {
    const body = new FormData();
    body.append('image', new Blob([bytes], { type }), filename);
    return fetch(base + endpoint, { method: 'POST', body, headers: authenticated ? headers : {} });
  }
  try {
    for (const [endpoint, folder, type, filename, bytes] of [
      ['/pt/upload-image', 'pt', 'image/jpeg', 'photo.jpg', Buffer.from([255, 216, 255, 224])],
      ['/hoivien/5/upload-image', 'members', 'image/png', 'photo.png', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])],
      ['/sanpham/upload-image', 'products', 'image/webp', 'photo.webp', Buffer.from('RIFF0000WEBP')],
    ]) {
      const response = await send(endpoint, bytes, type, filename);
      assert.equal(response.status, 200, await response.clone().text());
      const result = await response.json();
      assert.match(result.path, new RegExp(`^/uploads/${folder}/[a-f0-9-]+\\.`));
      files.push(path.join(__dirname, '..', result.path));
      const image = await fetch(base + result.path);
      assert.equal(image.status, 200);
      assert.equal(image.headers.get('content-type'), type);
      assert.deepEqual(Buffer.from(await image.arrayBuffer()), bytes);
    }
    for (const [type, filename, bytes] of [
      ['text/plain', 'file.txt', 'text'],
      ['application/octet-stream', 'file.exe', 'MZ'],
      ['image/jpeg', 'file.exe', Buffer.from([255, 216, 255])],
      ['image/png', 'fake.png', 'not an image'],
      ['image/svg+xml', 'file.svg', '<svg/>'],
      ['image/jpeg', 'large.jpg', Buffer.alloc(5 * 1024 * 1024 + 1)],
    ]) assert.equal((await send('/pt/upload-image', bytes, type, filename)).status, 400);
    assert.equal((await fetch(base + '/pt/upload-image', { method: 'POST', headers })).status, 400);
    assert.equal((await send('/pt/upload-image', 'x', 'image/png', 'a.png', false)).status, 401);
    role = 'CUSTOMER';
    for (const endpoint of ['/pt/upload-image', '/sanpham/upload-image', '/hoivien/5/upload-image', '/hoivien/7/upload-image'])
      assert.equal((await send(endpoint, 'x', 'image/png', 'a.png')).status, 403);
    role = 'STAFF';
    assert.equal((await send('/sanpham/upload-image', 'x', 'image/png', 'a.png')).status, 403);
  } finally {
    await Promise.all(files.map(file => fs.unlink(file)));
    await new Promise(resolve => server.close(resolve));
  }
});
