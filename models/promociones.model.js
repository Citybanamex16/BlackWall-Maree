const db = require('../util/database')
module.exports = class Promociones {
  constructor (miId, miNombre, miDescuento, miCondicion, miActivo,
    miFechaInicio, miFechaFinal, miNombreProducto) {
    this.id = miId
    this.nombre = miNombre
    this.descuento = miDescuento
    this.condicion = miCondicion
    this.activo = miActivo
    this.fechaInicio = miFechaInicio
    this.fechaFinal = miFechaFinal
    this.nombreProducto = miNombreProducto
  }

  save () {
    console.log('Intento de subir a la base de datos')
    return db.execute('INSERT INTO Promocion (ID_promocion, Nombre, Descuento, ' +
        'Condiciones, Activo, Fecha_inicio, Fecha_final) VALUES (?,?,?,?,?,?,?)',
    [this.id, this.nombre, this.descuento, this.condicion, this.activo, this.fechaInicio, this.fechaFinal]
    )
  }

  static fetchAll () {
    return db.execute('SELECT * FROM Promociones')
  }

  static obtenerId () {
    return db.execute('SELECT ID_Promocion FROM promocion')
  }

  static fetchCategorías () {
    return db.execute('SELECT DISTINCT Categoría FROM producto')
  }

  static fetchTipo () {
    return db.execute('SELECT DISTINCT Tipo FROM producto')
  }

  nuevaPromocion () {
    return db.execute('INSERT INTO Promocion (nombre, descuento, condiciones) VALUES (?,?,?)')
  }

  // Guardamos promocion en base al producto
  static guardarProductosPromocion (idPromocion, idsProductos) {
    const valores = idsProductos.map(idProducto => [idProducto, idPromocion])
    return db.query(
      'INSERT INTO producto_tiene_promocion (ID_Producto, ID_Promocion) VALUES ?',
      [valores]
    )
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

    return db.execute(query, params)
  }
}
