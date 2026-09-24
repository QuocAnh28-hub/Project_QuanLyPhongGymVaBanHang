const Thuept = require('../models/thuept.model');

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function respondError(res, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message, code: error.code });
  }
  console.error('Lỗi nghiệp vụ thuê PT:', error);
  return res.status(500).json({ message: 'Không thể xử lý lịch thuê PT' });
}

const ThueptController = {

  book: (req, res) => {
    const TaiKhoanID = positiveInteger(req.body?.TaiKhoanID);
    const LichPTID = positiveInteger(req.body?.LichPTID);
    const GhiChu = req.body?.GhiChu ? String(req.body.GhiChu).trim().slice(0, 500) : null;
    if (!TaiKhoanID || !LichPTID) {
      return res.status(400).json({ message: 'TaiKhoanID hoặc LichPTID không hợp lệ' });
    }
    Thuept.book({ TaiKhoanID, LichPTID, GhiChu }, (err, result) => {
      if (err) return respondError(res, err);
      res.status(201).json({ message: 'Đăng ký lịch PT thành công', data: result });
    });
  },

  getByAccount: (req, res) => {
    const id = positiveInteger(req.params.TaiKhoanID);
    if (!id) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Thuept.getByAccount(id, (err, result) => {
      if (err) return respondError(res, err);
      res.json(result);
    });
  },

  getDetail: (req, res) => {
    const id = positiveInteger(req.params.ThuePTID);
    if (!id) return res.status(400).json({ message: 'ThuePTID không hợp lệ' });
    Thuept.getDetail(id, (err, result) => {
      if (err) return respondError(res, err);
      if (!result) return res.status(404).json({ message: 'Không tìm thấy lịch thuê PT' });
      res.json(result);
    });
  },

  confirm: (req, res) => {
    const id = positiveInteger(req.params.ThuePTID);
    if (!id) return res.status(400).json({ message: 'ThuePTID không hợp lệ' });
    Thuept.confirmBooking(id, (err, result) => {
      if (err) return respondError(res, err);
      res.json({ message: 'Xác nhận lịch PT thành công', data: result });
    });
  },

  cancel: (req, res) => {
    const ThuePTID = positiveInteger(req.params.ThuePTID);
    const TaiKhoanID = positiveInteger(req.body?.TaiKhoanID);
    if (!ThuePTID || !TaiKhoanID) {
      return res.status(400).json({ message: 'ThuePTID hoặc TaiKhoanID không hợp lệ' });
    }
    Thuept.cancel({ ThuePTID, TaiKhoanID }, (err, result) => {
      if (err) return respondError(res, err);
      res.json({ message: 'Hủy lịch PT thành công', data: result });
    });
  },

  getAll: (req, res) => {
    Thuept.getAll((err, result) => {
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
    const id = req.params.ThuePTID;

    Thuept.getById(id, (err, result) => {
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

    Thuept.insert(data, (err, result) => {
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
    const id = req.params.ThuePTID;
    const data = req.body;

    Thuept.update(data, id, (err, result) => {
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
    const id = req.params.ThuePTID;

    Thuept.delete(id, (err, result) => {
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

module.exports = ThueptController;
