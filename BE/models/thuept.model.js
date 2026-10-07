const db = require("../common/db");

function appError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

const bookingDetailSql = `
  SELECT
    tp.ThuePTID,
    tp.HoiVienID,
    tp.PTID,
    tp.LichPTID,
    p.HoTen AS HoTenPT,
    p.ChuyenMon,
    p.AnhDaiDien,
    tp.NgayDat,
    DATE_FORMAT(l.NgayLam, '%Y-%m-%d') AS NgayLam,
    TIME_FORMAT(l.GioBatDau, '%H:%i:%s') AS GioBatDau,
    TIME_FORMAT(l.GioKetThuc, '%H:%i:%s') AS GioKetThuc,
    tp.GiaThue,
    tp.TrangThai,
    tp.GhiChu, tt.ThanhToanID, tt.SoTien, tt.TrangThai AS TrangThaiThanhToan, tt.PhuongThucThanhToan
  FROM thuept tp
  INNER JOIN pt p ON p.PTID = tp.PTID
  INNER JOIN lichpt l ON l.LichPTID = tp.LichPTID
  LEFT JOIN thanhtoan tt ON tt.ThuePTID=tp.ThuePTID
`;

const Thuept = (thuept) => {
  this.ThuePTID = thuept.ThuePTID;
  this.HoiVienID = thuept.HoiVienID;
  this.PTID = thuept.PTID;
  this.LichPTID = thuept.LichPTID;
  this.NgayDat = thuept.NgayDat;
  this.GiaThue = thuept.GiaThue;
  this.TrangThai = thuept.TrangThai;
  this.GhiChu = thuept.GhiChu;
};

Thuept.getById = (ThuePTID, callback) => {
  const sqlString = `${bookingDetailSql} WHERE tp.ThuePTID=?`;
  db.query(sqlString, [ThuePTID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thuept.getAll = (callback) => {
  const sqlString = `${bookingDetailSql}`;
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Thuept.book = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();
    try {
      await query.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await query.beginTransaction();
      const [members] = await query.query(
        `SELECT hv.HoiVienID
         FROM taikhoan tk
         INNER JOIN hoivien hv ON hv.TaiKhoanID = tk.TaiKhoanID
         WHERE tk.TaiKhoanID = ?
           AND tk.TrangThai = 'ACTIVE'
           AND tk.VaiTro = 'CUSTOMER'
           AND hv.TrangThai = 'ACTIVE'
         LIMIT 1 FOR UPDATE`,
        [input.TaiKhoanID],
      );
      if (!members.length) {
        throw appError(403, "MEMBER_NOT_ACTIVE", "Tài khoản hội viên không hoạt động");
      }

      const [schedules] = await query.query(
        `SELECT
           l.LichPTID, l.PTID, l.NgayLam, l.GioBatDau, l.GioKetThuc,
           l.TrangThai AS TrangThaiLich,
           p.HoTen, p.GiaThue, p.TrangThai AS TrangThaiPT
         FROM lichpt l
         INNER JOIN pt p ON p.PTID = l.PTID
         WHERE l.LichPTID = ?
         LIMIT 1 FOR UPDATE`,
        [input.LichPTID],
      );
      if (!schedules.length) {
        throw appError(404, "SCHEDULE_NOT_FOUND", "Không tìm thấy lịch PT");
      }

      const schedule = schedules[0];
      const [duplicates] = await query.query(
        `SELECT ThuePTID FROM thuept
         WHERE HoiVienID = ? AND LichPTID = ?
           AND TrangThai IN ('PENDING', 'CONFIRMED')
         LIMIT 1 FOR UPDATE`,
        [members[0].HoiVienID, input.LichPTID],
      );
      if (duplicates.length) {
        throw appError(409, "BOOKING_EXISTS", "Bạn đã đăng ký khung giờ này");
      }
      if (schedule.TrangThaiPT !== "ACTIVE" || schedule.TrangThaiLich !== "AVAILABLE") {
        throw appError(409, "SLOT_NOT_AVAILABLE", "Lịch PT không còn trống");
      }
      const [timeCheck] = await query.query(
        "SELECT TIMESTAMP(?, ?) > NOW() AS IsFuture",
        [schedule.NgayLam, schedule.GioBatDau],
      );
      if (!timeCheck[0].IsFuture) {
        throw appError(409, "SLOT_NOT_AVAILABLE", "Lịch PT đã qua");
      }

      const promotion = input.MaKhuyenMai ? await require('./khuyenmai.model').quote(query, input.MaKhuyenMai, members[0].HoiVienID, 'PT', Number(schedule.GiaThue)) : null;
      const [insertResult] = await query.query(
        `INSERT INTO thuept
          (HoiVienID, PTID, LichPTID, NgayDat, GiaThue, TrangThai, GhiChu)
         VALUES (?, ?, ?, NOW(), ?, 'PENDING', ?)`,
        [
          members[0].HoiVienID,
          schedule.PTID,
          schedule.LichPTID,
          schedule.GiaThue,
          input.GhiChu,
        ],
      );
      await query.query('UPDATE thuept SET KhuyenMaiID=?,SoTienGiam=? WHERE ThuePTID=?', [promotion?.KhuyenMaiID || null,promotion?.discount || 0,insertResult.insertId]);
      await query.query("INSERT INTO thanhtoan (ThuePTID,HoiVienID,SoTien,PhuongThucThanhToan,NoiDung,TrangThai) VALUES (?,?,?,?,?,'PENDING')", [insertResult.insertId,members[0].HoiVienID,Number(schedule.GiaThue)-(promotion?.discount || 0),input.PhuongThucThanhToan || 'TIEN_MAT',`PT #${insertResult.insertId}`]);
      const [updateResult] = await query.query(
        "UPDATE lichpt SET TrangThai = 'BOOKED' WHERE LichPTID = ? AND TrangThai = 'AVAILABLE'",
        [schedule.LichPTID],
      );
      if (updateResult.affectedRows !== 1) {
        throw appError(409, "SLOT_NOT_AVAILABLE", "Lịch này vừa được người khác đặt");
      }

      const [created] = await query.query(
        `${bookingDetailSql} WHERE tp.ThuePTID = ?`,
        [insertResult.insertId],
      );
      await query.commit();
      callback(null, created[0]);
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thuept.getByAccount = (TaiKhoanID, callback) => {
  db.query(
    `${bookingDetailSql}
     INNER JOIN hoivien hv ON hv.HoiVienID = tp.HoiVienID
     WHERE hv.TaiKhoanID = ?
     ORDER BY l.NgayLam DESC, l.GioBatDau DESC`,
    [TaiKhoanID],
    callback,
  );
};

Thuept.getDetail = (ThuePTID, callback) => {
  db.query(
    `${bookingDetailSql} WHERE tp.ThuePTID = ? LIMIT 1`,
    [ThuePTID],
    (err, result) => callback(err, result?.[0] ?? null),
  );
};

Thuept.confirmBooking = (ThuePTID, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();
    try {
      await query.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await query.beginTransaction();
      const [owners] = await query.query('SELECT HoiVienID FROM thuept WHERE ThuePTID=?', [ThuePTID]);
      if (owners.length) await query.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [owners[0].HoiVienID]);
      const [bookings] = await query.query(
        `SELECT
           tp.*,
           l.NgayLam,
           l.GioBatDau,
           l.GioKetThuc,
           l.TrangThai AS TrangThaiLich,
           p.HoTen
         FROM thuept tp
         INNER JOIN lichpt l ON l.LichPTID = tp.LichPTID
         INNER JOIN pt p ON p.PTID = tp.PTID
         WHERE tp.ThuePTID = ?
         LIMIT 1 FOR UPDATE`,
        [ThuePTID],
      );
      if (!bookings.length) {
        throw appError(404, "BOOKING_NOT_FOUND", "Không tìm thấy lịch thuê PT");
      }

      const booking = bookings[0];
      const [payments] = await query.query('SELECT * FROM thanhtoan WHERE ThuePTID=? FOR UPDATE', [ThuePTID]);
      const payment = payments[0];
      if (!payment || payment.TrangThai !== 'SUCCESS') throw appError(409, 'PAYMENT_NOT_SUCCESS', 'PT chưa thanh toán.');
      if (booking.TrangThai === "CONFIRMED") {
        const [current] = await query.query(
          `${bookingDetailSql} WHERE tp.ThuePTID = ?`,
          [ThuePTID],
        );
        await query.commit();
        return callback(null, { ...current[0], alreadyConfirmed: true });
      }
      if (booking.TrangThai !== "PENDING") {
        throw appError(409, "INVALID_BOOKING_STATUS", "Trạng thái lịch thuê PT không thể xác nhận");
      }
      if (booking.TrangThaiLich !== "BOOKED") {
        throw appError(409, "INVALID_SCHEDULE_STATUS", "Lịch PT không còn ở trạng thái BOOKED");
      }

      const [updateResult] = await query.query(
        "UPDATE thuept SET TrangThai = 'CONFIRMED' WHERE ThuePTID = ? AND TrangThai = 'PENDING'",
        [ThuePTID],
      );
      if (updateResult.affectedRows !== 1) {
        throw appError(409, "INVALID_BOOKING_STATUS", "Lịch thuê PT không còn ở trạng thái PENDING");
      }

      const [updated] = await query.query(
        `${bookingDetailSql} WHERE tp.ThuePTID = ?`,
        [ThuePTID],
      );
      await query.commit();
      callback(null, updated[0]);
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thuept.confirmPayment = (ThuePTID, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const q = connection.promise();
    try {
      await q.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await q.beginTransaction();
      const [owners] = await q.query('SELECT HoiVienID FROM thuept WHERE ThuePTID=?', [ThuePTID]);
      if (owners.length) await q.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [owners[0].HoiVienID]);
      const [bookings] = await q.query('SELECT tp.*,l.TrangThai TrangThaiLich FROM thuept tp JOIN lichpt l ON l.LichPTID=tp.LichPTID WHERE tp.ThuePTID=? FOR UPDATE', [ThuePTID]);
      const booking = bookings[0];
      if (!booking) throw appError(404,'BOOKING_NOT_FOUND','Không tìm thấy lịch PT.');
      const [payments] = await q.query('SELECT * FROM thanhtoan WHERE ThuePTID=? FOR UPDATE', [ThuePTID]);
      const payment = payments[0];
      if (!payment) throw appError(409,'PAYMENT_NOT_FOUND','Không có thanh toán PT.');
      const alreadyConfirmed = payment.TrangThai === 'SUCCESS';
      if (!alreadyConfirmed) {
        if (payment.TrangThai !== 'PENDING' || booking.TrangThai !== 'PENDING' || booking.TrangThaiLich !== 'BOOKED') throw appError(409,'PAYMENT_NOT_PENDING','Lịch không còn chờ thanh toán.');
        if (booking.KhuyenMaiID) {
          await require('./khuyenmai.model').validateUsage(q, booking.KhuyenMaiID, booking.HoiVienID, 'PT', Number(booking.GiaThue));
          await q.query('INSERT INTO apdungkhuyenmaipt (KhuyenMaiID,ThuePTID,SoTienGiam) VALUES (?,?,?) ON DUPLICATE KEY UPDATE ThuePTID=VALUES(ThuePTID)', [booking.KhuyenMaiID,ThuePTID,booking.SoTienGiam]);
        }
        await q.query("UPDATE thanhtoan SET TrangThai='SUCCESS',NgayThanhToan=NOW() WHERE ThanhToanID=?", [payment.ThanhToanID]);
        await q.query("UPDATE thuept SET TrangThai='CONFIRMED' WHERE ThuePTID=?", [ThuePTID]);
      }
      await q.query("INSERT INTO hoadon (ThanhToanID,TongTien,TrangThai) VALUES (?,?,'ACTIVE') ON DUPLICATE KEY UPDATE ThanhToanID=VALUES(ThanhToanID)", [payment.ThanhToanID,payment.SoTien]);
      const [rows] = await q.query(`${bookingDetailSql} WHERE tp.ThuePTID=?`, [ThuePTID]);
      await q.commit();
      callback(null, { ...rows[0], alreadyConfirmed });
    } catch (e) { await q.rollback().catch(() => {}); callback(e); }
    finally { connection.release(); }
  });
};

Thuept.completeBooking = (ThuePTID, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();
    try {
      await query.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await query.beginTransaction();
      const [owners] = await query.query('SELECT HoiVienID FROM thuept WHERE ThuePTID=?', [ThuePTID]);
      if (owners.length) await query.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [owners[0].HoiVienID]);
      const [bookings] = await query.query(
        `SELECT tp.TrangThai, l.NgayLam, l.GioKetThuc
         FROM thuept tp
         INNER JOIN lichpt l ON l.LichPTID = tp.LichPTID
         WHERE tp.ThuePTID = ? LIMIT 1 FOR UPDATE`,
        [ThuePTID],
      );
      if (!bookings.length) {
        throw appError(404, "BOOKING_NOT_FOUND", "Khong tim thay lich thue PT");
      }
      if (bookings[0].TrangThai !== "CONFIRMED") {
        throw appError(409, "INVALID_BOOKING_STATUS", "Chi co the hoan thanh lich da xac nhan");
      }
      const [payments] = await query.query('SELECT TrangThai FROM thanhtoan WHERE ThuePTID=? FOR UPDATE', [ThuePTID]);
      if (payments[0]?.TrangThai !== 'SUCCESS') throw appError(409,'PAYMENT_NOT_SUCCESS','PT chưa thanh toán.');
      const [timeCheck] = await query.query(
        "SELECT TIMESTAMP(?, ?) <= NOW() AS HasEnded",
        [bookings[0].NgayLam, bookings[0].GioKetThuc],
      );
      if (!timeCheck[0].HasEnded) {
        throw appError(409, "BOOKING_NOT_ENDED", "Lich PT chua ket thuc");
      }
      await query.query(
        "UPDATE thuept SET TrangThai = 'COMPLETED' WHERE ThuePTID = ? AND TrangThai = 'CONFIRMED'",
        [ThuePTID],
      );
      const [updated] = await query.query(`${bookingDetailSql} WHERE tp.ThuePTID = ?`, [ThuePTID]);
      await query.commit();
      callback(null, updated[0]);
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thuept.cancel = (input, callback) => {
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();
    try {
      await query.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await query.beginTransaction();
      const [owners] = await query.query('SELECT HoiVienID FROM thuept WHERE ThuePTID=?', [input.ThuePTID]);
      if (owners.length) await query.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [owners[0].HoiVienID]);
      const [bookings] = await query.query(
        `SELECT tp.ThuePTID, tp.LichPTID, tp.TrangThai, l.NgayLam, l.GioBatDau
         FROM thuept tp
         INNER JOIN hoivien hv ON hv.HoiVienID = tp.HoiVienID
         INNER JOIN lichpt l ON l.LichPTID = tp.LichPTID
         WHERE tp.ThuePTID = ? AND hv.TaiKhoanID = ?
         LIMIT 1 FOR UPDATE`,
        [input.ThuePTID, input.TaiKhoanID],
      );
      if (!bookings.length) {
        throw appError(404, "BOOKING_NOT_FOUND", "Không tìm thấy lịch thuê PT");
      }
      const booking = bookings[0];
      const [payments] = await query.query('SELECT ThanhToanID,TrangThai FROM thanhtoan WHERE ThuePTID=? FOR UPDATE', [booking.ThuePTID]);
      if (payments[0]?.TrangThai === 'SUCCESS') throw appError(409,'REFUND_REQUIRED','Đã thanh toán; cần quy trình refund.');
      if (payments[0]?.TrangThai !== 'PENDING') throw appError(409,'PAYMENT_NOT_PENDING','Thanh toán không còn chờ.');
      await query.query("UPDATE thanhtoan SET TrangThai='CANCELLED' WHERE ThanhToanID=?", [payments[0].ThanhToanID]);
      if (!['PENDING', 'CONFIRMED'].includes(booking.TrangThai)) {
        throw appError(409, "BOOKING_NOT_CANCELLABLE", "Lịch này không thể hủy");
      }
      const [timeCheck] = await query.query(
        "SELECT TIMESTAMP(?, ?) > NOW() AS IsFuture",
        [booking.NgayLam, booking.GioBatDau],
      );
      if (!timeCheck[0].IsFuture) {
        throw appError(409, "BOOKING_NOT_CANCELLABLE", "Lịch PT đã diễn ra");
      }
      await query.query(
        "UPDATE thuept SET TrangThai = 'CANCELLED' WHERE ThuePTID = ?",
        [booking.ThuePTID],
      );
      await query.query(
        "UPDATE lichpt SET TrangThai = 'AVAILABLE' WHERE LichPTID = ? AND TrangThai = 'BOOKED'",
        [booking.LichPTID],
      );
      const [updated] = await query.query(
        `${bookingDetailSql} WHERE tp.ThuePTID = ?`,
        [booking.ThuePTID],
      );
      await query.commit();
      callback(null, updated[0]);
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Thuept.insert = (thuept, callback) => {
  const sqlString = "INSERT INTO `thuept` SET ?";
  db.query(sqlString, thuept, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { ThuePTID: res.insertId, ...thuept });
  });
};

Thuept.update = (thuept, ThuePTID, callback) => {
  const sqlString = "UPDATE `thuept` SET ? WHERE `ThuePTID` = ?";
  db.query(sqlString, [thuept, ThuePTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật thuept thành công" });
  });
};

Thuept.delete = (ThuePTID, callback) => {
  db.query("DELETE FROM `thuept` WHERE `ThuePTID` = ?", [ThuePTID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa thuept thành công" });
  });
};

module.exports = Thuept;
