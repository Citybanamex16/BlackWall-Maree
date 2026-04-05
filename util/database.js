const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  host: 'mysql-maree2.alwaysdata.net',
  user: 'maree2',
  database: 'maree2_3',
  password: 'maree123'
  // waitForConnection: true,
  // connectionLimit: 10

})

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
