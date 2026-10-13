const fs = require('node:fs');
const path = require('node:path');
const db = require('../common/db');

(async () => {
  try {
    await db.promise().query(fs.readFileSync(path.join(__dirname, '../../database/migrations/005_gym_equipment.sql'), 'utf8'));
    const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '../../database/seeds/gym_equipment.json'), 'utf8'));
    const connection = await db.promise().getConnection();
    try {
      await connection.beginTransaction();
      for (const row of seed) {
        // Re-running the migration preserves all Admin edits and existing quantities.
        await connection.query(`INSERT INTO maytap (MaMay,TenMay,NhomMay,NhomCo,MoTa,HinhAnh)
          SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM maytap WHERE MaMay=?)`,
        [row.MaMay, row.TenMay, row.NhomMay, row.NhomCo, row.MoTa, row.HinhAnh || null, row.MaMay]);
      }
      await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    const [[result]] = await db.promise().query('SELECT COUNT(*) AS total FROM maytap');
    console.log(`Máy tập: đã tạo bảng và khởi tạo danh mục. Tổng ${result.total} loại máy.`);
  } catch (error) {
    console.error('Không thể tạo dữ liệu máy tập:', error.code || error.message);
    process.exitCode = 1;
  } finally { await db.promise().end(); }
})();
