const db = require('../util/database.js')

module.exports = class Promocion {
  constructor (promo) {
    this.id_promocion = promo.id_promocion
    this.nombre = promo.nombre
    this.descuento = promo.descuento
    this.condiciones = promo.condiciones
    this.activo = promo.activo
    this.fecha_inicio = promo.fecha_inicio
    this.fecha_final = promo.fecha_final
  }

  static fetchAll () {
    return db.execute('SELECT * FROM promocion')
  }
}
