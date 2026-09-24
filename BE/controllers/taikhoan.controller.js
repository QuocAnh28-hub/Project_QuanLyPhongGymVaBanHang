const Taikhoan = require('../models/taikhoan.model');

const TaikhoanController = {

  changePassword: (req, res) => {
    const id = Number(req.params.TaiKhoanID);
    const current = req.body?.MatKhauHienTai;
    const next = req.body?.MatKhauMoi;
    if (!Number.isInteger(id) || id < 1 || typeof current !== 'string' || !current || typeof next !== 'string') {
      return res.status(400).json({ message: 'Dữ liệu đổi mật khẩu không hợp lệ' });
    }
    if (next.length < 8 || !/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/[0-9]/.test(next) || !/[^A-Za-z0-9]/.test(next)) {
      return res.status(400).json({ message: 'Mật khẩu mới cần ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt' });
    }
    if (current === next) return res.status(400).json({ message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
    Taikhoan.getById(id, (error, rows) => {
      if (error) return res.status(500).json({ message: 'Không thể kiểm tra tài khoản' });
      const account = rows?.[0];
      if (!account) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
      if (account.TrangThai !== 'ACTIVE') return res.status(403).json({ message: 'Tài khoản không hoạt động' });
      if (account.MatKhau !== current) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
      Taikhoan.changePassword(id, current, next, (updateError, changed) => {
        if (updateError) return res.status(500).json({ message: 'Không thể đổi mật khẩu' });
        if (!changed) return res.status(409).json({ message: 'Tài khoản đã thay đổi, vui lòng thử lại' });
        res.json({ message: 'Mật khẩu đã được thay đổi.' });
      });
    });
  },

  getAll: (req, res) => {
    Taikhoan.getAll((err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Lỗi khi lấy dữ liệu',
          error: err
        });
      }
      res.json(result);
    });
  },

  getById: (req, res) => {
    const id = req.params.TaiKhoanID;

    Taikhoan.getById(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Lỗi khi lấy dữ liệu',
          error: err
        });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({
          message: 'Không tìm thấy dữ liệu'
        });
      }

      res.json(result[0]);
    });
  },

  create: (req, res) => {
    const data = req.body;

    Taikhoan.insert(data, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Thêm dữ liệu thất bại',
          error: err
        });
      }

      res.status(201).json({
        message: 'Thêm dữ liệu thành công',
        data: result
      });
    });
  },

  update: (req, res) => {
    const id = req.params.TaiKhoanID;
    const data = req.body;
    if (Object.hasOwn(data || {}, 'MatKhau')) return res.status(400).json({ message: 'Dùng endpoint change-password để đổi mật khẩu' });

    Taikhoan.update(data, id, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Cập nhật thất bại',
          error: err
        });
      }

      res.json({
        message: 'Cập nhật thành công',
        data: result
      });
    });
  },

  delete: (req, res) => {
    const id = req.params.TaiKhoanID;

    Taikhoan.delete(id, (err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Xóa thất bại',
          error: err
        });
      }

      res.json({
        message: 'Xóa thành công',
        data: result
      });
    });
  }

};

module.exports = TaikhoanController;
