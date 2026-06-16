const db = require('../util/database.js')

module.exports = class Tipo {
  static async fetchAll () {
    return db.execute('SELECT nombre, categoria FROM `tipos` ORDER BY categoria ASC, nombre ASC')
  }

  static async buscarPorNombre (nombre) {
    return db.execute('SELECT nombre FROM `tipos` WHERE nombre = ?', [nombre])
  }

  static async insertNuevoTipo (nombre, categoria) {
    return db.execute('INSERT INTO `tipos` (nombre, categoria) VALUES (?, ?)', [nombre, categoria])
  }

  static async fetchByCategoria (categoria) {
    return db.execute('SELECT nombre, categoria FROM `tipos` WHERE categoria = ? ORDER BY nombre ASC', [categoria])
  }

  static async buscarEnUso (nombre) {
    const [productos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `producto` WHERE `Tipo` = ?', [nombre]
    )
    return { totalProductos: productos[0].total }
  }

  static async actualizarTipo (oldNombre, newNombre, newCategoria) {
    return db.execute('CALL ActualizarTipo(?, ?, ?)', [oldNombre, newNombre, newCategoria])
  }

  static async eliminarTipo (nombre) {
    return db.execute('DELETE FROM `tipos` WHERE nombre = ?', [nombre])
  }
}
