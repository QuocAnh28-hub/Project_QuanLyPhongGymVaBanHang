const db = require("../common/db");

const Pt = (pt) => {
  this.PTID = pt.PTID;
  this.HoTen = pt.HoTen;
  this.NgaySinh = pt.NgaySinh;
  this.GioiTinh = pt.GioiTinh;
  this.SoDienThoai = pt.SoDienThoai;
  this.Email = pt.Email;
  this.ChuyenMon = pt.ChuyenMon;
  this.KinhNghiem = pt.KinhNghiem;
  this.GiaThue = pt.GiaThue;
  this.AnhDaiDien = pt.AnhDaiDien;
  this.TrangThai = pt.TrangThai;
};

Pt.getById = (PTID, callback) => {
  const sqlString = "SELECT * FROM `pt` WHERE `PTID` = ?";
  db.query(sqlString, [PTID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Pt.getAll = (callback) => {
  const sqlString = "SELECT * FROM `pt`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Pt.getActive = (callback) => {
  db.query(
    "SELECT * FROM pt WHERE TrangThai = 'ACTIVE' ORDER BY PTID DESC",
    callback,
  );
};

Pt.getActiveById = (PTID, callback) => {
  db.query(
    "SELECT * FROM pt WHERE PTID = ? AND TrangThai = 'ACTIVE' LIMIT 1",
    [PTID],
    (err, result) => callback(err, result?.[0] ?? null),
  );
};

Pt.insert = (pt, callback) => {
  const sqlString = "INSERT INTO `pt` SET ?";
  db.query(sqlString, pt, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { PTID: res.insertId, ...pt });
  });
};

Pt.update = (pt, PTID, callback) => {
  const sqlString = "UPDATE `pt` SET ? WHERE `PTID` = ?";
  db.query(sqlString, [pt, PTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật pt thành công" });
  });
};

Pt.delete = (PTID, callback) => {
  db.query("DELETE FROM `pt` WHERE `PTID` = ?", [PTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa pt thành công" });
  });
};

module.exports = Pt;
