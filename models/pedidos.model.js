const db = require('../util/database.js')

module.exports = class Pedido {
  static fetchOrders () {
    const query = `
      SELECT
        o.ID_Orden AS id_orden,
        c.Nombre AS nombre_cliente,
        o.Numero_Telefonico AS telefono,
        o.Tipo_Orden AS tipo_orden,
        o.Estado_Orden AS estado_orden,
        o.Fecha AS fecha,
        o.Direccion AS direccion
      FROM orden o
      LEFT JOIN cliente c
        ON o.Numero_Telefonico = c.Numero_Telefonico
      WHERE o.Estado_Orden NOT IN ('Cancelado', 'Entregado')
      ORDER BY o.Fecha DESC
    `
    return db.execute(query)
  }

  static fetchOne (idOrden) {
    const query = `
      SELECT
        o.ID_Orden AS id_orden,
        c.Nombre AS nombre_cliente,
        o.Numero_Telefonico AS telefono,
        o.Tipo_Orden AS tipo_orden,
        o.Estado_Orden AS estado_orden,
        o.Fecha AS fecha
      FROM orden o
      LEFT JOIN cliente c
        ON o.Numero_Telefonico = c.Numero_Telefonico
      WHERE o.ID_Orden = ?
      LIMIT 1
    `
    return db.execute(query, [idOrden])
  }

  static generarID (prefijo = 'OD') {
    const numero = Math.floor(Math.random() * 90000000 + 10000000)
    return `${prefijo}${numero}`
  }

  static async verificarDisponibilidad (nombres) {
    if (!nombres || nombres.length === 0) return { count: 0 }

    const placeholders = nombres.map(() => '?').join(', ')
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS count
       FROM producto
       WHERE Nombre IN (${placeholders}) AND Disponible = 1`,
      nombres
    )

    return rows[0]
  }

  static async verificarDisponibilidadPorId (ids) {
    if (!ids || ids.length === 0) return []
    const [rows] = await db.execute(
      `SELECT ID_Producto FROM producto WHERE ID_Producto IN (${ids.map(() => '?').join(',')}) AND Disponible = 1`,
      ids
    )
    return rows.map(r => r.ID_Producto)
  }

  static async guardarOrden (telefono, tipoOrden, nombreCliente, direccion = null) {
    const idOrden = Pedido.generarID()
    const idTurnoFijo = 'TN26496107'

    await db.execute(
      `INSERT INTO orden
       (ID_Orden, ID_Turno, Numero_Telefonico, Tipo_Orden, Nombre_cliente, Estado_Orden, Direccion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idOrden, idTurnoFijo, telefono, tipoOrden, nombreCliente, 'Pendiente', direccion]
    )

    return idOrden
  }

  static async verificarOCrearCliente (telefono, nombre = 'Cliente') {
    const [rows] = await db.execute(
      'SELECT Numero_Telefonico FROM cliente WHERE Numero_Telefonico = ?',
      [telefono]
    )

    if (rows.length === 0) {
      await db.execute(
      `INSERT INTO cliente (Numero_Telefonico, Nombre, ID_Rol, Visitas_Actuales)
       VALUES (?, ?, 'Usuario', 0)`,
      [telefono, nombre]
      )
    }
  }

static async guardarItems(idOrden, items) {
    // 1. Obtenemos una conexión dedicada para esta transacción
    const connection = await db.getConnection(); 
    
    // 2. INICIAMOS LA TRANSACCIÓN: "A partir de aquí, o todo o nada"
    await connection.beginTransaction();

    try {
        for (const item of items) {
            // A. Extraemos el ID real (¡Es más seguro que buscar por nombre!)
            const idProductoFinal = item.id || 'PD_COMODIN';
            
            // B. Limpiamos el precio
            const precioNum = parseFloat(String(item.precio_total || item.precio || '0').replace(/[^0-9.]/g, ''));
            
            // C. Juntamos los ingredientes y los convertimos en STRING (JSON)
            const extras = [
                ...(item.ingredientes_adentro || []),
                ...(item.ingredientes_toppings || [])
            ];
            const jsonExtras = JSON.stringify(extras); // Ej: '[{"id_insumo":"IN01", "precio":15}]' o '[]'

            // D. LLAMAMOS AL STORED PROCEDURE (Uno solo que sea híbrido)
            // Le pasamos todo: ID, Precio, Cantidad y el JSON de ingredientes
            await connection.execute(
                `CALL SP_GuardarItemHibrido(?, ?, ?, ?)`,
                [idOrden, idProductoFinal, precioNum, jsonExtras]
            );
        }

        // 3. SI TODO SALIÓ BIEN: Confirmamos todos los items de golpe
        await connection.commit();
        console.log(`¡Orden ${idOrden} guardada con éxito junto con sus ingredientes!`);

    } catch (error) {
        // 4. SI ALGO FALLÓ: Revertimos absolutamente toda la orden
        await connection.rollback();
        console.error(`Error guardando la orden ${idOrden}. Se ha revertido por completo.`, error);
        throw error; 
    } finally {
        // 5. Siempre liberamos la conexión de vuelta al "pool"
        connection.release();
    }
}

  static fetchItems (idOrden) {
    const query = `
      SELECT
        p.Nombre AS nombre,
        otp.Cantidad AS cantidad,
        otp.Precio_Venta AS precio
      FROM orden_tiene_producto otp
      JOIN producto p ON otp.ID_Producto = p.ID_Producto
      WHERE otp.ID_Orden = ?
    `
    return db.execute(query, [idOrden])
  }

  static fetchClientOrders (telefono) {
  const query = `
    SELECT
      o.ID_Orden AS id_orden,
      o.Tipo_Orden AS tipo_orden,
      o.Estado_Orden AS estado_orden,
      o.Fecha AS fecha,
      o.Direccion AS direccion
    FROM orden o
    WHERE REPLACE(o.Numero_Telefonico, '-', '') = REPLACE(?, '-', '')
      AND o.Estado_Orden != 'Cancelado'
    ORDER BY o.Fecha DESC
  `
  return db.execute(query, [telefono])
}

static async cancelClientOrder (idOrden, telefono) {
  const [rows] = await db.execute(
    `SELECT Fecha, Estado_Orden, Numero_Telefonico FROM orden WHERE ID_Orden = ? LIMIT 1`,
    [idOrden]
  )
  if (!rows[0]) return { ok: false, message: 'Orden no encontrada.' }
  if (rows[0].Numero_Telefonico.replace(/-/g, '') !== String(telefono).replace(/-/g, '')) return { ok: false, message: 'No autorizado.' }
  if (rows[0].Estado_Orden === 'Cancelado') return { ok: false, message: 'Ya estaba cancelada.' }

  const diffMs = Date.now() - new Date(rows[0].Fecha).getTime()
  if (diffMs > 3 * 60 * 1000) return { ok: false, message: 'El tiempo límite de cancelación (3 min) ha expirado.' }

  await db.execute(`UPDATE orden SET Estado_Orden = 'Cancelado' WHERE ID_Orden = ?`, [idOrden])
  return { ok: true }
}


  static cancelActiveOrder (idOrden) {
    const query = `
      UPDATE orden
      SET Estado_Orden = 'Cancelado'
      WHERE ID_Orden = ? AND Estado_Orden NOT IN ('Cancelado', 'Entregado')
    `
    return db.execute(query, [idOrden])
  }
}
