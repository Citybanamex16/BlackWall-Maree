const db = require('../../util/database.js')

module.exports = class Feedback {
  static async getFeedBackCatalog () {
    const [result] = await db.execute(
      'SELECT * FROM `review` WHERE Fecha <= CURDATE() ORDER BY Fecha DESC;'
    )
    return result
  }

  // Busca review por su ID
  static async getById (id) {
    const [result] = await db.execute(
      `SELECT r.ID_Review, r.ID_Orden, r.Puntaje, r.Comentario, r.Fecha
       FROM review r
       WHERE r.ID_Review = ?`,
      [id]
    )
    return result[0] || null
  }
}
