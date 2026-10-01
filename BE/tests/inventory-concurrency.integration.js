const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const db = require('../common/db').promise();

test('row locking and conditional deduction prevent overselling', async () => {
  const setup = await db.getConnection();
  let categoryId, productId, warehouseId;
  try {
    const [category] = await setup.query('INSERT INTO danhmuc (TenDanhMuc) VALUES (?)', [`Stock ${randomUUID()}`]);
    categoryId = category.insertId;
    const [product] = await setup.query('INSERT INTO sanpham (DanhMucID,TenSanPham,GiaBan) VALUES (?,?,1)', [categoryId, 'Concurrency stock test']);
    productId = product.insertId;
    const [warehouse] = await setup.query('INSERT INTO kho (TenKho) VALUES (?)', [`Stock ${randomUUID()}`]);
    warehouseId = warehouse.insertId;
    await setup.query('INSERT INTO TonKho (KhoID,SanPhamID,SoLuongTon) VALUES (?,?,1)', [warehouseId, productId]);

    const deduct = async () => {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const [rows] = await connection.query('SELECT SoLuongTon FROM TonKho WHERE KhoID=? AND SanPhamID=? FOR UPDATE', [warehouseId, productId]);
        if (Number(rows[0]?.SoLuongTon || 0) < 1) { await connection.rollback(); return false; }
        const [result] = await connection.query('UPDATE TonKho SET SoLuongTon=SoLuongTon-1 WHERE KhoID=? AND SanPhamID=? AND SoLuongTon>=1', [warehouseId, productId]);
        await connection.commit();
        return result.affectedRows === 1;
      } finally { connection.release(); }
    };
    const results = await Promise.all([deduct(), deduct()]);
    assert.equal(results.filter(Boolean).length, 1);
    const [stock] = await setup.query('SELECT SoLuongTon FROM TonKho WHERE KhoID=? AND SanPhamID=?', [warehouseId, productId]);
    assert.equal(stock[0].SoLuongTon, 0);
  } finally {
    if (warehouseId && productId) await setup.query('DELETE FROM TonKho WHERE KhoID=? AND SanPhamID=?', [warehouseId, productId]);
    if (warehouseId) await setup.query('DELETE FROM kho WHERE KhoID=?', [warehouseId]);
    if (productId) await setup.query('DELETE FROM sanpham WHERE SanPhamID=?', [productId]);
    if (categoryId) await setup.query('DELETE FROM danhmuc WHERE DanhMucID=?', [categoryId]);
    setup.release();
    await db.end();
  }
});
