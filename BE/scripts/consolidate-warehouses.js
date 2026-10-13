// Run: node scripts/consolidate-warehouses.js [--apply]
// Default is a read-only preview. Apply preserves product totals and receipt details.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const db = require('../common/db');

const food = name => /^(nuoc|thanh protein|sua protein|whey|creatine|bcaa|pre workout|protein)\b/.test(
  name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase());
const cents = value => Math.round(Number(value) * 100);

async function main() {
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const snapshot = {};
    for (const table of ['kho', 'sanpham', 'tonkho', 'phieunhap', 'chitietphieunhap', 'shopcheckout', 'chitietdonhang']) {
      [snapshot[table]] = await connection.query('SELECT * FROM ?? FOR UPDATE', [table]);
    }
    const ids = snapshot.kho.map(w => w.KhoID).sort((a, b) => a - b).slice(0, 2);
    assert.equal(ids.length, 2, 'At least two warehouses are required');
    const destination = new Map(snapshot.sanpham.map(p => [p.SanPhamID, ids[food(p.TenSanPham) ? 1 : 0]]));
    const summary = {
      warehouses: ids.map((id, i) => ({ KhoID: id, TenKho: i ? 'Kho thực phẩm' : 'Kho đồ tập',
        products: snapshot.sanpham.filter(p => destination.get(p.SanPhamID) === id).map(p => p.TenSanPham) })),
    };
    if (!process.argv.includes('--apply')) {
      console.log(JSON.stringify(summary, null, 2));
      await connection.rollback();
      return;
    }
    const backupPath = path.join(__dirname, '..', 'backups', `warehouse-consolidation-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify(snapshot, null, 2), { flag: 'wx' });
    for (const [i, id] of ids.entries()) {
      await connection.query('UPDATE kho SET TenKho=?, MoTa=?, TrangThai=? WHERE KhoID=?', [
        i ? 'Kho thực phẩm' : 'Kho đồ tập',
        i ? 'Lưu trữ đồ uống, thực phẩm và sản phẩm dinh dưỡng phục vụ tập luyện.'
          : 'Lưu trữ quần áo, giày, dụng cụ và phụ kiện tập luyện.', 'ACTIVE', id]);
    }
    const stock = new Map();
    for (const row of snapshot.tonkho) stock.set(row.SanPhamID, (stock.get(row.SanPhamID) || 0) + Number(row.SoLuongTon));
    await connection.query('DELETE FROM tonkho');
    for (const [product, quantity] of stock) {
      assert.ok(destination.has(product));
      await connection.query('INSERT INTO tonkho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,?)', [destination.get(product), product, quantity]);
    }
    let splitReceipts = 0;
    for (const receipt of snapshot.phieunhap) {
      const lines = snapshot.chitietphieunhap.filter(l => l.PhieuNhapID === receipt.PhieuNhapID);
      const groups = ids.map(id => ({ id, lines: lines.filter(l => destination.get(l.SanPhamID) === id) })).filter(g => g.lines.length);
      if (!groups.length) {
        await connection.query('UPDATE phieunhap SET KhoID=? WHERE PhieuNhapID=?', [ids[0], receipt.PhieuNhapID]);
        continue;
      }
      // Some legacy headers include adjustments absent from line totals.
      // Distribute those proportionally while preserving the recorded total.
      const lineTotal = lines.reduce((n, l) => n + cents(l.ThanhTien), 0);
      let allocated = 0;
      for (const [index, group] of groups.entries()) {
        const groupTotal = group.lines.reduce((n, l) => n + cents(l.ThanhTien), 0);
        const share = index === groups.length - 1 ? cents(receipt.TongTien) - allocated
          : Math.round(cents(receipt.TongTien) * (lineTotal ? groupTotal / lineTotal : group.lines.length / lines.length));
        allocated += share;
        const amount = (share / 100).toFixed(2);
        if (!index) {
          await connection.query('UPDATE phieunhap SET KhoID=?,TongTien=? WHERE PhieuNhapID=?', [group.id, amount, receipt.PhieuNhapID]);
        } else {
          const note = `${receipt.GhiChu || ''} | Tách từ phiếu #${receipt.PhieuNhapID} theo loại kho`.trim().slice(0, 500);
          const [created] = await connection.query('INSERT INTO phieunhap (KhoID,NhanVienID,NgayNhap,TongTien,GhiChu,TrangThai) VALUES (?,?,?,?,?,?)',
            [group.id, receipt.NhanVienID, receipt.NgayNhap, amount, note, receipt.TrangThai]);
          await connection.query('UPDATE chitietphieunhap SET PhieuNhapID=? WHERE ChiTietPhieuNhapID IN (?)', [created.insertId, group.lines.map(l => l.ChiTietPhieuNhapID)]);
          splitReceipts++;
        }
      }
    }
    // A mixed order keeps one checkout reference; fulfillment resolves each item
    // from its dedicated warehouse in shop-checkout.controller.js.
    for (const order of snapshot.shopcheckout) {
      const lines = snapshot.chitietdonhang.filter(l => l.DonHangID === order.DonHangID);
      const warehouse = lines.length && lines.every(l => destination.get(l.SanPhamID) === ids[1]) ? ids[1] : ids[0];
      await connection.query('UPDATE shopcheckout SET KhoID=? WHERE DonHangID=?', [warehouse, order.DonHangID]);
    }
    await connection.query('DELETE FROM kho WHERE KhoID NOT IN (?)', [ids]);
    const [afterStock] = await connection.query('SELECT * FROM tonkho');
    assert.equal(afterStock.length, stock.size);
    for (const row of afterStock) {
      assert.equal(row.KhoID, destination.get(row.SanPhamID));
      assert.equal(row.SoLuongTon, stock.get(row.SanPhamID));
    }
    const [[totals]] = await connection.query('SELECT SUM(TongTien) total FROM phieunhap');
    assert.equal(cents(totals.total), snapshot.phieunhap.reduce((n, r) => n + cents(r.TongTien), 0));
    const [afterLines] = await connection.query('SELECT * FROM chitietphieunhap ORDER BY ChiTietPhieuNhapID');
    const withoutReceipt = rows => rows.map(({ PhieuNhapID, ...rest }) => rest).sort((a, b) => a.ChiTietPhieuNhapID - b.ChiTietPhieuNhapID);
    assert.deepEqual(withoutReceipt(afterLines), withoutReceipt(snapshot.chitietphieunhap));
    await connection.commit();
    console.log(JSON.stringify({ ...summary, committed: true, splitReceipts, backupPath, stockAndHistoryPreserved: true }, null, 2));
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally { connection.release(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => db.promise().end());
