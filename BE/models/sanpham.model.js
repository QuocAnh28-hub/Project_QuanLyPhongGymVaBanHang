const db = require("../common/db");
const { requireWarehouse } = require('../common/inventory');

const Sanpham = (sanpham) => {
  this.SanPhamID = sanpham.SanPhamID;
  this.DanhMucID = sanpham.DanhMucID;
  this.TenSanPham = sanpham.TenSanPham;
  this.MoTa = sanpham.MoTa;
  this.GiaBan = sanpham.GiaBan;
  this.DonViTinh = sanpham.DonViTinh;
  this.HinhAnh = sanpham.HinhAnh;
  this.TrangThai = sanpham.TrangThai;
};

Sanpham.getById = (SanPhamID, callback) => {
  withStock('WHERE s.SanPhamID=?', [SanPhamID], callback);
};

Sanpham.getAll = (callback) => {
  withStock('', [], callback);
};

async function withStock(where, params, callback) {
  let connection;
  try {
    connection = await db.promise().getConnection();
    const warehouse = await requireWarehouse(connection);
    const [rows] = await connection.query(`SELECT s.*,COALESCE(t.SoLuongTon,0) AS SoLuongTon
      FROM sanpham s LEFT JOIN TonKho t ON t.SanPhamID=s.SanPhamID AND t.KhoID=?
      ${where} ORDER BY s.SanPhamID`, [warehouse, ...params]);
    callback(null, rows);
  } catch (error) { callback(error); }
  finally { connection?.release(); }
}

Sanpham.insert = (sanpham, callback) => {
  const sqlString = "INSERT INTO `sanpham` SET ?";
  db.query(sqlString, sanpham, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { SanPhamID: res.insertId, ...sanpham });
  });
};

Sanpham.update = (sanpham, SanPhamID, callback) => {
  const sqlString = "UPDATE `sanpham` SET ? WHERE `SanPhamID` = ?";
  db.query(sqlString, [sanpham, SanPhamID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật sanpham thành công" });
  });
};

Sanpham.delete = (SanPhamID, callback) => {
  db.query("DELETE FROM `sanpham` WHERE `SanPhamID` = ?", [SanPhamID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa sanpham thành công" });
  });
};

module.exports = Sanpham;
