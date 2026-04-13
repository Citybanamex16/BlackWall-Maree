const db = require('../util/database.js')

class Cliente {
  static fetchContactDataByOrder (idOrden) {
    const query = `
      SELECT
        c.Numero_Telefonico AS telefono,
        c.Nombre AS nombre_cliente,
        c.Correo AS correo,
        c.Nombre_Royalty AS nombre_royalty
      FROM orden o
      LEFT JOIN cliente c
        ON o.Numero_Telefonico = c.Numero_Telefonico
      WHERE o.ID_Orden = ?
      LIMIT 1
    `
    return db.execute(query, [idOrden])
  }

  static async fetchByPhone (numeroTelefonico) {
    const [rows] = await db.execute(`
      SELECT
        Numero_Telefonico AS numero_telefonico,
        Nombre AS nombre,
        Correo AS correo,
        Genero AS genero,
        Fecha_Nacimiento AS fecha_nacimiento
      FROM cliente
      WHERE Numero_Telefonico = ?
      LIMIT 1
    `, [numeroTelefonico])

    return rows[0] || null
  }

  static async updatePersonalData (numeroTelefonico, nombre, correo, genero, fechaNacimiento) {
    const [result] = await db.execute(`
      UPDATE cliente
      SET
        Nombre = ?,
        Correo = ?,
        Genero = ?,
        Fecha_Nacimiento = ?
      WHERE Numero_Telefonico = ?
    `, [nombre, correo, genero, fechaNacimiento, numeroTelefonico])

    return result
  }
}

module.exports = Cliente
