const db = require('../util/database')

class Calendario {
  static async fetchDiasHabiles() {
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
      WHERE c.Es_Laboral = 1
      ORDER BY c.Fecha ASC
    `)

    return rows
  }
}

module.exports = Calendario