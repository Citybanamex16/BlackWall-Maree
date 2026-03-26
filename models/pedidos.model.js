const db = require('../util/database.js')

module.exports = class Pedido {
  static async fetchOrders () {
    const query = `
      SELECT
        p.IDPedido,
        p.IDCliente,
        p.EstatusPedido,
        p.FechaPedido,
        c.NombreCliente
      FROM pedido p
      LEFT JOIN cliente c ON p.IDCliente = c.IDCliente
      ORDER BY p.IDPedido DESC
    `
    return db.execute(query)
  }

  static async fetchOne (idPedido) {
    const query = `
      SELECT
        IDPedido,
        IDCliente,
        EstatusPedido
      FROM pedido
      WHERE IDPedido = ?
      LIMIT 1
    `
    return db.execute(query, [idPedido])
  }

  static async cancelActiveOrder (idPedido) {
    const query = `
      UPDATE pedido
      SET EstatusPedido = 'Cancelado'
      WHERE IDPedido = ?
        AND EstatusPedido NOT IN ('Cancelado', 'Entregado')
      LIMIT 1
    `
    return db.execute(query, [idPedido])
  }
}