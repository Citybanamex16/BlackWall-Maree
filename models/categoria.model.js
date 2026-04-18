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
}
