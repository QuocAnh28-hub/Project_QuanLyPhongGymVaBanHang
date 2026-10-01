const assert = require('node:assert/strict');

function routes(name) {
  return require(`../routes/${name}.route`).stack
    .filter((layer) => layer.route)
    .flatMap((layer) => Object.keys(layer.route.methods).map((method) => `${method.toUpperCase()} ${layer.route.path}`));
}

const forbidden = {
  dangkygoitap: ['POST /', 'PUT /:DangKyID', 'DELETE /:DangKyID'],
  thanhtoan: ['POST /', 'PUT /:ThanhToanID', 'DELETE /:ThanhToanID'],
  thuept: ['POST /', 'PUT /:ThuePTID', 'DELETE /:ThuePTID'],
  donhang: ['POST /', 'PUT /:DonHangID', 'DELETE /:DonHangID'],
  checkin: ['POST /', 'PUT /:CheckInID', 'DELETE /:CheckInID'],
  maqr: ['POST /', 'PUT /:MaQRID', 'DELETE /:MaQRID'],
  phieunhap: ['POST /', 'PUT /:PhieuNhapID', 'DELETE /:PhieuNhapID'],
};

for (const [name, blocked] of Object.entries(forbidden)) {
  const exposed = routes(name);
  for (const route of blocked) assert.ok(!exposed.includes(route), `${name} still exposes ${route}`);
}

assert.deepEqual(
  ['POST /book', 'POST /:ThuePTID/confirm', 'POST /:ThuePTID/cancel', 'POST /:ThuePTID/complete']
    .every((route) => routes('thuept').includes(route)),
  true,
);
for (const route of ['POST /register', 'POST /:DangKyID/renew']) {
  assert.ok(routes('dangkygoitap').includes(route));
}
for (const route of ['POST /package', 'POST /:ThanhToanID/confirm', 'POST /:ThanhToanID/cancel']) {
  assert.ok(routes('thanhtoan').includes(route));
}
assert.ok(routes('donhang').includes('PATCH /:DonHangID/delivery'));
assert.ok(routes('donhang').includes('POST /:DonHangID/status'));
for (const route of ['POST /token', 'POST /scan', 'POST /:CheckInID/checkout']) {
  assert.ok(routes('checkin').includes(route));
}
assert.ok(routes('maqr').includes('PATCH /:MaQRID/revoke'));
assert.ok(routes('phieunhap').includes('POST /with-items'));
assert.ok(routes('phieunhap').includes('POST /:PhieuNhapID/status'));
assert.ok(routes('lichpt').includes('POST /'));
assert.ok(routes('lichpt').includes('PUT /:LichPTID'));
assert.ok(routes('lichpt').includes('DELETE /:LichPTID'));

console.log('transaction route exposure: PASS');
process.exit(0);
