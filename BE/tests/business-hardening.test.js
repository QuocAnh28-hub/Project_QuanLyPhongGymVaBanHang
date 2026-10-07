// Run: node BE/tests/business-hardening.test.js
// Uses real MySQL in a new, disposable database; never copies application rows.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sourceName = process.env.DB_NAME;
const testName = `gym_hardening_test_${process.pid}_${Date.now()}`;
const tables = ['taikhoan','hoivien','nhanvien','kho','danhmuc','sanpham','phieunhap','chitietphieunhap',
  'goitap','goitapthoihan','dangkygoitap','thanhtoan','hoadon','khuyenmai','apdungkhuyenmaigoitap',
  'donhang','chitietdonhang','shopcheckout','apdungkhuyenmaidonhang','pt','lichpt','thuept','apdungkhuyenmaipt',
  'giohang','chitietgiohang','checkin','maqr'];
const call = (model, method, ...args) => new Promise((resolve,reject) => model[method](...args,(e,r) => e ? reject(e) : resolve(r)));
async function migrate(connection) {
  let delimiter = ';', statement = '';
  const sql = fs.readFileSync(path.join(__dirname,'../../database/migrations/004_business_logic_hardening.sql'),'utf8');
  for (const line of sql.split(/\r?\n/)) {
    if (/^DELIMITER /i.test(line)) { delimiter=line.slice(10).trim(); continue; }
    if (/^\s*--/.test(line) || !line.trim()) continue;
    statement += line + '\n';
    if (statement.trimEnd().endsWith(delimiter)) {
      await connection.query(statement.trimEnd().slice(0,-delimiter.length)); statement='';
    }
  }
  assert.equal(statement.trim(),'');
}

(async () => {
  assert.match(testName,/^gym_hardening_test_\d+_\d+$/);
  assert.notEqual(sourceName,testName);
  const setup = await mysql.createConnection({ host:process.env.DB_HOST,port:Number(process.env.DB_PORT || 3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD || '',database:sourceName });
  let db, server;
  try {
    await setup.query(`CREATE DATABASE \`${testName}\``);
    await setup.query(`USE \`${testName}\``);
    await setup.query('SET FOREIGN_KEY_CHECKS=0');
    for (const table of tables) {
      const [rows] = await setup.query(`SHOW CREATE TABLE \`${sourceName}\`.\`${table}\``);
      const ddl = rows[0]['Create Table'];
      assert(!ddl.includes(`REFERENCES \`${sourceName}\``));
      await setup.query(ddl);
    }
    await setup.query('SET FOREIGN_KEY_CHECKS=1');
    await migrate(setup);
    await migrate(setup); // Re-running must not duplicate stock or payments.
    process.env.DB_NAME=testName;
    process.env.AUTH_TOKEN_SECRET=process.env.AUTH_TOKEN_SECRET || require('node:crypto').randomBytes(32).toString('hex');
    db = require('../common/db');
    const q = db.promise();
    const insert = async (sql,params=[]) => (await q.query(sql,params))[0].insertId;
    const row = async (sql,params=[]) => (await q.query(sql,params))[0][0];
    const count = async table => Number((await row(`SELECT COUNT(*) n FROM ${table}`)).n);
    const [{Today:today,Tomorrow:tomorrow,Yesterday:yesterday}] = (await q.query("SELECT DATE_FORMAT(CURDATE(),'%Y-%m-%d') Today,DATE_FORMAT(DATE_ADD(CURDATE(),INTERVAL 1 DAY),'%Y-%m-%d') Tomorrow,DATE_FORMAT(DATE_SUB(CURDATE(),INTERVAL 1 DAY),'%Y-%m-%d') Yesterday"))[0];
    const accounts=[];
    for (const role of ['ADMIN','STAFF','CUSTOMER','CUSTOMER']) accounts.push(await insert("INSERT INTO taikhoan (Email,MatKhau,VaiTro) VALUES (?, 'integration-test', ?)", [`hardening-${role}-${accounts.length}@example.test`,role]));
    const memberId=await insert('INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,?)',[accounts[2],'Test member']);
    await insert('INSERT INTO hoivien (TaiKhoanID,HoTen) VALUES (?,?)',[accounts[3],'Other member']);
    const employee=await insert('INSERT INTO nhanvien (TaiKhoanID,HoTen) VALUES (?,?)',[accounts[1],'Test employee']);
    const warehouse=await insert("INSERT INTO kho (TenKho) VALUES ('Test warehouse')");
    const category=await insert("INSERT INTO danhmuc (TenDanhMuc) VALUES ('Test category')");
    const product=await insert("INSERT INTO sanpham (DanhMucID,TenSanPham,GiaBan) VALUES (?,'Test product',100)",[category]);
    const product2=await insert("INSERT INTO sanpham (DanhMucID,TenSanPham,GiaBan) VALUES (?,'Test product 2',100)",[category]);
    const pkg=await insert("INSERT INTO goitap (TenGoi,ThoiHan,Gia) VALUES ('Test package',30,1000)");
    const duration=await insert('INSERT INTO goitapthoihan (GoiTapID,SoThang,GiaGoc,GiaBan) VALUES (?,1,1000,1000)',[pkg]);
    const registration= require('../models/dangkygoitap.model');
    const payment= require('../models/thanhtoan.model');
    const pt= require('../models/thuept.model');
    const requests= require('../models/member-requests.model');
    const promotions= require('../models/khuyenmai.model');
    const regInput={ TaiKhoanID:accounts[2],GoiTapID:pkg,GoiTapThoiHanID:duration,NgayBatDau:today,ActivationMode:'QUEUE_AFTER_CURRENT' };
    const r=await call(registration,'register',regInput);
    const app=require('../app');
    server=app.listen(0,'127.0.0.1');
    await new Promise(resolve => server.once('listening',resolve));
    const { signToken }=require('../middleware/auth');
    const tokens=accounts.map(TaiKhoanID => signToken({TaiKhoanID}));
    const http=async (url,body,role=0,expected=200) => {
      const res=await fetch(`http://127.0.0.1:${server.address().port}${url}`, { method:body===undefined ? 'GET':'POST',headers:{Authorization:`Bearer ${tokens[role]}`,'Content-Type':'application/json'},body:body===undefined ? undefined:JSON.stringify(body) });
      const data=await res.json();
      if (Array.isArray(expected)) assert(expected.includes(res.status),`${url}: ${JSON.stringify(data)}`);
      else assert.equal(res.status,expected,`${url}: ${JSON.stringify(data)}`);
      return data;
    };
    await http(`/dangkygoitap/${r.DangKyID}/renew`,{},3,403);
    console.log('PASS renew ownership 403');
    const receipt=await http('/phieunhap/with-items',{KhoID:warehouse,NhanVienID:employee,items:[{SanPhamID:product,SoLuong:5,DonGia:100}]},0,201);
    await Promise.all([http(`/phieunhap/${receipt.PhieuNhapID}/status`,{TrangThai:'COMPLETED'}),http(`/phieunhap/${receipt.PhieuNhapID}/status`,{TrangThai:'COMPLETED'})]);
    assert.equal(Number((await row('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse,product])).SoLuongTon),5);
    const cancelledReceipt=await http('/phieunhap/with-items',{KhoID:warehouse,NhanVienID:employee,items:[{SanPhamID:product,SoLuong:9,DonGia:100}]},0,201);
    await http(`/phieunhap/${cancelledReceipt.PhieuNhapID}/status`,{TrangThai:'CANCELLED'});
    await http(`/phieunhap/${cancelledReceipt.PhieuNhapID}/status`,{TrangThai:'COMPLETED'},0,409);
    console.log('PASS inbound idempotency and cancellation');
    const makeOrder=async (quantity=2,extra=false,owner=2) => {
      const buyer=(await row('SELECT HoiVienID FROM hoivien WHERE TaiKhoanID=?',[accounts[owner]])).HoiVienID;
      await q.query("INSERT INTO giohang (HoiVienID,TrangThai) VALUES (?,'ACTIVE') ON DUPLICATE KEY UPDATE TrangThai='ACTIVE'",[buyer]);
      const cart=(await row('SELECT GioHangID FROM giohang WHERE HoiVienID=?',[buyer])).GioHangID;
      await insert('INSERT INTO chitietgiohang (GioHangID,SanPhamID,SoLuong) VALUES (?,?,?)',[cart,product,quantity]);
      if (extra) await insert('INSERT INTO chitietgiohang (GioHangID,SanPhamID,SoLuong) VALUES (?,?,1)',[cart,product2]);
      const preview=await http(`/donhang/checkout/${accounts[owner]}`,undefined,owner);
      return http(`/donhang/checkout/${accounts[owner]}`,{requestKey:preview.requestKey,cartVersion:preview.cartVersion,name:'Test customer',phone:'0901234567',delivery:'PICKUP',paymentMethod:'TIEN_MAT',KhoID:warehouse},owner);
    };
    const shortage=await makeOrder(2,true);
    await http(`/donhang/${shortage.DonHangID}/confirm-payment`,{},1,409);
    assert.equal(Number((await row('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse,product])).SoLuongTon),5);
    assert.equal((await row('SELECT TrangThai FROM thanhtoan WHERE ThanhToanID=?',[shortage.ThanhToanID])).TrangThai,'PENDING');
    await call(require('../models/donhang.model'),'transitionStatus',shortage.DonHangID,'CANCELLED');
    assert.equal((await row('SELECT TrangThai FROM thanhtoan WHERE ThanhToanID=?',[shortage.ThanhToanID])).TrangThai,'CANCELLED');
    const order=await makeOrder();
    await http(`/donhang/${order.DonHangID}/confirm-payment`,{},2,403);
    await Promise.all([http(`/donhang/${order.DonHangID}/confirm-payment`,{},1),http(`/donhang/${order.DonHangID}/confirm-payment`,{},0)]);
    assert.equal(Number((await row('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse,product])).SoLuongTon),3);
    await assert.rejects(call(require('../models/donhang.model'),'transitionStatus',order.DonHangID,'CANCELLED'),e=>e.status===409);
    console.log('PASS shop rollback, nonnegative inventory, payment cancellation, JWT and idempotency');
    const p=await call(payment,'createPackagePayment',{DangKyID:r.DangKyID,PhuongThucThanhToan:'TIEN_MAT',ActivationMode:'QUEUE_AFTER_CURRENT'});
    await http(`/thanhtoan/${p.payment.ThanhToanID}/confirm`,{},2,403);
    await Promise.all([call(payment,'confirmPackagePayment',p.payment.ThanhToanID),call(payment,'confirmPackagePayment',p.payment.ThanhToanID)]);
    const voucher=await insert("INSERT INTO khuyenmai (MaKhuyenMai,TenKhuyenMai,SoTienGiam,NgayBatDau,NgayKetThuc,GioiHanSuDung,GioiHanMoiHoiVien,PhamVi) VALUES ('TEST','Test discount',100,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_ADD(NOW(),INTERVAL 30 DAY),1,1,'PACKAGE')");
    const r2=await call(registration,'register',{...regInput,MaKhuyenMai:'TEST',ActivationMode:'REPLACE_NOW'});
    assert.equal(await count('apdungkhuyenmaigoitap'),0);
    const p2=await call(payment,'createPackagePayment',{DangKyID:r2.DangKyID,PhuongThucThanhToan:'TIEN_MAT',ActivationMode:'REPLACE_NOW'});
    await q.query("UPDATE thanhtoan SET NoiDung='ordinary note' WHERE ThanhToanID=?",[p2.payment.ThanhToanID]);
    await http(`/thanhtoan/${p2.payment.ThanhToanID}/cancel`,{},1,403);
    await Promise.all([call(payment,'confirmPackagePayment',p2.payment.ThanhToanID),call(payment,'confirmPackagePayment',p2.payment.ThanhToanID)]);
    const expired=await row("SELECT TrangThai,DATE_FORMAT(NgayKetThuc,'%Y-%m-%d') EndDate FROM dangkygoitap WHERE DangKyID=?",[r.DangKyID]);
    assert.equal(expired.TrangThai,'EXPIRED'); assert.equal(expired.EndDate,yesterday);
    assert.equal(await count('apdungkhuyenmaigoitap'),1);
    await assert.rejects(call(registration,'register',{...regInput,MaKhuyenMai:'TEST'}),e=>e.status===409);
    console.log('PASS voucher usage only SUCCESS, limits and REPLACE_NOW without parsing notes');
    const trainer=await insert("INSERT INTO pt (HoTen,GiaThue) VALUES ('Test PT',300)");
    const shift=await insert("INSERT INTO lichpt (PTID,NgayLam,GioBatDau,GioKetThuc) VALUES (?,?,'09:00:00','10:00:00')",[trainer,tomorrow]);
    const booking=await call(pt,'book',{TaiKhoanID:accounts[2],LichPTID:shift,GhiChu:null});
    assert.equal(booking.TrangThaiThanhToan,'PENDING');
    await assert.rejects(call(pt,'confirmBooking',booking.ThuePTID),e=>e.status===409);
    await http(`/thuept/${booking.ThuePTID}/confirm-payment`,{},2,403);
    await Promise.all([call(pt,'confirmPayment',booking.ThuePTID),call(pt,'confirmPayment',booking.ThuePTID)]);
    await assert.rejects(call(pt,'completeBooking',booking.ThuePTID),e=>e.status===409);
    await assert.rejects(call(pt,'cancel',{ThuePTID:booking.ThuePTID,TaiKhoanID:accounts[2]}),e=>e.status===409);
    await q.query('UPDATE lichpt SET NgayLam=? WHERE LichPTID=?',[yesterday,shift]);
    await call(pt,'completeBooking',booking.ThuePTID);
    const shift2=await insert("INSERT INTO lichpt (PTID,NgayLam,GioBatDau,GioKetThuc) VALUES (?,?,'11:00:00','12:00:00')",[trainer,tomorrow]);
    const booking2=await call(pt,'book',{TaiKhoanID:accounts[2],LichPTID:shift2,GhiChu:null});
    await call(pt,'cancel',{ThuePTID:booking2.ThuePTID,TaiKhoanID:accounts[2]});
    assert.equal((await row('SELECT TrangThai FROM thanhtoan WHERE ThuePTID=?',[booking2.ThuePTID])).TrangThai,'CANCELLED');
    assert.equal((await row('SELECT TrangThai FROM lichpt WHERE LichPTID=?',[shift2])).TrangThai,'AVAILABLE');
    console.log('PASS PT paid confirmation, completion timing and atomic cancellation');
    await q.query("UPDATE goitap SET TenGoi='HSSV Test' WHERE GoiTapID=?",[pkg]);
    await assert.rejects(call(registration,'register',regInput),e=>e.status===403);
    await http('/member-requests/student/me',{TenTruong:'Test school',MaHSSV:'SV1',NgayHetHan:tomorrow},2);
    const verification=await row('SELECT XacMinhID FROM xacminhhssv WHERE HoiVienID=?',[memberId]);
    await http(`/member-requests/student/${verification.XacMinhID}/review`,{TrangThai:'VERIFIED'},1,403);
    await http(`/member-requests/student/${verification.XacMinhID}/review`,{TrangThai:'VERIFIED'},0);
    const queued=await call(registration,'register',regInput);
    const queuedPayment=await call(payment,'createPackagePayment',{DangKyID:queued.DangKyID,PhuongThucThanhToan:'TIEN_MAT',ActivationMode:'QUEUE_AFTER_CURRENT'});
    await call(payment,'confirmPackagePayment',queuedPayment.payment.ThanhToanID);
    const freeze=await requests.requestFreeze(accounts[2],{DangKyID:r2.DangKyID,NgayBatDau:today,NgayKetThuc:tomorrow});
    const before=await row('SELECT NgayKetThuc FROM dangkygoitap WHERE DangKyID=?',[r2.DangKyID]);
    const queueBefore=await row('SELECT NgayBatDau FROM dangkygoitap WHERE DangKyID=?',[queued.DangKyID]);
    await requests.reviewFreeze(freeze.BaoLuuID,'APPROVED');
    const qr=await insert("INSERT INTO maqr (MaCode,NgayHetHan) VALUES ('hardening-qr',DATE_ADD(NOW(),INTERVAL 1 HOUR))");
    const eligibility=await call(require('../models/checkin.model'),'preview',{token:'hardening-qr',HoiVienID:memberId,DangKyID:r2.DangKyID});
    assert(eligibility.reasons.some(e=>e.code==='MEMBERSHIP_FROZEN'));
    await q.query('UPDATE baoluugoitap SET NgayBatDau=DATE_SUB(CURDATE(),INTERVAL 2 DAY),NgayKetThuc=DATE_SUB(CURDATE(),INTERVAL 1 DAY) WHERE BaoLuuID=?',[freeze.BaoLuuID]);
    await Promise.all([requests.completeDueFreezes(),requests.completeDueFreezes()]);
    const after=await row('SELECT NgayKetThuc FROM dangkygoitap WHERE DangKyID=?',[r2.DangKyID]);
    const queueAfter=await row('SELECT NgayBatDau FROM dangkygoitap WHERE DangKyID=?',[queued.DangKyID]);
    assert.equal((after.NgayKetThuc-before.NgayKetThuc)/86400000,2);
    assert.equal((queueAfter.NgayBatDau-queueBefore.NgayBatDau)/86400000,2);
    console.log('PASS HSSV API authorization, paid freeze, blocked check-in, extension and upcoming queue');
    const pending=await insert("INSERT INTO thanhtoan (HoiVienID,SoTien,PhuongThucThanhToan,TrangThai) VALUES (?,999999,'TIEN_MAT','PENDING')",[memberId]);
    const invoicesBefore=await count('hoadon');
    const registrationsBefore=JSON.stringify((await q.query('SELECT * FROM dangkygoitap ORDER BY DangKyID'))[0]);
    await http('/thanhtoan'); await http('/dangkygoitap/admin'); await http('/phieunhap/stock');
    await http('/hoadon',{ThanhToanID:pending,TongTien:999999},0,405);
    await http('/apdungkhuyenmaigoitap',{KhuyenMaiID:voucher,DangKyID:queued.DangKyID},0,405);
    assert.equal(await count('hoadon'),invoicesBefore);
    assert.equal(JSON.stringify((await q.query('SELECT * FROM dangkygoitap ORDER BY DangKyID'))[0]),registrationsBefore);
    assert.equal(Number((await row('SELECT COUNT(*) n FROM hoadon WHERE ThanhToanID=?',[pending])).n),0);
    assert.equal(Number((await row('SELECT COUNT(*) n FROM (SELECT ThanhToanID FROM hoadon GROUP BY ThanhToanID HAVING COUNT(*)>1) duplicates')).n),0);
    const report=await require('../models/report.model').getAdmin(`${today} 00:00:00`,`${tomorrow} 00:00:00`);
    const expected=await row("SELECT SUM(SoTien) amount FROM thanhtoan WHERE TrangThai='SUCCESS' AND NgayThanhToan>=? AND NgayThanhToan<?",[today,tomorrow]);
    assert.equal(Number(report.revenue.total),Number(expected.amount)); assert.equal(Number(report.revenue.pt),300);
    assert.equal(Number(report.topProducts[0].quantity),2);
    await q.query('UPDATE thanhtoan SET NgayThanhToan=? WHERE ThanhToanID=?',[`${yesterday} 12:00:00`,order.ThanhToanID]);
    const moved=await require('../models/report.model').getAdmin(`${today} 00:00:00`,`${tomorrow} 00:00:00`);
    assert.equal(moved.topProducts.length,0); assert.equal(Number(moved.revenue.shop),0);
    console.log('PASS read-only GET, one invoice per SUCCESS payment, reports by successful payment date including PT');
    const competing1=await makeOrder(2,false,2), competing2=await makeOrder(2,false,3);
    await Promise.all([http(`/donhang/${competing1.DonHangID}/confirm-payment`,{},0,[200,409]),http(`/donhang/${competing2.DonHangID}/confirm-payment`,{},1,[200,409])]);
    const states=(await q.query('SELECT TrangThai FROM thanhtoan WHERE ThanhToanID IN (?,?)',[competing1.ThanhToanID,competing2.ThanhToanID]))[0].map(r=>r.TrangThai).sort();
    assert.deepEqual(states,['PENDING','SUCCESS']);
    assert.equal(Number((await row('SELECT SoLuongTon FROM tonkho WHERE KhoID=? AND SanPhamID=?',[warehouse,product])).SoLuongTon),1);
    await q.query("UPDATE goitap SET TenGoi='Test package' WHERE GoiTapID=?",[pkg]);
    await insert("INSERT INTO khuyenmai (MaKhuyenMai,TenKhuyenMai,SoTienGiam,NgayBatDau,NgayKetThuc,GioiHanSuDung,PhamVi) VALUES ('SHARED','Shared cap',10,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_ADD(NOW(),INTERVAL 30 DAY),1,'ALL')");
    const limited1=await call(registration,'register',{...regInput,MaKhuyenMai:'SHARED'});
    const limited2=await call(registration,'register',{...regInput,TaiKhoanID:accounts[3],MaKhuyenMai:'SHARED'});
    const pay1=await call(payment,'createPackagePayment',{DangKyID:limited1.DangKyID,PhuongThucThanhToan:'TIEN_MAT'});
    const pay2=await call(payment,'createPackagePayment',{DangKyID:limited2.DangKyID,PhuongThucThanhToan:'TIEN_MAT'});
    const confirmed=await Promise.allSettled([call(payment,'confirmPackagePayment',pay1.payment.ThanhToanID),call(payment,'confirmPackagePayment',pay2.payment.ThanhToanID)]);
    assert.equal(confirmed.filter(r=>r.status==='fulfilled').length,1);
    assert.equal(confirmed.find(r=>r.status==='rejected').reason.status,409);
    console.log('PASS concurrent customers cannot oversell stock or exceed promotion usage caps');
    console.log('Business hardening PASS');
  } finally {
    if (server) await new Promise(resolve=>server.close(resolve));
    if (db) await db.promise().end();
    await setup.query(`DROP DATABASE IF EXISTS \`${testName}\``);
    await setup.end();
  }
})().catch(e => { console.error(e); process.exitCode=1; });
