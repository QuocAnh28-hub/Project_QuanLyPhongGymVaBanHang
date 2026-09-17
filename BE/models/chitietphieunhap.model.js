const db = require("../common/db");

const Chitietphieunhap = (chitietphieunhap) => {
  this.ChiTietPhieuNhapID = chitietphieunhap.ChiTietPhieuNhapID;
  this.PhieuNhapID = chitietphieunhap.PhieuNhapID;
  this.SanPhamID = chitietphieunhap.SanPhamID;
  this.SoLuong = chitietphieunhap.SoLuong;
  this.DonGia = chitietphieunhap.DonGia;
  this.ThanhTien = chitietphieunhap.ThanhTien;
};

Chitietphieunhap.getById = (ChiTietPhieuNhapID, callback) => {
  const sqlString = "SELECT * FROM `chitietphieunhap` WHERE `ChiTietPhieuNhapID` = ?";
  db.query(sqlString, [ChiTietPhieuNhapID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Chitietphieunhap.getAll = (callback) => {
  const sqlString = "SELECT * FROM `chitietphieunhap`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Chitietphieunhap.insert = (chitietphieunhap, callback) => {
  const sqlString = "INSERT INTO `chitietphieunhap` SET ?";
  db.query(sqlString, chitietphieunhap, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ChiTietPhieuNhapID: res.insertId, ...chitietphieunhap });
  });
};

Chitietphieunhap.update = (chitietphieunhap, ChiTietPhieuNhapID, callback) => {
  const sqlString = "UPDATE `chitietphieunhap` SET ? WHERE `ChiTietPhieuNhapID` = ?";
  db.query(sqlString, [chitietphieunhap, ChiTietPhieuNhapID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật chitietphieunhap thành công" });
  });
};

Chitietphieunhap.delete = (ChiTietPhieuNhapID, callback) => {
  db.query("DELETE FROM `chitietphieunhap` WHERE `ChiTietPhieuNhapID` = ?", [ChiTietPhieuNhapID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa chitietphieunhap thành công" });
  });
};

module.exports = Chitietphieunhap;
