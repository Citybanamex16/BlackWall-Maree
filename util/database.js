const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',
  // host: '172.20.96.1', // NO LO BORREN SOLO COMENTENLO
  // port: '3307',
  // port: '3306',
  user: 'root',
  database: 'maree',
  password: '',
  waitForConnection: true,
  connectionLimit: 10

})

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
