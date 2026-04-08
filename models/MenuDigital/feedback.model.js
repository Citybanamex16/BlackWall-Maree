const db = require('../../util/database.js')

module.exports = class Feedback {
  static async getFeedBackCatalog () {
    const [result] = await db.execute(
      'SELECT * FROM `review` WHERE Fecha <= CURDATE();'
    )
    return result
  }
}
