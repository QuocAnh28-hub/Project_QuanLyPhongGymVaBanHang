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
  const sqlString = `SELECT g.GoiTapID, g.TenGoi, g.MoTa, g.ThoiHan, g.Gia,
    g.TrangThai, g.NgayTao, th.GoiTapThoiHanID, th.SoThang, th.ThangTang,
    th.GiaGoc, th.GiaBan, th.TrangThai AS TrangThaiThoiHan,
    COUNT(DISTINCT CASE WHEN dk.TrangThai = 'ACTIVE' AND dk.NgayKetThuc >= CURDATE() THEN dk.HoiVienID END) AS SoHoiVienActive,
    GROUP_CONCAT(DISTINCT CASE WHEN q.TrangThai = 'ACTIVE' THEN q.TenQuyenLoi END ORDER BY q.ThuTu SEPARATOR '||') AS QuyenLoi
    FROM goitap g
    LEFT JOIN GoiTapThoiHan th ON th.GoiTapID = g.GoiTapID
      AND th.GoiTapThoiHanID = (SELECT MIN(t2.GoiTapThoiHanID) FROM GoiTapThoiHan t2 WHERE t2.GoiTapID = g.GoiTapID)
    LEFT JOIN QuyenLoiGoiTap q ON q.GoiTapID = g.GoiTapID
    LEFT JOIN dangkygoitap dk ON dk.GoiTapID = g.GoiTapID
    GROUP BY g.GoiTapID, th.GoiTapThoiHanID
    ORDER BY g.GoiTapID DESC`;
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Goitap.saveAdmin = (id, data, callback) => {
  db.getConnection(async (error, connection) => {
    if (error) return callback(error);
    const q = connection.promise();
    try {
      await q.beginTransaction();
      let packageId = id;
      if (id) {
        const [updated] = await q.query("UPDATE goitap SET TenGoi=?,MoTa=?,ThoiHan=?,Gia=?,TrangThai=? WHERE GoiTapID=?", [data.TenGoi, data.MoTa, data.SoThang * 30, data.GiaBan, data.TrangThai, id]);
        if (!updated.affectedRows) throw Object.assign(new Error("Không tìm thấy gói tập"), { status: 404 });
        const [duration] = await q.query("UPDATE GoiTapThoiHan SET SoThang=?,ThangTang=?,GiaGoc=?,GiaBan=?,TrangThai=? WHERE GoiTapThoiHanID=? AND GoiTapID=?", [data.SoThang, data.ThangTang, data.GiaGoc, data.GiaBan, data.TrangThai, data.GoiTapThoiHanID, id]);
        if (!duration.affectedRows) throw Object.assign(new Error("Không tìm thấy thời hạn gói tập"), { status: 400 });
      } else {
        const [created] = await q.query("INSERT INTO goitap (TenGoi,MoTa,ThoiHan,Gia,TrangThai) VALUES (?,?,?,?,?)", [data.TenGoi, data.MoTa, data.SoThang * 30, data.GiaBan, data.TrangThai]);
        packageId = created.insertId;
        await q.query("INSERT INTO GoiTapThoiHan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (?,?,?,?,?,?)", [packageId, data.SoThang, data.ThangTang, data.GiaGoc, data.GiaBan, data.TrangThai]);
      }
      await q.query("UPDATE QuyenLoiGoiTap SET TrangThai='INACTIVE' WHERE GoiTapID=?", [packageId]);
      for (const [index, name] of data.QuyenLoi.entries()) {
        await q.query(`INSERT INTO QuyenLoiGoiTap (GoiTapID,MaQuyenLoi,TenQuyenLoi,ThuTu,TrangThai) VALUES (?,?,?,?, 'ACTIVE') ON DUPLICATE KEY UPDATE TenQuyenLoi=VALUES(TenQuyenLoi),ThuTu=VALUES(ThuTu),TrangThai='ACTIVE'`, [packageId, `ADMIN_${index + 1}`, name, index]);
      }
      await q.commit();
      callback(null, { GoiTapID: packageId });
    } catch (e) {
      try { await q.rollback(); } catch (_) {}
      callback(e);
    } finally { connection.release(); }
  });
};

Goitap.setStatus = (id, status, callback) => {
  db.getConnection(async (error, connection) => {
    if (error) return callback(error);
    const q = connection.promise();
    try {
      await q.beginTransaction();
      const [result] = await q.query("UPDATE goitap SET TrangThai=? WHERE GoiTapID=?", [status, id]);
      await q.query("UPDATE GoiTapThoiHan SET TrangThai=? WHERE GoiTapID=?", [status, id]);
      await q.commit(); callback(null, result);
    } catch (e) { try { await q.rollback(); } catch (_) {} callback(e); }
    finally { connection.release(); }
  });
};

Goitap.safeDelete = (id, callback) => {
  db.query("SELECT g.GoiTapID,COUNT(d.DangKyID) AS total FROM goitap g LEFT JOIN dangkygoitap d ON d.GoiTapID=g.GoiTapID WHERE g.GoiTapID=? GROUP BY g.GoiTapID", [id], (error, rows) => {
    if (error) return callback(error);
    if (!rows.length) return callback(Object.assign(new Error('Không tìm thấy gói tập'), { status: 404 }));
    if (Number(rows[0].total)) return db.query("UPDATE goitap SET TrangThai='INACTIVE' WHERE GoiTapID=?", [id], (e) => callback(e, { deleted: false }));
    db.query("DELETE FROM goitap WHERE GoiTapID=?", [id], (e, result) => callback(e, { deleted: !!result?.affectedRows }));
  });
};

Goitap.getActive = (callback) => {
  const sqlString = `SELECT GoiTapID, TenGoi, MoTa, ThoiHan, Gia, TrangThai, NgayTao
    FROM \`goitap\`
    WHERE TrangThai = 'ACTIVE'
    ORDER BY Gia ASC, GoiTapID ASC`;
  db.query(sqlString, callback);
};

Goitap.getActiveDetailById = (GoiTapID, callback) => {
  const packageSql = `SELECT
      GoiTapID,
      TenGoi,
      MoTa,
      ThoiHan AS ThoiHanNgay,
      Gia,
      TrangThai,
      NgayTao
    FROM \`goitap\`
    WHERE GoiTapID = ?
      AND TrangThai = 'ACTIVE'
    LIMIT 1`;

  db.query(packageSql, [GoiTapID], (packageError, packageRows) => {
    if (packageError) return callback(packageError);
    if (!packageRows || packageRows.length === 0) return callback(null, null);

    const durationSql = `SELECT
        GoiTapThoiHanID,
        SoThang,
        ThangTang,
        GiaGoc,
        GiaBan,
        TrangThai
      FROM \`GoiTapThoiHan\`
      WHERE GoiTapID = ?
        AND TrangThai = 'ACTIVE'
      ORDER BY SoThang ASC, GoiTapThoiHanID ASC`;

    db.query(durationSql, [GoiTapID], (durationError, durationRows) => {
      if (durationError) return callback(durationError);

      const privilegeSql = `SELECT
          QuyenLoiID,
          MaQuyenLoi,
          TenQuyenLoi,
          MoTa,
          SoLuong,
          ThuTu,
          TrangThai
        FROM \`QuyenLoiGoiTap\`
        WHERE GoiTapID = ?
          AND TrangThai = 'ACTIVE'
        ORDER BY ThuTu ASC, QuyenLoiID ASC`;

      db.query(privilegeSql, [GoiTapID], (privilegeError, privilegeRows) => {
        if (privilegeError) return callback(privilegeError);

        callback(null, {
          ...packageRows[0],
          ThoiHan: durationRows,
          QuyenLoi: privilegeRows,
        });
      });
    });
  });
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
