const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'gym_management'
});

db.connect((err) => {
  if (err) {
    console.log('Kết nối database thất bại:', err);
    return;
  }
  console.log('Kết nối database thành công!');
});

module.exports = db;
