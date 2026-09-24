const Dangkygoitap = require('../models/dangkygoitap.model');

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function isValidYmd(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function localDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

function dateDistanceInDays(from, to) {
  const [fromYear, fromMonth, fromDay] = from.split('-').map(Number);
  const [toYear, toMonth, toDay] = to.split('-').map(Number);

  return Math.round(
    (
      Date.UTC(toYear, toMonth - 1, toDay) -
      Date.UTC(fromYear, fromMonth - 1, fromDay)
    ) / 86400000
  );
}

const DangkygoitapController = {

  getAll: (req, res) => {
    Dangkygoitap.getAll((err, result) => {
      if (err) {
        return res.status(500).json({
          message: 'Lỗi khi lấy dữ liệu',
          error: err
        });
      }
      res.json(result);
    });
  },

  getDetailById: (req, res) => {
    const id = positiveInteger(req.params.DangKyID);

    if (!id) {
      return res.status(400).json({ message: 'DangKyID không hợp lệ' });
    }

    Dangkygoitap.getDetailById(id, (err, result) => {
      if (err) {
        console.error('Lỗi khi lấy chi tiết đăng ký gói tập:', err);
        return res.status(500).json({ message: 'Lỗi khi lấy dữ liệu' });
      }

      if (!result) {
        return res.status(404).json({ message: 'Không tìm thấy đăng ký gói tập' });
      }

      res.json(result);
    });
  },

  getById: (req, res) => {
    const id = req.params.DangKyID;

    Dangkygoitap.getById(id, (err, result) => {
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

  register: (req, res) => {
    const TaiKhoanID = positiveInteger(req.body?.TaiKhoanID);
    const GoiTapID = positiveInteger(req.body?.GoiTapID);
    const GoiTapThoiHanID = positiveInteger(req.body?.GoiTapThoiHanID);
    const NgayBatDau = String(req.body?.NgayBatDau || '');
    const MaKhuyenMai = req.body?.MaKhuyenMai
      ? String(req.body.MaKhuyenMai).trim().toUpperCase()
      : null;

    if (!TaiKhoanID) {
      return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    }
    if (!GoiTapID) {
      return res.status(400).json({ message: 'GoiTapID không hợp lệ' });
    }
    if (!GoiTapThoiHanID) {
      return res.status(400).json({ message: 'GoiTapThoiHanID không hợp lệ' });
    }
    if (!isValidYmd(NgayBatDau)) {
      return res.status(400).json({ message: 'NgayBatDau không hợp lệ' });
    }

    const today = localDate(new Date());
    const distance = dateDistanceInDays(today, NgayBatDau);

    if (distance < 0 || distance > 30) {
      return res.status(400).json({
        message: 'NgayBatDau phải nằm trong 30 ngày tới'
      });
    }

    Dangkygoitap.register(
      {
        TaiKhoanID,
        GoiTapID,
        GoiTapThoiHanID,
        NgayBatDau,
        MaKhuyenMai
      },
      (err, result) => {
        if (err) {
          if (err.status) {
            return res.status(err.status).json({
              message: err.message,
              code: err.code,
              ...(err.data && { data: err.data })
            });
          }

          console.error('Lỗi khi đăng ký gói tập:', err);
          return res.status(500).json({ message: 'Không thể tạo đăng ký gói tập' });
        }

        res.status(201).json({
          message: 'Tạo đăng ký gói tập thành công',
          data: result
        });
      }
    );
  },

  create: (req, res) => {
    const data = req.body;

    Dangkygoitap.insert(data, (err, result) => {
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
    const id = req.params.DangKyID;
    const data = req.body;

    Dangkygoitap.update(data, id, (err, result) => {
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
    const id = req.params.DangKyID;

    Dangkygoitap.delete(id, (err, result) => {
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

module.exports = DangkygoitapController;
