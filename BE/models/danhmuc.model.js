const db = require("../common/db");

const Danhmuc = (danhmuc) => {
  this.DanhMucID = danhmuc.DanhMucID;
  this.TenDanhMuc = danhmuc.TenDanhMuc;
  this.MoTa = danhmuc.MoTa;
  this.TrangThai = danhmuc.TrangThai;
};

Danhmuc.getById = (DanhMucID, callback) => {
  const sqlString = "SELECT * FROM `danhmuc` WHERE `DanhMucID` = ?";
  db.query(sqlString, [DanhMucID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Danhmuc.getAll = (callback) => {
  const sqlString = "SELECT * FROM `danhmuc`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Danhmuc.insert = (danhmuc, callback) => {
  const sqlString = "INSERT INTO `danhmuc` SET ?";
  db.query(sqlString, danhmuc, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { DanhMucID: res.insertId, ...danhmuc });
  });
};

Danhmuc.update = (danhmuc, DanhMucID, callback) => {
  const sqlString = "UPDATE `danhmuc` SET ? WHERE `DanhMucID` = ?";
  db.query(sqlString, [danhmuc, DanhMucID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật danhmuc thành công" });
  });
};

Danhmuc.delete = (DanhMucID, callback) => {
  db.query("DELETE FROM `danhmuc` WHERE `DanhMucID` = ?", [DanhMucID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa danhmuc thành công" });
  });
};

module.exports = Danhmuc;
