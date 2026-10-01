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

Kho.getStock = (callback) => db.query(`SELECT k.KhoID,k.TenKho,s.SanPhamID,s.TenSanPham,s.DonViTinh,
  COALESCE(t.SoLuongTon,0) AS SoLuongTon,t.NgayCapNhat
  FROM kho k CROSS JOIN sanpham s
  LEFT JOIN TonKho t ON t.KhoID=k.KhoID AND t.SanPhamID=s.SanPhamID
  ORDER BY k.KhoID,s.SanPhamID`, callback);

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
