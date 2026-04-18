const db = require('../util/database.js')

module.exports = class Categoria {
  static async fetchAll () {
    return db.execute('SELECT Nombre FROM `categoría` ORDER BY Nombre ASC')
  }

  static async buscarPorNombre (nombre) {
    return db.execute('SELECT Nombre FROM `categoría` WHERE Nombre = ?', [nombre])
  }

  static async insertNuevaCategoria (nombre) {
    return db.execute('INSERT INTO `categoría` (Nombre) VALUES (?)', [nombre])
  }

  static async buscarEnUso (nombre) {
    const [insumos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `insumo` WHERE `Categoría` = ?', [nombre]
    )
    const [productos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `producto` WHERE `Categoría` = ?', [nombre]
    )
    return {
      totalInsumos: insumos[0].total,
      totalProductos: productos[0].total
    }
  }

  static async actualizarCategoria (oldNombre, newNombre) {
    return db.execute('CALL ActualizarCategoria(?, ?)', [oldNombre, newNombre])
  }
}
