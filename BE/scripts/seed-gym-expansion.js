// Fictional gym demo data. Preview: node scripts/seed-gym-expansion.js
// Commit: node scripts/seed-gym-expansion.js --apply
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');
const { hashPassword } = require('../common/password');

const batch = 'gym-expansion-20261007';
const today = '2026-10-07';
const apply = process.argv.includes('--apply');
const date = (base, offset = 0) => {
  const d = new Date(`${base}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
const time = (d, h = '09:00:00') => `${d} ${h}`;
function endDate(start, months) {
  const d = new Date(`${start}T00:00:00Z`);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
  target.setUTCDate(Math.min(d.getUTCDate(), new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()));
  target.setUTCDate(target.getUTCDate() - 1);
  return target.toISOString().slice(0, 10);
}
const surnames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
const maleNames = ['Minh Quân', 'Quốc Bảo', 'Đức Huy', 'Tuấn Kiệt', 'Gia Khánh', 'Anh Dũng', 'Thành Đạt', 'Hoàng Long'];
const femaleNames = ['Ngọc Linh', 'Thu Hà', 'Hải Yến', 'Phương Mai', 'Thanh Trúc', 'Khánh Vy', 'Bảo Ngọc', 'Thùy Chi'];
const streets = ['Nguyễn Trãi, Thanh Xuân, Hà Nội', 'Trần Thái Tông, Cầu Giấy, Hà Nội', 'Minh Khai, Hai Bà Trưng, Hà Nội', 'Láng Hạ, Đống Đa, Hà Nội', 'Đội Cấn, Ba Đình, Hà Nội'];

async function main() {
  const c = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER, password: process.env.DB_PASSWORD || '', database: process.env.DB_NAME, charset: 'utf8mb4', dateStrings: true });
  const ids = {}, before = {}, checks = {};
  let committed = false;
  const add = async (table, data) => {
    const [r] = await c.query('INSERT INTO ?? SET ?', [table, data]);
    const id = table === 'caidatthongbao' ? data.TaiKhoanID : table === 'shopcheckout' ? data.DonHangID : r.insertId;
    (ids[table] ||= []).push(id);
    return r.insertId;
  };
  const verify = async (name, sql, params) => {
    const [[r]] = await c.query(sql, params);
    assert.equal(Number(r.n), 0, name);
    checks[name] = 'passed';
  };
  try {
    const [[existing]] = await c.query('SELECT COUNT(*) n FROM taikhoan WHERE Email LIKE ?', [`${batch}.%@example.com`]);
    if (existing.n) {
      console.log('Batch already exists; no duplicate data added.');
      return;
    }
    const [tables] = await c.query('SHOW TABLE STATUS');
    assert(tables.every(t => t.Engine === 'InnoDB'), 'Transactional tables required');
    const [triggers] = await c.query('SHOW TRIGGERS');
    assert.equal(triggers.length, 0, 'Review triggers before seeding');
    await c.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ');
    await c.beginTransaction();
    for (const t of tables) {
      const [[r]] = await c.query('SELECT COUNT(*) n FROM ??', [t.Name]);
      before[t.Name] = r.n;
    }
    const [terms] = await c.query(`SELECT t.*, g.TenGoi FROM goitapthoihan t JOIN goitap g USING(GoiTapID)
      WHERE t.TrangThai='ACTIVE' AND g.TrangThai='ACTIVE' AND t.GiaBan > 0 AND t.SoThang IN (1,3,6) ORDER BY t.GoiTapID, t.SoThang`);
    const monthly = terms.filter(t => t.SoThang === 1 && t.ThangTang === 0);
    const longer = terms.filter(t => t.SoThang >= 3);
    assert(monthly.length && longer.length, 'Active monthly and longer package terms required');
    const [staff] = await c.query("SELECT NhanVienID FROM nhanvien WHERE TrangThai='ACTIVE' ORDER BY CASE WHEN ChucVu IN ('Thu ngân','Ke toan','Kế toán','Le tan','Lễ tân') THEN 0 ELSE 1 END, NhanVienID LIMIT 4");
    const [warehouses] = await c.query("SELECT KhoID FROM kho WHERE TrangThai='ACTIVE' ORDER BY KhoID LIMIT 1");
    assert(staff.length && warehouses.length, 'Active staff and warehouse required');
    const employee = i => staff[i % staff.length].NhanVienID;
    const password = await hashPassword('GymDemo@2026');
    const payment = async (member, amount, d, note, status, registration = null) => {
      const NhanVienID = employee(member.index);
      const id = await add('thanhtoan', { HoiVienID: member.id, DangKyID: registration, NhanVienID, SoTien: amount, NgayThanhToan: d, NoiDung: note, PhuongThucThanhToan: member.index % 5 === 0 ? 'TIEN_MAT' : member.index % 5 === 1 ? 'THE' : 'CHUYEN_KHOAN', TrangThai: status });
      if (status === 'SUCCESS') await add('hoadon', { ThanhToanID: id, NhanVienID, NgayLap: d, TongTien: amount });
      return id;
    };
    const notice = async (m, d, title, body, kind, action, payload) => add('thongbao', { TaiKhoanID: m.account, NgayTao: d, TieuDe: title, NoiDung: body, Loai: kind, DanhMuc: 'TRANSACTION', ActionType: action, ActionPayload: JSON.stringify(payload), NgayDoc: m.index % 3 ? time(d.slice(0, 10), '21:00:00') : null });
    const members = [];
    for (let i = 0; i < 80; i++) {
      const female = i % 2 === 0;
      const HoTen = `${surnames[Math.floor(i / 8)]} ${(female ? femaleNames : maleNames)[Math.floor(i / 2) % 8]}`;
      const Email = `${batch}.member${String(i + 1).padStart(3, '0')}@example.com`;
      const signup = date('2026-06-15', i % 45);
      const account = await add('taikhoan', { Email, MatKhau: password, VaiTro: 'CUSTOMER', NgayTao: time(signup) });
      const phone = `089761${String(i + 1000)}`;
      const address = `${18 + (i * 7) % 180} ${streets[i % streets.length]}`;
      const height = female ? 154 + i % 17 : 166 + i % 19;
      const weight = Math.round(height * height / 10000 * (20 + i % 9) * 10) / 10;
      const id = await add('hoivien', { TaiKhoanID: account, HoTen, NgaySinh: `${1985 + i % 23}-${String(1 + i % 12).padStart(2, '0')}-${String(1 + i % 27).padStart(2, '0')}`, GioiTinh: female ? 'NU' : 'NAM', SoDienThoai: phone, Email, DiaChi: address, NgayDangKy: time(signup), ChieuCao: height, CanNang: weight, MucTieuTheHinh: ['Giảm mỡ, duy trì thói quen tập 3 buổi mỗi tuần', 'Tăng cơ, cải thiện sức mạnh thân trên', 'Duy trì vóc dáng và tăng sức bền', 'Cải thiện tư thế và độ linh hoạt'][i % 4] });
      const m = { id, account, index: i, name: HoTen, phone, address }; members.push(m);
      await add('caidatthongbao', { TaiKhoanID: account, PushEnabled: 1, SmsEnabled: 0, PromotionEnabled: i % 4 ? 1 : 0 });
      const status = i < 60 ? 'ACTIVE' : i < 70 ? 'EXPIRED' : i < 75 ? 'PENDING' : 'CANCELLED';
      const term = status === 'EXPIRED' ? monthly[i % monthly.length] : longer[i % longer.length];
      const start = status === 'EXPIRED' ? '2026-08-01' : status === 'PENDING' ? '2026-10-08' : date('2026-09-01', i % 15);
      const purchased = status === 'PENDING' ? '2026-10-06' : status === 'CANCELLED' ? '2026-08-30' : start;
      const end = endDate(start, term.SoThang + term.ThangTang);
      const registration = await add('dangkygoitap', { HoiVienID: id, GoiTapID: term.GoiTapID, GoiTapThoiHanID: term.GoiTapThoiHanID, NgayDangKy: time(purchased), NgayBatDau: start, NgayKetThuc: end, GiaThanhToan: term.GiaBan, TrangThai: status });
      const payStatus = status === 'CANCELLED' ? 'CANCELLED' : status === 'PENDING' ? 'PENDING' : 'SUCCESS';
      const payId = await payment(m, term.GiaBan, time(purchased, '09:05:00'), `Thanh toán gói tập #${registration}: ${term.TenGoi}`, payStatus, registration);
      await notice(m, time(purchased, '09:06:00'), payStatus === 'SUCCESS' ? 'Thanh toán gói tập thành công' : payStatus === 'PENDING' ? 'Gói tập đang chờ thanh toán' : 'Đã hủy yêu cầu đăng ký gói tập', payStatus === 'SUCCESS' ? `${term.TenGoi} có hiệu lực từ ${start} đến ${end}.` : payStatus === 'PENDING' ? 'Hoàn tất thanh toán để kích hoạt gói tập.' : 'Yêu cầu đã hủy trước khi thanh toán; không phát sinh phí.', 'PACKAGE_PAYMENT', 'MEMBERSHIP', { ThanhToanID: payId });
      const cart = await add('giohang', { HoiVienID: id, NgayTao: time(purchased, '10:00:00') });
      m.cart = cart;
      if (status === 'ACTIVE' || status === 'EXPIRED') {
        for (let visit = 0; visit < (status === 'ACTIVE' ? 10 + i % 5 : 6); visit++) {
          const d = date(start, 1 + visit * 2 + i % 2);
          if (d >= today || d > end) break;
          const h = i % 3 === 0 ? '06:30:00' : i % 3 === 1 ? '18:15:00' : '19:00:00';
          const out = i % 3 === 0 ? '07:40:00' : i % 3 === 1 ? '19:30:00' : '20:10:00';
          const expiry = i % 3 === 0 ? '06:35:00' : i % 3 === 1 ? '18:20:00' : '19:05:00';
          const qr = await add('maqr', { MaCode: `${batch}-${id}-${visit}-${crypto.randomUUID()}`, NgayTao: time(d, h), NgayHetHan: time(d, expiry), TrangThai: 'EXPIRED' });
          await add('checkin', { HoiVienID: id, MaQRID: qr, ThoiGianCheckIn: time(d, h), ThoiGianCheckOut: time(d, out), TrangThai: 'CHECKED_OUT' });
        }
      }
    }
    const category = await add('danhmuc', { TenDanhMuc: 'Phụ kiện và đồ uống tại quầy', MoTa: 'Các mặt hàng phục vụ hội viên trước, trong và sau buổi tập.' });
    const catalog = [
      ['Bình nước thể thao 750ml', 145000, 'Cái', 35], ['Khăn tập microfiber 40x80cm', 85000, 'Cái', 50],
      ['Dây kháng lực mức nhẹ', 95000, 'Cái', 40], ['Dây kháng lực mức vừa', 115000, 'Cái', 40],
      ['Dây nhảy điều chỉnh độ dài', 125000, 'Cái', 30], ['Băng quấn cổ tay tập tạ', 155000, 'Đôi', 30],
      ['Bóng massage cơ 8cm', 75000, 'Cái', 35], ['Thảm tập yoga TPE 6mm', 290000, 'Cái', 25],
      ['Nước điện giải không đường 500ml', 25000, 'Chai', 120], ['Nước khoáng 500ml tại quầy', 10000, 'Chai', 180],
      ['Thanh protein vị cacao 60g', 45000, 'Thanh', 100], ['Sữa protein ít đường 250ml', 39000, 'Hộp', 90],
    ];
    const products = [];
    for (const [name, price, unit, qty] of catalog) {
      const id = await add('sanpham', { DanhMucID: category, TenSanPham: name, GiaBan: price, DonViTinh: unit, MoTa: `${name}, bán tại quầy phòng gym; phù hợp nhu cầu tập luyện hằng ngày.` });
      products.push({ id, price, qty, cost: Math.round(price * 0.62 / 1000) * 1000 });
    }
    for (let chunk = 0; chunk < 3; chunk++) {
      const goods = products.slice(chunk * 4, chunk * 4 + 4);
      const amount = goods.reduce((s, p) => s + p.qty * p.cost, 0);
      const receipt = await add('phieunhap', { KhoID: warehouses[0].KhoID, NhanVienID: employee(chunk), NgayNhap: time('2026-09-15', '08:00:00'), TongTien: amount, GhiChu: `Bổ sung hàng bán tại quầy tháng 9; nhóm ${chunk + 1}.`, TrangThai: 'COMPLETED' });
      for (const p of goods) await add('chitietphieunhap', { PhieuNhapID: receipt, SanPhamID: p.id, SoLuong: p.qty, DonGia: p.cost, ThanhTien: p.qty * p.cost });
    }
    for (let i = 0; i < 120; i++) {
      const m = members[i % 70];
      const status = i < 102 ? 'COMPLETED' : ['PROCESSING', 'CONFIRMED', 'PENDING', 'CANCELLED'][i % 4];
      const d = i < 102 ? date('2026-09-17', i % 18) : '2026-10-06';
      const items = [{ p: products[i % 12], qty: i % 12 >= 8 ? 1 + i % 3 : 1 }];
      if (i % 3 === 0) items.push({ p: products[9], qty: 1 });
      // Combine repeated product lines (e.g. buying two bottles of water).
      const unique = [...new Set(items.map(x => x.p.id))].map(id => ({ p: products.find(p => p.id === id), qty: items.filter(x => x.p.id === id).reduce((s, x) => s + x.qty, 0) }));
      const shipping = i % 5 === 0 ? 25000 : 0;
      const amount = unique.reduce((s, x) => s + x.qty * x.p.price, shipping);
      const id = await add('donhang', { HoiVienID: m.id, NgayDat: time(d, '12:10:00'), TongTien: amount, TrangThai: status, DiaChiGiaoHang: shipping ? m.address : null, GhiChu: status === 'CANCELLED' ? 'Khách hủy trước thanh toán do thay đổi nhu cầu.' : shipping ? 'Giao giờ hành chính, gọi trước khi giao.' : 'Hội viên nhận hàng tại quầy sau buổi tập.' });
      for (const x of unique) await add('chitietdonhang', { DonHangID: id, SanPhamID: x.p.id, SoLuong: x.qty, DonGia: x.p.price, ThanhTien: x.qty * x.p.price });
      const payStatus = status === 'CANCELLED' ? 'CANCELLED' : status === 'PENDING' ? 'PENDING' : 'SUCCESS';
      const paymentId = await payment(m, amount, time(d, '12:15:00'), `Thanh toán đơn hàng #${id}`, payStatus);
      await add('shopcheckout', { DonHangID: id, ThanhToanID: paymentId, HoiVienID: m.id, RequestKey: `${batch}-order-${i}`, RequestHash: crypto.createHash('sha256').update(`${batch}:${i}`).digest('hex'), TenNguoiNhan: m.name, SoDienThoai: m.phone, CachNhan: shipping ? 'DELIVERY' : 'PICKUP', PhiVanChuyen: shipping });
      const labels = { COMPLETED: 'đã hoàn tất', PROCESSING: 'đang chuẩn bị hàng', CONFIRMED: 'đã xác nhận', PENDING: 'đang chờ thanh toán', CANCELLED: 'đã hủy' };
      await notice(m, time(d, '12:16:00'), 'Cập nhật đơn hàng', `Đơn hàng #${id} ${labels[status]}.`, 'ORDER_STATUS', 'ORDER', { DonHangID: id });
    }
    for (let i = 0; i < 24; i++) await add('chitietgiohang', { GioHangID: members[i].cart, SanPhamID: products[i % 12].id, SoLuong: 1 });
    const trainerProfiles = [
      ['Nguyễn Đức Thành', 'NAM', '1992-04-16', 'Tăng cơ, kỹ thuật tập sức mạnh', 320000, 7],
      ['Trần Ngọc Hân', 'NU', '1995-08-21', 'Giảm mỡ, thể lực cho người mới', 280000, 5],
      ['Lê Quang Minh', 'NAM', '1990-11-08', 'Sức bền, cải thiện tư thế tập', 350000, 9],
      ['Phạm Thảo Nguyên', 'NU', '1994-02-12', 'Yoga, vận động linh hoạt', 300000, 6],
    ];
    for (let t = 0; t < trainerProfiles.length; t++) {
      const [name, sex, birthday, specialty, price, experience] = trainerProfiles[t];
      const trainer = await add('pt', { HoTen: name, GioiTinh: sex, NgaySinh: birthday, ChuyenMon: specialty, GiaThue: price, KinhNghiem: `${experience} năm huấn luyện; đánh giá thể lực ban đầu và theo dõi tiến bộ định kỳ.`, Email: `${batch}.pt${t + 1}@example.com`, SoDienThoai: `089762100${t}` });
      for (let n = 0; n < 42; n++) {
        const d = date('2026-09-15', n);
        const weekday = new Date(`${d}T00:00:00Z`).getUTCDay();
        if (weekday === 0 || weekday === 3) continue; // Two rest days each week.
        for (let slot = 0; slot < 3; slot++) {
          const hour = 9 + slot * 3;
          const booked = slot < 2 && n % 3 !== 2;
          const cancelled = booked && n % 11 === 0;
          const start = `${String(hour).padStart(2, '0')}:00:00`;
          const end = `${String(hour + 1).padStart(2, '0')}:00:00`;
          const schedule = await add('lichpt', { PTID: trainer, NgayLam: d, GioBatDau: start, GioKetThuc: end, TrangThai: booked && !cancelled ? 'BOOKED' : 'AVAILABLE' });
          if (booked) {
            const m = members[t * 15 + slot * 5 + n % 5];
            const placed = date(d, -3) > '2026-10-06' ? '2026-10-06' : date(d, -3);
            const state = cancelled ? 'CANCELLED' : d < today ? 'COMPLETED' : 'CONFIRMED';
            const booking = await add('thuept', { HoiVienID: m.id, PTID: trainer, LichPTID: schedule, NgayDat: time(placed, '16:00:00'), GiaThue: price, TrangThai: state, GhiChu: cancelled ? 'Hội viên bận công việc, hủy trước buổi tập.' : ['Hướng dẫn kỹ thuật và kiểm soát tư thế.', 'Giáo án phù hợp mục tiêu, tăng tải từ từ.'][slot] });
            if (state === 'COMPLETED') {
              const arrived = `${String(hour - 1).padStart(2, '0')}:50:00`;
              const expiry = `${String(hour - 1).padStart(2, '0')}:55:00`;
              const departed = `${String(hour + 1).padStart(2, '0')}:10:00`;
              const qr = await add('maqr', { MaCode: `${batch}-pt-${booking}-${crypto.randomUUID()}`, NgayTao: time(d, arrived), NgayHetHan: time(d, expiry), TrangThai: 'EXPIRED' });
              await add('checkin', { HoiVienID: m.id, MaQRID: qr, ThoiGianCheckIn: time(d, arrived), ThoiGianCheckOut: time(d, departed), TrangThai: 'CHECKED_OUT' });
            }
            await notice(m, time(placed, '16:05:00'), cancelled ? 'Đã hủy lịch PT' : 'Đã xác nhận lịch PT', cancelled ? `Lịch với ${name} ngày ${d} đã được hủy.` : `Buổi tập với ${name}: ${d}, ${start.slice(0, 5)}–${end.slice(0, 5)}.`, 'PT_BOOKING', 'PT', { ThuePTID: booking });
          }
        }
      }
    }
    const memberIds = ids.hoivien;
    await verify('Membership dates and prices', `SELECT COUNT(*) n FROM dangkygoitap d JOIN goitapthoihan t USING(GoiTapThoiHanID) WHERE d.HoiVienID IN (?) AND (d.GoiTapID<>t.GoiTapID OR d.GiaThanhToan<>t.GiaBan OR d.NgayBatDau>d.NgayKetThuc OR DATE(d.NgayDangKy)>d.NgayBatDau OR (d.TrangThai='ACTIVE' AND NOT (? BETWEEN d.NgayBatDau AND d.NgayKetThuc)) OR (d.TrangThai='EXPIRED' AND d.NgayKetThuc>=?))`, [memberIds, today, today]);
    await verify('Visits covered by paid membership', `SELECT COUNT(*) n FROM checkin v WHERE v.HoiVienID IN (?) AND (v.ThoiGianCheckOut<=v.ThoiGianCheckIn OR DATE(v.ThoiGianCheckOut)>? OR NOT EXISTS (SELECT 1 FROM dangkygoitap d JOIN thanhtoan p USING(DangKyID) WHERE d.HoiVienID=v.HoiVienID AND d.TrangThai IN ('ACTIVE','EXPIRED') AND p.TrangThai='SUCCESS' AND DATE(v.ThoiGianCheckIn) BETWEEN d.NgayBatDau AND d.NgayKetThuc))`, [memberIds, today]);
    await verify('Orders and payment totals', `SELECT COUNT(*) n FROM shopcheckout s JOIN donhang d USING(DonHangID) JOIN thanhtoan p USING(ThanhToanID) WHERE s.RequestKey LIKE ? AND (s.HoiVienID<>d.HoiVienID OR p.HoiVienID<>d.HoiVienID OR d.TongTien<>p.SoTien OR d.TongTien<>(SELECT SUM(ThanhTien) FROM chitietdonhang c WHERE c.DonHangID=d.DonHangID)+s.PhiVanChuyen OR (d.TrangThai IN ('COMPLETED','PROCESSING','CONFIRMED') AND p.TrangThai<>'SUCCESS') OR (d.TrangThai='CANCELLED' AND p.TrangThai<>'CANCELLED'))`, [`${batch}%`]);
    await verify('Invoices match successful payments', `SELECT COUNT(*) n FROM thanhtoan p LEFT JOIN hoadon h USING(ThanhToanID) WHERE p.HoiVienID IN (?) AND ((p.TrangThai='SUCCESS' AND (h.HoaDonID IS NULL OR h.TongTien<>p.SoTien)) OR (p.TrangThai<>'SUCCESS' AND h.HoaDonID IS NOT NULL))`, [memberIds]);
    await verify('No negative stock for added products', `SELECT COUNT(*) n FROM sanpham s WHERE s.SanPhamID IN (?) AND COALESCE((SELECT SUM(c.SoLuong) FROM chitietphieunhap c JOIN phieunhap p USING(PhieuNhapID) WHERE c.SanPhamID=s.SanPhamID AND p.TrangThai='COMPLETED'),0)<COALESCE((SELECT SUM(c.SoLuong) FROM chitietdonhang c JOIN donhang d USING(DonHangID) WHERE c.SanPhamID=s.SanPhamID AND d.TrangThai IN ('COMPLETED','PROCESSING','CONFIRMED')),0)`, [ids.sanpham]);
    await verify('PT booking chronology and membership', `SELECT COUNT(*) n FROM thuept b JOIN lichpt l USING(LichPTID) WHERE b.ThuePTID IN (?) AND (b.PTID<>l.PTID OR b.NgayDat>=TIMESTAMP(l.NgayLam,l.GioBatDau) OR (b.TrangThai='COMPLETED' AND l.NgayLam>=?) OR (b.TrangThai IN ('CONFIRMED','COMPLETED') AND l.TrangThai<>'BOOKED') OR NOT EXISTS (SELECT 1 FROM dangkygoitap d WHERE d.HoiVienID=b.HoiVienID AND d.TrangThai='ACTIVE' AND l.NgayLam BETWEEN d.NgayBatDau AND d.NgayKetThuc))`, [ids.thuept, today]);
    await verify('No overlapping PT bookings for members', `SELECT COUNT(*) n FROM thuept a JOIN lichpt x ON x.LichPTID=a.LichPTID JOIN thuept b ON b.HoiVienID=a.HoiVienID AND b.ThuePTID>a.ThuePTID JOIN lichpt y ON y.LichPTID=b.LichPTID WHERE a.HoiVienID IN (?) AND a.TrangThai<>'CANCELLED' AND b.TrangThai<>'CANCELLED' AND x.NgayLam=y.NgayLam AND x.GioBatDau<y.GioKetThuc AND y.GioBatDau<x.GioKetThuc`, [memberIds]);
    await verify('Receipt totals', `SELECT COUNT(*) n FROM phieunhap p WHERE p.PhieuNhapID IN (?) AND p.TongTien<>(SELECT SUM(ThanhTien) FROM chitietphieunhap c WHERE c.PhieuNhapID=p.PhieuNhapID)`, [ids.phieunhap]);
    await verify('Order line arithmetic', 'SELECT COUNT(*) n FROM chitietdonhang WHERE DonHangID IN (?) AND (SoLuong<=0 OR ThanhTien<>SoLuong*DonGia)', [ids.donhang]);
    const summary = [];
    for (const [table, addedIds] of Object.entries(ids)) {
      const [[r]] = await c.query('SELECT COUNT(*) n FROM ??', [table]);
      assert.equal(r.n - before[table], addedIds.length, `Unexpected row delta in ${table}`);
      summary.push({ table, before: before[table], added: addedIds.length, after: r.n });
    }
    const report = { batch, database: process.env.DB_NAME, date: today, fictional: true, committed: apply, totalAdded: summary.reduce((s, t) => s + t.added, 0), summary, checks, ids, demoLogin: { email: `${batch}.member001@example.com`, password: 'GymDemo@2026' } };
    // Save the audit before committing so filesystem failure cannot hide a successful seed.
    fs.writeFileSync(path.join(__dirname, apply ? 'seed-gym-expansion-report.json' : 'seed-gym-expansion-preview.json'), JSON.stringify({ ...report, committed: false }, null, 2));
    if (apply) {
      await c.commit(); committed = true;
      fs.writeFileSync(path.join(__dirname, 'seed-gym-expansion-report.json'), JSON.stringify(report, null, 2));
    } else await c.rollback();
    console.log(JSON.stringify({ ...report, ids: undefined, demoLogin: undefined }, null, 2));
    console.log(apply ? 'Committed successfully.' : 'Preview passed; rolled back. Use --apply to save.');
  } catch (error) {
    if (!committed) await c.rollback();
    throw error;
  } finally { await c.end(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
