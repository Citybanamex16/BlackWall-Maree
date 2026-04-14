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
  // Obtnemos los datos de los estados royalty
  static fetchAll () {
    return db.execute('SELECT * FROM estado_royalty ORDER BY Número_de_prioridad ASC')
  }

  static fetchTodasPromociones () {
    return db.execute('SELECT ID_promocion, Nombre FROM promocion')
  }

  static fetchTodosEventos () {
    return db.execute('SELECT ID_Evento, Nombre FROM evento')
  }

  // Buscamos a lo que vamos a borrar
  static async deleteRoyaltyBD (nombre) {
    return db.execute('DELETE FROM estado_royalty_da_promociones WHERE Nombre_Royalty = ?', [nombre])
      .then(() => {
        return db.execute('DELETE FROM estado_royalty WHERE Nombre_Royalty = ?', [nombre])
      })
  }

  // Actualizaión de estado royalty
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
    // Actualizar la tabla de estado royalty
    await db.execute(
    `UPDATE estado_royalty
     SET Nombre_Royalty = ?, Número_de_prioridad = ?, Descripción = ?, Min_Visitas = ?, Max_Visitas = ?
     WHERE Nombre_Royalty = ?`,
    [nombreNuevo, prioridad, descripcion, minVisitas, maxVisitas, nombreOriginal]
    )

    // Reactiva llaves foráneas
    await db.execute('SET FOREIGN_KEY_CHECKS = 1')
  }

  static async updatePromocionesRoyalty (nombreRoyalty, idsPromociones) {
  // Borramos las relaciones anteriores
    await db.execute(
      'DELETE FROM estado_royalty_da_promociones WHERE Nombre_Royalty = ?',
      [nombreRoyalty]
    )
    // Si hay nuevas promociones, las insertamos
    if (idsPromociones && idsPromociones.length > 0) {
      const valores = idsPromociones.map(id => [nombreRoyalty, id])
      await db.query(
        'INSERT INTO estado_royalty_da_promociones (Nombre_Royalty, ID_Promocion) VALUES ?',
        [valores]
      )
    }
  }

  static async updateEventosRoyalty (nombreRoyalty, idsEventos) {
    await db.execute(
      'DELETE FROM estado_royalty_da_eventos WHERE Nombre_Royalty = ?',
      [nombreRoyalty]
    )
    // Si hay nuevas promociones, las insertamos
    if (idsEventos && idsEventos.length > 0) {
      const valores = idsEventos.map(id => [nombreRoyalty, id])
      await db.query(
        'INSERT INTO estado_royalty_da_eventos (Nombre_Royalty, ID_Evento) VALUES ?',
        [valores]
      )
    }
  }

  // Obtenemos las promociones de cada royalty
  static async fetchPromociones_royalties (nombre) {
    return db.execute(
    `SELECT p.ID_promocion, p.Nombre FROM promocion p 
     INNER JOIN estado_royalty_da_promociones erp ON p.ID_promocion = erp.ID_Promocion 
     WHERE erp.Nombre_Royalty = ?`,
    [nombre]
    )
  }

  static async fetchEventos_royalty (nombre) {
    return db.execute(
      `SELECT e.ID_Evento, e.Nombre FROM evento e
      INNER JOIN estado_royalty_da_eventos erde ON erde.ID_Evento = e.ID_Evento
      WHERE erde.Nombre_Royalty = ?`, [nombre]
    )
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
