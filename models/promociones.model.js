const db = require('../util/database.js')

module.exports = class Promocion {
  constructor (promo) {
    this.id = promo.id
    this.nombre = promo.nombre
    this.descuento = promo.descuento
    this.condicion = promo.condicion
  }

  static fetchAll () {
    return db.execute('SELECT * FROM promociones')
  }
}
