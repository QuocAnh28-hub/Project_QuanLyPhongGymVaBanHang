// Actual mysql2 DATE decoding; fixture writes are rolled back.
const assert=require('assert/strict');
const {randomUUID}=require('crypto');
const db=require('../common/db');
const payments=require('../models/thanhtoan.model');
(async()=>{
 const c=await db.promise().getConnection();
 const original=db.getConnection;
 const bridge={query:(...args)=>c.query(...args),beginTransaction:()=>c.query('SAVEPOINT confirmation'),commit:()=>c.query('RELEASE SAVEPOINT confirmation'),rollback:()=>c.query('ROLLBACK TO SAVEPOINT confirmation')};
 db.getConnection=callback=>callback(null,{promise:()=>bridge,release:()=>{}});
 try{
  await c.beginTransaction();
  const insert=async(sql,args=[])=> (await c.query(sql,args))[0].insertId;
  const account=await insert('INSERT INTO taikhoan (Email,MatKhau) VALUES (?,?)',[`queue-${randomUUID()}@example.invalid`,randomUUID()]);
  const member=await insert('INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,?)',[account,'Queue regression fixture']);
  const plan=await insert('INSERT INTO goitap (TenGoi,ThoiHan,Gia) VALUES (?,30,1000)',['Queue fixture']);
  const term=await insert('INSERT INTO goitapthoihan (GoiTapID,SoThang,GiaGoc,GiaBan) VALUES (?,1,1000,1000)',[plan]);
  const active=await insert("INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayBatDau,NgayKetThuc,GiaThanhToan,TrangThai) VALUES (?,?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL 1 MONTH),1000,'ACTIVE')",[member,plan,term]);
  await insert("INSERT INTO thanhtoan (DangKyID,HoiVienID,SoTien,PhuongThucThanhToan,TrangThai) VALUES (?,?,1000,'TIEN_MAT','SUCCESS')",[active,member]);
  const pending=await insert("INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayBatDau,NgayKetThuc,GiaThanhToan,TrangThai) VALUES (?,?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL 1 MONTH),1000,'PENDING')",[member,plan,term]);
  const payment=await insert("INSERT INTO thanhtoan (DangKyID,HoiVienID,SoTien,PhuongThucThanhToan,NoiDung,TrangThai) VALUES (?,?,1000,'TIEN_MAT','PACKAGE_ACTIVATION:QUEUE_AFTER_CURRENT','PENDING')",[pending,member]);
  const [[raw]]=await c.query('SELECT MAX(NgayKetThuc) value FROM dangkygoitap WHERE DangKyID=?',[active]);
  assert(raw.value instanceof Date,'Regression must exercise mysql2 Date decoding');
  const confirm=()=>new Promise((resolve,reject)=>payments.confirmPackagePayment(payment,(e,r)=>e?reject(e):resolve(r)));
  const result=await confirm();assert.equal(result.TrangThai,'SUCCESS');
  const [[dates]]=await c.query("SELECT DATE_FORMAT(d.NgayBatDau,'%Y-%m-%d') start,DATE_FORMAT(DATE_ADD(a.NgayKetThuc,INTERVAL 1 DAY),'%Y-%m-%d') expected FROM dangkygoitap d JOIN dangkygoitap a ON a.DangKyID=? WHERE d.DangKyID=?",[active,pending]);
  assert.equal(dates.start,dates.expected);
  await confirm();
  const [[invoices]]=await c.query('SELECT COUNT(*) n FROM hoadon WHERE ThanhToanID=?',[payment]);assert.equal(invoices.n,1);
  console.log('PASS: mysql2 DATE queue confirmation, next-day start, repeat confirmation creates one invoice.');
 }finally{db.getConnection=original;await c.rollback();c.release();await db.promise().end();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
