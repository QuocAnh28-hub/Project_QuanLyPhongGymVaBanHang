const db = require("../common/db");

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
  const sqlString = "SELECT * FROM `sanpham` WHERE `SanPhamID` = ?";
  db.query(sqlString, [SanPhamID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Sanpham.getAll = (callback) => {
  const sqlString = "SELECT * FROM `sanpham`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

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
