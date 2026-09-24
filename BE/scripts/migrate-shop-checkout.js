const fs = require('node:fs');
const path = require('node:path');
const db = require('../common/db');

(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '../../database/migrations/003_shop_checkout.sql'), 'utf8');
    await db.promise().query(sql);
    console.log('Shop checkout migration applied.');
  } catch (error) {
    console.error('Shop checkout migration failed:', error.code || error.message);
    process.exitCode = 1;
  } finally { await db.promise().end(); }
})();
