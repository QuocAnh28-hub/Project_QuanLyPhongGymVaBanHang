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

Maqr.getAdmin = (callback) => {
  db.query(`SELECT q.MaQRID,q.MaCode,
    DATE_FORMAT(q.NgayTao,'%Y-%m-%d %H:%i:%s') NgayTao,
    DATE_FORMAT(q.NgayHetHan,'%Y-%m-%d %H:%i:%s') NgayHetHan,
    CASE WHEN q.NgayHetHan < NOW() THEN 'EXPIRED' ELSE q.TrangThai END TrangThai,
    (SELECT ci.CheckInID FROM checkin ci WHERE ci.MaQRID=q.MaQRID ORDER BY ci.CheckInID DESC LIMIT 1) CheckInID
    FROM maqr q
    ORDER BY q.MaQRID DESC`, callback);
};

Maqr.getMembers = (ids, callback) => {
  if (!ids.length) return callback(null, []);
  db.query("SELECT HoiVienID,HoTen,SoDienThoai FROM hoivien WHERE HoiVienID IN (?)", [ids], callback);
};

Maqr.cleanupExpired = (callback) => {
  db.query("DELETE FROM maqr WHERE TrangThai='EXPIRED' OR NgayHetHan<=NOW()", (error, result) => {
    if (error) return callback(error);
    callback(null, { deleted: result.affectedRows });
  });
};

Maqr.revoke = (id, callback) => {
  db.query("UPDATE maqr SET TrangThai='INACTIVE' WHERE MaQRID=? AND TrangThai='ACTIVE' AND (NgayHetHan IS NULL OR NgayHetHan>=NOW())", [id], (error, result) => {
    if (error) return callback(error);
    if (result.affectedRows) return callback(null, { MaQRID: id, TrangThai: 'INACTIVE' });
    db.query("SELECT MaQRID FROM maqr WHERE MaQRID=?", [id], (readError, rows) => {
      if (readError) return callback(readError);
      const failure = new Error(rows.length ? 'Chỉ QR ACTIVE còn hạn mới được thu hồi' : 'Không tìm thấy QR');
      failure.status = rows.length ? 409 : 404;
      callback(failure);
    });
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
