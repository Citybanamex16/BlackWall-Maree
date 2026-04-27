const db = require('../util/database.js')
const Royalty = require('../models/royalty.model.js')

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
        o.Direccion AS direccion,
        o.Descripcion AS descripcion
      FROM orden o
      LEFT JOIN cliente c
        ON o.Numero_Telefonico = c.Numero_Telefonico
      WHERE o.Estado_Orden NOT IN ('Cancelado', 'Entregado', 'Pendiente')
      ORDER BY o.Fecha DESC
    `
    return db.execute(query)
  }

  static fetchPendingOrders () {
    const query = `
      SELECT
        o.ID_Orden AS id_orden,
        c.Nombre AS nombre_cliente,
        o.Numero_Telefonico AS telefono,
        o.Tipo_Orden AS tipo_orden,
        o.Estado_Orden AS estado_orden,
        o.Fecha AS fecha,
        o.Direccion AS direccion,
        o.Descripcion AS descripcion
      FROM orden o
      LEFT JOIN cliente c
        ON o.Numero_Telefonico = c.Numero_Telefonico
      WHERE o.Estado_Orden = 'Pendiente'
      ORDER BY o.Fecha ASC
    `
    return db.execute(query)
  }

  static updateOrderStatus (idOrden, nuevoEstado) {
    const allowed = ['Pendiente', 'Preparando', 'Listo', 'Entregado', 'Cancelado']
    if (!allowed.includes(nuevoEstado)) throw new Error('Estado inválido')
    return db.execute(
      'UPDATE orden SET Estado_Orden = ? WHERE ID_Orden = ?',
      [nuevoEstado, idOrden]
    )
  }

  static fetchOne (idOrden) {
    const query = `
      SELECT
        o.ID_Orden AS id_orden,
        c.Nombre AS nombre_cliente,
        o.Numero_Telefonico AS telefono,
        o.Tipo_Orden AS tipo_orden,
        o.Descripcion AS descripcion,
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

  /* --- SECCIÓN DE POLICÍA DE PRECIOS 2.0 --- */

/**
 * Paso 3 & 4: Construye el mapa de descuentos permitidos para el usuario actual.
 * Aplica lógica EFUL (Evento > Única > Royalty) por orden de inserción.
 */
static async obtenerCompendioPromociones(usuario) {
    const compendio = {};
    console.log("\n🛠️  [COMPENDIO] Iniciando construcción de promociones aplicables...");
    console.log(`👤 [USER CONTEXT] Nivel: ${usuario.nivelRoyalty || 'General'} | EsRoyalty: ${usuario.esRoyalty}`);

    try {
        // 1. Promociones de Evento (PE)
        const [pe] = await db.query("CALL obtener_promociones_por_tipo('PE')");
        if (pe[0].length > 0) {
            console.log(`📢 [PE] Encontradas ${pe[0].length} promociones de evento.`);
            pe[0].forEach(p => {
                compendio[p.ID_Producto] = { descuento: parseFloat(p.Descuento), tipo: 'PE' };
            });
        }

        // 2. Promociones Únicas (PU)
        const [pu] = await db.query("CALL obtener_promociones_por_tipo('PU')");
        if (pu[0].length > 0) {
            console.log(`🎯 [PU] Encontradas ${pu[0].length} promociones únicas.`);
            pu[0].forEach(p => {
                // El compendio se sobreescribe si ya existe (lógica de prioridad)
                compendio[p.ID_Producto] = { descuento: parseFloat(p.Descuento), tipo: 'PU' };
            });
        }

        // 3. Promociones Royalty (PR)
        if (usuario.esRoyalty) {
            const [pr] = await db.query("CALL obtener_promociones_por_tipo('PR')");
            console.log(`👑 [PR] Evaluando ${pr[0].length} promociones de nivel para el usuario.`);
            
            pr[0].forEach(p => {
                if (p.Nombre_Royalty === usuario.nivelRoyalty) {
                    console.log(`✅ [PR MATCH] Producto ${p.ID_Producto} aplica para nivel ${usuario.nivelRoyalty}`);
                    compendio[p.ID_Producto] = { descuento: parseFloat(p.Descuento), tipo: 'PR' };
                }
            });
        } else {
            console.log("⚪ [PR SKIP] Usuario no es Royalty, saltando promociones de nivel.");
        }

        console.log("📦 [COMPENDIO FINAL] Mapeo completo:", compendio);
        return compendio;

    } catch (error) {
        console.error("❌ [COMPENDIO ERROR] Falla al armar el mapa de descuentos:", error);
        return {}; 
    }
}

/**
 * Obtiene los precios base directos de la BD.
 */
static async obtenerListaDeOro(idsProductos, idsInsumos) {
    console.log("\n📡 [LISTA ORO] Solicitando precios base a la DB...");
    const [resultSets] = await db.query("CALL ObtenerPreciosBase(?, ?)", [
        idsProductos.join(','),
        idsInsumos.join(',')
    ]);

    const lista = { productos: {}, insumos: {} };
    resultSets[0].forEach((p) => {
      lista.productos[p.id] = parseFloat(p.Precio)
    })

    resultSets[1].forEach((i) => {
      lista.insumos[i.id] = parseFloat(i.Precio)
    })

    console.log(`📥 [LISTA ORO] Cargados ${Object.keys(lista.productos).length} productos y ${Object.keys(lista.insumos).length} insumos.`);
    return lista;
}

/**
 * El "Cerebro" que aplica la matemática final item por item.
 */
static calcularPrecioRealItem(item, listaOro, compendio) {
    let acumulado = 0;
    const nombreItem = item.nombre || item.producto_base || item.id;

    console.log(`\n🔍 [POLICIA ANALIZANDO] ${nombreItem}`);

    // 1. Precio Base
    let precioBase = listaOro.productos[item.id];
    if (precioBase === undefined) {
        console.error(`🚨 [ERROR] El producto ${item.id} no existe en el catálogo base.`);
        throw new Error(`ID no encontrado: ${item.id}`);
    }
    console.log(`   💰 Precio Base: $${precioBase}`);

    // 2. Aplicar Promoción del Compendio
    if (compendio[item.id]) {
        const promo = compendio[item.id];
        const descuentoEfectivo = precioBase * promo.descuento;
        precioBase = precioBase - descuentoEfectivo;

        console.log(`   🎁 [PROMO DETECTADA] Tipo: ${promo.tipo} | Descuento: ${promo.descuento * 100}% (-$${descuentoEfectivo.toFixed(2)})`);
        console.log(`   📉 Precio con Descuento: $${precioBase.toFixed(2)}`);
    } else {
        console.log(`   ⚪ [SIN PROMO] No se encontraron descuentos aplicables para este producto.`);
    }
    
    acumulado += precioBase;

    // 3. Sumar Insumos
    const insumos = [...(item.ingredientes_adentro || []), ...(item.ingredientes_toppings || [])];
    if (insumos.length > 0) {
        console.log(`   ➕ Sumando ${insumos.length} insumos...`);
        insumos.forEach(ins => {
            const pInsumo = (listaOro.insumos[ins.id_insumo] || 0);
            if (pInsumo > 0) {
                console.log(`      • ${ins.id_insumo}: $${pInsumo}`);
            }
            acumulado += pInsumo;
        });
    }

    console.log(`   ✅ [TOTAL ITEM] $${acumulado.toFixed(2)}`);
    return acumulado;
}


  static async guardarOrden (telefono, tipoOrden, nombreCliente, direccion = null, descripcion = null) {
    const idOrden = Pedido.generarID()
    const idTurnoFijo = 'TN26496107'

    await db.execute(
      `INSERT INTO orden
      (ID_Orden, ID_Turno, Numero_Telefonico, Tipo_Orden, Nombre_cliente, Estado_Orden, Direccion, Descripcion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [idOrden, idTurnoFijo, telefono, tipoOrden, nombreCliente, 'Pendiente', direccion, descripcion]
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
            
            // C. Construimos el JSON con tipo_cambio para cada ingrediente
            const extras = [
                ...(item.ingredientes_adentro  || []).map(i => ({ ...i, tipo_cambio: 'extra'   })),
                ...(item.ingredientes_toppings || []).map(i => ({ ...i, tipo_cambio: 'extra'   })),
                ...(item.ingredientes_base     || []).map(i => ({ ...i, precio: 0, tipo_cambio: 'base'   })),
                ...(item.ingredientes_eliminados || []).map(i => ({ ...i, precio: 0, tipo_cambio: 'quitado' }))
            ];
            const jsonExtras = JSON.stringify(extras);

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
        otp.Precio_Venta AS precio,
        GROUP_CONCAT(CASE WHEN doi.tipo_cambio = 'base'    THEN i.Nombre END ORDER BY i.Nombre SEPARATOR '||') AS ings_base,
        GROUP_CONCAT(CASE WHEN doi.tipo_cambio = 'extra'   THEN i.Nombre END ORDER BY i.Nombre SEPARATOR '||') AS ings_extra,
        GROUP_CONCAT(CASE WHEN doi.tipo_cambio = 'quitado' THEN i.Nombre END ORDER BY i.Nombre SEPARATOR '||') AS ings_quitado
      FROM orden_tiene_producto otp
      JOIN producto p ON otp.ID_Producto = p.ID_Producto
      LEFT JOIN detalle_orden_insumos doi ON otp.id_orden_producto = doi.id_orden_producto
      LEFT JOIN insumo i ON doi.ID_Insumo = i.ID_Insumo
      WHERE otp.ID_Orden = ?
      GROUP BY otp.id_orden_producto, p.Nombre, otp.Cantidad, otp.Precio_Venta
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
    ORDER BY o.Fecha DESC, o.ID_Orden DESC
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
