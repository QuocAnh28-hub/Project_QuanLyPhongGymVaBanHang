const Donhang = require('../models/donhang.model');
const Thongbao = require('../models/thongbao.model');

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function respondError(res, error) {
  if (error?.status) return res.status(error.status).json({ message: error.message, code: error.code });
  console.error('Loi nghiep vu don hang:', error);
  return res.status(500).json({ message: 'Khong the xu ly don hang' });
}

const DonhangController = {

  getAll: (req, res) => {
    Donhang.getAll((err, result) => {
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
    const id = req.params.DonHangID;

    Donhang.getById(id, (err, result) => {
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

  updateDelivery: (req, res) => {
    const id = positiveInteger(req.params.DonHangID);
    const DiaChiGiaoHang = String(req.body?.DiaChiGiaoHang || '').trim();
    const GhiChu = req.body?.GhiChu == null ? null : String(req.body.GhiChu).trim();
    if (!id || !DiaChiGiaoHang || DiaChiGiaoHang.length > 255 || (GhiChu && GhiChu.length > 500)) {
      return res.status(400).json({ message: 'Thong tin giao hang khong hop le' });
    }
    Donhang.updateDelivery(id, { DiaChiGiaoHang, GhiChu }, (error, result) => {
      if (error) return respondError(res, error);
      res.json({ message: 'Cap nhat giao hang thanh cong', data: result });
    });
  },

  transitionStatus: (req, res) => {
    const id = positiveInteger(req.params.DonHangID);
    const TrangThai = String(req.body?.TrangThai || '').trim().toUpperCase();
    if (!id || !['CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(TrangThai)) {
      return res.status(400).json({ message: 'Trang thai don hang khong hop le' });
    }
    Donhang.transitionStatus(id, TrangThai, (error, result, previousStatus) => {
      if (error) return respondError(res, error);
      Thongbao.notifyOrderStatus(result, previousStatus);
      res.json({ message: 'Cap nhat trang thai thanh cong', data: result });
    });
  },

  create: (req, res) => {
    const data = req.body;

    Donhang.insert(data, (err, result) => {
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
    const id = req.params.DonHangID;
    const data = req.body;

    Donhang.update(data, id, (err, result) => {
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
    const id = req.params.DonHangID;

    Donhang.delete(id, (err, result) => {
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

module.exports = DonhangController;
