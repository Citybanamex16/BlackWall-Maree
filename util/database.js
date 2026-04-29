const mysql = require('mysql2')
/*
// Pool de conexiones
/*
const pool = mysql.createPool({
  // host: 'localhost',
  host: '172.20.98.47', // NO LO BORREN SOLO COMENTENLO
  port: '3306',
  // port: '3000',
  user: 'mansi',
  database: 'mareebd',
  password: '280904',
  waitForConnection: true,
  connectionLimit: 10

})
*/

/* ==Contraseñas y usuario ==
Usuario: CL85565990
Pass: CL006901!

*/


/*
// Charly
*/




// Pool de conexiones

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'mareebd',
  password: '',
  charset: 'utf8mb4_spanish2_ci' ,
  waitForConnection: true,
  connectionLimit: 10

})

/*
=======

>>>>>>> projecthailmary
// Santi
// Pool de conexiones

const pool = mysql.createPool({
  host: 'mysql-maree2.alwaysdata.net',
  user: 'maree2',
  database: 'maree2_37',
  password: 'maree123',
  waitForConnections: true,
  connectionLimit: 10

})


/*
// Santi
// Pool de conexiones

const pool = mysql.createPool({
  host: 'mysql-maree2.alwaysdata.net',
  user: 'maree2',
  database: 'maree2_final',
  password: 'maree123',
  waitForConnections: true,
  connectionLimit: 10

})
*/
/*
// Pool de conexiones - Andy :)
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
