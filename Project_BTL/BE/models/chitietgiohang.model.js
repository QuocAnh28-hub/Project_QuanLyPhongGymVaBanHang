const db = require("../common/db");

const Chitietgiohang = (chitietgiohang) => {
  this.ChiTietGioHangID = chitietgiohang.ChiTietGioHangID;
  this.GioHangID = chitietgiohang.GioHangID;
  this.SanPhamID = chitietgiohang.SanPhamID;
  this.SoLuong = chitietgiohang.SoLuong;
};

Chitietgiohang.getById = (ChiTietGioHangID, callback) => {
  const sqlString = "SELECT * FROM `chitietgiohang` WHERE `ChiTietGioHangID` = ?";
  db.query(sqlString, [ChiTietGioHangID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Chitietgiohang.getAll = (callback) => {
  const sqlString = "SELECT * FROM `chitietgiohang`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Chitietgiohang.insert = (chitietgiohang, callback) => {
  const sqlString = "INSERT INTO `chitietgiohang` SET ?";
  db.query(sqlString, chitietgiohang, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ChiTietGioHangID: res.insertId, ...chitietgiohang });
  });
};

Chitietgiohang.update = (chitietgiohang, ChiTietGioHangID, callback) => {
  const sqlString = "UPDATE `chitietgiohang` SET ? WHERE `ChiTietGioHangID` = ?";
  db.query(sqlString, [chitietgiohang, ChiTietGioHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật chitietgiohang thành công" });
  });
};

Chitietgiohang.delete = (ChiTietGioHangID, callback) => {
  db.query("DELETE FROM `chitietgiohang` WHERE `ChiTietGioHangID` = ?", [ChiTietGioHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa chitietgiohang thành công" });
  });
};

module.exports = Chitietgiohang;
