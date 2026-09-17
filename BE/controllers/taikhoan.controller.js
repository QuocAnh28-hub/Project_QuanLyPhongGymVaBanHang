const Taikhoan = require('../models/taikhoan.model');

const TaikhoanController = {

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
