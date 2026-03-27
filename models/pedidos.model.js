const db = require('../util/database.js')

module.exports = class Pedido {
  static async fetchOrders () {
    const query = `
      SELECT
        o.\`ID_Orden\` AS id_orden,
        o.\`numero_telefonico_cliente\` AS numero_telefonico_cliente,
        o.\`Estado\` AS estatus_orden,
        o.\`Mesa\` AS mesa,
        o.\`Fecha\` AS fecha,
        c.\`Nombre\` AS nombre_cliente
      FROM \`orden\` o
      LEFT JOIN \`cliente\` c
        ON o.\`numero_telefonico_cliente\` = c.\`numero_telefonico_cliente\`
      ORDER BY o.\`ID_Orden\` DESC
    `
    return db.execute(query)
  }

  static async fetchOne (idOrden) {
    const query = `
      SELECT
        o.\`ID_Orden\` AS id_orden,
        o.\`numero_telefonico_cliente\` AS numero_telefonico_cliente,
        o.\`Estado\` AS estatus_orden
      FROM \`orden\` o
      WHERE o.\`ID_Orden\` = ?
      LIMIT 1
    `
    return db.execute(query, [idOrden])
  }

  static async cancelActiveOrder (idOrden) {
    const query = `
      UPDATE \`orden\`
      SET \`Estado\` = 'Cancelado'
      WHERE \`ID_Orden\` = ?
        AND \`Estado\` <> 'Cancelado'
      LIMIT 1
    `
    return db.execute(query, [idOrden])
  }
}
