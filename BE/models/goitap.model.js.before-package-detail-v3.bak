const db = require("../common/db");

const Goitap = (goitap) => {
  this.GoiTapID = goitap.GoiTapID;
  this.TenGoi = goitap.TenGoi;
  this.MoTa = goitap.MoTa;
  this.ThoiHan = goitap.ThoiHan;
  this.Gia = goitap.Gia;
  this.TrangThai = goitap.TrangThai;
  this.NgayTao = goitap.NgayTao;
};

Goitap.getById = (GoiTapID, callback) => {
  const sqlString = "SELECT * FROM `goitap` WHERE `GoiTapID` = ?";
  db.query(sqlString, [GoiTapID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Goitap.getAll = (callback) => {
  const sqlString = "SELECT * FROM `goitap`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Goitap.getActive = (callback) => {
  const sqlString = `SELECT GoiTapID, TenGoi, MoTa, ThoiHan, Gia, TrangThai, NgayTao
    FROM \`goitap\`
    WHERE TrangThai = 'ACTIVE'
    ORDER BY Gia ASC, GoiTapID ASC`;
  db.query(sqlString, callback);
};

Goitap.getActiveById = (GoiTapID, callback) => {
  const sqlString = `SELECT GoiTapID, TenGoi, MoTa, ThoiHan, Gia, TrangThai, NgayTao
    FROM \`goitap\`
    WHERE GoiTapID = ? AND TrangThai = 'ACTIVE'
    LIMIT 1`;
  db.query(sqlString, [GoiTapID], callback);
};

Goitap.insert = (goitap, callback) => {
  const sqlString = "INSERT INTO `goitap` SET ?";
  db.query(sqlString, goitap, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { GoiTapID: res.insertId, ...goitap });
  });
};

Goitap.update = (goitap, GoiTapID, callback) => {
  const sqlString = "UPDATE `goitap` SET ? WHERE `GoiTapID` = ?";
  db.query(sqlString, [goitap, GoiTapID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật goitap thành công" });
  });
};

Goitap.delete = (GoiTapID, callback) => {
  db.query("DELETE FROM `goitap` WHERE `GoiTapID` = ?", [GoiTapID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa goitap thành công" });
  });
};

module.exports = Goitap;
