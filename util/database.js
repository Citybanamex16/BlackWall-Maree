const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  // Si usas windows o mac usa localhost, el de abajo lo usas en caso de tener una WSL y cambia
  // para cada persona
  // host: 'localhost',
  host: '172.20.96.1',
  user: 'root',
  database: 'prueba_maree',
  password: '',
  waitForConnection: true,
  connectionLimit: 10

})

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
