const db = require('../util/database.js')

module.exports = class Evento {
  constructor (nombre, descripcion, fechaInicio, fechaFinal, promociones, productos) {
    this.nombre = nombre
    this.descripcion = descripcion
    this.fechaInicio = fechaInicio
    this.fechaFinal = fechaFinal
    this.promociones = promociones
    this.productos = productos
  }

  static generarID () {
    const numero = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
    return `EV${numero}`
  }

  static normalizarActivoPorFecha (fechaFinal, activoActual = 1) {
    const activoBase = Number(activoActual) === 1 ? 1 : 0

    if (!activoBase) {
      return 0
    }

    const hoy = new Date().toISOString().slice(0, 10)

    if (fechaFinal && fechaFinal < hoy) {
      return 0
    }

    return 1
  }

  static async existeID (idEvento) {
    const [filas] = await db.execute(
      'SELECT ID_Evento FROM evento WHERE ID_Evento = ? LIMIT 1',
      [idEvento]
    )

    return filas.length > 0
  }

  async save () {
    let idGenerado = Evento.generarID()

    while (await Evento.existeID(idGenerado)) {
      idGenerado = Evento.generarID()
    }

    const connection = await db.getConnection()
    const activo = Evento.normalizarActivoPorFecha(this.fechaFinal, 1)

    try {
      await connection.beginTransaction()

      const [result] = await connection.execute(
        'INSERT INTO evento (ID_Evento, Nombre, Descripcion, Activo, Fecha_Inicio, Fecha_Final) VALUES (?, ?, ?, ?, ?, ?)',
        [idGenerado, this.nombre, this.descripcion, activo, this.fechaInicio, this.fechaFinal]
      )

      if (this.promociones.length > 0) {
        const valuesPromociones = this.promociones.map(idPromocion => [idGenerado, idPromocion])
        await connection.query(
          'INSERT INTO evento_contiene_promocion (ID_Evento, ID_Promocion) VALUES ?',
          [valuesPromociones]
        )
      }

      if (this.productos.length > 0) {
        const valuesProductos = this.productos.map(idProducto => [idGenerado, idProducto])
        await connection.query(
          'INSERT INTO producto_pertenece_evento (ID_Evento, ID_Producto) VALUES ?',
          [valuesProductos]
        )
      }

      await connection.commit()
      return { id: idGenerado, activo, result }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static fetchAllPromociones () {
    return db.execute('SELECT ID_Promocion as id, Nombre as nombre FROM promocion ORDER BY Nombre ASC')
  }

  static fetchAllProductos () {
    return db.execute('SELECT ID_Producto as id, Nombre as nombre FROM producto ORDER BY Nombre ASC')
  }

  static fetchAll () {
    return db.execute('SELECT * FROM evento ORDER BY Fecha_Inicio DESC, Nombre ASC')
  }

  static fetchById (idEvento) {
    return db.execute(
      `SELECT ID_Evento, Nombre, Descripcion, Activo, Fecha_Inicio, Fecha_Final
       FROM evento
       WHERE ID_Evento = ?
       LIMIT 1`,
      [idEvento]
    )
  }

  static fetchPromocionIdsByEvento (idEvento) {
    return db.execute(
      'SELECT ID_Promocion FROM evento_contiene_promocion WHERE ID_Evento = ? ORDER BY ID_Promocion ASC',
      [idEvento]
    )
  }

  static fetchProductoIdsByEvento (idEvento) {
    return db.execute(
      'SELECT ID_Producto FROM producto_pertenece_evento WHERE ID_Evento = ? ORDER BY ID_Producto ASC',
      [idEvento]
    )
  }

  static updateStatusById (idEvento, activo) {
    const nuevoEstado = activo ? 1 : 0

    return db.execute(
      'UPDATE evento SET Activo = ? WHERE ID_Evento = ? AND Activo <> ?',
      [nuevoEstado, idEvento, nuevoEstado]
    )
  }

  static async updateById (idEvento, data) {
    const connection = await db.getConnection()
    const activoActualizado = Evento.normalizarActivoPorFecha(data.fechaFinal, data.activoActual)

    try {
      await connection.beginTransaction()

      const [result] = await connection.execute(
        `UPDATE evento
         SET Nombre = ?, Descripcion = ?, Activo = ?, Fecha_Inicio = ?, Fecha_Final = ?
         WHERE ID_Evento = ?`,
        [
          data.nombre,
          data.descripcion,
          activoActualizado,
          data.fechaInicio,
          data.fechaFinal,
          idEvento
        ]
      )

      if (!result || result.affectedRows === 0) {
        throw new Error('EVENTO_NO_ENCONTRADO')
      }

      await connection.execute(
        'DELETE FROM evento_contiene_promocion WHERE ID_Evento = ?',
        [idEvento]
      )

      await connection.execute(
        'DELETE FROM producto_pertenece_evento WHERE ID_Evento = ?',
        [idEvento]
      )

      if (data.promociones.length > 0) {
        const valuesPromociones = data.promociones.map(idPromocion => [idEvento, idPromocion])
        await connection.query(
          'INSERT INTO evento_contiene_promocion (ID_Evento, ID_Promocion) VALUES ?',
          [valuesPromociones]
        )
      }

      if (data.productos.length > 0) {
        const valuesProductos = data.productos.map(idProducto => [idEvento, idProducto])
        await connection.query(
          'INSERT INTO producto_pertenece_evento (ID_Evento, ID_Producto) VALUES ?',
          [valuesProductos]
        )
      }

      await connection.commit()

      return {
        affectedRows: result.affectedRows,
        activo: activoActualizado
      }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  static eliminarById (idEvento) {
    return db.execute(
      'DELETE FROM evento WHERE ID_Evento = ?',
      [idEvento]
    )
  }
}
