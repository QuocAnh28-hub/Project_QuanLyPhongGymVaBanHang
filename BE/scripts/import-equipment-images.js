const fs = require('node:fs/promises');
const path = require('node:path');
const db = require('../common/db');
const manifest = require('../../database/seeds/equipment_images.json');
const directory = path.join(__dirname, '../uploads/equipment');

(async () => {
  try {
    await fs.mkdir(directory, { recursive: true });
    const images = [];
    for (const item of manifest) {
      if (!/^[a-z0-9-]+$/.test(item.MaMay)) throw new Error('Mã máy không hợp lệ.');
      const extension = path.extname(new URL(item.Source).pathname).toLowerCase();
      if (!['.jpg', '.png', '.webp'].includes(extension)) throw new Error('Định dạng ảnh không hợp lệ.');
      const filename = `${item.MaMay}${extension}`;
      const destination = path.join(directory, filename);
      let buffer = await fs.readFile(destination).catch(() => null);
      if (!buffer) {
        const response = await fetch(item.Source, { signal: AbortSignal.timeout(30000), headers: { 'User-Agent': 'QA-Gym equipment image importer' } });
        if (!response.ok) throw new Error(`${item.MaMay}: HTTP ${response.status}`);
        if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${item.MaMay}: phản hồi không phải ảnh.`);
        buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 5 * 1024 * 1024) throw new Error(`${item.MaMay}: ảnh vượt 5 MB.`);
        const valid = extension === '.jpg' ? buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
          : extension === '.png' ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
        if (!valid) throw new Error(`${item.MaMay}: nội dung ảnh không hợp lệ.`);
        await fs.writeFile(destination, buffer, { flag: 'wx' });
      }
      images.push({ MaMay: item.MaMay, HinhAnh: `/uploads/equipment/${filename}` });
      console.log(`${item.MaMay}: ${Math.round(buffer.length / 1024)} KB`);
    }
    const connection = await db.promise().getConnection();
    try {
      await connection.beginTransaction();
      for (const image of images) await connection.query("UPDATE maytap SET HinhAnh=? WHERE MaMay=? AND (HinhAnh IS NULL OR HinhAnh='')", [image.HinhAnh, image.MaMay]);
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    const seedPath = path.join(__dirname, '../../database/seeds/gym_equipment.json');
    const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
    for (const row of seed) row.HinhAnh = images.find(image => image.MaMay === row.MaMay)?.HinhAnh || null;
    await fs.writeFile(seedPath, JSON.stringify(seed, null, 2) + '\n');
    const [[result]] = await db.promise().query("SELECT COUNT(*) AS total FROM maytap WHERE HinhAnh IS NOT NULL AND HinhAnh<>''");
    console.log(`Hoàn tất: ${result.total} loại máy có ảnh trong MySQL.`);
  } catch (error) { console.error('Nhập ảnh thất bại:', error.message); process.exitCode = 1; }
  finally { await db.promise().end(); }
})();
