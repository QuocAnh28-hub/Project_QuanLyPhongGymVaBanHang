const assert = require('node:assert/strict');
const db = require('../common/db');
const Report = require('../models/report.model');
const Payment = require('../models/thanhtoan.model');
const Promotion = require('../models/khuyenmai.model');

const call = fn => new Promise((resolve, reject) => fn((error, result) => error ? reject(error) : resolve(result)));
(async () => {
  const [[schema]] = await db.promise().query("SELECT DATABASE() db, EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='shopcheckout') shopcheckout");
  assert.equal(schema.shopcheckout, 1, 'shopcheckout migration is required by the existing Shop flow');
  const report = await Report.getAdmin('2000-01-01 00:00:00', '2100-01-01 00:00:00');
  const [[expected]] = await db.promise().query("SELECT COALESCE(SUM(SoTien),0) total FROM thanhtoan WHERE TrangThai='SUCCESS'");
  assert.equal(Number(report.revenue.total), Number(expected.total), 'report revenue must only include SUCCESS payments');
  const payments = await call(Payment.getAll);
  const [[missing]] = await db.promise().query("SELECT COUNT(*) count FROM thanhtoan tt LEFT JOIN hoadon h ON h.ThanhToanID=tt.ThanhToanID WHERE tt.TrangThai='SUCCESS' AND tt.DangKyID IS NOT NULL AND h.HoaDonID IS NULL");
  assert.equal(missing.count, 0, 'successful package payments must have one invoice');
  const promotionStats = await call(Promotion.getStats);
  console.log({ database: schema.db, payments: payments.length, promotionStats, successRevenue: Number(expected.total), existingPackagePaymentsWithoutInvoice: missing.count });
})().then(() => db.end()).catch(error => { console.error(error); db.end(); process.exitCode = 1; });
