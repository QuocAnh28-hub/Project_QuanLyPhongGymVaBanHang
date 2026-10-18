const db = require('../common/db');

const defaults = {
  PushEnabled: false, EmailEnabled: true, SmsEnabled: true,
  PtReminderEnabled: true, PromotionEnabled: true,
  TransactionEnabled: true, SystemEnabled: true,
};

const Thongbao = {
  defaults,
  createNotification(input, callback) {
    db.query('INSERT INTO thongbao SET ?', {
      TaiKhoanID: input.TaiKhoanID,
      Loai: input.Loai,
      DanhMuc: input.DanhMuc,
      TieuDe: input.TieuDe,
      NoiDung: input.NoiDung,
      DoUuTien: input.DoUuTien || 'NORMAL',
      ActionType: input.ActionType || null,
      ActionPayload: input.ActionPayload ? JSON.stringify(input.ActionPayload) : null,
    }, callback);
  },
  notifyMember(hoiVienID, input) {
    db.query('SELECT TaiKhoanID FROM hoivien WHERE HoiVienID = ?', [hoiVienID], (error, rows) => {
      if (error || !rows?.length) return console.error('Không xác định được người nhận thông báo', error);
      this.createNotification({ TaiKhoanID: rows[0].TaiKhoanID, ...input }, (insertError) => {
        if (insertError) console.error('Không thể ghi thông báo', insertError);
      });
    });
  },
  notifyOrderStatus(order, previousStatus) {
    if (order.TrangThai === previousStatus || !['CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(order.TrangThai)) return;
    this.notifyMember(order.HoiVienID, {
      Loai: 'ORDER_STATUS', DanhMuc: 'TRANSACTION',
      TieuDe: `Đơn hàng #${order.DonHangID} đã cập nhật`,
      NoiDung: `Trạng thái đơn hàng: ${order.TrangThai}.`,
      ActionType: 'ORDER', ActionPayload: { DonHangID: order.DonHangID },
    });
  },
  list(accountId, callback) {
    db.query('SELECT * FROM thongbao WHERE TaiKhoanID = ? ORDER BY NgayTao DESC, ThongBaoID DESC', [accountId], callback);
  },
  markRead(id, callback) {
    db.query('UPDATE thongbao SET NgayDoc = COALESCE(NgayDoc, NOW()) WHERE ThongBaoID = ?', [id], callback);
  },
  markAllRead(accountId, callback) {
    db.query('UPDATE thongbao SET NgayDoc = NOW() WHERE TaiKhoanID = ? AND NgayDoc IS NULL', [accountId], callback);
  },
  preferences(accountId, callback) {
    db.query('SELECT * FROM caidatthongbao WHERE TaiKhoanID = ?', [accountId], (error, rows) => callback(error, { TaiKhoanID: accountId, ...defaults, ...(rows?.[0] || {}) }));
  },
  updatePreferences(accountId, patch, callback) {
    db.query('INSERT INTO caidatthongbao SET ? ON DUPLICATE KEY UPDATE ?', [{ TaiKhoanID: accountId, ...patch }, patch], (error) => {
      if (error) return callback(error);
      this.preferences(accountId, callback);
    });
  },
};

module.exports = Thongbao;
