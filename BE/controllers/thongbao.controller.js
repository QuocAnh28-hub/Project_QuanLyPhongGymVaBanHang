const Thongbao = require('../models/thongbao.model');

const id = value => { const n = Number(value); return Number.isInteger(n) && n > 0 ? n : null; };
const fail = (res, error) => { console.error('Lỗi thông báo', error); return res.status(500).json({ message: 'Không thể xử lý thông báo' }); };

module.exports = {
  list(req, res) {
    const accountId = id(req.params.TaiKhoanID);
    if (!accountId) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Thongbao.list(accountId, (error, rows) => error ? fail(res, error) : res.json(rows));
  },
  markRead(req, res) {
    const notificationId = id(req.params.ThongBaoID);
    if (!notificationId) return res.status(400).json({ message: 'ThongBaoID không hợp lệ' });
    Thongbao.markRead(notificationId, (error, result) => error ? fail(res, error) : result.affectedRows ? res.json({ message: 'Đã đánh dấu đã đọc' }) : res.status(404).json({ message: 'Không tìm thấy thông báo' }));
  },
  markAllRead(req, res) {
    const accountId = id(req.params.TaiKhoanID);
    if (!accountId) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Thongbao.markAllRead(accountId, (error, result) => error ? fail(res, error) : res.json({ message: 'Đã đánh dấu tất cả đã đọc', count: result.affectedRows }));
  },
  preferences(req, res) {
    const accountId = id(req.params.TaiKhoanID);
    if (!accountId) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Thongbao.preferences(accountId, (error, result) => error ? fail(res, error) : res.json(result));
  },
  updatePreferences(req, res) {
    const accountId = id(req.params.TaiKhoanID);
    if (!accountId) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    const allowed = Object.keys(Thongbao.defaults);
    const patch = {};
    for (const key of allowed) {
      if (Object.hasOwn(req.body || {}, key)) {
        if (typeof req.body[key] !== 'boolean') return res.status(400).json({ message: `${key} phải là boolean` });
        patch[key] = req.body[key];
      }
    }
    if (!Object.keys(patch).length) return res.status(400).json({ message: 'Không có cài đặt hợp lệ' });
    Thongbao.updatePreferences(accountId, patch, (error, result) => error ? fail(res, error) : res.json(result));
  },
};
