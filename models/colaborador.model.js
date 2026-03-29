const db = require('../util/database')

class Colaborador {
  static async fetchActivos () {
    const [rows] = await db.execute(`
      SELECT id_colaborador, nombre, nombre_rol
      FROM Colaborador
      ORDER BY nombre ASC
    `)
    return rows
  }

  static async fetchById (id) {
    const [rows] = await db.execute(`
      SELECT id_colaborador, nombre, nombre_rol
      FROM Colaborador
      WHERE id_colaborador = ?
      LIMIT 1
    `, [id])

    return rows[0] || null
  }

  static async darDeBaja (id) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      await connection.execute(`
        DELETE FROM colaborador_orden
        WHERE id_colaborador = ?
      `, [id])

      const [result] = await connection.execute(`
        DELETE FROM Colaborador
        WHERE id_colaborador = ?
      `, [id])

      await connection.commit()

      return result.affectedRows > 0
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }
}

module.exports = Colaborador
