const db = require("../common/db");

const Hoivien = (hoivien) => {
  this.HoiVienID = hoivien.HoiVienID;
  this.TaiKhoanID = hoivien.TaiKhoanID;
  this.HoTen = hoivien.HoTen;
  this.NgaySinh = hoivien.NgaySinh;
  this.GioiTinh = hoivien.GioiTinh;
  this.SoDienThoai = hoivien.SoDienThoai;
  this.Email = hoivien.Email;
  this.DiaChi = hoivien.DiaChi;
  this.AnhDaiDien = hoivien.AnhDaiDien;
  this.NgayDangKy = hoivien.NgayDangKy;
  this.TrangThai = hoivien.TrangThai;
};

Hoivien.getById = (HoiVienID, callback) => {
  const sqlString = "SELECT * FROM `hoivien` WHERE `HoiVienID` = ?";
  db.query(sqlString, [HoiVienID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Hoivien.getAll = (callback) => {
  const sqlString = "SELECT * FROM `hoivien`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Hoivien.insert = (hoivien, callback) => {
  const sqlString = "INSERT INTO `hoivien` SET ?";
  db.query(sqlString, hoivien, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { HoiVienID: res.insertId, ...hoivien });
  });
};

Hoivien.update = (hoivien, HoiVienID, callback) => {
  const sqlString = "UPDATE `hoivien` SET ? WHERE `HoiVienID` = ?";
  db.query(sqlString, [hoivien, HoiVienID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật hoivien thành công" });
  });
};

Hoivien.delete = (HoiVienID, callback) => {
  db.query("DELETE FROM `hoivien` WHERE `HoiVienID` = ?", [HoiVienID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa hoivien thành công" });
  });
};

module.exports = Hoivien;
