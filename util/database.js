const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  host: process.env.HOST || 'localhost',
  user: process.env.USER || 'root',
  database: process.env.DB || 'MareeDB',
  password: process.env.PASSWORD || '',
  waitForConnection: true,
  connectionLimit: 10

})

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
