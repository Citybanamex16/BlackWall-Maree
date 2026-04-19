const db = require('../util/database.js')

module.exports = class Tipo {
  static async fetchAll () {
    return db.execute('SELECT nombre FROM `tipos` ORDER BY nombre ASC')
  }

  static async buscarPorNombre (nombre) {
    return db.execute('SELECT nombre FROM `tipos` WHERE nombre = ?', [nombre])
  }

  static async insertNuevoTipo (nombre) {
    return db.execute('INSERT INTO `tipos` (nombre) VALUES (?)', [nombre])
  }

  static async buscarEnUso (nombre) {
    const [productos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `producto` WHERE `Tipo` = ?', [nombre]
    )
    return { totalProductos: productos[0].total }
  }

  static async actualizarTipo (oldNombre, newNombre) {
    return db.execute('CALL ActualizarTipo(?, ?)', [oldNombre, newNombre])
  }

  static async eliminarTipo (nombre) {
    return db.execute('DELETE FROM `tipos` WHERE nombre = ?', [nombre])
  }

}
