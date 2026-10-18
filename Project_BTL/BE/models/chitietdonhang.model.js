const db = require("../common/db");

const Chitietdonhang = (chitietdonhang) => {
  this.ChiTietDonHangID = chitietdonhang.ChiTietDonHangID;
  this.DonHangID = chitietdonhang.DonHangID;
  this.SanPhamID = chitietdonhang.SanPhamID;
  this.SoLuong = chitietdonhang.SoLuong;
  this.DonGia = chitietdonhang.DonGia;
  this.ThanhTien = chitietdonhang.ThanhTien;
};

Chitietdonhang.getById = (ChiTietDonHangID, callback) => {
  const sqlString = "SELECT * FROM `chitietdonhang` WHERE `ChiTietDonHangID` = ?";
  db.query(sqlString, [ChiTietDonHangID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Chitietdonhang.getAll = (callback) => {
  const sqlString = "SELECT * FROM `chitietdonhang`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Chitietdonhang.insert = (chitietdonhang, callback) => {
  const sqlString = "INSERT INTO `chitietdonhang` SET ?";
  db.query(sqlString, chitietdonhang, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ChiTietDonHangID: res.insertId, ...chitietdonhang });
  });
};

Chitietdonhang.update = (chitietdonhang, ChiTietDonHangID, callback) => {
  const sqlString = "UPDATE `chitietdonhang` SET ? WHERE `ChiTietDonHangID` = ?";
  db.query(sqlString, [chitietdonhang, ChiTietDonHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật chitietdonhang thành công" });
  });
};

Chitietdonhang.delete = (ChiTietDonHangID, callback) => {
  db.query("DELETE FROM `chitietdonhang` WHERE `ChiTietDonHangID` = ?", [ChiTietDonHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa chitietdonhang thành công" });
  });
};

module.exports = Chitietdonhang;
