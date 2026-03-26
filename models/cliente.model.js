const db = require('../util/database.js')

module.exports = class Cliente {
  static async fetchContactDataByOrder (idPedido) {
    const query = `
      SELECT
        c.IDCliente,
        c.NombreCliente,
        c.Telefono
      FROM pedido p
      INNER JOIN cliente c ON p.IDCliente = c.IDCliente
      WHERE p.IDPedido = ?
      LIMIT 1
    `
    return db.execute(query, [idPedido])
  }
}