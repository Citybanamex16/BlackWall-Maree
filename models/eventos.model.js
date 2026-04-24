const db = require('../util/database.js')

const normalizarIds = (ids = []) => {
  if (!Array.isArray(ids)) {
    return []
  }

  return [...new Set(
    ids
      .map(id => String(id).trim())
      .filter(Boolean)
  )]
}

const generarIdEvento = async (connection) => {
  let idGenerado = ''
  let existe = true

  while (existe) {
    const numero = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    idGenerado = `EV${numero}`

    const [filas] = await connection.execute(
      'SELECT ID_Evento FROM evento WHERE ID_Evento = ?',
      [idGenerado]
    )

    existe = filas.length > 0
  }

  return idGenerado
}

const guardarRelaciones = async (connection, idEvento, promociones, productos) => {
  const idsPromociones = normalizarIds(promociones)
  const idsProductos = normalizarIds(productos)

  if (idsPromociones.length > 0) {
    const valoresPromociones = idsPromociones.map(idPromocion => [idEvento, idPromocion])
    await connection.query(
      'INSERT INTO evento_contiene_promocion (ID_Evento, ID_Promocion) VALUES ?',
      [valoresPromociones]
    )
  }

  if (idsProductos.length > 0) {
    const valoresProductos = idsProductos.map(idProducto => [idEvento, idProducto])
    await connection.query(
      'INSERT INTO producto_pertenece_evento (ID_Evento, ID_Producto) VALUES ?',
      [valoresProductos]
    )
  }
}

module.exports = class Evento {
  constructor ({
    id = null,
    nombre,
    descripcion,
    fechaInicio,
    fechaFinal,
    imagen = null,
    activo = true,
    promociones = [],
    productos = []
  }) {
    this.id = id
    this.nombre = nombre
    this.descripcion = descripcion
    this.fechaInicio = fechaInicio
    this.fechaFinal = fechaFinal
    this.imagen = imagen
    this.activo = activo
    this.promociones = normalizarIds(promociones)
    this.productos = normalizarIds(productos)
  }

  async save () {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      const idEvento = this.id || await generarIdEvento(connection)

      await connection.execute(
        `INSERT INTO evento (ID_Evento, Nombre, Descripcion, Activo, Fecha_Inicio, Fecha_Final, Imagen)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          idEvento,
          this.nombre,
          this.descripcion,
          this.activo ? 1 : 0,
          this.fechaInicio,
          this.fechaFinal,
          this.imagen
        ]
      )

      await guardarRelaciones(connection, idEvento, this.promociones, this.productos)

      await connection.commit()

      return { id: idEvento }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static fetchAllPromociones () {
    return db.execute(`
      SELECT
        ID_Promocion AS id,
        Nombre AS nombre
      FROM promocion
      WHERE Activo = 1
      ORDER BY Nombre ASC
    `)
  }

  static fetchPromocionesActivasPorIds (idsPromociones = []) {
    const ids = normalizarIds(idsPromociones)

    if (ids.length === 0) {
      return Promise.resolve([[]])
    }

    const placeholders = ids.map(() => '?').join(', ')

    return db.execute(`
      SELECT
        ID_Promocion AS id
      FROM promocion
      WHERE Activo = 1
        AND ID_Promocion IN (${placeholders})
    `, ids)
  }

  static fetchAllProductos () {
    return db.execute(`
      SELECT
        ID_Producto AS id,
        Nombre AS nombre
      FROM producto
      ORDER BY Nombre ASC
    `)
  }

  static fetchAll () {
    return db.execute(`
      SELECT
        e.ID_Evento,
        e.Nombre,
        e.Descripcion,
        e.Activo,
        DATE_FORMAT(e.Fecha_Inicio, '%Y-%m-%d') AS Fecha_Inicio,
        DATE_FORMAT(e.Fecha_Final, '%Y-%m-%d') AS Fecha_Final,
        e.Imagen,
        COUNT(DISTINCT ecp.ID_Promocion) AS TotalPromociones,
        COUNT(DISTINCT ppe.ID_Producto) AS TotalProductos
      FROM evento e
      LEFT JOIN evento_contiene_promocion ecp
        ON ecp.ID_Evento = e.ID_Evento
      LEFT JOIN producto_pertenece_evento ppe
        ON ppe.ID_Evento = e.ID_Evento
      GROUP BY
        e.ID_Evento,
        e.Nombre,
        e.Descripcion,
        e.Activo,
        e.Fecha_Inicio,
        e.Fecha_Final,
        e.Imagen
      ORDER BY e.Activo DESC, e.Fecha_Inicio DESC, e.Nombre ASC
    `)
  }

  static fetchActiveForClient () {
    return db.execute(`
      SELECT
        e.ID_Evento,
        e.Nombre,
        e.Descripcion,
        e.Imagen,
        DATE_FORMAT(e.Fecha_Inicio, '%Y-%m-%d') AS Fecha_Inicio,
        DATE_FORMAT(e.Fecha_Final, '%Y-%m-%d') AS Fecha_Final,
        COUNT(DISTINCT ecp.ID_Promocion) AS TotalPromociones,
        COUNT(DISTINCT ppe.ID_Producto) AS TotalProductos,
        CASE
          WHEN CURDATE() BETWEEN e.Fecha_Inicio AND COALESCE(e.Fecha_Final, e.Fecha_Inicio) THEN 'live'
          ELSE 'soon'
        END AS estatus
      FROM evento e
      LEFT JOIN evento_contiene_promocion ecp
        ON ecp.ID_Evento = e.ID_Evento
      LEFT JOIN producto_pertenece_evento ppe
        ON ppe.ID_Evento = e.ID_Evento
      WHERE e.Activo = 1
        AND COALESCE(e.Fecha_Final, e.Fecha_Inicio) >= CURDATE()
      GROUP BY e.ID_Evento, e.Nombre, e.Descripcion, e.Imagen, e.Fecha_Inicio, e.Fecha_Final
      ORDER BY
        CASE
          WHEN CURDATE() BETWEEN e.Fecha_Inicio AND COALESCE(e.Fecha_Final, e.Fecha_Inicio) THEN 0
          ELSE 1
        END,
        e.Fecha_Inicio ASC,
        e.Nombre ASC
    `)
  }

  static async fetchById (idEvento) {
    const [[eventos], [promociones], [productos]] = await Promise.all([
      db.execute(`
        SELECT
          e.ID_Evento,
          e.Nombre,
          e.Descripcion,
          e.Activo,
          DATE_FORMAT(e.Fecha_Inicio, '%Y-%m-%d') AS Fecha_Inicio,
          DATE_FORMAT(e.Fecha_Final, '%Y-%m-%d') AS Fecha_Final,
          e.Imagen
        FROM evento e
        WHERE e.ID_Evento = ?
        LIMIT 1
      `, [idEvento]),
      db.execute(`
        SELECT
          p.ID_Promocion AS id,
          p.Nombre AS nombre
        FROM evento_contiene_promocion ecp
        INNER JOIN promocion p
          ON p.ID_Promocion = ecp.ID_Promocion
        WHERE ecp.ID_Evento = ?
        ORDER BY p.Nombre ASC
      `, [idEvento]),
      db.execute(`
        SELECT
          p.ID_Producto AS id,
          p.Nombre AS nombre
        FROM producto_pertenece_evento ppe
        INNER JOIN producto p
          ON p.ID_Producto = ppe.ID_Producto
        WHERE ppe.ID_Evento = ?
        ORDER BY p.Nombre ASC
      `, [idEvento])
    ])

    if (eventos.length === 0) {
      return null
    }

    return {
      ...eventos[0],
      promociones,
      productos
    }
  }

  static async updateEvento (idEvento, datosEvento) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      await connection.execute(
        `UPDATE evento
         SET Nombre = ?, Descripcion = ?, Activo = ?, Fecha_Inicio = ?, Fecha_Final = ?, Imagen = ?
         WHERE ID_Evento = ?`,
        [
          datosEvento.nombre,
          datosEvento.descripcion,
          datosEvento.activo ? 1 : 0,
          datosEvento.fechaInicio,
          datosEvento.fechaFinal,
          datosEvento.imagen || null,
          idEvento
        ]
      )

      await connection.execute(
        'DELETE FROM evento_contiene_promocion WHERE ID_Evento = ?',
        [idEvento]
      )
      await connection.execute(
        'DELETE FROM producto_pertenece_evento WHERE ID_Evento = ?',
        [idEvento]
      )

      await guardarRelaciones(
        connection,
        idEvento,
        datosEvento.promociones,
        datosEvento.productos
      )

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static desactivarEvento (idEvento) {
    return db.execute(
      'UPDATE evento SET Activo = 0 WHERE ID_Evento = ?',
      [idEvento]
    )
  }

  static activarEvento (idEvento) {
    return db.execute(
      'UPDATE evento SET Activo = 1 WHERE ID_Evento = ?',
      [idEvento]
    )
  }

  static deleteEvento (idEvento) {
    return db.execute(
      'DELETE FROM evento WHERE ID_Evento = ?',
      [idEvento]
    )
  }
}
