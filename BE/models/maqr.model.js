const db = require("../common/db");

const Maqr = (maqr) => {
  this.MaQRID = maqr.MaQRID;
  this.MaCode = maqr.MaCode;
  this.NgayTao = maqr.NgayTao;
  this.NgayHetHan = maqr.NgayHetHan;
  this.TrangThai = maqr.TrangThai;
};

Maqr.getById = (MaQRID, callback) => {
  const sqlString = "SELECT * FROM `maqr` WHERE `MaQRID` = ?";
  db.query(sqlString, [MaQRID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Maqr.getAll = (callback) => {
  const sqlString = "SELECT * FROM `maqr`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Maqr.insert = (maqr, callback) => {
  const sqlString = "INSERT INTO `maqr` SET ?";
  db.query(sqlString, maqr, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { MaQRID: res.insertId, ...maqr });
  });
};

Maqr.update = (maqr, MaQRID, callback) => {
  const sqlString = "UPDATE `maqr` SET ? WHERE `MaQRID` = ?";
  db.query(sqlString, [maqr, MaQRID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật maqr thành công" });
  });
};

Maqr.delete = (MaQRID, callback) => {
  db.query("DELETE FROM `maqr` WHERE `MaQRID` = ?", [MaQRID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa maqr thành công" });
  });
};

module.exports = Maqr;
