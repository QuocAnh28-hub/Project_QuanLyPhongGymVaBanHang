const nodemailer = require('nodemailer');

let transporter;
async function sendRecoveryCode(email, code) {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    const missing = Object.entries({ SMTP_HOST, SMTP_USER, SMTP_PASS })
      .filter(([, value]) => !value?.trim()).map(([key]) => key);
    throw Object.assign(new Error('SMTP_NOT_CONFIGURED'), { code: 'SMTP_NOT_CONFIGURED', missing });
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: SMTP_HOST, port, secure: port === 465,
      requireTLS: port !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      disableFileAccess: true, disableUrlAccess: true,
    });
  }
  const result = await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to: { address: email, name: '' },
    subject: 'QA-Gym — Mã xác nhận đặt lại mật khẩu',
    text: `Mã xác nhận của bạn là: ${code}\nMã có hiệu lực trong 2 phút và chỉ sử dụng một lần. Không chia sẻ mã này với bất kỳ ai.\nNếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.`,
  });
  if (!result.accepted?.length) throw new Error('MAIL_REJECTED');
}
module.exports = { sendRecoveryCode };
