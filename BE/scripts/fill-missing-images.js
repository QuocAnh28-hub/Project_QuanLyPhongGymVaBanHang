// Fill empty image fields only. Existing uploaded images are preserved.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const media = (id, hash, name) => `https://contents.mediadecathlon.com/${id}/${hash}/${name}.jpg?format=jpg&f=640x0`;
const glove = media('p2069799', '57cbda153fce3b94698cbe07148dc4c4', 'weight-training-gloves-100-lightweight-breathable-durable-black');
const strap = media('p2720151', '5222640a73abcde5e5f703d80b05079f', 'weight-training-lifting-strap-black');
const shirt = media('p2731196', 'k$bc655aba53da239d70a063908884c49e', 'ao-thun');
const short = media('p2625030', 'k$0aaef2223d3e16a7e608bec9347d7557', 'quan-short');
const whey = 'https://www.wheystore.vn/images/products/2025/12/19/resized/allmax-isoflex-2lbs_1766111390.png';
const products = {
 1: whey,
 2: 'https://www.wheystore.vn/images/products/2024/03/08/resized/amix-creatine-monohydrate-creapure-300g_1709892346.jpg',
 3: 'https://www.wheystore.vn/images/products/2024/01/18/resized/binh-lac-wheystore-1-ngan_1705572623.jpg',
 4: glove, 5: strap, 6: shirt, 7: short,
 8: 'https://www.wheystore.vn/images/products/2025/10/17/resized/amix-yeep-pump-no-caff-30-servings_1760665438.jpg',
 18: 'https://www.wheystore.vn/images/products/2026/06/27/resized/jimmybar-creatine-functional-protein-bar-hop-14-banh_1782524949.jpg',
 19: 'https://storagemydawadocsprod.blob.core.windows.net/productimages/07124/07124_1.jpg',
 20: 'https://www.frezfruta.com/wp-content/uploads/2023/03/frez-peanut-butter-340g-img-min.png',
 21: 'https://m.media-amazon.com/images/I/61+eIvXaxSL.jpg',
 22: media('p2437114', 'a78701e7c057f53e54c0e28271f7f71b', 'hand-foam-massage-roller-deep-tissue-and-muscle-relief-38cm-black'),
 23: media('p2053877', '7dca208a01a5ee552f1f2b6df8632a59', 'small-massage-ball-black'),
 24: media('p2918803', '48d7a6a6143d59adc13b768bf0c52cfb', 'yoga-strap-for-stretching-onesize-blue'),
 25: media('p3046528', 'ed2fefb9dd7b57281299823f89bbdfa7', 'mini-massage-gun-6mm-with-2-attachments'),
 26: strap,
 27: 'https://fitactivesports.com/cdn/shop/files/BLACK.jpg?v=1723221290&width=1200',
 28: media('p2784417', 'f412670c834029f14674151c29e843a5', 'weight-training-wrist-strap-carbon-grey'),
 29: glove,
 30: media('p2736469', '66bd462c868980a895527d71040e1f8f', 'women-sports-bra-removable-cups-low-support-black'),
 31: media('p1821700', 'db75fe4257b4e744aa3de3af3f138483', 'women-running-leggings-dry-fee-black'),
 32: media('p2672522', 'k$a3583b90b3d5c7b6a011dc2c4b3ed56f', 'ao-thun'),
 33: media('p1883127', 'k$eb62df2bbf8ed0c5aedcfb65d45ce9dc', 'quan-short'),
 34: shirt, 35: short,
 36: media('p1883309', 'k$f4b321cda3f8b227e1532d21706365fa', 'ao-ba-lo'),
 37: media('p1724744', 'a8373278310c30c7ce0af8f5b36843c1', 'men-gym-trackpants-slim-fit-jogger-style-breathable-quick-dry-smoked-black'),
 38: 'https://shopsuki.ph/cdn/shop/files/8997035600027_1024x.jpg?v=1772409417',
 39: 'https://jggp.jayagrocer.com/cdn/shop/files/053510-1-1.jpg?v=1750155622',
 40: 'https://www.baladna.com.jo/Uploads/31768812241.jpg',
 41: 'https://suiste.com/images/69a66a10-f4c5-4e02-b1d2-e6fc24ac73e6.png',
};
async function verify(url) {
 assert(url.startsWith('https://') && url.length <= 255);
 const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
 assert(response.ok, `Image failed (${response.status}): ${url}`);
 assert((response.headers.get('content-type') || '').startsWith('image/'), `Not an image: ${url}`);
 const bytes = Buffer.from(await response.arrayBuffer());
 assert(bytes.length > 500, `Image too small: ${url}`);
 assert(bytes.subarray(0, 3).equals(Buffer.from([255,216,255])) || bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || (bytes.toString('ascii',0,4)==='RIFF' && bytes.toString('ascii',8,12)==='WEBP'), `Unrecognized image bytes: ${url}`);
 return { url, bytes: bytes.length };
}
async function main() {
 const c = await mysql.createConnection({ host: process.env.DB_HOST, port: +(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME });
 try {
  const changes = [];
  for (const [table, idColumn, imageColumn] of [['sanpham','SanPhamID','HinhAnh'], ['pt','PTID','AnhDaiDien'], ['hoivien','HoiVienID','AnhDaiDien']]) {
   const [rows] = await c.query('SELECT * FROM ?? WHERE ?? IS NULL OR TRIM(??)=?', [table,imageColumn,imageColumn,'']);
   for (const row of rows) {
    const id = row[idColumn];
    const url = table === 'sanpham' ? products[id] : `https://randomuser.me/api/portraits/${row.GioiTinh === 'NU' ? 'women' : 'men'}/${table === 'pt' ? id + 75 : id}.jpg`;
    assert(url, `Missing product mapping: ${id}`);
    changes.push({ table, idColumn, imageColumn, id, name: row.TenSanPham || row.HoTen, before: row[imageColumn], after: url });
   }
  }
  const urls = [...new Set(changes.map(r=>r.after))]; const checks = [];
  for (let i = 0; i < urls.length; i += 8) {
   const results = await Promise.allSettled(urls.slice(i,i+8).map(verify));
   const failures = results.filter(r=>r.status==='rejected');
   if (failures.length) throw new Error(failures.map(r=>r.reason.message).join('\n'));
   checks.push(...results.map(r=>r.value));
  }
  console.log(`Verified ${checks.length} unique image URLs. Updating ${changes.length} empty fields.`);
  const backup = path.join(__dirname, 'image-url-changes.json');
  // Preserve the previous report when rerunning after all fields have been filled.
  if (!changes.length) return;
  fs.writeFileSync(backup, JSON.stringify({ database: process.env.DB_NAME, date: '2026-10-08', illustrativeImages: true, changes, checks }, null, 2));
  await c.beginTransaction();
  try {
   for (const r of changes) {
    const [result] = await c.query('UPDATE ?? SET ??=? WHERE ??=? AND (?? IS NULL OR TRIM(??)=?)', [r.table,r.imageColumn,r.after,r.idColumn,r.id,r.imageColumn,r.imageColumn,'']);
    assert.equal(result.affectedRows,1, `Record changed concurrently: ${r.table}/${r.id}`);
   }
   for (const r of changes) {
    const [[row]] = await c.query('SELECT ?? AS image FROM ?? WHERE ??=?', [r.imageColumn,r.table,r.idColumn,r.id]);
    assert.equal(row.image,r.after);
   }
   await c.commit();
  } catch(e) { await c.rollback(); throw e; }
  console.log(JSON.stringify(changes.reduce((s,r)=>{s[r.table]=(s[r.table]||0)+1;return s;},{})));
 } finally { await c.end(); }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
