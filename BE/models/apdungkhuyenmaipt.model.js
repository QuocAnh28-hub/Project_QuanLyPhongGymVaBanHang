const db = require("../common/db");

const Apdungkhuyenmaipt = (apdungkhuyenmaipt) => {
  this.ApDungKhuyenMaiID = apdungkhuyenmaipt.ApDungKhuyenMaiID;
  this.KhuyenMaiID = apdungkhuyenmaipt.KhuyenMaiID;
  this.ThuePTID = apdungkhuyenmaipt.ThuePTID;
  this.SoTienGiam = apdungkhuyenmaipt.SoTienGiam;
  this.NgayApDung = apdungkhuyenmaipt.NgayApDung;
};

Apdungkhuyenmaipt.getById = (ApDungKhuyenMaiID, callback) => {
  const sqlString = "SELECT * FROM `apdungkhuyenmaipt` WHERE `ApDungKhuyenMaiID` = ?";
  db.query(sqlString, [ApDungKhuyenMaiID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Apdungkhuyenmaipt.getAll = (callback) => {
  const sqlString = "SELECT * FROM `apdungkhuyenmaipt`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Apdungkhuyenmaipt.insert = (apdungkhuyenmaipt, callback) => {
  const sqlString = "INSERT INTO `apdungkhuyenmaipt` SET ?";
  db.query(sqlString, apdungkhuyenmaipt, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ApDungKhuyenMaiID: res.insertId, ...apdungkhuyenmaipt });
  });
};

Apdungkhuyenmaipt.update = (apdungkhuyenmaipt, ApDungKhuyenMaiID, callback) => {
  const sqlString = "UPDATE `apdungkhuyenmaipt` SET ? WHERE `ApDungKhuyenMaiID` = ?";
  db.query(sqlString, [apdungkhuyenmaipt, ApDungKhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật apdungkhuyenmaipt thành công" });
  });
};

Apdungkhuyenmaipt.delete = (ApDungKhuyenMaiID, callback) => {
  db.query("DELETE FROM `apdungkhuyenmaipt` WHERE `ApDungKhuyenMaiID` = ?", [ApDungKhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa apdungkhuyenmaipt thành công" });
  });
};

module.exports = Apdungkhuyenmaipt;
