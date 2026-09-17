const db = require("../common/db");

const Checkin = (checkin) => {
  this.CheckInID = checkin.CheckInID;
  this.HoiVienID = checkin.HoiVienID;
  this.MaQRID = checkin.MaQRID;
  this.ThoiGianCheckIn = checkin.ThoiGianCheckIn;
  this.ThoiGianCheckOut = checkin.ThoiGianCheckOut;
  this.TrangThai = checkin.TrangThai;
};

Checkin.getById = (CheckInID, callback) => {
  const sqlString = "SELECT * FROM `checkin` WHERE `CheckInID` = ?";
  db.query(sqlString, [CheckInID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Checkin.getAll = (callback) => {
  const sqlString = "SELECT * FROM `checkin`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Checkin.insert = (checkin, callback) => {
  const sqlString = "INSERT INTO `checkin` SET ?";
  db.query(sqlString, checkin, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { CheckInID: res.insertId, ...checkin });
  });
};

Checkin.update = (checkin, CheckInID, callback) => {
  const sqlString = "UPDATE `checkin` SET ? WHERE `CheckInID` = ?";
  db.query(sqlString, [checkin, CheckInID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật checkin thành công" });
  });
};

Checkin.delete = (CheckInID, callback) => {
  db.query("DELETE FROM `checkin` WHERE `CheckInID` = ?", [CheckInID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa checkin thành công" });
  });
};

module.exports = Checkin;
