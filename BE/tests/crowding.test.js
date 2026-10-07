// Run: node BE/tests/crowding.test.js (real MySQL, disposable schema).
const assert=require('node:assert/strict');
const mysql=require('mysql2/promise');
const path=require('node:path');
require('dotenv').config({path:path.join(__dirname,'../.env')});
const sourceName=process.env.DB_NAME;
const testName=`gym_crowding_test_${process.pid}_${Date.now()}`;
(async()=>{
  assert.match(testName,/^gym_crowding_test_\d+_\d+$/); assert.notEqual(sourceName,testName);
  const setup=await mysql.createConnection({host:process.env.DB_HOST,port:Number(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD||'',database:sourceName});
  let db,server;
  try {
    await setup.query(`CREATE DATABASE \`${testName}\``); await setup.query(`USE \`${testName}\``);
    await setup.query('SET FOREIGN_KEY_CHECKS=0');
    for (const table of ['taikhoan','hoivien','maqr','checkin']) {
      const [rows]=await setup.query(`SHOW CREATE TABLE \`${sourceName}\`.\`${table}\``);
      const ddl=rows[0]['Create Table']; assert(!ddl.includes(`REFERENCES \`${sourceName}\``)); await setup.query(ddl);
    }
    await setup.query('SET FOREIGN_KEY_CHECKS=1');
    process.env.DB_NAME=testName;
    process.env.AUTH_TOKEN_SECRET=process.env.AUTH_TOKEN_SECRET||require('node:crypto').randomBytes(32).toString('hex');
    db=require('../common/db'); const q=db.promise();
    const insert=async(sql,args=[]) => (await q.query(sql,args))[0].insertId;
    const accounts=[],members=[];
    for(let i=0;i<2;i++) {
      accounts.push(await insert("INSERT INTO taikhoan (Email,MatKhau) VALUES (?,'test-only')",[`crowding-${i}@example.test`]));
      members.push(await insert("INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,'PRIVATE_MEMBER')",[accounts[i]]));
    }
    let qrIndex=0;
    const session=async(member,start,end,status='CHECKED_OUT')=>{
      const qr=await insert('INSERT INTO maqr (MaCode,NgayHetHan) VALUES (?,DATE_ADD(NOW(),INTERVAL 1 HOUR))',[`crowding-${++qrIndex}`]);
      await insert(`INSERT INTO checkin (HoiVienID,MaQRID,ThoiGianCheckIn,ThoiGianCheckOut,TrangThai) VALUES (?,?,${start},${end},?)`,[member,qr,status]);
    };
    await session(members[0],"TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'10:30:00')","TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'12:00:00')");
    await session(members[1],"TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'11:00:00')","TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'11:30:00')");
    await session(members[0],"TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 2 DAY),'23:30:00')","TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'00:30:00')");
    await session(members[0],'DATE_SUB(NOW(),INTERVAL 1 HOUR)','NULL','CHECKED_IN');
    await session(members[1],'DATE_SUB(NOW(),INTERVAL 1 HOUR)','NULL','CHECKED_IN');
    await session(members[0],"TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 35 DAY),'11:00:00')","TIMESTAMP(DATE_SUB(CURDATE(),INTERVAL 35 DAY),'12:00:00')");
    const app=require('../app'); server=app.listen(0,'127.0.0.1'); await new Promise(resolve=>server.once('listening',resolve));
    const {signToken}=require('../middleware/auth');const token=signToken({TaiKhoanID:accounts[0]});
    const before=JSON.stringify((await q.query('SELECT * FROM checkin ORDER BY CheckInID'))[0]);
    const response=await fetch(`http://127.0.0.1:${server.address().port}/checkin/crowding`,{headers:{Authorization:`Bearer ${token}`}});
    assert.equal(response.status,200);const data=await response.json();
    assert.equal(data.currentCount,2);assert.equal(data.sampleSessions,3);assert.equal(data.hours.length,24);
    const near=(hour,value)=>assert(Math.abs(data.hours.find(h=>h.hour===hour).averageCount-value)<0.000001);
    near(10,.5/28);near(11,1.5/28);near(12,0);near(23,.5/28);near(0,.5/28);
    assert.equal(data.hours.find(h=>h.hour===12).sessions,0);
    assert(!JSON.stringify(data).includes('PRIVATE_MEMBER'));assert(!JSON.stringify(data).includes('HoiVienID'));
    assert.equal(JSON.stringify((await q.query('SELECT * FROM checkin ORDER BY CheckInID'))[0]),before);
    const denied=await fetch(`http://127.0.0.1:${server.address().port}/checkin/crowding`);assert.equal(denied.status,401);
    console.log('PASS: real hourly occupancy, overlapping sessions, midnight boundaries, current count, privacy and read-only GET');
  } finally {
    if(server) await new Promise(resolve=>server.close(resolve));if(db)await db.promise().end();
    await setup.query(`DROP DATABASE IF EXISTS \`${testName}\``);await setup.end();
  }
})().catch(e=>{console.error(e);process.exitCode=1});
