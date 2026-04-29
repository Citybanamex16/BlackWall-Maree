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

  // Obtenemos las promociones
  static fetchTodasPromociones () {
    return db.execute('SELECT ID_promocion, Nombre FROM promocion')
  }

  // Obtenemos los eventos
  static fetchTodosEventos () {
    return db.execute('SELECT ID_Evento, Nombre FROM evento')
  }

  save () {
    return db.execute(
      'INSERT INTO estado_royalty (Nombre_Royalty, Número_de_prioridad, Descripción, Min_Visitas, Max_Visitas) VALUES (?,?,?,?,?)',
      [this.Nombre_Royalty, this.Número_de_prioridad, this.Descripción, this.Min_Visitas, this.Max_Visitas]
    )
  }

  // We used stored procedures to save promotions for each royalty
  static guardarEstadoRoyaltyPromociones (NombreRoyalty, idsPromocion) {
    const promesas = idsPromocion.map(idPromocion =>
      db.execute('CALL sp_GuardarRoyaltyPromocion(?, ?)', [NombreRoyalty, idPromocion])
    )
    return Promise.all(promesas)
  }

  static guardarEstadoRoyaltyEventos (NombreRoyalty, idsEventos) {
    const valores = idsEventos.map(idEvento => [NombreRoyalty, idEvento])
    return db.query(
      'INSERT INTO estado_royalty_da_eventos (Nombre_Royalty, ID_Evento) VALUES ?',
      [valores]
    )
  }

  // Buscamos a lo que vamos a borrar
  static async deleteRoyaltyBD (nombre) {
    await db.execute('DELETE FROM estado_royalty_da_promociones WHERE Nombre_Royalty = ?', [nombre])
    await db.execute('DELETE FROM estado_royalty_da_eventos WHERE Nombre_Royalty = ?', [nombre])
    return db.execute('DELETE FROM estado_royalty WHERE Nombre_Royalty = ?', [nombre])
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

  // Registro de visitas
  static async fetchClienteParaEscaneo (telefono) {
    return db.execute(`
        SELECT Numero_Telefonico, Nombre, Visitas_Actuales, tokens_gastados, Nombre_Royalty
        FROM cliente
        WHERE Numero_Telefonico = ?`, [telefono])
  }

  static async registrarVisita (telefono) {
    return db.execute(`
        UPDATE cliente
        SET Visitas_Actuales = Visitas_Actuales + 1
        WHERE Numero_Telefonico = ?`, [telefono])
  }

  static async registrarCanje (telefono, Royalty) {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      await connection.execute(
        'UPDATE cliente SET tokens_gastados = tokens_gastados + 1 WHERE Numero_Telefonico = ?',
        [telefono]
      )

      await connection.execute(
        'INSERT INTO historial_canjes_royalty (Numero_Telefonico, Nombre_Royalty) VALUES (?, ?)',
        [telefono, Royalty]
      )

      await connection.commit()
      return { success: true }
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // Cliente
  static async fetchClientStatus (telefono) {
    const [rows] = await db.execute('CALL sp_EstadoCliente(?)', [telefono])

    return [rows[0]]
  }

  static async fetchClienteStatusGoogle (telefono) {
    return db.execute(`
    SELECT 
      c.Numero_Telefonico,
      c.Nombre,
      c.Visitas_Actuales,
      c.Nombre_Royalty AS nivel,
      e.Max_Visitas,
      e.Min_Visitas
    FROM cliente c
    LEFT JOIN estado_royalty e ON c.Nombre_Royalty = e.Nombre_Royalty
    WHERE c.Numero_Telefonico = ?
  `, [telefono])
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

  // Métricas para el cliente
  static async fetchTopPlatillos (categoria) {
    return db.execute('CALL sp_fetchTopGlobal(?)', [categoria])
  }

  static async fetchFavoritosCliente (telefono, categoria) {
    return db.execute('CALL sp_fetchFavCliente(?, ?)', [telefono, categoria])
  }
}
