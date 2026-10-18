const db = require("../common/db");

const Apdungkhuyenmaidonhang = (apdungkhuyenmaidonhang) => {
  this.ApDungKhuyenMaiID = apdungkhuyenmaidonhang.ApDungKhuyenMaiID;
  this.KhuyenMaiID = apdungkhuyenmaidonhang.KhuyenMaiID;
  this.DonHangID = apdungkhuyenmaidonhang.DonHangID;
  this.SoTienGiam = apdungkhuyenmaidonhang.SoTienGiam;
  this.NgayApDung = apdungkhuyenmaidonhang.NgayApDung;
};

Apdungkhuyenmaidonhang.getById = (ApDungKhuyenMaiID, callback) => {
  const sqlString = "SELECT * FROM `apdungkhuyenmaidonhang` WHERE `ApDungKhuyenMaiID` = ?";
  db.query(sqlString, [ApDungKhuyenMaiID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Apdungkhuyenmaidonhang.getAll = (callback) => {
  const sqlString = "SELECT * FROM `apdungkhuyenmaidonhang`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Apdungkhuyenmaidonhang.insert = (apdungkhuyenmaidonhang, callback) => {
  const sqlString = "INSERT INTO `apdungkhuyenmaidonhang` SET ?";
  db.query(sqlString, apdungkhuyenmaidonhang, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ApDungKhuyenMaiID: res.insertId, ...apdungkhuyenmaidonhang });
  });
};

Apdungkhuyenmaidonhang.update = (apdungkhuyenmaidonhang, ApDungKhuyenMaiID, callback) => {
  const sqlString = "UPDATE `apdungkhuyenmaidonhang` SET ? WHERE `ApDungKhuyenMaiID` = ?";
  db.query(sqlString, [apdungkhuyenmaidonhang, ApDungKhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật apdungkhuyenmaidonhang thành công" });
  });
};

Apdungkhuyenmaidonhang.delete = (ApDungKhuyenMaiID, callback) => {
  db.query("DELETE FROM `apdungkhuyenmaidonhang` WHERE `ApDungKhuyenMaiID` = ?", [ApDungKhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa apdungkhuyenmaidonhang thành công" });
  });
};

module.exports = Apdungkhuyenmaidonhang;
