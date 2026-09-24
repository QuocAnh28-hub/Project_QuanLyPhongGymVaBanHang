const db = require("../common/db");

const Taikhoan = (taikhoan) => {
  this.TaiKhoanID = taikhoan.TaiKhoanID;
  this.Email = taikhoan.Email;
  this.MatKhau = taikhoan.MatKhau;
  this.VaiTro = taikhoan.VaiTro;
  this.TrangThai = taikhoan.TrangThai;
  this.NgayTao = taikhoan.NgayTao;
};

Taikhoan.getById = (TaiKhoanID, callback) => {
  const sqlString = "SELECT * FROM `taikhoan` WHERE `TaiKhoanID` = ?";
  db.query(sqlString, [TaiKhoanID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Taikhoan.getAll = (callback) => {
  const sqlString = "SELECT * FROM `taikhoan`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Taikhoan.changePassword = (id, currentPassword, newPassword, callback) => {
  db.query("UPDATE taikhoan SET MatKhau = ? WHERE TaiKhoanID = ? AND TrangThai = 'ACTIVE' AND MatKhau = ?", [newPassword, id, currentPassword], (error, result) => {
    if (error) return callback(error);
    callback(null, result.affectedRows === 1);
  });
};

Taikhoan.insert = (taikhoan, callback) => {
  const sqlString = "INSERT INTO `taikhoan` SET ?";
  db.query(sqlString, taikhoan, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { TaiKhoanID: res.insertId, ...taikhoan });
  });
};

Taikhoan.update = (taikhoan, TaiKhoanID, callback) => {
  const sqlString = "UPDATE `taikhoan` SET ? WHERE `TaiKhoanID` = ?";
  db.query(sqlString, [taikhoan, TaiKhoanID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật taikhoan thành công" });
  });
};

Taikhoan.delete = (TaiKhoanID, callback) => {
  db.query("DELETE FROM `taikhoan` WHERE `TaiKhoanID` = ?", [TaiKhoanID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa taikhoan thành công" });
  });
};

module.exports = Taikhoan;
