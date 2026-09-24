const Hoivien = require('../models/hoivien.model');

const positiveId = (value) => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
const editable = ['HoTen', 'NgaySinh', 'GioiTinh', 'SoDienThoai', 'DiaChi', 'AnhDaiDien', 'ChieuCao', 'CanNang', 'MucTieuTheHinh'];

const HoivienController = {

  getByAccount: (req, res) => {
    const id = positiveId(req.params.TaiKhoanID);
    if (!id) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Hoivien.getProfileByAccount(id, (err, row) => {
      if (err) return res.status(500).json({ message: 'Không thể tải hồ sơ' });
      if (!row) return res.status(404).json({ message: 'Không tìm thấy hồ sơ hội viên' });
      res.json(row);
    });
  },

  updateByAccount: (req, res) => {
    const id = positiveId(req.params.TaiKhoanID);
    if (!id) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    const fields = Object.fromEntries(editable.filter((key) => Object.hasOwn(req.body || {}, key)).map((key) => [key, req.body[key]]));
    if (!Object.keys(fields).length) return res.status(400).json({ message: 'Không có trường hồ sơ hợp lệ' });
    if (fields.HoTen !== undefined && (typeof fields.HoTen !== 'string' || !fields.HoTen.trim() || fields.HoTen.length > 100)) return res.status(400).json({ message: 'Họ tên không hợp lệ' });
    if (fields.GioiTinh !== undefined && fields.GioiTinh !== null && !['NAM', 'NU', 'KHAC'].includes(fields.GioiTinh)) return res.status(400).json({ message: 'Giới tính không hợp lệ' });
    if (fields.NgaySinh !== undefined && fields.NgaySinh !== null && !/^\d{4}-\d{2}-\d{2}$/.test(fields.NgaySinh)) return res.status(400).json({ message: 'Ngày sinh không hợp lệ' });
    if (fields.SoDienThoai !== undefined && fields.SoDienThoai !== null && !/^0\d{9,10}$/.test(fields.SoDienThoai)) return res.status(400).json({ message: 'Số điện thoại không hợp lệ' });
    for (const key of ['ChieuCao', 'CanNang']) {
      if (fields[key] !== undefined && fields[key] !== null && (!Number.isFinite(Number(fields[key])) || Number(fields[key]) <= 0 || Number(fields[key]) > 999)) return res.status(400).json({ message: `${key} không hợp lệ` });
    }
    for (const key of ['DiaChi', 'AnhDaiDien', 'MucTieuTheHinh']) {
      if (fields[key] !== undefined && fields[key] !== null && (typeof fields[key] !== 'string' || fields[key].length > 255)) return res.status(400).json({ message: `${key} không hợp lệ` });
    }
    Hoivien.updateProfileByAccount(id, fields, (err, row) => {
      if (err) return res.status(500).json({ message: 'Không thể cập nhật hồ sơ' });
      if (!row) return res.status(404).json({ message: 'Không tìm thấy hồ sơ hội viên' });
      res.json(row);
    });
  },

  getAll: (req, res) => {
    Hoivien.getAll((err, result) => {
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
    const id = req.params.HoiVienID;

    Hoivien.getById(id, (err, result) => {
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

    Hoivien.insert(data, (err, result) => {
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
    const id = req.params.HoiVienID;
    const data = req.body;

    Hoivien.update(data, id, (err, result) => {
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
    const id = req.params.HoiVienID;

    Hoivien.delete(id, (err, result) => {
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

module.exports = HoivienController;
