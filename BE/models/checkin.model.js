const db = require("../common/db");

function appError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

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

Checkin.getCrowding = (callback) => {
  const q = db.promise();
  Promise.all([
    q.query(`SELECT
      COUNT(DISTINCT CASE WHEN TrangThai='CHECKED_IN' AND ThoiGianCheckOut IS NULL THEN HoiVienID END) currentCount,
      COUNT(CASE WHEN TrangThai='CHECKED_OUT' AND ThoiGianCheckOut IS NOT NULL
        AND ThoiGianCheckOut>ThoiGianCheckIn
        AND ThoiGianCheckIn<CURDATE() AND ThoiGianCheckOut>DATE_SUB(CURDATE(),INTERVAL 28 DAY)
        AND ThoiGianCheckOut<=NOW() THEN 1 END) sampleSessions,
      DATE_FORMAT(DATE_SUB(CURDATE(),INTERVAL 28 DAY),'%Y-%m-%d') dateFrom,
      DATE_FORMAT(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'%Y-%m-%d') dateTo
      FROM checkin`),
    q.query(`WITH RECURSIVE days AS (
        SELECT DATE_SUB(CURDATE(),INTERVAL 28 DAY) day
        UNION ALL SELECT DATE_ADD(day,INTERVAL 1 DAY) FROM days WHERE day<DATE_SUB(CURDATE(),INTERVAL 1 DAY)
      ), hours AS (
        SELECT 0 hour UNION ALL SELECT hour+1 FROM hours WHERE hour<23
      ), slots AS (
        SELECT h.hour,d.day,TIMESTAMP(d.day,MAKETIME(h.hour,0,0)) startAt FROM days d CROSS JOIN hours h
      )
      SELECT s.hour,COUNT(DISTINCT c.CheckInID) sessions,
        CAST(COALESCE(SUM(TIMESTAMPDIFF(SECOND,GREATEST(c.ThoiGianCheckIn,s.startAt),
          LEAST(c.ThoiGianCheckOut,DATE_ADD(s.startAt,INTERVAL 1 HOUR)))),0) AS DECIMAL(20,6))/(28*3600) averageCount
      FROM slots s LEFT JOIN checkin c ON c.TrangThai='CHECKED_OUT' AND c.ThoiGianCheckOut IS NOT NULL
        AND c.ThoiGianCheckOut>c.ThoiGianCheckIn
        AND c.ThoiGianCheckOut<=NOW() AND c.ThoiGianCheckIn<DATE_ADD(s.startAt,INTERVAL 1 HOUR)
        AND c.ThoiGianCheckOut>s.startAt
      GROUP BY s.hour ORDER BY s.hour`),
  ]).then(([[summary], [hours]]) => callback(null, {
    ...summary[0], days: 28,
    hours: hours.map(row => ({ hour: Number(row.hour), sessions: Number(row.sessions), averageCount: Number(row.averageCount) })),
  }), callback);
};

const adminSelect = `SELECT ci.CheckInID,ci.HoiVienID,hv.HoTen,hv.SoDienThoai,hv.AnhDaiDien,
  GREATEST(0,TIMESTAMPDIFF(SECOND,ci.ThoiGianCheckIn,COALESCE(ci.ThoiGianCheckOut,NOW()))) ThoiGianDaTap,
  DATE_FORMAT(ci.ThoiGianCheckIn,'%Y-%m-%d %H:%i:%s') ThoiGianCheckIn,
  DATE_FORMAT(ci.ThoiGianCheckOut,'%Y-%m-%d %H:%i:%s') ThoiGianCheckOut,ci.TrangThai
  FROM checkin ci INNER JOIN hoivien hv ON hv.HoiVienID=ci.HoiVienID`;

Checkin.getAdminToday = (callback) => {
  db.query(`${adminSelect} WHERE DATE(ci.ThoiGianCheckIn)=CURDATE() ORDER BY ci.ThoiGianCheckIn DESC,ci.CheckInID DESC`, (error, rows) => {
    if (error) return callback(error);
    callback(null, {
      metrics: {
        total: rows.length,
        present: rows.filter(row => row.TrangThai === 'CHECKED_IN' && !row.ThoiGianCheckOut).length,
        checkedOut: rows.filter(row => row.TrangThai === 'CHECKED_OUT').length,
      },
      rows,
    });
  });
};

Checkin.getAdminHistory = (filters, callback) => {
  const where = [], params = [];
  if (filters.q) {
    where.push('(hv.HoTen LIKE ? OR hv.SoDienThoai LIKE ? OR CAST(ci.HoiVienID AS CHAR) LIKE ?)');
    const term = `%${filters.q}%`;
    params.push(term, term, term);
  }
  if (filters.from) { where.push('ci.ThoiGianCheckIn >= ?'); params.push(`${filters.from} 00:00:00`); }
  if (filters.to) { where.push('ci.ThoiGianCheckIn < DATE_ADD(?,INTERVAL 1 DAY)'); params.push(filters.to); }
  if (filters.status) { where.push('ci.TrangThai = ?'); params.push(filters.status); }
  const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  db.query(`SELECT COUNT(*) total FROM checkin ci INNER JOIN hoivien hv ON hv.HoiVienID=ci.HoiVienID${clause}`, params, (countError, countRows) => {
    if (countError) return callback(countError);
    db.query(`${adminSelect}${clause} ORDER BY ci.ThoiGianCheckIn DESC,ci.CheckInID DESC LIMIT ? OFFSET ?`, [...params, filters.pageSize, (filters.page - 1) * filters.pageSize], (error, rows) => {
      if (error) return callback(error);
      callback(null, { rows, total: Number(countRows[0].total), page: filters.page, pageSize: filters.pageSize });
    });
  });
};

Checkin.getEligibilityByAccount = (TaiKhoanID, callback) => {
  const sqlString = `
    SELECT
      tk.TaiKhoanID,
      tk.TrangThai AS TrangThaiTaiKhoan,
      hv.HoiVienID,
      hv.TrangThai AS TrangThaiHoiVien,
      dk.DangKyID,
      dk.NgayBatDau,
      dk.NgayKetThuc,
      dk.TrangThai AS TrangThaiDangKy,
      tt.TrangThai AS TrangThaiThanhToan,
      CASE
        WHEN dk.NgayBatDau > CURDATE() THEN 'MEMBERSHIP_NOT_STARTED'
        WHEN dk.NgayKetThuc < CURDATE() THEN 'MEMBERSHIP_EXPIRED'
        ELSE 'OK'
      END AS TinhTrangNgay
    FROM taikhoan tk
    LEFT JOIN hoivien hv ON hv.TaiKhoanID = tk.TaiKhoanID
    LEFT JOIN dangkygoitap dk
      ON dk.DangKyID = (
        SELECT selected.DangKyID
        FROM dangkygoitap selected
        WHERE selected.HoiVienID = hv.HoiVienID
        ORDER BY
          CASE
            WHEN selected.TrangThai = 'ACTIVE'
             AND selected.NgayBatDau <= CURDATE()
             AND selected.NgayKetThuc >= CURDATE()
             AND EXISTS (
               SELECT 1 FROM thanhtoan paid
               WHERE paid.DangKyID = selected.DangKyID
                 AND paid.TrangThai = 'SUCCESS'
             ) THEN 0
            ELSE 1
          END,
          selected.NgayBatDau DESC,
          selected.DangKyID DESC
        LIMIT 1
      )
    LEFT JOIN thanhtoan tt
      ON tt.ThanhToanID = (
        SELECT payment.ThanhToanID
        FROM thanhtoan payment
        WHERE payment.DangKyID = dk.DangKyID
        ORDER BY payment.ThanhToanID DESC
        LIMIT 1
      )
    WHERE tk.TaiKhoanID = ?
    LIMIT 1
  `;

  db.query(sqlString, [TaiKhoanID], (err, result) => {
    if (err) return callback(err);
    callback(null, result?.[0] ?? null);
  });
};

function validateQr(rows) {
  if (!rows.length) throw appError(404, 'QR_NOT_ISSUED', 'Mã QR chưa được Backend cấp');
  const qr = rows[0];
  if (qr.TrangThai !== 'ACTIVE') throw appError(409, 'QR_NOT_ACTIVE', 'Mã QR đã dùng hoặc bị thu hồi');
  if (new Date(qr.NgayHetHan).getTime() <= Date.now()) throw appError(410, 'QR_EXPIRED', 'Mã QR đã hết hạn');
  return qr;
}

async function readEligibility(query, input, lock = false) {
  const suffix = lock ? ' FOR UPDATE' : '';
  // Lock the member too: two different QR codes must not create parallel sessions.
  if (lock) await query.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID = ? FOR UPDATE', [input.HoiVienID]);
  const [memberships] = await query.query(
    `SELECT dk.DangKyID, dk.HoiVienID, dk.TrangThai AS TrangThaiDangKy,
      DATE_FORMAT(dk.NgayBatDau, '%Y-%m-%d') NgayBatDau,
      DATE_FORMAT(dk.NgayKetThuc, '%Y-%m-%d') NgayKetThuc,
      GREATEST(0, DATEDIFF(dk.NgayKetThuc, CURDATE())) SoNgayConLai,
      CASE WHEN dk.NgayBatDau IS NULL OR dk.NgayKetThuc IS NULL THEN 'MEMBERSHIP_DATE_INVALID'
        WHEN dk.NgayBatDau > CURDATE() THEN 'MEMBERSHIP_NOT_STARTED'
        WHEN dk.NgayKetThuc < CURDATE() THEN 'MEMBERSHIP_EXPIRED' ELSE 'OK' END TinhTrangNgay,
      hv.HoTen, hv.SoDienThoai, hv.AnhDaiDien,
      hv.TrangThai AS TrangThaiHoiVien, tk.TrangThai AS TrangThaiTaiKhoan, g.TenGoi
     FROM dangkygoitap dk
     INNER JOIN hoivien hv ON hv.HoiVienID = dk.HoiVienID
     INNER JOIN taikhoan tk ON tk.TaiKhoanID = hv.TaiKhoanID
     INNER JOIN goitap g ON g.GoiTapID = dk.GoiTapID
     WHERE dk.DangKyID = ? AND dk.HoiVienID = ?${suffix}`,
    [input.DangKyID, input.HoiVienID],
  );
  if (!memberships.length) throw appError(403, 'MEMBERSHIP_NOT_ACTIVE', 'Không tìm thấy gói tập hợp lệ');
  const membership = memberships[0];
  const [payments] = await query.query(
    `SELECT TrangThai FROM thanhtoan WHERE DangKyID = ?
      ORDER BY (TrangThai = 'SUCCESS') DESC, ThanhToanID DESC LIMIT 1${suffix}`, [input.DangKyID],
  );
  const [sessions] = await query.query(
    `SELECT CheckInID FROM checkin WHERE HoiVienID = ? AND TrangThai = 'CHECKED_IN'
      AND ThoiGianCheckOut IS NULL ORDER BY CheckInID DESC LIMIT 1${suffix}`, [input.HoiVienID],
  );
  const reasons = [];
  const add = (condition, code, message) => { if (condition) reasons.push({ code, message }); };
  add(membership.TrangThaiTaiKhoan !== 'ACTIVE', 'ACCOUNT_NOT_ACTIVE', 'Tài khoản chưa hoạt động hoặc đã bị khóa.');
  add(membership.TrangThaiHoiVien !== 'ACTIVE', 'MEMBER_NOT_ACTIVE', 'Hội viên chưa hoạt động hoặc đã bị khóa.');
  add(membership.TrangThaiDangKy !== 'ACTIVE', 'MEMBERSHIP_NOT_ACTIVE', 'Đăng ký gói tập chưa hoạt động.');
  add(payments[0]?.TrangThai !== 'SUCCESS', 'PAYMENT_NOT_SUCCESS', 'Thanh toán gói tập chưa hoàn tất.');
  add(membership.TinhTrangNgay === 'MEMBERSHIP_NOT_STARTED', 'MEMBERSHIP_NOT_STARTED', 'Gói tập chưa đến ngày kích hoạt.');
  add(membership.TinhTrangNgay === 'MEMBERSHIP_EXPIRED', 'MEMBERSHIP_EXPIRED', 'Gói tập đã hết hạn.');
  add(membership.TinhTrangNgay === 'MEMBERSHIP_DATE_INVALID', 'MEMBERSHIP_DATE_INVALID', 'Thời hạn gói tập không hợp lệ.');
  add(sessions.length > 0, 'ALREADY_CHECKED_IN', 'Hội viên đang có phiên check-in chưa kết thúc.');
  return { ...membership, TrangThaiThanhToan: payments[0]?.TrangThai || 'UNPAID',
    TrangThaiCheckIn: sessions.length ? 'CHECKED_IN' : 'NOT_CHECKED_IN',
    CheckInID: sessions[0]?.CheckInID || null, eligible: reasons.length === 0, reasons };
}

Checkin.getTokenById = (id, callback) => {
  db.query('SELECT MaCode FROM maqr WHERE MaQRID = ? LIMIT 1', [id], (error, rows) => callback(error, rows?.[0]));
};

Checkin.preview = (input, callback) => {
  (async () => {
    const query = db.promise();
    const [codes] = await query.query('SELECT MaQRID,TrangThai,NgayHetHan FROM maqr WHERE MaCode = ? LIMIT 1', [input.token]);
    validateQr(codes);
    return readEligibility(query, input);
  })().then(result => callback(null, result), callback);
};

Checkin.scan = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();

    try {
      await query.beginTransaction();

      const [codes] = await query.query(
        "SELECT MaQRID,TrangThai,NgayHetHan FROM maqr WHERE MaCode = ? LIMIT 1 FOR UPDATE",
        [input.token],
      );
      const qr = validateQr(codes);

      const membership = await readEligibility(query, input, true);
      if (membership.reasons.length) {
        const reason = membership.reasons[0];
        throw appError(reason.code === 'ALREADY_CHECKED_IN' ? 409 : 403, reason.code, reason.message);
      }
      // A confirmation can wait for another transaction; recheck expiry after locks.
      if (input.exp * 1000 <= Date.now() || new Date(qr.NgayHetHan).getTime() <= Date.now())
        throw appError(410, 'QR_EXPIRED', 'Mã QR đã hết hạn');

      const [checkInResult] = await query.query(
        `INSERT INTO checkin
          (HoiVienID, MaQRID, ThoiGianCheckIn, ThoiGianCheckOut, TrangThai)
         VALUES (?, ?, NOW(), NULL, 'CHECKED_IN')`,
        [input.HoiVienID, qr.MaQRID],
      );
      await query.query(
        "UPDATE maqr SET TrangThai = 'INACTIVE' WHERE MaQRID = ?",
        [qr.MaQRID],
      );
      const [created] = await query.query(
        `SELECT CheckInID, HoiVienID, ThoiGianCheckIn, TrangThai
         FROM checkin WHERE CheckInID = ?`,
        [checkInResult.insertId],
      );

      await query.commit();
      callback(null, {
        ...created[0],
        DangKyID: membership.DangKyID,
        TenGoi: membership.TenGoi,
      });
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      if (error?.code === "ER_DUP_ENTRY") {
        return callback(appError(409, "QR_ALREADY_USED", "Mã QR đã được sử dụng"));
      }
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Checkin.searchMembers = (term, callback) => {
  const like = `%${term}%`;
  db.query(`SELECT hv.HoiVienID,hv.TaiKhoanID,hv.HoTen,hv.SoDienThoai,
    hv.TrangThai TrangThaiHoiVien,tk.TrangThai TrangThaiTaiKhoan
    FROM hoivien hv INNER JOIN taikhoan tk ON tk.TaiKhoanID=hv.TaiKhoanID
    WHERE hv.HoTen LIKE ? OR hv.SoDienThoai LIKE ? OR CAST(hv.HoiVienID AS CHAR)=?
    ORDER BY hv.HoTen LIMIT 20`, [like, like, term], callback);
};

Checkin.issueToken = (token, expires, callback) => {
  db.query("INSERT INTO maqr (MaCode,NgayTao,NgayHetHan,TrangThai) VALUES (?,NOW(),FROM_UNIXTIME(?),'ACTIVE')", [token, expires], (error, result) => callback(error, { MaQRID: result?.insertId }));
};

Checkin.checkout = (CheckInID, callback) => {
  db.query(
    `UPDATE checkin
     SET ThoiGianCheckOut = NOW(),
         TrangThai = 'CHECKED_OUT'
     WHERE CheckInID = ? AND TrangThai = 'CHECKED_IN' AND ThoiGianCheckOut IS NULL`,
    [CheckInID],
    (err, result) => {
      if (err) return callback(err);
      db.query(
        "SELECT CheckInID, HoiVienID, ThoiGianCheckIn, ThoiGianCheckOut, TrangThai FROM checkin WHERE CheckInID = ?",
        [CheckInID],
        (readError, rows) => {
          if (readError) return callback(readError);
          if (!rows?.length) return callback(appError(404, 'CHECKIN_NOT_FOUND', 'Không tìm thấy phiên check-in'));
          if (!result.affectedRows) {
            if (rows[0].TrangThai === 'CHECKED_OUT' || rows[0].ThoiGianCheckOut)
              return callback(appError(409, 'ALREADY_CHECKED_OUT', 'Hội viên đã check-out'));
            return callback(appError(409, 'CHECKIN_NOT_ACTIVE', 'Phiên không ở trạng thái CHECKED_IN'));
          }
          callback(null, rows[0]);
        },
      );
    },
  );
};

Checkin.getHistoryByAccount = (TaiKhoanID, callback) => {
  db.query(
    `SELECT
       ci.CheckInID,
       ci.HoiVienID,
       ci.ThoiGianCheckIn,
       ci.ThoiGianCheckOut,
       ci.TrangThai
     FROM hoivien hv
     INNER JOIN checkin ci ON ci.HoiVienID = hv.HoiVienID
     WHERE hv.TaiKhoanID = ?
     ORDER BY ci.ThoiGianCheckIn DESC, ci.CheckInID DESC`,
    [TaiKhoanID],
    (err, result) => callback(err, result),
  );
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
