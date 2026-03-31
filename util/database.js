const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  // Si usas windows o mac usa localhost, el de abajo lo usas en caso de tener una WSL y cambia
  // para cada persona
  host: 'mysql-maree2.alwaysdata.net',
  user: 'maree2',
  database: 'maree2_1',
  password: 'maree123',
  waitForConnection: true,
  connectionLimit: 10

})

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
