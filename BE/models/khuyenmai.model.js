const db = require("../common/db");

const Khuyenmai = (khuyenmai) => {
  this.KhuyenMaiID = khuyenmai.KhuyenMaiID;
  this.MaKhuyenMai = khuyenmai.MaKhuyenMai;
  this.TenKhuyenMai = khuyenmai.TenKhuyenMai;
  this.PhanTramGiam = khuyenmai.PhanTramGiam;
  this.SoTienGiam = khuyenmai.SoTienGiam;
  this.NgayBatDau = khuyenmai.NgayBatDau;
  this.NgayKetThuc = khuyenmai.NgayKetThuc;
  this.DieuKien = khuyenmai.DieuKien;
  this.TrangThai = khuyenmai.TrangThai;
};

Khuyenmai.getById = (KhuyenMaiID, callback) => {
  const sqlString = "SELECT * FROM `khuyenmai` WHERE `KhuyenMaiID` = ?";
  db.query(sqlString, [KhuyenMaiID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Khuyenmai.getAll = (callback) => {
  const sqlString = "SELECT * FROM `khuyenmai`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Khuyenmai.insert = (khuyenmai, callback) => {
  const sqlString = "INSERT INTO `khuyenmai` SET ?";
  db.query(sqlString, khuyenmai, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { KhuyenMaiID: res.insertId, ...khuyenmai });
  });
};

Khuyenmai.update = (khuyenmai, KhuyenMaiID, callback) => {
  const sqlString = "UPDATE `khuyenmai` SET ? WHERE `KhuyenMaiID` = ?";
  db.query(sqlString, [khuyenmai, KhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật khuyenmai thành công" });
  });
};

Khuyenmai.delete = (KhuyenMaiID, callback) => {
  db.query("DELETE FROM `khuyenmai` WHERE `KhuyenMaiID` = ?", [KhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa khuyenmai thành công" });
  });
};

module.exports = Khuyenmai;
