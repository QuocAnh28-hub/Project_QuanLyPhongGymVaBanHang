const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const db = require('./common/db');

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
  ['/sanpham', './routes/sanpham.route'],
  ['/taikhoan', './routes/taikhoan.route'],
  ['/thanhtoan', './routes/thanhtoan.route'],
  ['/thuept', './routes/thuept.route']
];

routes.forEach(([basePath, modulePath]) => {
  app.use(basePath, require(modulePath));
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
