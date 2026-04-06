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

  static async updateEstadoRoyalty (nombreOriginal, nombreNuevo, prioridad, descripcion, minVisitas, maxVisitas) {
  // Desactivar llaves foraneas
    await db.execute('SET FOREIGN_KEY_CHECKS = 0')

    // Actualizar hijos
    await db.execute(
      'UPDATE cliente SET Nombre_Royalty = ? WHERE Nombre_Royalty = ?',
      [nombreNuevo, nombreOriginal]
    )
    await db.execute(
      'UPDATE estado_royalty_da_promociones SET Nombre_Royalty = ? WHERE Nombre_Royalty = ?',
      [nombreNuevo, nombreOriginal]
    )
    // Actualizar la tabla de estdo royalty
    await db.execute(
    `UPDATE estado_royalty
     SET Nombre_Royalty = ?, Número_de_prioridad = ?, Descripción = ?, Min_Visitas = ?, Max_Visitas = ?
     WHERE Nombre_Royalty = ?`,
    [nombreNuevo, prioridad, descripcion, minVisitas, maxVisitas, nombreOriginal]
    )

    // Reactiva llaves foráneas
    await db.execute('SET FOREIGN_KEY_CHECKS = 1')
  }

  // Cliente
  static async fetchClientStatus (telefono) {
    const [rows] = await db.execute('CALL sp_EstadoCliente(?)', [telefono])

    return [rows[0]]
  }

  static async fetchPromotions (nivel) {
    return db.execute('CALL sp_fetchPromociones(?)', [nivel])
      .then(resultado => {
        const rows = resultado[0]

        return [rows[0]]
      })
  }

  static fetchEvents (nivel) {
    return db.execute('CALL sp_fetchEventos(?)', [nivel])
      .then(resultado => {
        const rows = resultado[0]

        return [rows[0]]
      })
  }
}
