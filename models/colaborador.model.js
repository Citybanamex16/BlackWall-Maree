const db = require('../util/database')

class Colaborador {
  static async fetchActivos () {
    const [rows] = await db.execute(`
      SELECT 
        c.ID_Colaborador AS id_colaborador,
        c.Nombre AS nombre,
        c.ID_Rol AS rol
      FROM colaborador c
      ORDER BY c.Nombre ASC
    `)

    return rows
  }

  static async fetchById (id) {
    const [rows] = await db.execute(`
      SELECT 
        c.ID_Colaborador AS id_colaborador,
        c.Nombre AS nombre,
        c.ID_Rol AS rol
      FROM colaborador c
      WHERE c.ID_Colaborador = ?
      LIMIT 1
    `, [id])

    return rows[0] || null
  }

  static async existsById (id) {
    const [rows] = await db.execute(`
      SELECT ID_Colaborador
      FROM colaborador
      WHERE ID_Colaborador = ?
      LIMIT 1
    `, [id])

    return rows.length > 0
  }

  static async create (idColaborador, idRol, nombre, contrasena) {
    const [result] = await db.execute(`
      INSERT INTO colaborador (ID_Colaborador, ID_Rol, Nombre, Contraseña)
      VALUES (?, ?, ?, ?)
    `, [idColaborador, idRol, nombre, contrasena])

    return result
  }

  static async darDeBaja (id) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      await connection.execute(`
        DELETE FROM colaborador_tiene_turno
        WHERE ID_Colaborador = ?
      `, [id])

      const [result] = await connection.execute(`
        DELETE FROM colaborador
        WHERE ID_Colaborador = ?
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

  static async generateUniqueId () {
    let id
    let exists = true
    while (exists) {
      const randomNum = Math.floor(10000000 + Math.random() * 90000000)
      id = `CL${randomNum}`
      exists = await this.existsById(id)
    }
    return id
  }
}

module.exports = Colaborador
