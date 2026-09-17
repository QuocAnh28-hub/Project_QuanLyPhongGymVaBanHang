const db = require("../common/db");

const Apdungkhuyenmaigoitap = (apdungkhuyenmaigoitap) => {
  this.ApDungKhuyenMaiID = apdungkhuyenmaigoitap.ApDungKhuyenMaiID;
  this.KhuyenMaiID = apdungkhuyenmaigoitap.KhuyenMaiID;
  this.DangKyID = apdungkhuyenmaigoitap.DangKyID;
  this.SoTienGiam = apdungkhuyenmaigoitap.SoTienGiam;
  this.NgayApDung = apdungkhuyenmaigoitap.NgayApDung;
};

Apdungkhuyenmaigoitap.getById = (ApDungKhuyenMaiID, callback) => {
  const sqlString = "SELECT * FROM `apdungkhuyenmaigoitap` WHERE `ApDungKhuyenMaiID` = ?";
  db.query(sqlString, [ApDungKhuyenMaiID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Apdungkhuyenmaigoitap.getAll = (callback) => {
  const sqlString = "SELECT * FROM `apdungkhuyenmaigoitap`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Apdungkhuyenmaigoitap.insert = (apdungkhuyenmaigoitap, callback) => {
  const sqlString = "INSERT INTO `apdungkhuyenmaigoitap` SET ?";
  db.query(sqlString, apdungkhuyenmaigoitap, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ApDungKhuyenMaiID: res.insertId, ...apdungkhuyenmaigoitap });
  });
};

Apdungkhuyenmaigoitap.update = (apdungkhuyenmaigoitap, ApDungKhuyenMaiID, callback) => {
  const sqlString = "UPDATE `apdungkhuyenmaigoitap` SET ? WHERE `ApDungKhuyenMaiID` = ?";
  db.query(sqlString, [apdungkhuyenmaigoitap, ApDungKhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật apdungkhuyenmaigoitap thành công" });
  });
};

Apdungkhuyenmaigoitap.delete = (ApDungKhuyenMaiID, callback) => {
  db.query("DELETE FROM `apdungkhuyenmaigoitap` WHERE `ApDungKhuyenMaiID` = ?", [ApDungKhuyenMaiID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa apdungkhuyenmaigoitap thành công" });
  });
};

module.exports = Apdungkhuyenmaigoitap;
