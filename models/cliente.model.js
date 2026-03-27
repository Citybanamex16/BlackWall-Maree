const db = require('../util/database.js')

module.exports = class Cliente {
  static async fetchContactDataByOrder (idOrden) {
    const query = `
      SELECT
        c.\`numero_telefonico_cliente\` AS telefono,
        c.\`Nombre\` AS nombre_cliente,
        c.\`Correo\` AS correo,
        c.\`Nombre_Royalty\` AS nombre_royalty
      FROM \`orden\` o
      INNER JOIN \`cliente\` c
        ON o.\`numero_telefonico_cliente\` = c.\`numero_telefonico_cliente\`
      WHERE o.\`ID_Orden\` = ?
      LIMIT 1
    `
    return db.execute(query, [idOrden])
  }
}
