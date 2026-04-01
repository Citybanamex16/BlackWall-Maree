// const reusify = require('reusify')
const db = require('../util/database.js')

module.exports = class Evento {
  constructor (nombre, descripcion, fechaInicio, fechaFinal, promociones, productos) {
    this.nombre = nombre
    this.descripcion = descripcion
    this.fechaInicio = fechaInicio
    this.fechaFinal = fechaFinal
    this.promociones = promociones
    this.platillos = productos
  }

  async save () {
    let idGenerado
    let existe = true

    while (existe) {
      const num = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
      idGenerado = 'EV' + num

      // Consultamos si el ID ya existe en la BD
      const [filas] = await db.execute('SELECT ID_Evento FROM evento WHERE ID_Evento = ?', [idGenerado])

      if (filas.length === 0) {
        existe = false
      }
    }

    try {
      const [result] = await db.execute(
        'INSERT INTO evento (ID_Evento, Nombre, Descripcion, Fecha_Inicio, Fecha_Final) VALUES (?, ?, ?, ?, ?)',
        [idGenerado, this.nombre, this.descripcion, this.fechaInicio, this.fechaFinal]
      )

      const promesas = []
      if (this.promociones && this.promociones.length > 0) {
        const values = this.promociones.map(id => [idGenerado, id])
        promesas.push(db.query('INSERT INTO evento_contiene_promocion (ID_Evento, ID_Promocion) VALUES ?', [values]))
      }

      if (this.platillos && this.platillos.length > 0) {
        const values = this.platillos.map(id => [idGenerado, id])
        promesas.push(db.query('INSERT INTO producto_pertenece_evento (ID_Evento, ID_Producto) VALUES ?', [values]))
      }

      await Promise.all(promesas)
      return { id: idGenerado, result }
    } catch (error) {
      console.error('Error en el guardado final:', error)
      throw error
    }
  }

  static fetchAllPromociones () {
    return db.execute('SELECT ID_Promocion as id, Nombre as nombre FROM promocion')
  }

  static fetchAllProductos () {
    return db.execute('SELECT ID_Producto as id, Nombre as nombre FROM producto')
  }

  static fetchAll () {
    return db.execute('SELECT * FROM evento')
  }
}
