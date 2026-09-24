const Goitap = require('../models/goitap.model');

const GoitapController = {

  getAll: (req, res) => {
    Goitap.getAll((err, result) => {
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
    const id = req.params.GoiTapID;

    Goitap.getById(id, (err, result) => {
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

  getActive: (req, res) => {
    Goitap.getActive((err, result) => {
      if (err) {
        console.error('Lỗi khi lấy danh sách gói tập đang hoạt động:', err);
        return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
      }

      res.json(result);
    });
  },

  getActiveById: (req, res) => {
    const id = Number(req.params.GoiTapID);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'GoiTapID không hợp lệ' });
    }

    Goitap.getActiveById(id, (err, result) => {
      if (err) {
        console.error('Lỗi khi lấy gói tập đang hoạt động:', err);
        return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({
          message: 'Không tìm thấy gói tập đang hoạt động'
        });
      }

      res.json(result[0]);
    });
  },

  create: (req, res) => {
    const data = req.body;

    Goitap.insert(data, (err, result) => {
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
    const id = req.params.GoiTapID;
    const data = req.body;

    Goitap.update(data, id, (err, result) => {
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
    const id = req.params.GoiTapID;

    Goitap.delete(id, (err, result) => {
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

module.exports = GoitapController;
