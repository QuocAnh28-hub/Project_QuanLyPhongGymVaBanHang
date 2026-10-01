const Lichpt = require('../models/lichpt.model');

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validDate(value) {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function schedulePayload(body) {
  const PTID = positiveInteger(body?.PTID);
  const NgayLam = String(body?.NgayLam || '');
  const GioBatDau = String(body?.GioBatDau || '');
  const GioKetThuc = String(body?.GioKetThuc || '');
  const TrangThai = String(body?.TrangThai || '');
  if (!PTID || !/^\d{4}-\d{2}-\d{2}$/.test(NgayLam) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(GioBatDau)
      || !/^([01]\d|2[0-3]):[0-5]\d$/.test(GioKetThuc) || GioKetThuc <= GioBatDau
      || !['AVAILABLE', 'OFF'].includes(TrangThai)) return null;
  return { PTID, NgayLam, GioBatDau, GioKetThuc, TrangThai };
}

function respondWriteError(res, error, fallback) {
  if (error?.status) return res.status(error.status).json({ message: error.message, code: error.code });
  return res.status(500).json({ message: fallback, error });
}

const LichptController = {

  getAvailableByPT: (req, res) => {
    const ptId = positiveInteger(req.params.PTID);
    const from = req.query.from ? String(req.query.from) : null;
    const to = req.query.to ? String(req.query.to) : null;
    if (!ptId) return res.status(400).json({ message: 'PTID không hợp lệ' });
    if (!validDate(from) || !validDate(to) || (from && to && from > to)) {
      return res.status(400).json({ message: 'Khoảng ngày không hợp lệ' });
    }
    Lichpt.getAvailableByPT(ptId, from, to, (err, result) => {
      if (err) return res.status(500).json({ message: 'Lỗi khi lấy lịch PT' });
      res.json(result);
    });
  },

  getAll: (req, res) => {
    Lichpt.getAll((err, result) => {
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
    const id = req.params.LichPTID;

    Lichpt.getById(id, (err, result) => {
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
    const data = schedulePayload(req.body);
    if (!data) return res.status(400).json({ message: 'Du lieu ca PT khong hop le' });

    Lichpt.insert(data, (err, result) => {
      if (err) {
        return respondWriteError(res, err, 'Them du lieu that bai');
      }

      res.status(201).json({
        message: 'Thêm dữ liệu thành công',
        data: result
      });
    });
  },

  update: (req, res) => {
    const id = positiveInteger(req.params.LichPTID);
    const data = schedulePayload(req.body);
    if (!id || !data) return res.status(400).json({ message: 'Du lieu ca PT khong hop le' });

    Lichpt.update(data, id, (err, result) => {
      if (err) {
        return respondWriteError(res, err, 'Cap nhat that bai');
      }

      res.json({
        message: 'Cập nhật thành công',
        data: result
      });
    });
  },

  delete: (req, res) => {
    const id = positiveInteger(req.params.LichPTID);
    if (!id) return res.status(400).json({ message: 'LichPTID khong hop le' });

    Lichpt.delete(id, (err, result) => {
      if (err) {
        return respondWriteError(res, err, 'Xoa that bai');
      }

      res.json({
        message: 'Xóa thành công',
        data: result
      });
    });
  }

};

module.exports = LichptController;
