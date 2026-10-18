const router = require('express').Router();
const db = require('../common/db');
const { verifyPassword, hashPassword, isHash } = require('../common/password');
const { signToken, publicAccount, requireAuth } = require('../middleware/auth');

async function login(req, res) {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;
  if (!email || typeof password !== 'string' || !password || password.length > 1024)
    return res.status(400).json({ message: 'Email và mật khẩu không hợp lệ.' });
  try {
    const [rows] = await db.promise().query('SELECT TaiKhoanID, Email, MatKhau, VaiTro, TrangThai FROM taikhoan WHERE Email = ? LIMIT 1', [email]);
    const account = rows[0];
    if (!account || !(await verifyPassword(password, account.MatKhau))) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    if (account.TrangThai !== 'ACTIVE') return res.status(403).json({ message: 'Tài khoản không hoạt động.' });
    if (req.requiredRole && String(account.VaiTro).toUpperCase() !== req.requiredRole) return res.status(403).json({ message: 'Bạn không có quyền đăng nhập tại đây.' });
    if (!isHash(account.MatKhau)) await db.promise().query('UPDATE taikhoan SET MatKhau = ? WHERE TaiKhoanID = ? AND MatKhau = ?', [await hashPassword(password), account.TaiKhoanID, account.MatKhau]);
    const token = signToken(account);
    res.set('Cache-Control', 'no-store').json({ token, expiresAt: Date.now() + 12 * 60 * 60 * 1000, account: publicAccount(account) });
  } catch (error) { res.status(error.status || 503).json({ message: error.message || 'Không thể đăng nhập.' }); }
}
router.post('/login', login);
router.get('/me', requireAuth, (req, res) => res.set('Cache-Control', 'no-store').json({ account: req.auth }));
router.post('/logout', requireAuth, (_req, res) => res.sendStatus(204));
module.exports = { router, login };
