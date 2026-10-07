const db = require("../common/db");

function appError(status, code, message, data) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.data = data;
  return error;
}

function addMonthsClamped(dateString, months) {
  const [year, month, day] = dateString.split("-").map(Number);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, normalizedMonth + 1, 0)).getUTCDate();
  const result = new Date(
    Date.UTC(targetYear, normalizedMonth, Math.min(day, lastDay)),
  );

  return [
    result.getUTCFullYear(),
    String(result.getUTCMonth() + 1).padStart(2, "0"),
    String(result.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function ymd(value) {
  if (typeof value === 'string') return value.slice(0, 10);
  return value ? `${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}` : undefined;
}

function nextDay(value) {
  const date = new Date(`${ymd(value)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

const Dangkygoitap = (dangkygoitap) => {
  this.DangKyID = dangkygoitap.DangKyID;
  this.HoiVienID = dangkygoitap.HoiVienID;
  this.GoiTapID = dangkygoitap.GoiTapID;
  this.GoiTapThoiHanID = dangkygoitap.GoiTapThoiHanID;
  this.NgayDangKy = dangkygoitap.NgayDangKy;
  this.NgayBatDau = dangkygoitap.NgayBatDau;
  this.NgayKetThuc = dangkygoitap.NgayKetThuc;
  this.GiaThanhToan = dangkygoitap.GiaThanhToan;
  this.TrangThai = dangkygoitap.TrangThai;
};

Dangkygoitap.getById = (DangKyID, callback) => {
  const sqlString = "SELECT * FROM `dangkygoitap` WHERE `DangKyID` = ?";
  db.query(sqlString, [DangKyID], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

Dangkygoitap.getDetailById = (DangKyID, callback) => {
  const sqlString = `
    SELECT
      d.DangKyID,
      d.HoiVienID,
      d.GoiTapID,
      d.GoiTapThoiHanID,
      d.NgayDangKy,
      DATE_FORMAT(d.NgayBatDau, '%Y-%m-%d') AS NgayBatDau,
      DATE_FORMAT(d.NgayKetThuc, '%Y-%m-%d') AS NgayKetThuc,
      d.GiaThanhToan,
      d.TrangThai,
      g.TenGoi,
      t.SoThang,
      t.ThangTang,
      t.GiaGoc,
      t.GiaBan,
      MAX(d.SoTienGiam) AS SoTienGiam
    FROM dangkygoitap d
    INNER JOIN goitap g
      ON g.GoiTapID = d.GoiTapID
    INNER JOIN GoiTapThoiHan t
      ON t.GoiTapThoiHanID = d.GoiTapThoiHanID
    LEFT JOIN ApDungKhuyenMaiGoiTap km
      ON km.DangKyID = d.DangKyID
    WHERE d.DangKyID = ?
    GROUP BY
      d.DangKyID,
      d.HoiVienID,
      d.GoiTapID,
      d.GoiTapThoiHanID,
      d.NgayDangKy,
      d.NgayBatDau,
      d.NgayKetThuc,
      d.GiaThanhToan,
      d.TrangThai,
      g.TenGoi,
      t.SoThang,
      t.ThangTang,
      t.GiaGoc,
      t.GiaBan
    LIMIT 1
  `;

  db.query(sqlString, [DangKyID], (err, result) => {
    if (err) return callback(err);
    callback(null, result?.[0] ?? null);
  });
};

Dangkygoitap.getCurrentMembershipByAccount = (TaiKhoanID, callback) => {
  const sqlString = `
    SELECT
      dk.DangKyID,
      dk.HoiVienID,
      dk.GoiTapID,
      dk.GoiTapThoiHanID,
      g.TenGoi,
      th.SoThang,
      th.ThangTang,
      DATE_FORMAT(dk.NgayDangKy, '%Y-%m-%d') AS NgayDangKy,
      DATE_FORMAT(dk.NgayBatDau, '%Y-%m-%d') AS NgayBatDau,
      DATE_FORMAT(dk.NgayKetThuc, '%Y-%m-%d') AS NgayKetThuc,
      dk.GiaThanhToan,
      dk.TrangThai AS TrangThaiDangKy,
      tt.ThanhToanID,
      tt.SoTien,
      tt.PhuongThucThanhToan,
      tt.TrangThai AS TrangThaiThanhToan,
      CASE
        WHEN dk.NgayBatDau > CURDATE() THEN 'UPCOMING'
        ELSE 'ACTIVE'
      END AS TinhTrangSuDung
    FROM hoivien hv
    INNER JOIN dangkygoitap dk ON dk.HoiVienID = hv.HoiVienID
    INNER JOIN goitap g ON g.GoiTapID = dk.GoiTapID
    INNER JOIN GoiTapThoiHan th
      ON th.GoiTapThoiHanID = dk.GoiTapThoiHanID
    INNER JOIN thanhtoan tt
      ON tt.DangKyID = dk.DangKyID
      AND tt.TrangThai = 'SUCCESS'
    WHERE hv.TaiKhoanID = ?
      AND dk.TrangThai = 'ACTIVE'
      AND dk.NgayKetThuc >= CURDATE()
    ORDER BY
      CASE
        WHEN dk.NgayBatDau <= CURDATE()
         AND dk.NgayKetThuc >= CURDATE() THEN 0
        ELSE 1
      END,
      dk.NgayBatDau DESC,
      dk.DangKyID DESC,
      tt.ThanhToanID DESC
    LIMIT 1
  `;

  db.query(sqlString, [TaiKhoanID], (err, result) => {
    if (err) return callback(err);
    callback(null, result?.[0] ?? null);
  });
};

Dangkygoitap.getOwnedMembershipsByAccount = (TaiKhoanID, callback) => {
  db.query(`SELECT dk.DangKyID,dk.HoiVienID,dk.GoiTapID,dk.GoiTapThoiHanID,
      g.TenGoi,th.SoThang,th.ThangTang,
      DATE_FORMAT(dk.NgayDangKy,'%Y-%m-%d') NgayDangKy,
      DATE_FORMAT(dk.NgayBatDau,'%Y-%m-%d') NgayBatDau,
      DATE_FORMAT(dk.NgayKetThuc,'%Y-%m-%d') NgayKetThuc,
      dk.GiaThanhToan,dk.TrangThai TrangThaiDangKy,
      tt.ThanhToanID,tt.SoTien,tt.PhuongThucThanhToan,
      tt.TrangThai TrangThaiThanhToan,
      CASE WHEN dk.NgayBatDau<=CURDATE() AND dk.NgayKetThuc>=CURDATE()
        THEN 'CURRENT' ELSE 'UPCOMING' END TinhTrangSuDung
    FROM hoivien hv
    INNER JOIN dangkygoitap dk ON dk.HoiVienID=hv.HoiVienID AND dk.TrangThai='ACTIVE'
    INNER JOIN goitap g ON g.GoiTapID=dk.GoiTapID
    INNER JOIN GoiTapThoiHan th ON th.GoiTapThoiHanID=dk.GoiTapThoiHanID
    INNER JOIN thanhtoan tt ON tt.ThanhToanID=(
      SELECT MAX(p.ThanhToanID) FROM thanhtoan p
      WHERE p.DangKyID=dk.DangKyID AND p.TrangThai='SUCCESS')
    WHERE hv.TaiKhoanID=? AND dk.NgayKetThuc>=CURDATE()
    ORDER BY dk.NgayBatDau ASC,dk.DangKyID ASC`, [TaiKhoanID], (error, rows) => {
    if (error) return callback(error);
    callback(null, {
      current: rows.find(row => row.TinhTrangSuDung === 'CURRENT') || null,
      upcoming: rows.filter(row => row.TinhTrangSuDung === 'UPCOMING'),
    });
  });
};

Dangkygoitap.getAll = (callback) => {
  db.query("SELECT * FROM `dangkygoitap`", (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

Dangkygoitap.getAdminAll = (callback) => {
  db.query(`SELECT d.DangKyID,d.HoiVienID,h.HoTen,h.SoDienThoai,d.GoiTapID,g.TenGoi,
      d.GoiTapThoiHanID,t.SoThang,t.ThangTang,
      DATE_FORMAT(d.NgayDangKy,'%Y-%m-%d %H:%i:%s') NgayDangKy,
      DATE_FORMAT(d.NgayBatDau,'%Y-%m-%d') NgayBatDau,DATE_FORMAT(d.NgayKetThuc,'%Y-%m-%d') NgayKetThuc,
      d.GiaThanhToan,CASE WHEN d.TrangThai='ACTIVE' AND d.NgayKetThuc<CURDATE() THEN 'EXPIRED' ELSE d.TrangThai END TrangThaiDangKy,tt.ThanhToanID,tt.SoTien,
      COALESCE(tt.TrangThai,'UNPAID') TrangThaiThanhToan,tt.PhuongThucThanhToan,
      GREATEST(DATEDIFF(d.NgayKetThuc,CURDATE()),0) SoNgayConLai
      FROM dangkygoitap d
      INNER JOIN hoivien h ON h.HoiVienID=d.HoiVienID
      INNER JOIN goitap g ON g.GoiTapID=d.GoiTapID
      INNER JOIN GoiTapThoiHan t ON t.GoiTapThoiHanID=d.GoiTapThoiHanID
      LEFT JOIN thanhtoan tt ON tt.ThanhToanID=(
        SELECT tt2.ThanhToanID FROM thanhtoan tt2
        WHERE tt2.DangKyID=d.DangKyID
        ORDER BY CASE tt2.TrangThai WHEN 'SUCCESS' THEN 0 WHEN 'PENDING' THEN 1 ELSE 2 END,
          tt2.ThanhToanID DESC
        LIMIT 1
      )
      ORDER BY d.DangKyID DESC`, callback);
};

Dangkygoitap.renew = (registrationId, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const q = connection.promise();
    try {
      await q.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await q.beginTransaction();
      const [owners] = await q.query('SELECT HoiVienID FROM dangkygoitap WHERE DangKyID=?', [registrationId]);
      if (owners.length) await q.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [owners[0].HoiVienID]);
      const [rows] = await q.query(`SELECT d.*,t.SoThang,t.ThangTang,t.GiaBan,g.TrangThai GoiTapTrangThai,t.TrangThai ThoiHanTrangThai
        FROM dangkygoitap d INNER JOIN goitap g ON g.GoiTapID=d.GoiTapID
        INNER JOIN GoiTapThoiHan t ON t.GoiTapThoiHanID=d.GoiTapThoiHanID WHERE d.DangKyID=? FOR UPDATE`, [registrationId]);
      if (!rows.length) throw appError(404, 'REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký');
      const old = rows[0];
      if (old.GoiTapTrangThai !== 'ACTIVE' || old.ThoiHanTrangThai !== 'ACTIVE') throw appError(409, 'PACKAGE_INACTIVE', 'Gói hoặc thời hạn đã ngừng hoạt động');
      const [packageNames] = await q.query('SELECT TenGoi FROM goitap WHERE GoiTapID=?', [old.GoiTapID]);
      await require('./member-requests.model').requireStudent(q, old.HoiVienID, packageNames[0].TenGoi);
      await q.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [old.HoiVienID]);
      const [pending] = await q.query(`SELECT d.DangKyID FROM dangkygoitap d
        WHERE d.HoiVienID=? AND d.TrangThai='PENDING'
          AND NOT EXISTS (SELECT 1 FROM thanhtoan p WHERE p.DangKyID=d.DangKyID AND p.TrangThai IN ('SUCCESS','CANCELLED'))
        ORDER BY d.DangKyID DESC LIMIT 1`, [old.HoiVienID]);
      if (pending.length) throw appError(409, 'PENDING_EXISTS', 'Đã có lần gia hạn đang chờ thanh toán', { DangKyID: pending[0].DangKyID });
      const [dates] = await q.query("SELECT DATE_FORMAT(CURDATE(),'%Y-%m-%d') Today");
      const today = dates[0].Today;
      const [queue] = await q.query(`SELECT MAX(DATE_ADD(d.NgayKetThuc, INTERVAL COALESCE((SELECT SUM(DATEDIFF(b.NgayKetThuc,b.NgayBatDau)+1) FROM baoluugoitap b WHERE b.DangKyID=d.DangKyID AND b.TrangThai='APPROVED'),0) DAY)) MaxNgayKetThuc
        FROM dangkygoitap d INNER JOIN thanhtoan p ON p.DangKyID=d.DangKyID AND p.TrangThai='SUCCESS'
        WHERE d.HoiVienID=? AND d.TrangThai='ACTIVE' AND (d.NgayKetThuc>=CURDATE() OR EXISTS (SELECT 1 FROM baoluugoitap b WHERE b.DangKyID=d.DangKyID AND b.TrangThai='APPROVED'))`, [old.HoiVienID]);
      const start = queue[0].MaxNgayKetThuc ? nextDay(queue[0].MaxNgayKetThuc) : today;
      const end = addMonthsClamped(start, Number(old.SoThang) + Number(old.ThangTang || 0));
      const [created] = await q.query("INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayDangKy,NgayBatDau,NgayKetThuc,GiaThanhToan,TrangThai) VALUES (?,?,?,NOW(),?,?,?,'PENDING')", [old.HoiVienID,old.GoiTapID,old.GoiTapThoiHanID,start,end,old.GiaBan]);
      await q.commit();
      callback(null, { DangKyID: created.insertId, TrangThaiDangKy: 'PENDING', NgayBatDau: start, NgayKetThuc: end });
    } catch (e) { try { await q.rollback(); } catch (_) {} callback(e); }
    finally { connection.release(); }
  });
};

Dangkygoitap.register = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);

    const query = connection.promise();

    try {
      await query.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await query.beginTransaction();

      const [members] = await query.query(
        `SELECT
           h.HoiVienID,
           h.TaiKhoanID,
           h.TrangThai AS HoiVienTrangThai,
           t.VaiTro,
           t.TrangThai AS TaiKhoanTrangThai
         FROM hoivien h
         INNER JOIN taikhoan t ON t.TaiKhoanID = h.TaiKhoanID
         WHERE h.TaiKhoanID = ?
         LIMIT 1
         FOR UPDATE`,
        [input.TaiKhoanID],
      );

      if (!members.length) {
        throw appError(404, "MEMBER_NOT_FOUND", "Không tìm thấy hồ sơ hội viên");
      }

      const member = members[0];
      if (
        member.HoiVienTrangThai !== "ACTIVE" ||
        member.TaiKhoanTrangThai !== "ACTIVE" ||
        member.VaiTro !== "CUSTOMER"
      ) {
        throw appError(403, "MEMBER_INACTIVE", "Hội viên không được phép đăng ký gói tập");
      }

      const [packages] = await query.query(
        `SELECT
           g.GoiTapID,
           g.TenGoi,
           g.TrangThai AS GoiTapTrangThai,
           th.GoiTapThoiHanID,
           th.SoThang,
           th.ThangTang,
           th.GiaGoc,
           th.GiaBan,
           th.TrangThai AS ThoiHanTrangThai
         FROM goitap g
         INNER JOIN GoiTapThoiHan th
           ON th.GoiTapID = g.GoiTapID
         WHERE g.GoiTapID = ?
           AND th.GoiTapThoiHanID = ?
         LIMIT 1`,
        [input.GoiTapID, input.GoiTapThoiHanID],
      );

      if (!packages.length) {
        throw appError(
          404,
          "PACKAGE_DURATION_NOT_FOUND",
          "Không tìm thấy gói tập hoặc thời hạn đã chọn",
        );
      }

      const selectedPackage = packages[0];
      await require('./member-requests.model').requireStudent(query, member.HoiVienID, selectedPackage.TenGoi);
      if (
        selectedPackage.GoiTapTrangThai !== "ACTIVE" ||
        selectedPackage.ThoiHanTrangThai !== "ACTIVE"
      ) {
        throw appError(409, "PACKAGE_INACTIVE", "Gói tập hoặc thời hạn hiện không mở đăng ký");
      }

      const [duplicates] = await query.query(
        `SELECT d.DangKyID FROM dangkygoitap d
         WHERE d.HoiVienID = ? AND d.TrangThai = 'PENDING'
           AND NOT EXISTS (
             SELECT 1 FROM thanhtoan p WHERE p.DangKyID = d.DangKyID
               AND p.TrangThai IN ('SUCCESS', 'CANCELLED')
           )
         ORDER BY d.DangKyID DESC LIMIT 1`,
        [member.HoiVienID],
      );

      if (duplicates.length) {
        throw appError(
          409,
          "PENDING_EXISTS",
          "Bạn đã có đăng ký gói này đang chờ xử lý",
          { DangKyID: duplicates[0].DangKyID },
        );
      }

      const giaBan = Number(selectedPackage.GiaBan);
      let discount = 0;
      let promotion = null;

      if (input.MaKhuyenMai) {
        promotion = await require('./khuyenmai.model').quote(query, input.MaKhuyenMai, member.HoiVienID, 'PACKAGE', giaBan);
        discount = promotion.discount;
      }

      const giaThanhToan = Math.max(0, giaBan - discount);
      const totalMonths =
        Number(selectedPackage.SoThang) + Number(selectedPackage.ThangTang || 0);
      const [queue] = await query.query(
        `SELECT MAX(DATE_ADD(d.NgayKetThuc, INTERVAL COALESCE((SELECT SUM(DATEDIFF(b.NgayKetThuc,b.NgayBatDau)+1) FROM baoluugoitap b WHERE b.DangKyID=d.DangKyID AND b.TrangThai='APPROVED'),0) DAY)) AS MaxNgayKetThuc,
                DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS Today
         FROM dangkygoitap d
         INNER JOIN thanhtoan p ON p.DangKyID = d.DangKyID AND p.TrangThai = 'SUCCESS'
         WHERE d.HoiVienID = ? AND d.TrangThai = 'ACTIVE'
           AND (d.NgayKetThuc >= CURDATE() OR EXISTS (SELECT 1 FROM baoluugoitap b WHERE b.DangKyID=d.DangKyID AND b.TrangThai='APPROVED'))`,
        [member.HoiVienID],
      );
      const activationMode = input.ActivationMode || 'QUEUE_AFTER_CURRENT';
      const effectiveStart = activationMode === 'REPLACE_NOW'
        ? ymd(queue[0].Today)
        : queue[0].MaxNgayKetThuc
          ? nextDay(queue[0].MaxNgayKetThuc)
          : input.NgayBatDau;
      const ngayKetThuc = addMonthsClamped(effectiveStart, totalMonths);

      const [insertResult] = await query.query(
        `INSERT INTO dangkygoitap
          (
            HoiVienID,
            GoiTapID,
            GoiTapThoiHanID,
            NgayDangKy,
            NgayBatDau,
            NgayKetThuc,
            GiaThanhToan,
            TrangThai
          )
         VALUES (?, ?, ?, NOW(), ?, ?, ?, 'PENDING')`,
        [
          member.HoiVienID,
          input.GoiTapID,
          input.GoiTapThoiHanID,
          effectiveStart,
          ngayKetThuc,
          giaThanhToan,
        ],
      );

      const dangKyID = insertResult.insertId;

      await query.query('UPDATE dangkygoitap SET KhuyenMaiID=?,SoTienGiam=? WHERE DangKyID=?', [promotion?.KhuyenMaiID || null,discount,dangKyID]);

      await query.commit();

      callback(null, {
        DangKyID: dangKyID,
        HoiVienID: member.HoiVienID,
        GoiTapID: input.GoiTapID,
        GoiTapThoiHanID: input.GoiTapThoiHanID,
        TenGoi: selectedPackage.TenGoi,
        SoThang: Number(selectedPackage.SoThang),
        ThangTang: Number(selectedPackage.ThangTang || 0),
        ActivationMode: activationMode,
        NgayBatDau: effectiveStart,
        NgayKetThuc: ngayKetThuc,
        TinhTrangSuDung: effectiveStart > ymd(queue[0].Today) ? 'UPCOMING' : 'CURRENT',
        GiaGoc: Number(selectedPackage.GiaGoc),
        GiaBan: giaBan,
        SoTienGiam: discount,
        GiaThanhToan: giaThanhToan,
        MaKhuyenMai: promotion?.MaKhuyenMai ?? null,
        TrangThai: "PENDING",
      });
    } catch (error) {
      try {
        await query.rollback();
      } catch (_) {
        // Keep the original error.
      }
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Dangkygoitap.insert = (dangkygoitap, callback) => {
  const sqlString = "INSERT INTO `dangkygoitap` SET ?";
  db.query(sqlString, dangkygoitap, (err, res) => {
    if (err) return callback(err);
    callback(null, { DangKyID: res.insertId, ...dangkygoitap });
  });
};

Dangkygoitap.update = (dangkygoitap, DangKyID, callback) => {
  db.query(
    "UPDATE `dangkygoitap` SET ? WHERE `DangKyID` = ?",
    [dangkygoitap, DangKyID],
    (err) => {
      if (err) return callback(err);
      callback(null, { message: "Cập nhật dangkygoitap thành công" });
    },
  );
};

Dangkygoitap.delete = (DangKyID, callback) => {
  db.query(
    "DELETE FROM `dangkygoitap` WHERE `DangKyID` = ?",
    [DangKyID],
    (err) => {
      if (err) return callback(err);
      callback(null, { message: "Xóa dangkygoitap thành công" });
    },
  );
};

module.exports = Dangkygoitap;
