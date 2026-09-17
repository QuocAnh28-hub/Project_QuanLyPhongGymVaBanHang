const db = require("../common/db");

const Thanhtoan = (thanhtoan) => {
  this.ThanhToanID = thanhtoan.ThanhToanID;
  this.HoiVienID = thanhtoan.HoiVienID;
  this.NhanVienID = thanhtoan.NhanVienID;
  this.SoTien = thanhtoan.SoTien;
  this.PhuongThucThanhToan = thanhtoan.PhuongThucThanhToan;
  this.NgayThanhToan = thanhtoan.NgayThanhToan;
  this.NoiDung = thanhtoan.NoiDung;
  this.TrangThai = thanhtoan.TrangThai;
};

Thanhtoan.getById = (ThanhToanID, callback) => {
  const sqlString = "SELECT * FROM `thanhtoan` WHERE `ThanhToanID` = ?";
  db.query(sqlString, [ThanhToanID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thanhtoan.getAll = (callback) => {
  const sqlString = "SELECT * FROM `thanhtoan`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thanhtoan.insert = (thanhtoan, callback) => {
  const sqlString = "INSERT INTO `thanhtoan` SET ?";
  db.query(sqlString, thanhtoan, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ThanhToanID: res.insertId, ...thanhtoan });
  });
};

Thanhtoan.update = (thanhtoan, ThanhToanID, callback) => {
  const sqlString = "UPDATE `thanhtoan` SET ? WHERE `ThanhToanID` = ?";
  db.query(sqlString, [thanhtoan, ThanhToanID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật thanhtoan thành công" });
  });
};

Thanhtoan.delete = (ThanhToanID, callback) => {
  db.query("DELETE FROM `thanhtoan` WHERE `ThanhToanID` = ?", [ThanhToanID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa thanhtoan thành công" });
  });
};

module.exports = Thanhtoan;
