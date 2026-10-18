// Run: node BE/tests/pending-registration.test.js
// Real MySQL, isolated schema, no application data copied or changed.
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname,'../.env') });
const sourceName = process.env.DB_NAME;
const testName = `gym_pending_test_${process.pid}_${Date.now()}`;
const call = (model, method, input) => new Promise((resolve,reject) => model[method](input,(e,r) => e ? reject(e) : resolve(r)));
(async () => {
  assert.match(testName,/^gym_pending_test_\d+_\d+$/);
  assert.notEqual(testName,sourceName);
  const setup = await mysql.createConnection({ host:process.env.DB_HOST,port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD || '',database:sourceName });
  let db,server;
  try {
    await setup.query(`CREATE DATABASE \`${testName}\``);
    await setup.query(`USE \`${testName}\``);
    await setup.query('SET FOREIGN_KEY_CHECKS=0');
    for (const table of ['taikhoan','hoivien','nhanvien','goitap','GoiTapThoiHan','dangkygoitap','thanhtoan']) {
      const [rows] = await setup.query(`SHOW CREATE TABLE \`${sourceName}\`.\`${table}\``);
      const ddl=rows[0]['Create Table'];
      assert(!ddl.includes(`REFERENCES \`${sourceName}\``));
      await setup.query(ddl);
    }
    await setup.query('SET FOREIGN_KEY_CHECKS=1');
    process.env.DB_NAME=testName;
    process.env.AUTH_TOKEN_SECRET=process.env.AUTH_TOKEN_SECRET || require('node:crypto').randomBytes(32).toString('hex');
    db=require('../common/db');
    const q=db.promise();
    const insert=async (sql,params=[]) => (await q.query(sql,params))[0].insertId;
    const one=async (sql,params=[]) => (await q.query(sql,params))[0][0];
    const account=await insert("INSERT INTO taikhoan (Email,MatKhau) VALUES ('pending@example.test','test-only')");
    const other=await insert("INSERT INTO taikhoan (Email,MatKhau) VALUES ('other@example.test','test-only')");
    const member=await insert("INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,'Test member')",[account]);
    const pkg=await insert("INSERT INTO goitap (TenGoi,ThoiHan,Gia) VALUES ('Resume package',30,1000)");
    const duration=await insert('INSERT INTO GoiTapThoiHan (GoiTapID,SoThang,GiaGoc,GiaBan) VALUES (?,1,1000,1000)',[pkg]);
    const id=await insert("INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayBatDau,NgayKetThuc,GiaThanhToan) VALUES (?,?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL 1 MONTH),900)",[member,pkg,duration]);
    const app=require('../app'); server=app.listen(0,'127.0.0.1');
    await new Promise(resolve=>server.once('listening',resolve));
    const {signToken}=require('../middleware/auth');
    const token=signToken({TaiKhoanID:account}), otherToken=signToken({TaiKhoanID:other});
    const request=async (accountId,auth=token,status=200) => {
      const res=await fetch(`http://127.0.0.1:${server.address().port}/dangkygoitap/pending/account/${accountId}`,{headers:auth ? {Authorization:`Bearer ${auth}`} : {}});
      const data=await res.json(); assert.equal(res.status,status,JSON.stringify(data)); return data;
    };
    const snapshot=async()=>JSON.stringify({registrations:(await q.query('SELECT * FROM dangkygoitap ORDER BY DangKyID'))[0],payments:(await q.query('SELECT * FROM thanhtoan ORDER BY ThanhToanID'))[0]});
    const before=await snapshot();
    for (let n=0;n<3;n++) {
      const pending=await request(account); assert.equal(pending.DangKyID,id); assert.equal(pending.TenGoi,'Resume package'); assert.equal(Number(pending.GiaThanhToan),900);
    }
    assert.equal(await snapshot(),before);
    await request(account,otherToken,403);
    await request(account,null,401);
    assert.equal(await request(other,otherToken),null);
    console.log('PASS pending registration survives re-opening; GET is read-only; JWT ownership enforced');
    const payments=require('../models/thanhtoan.model');
    const input={DangKyID:id,PhuongThucThanhToan:'CHUYEN_KHOAN',ActivationMode:'QUEUE_AFTER_CURRENT'};
    const first=await call(payments,'createPackagePayment',input);
    const second=await call(payments,'createPackagePayment',input);
    assert.equal(first.payment.ThanhToanID,second.payment.ThanhToanID);
    assert.equal(Number((await one('SELECT COUNT(*) n FROM dangkygoitap')).n),1);
    assert.equal(Number((await one('SELECT COUNT(*) n FROM thanhtoan')).n),1);
    assert.equal((await request(account)).DangKyID,id);
    const readBefore=await snapshot(); await request(account); assert.equal(await snapshot(),readBefore);
    await q.query("UPDATE thanhtoan SET TrangThai='SUCCESS' WHERE ThanhToanID=?",[first.payment.ThanhToanID]);
    assert.equal(await request(account),null);
    await q.query("UPDATE thanhtoan SET TrangThai='CANCELLED' WHERE ThanhToanID=?",[first.payment.ThanhToanID]);
    assert.equal(await request(account),null);
    await q.query("UPDATE thanhtoan SET TrangThai='FAILED' WHERE ThanhToanID=?",[first.payment.ThanhToanID]);
    assert.equal((await request(account)).DangKyID,id);
    await q.query("UPDATE dangkygoitap SET TrangThai='CANCELLED' WHERE DangKyID=?",[id]);
    assert.equal(await request(account),null);
    console.log('PASS resumes the same registration/payment; paid and cancelled registrations are excluded');
  } finally {
    if (server) await new Promise(resolve=>server.close(resolve));
    if (db) await db.promise().end();
    await setup.query(`DROP DATABASE IF EXISTS \`${testName}\``);
    await setup.end();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
