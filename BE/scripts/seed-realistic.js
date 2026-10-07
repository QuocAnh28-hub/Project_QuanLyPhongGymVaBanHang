// Add fictional demo data without changing existing records. Run: node scripts/seed-realistic.js
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const assert = require('assert/strict');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const { hashPassword } = require('../common/password');
const batch = 'demo20261007';
const day = n => new Date(Date.UTC(2026, 8, 1 + n)).toISOString().slice(0, 10);
const stamp = (n, hour = '09:00:00') => `${day(n)} ${hour}`;
const names = ['Nguyễn Minh Anh', 'Trần Quốc Bảo', 'Lê Thu Hà', 'Phạm Đức Huy', 'Hoàng Ngọc Linh', 'Vũ Tuấn Kiệt', 'Đặng Hải Yến', 'Bùi Gia Khánh', 'Đỗ Phương Mai', 'Hồ Minh Quân', 'Ngô Thanh Trúc', 'Dương Anh Dũng', 'Đinh Khánh Vy', 'Mai Thành Đạt', 'Lý Bảo Ngọc', 'Tạ Hoàng Long', 'Cao Thùy Chi', 'Phan Nhật Nam', 'Trịnh Mỹ Hạnh', 'Đoàn Quang Vinh'];
const streets = ['Nguyễn Trãi, Thanh Xuân, Hà Nội', 'Cầu Giấy, Cầu Giấy, Hà Nội', 'Minh Khai, Hai Bà Trưng, Hà Nội', 'Láng Hạ, Đống Đa, Hà Nội', 'Hoàng Hoa Thám, Ba Đình, Hà Nội'];
async function main() {
 const c = await mysql.createConnection({ host: process.env.DB_HOST, port: +(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME, charset: 'utf8mb4', dateStrings: true });
 const rows = {}; const counts = {};
 const add = async (table, data) => {
  const [r] = await c.query('INSERT INTO ?? SET ?', [table, data]);
  (rows[table] ||= []).push({ ...data }); counts[table] = (counts[table] || 0) + 1;
  return r.insertId;
 };
 try {
  await c.beginTransaction();
  const [[existing]] = await c.query('SELECT COUNT(*) n FROM taikhoan WHERE Email LIKE ?', [`${batch}.%@example.com`]);
  if (existing.n) throw new Error('This demo batch already exists; refusing to duplicate it.');
  const [triggers] = await c.query('SHOW TRIGGERS');
  assert.equal(triggers.length, 0, 'Review database triggers before running this seed');
  const [tables] = await c.query('SHOW TABLES'); const before = {};
  for (const t of tables) { const name = Object.values(t)[0]; const [[r]] = await c.query('SELECT COUNT(*) n FROM ??', [name]); before[name] = r.n; }
  const password = await hashPassword('GymDemo@2026');
  const staff = [];
  for (let i = 0; i < 8; i++) {
   const Email = `${batch}.staff${i + 1}@example.com`;
   const TaiKhoanID = await add('taikhoan', { Email, MatKhau: password, VaiTro: 'STAFF', NgayTao: stamp(-120) });
   staff.push(await add('nhanvien', { TaiKhoanID, HoTen: names[i + 10], NgaySinh: `199${i % 7}-04-15`, GioiTinh: i % 2 ? 'NAM' : 'NU', Email, SoDienThoai: `08970010${String(i).padStart(2, '0')}`, ChucVu: ['Lễ tân', 'Tư vấn hội viên', 'Thu ngân', 'Nhân viên kho'][i % 4], NgayVaoLam: day(-120) }));
   await add('caidatthongbao', { TaiKhoanID, PushEnabled: 1, SmsEnabled: 0 });
  }
  const warehouses = [];
  for (let i = 0; i < 3; i++) warehouses.push(await add('kho', { TenKho: ['Kho cửa hàng Cầu Giấy', 'Kho phụ kiện Thanh Xuân', 'Kho dự trữ Long Biên'][i], DiaChi: `${35 + i * 12} ${streets[i]}`, MoTa: 'Kho mẫu phục vụ quản lý hàng hóa và đối chiếu tồn kho.' }));
  const categories = [];
  for (const [TenDanhMuc, MoTa] of [['Dinh dưỡng trước tập', 'Đồ ăn nhẹ cung cấp năng lượng trước buổi tập.'], ['Dụng cụ phục hồi', 'Dụng cụ giãn cơ sau tập.'], ['Phụ kiện tập sức mạnh', 'Hỗ trợ tập tạ và bảo vệ khớp.'], ['Trang phục thể thao nữ', 'Trang phục thoáng khí cho tập luyện.'], ['Trang phục thể thao nam', 'Trang phục vận động hằng ngày.'], ['Đồ uống thể thao', 'Bổ sung nước sau tập.']]) categories.push(await add('danhmuc', { TenDanhMuc, MoTa }));
  const catalog = [['Thanh protein cacao 60g', 45000, 'Thanh'], ['Bánh yến mạch 250g', 95000, 'Gói'], ['Bơ đậu phộng 340g', 125000, 'Hũ'], ['Hạt hỗn hợp 200g', 89000, 'Gói'], ['Con lăn massage 45cm', 290000, 'Cái'], ['Bóng massage cơ', 95000, 'Cái'], ['Dây giãn cơ', 120000, 'Cái'], ['Súng massage mini', 890000, 'Cái'], ['Dây kéo lưng', 180000, 'Đôi'], ['Đai lưng tập tạ', 450000, 'Cái'], ['Băng quấn cổ tay', 150000, 'Đôi'], ['Găng tay tập gym', 220000, 'Đôi'], ['Áo bra thể thao', 320000, 'Cái'], ['Quần legging dài', 390000, 'Cái'], ['Áo nữ thoáng khí', 250000, 'Cái'], ['Quần short nữ', 230000, 'Cái'], ['Áo nam thoáng khí', 280000, 'Cái'], ['Quần short nam', 260000, 'Cái'], ['Áo ba lỗ tập gym', 190000, 'Cái'], ['Quần jogger nam', 420000, 'Cái'], ['Nước điện giải 500ml', 25000, 'Chai'], ['Nước dừa 330ml', 22000, 'Chai'], ['Sữa protein 250ml', 45000, 'Hộp'], ['Nước khoáng 500ml', 12000, 'Chai']];
  const products = [];
  for (let i = 0; i < catalog.length; i++) {
   const [TenSanPham, price, DonViTinh] = catalog[i];
   const id = await add('sanpham', { DanhMucID: categories[Math.floor(i / 4)], TenSanPham, GiaBan: price, DonViTinh, MoTa: `${TenSanPham}. Sản phẩm mẫu dành cho hội viên, nhận tại quầy hoặc giao hàng.` });
   products.push({ id, price, cost: Math.round(price * .65 / 1000) * 1000 });
  }
  const discounts = {};
  for (const [kind, amount] of [['SHOP', 10], ['GYM', 10], ['PT', 5]]) {
   discounts[kind] = [];
   for (let i = 0; i < 4; i++) discounts[kind].push(await add('khuyenmai', { MaKhuyenMai: `${batch.toUpperCase()}_${kind}_${i + 1}`, TenKhuyenMai: `${kind === 'SHOP' ? 'Mua sắm' : kind === 'GYM' ? 'Đăng ký tập' : 'Huấn luyện cá nhân'} mùa thu - đợt ${i + 1}`, PhanTramGiam: amount, NgayBatDau: stamp(0, '00:00:00'), NgayKetThuc: stamp(90, '23:59:59'), DieuKien: `Dữ liệu mẫu: giảm ${amount}% cho ${kind}, không cộng dồn ưu đãi.` }));
  }
  const plans = [];
  for (let i = 0; i < 6; i++) {
   const Gia = [390000, 450000, 590000, 690000, 890000, 990000][i];
   const GoiTapID = await add('goitap', { TenGoi: ['Sinh viên buổi sáng', 'Văn phòng giờ trưa', 'Fitness toàn thời gian', 'Gym và lớp nhóm', 'Premium phục hồi', 'Premium toàn diện'][i], Tier: i < 2 ? 'SILVER PASS' : i < 4 ? 'GOLD PASS' : 'PLATINUM PASS', MoTa: 'Gói mẫu với thời hạn linh hoạt và quyền lợi ghi rõ bên dưới.', ThoiHan: 30, Gia, NgayTao: stamp(-30) });
   for (const months of [1, 3, 6, 12]) {
    const price = Math.round(Gia * months * (months === 1 ? 1 : months === 3 ? .95 : .9));
    const term = await add('goitapthoihan', { GoiTapID, SoThang: months, ThangTang: 0, GiaGoc: Gia * months, GiaBan: price });
    if (months === 3) plans.push({ id: GoiTapID, term, price });
   }
   for (const [index, code, title, qty] of [[1, 'ACCESS_HOURS', i === 0 ? 'Tập 06:00–12:00' : i === 1 ? 'Tập 11:00–15:00' : 'Tập 06:00–22:00', null], [2, 'LOCKER', 'Tủ đồ trong buổi tập', 1], [3, 'ASSESSMENT', 'Đánh giá thể lực đầu kỳ', 1], [4, 'GROUP_CLASS', i < 2 ? 'Lớp nhóm trải nghiệm' : 'Lớp nhóm mỗi tháng', i < 2 ? 1 : 8]]) await add('quyenloigoitap', { GoiTapID, MaQuyenLoi: code, TenQuyenLoi: title, SoLuong: qty, ThuTu: index, MoTa: title });
  }
  const trainers = [];
  for (let i = 0; i < 8; i++) {
   const price = 250000 + i * 50000;
   const id = await add('pt', { HoTen: names[i], NgaySinh: `199${i}-06-12`, GioiTinh: i % 2 ? 'NAM' : 'NU', Email: `${batch}.pt${i + 1}@example.com`, SoDienThoai: `08970020${String(i).padStart(2, '0')}`, ChuyenMon: ['Tăng cơ, sức mạnh', 'Giảm mỡ, thể lực', 'Yoga, vận động linh hoạt', 'Kỹ thuật tập cho người mới'][i % 4], KinhNghiem: `${3 + i % 5} năm huấn luyện cá nhân; xây dựng giáo án theo mục tiêu và thể trạng.`, GiaThue: price });
   trainers.push({ id, price });
  }
  const pay = async (member, amount, date, content, status = 'SUCCESS', registration = null) => {
   const employee = staff[member.index % staff.length];
   const id = await add('thanhtoan', { HoiVienID: member.id, DangKyID: registration, NhanVienID: employee, SoTien: amount, NgayThanhToan: date, NoiDung: content, PhuongThucThanhToan: ['CHUYEN_KHOAN', 'TIEN_MAT', 'THE'][member.index % 3], TrangThai: status });
   if (status === 'SUCCESS') await add('hoadon', { ThanhToanID: id, NhanVienID: employee, NgayLap: date, TongTien: amount });
   return id;
  };
  const members = [];
  for (let i = 0; i < 60; i++) {
   const Email = `${batch}.member${i + 1}@example.com`;
   const TaiKhoanID = await add('taikhoan', { Email, MatKhau: password, NgayTao: stamp(i % 20), VaiTro: 'CUSTOMER' });
   const name = names[i % 20].replace(/\S+$/, ['Anh', 'Bảo', 'Hà', 'Huy', 'Linh', 'Kiệt', 'Yến', 'Khánh', 'Mai', 'Quân', 'Trúc', 'Dũng', 'Vy', 'Đạt', 'Ngọc', 'Long', 'Chi', 'Nam', 'Hạnh', 'Vinh'][(i % 20 + Math.floor(i / 20) * 7) % 20]);
   const phone = `089700${String(i + 3000).padStart(4, '0')}`; const address = `${20 + i} ${streets[i % 5]}`;
   const id = await add('hoivien', { TaiKhoanID, HoTen: name, NgaySinh: `${1988 + i % 17}-${String(1 + i % 12).padStart(2, '0')}-${String(1 + i % 27).padStart(2, '0')}`, GioiTinh: i % 2 ? 'NAM' : 'NU', Email, SoDienThoai: phone, DiaChi: address, NgayDangKy: stamp(i % 20), ChieuCao: 155 + i % 30, CanNang: 48 + i % 38, MucTieuTheHinh: ['Giảm mỡ và tăng sức bền', 'Tăng cơ và cải thiện sức mạnh', 'Duy trì vóc dáng', 'Cải thiện độ linh hoạt'][i % 4] });
   const member = { id, index: i, account: TaiKhoanID, name, phone, address }; members.push(member);
   await add('caidatthongbao', { TaiKhoanID, PushEnabled: i % 3 ? 1 : 0, SmsEnabled: 0, PromotionEnabled: i % 5 ? 1 : 0 });
   const p = plans[i % 6]; const pending = i >= 54; const discount = i % 3 === 0 ? Math.round(p.price * .1) : 0;
   const registration = await add('dangkygoitap', { HoiVienID: id, GoiTapID: p.id, GoiTapThoiHanID: p.term, NgayDangKy: stamp(i % 20), NgayBatDau: day(pending ? 40 : i % 20), NgayKetThuc: day(pending ? 131 : i % 20 + 91), GiaThanhToan: p.price - discount, TrangThai: pending ? 'PENDING' : 'ACTIVE' });
   if (discount) await add('apdungkhuyenmaigoitap', { KhuyenMaiID: discounts.GYM[i % 4], DangKyID: registration, SoTienGiam: discount, NgayApDung: stamp(i % 20) });
   const payment = await pay(member, p.price - discount, stamp(i % 20, '09:05:00'), `Thanh toán gói tập #${registration}`, pending ? 'PENDING' : 'SUCCESS', registration);
   await add('thongbao', { TaiKhoanID, Loai: 'PACKAGE_PAYMENT', DanhMuc: 'TRANSACTION', TieuDe: pending ? 'Đang chờ thanh toán gói tập' : 'Thanh toán gói tập thành công', NoiDung: pending ? 'Vui lòng hoàn tất thanh toán để kích hoạt gói tập.' : 'Gói tập đã được kích hoạt. Chúc bạn có những buổi tập hiệu quả!', ActionType: 'MEMBERSHIP', ActionPayload: JSON.stringify({ ThanhToanID: payment }), NgayTao: stamp(i % 20, '09:06:00'), NgayDoc: i % 3 ? stamp(i % 20, '10:00:00') : null });
   const cart = await add('giohang', { HoiVienID: id, NgayTao: stamp(35) });
   for (let j = 0; j < 1 + i % 3; j++) await add('chitietgiohang', { GioHangID: cart, SanPhamID: products[(i + j) % 24].id, SoLuong: 1 + (i + j) % 2 });
   if (!pending) for (let j = 0; j < 6; j++) {
    const d = 20 + j * 3 + i % 2; const hour = i % 2 ? '18:00:00' : '10:00:00';
    const qr = await add('maqr', { MaCode: `${batch}-visit-${id}-${j}-${crypto.randomUUID()}`, NgayTao: stamp(d, hour), NgayHetHan: stamp(d, i % 2 ? '18:05:00' : '10:05:00'), TrangThai: 'EXPIRED' });
    await add('checkin', { HoiVienID: id, MaQRID: qr, ThoiGianCheckIn: stamp(d, hour), ThoiGianCheckOut: stamp(d, i % 2 ? '19:20:00' : '11:15:00'), TrangThai: 'CHECKED_OUT' });
   }
  }
  // Purchase receipts establish stock for new products; completed/processing orders consume it.
  const stock = new Map();
  for (let w = 0; w < warehouses.length; w++) for (let chunk = 0; chunk < 4; chunk++) {
   const details = products.slice(chunk * 6, chunk * 6 + 6).map((p, j) => ({ p, qty: 40 + ((w + j) % 4) * 10 }));
   const total = details.reduce((s, d) => s + d.qty * d.p.cost, 0);
   const receipt = await add('phieunhap', { KhoID: warehouses[w], NhanVienID: staff[w], NgayNhap: stamp(15 + w), TongTien: total, GhiChu: `Nhập hàng mẫu đợt ${chunk + 1} từ nhà phân phối thể thao`, TrangThai: 'COMPLETED' });
   for (const { p, qty } of details) { await add('chitietphieunhap', { PhieuNhapID: receipt, SanPhamID: p.id, SoLuong: qty, DonGia: p.cost, ThanhTien: qty * p.cost }); stock.set(`${warehouses[w]}:${p.id}`, qty); }
  }
  for (let i = 0; i < 90; i++) {
   const member = members[i % 60]; const warehouse = warehouses[i % 3]; const date = stamp(21 + i % 15, '12:00:00');
   const status = i < 72 ? 'COMPLETED' : ['PROCESSING', 'CONFIRMED', 'PENDING', 'CANCELLED'][i % 4];
   const items = Array.from({ length: 1 + i % 3 }, (_, j) => ({ p: products[(i * 3 + j) % 24], qty: 1 + (i + j) % 2 }));
   const subtotal = items.reduce((s, d) => s + d.qty * d.p.price, 0); const discount = i % 3 === 0 ? Math.round(subtotal * .1) : 0; const shipping = i % 2 ? 30000 : 0;
   const total = subtotal - discount + shipping;
   const order = await add('donhang', { HoiVienID: member.id, NgayDat: date, TongTien: total, TrangThai: status, DiaChiGiaoHang: shipping ? member.address : null, GhiChu: status === 'CANCELLED' ? 'Khách thay đổi nhu cầu; hủy trước thanh toán.' : shipping ? 'Giao hàng giờ hành chính.' : 'Nhận hàng tại quầy phòng gym.' });
   for (const { p, qty } of items) {
    await add('chitietdonhang', { DonHangID: order, SanPhamID: p.id, SoLuong: qty, DonGia: p.price, ThanhTien: qty * p.price });
    if (['COMPLETED', 'PROCESSING', 'CONFIRMED'].includes(status)) stock.set(`${warehouse}:${p.id}`, stock.get(`${warehouse}:${p.id}`) - qty);
   }
   if (discount) await add('apdungkhuyenmaidonhang', { KhuyenMaiID: discounts.SHOP[i % 4], DonHangID: order, SoTienGiam: discount, NgayApDung: date });
   const paymentStatus = status === 'CANCELLED' ? 'CANCELLED' : status === 'PENDING' ? 'PENDING' : 'SUCCESS';
   const payment = await pay(member, total, date, `Thanh toán đơn hàng #${order}`, paymentStatus);
   await add('shopcheckout', { DonHangID: order, ThanhToanID: payment, HoiVienID: member.id, KhoID: warehouse, RequestKey: `${batch}-order-${i}`, RequestHash: crypto.createHash('sha256').update(JSON.stringify({ member: member.id, items, shipping })).digest('hex'), TenNguoiNhan: member.name, SoDienThoai: member.phone, CachNhan: shipping ? 'DELIVERY' : 'PICKUP', PhiVanChuyen: shipping });
   await add('thongbao', { TaiKhoanID: member.account, Loai: 'ORDER_STATUS', DanhMuc: 'TRANSACTION', TieuDe: status === 'COMPLETED' ? 'Đơn hàng đã hoàn tất' : 'Cập nhật đơn hàng', NoiDung: `Đơn hàng #${order}: ${status}.`, ActionType: 'ORDER', ActionPayload: JSON.stringify({ DonHangID: order }), NgayTao: date });
  }
  for (const [key, qty] of stock) { assert(qty >= 0, 'Negative inventory'); const [KhoID, SanPhamID] = key.split(':').map(Number); await add('tonkho', { KhoID, SanPhamID, SoLuongTon: qty, NgayCapNhat: stamp(35, '23:00:00') }); }
  for (let t = 0; t < trainers.length; t++) for (let d = 0; d < 18; d++) for (let slot = 0; slot < 3; slot++) {
   const trainer = trainers[t]; const booked = d % 3 !== 2 && slot !== 2; const cancelled = booked && d % 7 === 0; const future = d >= 9; const hour = 8 + slot * 3;
   const schedule = await add('lichpt', { PTID: trainer.id, NgayLam: day(28 + d), GioBatDau: `${String(hour).padStart(2, '0')}:00:00`, GioKetThuc: `${String(hour + 1).padStart(2, '0')}:00:00`, TrangThai: booked && !cancelled ? 'BOOKED' : 'AVAILABLE' });
   if (booked) {
    const member = members[(t * 6 + slot * 2 + d % 2) % 54]; const discount = d % 4 === 0 ? Math.round(trainer.price * .05) : 0;
    const booking = await add('thuept', { HoiVienID: member.id, PTID: trainer.id, LichPTID: schedule, NgayDat: stamp(Math.min(35, 25 + d)), GiaThue: trainer.price - discount, TrangThai: cancelled ? 'CANCELLED' : future ? 'CONFIRMED' : 'COMPLETED', GhiChu: cancelled ? 'Hội viên đổi lịch do bận công việc.' : ['Tập kỹ thuật squat và kiểm soát tư thế.', 'Giáo án tăng cơ thân trên.', 'Cardio và vận động linh hoạt.'][slot] });
    if (discount) await add('apdungkhuyenmaipt', { KhuyenMaiID: discounts.PT[d % 4], ThuePTID: booking, SoTienGiam: discount, NgayApDung: stamp(Math.min(35, 25 + d)) });
   }
  }
  // Validate newly inserted business records before commit, with foreign keys left enabled.
  for (const r of rows.chitietdonhang) assert.equal(r.ThanhTien, r.SoLuong * r.DonGia);
  for (const r of rows.chitietphieunhap) assert.equal(r.ThanhTien, r.SoLuong * r.DonGia);
  for (const r of rows.dangkygoitap) assert(r.NgayBatDau <= r.NgayKetThuc);
  const [[badOrders]] = await c.query(`SELECT COUNT(*) n FROM shopcheckout s JOIN donhang d USING(DonHangID) JOIN thanhtoan p USING(ThanhToanID) WHERE s.RequestKey LIKE ? AND (d.TongTien <> p.SoTien OR d.TongTien <> (SELECT SUM(ThanhTien) FROM chitietdonhang cd WHERE cd.DonHangID=d.DonHangID) - COALESCE((SELECT SUM(SoTienGiam) FROM apdungkhuyenmaidonhang a WHERE a.DonHangID=d.DonHangID),0) + s.PhiVanChuyen)`, [`${batch}%`]);
  assert.equal(badOrders.n, 0, 'Order totals do not reconcile');
  const summary = [];
  for (const name of Object.keys(before)) {
   const [[r]] = await c.query('SELECT COUNT(*) n FROM ??', [name]);
   assert.equal(r.n - before[name], counts[name] || 0, `Unexpected changes in ${name}`);
   assert((counts[name] || 0) > 0, `No new data for ${name}`);
   summary.push({ table: name, before: before[name], added: counts[name], after: r.n });
  }
  await c.commit();
  const report = { batch, database: process.env.DB_NAME, date: '2026-10-07', totalAdded: Object.values(counts).reduce((a,b)=>a+b,0), fictional: true, summary };
  fs.writeFileSync(path.join(__dirname, 'seed-realistic-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
 } catch (e) { await c.rollback(); throw e; }
 finally { await c.end(); }
}
main().catch(e => { console.error(e.message); process.exitCode = 1; });
