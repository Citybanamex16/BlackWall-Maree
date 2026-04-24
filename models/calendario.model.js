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

  static async createDiaHabil (idCalendario, idSucursal, fecha, esLaboral, descripcion) {
    const [result] = await db.execute(`
      INSERT INTO calendario (ID_Calendario, ID_Sucursal, Fecha, Es_Laboral, Descripción)
      VALUES (?, ?, ?, ?, ?)
    `, [idCalendario, idSucursal, fecha, esLaboral, descripcion])

    return result
  }

  static async existsById (idCalendario) {
    const [rows] = await db.execute(`
      SELECT ID_Calendario
      FROM calendario
      WHERE ID_Calendario = ?
      LIMIT 1
    `, [idCalendario])

    return rows.length > 0
  }

  static async generateUniqueId () {
    let id
    let exists = true

    while (exists) {
      const randomNum = Math.floor(10000000 + Math.random() * 90000000)
      id = `DT${randomNum}`
      exists = await this.existsById(id)
    }

    return id
  }
}

module.exports = Calendario
