const db = require('../../util/database.js')

module.exports = class Sucursal {
  static async fetchAll () {
    const [result] = await db.execute('SELECT * FROM sucursal;')
    return result
  }
}
