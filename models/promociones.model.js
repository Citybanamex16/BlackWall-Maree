const db = require('../util/database')
module.exports = class Promociones {
  constructor (miId, miNombre, miDescuento, miCondicion, miActivo, miFechaInicio, miFechaFinal) {
    this.id = miId
    this.nombre = miNombre
    this.descuento = miDescuento
    this.condicion = miCondicion
    this.activo = miActivo
    this.fechaInicio = miFechaInicio
    this.fechaFinal = miFechaFinal
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

  static obtenerProductos () {
    return db.execute('SELECT Nombre FROM producto')
  }

  nuevaPromocion () {
    return db.execute('INSERT INTO Promocion (nombre, descuento, condiciones) VALUES (?,?,?)')
  }
}
