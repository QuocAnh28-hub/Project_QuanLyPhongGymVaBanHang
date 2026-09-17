const db = require("../common/db");

const Hoadon = (hoadon) => {
  this.HoaDonID = hoadon.HoaDonID;
  this.ThanhToanID = hoadon.ThanhToanID;
  this.NhanVienID = hoadon.NhanVienID;
  this.NgayLap = hoadon.NgayLap;
  this.TongTien = hoadon.TongTien;
  this.TrangThai = hoadon.TrangThai;
};

Hoadon.getById = (HoaDonID, callback) => {
  const sqlString = "SELECT * FROM `hoadon` WHERE `HoaDonID` = ?";
  db.query(sqlString, [HoaDonID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Hoadon.getAll = (callback) => {
  const sqlString = "SELECT * FROM `hoadon`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Hoadon.insert = (hoadon, callback) => {
  const sqlString = "INSERT INTO `hoadon` SET ?";
  db.query(sqlString, hoadon, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { HoaDonID: res.insertId, ...hoadon });
  });
};

Hoadon.update = (hoadon, HoaDonID, callback) => {
  const sqlString = "UPDATE `hoadon` SET ? WHERE `HoaDonID` = ?";
  db.query(sqlString, [hoadon, HoaDonID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật hoadon thành công" });
  });
};

Hoadon.delete = (HoaDonID, callback) => {
  db.query("DELETE FROM `hoadon` WHERE `HoaDonID` = ?", [HoaDonID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa hoadon thành công" });
  });
};

module.exports = Hoadon;
