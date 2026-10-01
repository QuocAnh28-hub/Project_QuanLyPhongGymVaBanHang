const jwt = require('jsonwebtoken');
const db = require('../common/db');

const secret = () => {
  if (!process.env.AUTH_TOKEN_SECRET) throw Object.assign(new Error('Thiếu cấu hình AUTH_TOKEN_SECRET.'), { status: 500 });
  return process.env.AUTH_TOKEN_SECRET;
};
const publicAccount = ({ TaiKhoanID, Email, VaiTro }) => ({ TaiKhoanID, Email, VaiTro: String(VaiTro).toUpperCase() });
const signToken = account => jwt.sign({ sub: String(account.TaiKhoanID) }, secret(), { expiresIn: '12h' });

function requireAuth(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return res.status(401).json({ message: 'Yêu cầu đăng nhập.' });
  let payload;
  try { payload = jwt.verify(token, secret()); }
  catch (error) { return res.status(error.status || 401).json({ message: error.status ? error.message : 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' }); }
  db.query('SELECT TaiKhoanID, Email, VaiTro, TrangThai FROM taikhoan WHERE TaiKhoanID = ? LIMIT 1', [payload.sub], (error, rows) => {
    if (error) return next(Object.assign(error, { status: 503 }));
    const account = rows?.[0];
    if (!account) return res.status(401).json({ message: 'Tài khoản không còn tồn tại.' });
    if (account.TrangThai !== 'ACTIVE') return res.status(403).json({ message: 'Tài khoản không hoạt động.' });
    req.auth = publicAccount(account);
    req.authExpiresAt = payload.exp * 1000;
    next();
  });
}
const requireRole = (...roles) => (req, res, next) => roles.includes(req.auth?.VaiTro)
  ? next() : res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
const requireSelfOrRole = (param, ...roles) => (req, res, next) =>
  roles.includes(req.auth?.VaiTro) || Number(req.params[param]) === Number(req.auth?.TaiKhoanID)
    ? next() : res.status(403).json({ message: 'Không được truy cập dữ liệu của tài khoản khác.' });

module.exports = { secret, signToken, publicAccount, requireAuth, requireRole, requireSelfOrRole };
