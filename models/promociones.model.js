const db = require('../util/database')
module.exports = class Promociones {
  constructor (miId, miNombre, miDescuento, miCondicion, miActivo, miFechaInicio, miFechaFinal) {
    this.id = miId
    this.nombre = miNombre
    this.descuento = miDescuento
    this.condicion = miCondicion
    this.Activo = miActivo
    this.fechaInicio = miFechaInicio
    this.fechaFinal = miFechaFinal
  }

  save () {
    console.log('Se ha logrado subir a la base de datos')
    return db.execute('INSERT INTO promociones (ID_promocion, Nombre, Descuento, ' +
        'Condiciones, Activo, FechaInicio, FechaFinal), VALUES (?,?,?,?,?,?,?)',
    [this.nombre, this.descuento, this.condicion]
    )
  }

  static fetchAll () {
    return db.execute('SELECT * FROM Promociones')
  }

  nuevaPromocion () {
    return db.execute('INSERT INTO Promocion (nombre, descuento, condiciones) VALUES (?,?,?)')
  }
}
