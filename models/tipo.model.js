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
}
