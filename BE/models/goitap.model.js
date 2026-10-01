const db = require("../common/db");

const Goitap = (goitap) => {
  this.GoiTapID = goitap.GoiTapID;
  this.TenGoi = goitap.TenGoi;
  this.MoTa = goitap.MoTa;
  this.Tier = goitap.Tier;
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
  const sqlString = `SELECT g.GoiTapID, g.TenGoi, g.MoTa, g.Tier, g.ThoiHan, g.Gia,
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
  db.query(sqlString, (err, packages) => {
    if (err || !packages.length) return callback(err, packages || []);
    const ids = packages.map(row => row.GoiTapID);
    db.query(`SELECT GoiTapThoiHanID,GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai
      FROM GoiTapThoiHan WHERE GoiTapID IN (?) ORDER BY SoThang,GoiTapThoiHanID`, [ids], (durationError, durations) => {
      if (durationError) return callback(durationError);
      db.query(`SELECT GoiTapID,TenQuyenLoi,TrangThai FROM QuyenLoiGoiTap
        WHERE GoiTapID IN (?) ORDER BY ThuTu,QuyenLoiID`, [ids], (privilegeError, privileges) => {
        if (privilegeError) return callback(privilegeError);
        callback(null, packages.map(row => ({
          ...row,
          ThoiHan: durations.filter(duration => Number(duration.GoiTapID) === Number(row.GoiTapID)),
          QuyenLoiChiTiet: privileges.filter(privilege => Number(privilege.GoiTapID) === Number(row.GoiTapID)),
        })));
      });
    });
  });
};

Goitap.saveAdmin = (id, data, callback) => {
  db.getConnection(async (error, connection) => {
    if (error) return callback(error);
    const q = connection.promise();
    try {
      await q.beginTransaction();
      const preferred = [...data.ThoiHan].filter(x => x.TrangThai === 'ACTIVE').sort((a, b) => a.SoThang - b.SoThang)[0]
        || [...data.ThoiHan].sort((a, b) => a.SoThang - b.SoThang)[0];
      let packageId = id;
      if (id) {
        const [packages] = await q.query('SELECT GoiTapID FROM goitap WHERE GoiTapID=? FOR UPDATE', [id]);
        if (!packages.length) throw Object.assign(new Error('Khong tim thay goi tap'), { status: 404 });
        await q.query('UPDATE goitap SET TenGoi=?,MoTa=?,Tier=?,ThoiHan=?,Gia=?,TrangThai=? WHERE GoiTapID=?', [data.TenGoi, data.MoTa, data.Tier, preferred.SoThang * 30, preferred.GiaBan, data.TrangThai, id]);
      } else {
        const [created] = await q.query('INSERT INTO goitap (TenGoi,MoTa,Tier,ThoiHan,Gia,TrangThai) VALUES (?,?,?,?,?,?)', [data.TenGoi, data.MoTa, data.Tier, preferred.SoThang * 30, preferred.GiaBan, data.TrangThai]);
        packageId = created.insertId;
      }

      const [current] = await q.query('SELECT GoiTapThoiHanID,SoThang FROM GoiTapThoiHan WHERE GoiTapID=? FOR UPDATE', [packageId]);
      const byId = new Map(current.map(row => [Number(row.GoiTapThoiHanID), row]));
      const byMonths = new Map(current.map(row => [Number(row.SoThang), row]));
      const kept = [];
      for (const duration of data.ThoiHan) {
        const existing = duration.GoiTapThoiHanID ? byId.get(duration.GoiTapThoiHanID) : byMonths.get(duration.SoThang);
        if (duration.GoiTapThoiHanID && !existing) throw Object.assign(new Error('Thoi han khong thuoc goi tap'), { status: 400 });
        if (existing) {
          await q.query('UPDATE GoiTapThoiHan SET SoThang=?,ThangTang=?,GiaGoc=?,GiaBan=?,TrangThai=? WHERE GoiTapThoiHanID=? AND GoiTapID=?', [duration.SoThang, duration.ThangTang, duration.GiaGoc, duration.GiaBan, duration.TrangThai, existing.GoiTapThoiHanID, packageId]);
          kept.push(existing.GoiTapThoiHanID);
        } else {
          const [created] = await q.query('INSERT INTO GoiTapThoiHan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (?,?,?,?,?,?)', [packageId, duration.SoThang, duration.ThangTang, duration.GiaGoc, duration.GiaBan, duration.TrangThai]);
          kept.push(created.insertId);
        }
      }
      await q.query("UPDATE GoiTapThoiHan SET TrangThai='INACTIVE' WHERE GoiTapID=? AND GoiTapThoiHanID NOT IN (?)", [packageId, kept]);
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
      if (status === 'ACTIVE') {
        const [durations] = await q.query("SELECT 1 FROM GoiTapThoiHan WHERE GoiTapID=? AND TrangThai='ACTIVE' LIMIT 1", [id]);
        if (!durations.length) throw Object.assign(new Error('Goi tap phai co it nhat mot thoi han ACTIVE'), { status: 400 });
      }
      const [result] = await q.query("UPDATE goitap SET TrangThai=? WHERE GoiTapID=?", [status, id]);
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

Goitap.getAdminDetailById = (GoiTapID, callback) => {
  db.query('SELECT GoiTapID,TenGoi,MoTa,Tier,TrangThai FROM goitap WHERE GoiTapID=? LIMIT 1', [GoiTapID], (packageError, packages) => {
    if (packageError || !packages.length) return callback(packageError, null);
    db.query('SELECT GoiTapThoiHanID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai FROM GoiTapThoiHan WHERE GoiTapID=? ORDER BY SoThang,GoiTapThoiHanID', [GoiTapID], (durationError, durations) => {
      if (durationError) return callback(durationError);
      db.query('SELECT QuyenLoiID,MaQuyenLoi,TenQuyenLoi,MoTa,SoLuong,ThuTu,TrangThai FROM QuyenLoiGoiTap WHERE GoiTapID=? ORDER BY ThuTu,QuyenLoiID', [GoiTapID], (privilegeError, privileges) => {
        if (privilegeError) return callback(privilegeError);
        callback(null, { ...packages[0], ThoiHan: durations, QuyenLoi: privileges });
      });
    });
  });
};

Goitap.getActive = (callback) => {
  const sqlString = `SELECT GoiTapID, TenGoi, MoTa, Tier, ThoiHan, Gia, TrangThai, NgayTao
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
      Tier,
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
