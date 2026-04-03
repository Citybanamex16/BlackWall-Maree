const db = require('../util/database.js')

module.exports = class Royalty {
  constructor (nombre, numeroPrioridad, descripcion, maxVisitas, minVisitas) {
    this.Nombre_Royalty = nombre
    this.Número_de_prioridad = numeroPrioridad
    this.Descripción = descripcion
    this.Max_Visitas = maxVisitas
    this.Min_Visitas = minVisitas
  }

  // Admin
  static fetchAll () {
    return db.execute('SELECT * FROM estado_royalty ORDER BY Número_de_prioridad ASC')
  }

  // Cliente
}
