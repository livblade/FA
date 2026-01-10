const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Republic_C207',
    database: 'c237_fa', // This must match the schema.sql name
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;