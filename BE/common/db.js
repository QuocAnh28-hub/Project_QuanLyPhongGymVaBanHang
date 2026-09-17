const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Thiếu biến môi trường database: ${missingEnv.join(', ')}`);
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  waitForConnections: true,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Kiểm tra kết nối ngay khi backend khởi động, nhưng không làm server crash
// để endpoint /health vẫn có thể báo chính xác trạng thái database.
db.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Kết nối database thất bại:', err.message);
    return;
  }

  console.log(`✅ Kết nối MySQL thành công: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME}`);
  connection.release();
});

module.exports = db;
