const db = require('../util/database.js')

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
        p.Activo,
        DATE_FORMAT(p.Fecha_inicio, '%Y-%m-%d') AS Fecha_inicio,
        DATE_FORMAT(p.Fecha_final, '%Y-%m-%d') AS Fecha_final
      FROM promocion p
      ORDER BY p.Activo DESC, p.Fecha_inicio DESC, p.Nombre ASC
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
        p.Activo,
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

  static deletePromocion (idPromocion) {
    return db.execute('DELETE FROM promocion WHERE ID_Promocion = ?', [idPromocion])
  }

  /* funciones que utiliza modulo menu [lo agregue yo charly :)] */
  static async getPromotionsBySource (source) {
    const [result] = await db.execute('CALL obtener_promociones_por_tipo(?)', [source])
    return result
  }

  static async getPRs(idRoyalty){
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
WHERE er.Nombre_Royalty = ?;



    `,[idRoyalty])
    return result
  }
}
