const assert=require('assert/strict');const {randomUUID}=require('crypto');
const db=require('../common/db');
(async()=>{
 const c=await db.promise().getConnection();const original=db.query;
 db.query=(sql,args,cb)=>{if(typeof args==='function'){cb=args;args=[];}c.query(sql,args).then(([rows])=>cb(null,rows),cb);};
 const promotion=require('../models/khuyenmai.model');
 const read=method=>new Promise((resolve,reject)=>promotion[method]((e,r)=>e?reject(e):resolve(r)));
 try{
  await c.beginTransaction();
  const insert=async(sql,args=[])=> (await c.query(sql,args))[0].insertId;
  const baseline=await read('getStats');
  const code='AUDIT_'+randomUUID().slice(0,8);
  const promo=await insert("INSERT INTO khuyenmai (MaKhuyenMai,TenKhuyenMai,PhanTramGiam,NgayBatDau,NgayKetThuc) VALUES (?,'Statistics fixture',10,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_ADD(NOW(),INTERVAL 1 DAY))",[code]);
  const account=await insert('INSERT INTO taikhoan (Email,MatKhau) VALUES (?,?)',[randomUUID()+'@example.invalid',randomUUID()]);
  const member=await insert('INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,?)',[account,'Promotion fixture']);
  const plan=await insert("INSERT INTO goitap (TenGoi,ThoiHan,Gia) VALUES ('Fixture plan',30,100000)");
  const term=await insert('INSERT INTO goitapthoihan (GoiTapID,SoThang,GiaGoc,GiaBan) VALUES (?,1,100000,100000)',[plan]);
  const regs=[];
  for(const status of ['PENDING','PENDING','CANCELLED']){
   const r=await insert('INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayBatDau,NgayKetThuc,GiaThanhToan,TrangThai) VALUES (?,?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL 1 MONTH),90000,?)',[member,plan,term,status]);
   regs.push(r);await insert('INSERT INTO apdungkhuyenmaigoitap (KhuyenMaiID,DangKyID,SoTienGiam) VALUES (?,?,10000)',[promo,r]);
  }
  const payment=async(reg,status)=>insert("INSERT INTO thanhtoan (DangKyID,HoiVienID,SoTien,PhuongThucThanhToan,TrangThai) VALUES (?,?,90000,'TIEN_MAT',?)",[reg,member,status]);
  await payment(regs[0],'SUCCESS');await payment(regs[0],'SUCCESS');await payment(regs[1],'PENDING');await payment(regs[2],'SUCCESS');
  const order=await insert("INSERT INTO donhang (HoiVienID,TongTien,TrangThai) VALUES (?,90000,'PENDING')",[member]);
  await insert('INSERT INTO apdungkhuyenmaidonhang (KhuyenMaiID,DonHangID,SoTienGiam) VALUES (?,?,10000)',[promo,order]);
  const orderPayment=await payment(null,'PENDING');
  const [[warehouse]]=await c.query('SELECT KhoID FROM kho LIMIT 1');
  await insert("INSERT INTO shopcheckout (DonHangID,ThanhToanID,HoiVienID,KhoID,RequestKey,RequestHash,TenNguoiNhan,SoDienThoai,CachNhan) VALUES (?,?,?,?,?,?,'Fixture','0912345678','PICKUP')",[order,orderPayment,member,warehouse.KhoID,randomUUID(),'a'.repeat(64)]);
  const [[shift]]=await c.query('SELECT LichPTID,PTID FROM lichpt LIMIT 1');
  const booking=await insert("INSERT INTO thuept (HoiVienID,PTID,LichPTID,GiaThue,TrangThai) VALUES (?,?,?,90000,'COMPLETED')",[member,shift.PTID,shift.LichPTID]);
  await insert('INSERT INTO apdungkhuyenmaipt (KhuyenMaiID,ThuePTID,SoTienGiam) VALUES (?,?,10000)',[promo,booking]);
  const summary=(await read('getAll')).find(p=>p.KhuyenMaiID===promo);
  assert.equal(summary.LuotSuDung,1);assert.equal(Number(summary.TongSoTienGiam),10000);assert.equal(summary.TinhTrang,'ACTIVE');assert.equal(summary.TrangThai,'ACTIVE');
  const history=(await read('getHistory')).filter(p=>p.KhuyenMaiID===promo);
  assert.equal(history.length,5);
  assert.equal(history.filter(p=>p.TinhTrangThanhToan==='SUCCESS').length,1);
  assert.equal(history.find(p=>p.Loai==='PT').TinhTrangThanhToan,'UNVERIFIED');
  const first=await read('getStats');assert.equal(first.LuotSuDung,baseline.LuotSuDung+1);assert.equal(Number(first.TongSoTienGiam),Number(baseline.TongSoTienGiam)+10000);
  for(const state of ['FAILED','CANCELLED']){
   await c.query('UPDATE thanhtoan SET TrangThai=? WHERE ThanhToanID=?',[state,orderPayment]);
   const row=(await read('getHistory')).find(p=>p.KhuyenMaiID===promo&&p.Loai==='SHOP');assert.equal(row.TinhTrangThanhToan,state);
   assert.equal((await read('getStats')).LuotSuDung,baseline.LuotSuDung+1);
  }
  await c.query("UPDATE thanhtoan SET TrangThai='SUCCESS' WHERE ThanhToanID=?",[orderPayment]);
  const second=await read('getStats');assert.equal(second.LuotSuDung,baseline.LuotSuDung+2);
  for(const [stored,period,expected] of [['ACTIVE','future','UPCOMING'],['ACTIVE','past','EXPIRED'],['INACTIVE','past','STOPPED'],['EXPIRED','future','EXPIRED']]){
   await c.query(`UPDATE khuyenmai SET TrangThai=?,NgayBatDau=DATE_ADD(NOW(),INTERVAL ${period==='future'?1:-2} DAY),NgayKetThuc=DATE_ADD(NOW(),INTERVAL ${period==='future'?2:-1} DAY) WHERE KhuyenMaiID=?`,[stored,promo]);
   const row=(await read('getAll')).find(p=>p.KhuyenMaiID===promo);assert.equal(row.TinhTrang,expected);assert.equal(row.TrangThai,stored);
  }
  console.log('PASS: paid-only stats, duplicate payment attempts counted once, pending/cancelled excluded, PT unverified, four lifecycle states preserve stored status.');
 }finally{db.query=original;await c.rollback();c.release();await db.promise().end();}
})().catch(e=>{console.error(e.message);process.exitCode=1});
