const db = require('../util/database')
module.exports = class Promociones {
  constructor (miNombre, miDescuento, miCondicion) {
    this.nombre = miNombre
    this.descuento = miDescuento
    this.condicion = miCondicion
  }

  save () {
    return db.execute('INSERT INTO promociones (nombre, descuento, condiciones) VALUES (?,?,?)',
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
