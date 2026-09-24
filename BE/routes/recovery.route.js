const router = require('express').Router();
const db = require('../common/db');
const { sendRecoveryCode } = require('../common/mailer');
const { createRecoveryService } = require('../services/recovery');
const service = createRecoveryService({
  async findAccount(email) {
    const [rows] = await db.promise().query("SELECT TaiKhoanID FROM taikhoan WHERE Email = ? AND VaiTro = 'CUSTOMER' AND TrangThai = 'ACTIVE' LIMIT 1", [email]);
    return rows[0];
  },
  async updatePassword(id, password) {
    // Compatible with the existing account/login password format.
    const [result] = await db.promise().query("UPDATE taikhoan SET MatKhau = ? WHERE TaiKhoanID = ? AND VaiTro = 'CUSTOMER' AND TrangThai = 'ACTIVE'", [password, id]);
    return result.affectedRows > 0;
  },
  sendCode: sendRecoveryCode,
});
for (const [path, action] of [
  ['/forgot-password', req => service.request(req.body?.email, req.ip)],
  ['/verify-otp', req => service.verify(req.body?.email, req.body?.code, req.ip)],
  ['/reset-password', req => service.reset(req.body?.email, req.body?.resetToken, req.body?.password)],
]) {
  router.post(path, async (req, res) => {
    try { res.json(await action(req)); }
    catch (error) { res.status(error.status || 500).json({ message: error.status ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.' }); }
  });
}
module.exports = router;
