const db = require('../../util/database.js')

module.exports = class Sucursal {
  static async fetchAll () {
    const [result] = await db.execute(
      'SELECT ID_Sucursal, Nombre, Ciudad, Estado, `País`, Municipio, Calle, Longitud, Latitud FROM `sucursal`'
    )
    return result
  }
}
