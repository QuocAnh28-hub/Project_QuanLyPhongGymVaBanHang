// Audit and repair fictional demo records; write the exact SQL before executing it.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const mysql = require('mysql2/promise');
const escape = require('mysql2').escape;
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ'];
const female = ['Ngọc Linh', 'Thu Hà', 'Hải Yến', 'Phương Mai', 'Thanh Trúc', 'Khánh Vy', 'Bảo Ngọc', 'Thùy Chi', 'Minh Anh', 'Mỹ Hạnh'];
const male = ['Minh Quân', 'Quốc Bảo', 'Đức Huy', 'Tuấn Kiệt', 'Gia Khánh', 'Anh Dũng', 'Thành Đạt', 'Hoàng Long', 'Nhật Nam', 'Quang Vinh'];
const sqlDate = (d, h = '09:00:00') => `${d} ${h}`;
const day = (month, n) => `2026-${String(month).padStart(2,'0')}-${String(n).padStart(2,'0')}`;

async function main() {
 const c = await mysql.createConnection({host:process.env.DB_HOST,port:+(process.env.DB_PORT||3306),user:process.env.DB_USER,password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME,dateStrings:true,charset:'utf8mb4'});
 const statements = []; const audit = {}; const snapshot = {};
 const add = (sql, params=[]) => statements.push(require('mysql2').format(sql,params));
 const update = (t, idCol, id, values) => add('UPDATE ?? SET ? WHERE ??=?',[t,values,idCol,id]);
 try {
  await c.query("SET time_zone='+07:00'");
  await c.beginTransaction();
  const [tables] = await c.query('SHOW TABLES');
  for (const t of tables) { const name=Object.values(t)[0]; [snapshot[name]]=await c.query('SELECT * FROM ?? FOR UPDATE',[name]); }
  const backupDir=path.join(__dirname,'../backups'); fs.mkdirSync(backupDir,{recursive:true});
  const backup=path.join(backupDir,`before-data-repair-${Date.now()}.sql`);
  // A private SQL snapshot (including account hashes), ignored by Git. Restore to an empty schema.
  const dump=['-- Private database snapshot. INSERT into an empty schema; do not run against populated tables.'];
  for(const [t,rows] of Object.entries(snapshot)) for(const r of rows){
   const cols=Object.keys(r); dump.push(`INSERT INTO \`${t}\` (${cols.map(k=>'`'+k+'`').join(',')}) VALUES (${cols.map(k=>escape(typeof r[k]==='object'&&r[k]!==null?JSON.stringify(r[k]):r[k])).join(',')});`);
  }
  fs.writeFileSync(backup,dump.join('\n'));
  const badPlans=snapshot.goitap.filter(g=>/^test$/i.test(g.TenGoi.trim())||(+g.Gia>100000000&&/^\d+$/.test(g.TenGoi))).map(g=>g.GoiTapID);
  const badRegs=snapshot.dangkygoitap.filter(r=>badPlans.includes(r.GoiTapID)).map(r=>r.DangKyID);
  // Exact duplicate membership for the same person, term, start, end and paid amount.
  const seen=new Map(); const duplicateRegs=[];
  for(const r of snapshot.dangkygoitap.filter(r=>!badRegs.includes(r.DangKyID)&&r.TrangThai==='ACTIVE').sort((a,b)=>b.DangKyID-a.DangKyID)){
   const key=[r.HoiVienID,r.GoiTapThoiHanID,r.NgayBatDau,r.NgayKetThuc,r.GiaThanhToan].join('|');
   if(seen.has(key))duplicateRegs.push(r.DangKyID);else seen.set(key,r.DangKyID);
  }
  const removedRegs=[...badRegs,...duplicateRegs];
  const removedPay=snapshot.thanhtoan.filter(p=>removedRegs.includes(p.DangKyID)).map(p=>p.ThanhToanID);
  audit.removedTestPackages=badPlans; audit.removedRegistrations=removedRegs; audit.removedPayments=removedPay;
  if(removedPay.length){
   add("DELETE FROM thongbao WHERE CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.ThanhToanID')) AS UNSIGNED) IN (?)",[removedPay]);
   add('DELETE FROM hoadon WHERE ThanhToanID IN (?)',[removedPay]);
   add('DELETE FROM thanhtoan WHERE ThanhToanID IN (?)',[removedPay]);
  }
  if(removedRegs.length)add('DELETE FROM dangkygoitap WHERE DangKyID IN (?)',[removedRegs]);
  if(badPlans.length)add('DELETE FROM goitap WHERE GoiTapID IN (?)',[badPlans]);
  const badBookings=snapshot.thuept.filter(r=>/test|module PT API/i.test(r.GhiChu||'')).map(r=>r.ThuePTID);
  audit.removedTestBookings=badBookings;
  if(badBookings.length){
   add("DELETE FROM thongbao WHERE CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.ThuePTID')) AS UNSIGNED) IN (?)",[badBookings]);
   add('DELETE FROM thuept WHERE ThuePTID IN (?)',[badBookings]);
  }
  add("UPDATE goitap SET TenGoi=TRIM(REPLACE(TenGoi,'DIAMOND TEST BACKEND','Diamond toàn diện'))");
  add("UPDATE sanpham SET TenSanPham='Pre-workout không caffeine 30 khẩu phần', MoTa='Dinh dưỡng thể thao trước buổi tập; sử dụng theo hướng dẫn trên nhãn.' WHERE TenSanPham='Pre-workout Test'");
  add("UPDATE sanpham SET TenSanPham='Dây kéo lưng cotton' WHERE SanPhamID=5 AND TenSanPham='Dây kéo lưng'");
  add("UPDATE sanpham SET TenSanPham='Dây kéo lưng có đệm cổ tay' WHERE SanPhamID=26 AND TenSanPham='Dây kéo lưng'");
  add("UPDATE sanpham SET TenSanPham='Găng tay tập gym có đệm' WHERE SanPhamID=4 AND TenSanPham='Găng tay tập gym'");
  add("UPDATE sanpham SET TenSanPham='Găng tay tập gym thoáng khí' WHERE SanPhamID=29 AND TenSanPham='Găng tay tập gym'");
  // Package prices are demo VND prices rounded to the nearest thousand.
  add('UPDATE goitapthoihan t JOIN goitap g USING(GoiTapID) SET t.GiaGoc=g.Gia*t.SoThang, t.GiaBan=ROUND(t.GiaBan/1000)*1000 WHERE t.GoiTapID NOT IN (1,2,3,4)');
  const demoMembers=snapshot.hoivien.filter(h=>/^demo20261007\.member/.test(h.Email||'')).sort((a,b)=>a.HoiVienID-b.HoiVienID);
  const memberNames=new Map();
  for(let i=0;i<demoMembers.length;i++){
   const h=demoMembers[i];const HoTen=`${surnames[Math.floor(i/10)%6]} ${(h.GioiTinh==='NU'?female:male)[Math.floor(i/2)%10]}`;
   memberNames.set(h.HoiVienID,HoTen);
   const height=h.GioiTinh==='NU'?155+i%14:167+i%17;
   const weight=Math.round(height*height/10000*(20.5+i%5)*10)/10;
   update('hoivien','HoiVienID',h.HoiVienID,{HoTen,ChieuCao:height,CanNang:weight});
   add('UPDATE shopcheckout SET TenNguoiNhan=? WHERE HoiVienID=?',[HoTen,h.HoiVienID]);
  }
  audit.improvedMemberProfiles=demoMembers.length;
  // Link legacy membership payments to their actual registrations.
  for(const [payment,registration] of [[1,1],[2,2],[4,3]]) add('UPDATE thanhtoan SET DangKyID=? WHERE ThanhToanID=? AND DangKyID IS NULL',[registration,payment]);
  // Cancel unpaid past bookings; close completed sessions; keep future confirmed sessions.
  add("UPDATE thuept t JOIN lichpt l USING(LichPTID) SET t.TrangThai='CANCELLED',t.GhiChu='Đã hủy do chưa xác nhận trước giờ tập.' WHERE t.TrangThai='PENDING' AND TIMESTAMP(l.NgayLam,l.GioBatDau)<NOW()");
  add("UPDATE thuept t JOIN lichpt l USING(LichPTID) SET t.TrangThai='COMPLETED' WHERE t.TrangThai='CONFIRMED' AND TIMESTAMP(l.NgayLam,l.GioKetThuc)<NOW()");
  add("UPDATE thuept SET GhiChu='Buổi huấn luyện cá nhân: đánh giá tư thế và kỹ thuật vận động.' WHERE GhiChu='ccc'");
  add("UPDATE lichpt l SET TrangThai='BOOKED' WHERE EXISTS(SELECT 1 FROM thuept t WHERE t.LichPTID=l.LichPTID AND t.TrangThai IN ('PENDING','CONFIRMED','COMPLETED'))");
  add("UPDATE lichpt l SET TrangThai='AVAILABLE' WHERE TrangThai='BOOKED' AND NOT EXISTS(SELECT 1 FROM thuept t WHERE t.LichPTID=l.LichPTID AND t.TrangThai IN ('PENDING','CONFIRMED','COMPLETED'))");
  // Round membership discounts and totals together so every invoice reconciles.
  add('UPDATE apdungkhuyenmaigoitap a JOIN dangkygoitap d USING(DangKyID) JOIN goitapthoihan t USING(GoiTapThoiHanID) JOIN khuyenmai k USING(KhuyenMaiID) SET a.SoTienGiam=LEAST(t.GiaBan,ROUND((t.GiaBan*k.PhanTramGiam/100+k.SoTienGiam)/1000)*1000) WHERE d.HoiVienID IN (?)',[demoMembers.map(h=>h.HoiVienID)]);
  add('UPDATE dangkygoitap d JOIN goitapthoihan t USING(GoiTapThoiHanID) SET d.GiaThanhToan=t.GiaBan-COALESCE((SELECT SUM(a.SoTienGiam) FROM apdungkhuyenmaigoitap a WHERE a.DangKyID=d.DangKyID),0) WHERE d.HoiVienID IN (?)',[demoMembers.map(h=>h.HoiVienID)]);
  add('UPDATE thanhtoan p JOIN dangkygoitap d USING(DangKyID) SET p.SoTien=d.GiaThanhToan');
  add("UPDATE dangkygoitap d JOIN goitapthoihan t USING(GoiTapThoiHanID) SET d.NgayKetThuc=DATE_SUB(DATE_ADD(d.NgayBatDau,INTERVAL (t.SoThang+t.ThangTang) MONTH),INTERVAL 1 DAY) WHERE d.NgayKetThuc>=d.NgayBatDau");
  add("UPDATE dangkygoitap d SET d.TrangThai='CANCELLED' WHERE d.TrangThai='PENDING' AND EXISTS(SELECT 1 FROM thanhtoan p WHERE p.DangKyID=d.DangKyID AND p.TrangThai='CANCELLED')");
  add("UPDATE dangkygoitap SET TrangThai='EXPIRED' WHERE TrangThai='ACTIVE' AND NgayKetThuc<CURDATE()");
  // A paid queued registration starts after the current subscription, not years in advance.
  add("UPDATE dangkygoitap d JOIN (SELECT HoiVienID,MAX(NgayKetThuc) lastEnd FROM (SELECT * FROM dangkygoitap) base WHERE TrangThai='ACTIVE' AND NgayBatDau<=CURDATE() AND NgayKetThuc>=CURDATE() GROUP BY HoiVienID) active USING(HoiVienID) JOIN goitapthoihan t USING(GoiTapThoiHanID) SET d.NgayBatDau=DATE_ADD(active.lastEnd,INTERVAL 1 DAY),d.NgayKetThuc=DATE_SUB(DATE_ADD(DATE_ADD(active.lastEnd,INTERVAL 1 DAY),INTERVAL (t.SoThang+t.ThangTang) MONTH),INTERVAL 1 DAY),d.TrangThai='PENDING' WHERE d.NgayBatDau>CURDATE() AND d.TrangThai='ACTIVE'");
  // Replace deleted test offerings with realistic, priced packages and benefits.
  for(const [name,tier,price,description] of [['Fitness cuối tuần','SILVER PASS',290000,'Tập thứ Bảy và Chủ nhật, 06:00–22:00.'],['Gym và Yoga buổi tối','GOLD PASS',750000,'Tập gym 17:00–22:00 và tham gia 8 lớp Yoga mỗi tháng.']]){
   add('INSERT INTO goitap (TenGoi,Tier,MoTa,ThoiHan,Gia,TrangThai,NgayTao) VALUES (?,?,?,30,?,\'ACTIVE\',\'2026-09-01 09:00:00\')',[name,tier,description,price]);
   add('SET @new_gym_plan=LAST_INSERT_ID()');
   for(const months of [1,3,6,12])add("INSERT INTO goitapthoihan (GoiTapID,SoThang,ThangTang,GiaGoc,GiaBan,TrangThai) VALUES (@new_gym_plan,?,0,?,?,'ACTIVE')",[months,price*months,Math.round(price*months*(months===1?1:months===3?.95:.9)/1000)*1000]);
   add("INSERT INTO quyenloigoitap (GoiTapID,MaQuyenLoi,TenQuyenLoi,MoTa,SoLuong,ThuTu) VALUES (@new_gym_plan,'ACCESS_HOURS',?,?,NULL,1),(@new_gym_plan,'LOCKER','Tủ đồ trong buổi tập','Sử dụng tủ đồ cá nhân trong thời gian tập.',1,2)",[description,description]);
  }
  // Restore a normal current membership for the member whose only current package was test data.
  if(removedRegs.some(id=>snapshot.dangkygoitap.find(r=>r.DangKyID===id)?.HoiVienID===1)){
   add("INSERT INTO dangkygoitap (HoiVienID,GoiTapID,GoiTapThoiHanID,NgayDangKy,NgayBatDau,NgayKetThuc,GiaThanhToan,TrangThai) VALUES (1,1,1,'2026-10-01 08:30:00','2026-10-01','2026-10-31',490000,'ACTIVE')");
   add('SET @replacement_registration=LAST_INSERT_ID()');
   add("INSERT INTO thanhtoan (DangKyID,HoiVienID,NhanVienID,SoTien,PhuongThucThanhToan,NgayThanhToan,NoiDung,TrangThai) VALUES (@replacement_registration,1,1,490000,'CHUYEN_KHOAN','2026-10-01 08:35:00','Thanh toán gói Khởi Đầu tháng 10','SUCCESS')");
   add("INSERT INTO hoadon (ThanhToanID,NhanVienID,NgayLap,TongTien) VALUES (LAST_INSERT_ID(),1,'2026-10-01 08:36:00',490000)");
  }
  // Vary demo order timestamps; pending/in-transit orders are recent, not weeks old.
  const demoOrders=snapshot.shopcheckout.filter(s=>s.RequestKey.startsWith('demo20261007-')).sort((a,b)=>a.DonHangID-b.DonHangID);
  for(let i=0;i<demoOrders.length;i++){
   const sc=demoOrders[i],o=snapshot.donhang.find(d=>d.DonHangID===sc.DonHangID);
   const date=sqlDate(day(10,o.TrangThai==='COMPLETED'?1+i%6:o.TrangThai==='CANCELLED'?2+i%5:7+i%2),`${String(9+i%10).padStart(2,'0')}:${String((i*7)%60).padStart(2,'0')}:00`);
   update('donhang','DonHangID',o.DonHangID,{NgayDat:date});update('thanhtoan','ThanhToanID',sc.ThanhToanID,{NgayThanhToan:date});
   add('UPDATE apdungkhuyenmaidonhang SET NgayApDung=? WHERE DonHangID=?',[date,o.DonHangID]);
   add("UPDATE thongbao SET NgayTao=?,NoiDung=? WHERE Loai='ORDER_STATUS' AND CAST(JSON_UNQUOTE(JSON_EXTRACT(ActionPayload,'$.DonHangID')) AS UNSIGNED)=?",[date,`Đơn hàng #${o.DonHangID}: ${({COMPLETED:'Đã hoàn tất',PROCESSING:'Đang chuẩn bị giao hàng',CONFIRMED:'Đã xác nhận',PENDING:'Chờ thanh toán',CANCELLED:'Đã hủy'})[o.TrangThai]}.`,o.DonHangID]);
  }
  add("UPDATE donhang SET GhiChu='Đã giao hàng và hoàn tất đơn.' WHERE TrangThai='COMPLETED' AND GhiChu='Khách chờ xác nhận.'");
  add("UPDATE phieunhap p SET p.TongTien=COALESCE((SELECT SUM(ct.SoLuong*ct.DonGia) FROM chitietphieunhap ct WHERE ct.PhieuNhapID=p.PhieuNhapID),0)");
  add('UPDATE chitietdonhang SET ThanhTien=SoLuong*DonGia');
  add('UPDATE chitietphieunhap SET ThanhTien=SoLuong*DonGia');
  add('UPDATE hoadon h JOIN thanhtoan p USING(ThanhToanID) SET h.TongTien=p.SoTien,h.NgayLap=p.NgayThanhToan');
  add("UPDATE thongbao SET NoiDung=REPLACE(NoiDung,'DIAMOND TEST BACKEND','Diamond toàn diện') WHERE NoiDung LIKE '%DIAMOND TEST BACKEND%'");
  add("UPDATE goitap SET MoTa=CASE GoiTapID WHEN 22 THEN 'Tập gym buổi sáng 06:00–12:00; dành cho hội viên có thẻ sinh viên còn hiệu lực.' WHEN 23 THEN 'Tập giờ trưa 11:00–15:00; phù hợp nhân viên văn phòng.' WHEN 24 THEN 'Tập gym 06:00–22:00, sử dụng khu cardio và máy tập sức mạnh.' WHEN 25 THEN 'Tập gym toàn thời gian, kèm 8 lớp nhóm mỗi tháng.' WHEN 26 THEN 'Tập toàn thời gian, kèm đánh giá thể lực và khu giãn cơ phục hồi.' WHEN 27 THEN 'Tập toàn thời gian, lớp nhóm và khu phục hồi; hỗ trợ theo dõi mục tiêu.' ELSE MoTa END WHERE GoiTapID BETWEEN 22 AND 27");
  add("UPDATE khuyenmai SET DieuKien='Giảm 500.000đ cho gói tập từ 3 tháng, giá trị trước giảm tối thiểu 2.000.000đ; không cộng dồn.' WHERE SoTienGiam=500000 AND DieuKien LIKE '%flow Mobile%'");
  // Spread check-in times within opening hours instead of hundreds of identical timestamps.
  const visits=snapshot.checkin.filter(v=>demoMembers.some(h=>h.HoiVienID===v.HoiVienID)&&v.TrangThai==='CHECKED_OUT'&&v.ThoiGianCheckIn.slice(0,10)<'2026-10-08');
  for(const v of visits){const i=demoMembers.findIndex(h=>h.HoiVienID===v.HoiVienID),n=v.CheckInID;const date=v.ThoiGianCheckIn.slice(0,10);const h=i%2?17+i%3:8+i%3;const minute=n%45;const entry=new Date(`${date}T${String(h).padStart(2,'0')}:${String(minute).padStart(2,'0')}:00Z`);const exit=new Date(entry.getTime()+(55+n%46)*60000);update('checkin','CheckInID',n,{ThoiGianCheckIn:entry.toISOString().slice(0,19).replace('T',' '),ThoiGianCheckOut:exit.toISOString().slice(0,19).replace('T',' ')});}
  audit.variedCheckIns=visits.length;audit.variedOrders=demoOrders.length;
  const file=path.join(__dirname,'../sql/repair-realistic-data-20261008.sql');
  fs.writeFileSync(file,['-- Audited cleanup and replacement of fictional demo data.','-- Requires the private pre-change backup; review before rerunning.','START TRANSACTION;',...statements.map(s=>s+';'),'COMMIT;'].join('\n\n'));
  // Read the saved SQL and execute statement boundaries from the generated source.
  const saved=fs.readFileSync(file,'utf8');assert(saved.includes(statements[0]));
  const affected=[];
  for(const sql of statements){const [r]=await c.query(sql);affected.push(r.affectedRows||0);}
  const verify=async(name,sql)=>{const [[r]]=await c.query(sql);assert.equal(Number(r.n),0,name);audit[name]='passed';};
  await verify('noTestPackages',"SELECT COUNT(*) n FROM goitap WHERE TenGoi LIKE '%test%' OR Gia>100000000");
  await verify('validMembershipDates','SELECT COUNT(*) n FROM dangkygoitap WHERE NgayKetThuc<NgayBatDau');
  await verify('membershipPaymentTotals','SELECT COUNT(*) n FROM thanhtoan p JOIN dangkygoitap d USING(DangKyID) WHERE p.SoTien<>d.GiaThanhToan OR p.HoiVienID<>d.HoiVienID');
  await verify('invoiceTotals','SELECT COUNT(*) n FROM hoadon h JOIN thanhtoan p USING(ThanhToanID) WHERE h.TongTien<>p.SoTien');
  await verify('receiptTotals','SELECT COUNT(*) n FROM phieunhap p WHERE p.TongTien<>COALESCE((SELECT SUM(ThanhTien) FROM chitietphieunhap ct WHERE ct.PhieuNhapID=p.PhieuNhapID),0)');
  await verify('orderTotals',"SELECT COUNT(*) n FROM donhang d LEFT JOIN shopcheckout s USING(DonHangID) WHERE d.TongTien<>COALESCE((SELECT SUM(ThanhTien) FROM chitietdonhang c WHERE c.DonHangID=d.DonHangID),0)-COALESCE((SELECT SUM(SoTienGiam) FROM apdungkhuyenmaidonhang a WHERE a.DonHangID=d.DonHangID),0)+COALESCE(s.PhiVanChuyen,0)");
  await verify('noNegativeStock','SELECT COUNT(*) n FROM tonkho WHERE SoLuongTon<0');
  await verify('validVisitDurations',"SELECT COUNT(*) n FROM checkin WHERE ThoiGianCheckOut<ThoiGianCheckIn OR (TrangThai='CHECKED_OUT' AND ThoiGianCheckOut IS NULL)");
  await verify('noDoubleMembership',"SELECT COUNT(*) n FROM (SELECT HoiVienID,COUNT(*) cnt FROM dangkygoitap WHERE TrangThai='ACTIVE' AND CURDATE() BETWEEN NgayBatDau AND NgayKetThuc GROUP BY HoiVienID HAVING cnt>1) x");
  await c.commit();
  audit.sqlFile=file;audit.backupFile=backup;audit.statements=statements.length;
  fs.writeFileSync(path.join(__dirname,'repair-demo-data-report.json'),JSON.stringify(audit,null,2));
  console.log(JSON.stringify(audit,null,2));
 } catch(e){await c.rollback();throw e;} finally{await c.end();}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
