const crypto = require('crypto');
const Maqr = require('../models/maqr.model');

function ownerId(token) {
  try {
    const parts = token.split('.'), secret = process.env.CHECKIN_TOKEN_SECRET;
    if (parts.length !== 3 || parts[0] !== 'v1' || !secret) return null;
    const expected = crypto.createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
    const received = Buffer.from(parts[2], 'base64url');
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return null;
    const id = Number(JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')).h);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch (_) { return null; }
}

const mask = token => token.startsWith('v1.') ? `${token.slice(0, 10)}...${token.slice(-4)}` : `${token.slice(0, 8)}...${token.slice(-4)}`;

const MaqrController = {

  getAdmin: (_req, res) => {
    Maqr.getAdmin((err, rows) => {
      if (err) return res.status(500).json({ message: 'Không thể tải danh sách QR' });
      const ids = [...new Set(rows.map(row => ownerId(row.MaCode)).filter(Boolean))];
      Maqr.getMembers(ids, (memberError, members) => {
        if (memberError) return res.status(500).json({ message: 'Không thể tải chủ sở hữu QR' });
        const byId = new Map(members.map(member => [member.HoiVienID, member]));
        res.json(rows.map(row => {
          const HoiVienID = ownerId(row.MaCode), member = byId.get(HoiVienID);
          return { ...row, MaCode: mask(row.MaCode), HoiVienID, HoTen: member?.HoTen || '—', SoDienThoai: member?.SoDienThoai || null };
        }));
      });
    });
  },

  revoke: (req, res) => {
    const id = Number(req.params.MaQRID);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ message: 'MaQRID không hợp lệ' });
    Maqr.revoke(id, (err, result) => err ? res.status(err.status || 500).json({ message: err.message || 'Không thể thu hồi QR' }) : res.json({ message: 'Đã thu hồi QR', data: result }));
  },

  getAll: (req, res) => {
    Maqr.getAll((err, result) => {
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
    const id = req.params.MaQRID;

    Maqr.getById(id, (err, result) => {
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

    Maqr.insert(data, (err, result) => {
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
    const id = req.params.MaQRID;
    const data = req.body;

    Maqr.update(data, id, (err, result) => {
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
    const id = req.params.MaQRID;

    Maqr.delete(id, (err, result) => {
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

module.exports = MaqrController;
