const db = require("../common/db");

const Donhang = (donhang) => {
  this.DonHangID = donhang.DonHangID;
  this.HoiVienID = donhang.HoiVienID;
  this.NgayDat = donhang.NgayDat;
  this.TongTien = donhang.TongTien;
  this.TrangThai = donhang.TrangThai;
  this.DiaChiGiaoHang = donhang.DiaChiGiaoHang;
  this.GhiChu = donhang.GhiChu;
};

Donhang.getById = (DonHangID, callback) => {
  const sqlString = "SELECT * FROM `donhang` WHERE `DonHangID` = ?";
  db.query(sqlString, [DonHangID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Donhang.getAll = (callback) => {
  const sqlString = "SELECT * FROM `donhang`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Donhang.insert = (donhang, callback) => {
  const sqlString = "INSERT INTO `donhang` SET ?";
  db.query(sqlString, donhang, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { DonHangID: res.insertId, ...donhang });
  });
};

Donhang.update = (donhang, DonHangID, callback) => {
  const sqlString = "UPDATE `donhang` SET ? WHERE `DonHangID` = ?";
  db.query(sqlString, [donhang, DonHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật donhang thành công" });
  });
};

Donhang.delete = (DonHangID, callback) => {
  db.query("DELETE FROM `donhang` WHERE `DonHangID` = ?", [DonHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa donhang thành công" });
  });
};

module.exports = Donhang;
