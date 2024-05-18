import mysql from 'mysql2/promise.js';

const pool = mysql.createPool({
  connectionLimit: 10,
  database: 'webprog',
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'ragaszto2002',
});

export default pool;
