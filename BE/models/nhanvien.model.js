const db = require("../common/db");

const Nhanvien = (nhanvien) => {
  this.NhanVienID = nhanvien.NhanVienID;
  this.TaiKhoanID = nhanvien.TaiKhoanID;
  this.HoTen = nhanvien.HoTen;
  this.NgaySinh = nhanvien.NgaySinh;
  this.GioiTinh = nhanvien.GioiTinh;
  this.SoDienThoai = nhanvien.SoDienThoai;
  this.Email = nhanvien.Email;
  this.ChucVu = nhanvien.ChucVu;
  this.NgayVaoLam = nhanvien.NgayVaoLam;
  this.TrangThai = nhanvien.TrangThai;
};

Nhanvien.getById = (NhanVienID, callback) => {
  const sqlString = "SELECT * FROM `nhanvien` WHERE `NhanVienID` = ?";
  db.query(sqlString, [NhanVienID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Nhanvien.getAll = (callback) => {
  const sqlString = "SELECT * FROM `nhanvien`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Nhanvien.insert = (nhanvien, callback) => {
  const sqlString = "INSERT INTO `nhanvien` SET ?";
  db.query(sqlString, nhanvien, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { NhanVienID: res.insertId, ...nhanvien });
  });
};

Nhanvien.update = (nhanvien, NhanVienID, callback) => {
  const sqlString = "UPDATE `nhanvien` SET ? WHERE `NhanVienID` = ?";
  db.query(sqlString, [nhanvien, NhanVienID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật nhanvien thành công" });
  });
};

Nhanvien.delete = (NhanVienID, callback) => {
  db.query("DELETE FROM `nhanvien` WHERE `NhanVienID` = ?", [NhanVienID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa nhanvien thành công" });
  });
};

module.exports = Nhanvien;
