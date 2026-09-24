const crypto = require('crypto');
const Checkin = require('../models/checkin.model');

const TOKEN_SECONDS = 45;

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function apiError(res, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message, code: error.code });
  }
  console.error('Lỗi nghiệp vụ check-in:', error);
  return res.status(500).json({ message: 'Không thể xử lý check-in' });
}

function signingSecret() {
  const secret = process.env.CHECKIN_TOKEN_SECRET;
  if (!secret) {
    const error = new Error('Backend chưa cấu hình CHECKIN_TOKEN_SECRET');
    error.status = 503;
    error.code = 'CHECKIN_CONFIG_MISSING';
    throw error;
  }
  return secret;
}

function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const unsigned = `v1.${encoded}`;
  const signature = crypto
    .createHmac('sha256', signingSecret())
    .update(unsigned)
    .digest('base64url');
  return `${unsigned}.${signature}`;
}

function verify(token) {
  if (typeof token !== 'string' || token.length > 255) {
    const error = new Error('Token QR không hợp lệ');
    error.status = 400;
    error.code = 'QR_INVALID';
    throw error;
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1') {
    const error = new Error('Token QR không đúng định dạng');
    error.status = 400;
    error.code = 'QR_INVALID';
    throw error;
  }

  const unsigned = `${parts[0]}.${parts[1]}`;
  const expected = crypto
    .createHmac('sha256', signingSecret())
    .update(unsigned)
    .digest();
  let received;
  try {
    received = Buffer.from(parts[2], 'base64url');
  } catch (_) {
    received = Buffer.alloc(0);
  }
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    const error = new Error('Chữ ký QR không hợp lệ');
    error.status = 401;
    error.code = 'QR_SIGNATURE_INVALID';
    throw error;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch (_) {
    const error = new Error('Payload QR không hợp lệ');
    error.status = 400;
    error.code = 'QR_INVALID';
    throw error;
  }

  const now = Math.floor(Date.now() / 1000);
  if (
    !positiveInteger(payload?.h) ||
    !positiveInteger(payload?.d) ||
    !Number.isInteger(payload?.iat) ||
    !Number.isInteger(payload?.exp) ||
    typeof payload?.jti !== 'string' ||
    payload.iat > now + 5
  ) {
    const error = new Error('Payload QR không hợp lệ');
    error.status = 400;
    error.code = 'QR_INVALID';
    throw error;
  }
  if (payload.exp <= now) {
    const error = new Error('Mã QR đã hết hạn');
    error.status = 410;
    error.code = 'QR_EXPIRED';
    throw error;
  }
  return payload;
}

function requireGateKey(req, res) {
  const configured = process.env.CHECKIN_GATE_KEY;
  if (configured && req.get('x-gate-key') !== configured) {
    res.status(401).json({ message: 'Gate key không hợp lệ', code: 'GATE_UNAUTHORIZED' });
    return false;
  }
  return true;
}

const CheckinController = {

  createToken: (req, res) => {
    const accountId = positiveInteger(req.body?.TaiKhoanID);
    if (!accountId) {
      return res.status(400).json({ message: 'TaiKhoanID không hợp lệ', code: 'INVALID_ACCOUNT_ID' });
    }

    Checkin.getEligibilityByAccount(accountId, (err, membership) => {
      if (err) return apiError(res, err);
      if (
        !membership ||
        membership.TrangThaiTaiKhoan !== 'ACTIVE' ||
        membership.TrangThaiHoiVien !== 'ACTIVE' ||
        membership.TrangThaiDangKy !== 'ACTIVE'
      ) {
        return res.status(403).json({ message: 'Bạn chưa có gói tập đang hoạt động.', code: 'MEMBERSHIP_NOT_ACTIVE' });
      }
      if (membership.TrangThaiThanhToan !== 'SUCCESS') {
        return res.status(403).json({ message: 'Thanh toán gói tập chưa hoàn tất.', code: 'PAYMENT_NOT_SUCCESS' });
      }
      if (membership.TinhTrangNgay !== 'OK') {
        const notStarted = membership.TinhTrangNgay === 'MEMBERSHIP_NOT_STARTED';
        return res.status(403).json({
          message: notStarted ? 'Gói tập chưa đến ngày kích hoạt.' : 'Gói tập đã hết hạn.',
          code: membership.TinhTrangNgay,
        });
      }

      try {
        const issued = Math.floor(Date.now() / 1000);
        const expires = issued + TOKEN_SECONDS;
        const token = sign({
          h: membership.HoiVienID,
          d: membership.DangKyID,
          iat: issued,
          exp: expires,
          jti: crypto.randomBytes(8).toString('base64url'),
        });
        res.json({
          token,
          issuedAt: new Date(issued * 1000).toISOString(),
          expiresAt: new Date(expires * 1000).toISOString(),
          expiresIn: TOKEN_SECONDS,
          DangKyID: membership.DangKyID,
          HoiVienID: membership.HoiVienID,
        });
      } catch (error) {
        apiError(res, error);
      }
    });
  },

  scan: (req, res) => {
    if (!requireGateKey(req, res)) return;
    let payload;
    try {
      payload = verify(req.body?.token);
    } catch (error) {
      return apiError(res, error);
    }

    Checkin.scan(
      {
        token: req.body.token,
        HoiVienID: payload.h,
        DangKyID: payload.d,
        exp: payload.exp,
      },
      (err, result) => {
        if (err) return apiError(res, err);
        res.status(201).json({ message: 'Check-in thành công', data: result });
      },
    );
  },

  checkout: (req, res) => {
    if (!requireGateKey(req, res)) return;
    const id = positiveInteger(req.params.CheckInID);
    if (!id) return res.status(400).json({ message: 'CheckInID không hợp lệ' });
    Checkin.checkout(id, (err, result) => {
      if (err) return apiError(res, err);
      res.json({ message: 'Check-out thành công', data: result });
    });
  },

  getHistoryByAccount: (req, res) => {
    const accountId = positiveInteger(req.params.TaiKhoanID);
    if (!accountId) return res.status(400).json({ message: 'TaiKhoanID không hợp lệ' });
    Checkin.getHistoryByAccount(accountId, (err, result) => {
      if (err) return apiError(res, err);
      res.json(result);
    });
  },

  getAll: (req, res) => {
    Checkin.getAll((err, result) => {
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
    const id = req.params.CheckInID;

    Checkin.getById(id, (err, result) => {
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

    Checkin.insert(data, (err, result) => {
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
    const id = req.params.CheckInID;
    const data = req.body;

    Checkin.update(data, id, (err, result) => {
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
    const id = req.params.CheckInID;

    Checkin.delete(id, (err, result) => {
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

module.exports = CheckinController;
