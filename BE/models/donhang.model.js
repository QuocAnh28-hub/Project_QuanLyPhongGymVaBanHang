const db = require("../common/db");

function appError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

const Donhang = (donhang) => {
  this.DonHangID = donhang.DonHangID;
  this.HoiVienID = donhang.HoiVienID;
  this.NgayDat = donhang.NgayDat;
  this.TongTien = donhang.TongTien;
  this.TrangThai = donhang.TrangThai;
  this.DiaChiGiaoHang = donhang.DiaChiGiaoHang;
  this.GhiChu = donhang.GhiChu;
};

Donhang.getById = (DonHangID, callback) => {
  const sqlString = "SELECT * FROM `donhang` WHERE `DonHangID` = ?";
  db.query(sqlString, [DonHangID], (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Donhang.getAll = (callback) => {
  const sqlString = "SELECT * FROM `donhang`";
  db.query(sqlString, (err, result) => {
    if (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

Donhang.updateDelivery = (DonHangID, delivery, callback) => {
  db.query(
    `UPDATE donhang SET DiaChiGiaoHang = ?, GhiChu = ?
     WHERE DonHangID = ? AND TrangThai NOT IN ('COMPLETED', 'CANCELLED')`,
    [delivery.DiaChiGiaoHang, delivery.GhiChu, DonHangID],
    (error, result) => {
      if (error) return callback(error);
      if (result.affectedRows !== 1) {
        return Donhang.getById(DonHangID, (findError, rows) => {
          if (findError) return callback(findError);
          callback(rows.length
            ? appError(409, 'ORDER_FINISHED', 'Don hang da ket thuc')
            : appError(404, 'ORDER_NOT_FOUND', 'Khong tim thay don hang'));
        });
      }
      Donhang.getById(DonHangID, (findError, rows) => callback(findError, rows?.[0]));
    },
  );
};

Donhang.transitionStatus = (DonHangID, nextStatus, callback) => {
  const transitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['COMPLETED'],
  };
  db.getConnection(async (connectionError, connection) => {
    if (connectionError) return callback(connectionError);
    const query = connection.promise();
    try {
      await query.query("SET TRANSACTION ISOLATION LEVEL READ COMMITTED");
      await query.beginTransaction();
      const [owners] = await query.query('SELECT HoiVienID FROM donhang WHERE DonHangID=?', [DonHangID]);
      if (owners.length) await query.query('SELECT HoiVienID FROM hoivien WHERE HoiVienID=? FOR UPDATE', [owners[0].HoiVienID]);
      const [orders] = await query.query(
        `SELECT o.*, t.ThanhToanID, t.TrangThai AS TrangThaiThanhToan
         FROM donhang o
         LEFT JOIN shopcheckout x ON x.DonHangID = o.DonHangID
         LEFT JOIN thanhtoan t ON t.ThanhToanID = x.ThanhToanID
         WHERE o.DonHangID = ? LIMIT 1 FOR UPDATE`,
        [DonHangID],
      );
      if (!orders.length) throw appError(404, 'ORDER_NOT_FOUND', 'Khong tim thay don hang');
      const order = orders[0];
      if (!transitions[order.TrangThai]?.includes(nextStatus)) {
        throw appError(409, 'INVALID_ORDER_TRANSITION', 'Chuyen trang thai don hang khong hop le');
      }
      if (order.TrangThaiThanhToan === 'SUCCESS' && nextStatus === 'CANCELLED') {
        throw appError(409, 'PAID_ORDER_NOT_CANCELLABLE', 'Đơn đã thanh toán; cần quy trình refund.');
      }
      if (nextStatus !== 'CANCELLED' && order.TrangThaiThanhToan && order.TrangThaiThanhToan !== 'SUCCESS') {
        throw appError(409, 'PAYMENT_NOT_SUCCESSFUL', 'Thanh toan chua thanh cong');
      }
      if (nextStatus === 'CANCELLED' && order.ThanhToanID) {
        if (order.TrangThaiThanhToan !== 'PENDING') throw appError(409, 'PAYMENT_NOT_PENDING', 'Chỉ hủy thanh toán đang chờ.');
        await query.query("UPDATE thanhtoan SET TrangThai='CANCELLED' WHERE ThanhToanID=?", [order.ThanhToanID]);
      }
      await query.query('UPDATE donhang SET TrangThai = ? WHERE DonHangID = ?', [nextStatus, DonHangID]);
      await query.commit();
      callback(null, { ...order, TrangThai: nextStatus }, order.TrangThai);
    } catch (error) {
      try { await query.rollback(); } catch (_) {}
      callback(error);
    } finally {
      connection.release();
    }
  });
};

Donhang.insert = (donhang, callback) => {
  const sqlString = "INSERT INTO `donhang` SET ?";
  db.query(sqlString, donhang, (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { DonHangID: res.insertId, ...donhang });
  });
};

Donhang.update = (donhang, DonHangID, callback) => {
  const sqlString = "UPDATE `donhang` SET ? WHERE `DonHangID` = ?";
  db.query(sqlString, [donhang, DonHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Cập nhật donhang thành công" });
  });
};

Donhang.delete = (DonHangID, callback) => {
  db.query("DELETE FROM `donhang` WHERE `DonHangID` = ?", [DonHangID], (err, res) => {
    if (err) {
      return callback(err);
    }
    callback(null, { message: "Xóa donhang thành công" });
  });
};

module.exports = Donhang;
