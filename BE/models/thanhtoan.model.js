const db = require("../common/db");

function appError(status, code, message, data) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.data = data;
  return error;
}

function addMonthsClamped(dateString, months) {
  const [year, month, day] = dateString.split('-').map(Number);
  const target = month - 1 + months;
  const targetYear = year + Math.floor(target / 12);
  const targetMonth = ((target % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  return new Date(Date.UTC(targetYear, targetMonth, Math.min(day, lastDay))).toISOString().slice(0, 10);
}
function nextDay(value) {
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}
const activationMode = payment => String(payment.NoiDung || '').includes('REPLACE_NOW') ? 'REPLACE_NOW' : 'QUEUE_AFTER_CURRENT';

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
      CASE WHEN tt.NoiDung LIKE '%REPLACE_NOW%' THEN 'REPLACE_NOW' ELSE 'QUEUE_AFTER_CURRENT' END AS ActivationMode,
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
        if (payments[0].TrangThai === 'PENDING') {
          const note = `PACKAGE_ACTIVATION:${input.ActivationMode || 'QUEUE_AFTER_CURRENT'}; đăng ký #${registration.DangKyID}`;
          await query.query('UPDATE thanhtoan SET NoiDung=? WHERE ThanhToanID=?', [note, payments[0].ThanhToanID]);
          payments[0].NoiDung = note;
        }
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
          `PACKAGE_ACTIVATION:${input.ActivationMode || 'QUEUE_AFTER_CURRENT'}; đăng ký #${registration.DangKyID}`,
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
      try { await query.rollback(); } catch (_) { }
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

Thanhtoan.getHistoryByAccount = (accountId, callback) => {
  db.query(`
    SELECT CONCAT('PACKAGE-', tt.ThanhToanID) AS id, 'PACKAGE' AS type,
      tt.ThanhToanID AS referenceId, g.TenGoi AS title, tt.SoTien AS amount,
      tt.NgayThanhToan AS date, tt.TrangThai AS status,
      tt.PhuongThucThanhToan AS paymentMethod
    FROM thanhtoan tt
    INNER JOIN dangkygoitap dk ON dk.DangKyID = tt.DangKyID
    INNER JOIN goitap g ON g.GoiTapID = dk.GoiTapID
    INNER JOIN hoivien hv ON hv.HoiVienID = tt.HoiVienID
    WHERE hv.TaiKhoanID = ?
    UNION ALL
    SELECT CONCAT('ORDER-', dh.DonHangID), 'PRODUCT_ORDER', dh.DonHangID,
      CONCAT('Đơn hàng #', dh.DonHangID), dh.TongTien, dh.NgayDat, dh.TrangThai, NULL
    FROM donhang dh
    INNER JOIN hoivien hv ON hv.HoiVienID = dh.HoiVienID
    WHERE hv.TaiKhoanID = ?
    ORDER BY date DESC, id DESC`, [accountId, accountId], callback);
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
        const [invoice] = await query.query(
          `INSERT INTO hoadon (ThanhToanID, NhanVienID, TongTien, TrangThai)
           VALUES (?, ?, ?, 'ACTIVE')
           ON DUPLICATE KEY UPDATE ThanhToanID = VALUES(ThanhToanID)`,
          [payment.ThanhToanID, payment.NhanVienID, payment.SoTien],
        );
        const [invoices] = await query.query("SELECT HoaDonID FROM hoadon WHERE ThanhToanID = ?", [ThanhToanID]);
        await query.commit();
        return callback(null, { ...payment, HoaDonID: invoice.insertId || invoices[0].HoaDonID, alreadyConfirmed: true });
      }
      if (payment.TrangThai !== "PENDING") {
        throw appError(409, "PAYMENT_NOT_PENDING", "Chỉ thanh toán PENDING mới được xác nhận");
      }

      const [registrations] = await query.query(
        `SELECT
  d.DangKyID,
  d.HoiVienID,
  DATE_FORMAT(d.NgayBatDau,'%Y-%m-%d') AS NgayBatDau,
  DATE_FORMAT(d.NgayKetThuc,'%Y-%m-%d') AS NgayKetThuc,
  d.TrangThai,
          th.SoThang,th.ThangTang,DATE_FORMAT(CURDATE(),'%Y-%m-%d') Today
         FROM dangkygoitap d INNER JOIN GoiTapThoiHan th ON th.GoiTapThoiHanID=d.GoiTapThoiHanID
         WHERE d.DangKyID = ? FOR UPDATE`,
        [payment.DangKyID],
      );
      if (!registrations.length) {
        throw appError(409, "REGISTRATION_NOT_FOUND", "Không tìm thấy đăng ký của thanh toán");
      }
      if (registrations[0].TrangThai !== "PENDING") {
        throw appError(409, "REGISTRATION_NOT_PENDING", "Đăng ký gói tập không còn ở trạng thái PENDING");
      }

      const registration = registrations[0];
      await query.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [registration.HoiVienID]);
      const mode = activationMode(payment);
      const months = Number(registration.SoThang) + Number(registration.ThangTang || 0);
      let start = registration.NgayBatDau;
      if (mode === 'REPLACE_NOW') {
        start = registration.Today;
        await query.query(`UPDATE dangkygoitap d
          INNER JOIN thanhtoan p ON p.DangKyID=d.DangKyID AND p.TrangThai='SUCCESS'
          SET d.NgayKetThuc=DATE_SUB(CURDATE(),INTERVAL 1 DAY)
          WHERE d.HoiVienID=? AND d.DangKyID<>? AND d.TrangThai='ACTIVE'
            AND d.NgayBatDau<=CURDATE() AND d.NgayKetThuc>=CURDATE()`, [registration.HoiVienID, payment.DangKyID]);
      } else {
        const [queue] = await query.query(`SELECT MAX(d.NgayKetThuc) MaxNgayKetThuc
          FROM dangkygoitap d INNER JOIN thanhtoan p ON p.DangKyID=d.DangKyID AND p.TrangThai='SUCCESS'
          WHERE d.HoiVienID=? AND d.DangKyID<>? AND d.TrangThai='ACTIVE' AND d.NgayKetThuc>=CURDATE()`, [registration.HoiVienID, payment.DangKyID]);
        if (queue[0].MaxNgayKetThuc) start = nextDay(queue[0].MaxNgayKetThuc);
      }
      const end = addMonthsClamped(start, months);
      await query.query("UPDATE thanhtoan SET TrangThai = 'SUCCESS', NgayThanhToan = NOW() WHERE ThanhToanID = ?", [ThanhToanID]);
      const [registrationUpdate] = await query.query(
        "UPDATE dangkygoitap SET TrangThai='ACTIVE',NgayBatDau=?,NgayKetThuc=? WHERE DangKyID=? AND TrangThai='PENDING'",
        [start, end, payment.DangKyID],
      );
      if (registrationUpdate.affectedRows !== 1) {
        throw appError(409, "REGISTRATION_UPDATE_FAILED", "Không thể kích hoạt đăng ký gói tập");
      }
      if (mode === 'REPLACE_NOW') {
        const [upcoming] = await query.query(`SELECT d.DangKyID,th.SoThang,th.ThangTang
          FROM dangkygoitap d INNER JOIN GoiTapThoiHan th ON th.GoiTapThoiHanID=d.GoiTapThoiHanID
          INNER JOIN thanhtoan p ON p.DangKyID=d.DangKyID AND p.TrangThai='SUCCESS'
          WHERE d.HoiVienID=? AND d.DangKyID<>? AND d.TrangThai='ACTIVE' AND d.NgayBatDau>CURDATE()
          ORDER BY d.NgayBatDau,d.DangKyID FOR UPDATE`, [registration.HoiVienID, payment.DangKyID]);
        let cursor = end;
        for (const item of upcoming) {
          const itemStart = nextDay(cursor);
          const itemEnd = addMonthsClamped(itemStart, Number(item.SoThang) + Number(item.ThangTang || 0));
          await query.query('UPDATE dangkygoitap SET NgayBatDau=?,NgayKetThuc=? WHERE DangKyID=?', [itemStart, itemEnd, item.DangKyID]);
          cursor = itemEnd;
        }
      }

      const [invoice] = await query.query(
        `INSERT INTO hoadon (ThanhToanID, NhanVienID, TongTien, TrangThai)
         VALUES (?, ?, ?, 'ACTIVE')
         ON DUPLICATE KEY UPDATE ThanhToanID = VALUES(ThanhToanID)`,
        [payment.ThanhToanID, payment.NhanVienID, payment.SoTien],
      );
      const [invoices] = await query.query("SELECT HoaDonID FROM hoadon WHERE ThanhToanID = ?", [ThanhToanID]);

      await query.commit();
      callback(null, {
        ...payment,
        TrangThai: "SUCCESS",
        TrangThaiDangKy: "ACTIVE",
        ActivationMode: mode,
        NgayBatDau: start,
        NgayKetThuc: end,
        TinhTrangSuDung: start > registration.Today ? 'UPCOMING' : 'CURRENT',
        HoaDonID: invoice.insertId || invoices[0].HoaDonID,
        alreadyConfirmed: false,
      });
    } catch (error) {
      try { await query.rollback(); } catch (_) { }
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thanhtoan.cancelPackagePayment = (ThanhToanID, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();
    try {
      await query.beginTransaction();
      const [payments] = await query.query(
        'SELECT ThanhToanID, DangKyID, TrangThai FROM thanhtoan WHERE ThanhToanID = ? FOR UPDATE', [ThanhToanID],
      );
      const payment = payments[0];
      if (!payment) throw appError(404, 'PAYMENT_NOT_FOUND', 'Không tìm thấy thanh toán');
      if (payment.TrangThai !== 'PENDING')
        throw appError(409, 'PAYMENT_NOT_PENDING', payment.TrangThai === 'CANCELLED' ? 'Thanh toán đã bị hủy' : 'Chỉ thanh toán PENDING mới được từ chối');
      if (!payment.DangKyID) throw appError(409, 'REGISTRATION_NOT_FOUND', 'Thanh toán không thuộc đăng ký gói tập');
      const [registrations] = await query.query(
        'SELECT DangKyID, TrangThai FROM dangkygoitap WHERE DangKyID = ? FOR UPDATE', [payment.DangKyID],
      );
      const registration = registrations[0];
      if (!registration) throw appError(404, 'REGISTRATION_NOT_FOUND', 'Không tìm thấy đăng ký gói tập');
      if (registration.TrangThai !== 'PENDING')
        throw appError(409, 'REGISTRATION_NOT_PENDING', registration.TrangThai === 'CANCELLED' ? 'Đăng ký đã bị hủy' : 'Chỉ đăng ký PENDING mới được từ chối');
      const [paymentUpdate] = await query.query(
        "UPDATE thanhtoan SET TrangThai = 'CANCELLED' WHERE ThanhToanID = ? AND TrangThai = 'PENDING'", [ThanhToanID],
      );
      if (paymentUpdate.affectedRows !== 1) throw appError(409, 'PAYMENT_UPDATE_FAILED', 'Không thể hủy thanh toán');
      const [registrationUpdate] = await query.query(
        "UPDATE dangkygoitap SET TrangThai = 'CANCELLED' WHERE DangKyID = ? AND TrangThai = 'PENDING'", [payment.DangKyID],
      );
      if (registrationUpdate.affectedRows !== 1) throw appError(409, 'REGISTRATION_UPDATE_FAILED', 'Không thể từ chối đăng ký');
      await query.commit();
      callback(null, { ThanhToanID, DangKyID: payment.DangKyID, TrangThai: 'CANCELLED', TrangThaiDangKy: 'CANCELLED' });
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
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
  const sqlString = `
    SELECT tt.ThanhToanID, tt.HoiVienID, hv.HoTen AS HoiVien,
      tt.NoiDung, tt.SoTien, tt.PhuongThucThanhToan, tt.NgayThanhToan,
      tt.TrangThai, hd.HoaDonID,
      CASE WHEN tt.DangKyID IS NOT NULL THEN 'PACKAGE'
           WHEN sc.DonHangID IS NOT NULL THEN 'SHOP'
           ELSE 'UNKNOWN' END AS Loai,
      tt.DangKyID, sc.DonHangID
    FROM thanhtoan tt
    JOIN hoivien hv ON hv.HoiVienID = tt.HoiVienID
    LEFT JOIN hoadon hd ON hd.ThanhToanID = tt.ThanhToanID
    LEFT JOIN shopcheckout sc ON sc.ThanhToanID = tt.ThanhToanID
    ORDER BY tt.NgayThanhToan DESC, tt.ThanhToanID DESC`;
  db.query(`INSERT IGNORE INTO hoadon (ThanhToanID, NhanVienID, TongTien, TrangThai)
    SELECT tt.ThanhToanID,tt.NhanVienID,tt.SoTien,'ACTIVE' FROM thanhtoan tt
    LEFT JOIN hoadon hd ON hd.ThanhToanID=tt.ThanhToanID
    WHERE tt.TrangThai='SUCCESS' AND tt.DangKyID IS NOT NULL AND hd.HoaDonID IS NULL`, error => {
    if (error) return callback(error);
    db.query(sqlString, (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
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
