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

  static generarID (prefijo = 'OD') {
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `${prefijo}${numero}`
  }

  static async verificarDisponibilidad (nombres) {
    if (!nombres || nombres.length === 0) return { count: 0 }
    const placeholders = nombres.map(() => '?').join(', ')
    const [rows] = await db.execute(
      `SELECT COUNT(*) as count FROM producto WHERE Nombre IN (${placeholders}) AND Disponible = 1`, // Cambiar a que no busque por nombre sino por ID
      nombres
    )
    return rows[0]
  }

  static async guardarOrden (telefono, tipoOrden, nombreCliente) {
    const idOrden = Pedido.generarID()
    const idTurnoFijo = 'TN26496107'

    await db.execute(
      `INSERT INTO orden (ID_Orden, ID_Turno, Numero_Telefonico, Tipo_Orden, Nombre_cliente, Estado_Orden)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idOrden, idTurnoFijo, telefono, tipoOrden, nombreCliente]
    )
    return idOrden
  }

  static async guardarItems (idOrden, items) {
    for (const item of items) {
      const [rows] = await db.execute(
        'SELECT ID_Producto, Precio FROM producto WHERE Nombre = ? LIMIT 1',
        [item.nombre]
      )
      if (rows.length > 0) {
        const producto = rows[0]
        const precioNum = parseFloat(String(item.precio).replace(/[^0-9.]/g, ''))
        await db.execute(
          `INSERT INTO orden_tiene_producto (ID_Orden, ID_Producto, Cantidad, Precio_Unitario)
           VALUES (?, ?, ?, ?)`,
          [idOrden, producto.ID_Producto, 1, precioNum || producto.Precio]
        )
      }
    }
  }
}
