// Run with node scripts/fill-missing-images_2.js; add --apply to update MySQL.
// Existing HTTP URLs and uploaded images are always preserved.
const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('../common/db');
const pexels = id => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=600`;
const productPhotos = {
  1: 6046231, 2: 12039633, 3: 7298684, 4: 17769664, 5: 18946640,
  8: 7691101, 9: 4397831, 10: 8032959, 11: 8032748,
  12: 19025673, 13: 19025673, 14: 33408971, 16: 18999339,
  17: 5808007, 18: 9286991, 19: 26956136, 20: 8187640,
  23: 33408971, 36: 4000090, 37: 7002964, 38: 4397831,
  39: 6516207, 40: 8032959, 42: 11170468, 43: 8032748,
  44: 4720516, 46: 14513406,
};
const gloves = 'https://www.beckettsactive.com/cdn/shop/files/gym-gloves-with-adjustable-wrist-closure-for-secure-fit.webp?v=1771608032';
const specs = [
  ['sanpham', 'SanPhamID', 'HinhAnh'],
  ['pt', 'PTID', 'AnhDaiDien'],
  ['hoivien', 'HoiVienID', 'AnhDaiDien'],
];
const preserve = value => /^https?:\/\//i.test(String(value || '').trim()) || /^\/uploads\//i.test(String(value || '').trim());

async function main() {
  const plan = [], preserved = [];
  for (const [table, key, column] of specs) {
    const [rows] = await db.promise().query(`SELECT * FROM ${table} ORDER BY ${key}`);
    const counters = { men: 0, women: 0 };
    for (const row of rows) {
      if (preserve(row[column])) {
        preserved.push({ table, key, id: row[key], column, value: row[column] });
        continue;
      }
      let url;
      if (table === 'sanpham') {
        url = row[key] === 6 ? gloves : productPhotos[row[key]] && pexels(productPhotos[row[key]]);
        if (!url) throw new Error(`No product photo mapped for ${row[key]}`);
      } else {
        const gender = row.GioiTinh === 'NU' ? 'women' : 'men';
        const index = counters[gender]++ + (table === 'pt' ? 70 : 0);
        if (index > 99) throw new Error('Portrait index exceeds source collection');
        url = `https://randomuser.me/api/portraits/${gender}/${index}.jpg`;
      }
      plan.push({ table, key, id: row[key], column, before: row[column], after: url });
    }
  }
  // Check every unique remote URL before touching any database row.
  const urls = [...new Set(plan.map(row => row.after))];
  let cursor = 0;
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/'))
        throw new Error(`Invalid image response ${response.status}: ${url}`);
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength < 1000) throw new Error(`Empty image: ${url}`);
    }
  }));
  const counts = Object.fromEntries(specs.map(([table]) => [table, plan.filter(row => row.table === table).length]));
  console.log(JSON.stringify({ updates: counts, preserved: preserved.length, verifiedUrls: urls.length }));
  if (!process.argv.includes('--apply')) return;
  const reportPath = path.join(__dirname, `image-update-${Date.now()}.json`);
  await fs.writeFile(reportPath, JSON.stringify({ createdAt: new Date().toISOString(), note: 'Illustrative stock/sample images, not verified identities or exact product photos.', plan, preserved }, null, 2), { flag: 'wx' });
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    for (const row of plan) {
      const [result] = await connection.query(
        `UPDATE ${row.table} SET ${row.column}=? WHERE ${row.key}=? AND ${row.column} <=> ?`,
        [row.after, row.id, row.before]);
      if (result.affectedRows !== 1) throw new Error(`Image changed concurrently: ${row.table}/${row.id}`);
    }
    for (const row of preserved) {
      const [current] = await connection.query(`SELECT ${row.column} value FROM ${row.table} WHERE ${row.key}=?`, [row.id]);
      if (current[0]?.value !== row.value) throw new Error(`Existing image changed: ${row.table}/${row.id}`);
    }
    await connection.commit();
    console.log(`Updated ${plan.length} rows. Backup and URLs: ${reportPath}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.promise().end());
