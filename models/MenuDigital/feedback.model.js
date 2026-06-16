const db = require('../../util/database.js')

module.exports = class Feedback {
  static async getFeedBackCatalog () {
    const [result] = await db.execute(
      'SELECT * FROM `review` WHERE Fecha <= NOW() ORDER BY Fecha DESC;'
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

  // Cliente modelos

  static async postNewOrderFeedback (ReviewData, IntermediaryData) {
    // El orden debe ser: ID_Review, ID_Orden, Puntaje, Fecha_Hora, Comentario, Numero_Telefonico
    const params = [
      ReviewData.ID_Review,
      ReviewData.ID_Orden,
      ReviewData.Puntaje,
      ReviewData.Fecha_Hora,
      ReviewData.Comentario,
      IntermediaryData.Numero_Telefonico
    ]

    const [result] = await db.execute('CALL sp_RegistrarReview(?, ?, ?, ?, ?, ?)', params)

    // Al usar CALL, result suele ser un array donde el primer elemento
    // contiene el SELECT de éxito/error del SP.
    return result[0]
  }

  static async getClientFeedback (telefono) {
    const [result] = await db.execute(`
        SELECT 
            r.ID_Review, 
            r.ID_Orden, 
            r.Puntaje, 
<<<<<<< HEAD
            r.Fecha,
=======
            r.Fecha, 
>>>>>>> 9c92809c781ea36f566c4966bc0b061fa9a6c9c5
            r.Comentario
        FROM review r
        INNER JOIN cliente_tiene_review ctr ON r.ID_Review = ctr.ID_Review
        WHERE ctr.Numero_Telefonico = ?
        ORDER BY r.Fecha DESC
    `, [telefono])
    return result
  }
}
