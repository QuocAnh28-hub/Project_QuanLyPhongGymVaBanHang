function inventoryError(status, code, message) {
  return Object.assign(new Error(message), { status, code });
}

function warehouseId() {
  const value = Number(process.env.SHOP_WAREHOUSE_ID);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw inventoryError(500, 'INVALID_SHOP_WAREHOUSE', 'SHOP_WAREHOUSE_ID phải là số nguyên dương.');
  }
  return value;
}

async function requireWarehouse(connection, lock = false) {
  const id = warehouseId();
  const [rows] = await connection.query(
    `SELECT KhoID FROM kho WHERE KhoID=? AND TrangThai='ACTIVE'${lock ? ' FOR UPDATE' : ''}`,
    [id],
  );
  if (!rows.length) throw inventoryError(503, 'SHOP_WAREHOUSE_UNAVAILABLE', `Kho bán hàng ${id} không tồn tại hoặc không hoạt động.`);
  return id;
}

function insufficientStock(name, quantity) {
  return inventoryError(409, 'INSUFFICIENT_STOCK', `${name} chỉ còn ${quantity} sản phẩm trong kho.`);
}

module.exports = { inventoryError, warehouseId, requireWarehouse, insufficientStock };
