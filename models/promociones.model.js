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
    return db.execute('SELECT * FROM promocion')
  }

  static fetchCategorías () {
    return db.execute('SELECT DISTINCT Categoría FROM producto')
  }

  static fetchTipo () {
    return db.execute('SELECT DISTINCT Tipo FROM producto')
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

  static guardarProductosPromocion (idPromocion, idsProductos) {
    const valores = idsProductos.map(idProducto => [idProducto, idPromocion])
    return db.query(
      'INSERT INTO producto_tiene_promocion (ID_Producto, ID_Promocion) VALUES ?',
      [valores]
    )
  }
}
