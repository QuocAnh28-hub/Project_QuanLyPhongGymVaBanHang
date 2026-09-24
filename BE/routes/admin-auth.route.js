const express = require('express');
const crypto = require('crypto');
const db = require('../common/db');
const router = express.Router();
const sessions = new Map();
const digest = (value) => crypto.createHash('sha256').update(value).digest();
const isAdmin = (a) => String(a.VaiTro).trim().toUpperCase() === 'ADMIN';
const publicAccount = ({ TaiKhoanID, Email, VaiTro }) => ({ TaiKhoanID, Email, VaiTro });
const sessionKey = (req) => digest(req.get('Authorization')?.replace(/^Bearer /, '') || '').toString('hex');
setInterval(() => {
  for (const [key, session] of sessions) if (session.expiresAt <= Date.now()) sessions.delete(key);
}, 60000).unref();
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || !email.trim() || email.length > 254 || typeof password !== 'string' || !password || password.length > 1024) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu hợp lệ.' });
  db.query('SELECT TaiKhoanID, Email, MatKhau, VaiTro, TrangThai FROM taikhoan WHERE Email = ? LIMIT 1', [email.trim()], (error, rows) => {
    if (error) return res.status(503).json({ message: 'Không thể kết nối dữ liệu. Vui lòng thử lại.' });
    const account = rows?.[0];
    // Match the existing account/recovery password format.
    if (!account || !crypto.timingSafeEqual(digest(password), digest(String(account.MatKhau)))) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    if (account.TrangThai !== 'ACTIVE') return res.status(403).json({ message: 'Tài khoản đã bị khóa hoặc chưa được kích hoạt.' });
    if (!isAdmin(account)) return res.status(403).json({ message: 'Chỉ tài khoản Admin mới được truy cập trang quản trị.' });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
    sessions.set(digest(token).toString('hex'), { id: account.TaiKhoanID, expiresAt });
    res.set('Cache-Control', 'no-store').json({ token, expiresAt, account: publicAccount(account) });
  });
});
router.get('/session', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const key = sessionKey(req);
  const session = sessions.get(key);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(key);
    return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn.' });
  }
  db.query('SELECT TaiKhoanID, Email, VaiTro, TrangThai FROM taikhoan WHERE TaiKhoanID = ?', [session.id], (error, rows) => {
    if (error) return res.status(503).json({ message: 'Không thể kiểm tra phiên đăng nhập.' });
    const account = rows?.[0];
    if (!account || account.TrangThai !== 'ACTIVE' || !isAdmin(account)) {
      sessions.delete(key);
      return res.status(403).json({ message: 'Tài khoản không còn quyền truy cập.' });
    }
    res.json({ account: publicAccount(account), expiresAt: session.expiresAt });
  });
});
router.post('/logout', (req, res) => { sessions.delete(sessionKey(req)); res.sendStatus(204); });
module.exports = router;
