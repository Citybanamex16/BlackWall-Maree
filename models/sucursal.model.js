const db = require('../util/database.js')

module.exports = class Sucursal {
  static async fetchAll () {
    return db.execute('SELECT * FROM `sucursal` ORDER BY Nombre ASC')
  }

  static async buscarPorId (id) {
    return db.execute('SELECT * FROM `sucursal` WHERE ID_Sucursal = ?', [id])
  }

  static async buscarPorNombre (nombre) {
    return db.execute('SELECT ID_Sucursal FROM `sucursal` WHERE Nombre = ?', [nombre])
  }

  static generarID () {
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `SC${numero}`
  }

  static async insertNuevaSucursal (id, nombre, ciudad, estado, pais, municipio, calle, longitud, latitud) {
    return db.execute(
      'INSERT INTO `sucursal` (ID_Sucursal, Nombre, Ciudad, Estado, `País`, Municipio, Calle, Longitud, Latitud) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, ciudad, estado, pais, municipio, calle, longitud || null, latitud || null]
    )
  }

  static async actualizarSucursal (id, nombre, ciudad, estado, pais, municipio, calle, longitud, latitud) {
    return db.execute(
      'UPDATE `sucursal` SET Nombre=?, Ciudad=?, Estado=?, `País`=?, Municipio=?, Calle=?, Longitud=?, Latitud=? WHERE ID_Sucursal=?',
      [nombre, ciudad, estado, pais, municipio, calle, longitud || null, latitud || null, id]
    )
  }

  static async buscarEnUso (id) {
    const [turnos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `turno_tiene_sucursal` WHERE ID_Sucursal = ?', [id]
    )
    return { totalTurnos: turnos[0].total }
  }

  static async eliminarSucursal (id) {
    return db.execute('DELETE FROM `sucursal` WHERE ID_Sucursal = ?', [id])
  }
}
