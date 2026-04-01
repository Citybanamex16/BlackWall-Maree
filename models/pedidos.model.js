const db = require('../util/database.js')

module.exports = class Pedido {
  static fetchOrders () {
    const query = `
      SELECT
        o.ID_Orden AS id_orden,
        o.Nombre_cliente AS nombre_cliente,
        o.Numero_Telefonico AS telefono,
        o.Tipo_Orden AS tipo_orden,
        o.Estado_Orden AS estado_orden,
        o.Fecha AS fecha
      FROM orden o
      ORDER BY o.Fecha DESC
    `
    return db.execute(query)
  }

  static fetchOne (idOrden) {
    const query = `
      SELECT
        o.ID_Orden AS id_orden,
        o.Nombre_cliente AS nombre_cliente,
        o.Numero_Telefonico AS telefono,
        o.Tipo_Orden AS tipo_orden,
        o.Estado_Orden AS estado_orden,
        o.Fecha AS fecha
      FROM orden o
      WHERE o.ID_Orden = ?
      LIMIT 1
    `
    return db.execute(query, [idOrden])
  }

  static cancelActiveOrder (idOrden) {
    const query = `
      UPDATE orden
      SET Estado_Orden = 'Cancelado'
      WHERE ID_Orden = ?
        AND Estado_Orden <> 'Cancelado'
    `
    return db.execute(query, [idOrden])
  }
}
