const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  // Si usas windows o mac usa localhost, el de abajo lo usas en caso de tener una WSL y cambia
  // para cada persona
  host: 'localhost',
  user: 'root',
  database: 'maree',
  password: '',
  waitForConnection: true,
  connectionLimit: 10

})

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
