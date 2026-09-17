const db = require("../common/db");

const Lichpt = (lichpt) => {
  this.LichPTID = lichpt.LichPTID;
  this.PTID = lichpt.PTID;
  this.NgayLam = lichpt.NgayLam;
  this.GioBatDau = lichpt.GioBatDau;
  this.GioKetThuc = lichpt.GioKetThuc;
  this.TrangThai = lichpt.TrangThai;
};

Lichpt.getById = (LichPTID, callback) => {
  const sqlString = "SELECT * FROM `lichpt` WHERE `LichPTID` = ?";
  db.query(sqlString, [LichPTID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Lichpt.getAll = (callback) => {
  const sqlString = "SELECT * FROM `lichpt`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Lichpt.insert = (lichpt, callback) => {
  const sqlString = "INSERT INTO `lichpt` SET ?";
  db.query(sqlString, lichpt, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { LichPTID: res.insertId, ...lichpt });
  });
};

Lichpt.update = (lichpt, LichPTID, callback) => {
  const sqlString = "UPDATE `lichpt` SET ? WHERE `LichPTID` = ?";
  db.query(sqlString, [lichpt, LichPTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật lichpt thành công" });
  });
};

Lichpt.delete = (LichPTID, callback) => {
  db.query("DELETE FROM `lichpt` WHERE `LichPTID` = ?", [LichPTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa lichpt thành công" });
  });
};

module.exports = Lichpt;
