const db = require('../util/database')

class Calendario {
  static async fetchDiasHabiles () {
    const [rows] = await db.execute(`
      SELECT
        c.ID_Calendario AS id_calendario,
        c.ID_Sucursal AS id_sucursal,
        s.Nombre AS nombre_sucursal,
        c.Fecha AS fecha,
        c.Es_Laboral AS es_laboral,
        c.Descripción AS descripcion
      FROM calendario c
      LEFT JOIN sucursal s
        ON c.ID_Sucursal = s.ID_Sucursal
      ORDER BY c.Fecha ASC
    `)

    return rows
  }

  static async fetchSucursales () {
    const [rows] = await db.execute(`
      SELECT
        ID_Sucursal AS id_sucursal,
        Nombre AS nombre
      FROM sucursal
      ORDER BY Nombre ASC
    `)

    return rows
  }

  static async createDiaHabil (idSucursal, fecha, esLaboral, descripcion) {
    const [result] = await db.execute(`
      INSERT INTO calendario (ID_Sucursal, Fecha, Es_Laboral, Descripción)
      VALUES (?, ?, ?, ?)
    `, [idSucursal, fecha, esLaboral, descripcion])

    return result
  }
}

module.exports = Calendario
