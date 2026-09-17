const db = require("../common/db");

const Phieunhap = (phieunhap) => {
  this.PhieuNhapID = phieunhap.PhieuNhapID;
  this.KhoID = phieunhap.KhoID;
  this.NhanVienID = phieunhap.NhanVienID;
  this.NgayNhap = phieunhap.NgayNhap;
  this.TongTien = phieunhap.TongTien;
  this.GhiChu = phieunhap.GhiChu;
  this.TrangThai = phieunhap.TrangThai;
};

Phieunhap.getById = (PhieuNhapID, callback) => {
  const sqlString = "SELECT * FROM `phieunhap` WHERE `PhieuNhapID` = ?";
  db.query(sqlString, [PhieuNhapID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Phieunhap.getAll = (callback) => {
  const sqlString = "SELECT * FROM `phieunhap`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Phieunhap.insert = (phieunhap, callback) => {
  const sqlString = "INSERT INTO `phieunhap` SET ?";
  db.query(sqlString, phieunhap, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { PhieuNhapID: res.insertId, ...phieunhap });
  });
};

Phieunhap.update = (phieunhap, PhieuNhapID, callback) => {
  const sqlString = "UPDATE `phieunhap` SET ? WHERE `PhieuNhapID` = ?";
  db.query(sqlString, [phieunhap, PhieuNhapID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật phieunhap thành công" });
  });
};

Phieunhap.delete = (PhieuNhapID, callback) => {
  db.query("DELETE FROM `phieunhap` WHERE `PhieuNhapID` = ?", [PhieuNhapID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa phieunhap thành công" });
  });
};

module.exports = Phieunhap;
