const db = require("../common/db");

const Kho = (kho) => {
  this.KhoID = kho.KhoID;
  this.TenKho = kho.TenKho;
  this.DiaChi = kho.DiaChi;
  this.MoTa = kho.MoTa;
  this.TrangThai = kho.TrangThai;
};

Kho.getById = (KhoID, callback) => {
  const sqlString = "SELECT * FROM `kho` WHERE `KhoID` = ?";
  db.query(sqlString, [KhoID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Kho.getAll = (callback) => {
  const sqlString = "SELECT * FROM `kho`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Kho.insert = (kho, callback) => {
  const sqlString = "INSERT INTO `kho` SET ?";
  db.query(sqlString, kho, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { KhoID: res.insertId, ...kho });
  });
};

Kho.update = (kho, KhoID, callback) => {
  const sqlString = "UPDATE `kho` SET ? WHERE `KhoID` = ?";
  db.query(sqlString, [kho, KhoID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật kho thành công" });
  });
};

Kho.delete = (KhoID, callback) => {
  db.query("DELETE FROM `kho` WHERE `KhoID` = ?", [KhoID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa kho thành công" });
  });
};

module.exports = Kho;
