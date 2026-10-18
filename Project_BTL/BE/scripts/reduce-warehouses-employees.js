const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const db = require('../common/db');

async function main() {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const tables = ['kho', 'nhanvien', 'tonkho', 'phieunhap', 'shopcheckout', 'thanhtoan', 'hoadon'];
    const snapshot = {};
    for (const table of tables) {
      [snapshot[table]] = await connection.query('SELECT * FROM ?? FOR UPDATE', [table]);
    }
    const warehouses = snapshot.kho.sort((a, b) => a.KhoID - b.KhoID).slice(0, 5).map(row => row.KhoID);
    const employees = snapshot.nhanvien.sort((a, b) => a.NhanVienID - b.NhanVienID);
    const [privileged] = await connection.query("SELECT n.NhanVienID FROM nhanvien n JOIN taikhoan t ON t.TaiKhoanID=n.TaiKhoanID WHERE t.VaiTro IN ('ADMIN','STAFF') ORDER BY n.NhanVienID");
    const retained = [...new Set([...privileged.map(row => row.NhanVienID), ...employees.map(row => row.NhanVienID)])].slice(0, 6);
    assert.equal(warehouses.length, 5);
    assert.equal(retained.length, 6);
    assert.ok(privileged.every(row => retained.includes(row.NhanVienID)), 'Too many privileged employees to retain safely');
    const removed = employees.filter(row => !retained.includes(row.NhanVienID));
    const employeeMap = removed.map(row => ({
      from: row.NhanVienID,
      to: employees.find(target => retained.includes(target.NhanVienID) && target.ChucVu === row.ChucVu)?.NhanVienID
        ?? retained[0],
    }));
    const backupDirectory = path.join(os.homedir(), '.codex', 'backups', 'Project_BTL');
    fs.mkdirSync(backupDirectory, { recursive: true });
    const backupPath = path.join(backupDirectory, `warehouses-employees-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify({ createdAt: new Date().toISOString(), warehouses, retained, employeeMap, tables: snapshot }, null, 2), { flag: 'wx' });

    const inventory = new Map();
    for (const row of snapshot.tonkho) {
      const warehouse = warehouses.includes(row.KhoID) ? row.KhoID : warehouses[0];
      const key = `${warehouse}:${row.SanPhamID}`;
      const item = inventory.get(key) || { warehouse, product: row.SanPhamID, quantity: 0 };
      item.quantity += row.SoLuongTon;
      inventory.set(key, item);
    }
    await connection.query('DELETE FROM tonkho WHERE KhoID NOT IN (?)', [warehouses]);
    for (const item of inventory.values()) {
      await connection.query('INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,?) ON DUPLICATE KEY UPDATE SoLuongTon=?', [item.warehouse, item.product, item.quantity, item.quantity]);
    }
    for (const table of ['phieunhap', 'shopcheckout']) {
      await connection.query('UPDATE ?? SET KhoID=? WHERE KhoID NOT IN (?)', [table, warehouses[0], warehouses]);
    }
    for (const mapping of employeeMap) {
      for (const table of ['phieunhap', 'thanhtoan', 'hoadon']) {
        await connection.query('UPDATE ?? SET NhanVienID=? WHERE NhanVienID=?', [table, mapping.to, mapping.from]);
      }
    }
    await connection.query('DELETE FROM kho WHERE KhoID NOT IN (?)', [warehouses]);
    await connection.query('DELETE FROM nhanvien WHERE NhanVienID NOT IN (?)', [retained]);
    for (const [table, count] of [['kho', 5], ['nhanvien', 6]]) {
      const [[row]] = await connection.query('SELECT COUNT(*) n FROM ??', [table]);
      assert.equal(row.n, count);
    }
    for (const table of ['phieunhap', 'shopcheckout', 'thanhtoan', 'hoadon']) {
      const [[row]] = await connection.query('SELECT COUNT(*) n FROM ??', [table]);
      assert.equal(row.n, snapshot[table].length, `${table}: history must be preserved`);
    }
    const [stock] = await connection.query('SELECT SanPhamID,SUM(SoLuongTon) quantity FROM tonkho GROUP BY SanPhamID');
    const originalStock = new Map();
    for (const row of snapshot.tonkho) originalStock.set(row.SanPhamID, (originalStock.get(row.SanPhamID) || 0) + row.SoLuongTon);
    assert.equal(stock.length, originalStock.size);
    for (const row of stock) assert.equal(Number(row.quantity), originalStock.get(row.SanPhamID));
    await connection.commit();
    console.log(JSON.stringify({ committed: true, warehouses, employees: retained, backupPath, inventoryAndHistoryPreserved: true }, null, 2));
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.promise().end());
