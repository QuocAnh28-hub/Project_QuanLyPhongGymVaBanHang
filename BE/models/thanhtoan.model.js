const db = require("../common/db");

function appError(status, code, message, data) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.data = data;
  return error;
}

const packagePaymentDetailSql = `
  SELECT
    tt.ThanhToanID,
    tt.DangKyID,
    tt.HoiVienID,
    dk.GoiTapID,
    dk.GoiTapThoiHanID,
    g.TenGoi,
    th.SoThang,
    th.ThangTang,
    DATE_FORMAT(dk.NgayBatDau, '%Y-%m-%d') AS NgayBatDau,
    DATE_FORMAT(dk.NgayKetThuc, '%Y-%m-%d') AS NgayKetThuc,
    dk.GiaThanhToan,
    tt.SoTien,
    tt.PhuongThucThanhToan,
    tt.TrangThai AS TrangThaiThanhToan,
    dk.TrangThai AS TrangThaiDangKy
  FROM thanhtoan tt
  INNER JOIN dangkygoitap dk ON dk.DangKyID = tt.DangKyID
  INNER JOIN goitap g ON g.GoiTapID = dk.GoiTapID
  INNER JOIN GoiTapThoiHan th ON th.GoiTapThoiHanID = dk.GoiTapThoiHanID
`;

const Thanhtoan = (thanhtoan) => {
  this.ThanhToanID = thanhtoan.ThanhToanID;
  this.DangKyID = thanhtoan.DangKyID;
  this.HoiVienID = thanhtoan.HoiVienID;
  this.NhanVienID = thanhtoan.NhanVienID;
  this.SoTien = thanhtoan.SoTien;
  this.PhuongThucThanhToan = thanhtoan.PhuongThucThanhToan;
  this.NgayThanhToan = thanhtoan.NgayThanhToan;
  this.NoiDung = thanhtoan.NoiDung;
  this.TrangThai = thanhtoan.TrangThai;
};

Thanhtoan.createPackagePayment = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();

    try {
      await query.beginTransaction();
      const [registrations] = await query.query(
        `SELECT DangKyID, HoiVienID, GiaThanhToan, TrangThai
         FROM dangkygoitap
         WHERE DangKyID = ?
         FOR UPDATE`,
        [input.DangKyID],
      );
      if (!registrations.length) {
        throw appError(404, "REGISTRATION_NOT_FOUND", "Không tìm thấy đăng ký gói tập");
      }

      const registration = registrations[0];
      const [payments] = await query.query(
        `SELECT ThanhToanID, DangKyID, HoiVienID, SoTien,
                PhuongThucThanhToan, TrangThai
         FROM thanhtoan
         WHERE DangKyID = ?
           AND TrangThai IN ('PENDING', 'SUCCESS')
         ORDER BY ThanhToanID DESC
         LIMIT 1`,
        [input.DangKyID],
      );

      if (payments.length) {
        await query.commit();
        return callback(null, { payment: payments[0], existing: true });
      }
      if (registration.TrangThai !== "PENDING") {
        throw appError(409, "REGISTRATION_NOT_PENDING", "Đăng ký gói tập không còn ở trạng thái PENDING");
      }

      const [result] = await query.query(
        `INSERT INTO thanhtoan
          (DangKyID, HoiVienID, NhanVienID, SoTien, PhuongThucThanhToan,
           NgayThanhToan, NoiDung, TrangThai)
         VALUES (?, ?, NULL, ?, ?, NOW(), ?, 'PENDING')`,
        [
          registration.DangKyID,
          registration.HoiVienID,
          registration.GiaThanhToan,
          input.PhuongThucThanhToan,
          `Thanh toán đăng ký gói #${registration.DangKyID}`,
        ],
      );
      const payment = {
        ThanhToanID: result.insertId,
        DangKyID: registration.DangKyID,
        HoiVienID: registration.HoiVienID,
        SoTien: registration.GiaThanhToan,
        PhuongThucThanhToan: input.PhuongThucThanhToan,
        TrangThai: "PENDING",
      };
      await query.commit();
      callback(null, { payment, existing: false });
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thanhtoan.getPackagePaymentDetail = (ThanhToanID, callback) => {
  db.query(
    `${packagePaymentDetailSql} WHERE tt.ThanhToanID = ? LIMIT 1`,
    [ThanhToanID],
    (error, rows) => callback(error, rows?.[0] ?? null),
  );
};

Thanhtoan.getByRegistration = (DangKyID, callback) => {
  db.query(
    `${packagePaymentDetailSql}
     WHERE tt.DangKyID = ?
     ORDER BY tt.ThanhToanID DESC
     LIMIT 1`,
    [DangKyID],
    (error, rows) => callback(error, rows?.[0] ?? null),
  );
};

Thanhtoan.confirmPackagePayment = (ThanhToanID, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();

    try {
      await query.beginTransaction();
      const [payments] = await query.query(
        "SELECT * FROM thanhtoan WHERE ThanhToanID = ? FOR UPDATE",
        [ThanhToanID],
      );
      if (!payments.length) {
        throw appError(404, "PAYMENT_NOT_FOUND", "Không tìm thấy thanh toán");
      }
      const payment = payments[0];
      if (payment.TrangThai === "SUCCESS") {
        await query.commit();
        return callback(null, { ...payment, alreadyConfirmed: true });
      }
      if (payment.TrangThai !== "PENDING") {
        throw appError(409, "PAYMENT_NOT_PENDING", "Chỉ thanh toán PENDING mới được xác nhận");
      }

      const [registrations] = await query.query(
        "SELECT DangKyID, TrangThai FROM dangkygoitap WHERE DangKyID = ? FOR UPDATE",
        [payment.DangKyID],
      );
      if (!registrations.length) {
        throw appError(409, "REGISTRATION_NOT_FOUND", "Không tìm thấy đăng ký của thanh toán");
      }
      if (registrations[0].TrangThai !== "PENDING") {
        throw appError(409, "REGISTRATION_NOT_PENDING", "Đăng ký gói tập không còn ở trạng thái PENDING");
      }

      await query.query(
        "UPDATE thanhtoan SET TrangThai = 'SUCCESS', NgayThanhToan = NOW() WHERE ThanhToanID = ?",
        [ThanhToanID],
      );
      const [registrationUpdate] = await query.query(
        "UPDATE dangkygoitap SET TrangThai = 'ACTIVE' WHERE DangKyID = ? AND TrangThai = 'PENDING'",
        [payment.DangKyID],
      );
      if (registrationUpdate.affectedRows !== 1) {
        throw appError(409, "REGISTRATION_UPDATE_FAILED", "Không thể kích hoạt đăng ký gói tập");
      }

      await query.commit();
      callback(null, {
        ...payment,
        TrangThai: "SUCCESS",
        TrangThaiDangKy: "ACTIVE",
        alreadyConfirmed: false,
      });
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thanhtoan.cancelPackagePayment = (ThanhToanID, callback) => {
  db.query(
    "UPDATE thanhtoan SET TrangThai = 'CANCELLED' WHERE ThanhToanID = ? AND TrangThai = 'PENDING'",
    [ThanhToanID],
    (error, result) => {
      if (error) return callback(error);
      if (!result.affectedRows) {
        return callback(appError(409, "PAYMENT_NOT_PENDING", "Chỉ thanh toán PENDING mới được hủy"));
      }
      callback(null, { ThanhToanID, TrangThai: "CANCELLED" });
    },
  );
};

Thanhtoan.getById = (ThanhToanID, callback) => {
  const sqlString = "SELECT * FROM `thanhtoan` WHERE `ThanhToanID` = ?";
  db.query(sqlString, [ThanhToanID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thanhtoan.getAll = (callback) => {
  const sqlString = "SELECT * FROM `thanhtoan`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thanhtoan.insert = (thanhtoan, callback) => {
  const sqlString = "INSERT INTO `thanhtoan` SET ?";
  db.query(sqlString, thanhtoan, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ThanhToanID: res.insertId, ...thanhtoan });
  });
};

Thanhtoan.update = (thanhtoan, ThanhToanID, callback) => {
  const sqlString = "UPDATE `thanhtoan` SET ? WHERE `ThanhToanID` = ?";
  db.query(sqlString, [thanhtoan, ThanhToanID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật thanhtoan thành công" });
  });
};

Thanhtoan.delete = (ThanhToanID, callback) => {
  db.query("DELETE FROM `thanhtoan` WHERE `ThanhToanID` = ?", [ThanhToanID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa thanhtoan thành công" });
  });
};

module.exports = Thanhtoan;
