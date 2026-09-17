const db = require("../common/db");

const Giohang = (giohang) => {
  this.GioHangID = giohang.GioHangID;
  this.HoiVienID = giohang.HoiVienID;
  this.NgayTao = giohang.NgayTao;
  this.TrangThai = giohang.TrangThai;
};

Giohang.getById = (GioHangID, callback) => {
  const sqlString = "SELECT * FROM `giohang` WHERE `GioHangID` = ?";
  db.query(sqlString, [GioHangID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Giohang.getAll = (callback) => {
  const sqlString = "SELECT * FROM `giohang`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Giohang.insert = (giohang, callback) => {
  const sqlString = "INSERT INTO `giohang` SET ?";
  db.query(sqlString, giohang, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { GioHangID: res.insertId, ...giohang });
  });
};

Giohang.update = (giohang, GioHangID, callback) => {
  const sqlString = "UPDATE `giohang` SET ? WHERE `GioHangID` = ?";
  db.query(sqlString, [giohang, GioHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật giohang thành công" });
  });
};

Giohang.delete = (GioHangID, callback) => {
  db.query("DELETE FROM `giohang` WHERE `GioHangID` = ?", [GioHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa giohang thành công" });
  });
};

module.exports = Giohang;
