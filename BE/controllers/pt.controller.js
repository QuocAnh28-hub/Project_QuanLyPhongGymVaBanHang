const Pt = require('../models/pt.model');

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const PtController = {

  getActive: (req, res) => {
    Pt.getActive((err, result) => {
      if (err) return res.status(500).json({ message: 'Lỗi khi lấy danh sách PT' });
      res.json(result);
    });
  },

  getActiveById: (req, res) => {
    const id = positiveInteger(req.params.PTID);
    if (!id) return res.status(400).json({ message: 'PTID không hợp lệ' });
    Pt.getActiveById(id, (err, result) => {
      if (err) return res.status(500).json({ message: 'Lỗi khi lấy chi tiết PT' });
      if (!result) return res.status(404).json({ message: 'Không tìm thấy PT đang hoạt động' });
      res.json(result);
    });
  },

  getAll: (req, res) => {
    Pt.getAll((err, result) => {
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
    const id = req.params.PTID;

    Pt.getById(id, (err, result) => {
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

    Pt.insert(data, (err, result) => {
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
    const id = req.params.PTID;
    const data = req.body;

    Pt.update(data, id, (err, result) => {
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
    const id = req.params.PTID;

    Pt.delete(id, (err, result) => {
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

module.exports = PtController;
