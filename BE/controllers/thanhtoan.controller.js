const Thanhtoan = require('../models/thanhtoan.model');
const Thongbao = require('../models/thongbao.model');

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function sendError(res, error, fallback) {
  if (error.status) {
    return res.status(error.status).json({
      message: error.message,
      code: error.code,
      ...(error.data && { data: error.data })
    });
  }
  console.error(fallback, error);
  return res.status(500).json({ message: fallback });
}

const ThanhtoanController = {

  getHistoryByAccount: (req, res) => {
    const id = positiveInteger(req.params.TaiKhoanID);
    if (!id) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Thanhtoan.getHistoryByAccount(id, (error, rows) => error
      ? sendError(res, error, 'Không thể tải lịch sử giao dịch')
      : res.json(rows));
  },

  createPackagePayment: (req, res) => {
    const DangKyID = positiveInteger(req.body?.DangKyID);
    const PhuongThucThanhToan = String(req.body?.PhuongThucThanhToan || '');
    if (!DangKyID) return res.status(400).json({ message: 'DangKyID không hợp lệ' });
    if (!['TIEN_MAT', 'CHUYEN_KHOAN', 'THE'].includes(PhuongThucThanhToan)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    Thanhtoan.createPackagePayment({ DangKyID, PhuongThucThanhToan }, (error, result) => {
      if (error) return sendError(res, error, 'Không thể tạo yêu cầu thanh toán');
      res.status(result.existing ? 200 : 201).json({
        message: result.existing
          ? result.payment.TrangThai === 'SUCCESS'
            ? 'Đăng ký đã được thanh toán'
            : 'Đăng ký đã có thanh toán đang chờ xử lý'
          : 'Tạo yêu cầu thanh toán thành công',
        data: result.payment
      });
    });
  },

  getPackagePaymentDetail: (req, res) => {
    const id = positiveInteger(req.params.ThanhToanID);
    if (!id) return res.status(400).json({ message: 'ThanhToanID không hợp lệ' });
    Thanhtoan.getPackagePaymentDetail(id, (error, result) => {
      if (error) return sendError(res, error, 'Không thể tải thanh toán');
      if (!result) return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
      res.json(result);
    });
  },

  getByRegistration: (req, res) => {
    const id = positiveInteger(req.params.DangKyID);
    if (!id) return res.status(400).json({ message: 'DangKyID không hợp lệ' });
    Thanhtoan.getByRegistration(id, (error, result) => {
      if (error) return sendError(res, error, 'Không thể tải thanh toán');
      if (!result) return res.status(404).json({ message: 'Đăng ký chưa có thanh toán' });
      res.json(result);
    });
  },

  // Dev/test only until the project has an ADMIN/STAFF authorization guard.
  confirmPackagePayment: (req, res) => {
    const id = positiveInteger(req.params.ThanhToanID);
    if (!id) return res.status(400).json({ message: 'ThanhToanID không hợp lệ' });
    Thanhtoan.confirmPackagePayment(id, (error, result) => {
      if (!error && !result.alreadyConfirmed) {
        Thanhtoan.getPackagePaymentDetail(id, (detailError, detail) => {
          if (detailError || !detail) return console.error('Không tải được gói để tạo thông báo', detailError);
          Thongbao.notifyMember(result.HoiVienID, {
            Loai: 'PACKAGE_PAYMENT', DanhMuc: 'TRANSACTION',
            TieuDe: 'Thanh toán gói tập thành công',
            NoiDung: `Gói ${detail.TenGoi} đã được kích hoạt.`,
            ActionType: 'MEMBERSHIP', ActionPayload: { ThanhToanID: id },
          });
        });
      }
      if (error) return sendError(res, error, 'Không thể xác nhận thanh toán');
      res.json({
        message: result.alreadyConfirmed
          ? 'Thanh toán đã được xác nhận trước đó'
          : 'Xác nhận thanh toán và kích hoạt gói tập thành công',
        data: result
      });
    });
  },

  cancelPackagePayment: (req, res) => {
    const id = positiveInteger(req.params.ThanhToanID);
    if (!id) return res.status(400).json({ message: 'ThanhToanID không hợp lệ' });
    Thanhtoan.cancelPackagePayment(id, (error, result) => {
      if (error) return sendError(res, error, 'Không thể hủy thanh toán');
      res.json({ message: 'Đã hủy thanh toán', data: result });
    });
  },

  getAll: (req, res) => {
    Thanhtoan.getAll((err, result) => {
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
    const id = req.params.ThanhToanID;

    Thanhtoan.getById(id, (err, result) => {
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

    Thanhtoan.insert(data, (err, result) => {
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
    const id = req.params.ThanhToanID;
    const data = req.body;

    Thanhtoan.update(data, id, (err, result) => {
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
    const id = req.params.ThanhToanID;

    Thanhtoan.delete(id, (err, result) => {
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

module.exports = ThanhtoanController;
