const db = require('../util/database.js')

const PROMOCION_EXPIRADA_SQL = 'COALESCE(p.Fecha_final, p.Fecha_inicio) < CURDATE()'
const PROMOCION_NO_VENCIDA_SQL = 'COALESCE(p.Fecha_final, p.Fecha_inicio) >= CURDATE()'
const PROMOCION_VIGENTE_SQL = `p.Activo = 1 AND CURDATE() BETWEEN p.Fecha_inicio AND COALESCE(p.Fecha_final, p.Fecha_inicio)`
const PROMOCION_VIGENTE_PROMO_SQL = 'promo.Activo = 1 AND CURDATE() BETWEEN promo.Fecha_inicio AND COALESCE(promo.Fecha_final, promo.Fecha_inicio)'

const normalizarIds = (idsPromocion = []) => {
  if (!Array.isArray(idsPromocion)) {
    return []
  }

  return [...new Set(
    idsPromocion
      .map(idPromocion => String(idPromocion).trim())
      .filter(Boolean)
  )]
}

module.exports = class Promocion {
  constructor (id, nombre, descuento, condiciones, activo, fechaInicio, fechaFinal) {
    this.id_promocion = id
    this.nombre = nombre
    this.descuento = descuento
    this.condiciones = condiciones
    this.activo = activo
    this.fecha_inicio = fechaInicio
    this.fecha_final = fechaFinal
  }

  save () {
    return db.execute(
      'INSERT INTO promocion (ID_promocion, Nombre, Descuento, Condiciones, Activo, Fecha_inicio, Fecha_final) VALUES (?,?,?,?,?,?,?)',
      [this.id_promocion, this.nombre, this.descuento, this.condiciones, this.activo, this.fecha_inicio, this.fecha_final]
    )
  }

  static fetchAll () {
    return db.execute(`
      SELECT
        p.ID_Promocion,
        p.Nombre,
        p.Descuento,
        ROUND(p.Descuento * 100, 2) AS DescuentoPorcentaje,
        p.Condiciones,
        CASE
          WHEN ${PROMOCION_EXPIRADA_SQL} THEN 0
          ELSE p.Activo
        END AS Activo,
        CASE
          WHEN ${PROMOCION_EXPIRADA_SQL} THEN 1
          ELSE 0
        END AS Expirada,
        DATE_FORMAT(p.Fecha_inicio, '%Y-%m-%d') AS Fecha_inicio,
        DATE_FORMAT(p.Fecha_final, '%Y-%m-%d') AS Fecha_final
      FROM promocion p
      ORDER BY Activo DESC, p.Fecha_inicio DESC, p.Nombre ASC
    `)
  }

  static fetchById (idPromocion) {
    return db.execute(`
      SELECT
        p.ID_Promocion,
        p.Nombre,
        p.Descuento,
        ROUND(p.Descuento * 100, 2) AS DescuentoPorcentaje,
        p.Condiciones,
        CASE
          WHEN ${PROMOCION_EXPIRADA_SQL} THEN 0
          ELSE p.Activo
        END AS Activo,
        CASE
          WHEN ${PROMOCION_EXPIRADA_SQL} THEN 1
          ELSE 0
        END AS Expirada,
        DATE_FORMAT(p.Fecha_inicio, '%Y-%m-%d') AS Fecha_inicio,
        DATE_FORMAT(p.Fecha_final, '%Y-%m-%d') AS Fecha_final
      FROM promocion p
      WHERE p.ID_Promocion = ?
      LIMIT 1
    `, [idPromocion])
  }

  static fetchCategorías () {
    return db.execute('SELECT DISTINCT Categoría FROM producto ORDER BY Categoría ASC')
  }

  static fetchTipo () {
    return db.execute('SELECT DISTINCT Tipo FROM producto ORDER BY Tipo ASC')
  }

  static fetchProductos (categoria, tipo) {
    let query = 'SELECT ID_Producto, Nombre FROM producto WHERE 1=1'
    const params = []

    if (categoria && categoria !== '') {
      query += ' AND Categoría = ?'
      params.push(categoria)
    }

    if (tipo && tipo !== '') {
      query += ' AND Tipo = ?'
      params.push(tipo)
    }

    query += ' ORDER BY Nombre ASC'

    return db.execute(query, params)
  }

  static fetchProductosPromocion (idPromocion) {
    return db.execute(`
      SELECT
        p.ID_Producto,
        p.Nombre
      FROM producto_tiene_promocion ptp
      INNER JOIN producto p
        ON p.ID_Producto = ptp.ID_Producto
      WHERE ptp.ID_Promocion = ?
      ORDER BY p.Nombre ASC
    `, [idPromocion])
  }

  static fetchPromocionesPopulares (limit = 5) {
    const limiteSeguro = Number.isInteger(Number(limit)) && Number(limit) > 0
      ? Number(limit)
      : 5

    return db.execute(`
      SELECT
        p.ID_Promocion,
        p.Nombre,
        COUNT(cp.ID_Promocion) AS usos,
        COUNT(DISTINCT cp.Numero_Telefonico) AS clientes_distintos,
        SUM(CASE WHEN cp.Canjeado = 1 THEN 1 ELSE 0 END) AS promociones_canjeadas
      FROM promocion p
      LEFT JOIN cliente_canjea_promociones cp
        ON cp.ID_Promocion = p.ID_Promocion
      GROUP BY p.ID_Promocion, p.Nombre
      HAVING usos > 0
      ORDER BY usos DESC, promociones_canjeadas DESC, clientes_distintos DESC, p.Nombre ASC
      LIMIT ${limiteSeguro}
    `)
  }

  static async isExpired (idPromocion) {
    const [rows] = await db.execute(`
      SELECT
        CASE
          WHEN COALESCE(Fecha_final, Fecha_inicio) < CURDATE() THEN 1
          ELSE 0
        END AS expirada
      FROM promocion
      WHERE ID_Promocion = ?
      LIMIT 1
    `, [idPromocion])

    if (rows.length === 0) {
      return null
    }

    return rows[0].expirada === 1 || rows[0].expirada === '1'
  }

  static guardarProductosPromocion (idPromocion, idsProductos) {
    const idsUnicos = [...new Set((idsProductos || []).filter(Boolean))]

    if (idsUnicos.length === 0) {
      return Promise.resolve()
    }

    const valores = idsUnicos.map(idProducto => [idProducto, idPromocion])
    return db.query(
      'INSERT INTO producto_tiene_promocion (ID_Producto, ID_Promocion) VALUES ?',
      [valores]
    )
  }

  static async reemplazarProductosPromocion (idPromocion, idsProductos) {
    await db.execute('DELETE FROM producto_tiene_promocion WHERE ID_Promocion = ?', [idPromocion])
    return this.guardarProductosPromocion(idPromocion, idsProductos)
  }

  static updatePromocion (idPromocion, datosPromocion) {
    const {
      nombre,
      descuento,
      condiciones,
      activo,
      fechaInicio,
      fechaFinal
    } = datosPromocion

    return db.execute(
      'UPDATE promocion SET Nombre = ?, Descuento = ?, Condiciones = ?, Activo = ?, Fecha_inicio = ?, Fecha_final = ? WHERE ID_Promocion = ?',
      [nombre, descuento, condiciones, activo, fechaInicio, fechaFinal, idPromocion]
    )
  }

  static desactivarPromocion (idPromocion) {
    return db.execute(
      'UPDATE promocion SET Activo = 0 WHERE ID_Promocion = ?',
      [idPromocion]
    )
  }

  static activarPromocion (idPromocion) {
    return db.execute(
      'UPDATE promocion SET Activo = 1 WHERE ID_Promocion = ?',
      [idPromocion]
    )
  }

  static async validarEliminacion (idPromocion) {
    const [
      [canjesRows],
      [royaltyRows],
      [eventosRows]
    ] = await Promise.all([
      db.execute('SELECT COUNT(*) AS total FROM cliente_canjea_promociones WHERE ID_Promocion = ?', [idPromocion]),
      db.execute('SELECT COUNT(*) AS total FROM estado_royalty_da_promociones WHERE ID_Promocion = ?', [idPromocion]),
      db.execute('SELECT COUNT(*) AS total FROM evento_contiene_promocion WHERE ID_Promocion = ?', [idPromocion])
    ])

    const restricciones = []

    if (canjesRows[0].total > 0) {
      restricciones.push('La promoción ya fue utilizada por clientes.')
    }

    if (royaltyRows[0].total > 0) {
      restricciones.push('La promoción está asociada a un beneficio de royalty.')
    }

    if (eventosRows[0].total > 0) {
      restricciones.push('La promoción está vinculada a uno o más eventos.')
    }

    return {
      eliminable: restricciones.length === 0,
      restricciones
    }
  }

  static async deletePromocion (idPromocion) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()
      await connection.execute('DELETE FROM producto_tiene_promocion WHERE ID_Promocion = ?', [idPromocion])
      await connection.execute('DELETE FROM promocion WHERE ID_Promocion = ?', [idPromocion])
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static async deleteExpiredPromocion (idPromocion) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()
      await connection.execute('DELETE FROM cliente_canjea_promociones WHERE ID_Promocion = ?', [idPromocion])
      await connection.execute('DELETE FROM estado_royalty_da_promociones WHERE ID_Promocion = ?', [idPromocion])
      await connection.execute('DELETE FROM evento_contiene_promocion WHERE ID_Promocion = ?', [idPromocion])
      await connection.execute('DELETE FROM producto_tiene_promocion WHERE ID_Promocion = ?', [idPromocion])
      await connection.execute('DELETE FROM promocion WHERE ID_Promocion = ?', [idPromocion])
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  /* funciones que utiliza modulo menu [lo agregue yo charly :)] */
  static async getPromotionsBySource (source) {
    if (source === 'PE') {
      const [rows] = await db.execute(`
        SELECT
          p.ID_Producto,
          p.Nombre AS Producto,
          promo.Nombre AS Plantilla_Promo,
          promo.Descuento,
          'Evento' AS Origen
        FROM evento_contiene_promocion ecp
        INNER JOIN evento e
          ON e.ID_Evento = ecp.ID_Evento
        INNER JOIN producto_tiene_promocion ptp
          ON ecp.ID_Promocion = ptp.ID_Promocion
        INNER JOIN producto p
          ON ptp.ID_Producto = p.ID_Producto
        INNER JOIN promocion promo
          ON ptp.ID_Promocion = promo.ID_Promocion
        WHERE e.Activo = 1
          AND CURDATE() BETWEEN e.Fecha_Inicio AND COALESCE(e.Fecha_Final, e.Fecha_Inicio)
          AND ${PROMOCION_VIGENTE_PROMO_SQL}
      `)

      return [rows]
    }

    if (source === 'PU') {
      const [rows] = await db.execute(`
        SELECT
          p.ID_Producto,
          p.Nombre AS Producto,
          promo.Nombre AS Plantilla_Promo,
          promo.Descuento,
          'Única' AS Origen
        FROM producto_tiene_promocion ptp
        INNER JOIN producto p
          ON p.ID_Producto = ptp.ID_Producto
        INNER JOIN promocion promo
          ON promo.ID_Promocion = ptp.ID_Promocion
        WHERE ${PROMOCION_VIGENTE_PROMO_SQL}
          AND ptp.ID_Promocion NOT IN (SELECT ID_Promocion FROM evento_contiene_promocion)
          AND ptp.ID_Promocion NOT IN (SELECT ID_Promocion FROM estado_royalty_da_promociones)
      `)

      return [rows]
    }

    if (source === 'PR') {
      const [rows] = await db.execute(`
        SELECT
          p.ID_Producto,
          p.Nombre AS Producto,
          promo.Nombre AS Plantilla_Promo,
          promo.Descuento,
          erp.Nombre_Royalty,
          'Royalty' AS Origen
        FROM estado_royalty_da_promociones erp
        INNER JOIN producto_tiene_promocion ptp
          ON erp.ID_Promocion = ptp.ID_Promocion
        INNER JOIN producto p
          ON ptp.ID_Producto = p.ID_Producto
        INNER JOIN promocion promo
          ON ptp.ID_Promocion = promo.ID_Promocion
        WHERE ${PROMOCION_VIGENTE_PROMO_SQL}
          AND erp.ID_Promocion NOT IN (SELECT ID_Promocion FROM evento_contiene_promocion)
      `)

      return [rows]
    }

    return [[{ Mensaje: 'Error: El parámetro debe ser PU, PE o PR' }]]
  }

  static async getPRs (idRoyalty) {
    const [result] = await db.execute(`
   SELECT 
    'Royalty' AS Origen, -- <--- Atributo fijo siempre como "Royalty"
    er.Nombre_Royalty,
    p.ID_Promocion,
    p.Nombre AS Plantilla_Promo,
    p.Descuento,
    prod.ID_Producto,
    prod.Nombre AS Producto
FROM Estado_Royalty er
JOIN estado_royalty_da_promociones erdp ON er.Nombre_Royalty = erdp.Nombre_Royalty
JOIN Promocion p ON erdp.ID_Promocion = p.ID_Promocion
JOIN producto_tiene_promocion ptp ON p.ID_Promocion = ptp.ID_Promocion
JOIN producto prod ON ptp.ID_Producto = prod.ID_Producto
WHERE er.Nombre_Royalty = ?
  AND p.Activo = 1
  AND CURDATE() BETWEEN p.Fecha_inicio AND COALESCE(p.Fecha_final, p.Fecha_inicio)
  AND erdp.ID_Promocion NOT IN (
    SELECT ID_Promocion FROM evento_contiene_promocion
  );



    `, [idRoyalty])
    return result
  }

  static async fetchAvailableByIds (idsPromocion = []) {
    const ids = normalizarIds(idsPromocion)

    if (ids.length === 0) {
      return [[]]
    }

    const placeholders = ids.map(() => '?').join(', ')

    return db.execute(`
      SELECT ID_Promocion AS id
      FROM promocion p
      WHERE p.ID_Promocion IN (${placeholders})
        AND p.Activo = 1
        AND ${PROMOCION_NO_VENCIDA_SQL}
    `, ids)
  }
}
