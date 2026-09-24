const { randomInt, randomBytes, createHash, timingSafeEqual } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest();
const fail = (status, message) => Object.assign(new Error(message), { status });

// Single-process store: restarting BE invalidates all pending recovery sessions.
function createRecoveryService({ findAccount, updatePassword, sendCode, now = Date.now }) {
  const sessions = new Map();
  const limits = new Map();
  function clean() {
    for (const [key, value] of sessions) if (value.expires <= now() && !value.busy) sessions.delete(key);
    for (const [key, value] of limits) if (value.expires <= now()) limits.delete(key);
  }
  function limit(key, max, duration) {
    const entry = limits.get(key) || { count: 0, expires: now() + duration };
    if (entry.count >= max) throw fail(429, 'Bạn thao tác quá nhiều lần. Vui lòng chờ rồi thử lại.');
    entry.count++;
    limits.set(key, entry);
  }
  function normalize(email) {
    if (typeof email !== 'string' || email.length > 100 || !/^[^\s<>;,]+@[^\s<>;,]+\.[^\s<>;,]+$/.test(email.trim())) {
      throw fail(400, 'Email không hợp lệ.');
    }
    return email.trim().toLowerCase();
  }
  return {
    async request(email, ip) {
      email = normalize(email);
      clean();
      if (limits.size > 10000 || sessions.size > 5000) throw fail(503, 'Máy chủ đang bận. Vui lòng thử lại sau.');
      limit(`ip:${ip}`, 20, 3600000);
      limit(`email:${email}`, 5, 3600000);
      limit(`cooldown:${email}`, 1, 60000);
      const previous = sessions.get(email);
      if (previous?.busy) throw fail(429, 'Yêu cầu đang được xử lý.');
      const account = await findAccount(email);
      if (account) {
        const code = String(randomInt(0, 1000000)).padStart(6, '0');
        const entry = { accountId: account.TaiKhoanID, digest: hash(code), attempts: 0, expires: now() + 120000, busy: true };
        sessions.set(email, entry);
        try {
          await sendCode(email, code);
          entry.expires = now() + 120000;
          entry.busy = false;
        } catch (error) {
          // Never log the raw SMTP error: it may contain addresses or credentials.
          const code = typeof error.code === 'string' && /^[A-Z_]+$/.test(error.code) ? error.code : 'SMTP_ERROR';
          if (code === 'SMTP_NOT_CONFIGURED') {
            console.error('[Recovery mail] Thiếu cấu hình SMTP trong BE/.env. Điền SMTP_HOST, SMTP_USER, SMTP_PASS và khởi động lại BE.');
          } else {
            console.error('[Recovery mail]', code, Number(error.responseCode) || '');
          }
          sessions.delete(email);
          throw fail(503, 'Không gửi được email xác nhận. Vui lòng thử lại sau hoặc liên hệ phòng gym.');
        }
      }
      return { message: 'Nếu email thuộc tài khoản hội viên đang hoạt động, mã xác nhận sẽ được gửi đến hộp thư.', expiresIn: 120, retryAfter: 60 };
    },
    verify(email, code, ip) {
      email = normalize(email);
      clean();
      limit(`verify:${ip}`, 60, 600000);
      const entry = sessions.get(email);
      if (!entry || entry.busy || entry.token || entry.attempts >= 5) throw fail(400, 'Mã đã hết hạn hoặc không hợp lệ. Hãy yêu cầu mã mới.');
      entry.attempts++;
      if (typeof code !== 'string' || !/^\d{6}$/.test(code) || !timingSafeEqual(hash(code), entry.digest)) {
        throw fail(400, 'Mã xác nhận không đúng. Bạn có tối đa 5 lần thử.');
      }
      const resetToken = randomBytes(32).toString('hex');
      entry.token = hash(resetToken);
      entry.expires = now() + 300000;
      delete entry.digest;
      return { resetToken, expiresIn: 300 };
    },
    async reset(email, token, password) {
      email = normalize(email);
      clean();
      if (typeof password !== 'string' || password.length < 8 || password.length > 255 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        throw fail(400, 'Mật khẩu cần 8–255 ký tự, gồm chữ và số.');
      }
      const entry = sessions.get(email);
      if (!entry?.token || entry.busy || typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || !timingSafeEqual(hash(token), entry.token)) {
        throw fail(400, 'Phiên đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      }
      entry.busy = true;
      try {
        const changed = await updatePassword(entry.accountId, password);
        if (!changed) throw fail(400, 'Tài khoản không còn được phép khôi phục mật khẩu.');
        sessions.delete(email);
        return { message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' };
      } finally { entry.busy = false; }
    },
  };
}
module.exports = { createRecoveryService };
