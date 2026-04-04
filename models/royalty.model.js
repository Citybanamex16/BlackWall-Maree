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

  static async deleteRoyaltyBD (nombre) {
    return db.execute('DELETE FROM estado_royalty_da_promociones WHERE Nombre_Royalty = ?', [nombre])
      .then(() => {
        return db.execute('DELETE FROM estado_royalty WHERE Nombre_Royalty = ?', [nombre])
      })
  }

  // Cliente
  static fetchClientStatus (telefono) {
    return db.execute(`
            SELECT 
                Nombre, 
                Numero_Telefonico AS telefono, 
                Nombre_Royalty AS nivel, 
                Visitas_Actuales AS visitas
            FROM cliente 
            WHERE Numero_Telefonico = ?
        `, [telefono])
  }

  static fetchPromotions (nivel) {
    return db.execute(`
            SELECT P.Nombre, P.Descuento, P.Fecha_inicio, P.Fecha_final, E.Nombre_Royalty
            FROM estado_royalty E JOIN estado_royalty_da_promociones EP ON E.Nombre_Royalty = EP.Nombre_Royalty 
            JOIN promocion P ON P.ID_Promocion = EP.ID_Promocion 
            WHERE E.Número_de_prioridad <= (
            SELECT Número_de_prioridad FROM estado_royalty WHERE Nombre_Royalty = ?)
            ORDER BY E.Número_de_prioridad DESC 
        `, [nivel])
  }

  static fetchEvents (nivel) {
    return db.execute(`
        SELECT E.Nombre AS Nombre_Evento, E.Fecha_Inicio AS Fecha, E.Descripcion, ER.Nombre_Royalty
        FROM evento E
        INNER JOIN estado_royalty_da_eventos RE ON e.ID_Evento = RE.ID_Evento
        INNER JOIN estado_royalty ER ON ER.Nombre_Royalty = RE.Nombre_Royalty
        WHERE ER.Número_de_prioridad <= (
        SELECT Número_de_prioridad FROM estado_royalty WHERE Nombre_Royalty = ?)
        ORDER BY ER.Número_de_prioridad DESC 
        `, [nivel])
  }
}
