const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const db = require('../common/db');
const Maqr = require('../models/maqr.model');

async function main() {
  const connection = await db.promise().getConnection();
  const testName = `gym_qr_cleanup_test_${Date.now()}`;
  const originalQuery = db.query;
  try {
    await connection.query('CREATE DATABASE ??', [testName]);
    await connection.query('USE ??', [testName]);
    await connection.query(`CREATE TABLE maqr (MaQRID INT PRIMARY KEY, TrangThai VARCHAR(20), NgayHetHan DATETIME)`);
    await connection.query(`CREATE TABLE checkin (CheckInID INT PRIMARY KEY, MaQRID INT NOT NULL,
      TrangThai VARCHAR(20), ThoiGianCheckIn DATETIME,
      CONSTRAINT FK_CheckIn_MaQR FOREIGN KEY (MaQRID) REFERENCES maqr(MaQRID))`);
    await connection.query(fs.readFileSync(path.join(__dirname, '../sql/migration-qr-cleanup.sql'), 'utf8'));
    await connection.query(`INSERT INTO maqr VALUES
      (1,'ACTIVE',DATE_SUB(NOW(),INTERVAL 1 DAY)),
      (2,'EXPIRED',NULL),
      (3,'ACTIVE',DATE_ADD(NOW(),INTERVAL 1 DAY)),
      (4,'ACTIVE',NULL),
      (5,'INACTIVE',DATE_ADD(NOW(),INTERVAL 1 DAY)),
      (6,'INACTIVE',DATE_SUB(NOW(),INTERVAL 1 DAY))`);
    await connection.query("INSERT INTO checkin VALUES (1,1,'CHECKED_IN','2026-10-08 08:00:00')");
    db.query = (sql, callback) => connection.query(sql).then(([result]) => callback(null,result),callback);
    const cleanup = () => new Promise((resolve,reject)=>Maqr.cleanupExpired((e,r)=>e?reject(e):resolve(r)));
    assert.equal((await cleanup()).deleted,3);
    const [qr] = await connection.query('SELECT MaQRID FROM maqr ORDER BY MaQRID');
    assert.deepEqual(qr.map(r=>r.MaQRID),[3,4,5]);
    const [[history]] = await connection.query('SELECT * FROM checkin');
    assert.equal(history.MaQRID,null);
    assert.equal(history.TrangThai,'CHECKED_IN');
    assert.equal(history.CheckInID,1);
    assert.equal((await cleanup()).deleted,0);
    console.log('QR cleanup passed: expired only, history preserved, repeat safe.');
  } finally {
    db.query = originalQuery;
    await connection.query('DROP DATABASE IF EXISTS ??', [testName]);
    connection.release();
    await db.promise().end();
  }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
