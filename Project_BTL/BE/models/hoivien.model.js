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

Hoivien.getProfileByAccount = (accountId, callback) => {
  db.query(
    `SELECT tk.TaiKhoanID, hv.HoiVienID, tk.Email AS EmailDangNhap,
       hv.HoTen, DATE_FORMAT(hv.NgaySinh, '%Y-%m-%d') AS NgaySinh,
       hv.GioiTinh, hv.SoDienThoai, hv.Email, hv.DiaChi, hv.AnhDaiDien,
       hv.ChieuCao, hv.CanNang, hv.MucTieuTheHinh, hv.TrangThai
     FROM taikhoan tk INNER JOIN hoivien hv ON hv.TaiKhoanID = tk.TaiKhoanID
     WHERE tk.TaiKhoanID = ? LIMIT 1`,
    [accountId],
    (err, rows) => callback(err, rows?.[0] ?? null),
  );
};

Hoivien.updateProfileByAccount = (accountId, fields, callback) => {
  db.query("UPDATE hoivien SET ? WHERE TaiKhoanID = ?", [fields, accountId], (err, result) => {
    if (err) return callback(err);
    if (!result.affectedRows) return callback(null, null);
    Hoivien.getProfileByAccount(accountId, callback);
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
