const mysql = require('mysql2');
require('dotenv').config();

// Cấu hình kết nối MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sfood_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Chuyển sang dạng Promise để dùng async/await dễ dàng hơn
const promisePool = pool.promise();

module.exports = promisePool;
