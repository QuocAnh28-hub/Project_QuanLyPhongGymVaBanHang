const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const db = require('./common/db');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

app.disable('x-powered-by');

const corsOrigins = (process.env.CORS_ORIGINS || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // Native apps/Postman/curl thường không gửi Origin.
    if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    const error = new Error(`Origin không được CORS cho phép: ${origin}`);
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/', (req, res) => {
  res.json({
    message: 'QA-Gym Backend API đang chạy',
    health: '/health'
  });
});

app.get('/health', (req, res) => {
  db.query('SELECT 1 AS ok', (err) => {
    if (err) {
      return res.status(503).json({
        status: 'degraded',
        api: 'ok',
        database: 'error',
        message: err.message
      });
    }

    return res.json({
      status: 'ok',
      api: 'ok',
      database: 'ok'
    });
  });
});

const routes = [
  ['/auth/admin', './routes/admin-auth.route'],
  ['/auth', './routes/auth.route', 'router'],
  ['/auth', './routes/recovery.route'],
  ['/apdungkhuyenmaidonhang', './routes/apdungkhuyenmaidonhang.route'],
  ['/apdungkhuyenmaigoitap', './routes/apdungkhuyenmaigoitap.route'],
  ['/apdungkhuyenmaipt', './routes/apdungkhuyenmaipt.route'],
  ['/checkin', './routes/checkin.route'],
  ['/chitietdonhang', './routes/chitietdonhang.route'],
  ['/chitietgiohang', './routes/chitietgiohang.route'],
  ['/chitietphieunhap', './routes/chitietphieunhap.route'],
  ['/dangkygoitap', './routes/dangkygoitap.route'],
  ['/danhmuc', './routes/danhmuc.route'],
  ['/donhang', './routes/donhang.route'],
  ['/giohang', './routes/giohang.route'],
  ['/goitap', './routes/goitap.route'],
  ['/hoadon', './routes/hoadon.route'],
  ['/hoivien', './routes/hoivien.route'],
  ['/kho', './routes/kho.route'],
  ['/khuyenmai', './routes/khuyenmai.route'],
  ['/lichpt', './routes/lichpt.route'],
  ['/maqr', './routes/maqr.route'],
  ['/nhanvien', './routes/nhanvien.route'],
  ['/phieunhap', './routes/phieunhap.route'],
  ['/pt', './routes/pt.route'],
  ['/reports', './routes/report.route'],
  ['/sanpham', './routes/sanpham.route'],
  ['/taikhoan', './routes/taikhoan.route'],
  ['/thanhtoan', './routes/thanhtoan.route'],
  ['/thongbao', './routes/thongbao.route'],
  ['/thuept', './routes/thuept.route']
];

const adminOnly = new Set(['/apdungkhuyenmaidonhang','/apdungkhuyenmaigoitap','/apdungkhuyenmaipt','/danhmuc','/goitap','/hoadon','/kho','/khuyenmai','/nhanvien','/phieunhap','/reports','/sanpham','/taikhoan']);
const customerPaths = [
  /^GET \/(?:goitap\/active|pt\/active|lichpt\/available|sanpham|danhmuc)(?:\/|$)/,
  /^(?:GET|PUT) \/hoivien\/account\/\d+$/, /^POST \/taikhoan\/\d+\/change-password$/,
  /^GET \/dangkygoitap\/(?:(?:current|owned)\/account\/\d+|detail\/\d+)$/, /^POST \/dangkygoitap\/(?:register|\d+\/renew)$/,
  /^(?:GET|POST) \/checkin\/(?:token|history\/account\/\d+)$/, /^(?:GET|POST) \/thanhtoan\/(?:history\/account\/\d+|package(?:\/\d+)?|registration\/\d+)$/,
  /^(?:GET|POST) \/thuept\/(?:book|account\/\d+|detail\/\d+|\d+\/cancel)$/, /^(?:GET|POST|PUT) \/thongbao\/(?:account\/\d+(?:\/read-all)?|preferences\/account\/\d+|\d+\/read)$/,
  /^(?:GET|POST|PUT) \/giohang\/account\/\d+\/items$/, /^(?:GET|POST) \/donhang\/(?:checkout\/\d+|account\/\d+\/)/
];
async function authorizeApi(req, res, next) {
  if (req.auth.VaiTro === 'ADMIN') return next();
  if (req.auth.VaiTro === 'STAFF') return adminOnly.has(req.baseUrl) ? res.status(403).json({ message: 'Chỉ Admin được thực hiện thao tác này.' }) : next();
  const fullPath = req.baseUrl + req.path;
  if (!customerPaths.some(pattern => pattern.test(`${req.method} ${fullPath}`))) return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  const pathId = fullPath.match(/(?:account|taikhoan)\/(\d+)/i)?.[1] || (req.baseUrl === '/taikhoan' ? req.path.match(/^\/(\d+)/)?.[1] : null);
  const bodyId = req.body?.TaiKhoanID ?? req.body?.accountId;
  if ((pathId && Number(pathId) !== Number(req.auth.TaiKhoanID)) || (bodyId && Number(bodyId) !== Number(req.auth.TaiKhoanID)))
    return res.status(403).json({ message: 'Không được truy cập dữ liệu của tài khoản khác.' });
  let ownershipSql;
  let resourceId;
  const registration = fullPath.match(/^\/(?:dangkygoitap\/detail|thanhtoan\/registration)\/(\d+)$/)?.[1] || req.body?.DangKyID;
  if (registration) {
    resourceId = Number(registration);
    ownershipSql = 'SELECT 1 FROM dangkygoitap d JOIN hoivien h ON h.HoiVienID=d.HoiVienID WHERE d.DangKyID=? AND h.TaiKhoanID=?';
  } else if ((resourceId = Number(fullPath.match(/^\/thanhtoan\/package\/(\d+)$/)?.[1]))) {
    ownershipSql = 'SELECT 1 FROM thanhtoan t JOIN hoivien h ON h.HoiVienID=t.HoiVienID WHERE t.ThanhToanID=? AND h.TaiKhoanID=?';
  } else if ((resourceId = Number(fullPath.match(/^\/thuept\/(?:detail\/)?(\d+)(?:\/cancel)?$/)?.[1]))) {
    ownershipSql = 'SELECT 1 FROM thuept t JOIN hoivien h ON h.HoiVienID=t.HoiVienID WHERE t.ThuePTID=? AND h.TaiKhoanID=?';
  } else if ((resourceId = Number(fullPath.match(/^\/thongbao\/(\d+)\/read$/)?.[1]))) {
    ownershipSql = 'SELECT 1 FROM thongbao WHERE ThongBaoID=? AND TaiKhoanID=?';
  }
  if (ownershipSql) {
    const [rows] = await db.promise().query(ownershipSql, [resourceId, req.auth.TaiKhoanID]);
    if (!rows.length) return res.status(403).json({ message: 'Không được truy cập dữ liệu của tài khoản khác.' });
  }
  next();
}
function protectApi(req, res, next) {
  if ((req.baseUrl === '/taikhoan' && req.path === '/register') || (req.baseUrl === '/checkin' && req.path === '/scan')) return next();
  requireAuth(req, res, error => error ? next(error) : Promise.resolve(authorizeApi(req, res, next)).catch(next));
}
routes.forEach(([basePath, modulePath, property]) => {
  const route = property ? require(modulePath)[property] : require(modulePath);
  app.use(basePath, basePath.startsWith('/auth') ? route : [protectApi, route]);
});

app.use((req, res) => {
  res.status(404).json({
    message: 'Không tìm thấy API',
    method: req.method,
    path: req.originalUrl
  });
});

// Error handler cuối cùng: bắt lỗi JSON, CORS và lỗi middleware/route chưa xử lý.
app.use((err, req, res, next) => {
  console.error('❌ Backend error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);

  return res.status(status).json({
    message: status === 400 ? 'Dữ liệu JSON không hợp lệ' : (err.message || 'Lỗi máy chủ'),
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
});

let server;

if (require.main === module) {
  server = app.listen(PORT, HOST, () => {
    console.log(`🚀 QA-Gym API: http://${HOST}:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  });

  const shutdown = (signal) => {
    console.log(`\n${signal} - đang đóng backend...`);
    server.close(() => {
      db.end(() => {
        console.log('✅ Đã đóng HTTP server và MySQL pool.');
        process.exit(0);
      });
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
