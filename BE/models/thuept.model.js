const db = require("../common/db");

const Thuept = (thuept) => {
  this.ThuePTID = thuept.ThuePTID;
  this.HoiVienID = thuept.HoiVienID;
  this.PTID = thuept.PTID;
  this.LichPTID = thuept.LichPTID;
  this.NgayDat = thuept.NgayDat;
  this.GiaThue = thuept.GiaThue;
  this.TrangThai = thuept.TrangThai;
  this.GhiChu = thuept.GhiChu;
};

Thuept.getById = (ThuePTID, callback) => {
  const sqlString = "SELECT * FROM `thuept` WHERE `ThuePTID` = ?";
  db.query(sqlString, [ThuePTID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thuept.getAll = (callback) => {
  const sqlString = "SELECT * FROM `thuept`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thuept.insert = (thuept, callback) => {
  const sqlString = "INSERT INTO `thuept` SET ?";
  db.query(sqlString, thuept, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ThuePTID: res.insertId, ...thuept });
  });
};

Thuept.update = (thuept, ThuePTID, callback) => {
  const sqlString = "UPDATE `thuept` SET ? WHERE `ThuePTID` = ?";
  db.query(sqlString, [thuept, ThuePTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật thuept thành công" });
  });
};

Thuept.delete = (ThuePTID, callback) => {
  db.query("DELETE FROM `thuept` WHERE `ThuePTID` = ?", [ThuePTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa thuept thành công" });
  });
};

module.exports = Thuept;
