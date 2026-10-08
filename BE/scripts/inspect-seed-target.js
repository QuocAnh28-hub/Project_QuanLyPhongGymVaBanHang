const db = require('../common/db');
(async () => {
  try {
    for (const table of ['hoivien', 'donhang', 'kho', 'phieunhap', 'hoadon', 'checkin', 'dangkygoitap']) {
      const [[r]] = await db.promise().query('SELECT COUNT(*) n FROM ??', [table]);
      console.log(table, r.n);
    }
    const [triggers] = await db.promise().query('SHOW TRIGGERS');
    console.log('Triggers:', triggers.length);
    if (process.argv.includes('--verify-operations')) {
      const assert = require('node:assert/strict');
      const report = require('./seed-gym-operations-report.json');
      assert.equal(report.committed, true);
      for (const [table, ids] of Object.entries(report.ids)) {
        const [columns] = await db.promise().query('SHOW COLUMNS FROM ??', [table]);
        const primary = columns.find(c => c.Key === 'PRI').Field;
        const [[r]] = await db.promise().query('SELECT COUNT(*) n FROM ?? WHERE ?? IN (?)', [table, primary, ids]);
        assert.equal(r.n, ids.length, table);
      }
      const [states] = await db.promise().query('SELECT TrangThai, COUNT(*) n FROM dangkygoitap WHERE DangKyID IN (?) GROUP BY TrangThai', [report.ids.dangkygoitap]);
      console.log('New memberships:', JSON.stringify(states));
      const [orders] = await db.promise().query('SELECT TrangThai, COUNT(*) n FROM donhang WHERE DonHangID IN (?) GROUP BY TrangThai', [report.ids.donhang]);
      console.log('New orders:', JSON.stringify(orders));
      console.log('Persisted and verified:', report.totalAdded, 'records');
    }
  } finally { await db.promise().end(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
