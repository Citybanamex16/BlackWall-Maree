const db = require('../util/database.js')

module.exports = class Cliente {
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
}
