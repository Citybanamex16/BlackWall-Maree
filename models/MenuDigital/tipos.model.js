const db = require('../../util/database.js')

module.exports = class Tipo {
  static async fetchAll () {
    const [result] = await db.execute(
      'SELECT * FROM tipos ORDER BY nombre ASC'
    )
    return result
  }

  static async fetchByCategoria (categoria) {
    return db.execute(
      'SELECT nombre, categoria FROM `tipos` WHERE categoria = ? ORDER BY nombre ASC',
      [categoria]
    )
  }
}
