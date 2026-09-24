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

Checkin.scan = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();

    try {
      await query.beginTransaction();

      const [memberships] = await query.query(
        `SELECT
           dk.DangKyID,
           dk.HoiVienID,
           dk.TrangThai AS TrangThaiDangKy,
           dk.NgayBatDau,
           dk.NgayKetThuc,
           hv.TrangThai AS TrangThaiHoiVien,
           tk.TrangThai AS TrangThaiTaiKhoan,
           g.TenGoi
         FROM dangkygoitap dk
         INNER JOIN hoivien hv ON hv.HoiVienID = dk.HoiVienID
         INNER JOIN taikhoan tk ON tk.TaiKhoanID = hv.TaiKhoanID
         INNER JOIN goitap g ON g.GoiTapID = dk.GoiTapID
         WHERE dk.DangKyID = ? AND dk.HoiVienID = ?
         FOR UPDATE`,
        [input.DangKyID, input.HoiVienID],
      );

      if (!memberships.length) {
        throw appError(403, "MEMBERSHIP_NOT_ACTIVE", "Không tìm thấy gói tập hợp lệ");
      }

      const membership = memberships[0];
      if (
        membership.TrangThaiTaiKhoan !== "ACTIVE" ||
        membership.TrangThaiHoiVien !== "ACTIVE" ||
        membership.TrangThaiDangKy !== "ACTIVE"
      ) {
        throw appError(403, "MEMBERSHIP_NOT_ACTIVE", "Gói tập chưa hoạt động");
      }

      const [payments] = await query.query(
        "SELECT ThanhToanID FROM thanhtoan WHERE DangKyID = ? AND TrangThai = 'SUCCESS' LIMIT 1 FOR UPDATE",
        [input.DangKyID],
      );
      if (!payments.length) {
        throw appError(403, "PAYMENT_NOT_SUCCESS", "Thanh toán gói tập chưa hoàn tất");
      }

      const [dateStatus] = await query.query(
        `SELECT
           CASE
             WHEN ? > CURDATE() THEN 'MEMBERSHIP_NOT_STARTED'
             WHEN ? < CURDATE() THEN 'MEMBERSHIP_EXPIRED'
             ELSE 'OK'
           END AS Status`,
        [membership.NgayBatDau, membership.NgayKetThuc],
      );
      if (dateStatus[0].Status !== "OK") {
        throw appError(403, dateStatus[0].Status, dateStatus[0].Status === "MEMBERSHIP_NOT_STARTED" ? "Gói tập chưa đến ngày kích hoạt" : "Gói tập đã hết hạn");
      }

      const [usedCodes] = await query.query(
        "SELECT MaQRID FROM maqr WHERE MaCode = ? LIMIT 1 FOR UPDATE",
        [input.token],
      );
      if (usedCodes.length) {
        throw appError(409, "QR_ALREADY_USED", "Mã QR đã được sử dụng");
      }

      const [sessions] = await query.query(
        `SELECT CheckInID FROM checkin
         WHERE HoiVienID = ?
           AND TrangThai = 'CHECKED_IN'
           AND ThoiGianCheckOut IS NULL
         ORDER BY CheckInID DESC
         LIMIT 1 FOR UPDATE`,
        [input.HoiVienID],
      );
      if (sessions.length) {
        throw appError(409, "ALREADY_CHECKED_IN", "Hội viên đang có phiên check-in chưa kết thúc");
      }

      const [qrResult] = await query.query(
        `INSERT INTO maqr (MaCode, NgayTao, NgayHetHan, TrangThai)
         VALUES (?, NOW(), FROM_UNIXTIME(?), 'ACTIVE')`,
        [input.token, input.exp],
      );
      const [checkInResult] = await query.query(
        `INSERT INTO checkin
          (HoiVienID, MaQRID, ThoiGianCheckIn, ThoiGianCheckOut, TrangThai)
         VALUES (?, ?, NOW(), NULL, 'CHECKED_IN')`,
        [input.HoiVienID, qrResult.insertId],
      );
      await query.query(
        "UPDATE maqr SET TrangThai = 'INACTIVE' WHERE MaQRID = ?",
        [qrResult.insertId],
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

Checkin.checkout = (CheckInID, callback) => {
  db.query(
    `UPDATE checkin
     SET ThoiGianCheckOut = COALESCE(ThoiGianCheckOut, NOW()),
         TrangThai = 'CHECKED_OUT'
     WHERE CheckInID = ?`,
    [CheckInID],
    (err, result) => {
      if (err) return callback(err);
      if (!result.affectedRows) return callback(appError(404, "CHECKIN_NOT_FOUND", "Không tìm thấy phiên check-in"));
      db.query(
        "SELECT CheckInID, HoiVienID, ThoiGianCheckIn, ThoiGianCheckOut, TrangThai FROM checkin WHERE CheckInID = ?",
        [CheckInID],
        (readError, rows) => callback(readError, rows?.[0]),
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
