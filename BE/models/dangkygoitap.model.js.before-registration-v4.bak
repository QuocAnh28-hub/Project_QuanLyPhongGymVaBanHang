const db = require("../common/db");

const Dangkygoitap = (dangkygoitap) => {
  this.DangKyID = dangkygoitap.DangKyID;
  this.HoiVienID = dangkygoitap.HoiVienID;
  this.GoiTapID = dangkygoitap.GoiTapID;
  this.NgayDangKy = dangkygoitap.NgayDangKy;
  this.NgayBatDau = dangkygoitap.NgayBatDau;
  this.NgayKetThuc = dangkygoitap.NgayKetThuc;
  this.GiaThanhToan = dangkygoitap.GiaThanhToan;
  this.TrangThai = dangkygoitap.TrangThai;
};

Dangkygoitap.getById = (DangKyID, callback) => {
  const sqlString = "SELECT * FROM `dangkygoitap` WHERE `DangKyID` = ?";
  db.query(sqlString, [DangKyID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Dangkygoitap.getAll = (callback) => {
  const sqlString = "SELECT * FROM `dangkygoitap`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Dangkygoitap.insert = (dangkygoitap, callback) => {
  const sqlString = "INSERT INTO `dangkygoitap` SET ?";
  db.query(sqlString, dangkygoitap, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { DangKyID: res.insertId, ...dangkygoitap });
  });
};

Dangkygoitap.update = (dangkygoitap, DangKyID, callback) => {
  const sqlString = "UPDATE `dangkygoitap` SET ? WHERE `DangKyID` = ?";
  db.query(sqlString, [dangkygoitap, DangKyID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật dangkygoitap thành công" });
  });
};

Dangkygoitap.delete = (DangKyID, callback) => {
  db.query("DELETE FROM `dangkygoitap` WHERE `DangKyID` = ?", [DangKyID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa dangkygoitap thành công" });
  });
};

module.exports = Dangkygoitap;
