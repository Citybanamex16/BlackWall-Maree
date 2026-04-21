const mysql = require('mysql2')

// Pool de conexiones
const pool = mysql.createPool({
  // host: 'localhost',
  host: '172.20.96.1', // NO LO BORREN SOLO COMENTENLO
  port: '3300',
  // port: '3000',
  user: 'root',
  database: 'mareebd',
  password: '1234',
  waitForConnection: true,
  connectionLimit: 10

})

/* ==Contraseñas y usuario ==
Usuario: CL85565990
Pass: CL006901!

*/

// Charly

/* Pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'mareebd',
  password: '',
  waitForConnection: true,
  connectionLimit: 10

})
*/

// Santi
/*
// JUAREZ

// Pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'mareebd',
  password: '',
  waitForConnection: true,
  connectionLimit: 10

})

/*
 JUAREZ

// Pool de conexiones
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'mareebd',
  password: '',
  waitForConnections: true,
  connectionLimit: 10

})
*/

module.exports = pool.promise() // Habilitamos poder usar .then() & .catch() yuhhhh
