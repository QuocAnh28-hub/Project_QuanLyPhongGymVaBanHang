// Preview by default; --apply fills only missing stock rows. Existing balances stay intact.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const db = require('../common/db');

async function main() {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    // Match checkout's warehouse lock to serialize this repair with customer orders.
    await connection.query('SELECT KhoID FROM kho ORDER BY KhoID FOR UPDATE');
    const [existing] = await connection.query('SELECT * FROM tonkho ORDER BY KhoID,SanPhamID FOR UPDATE');
    const [inbound] = await connection.query(`SELECT p.KhoID,c.SanPhamID,SUM(c.SoLuong) quantity
      FROM phieunhap p JOIN chitietphieunhap c USING(PhieuNhapID)
      WHERE p.TrangThai='COMPLETED' GROUP BY p.KhoID,c.SanPhamID`);
    const [sales] = await connection.query(`SELECT c.SanPhamID,x.KhoID,SUM(c.SoLuong) quantity
      FROM chitietdonhang c JOIN donhang o USING(DonHangID)
      LEFT JOIN shopcheckout x USING(DonHangID)
      WHERE o.TrangThai IN ('CONFIRMED','PROCESSING','COMPLETED') GROUP BY c.SanPhamID,x.KhoID`);
    const missing = [];
    for (const item of inbound) {
      if (existing.some(row => row.KhoID === item.KhoID && row.SanPhamID === item.SanPhamID)) continue;
      const warehouses = inbound.filter(row => row.SanPhamID === item.SanPhamID);
      const sold = sales.filter(row => row.SanPhamID === item.SanPhamID);
      // In the two dedicated warehouses mixed orders have a summary KhoID only.
      // A product supplied by exactly one warehouse has an unambiguous location.
      assert(warehouses.length === 1 || sold.every(row => warehouses.some(w => w.KhoID === row.KhoID)),
        `Cannot allocate historical sales for product ${item.SanPhamID}`);
      const consumed = sold.filter(row => warehouses.length === 1 || row.KhoID === item.KhoID)
        .reduce((total, row) => total + Number(row.quantity), 0);
      const quantity = Number(item.quantity) - consumed;
      assert(quantity >= 0, `Negative reconstructed stock for product ${item.SanPhamID}`);
      missing.push({ KhoID: item.KhoID, SanPhamID: item.SanPhamID, inbound: Number(item.quantity), sold: consumed, SoLuongTon: quantity });
    }
    const apply = process.argv.includes('--apply');
    if (apply) {
      const backupPath = path.join(__dirname, `stock-repair-${Date.now()}.json`);
      fs.writeFileSync(backupPath, JSON.stringify({ existing, missing }, null, 2), { flag: 'wx' });
      for (const item of missing) {
        await connection.query('INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,?)', [item.KhoID, item.SanPhamID, item.SoLuongTon]);
      }
      const [after] = await connection.query('SELECT * FROM tonkho ORDER BY KhoID,SanPhamID');
      assert.equal(after.length, existing.length + missing.length);
      for (const row of existing) assert.deepEqual(after.find(item => item.KhoID === row.KhoID && item.SanPhamID === row.SanPhamID), row);
      await connection.commit();
      console.log(JSON.stringify({ applied: true, backupPath, missing }, null, 2));
    } else {
      await connection.rollback();
      console.log(JSON.stringify({ applied: false, missing }, null, 2));
    }
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); await db.promise().end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
