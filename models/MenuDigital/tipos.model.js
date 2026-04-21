const db = require('../../util/database.js')

module.exports = class Tipo {
  static async fetchAll () {
    const [result] = await db.execute(
      'SELECT * FROM tipos'
    )
    return result
  }
}
