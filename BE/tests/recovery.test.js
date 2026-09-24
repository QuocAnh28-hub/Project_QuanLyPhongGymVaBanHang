const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createRecoveryService } = require('../services/recovery');
function setup(overrides = {}) {
  let time = 1000000;
  let code;
  const updates = [];
  const service = createRecoveryService({
    findAccount: async () => ({ TaiKhoanID: 7 }),
    updatePassword: async (...args) => { updates.push(args); return true; },
    sendCode: async (_email, value) => { code = value; },
    now: () => time, ...overrides,
  });
  return { service, updates, code: () => code, advance: ms => { time += ms; } };
}
const email = 'member@example.com';
test('mail OTP -> one-use reset token -> database update', async () => {
  const ctx = setup();
  const response = await ctx.service.request(email, 'ip');
  assert.equal(response.expiresIn, 120);
  assert.equal(response.code, undefined);
  assert.match(ctx.code(), /^\d{6}$/);
  const { resetToken } = ctx.service.verify(email, ctx.code(), 'ip');
  assert.throws(() => ctx.service.verify(email, ctx.code(), 'ip'));
  await assert.rejects(ctx.service.reset(email, 'bad', 'newpass123'));
  await ctx.service.reset(email, resetToken, 'newpass123');
  assert.deepEqual(ctx.updates, [[7, 'newpass123']]);
  await assert.rejects(ctx.service.reset(email, resetToken, 'other123'));
});
test('expired OTP, five wrong attempts and expired reset token are rejected', async () => {
  const expired = setup();
  await expired.service.request(email, 'ip');
  expired.advance(120001);
  assert.throws(() => expired.service.verify(email, expired.code(), 'ip'));
  const attempts = setup();
  await attempts.service.request(email, 'ip');
  const wrong = attempts.code() === '000000' ? '111111' : '000000';
  for (let i = 0; i < 5; i++) assert.throws(() => attempts.service.verify(email, wrong, 'ip'));
  assert.throws(() => attempts.service.verify(email, attempts.code(), 'ip'));
  const token = setup();
  await token.service.request(email, 'ip');
  const result = token.service.verify(email, token.code(), 'ip');
  token.advance(300001);
  await assert.rejects(token.service.reset(email, result.resetToken, 'newpass123'));
});
test('resend cooldown and new request invalidate previous token', async () => {
  const ctx = setup();
  await ctx.service.request(email, 'ip');
  await assert.rejects(ctx.service.request(email, 'ip'), { status: 429 });
  const { resetToken } = ctx.service.verify(email, ctx.code(), 'ip');
  ctx.advance(60001);
  await ctx.service.request(email, 'ip');
  await assert.rejects(ctx.service.reset(email, resetToken, 'newpass123'));
});
test('unknown account gives generic response and sends no email', async () => {
  const ctx = setup({ findAccount: async () => null });
  assert.equal((await ctx.service.request(email, 'ip')).expiresIn, 120);
  assert.equal(ctx.code(), undefined);
  assert.throws(() => ctx.service.verify(email, '123456', 'ip'));
});
test('SMTP failure invalidates OTP; database failure allows retry with same token', async () => {
  const smtp = setup({ sendCode: async () => { throw new Error('smtp'); } });
  await assert.rejects(smtp.service.request(email, 'ip'), { status: 503 });
  assert.throws(() => smtp.service.verify(email, '123456', 'ip'));
  let failed = false;
  const db = setup({ updatePassword: async () => { if (!failed) { failed = true; throw new Error('db'); } return true; } });
  await db.service.request(email, 'ip');
  const { resetToken } = db.service.verify(email, db.code(), 'ip');
  await assert.rejects(db.service.reset(email, resetToken, 'newpass123'));
  await db.service.reset(email, resetToken, 'newpass123');
});
