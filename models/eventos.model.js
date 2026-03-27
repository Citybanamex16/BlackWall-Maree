// const reusify = require('reusify')
const db = require('../util/database.js')

module.exports = class Producto {
  constructor (nuevoEvento) {
    this.nombre = nuevoEvento.nombre
    this.descripcion = nuevoEvento.descripcion
    this.fecha_inicio = nuevoEvento.fechaInicio
    this.fecha_Fin = nuevoEvento.fechaFin
    this.promociones = nuevoEvento.promociones
    this.royalty = nuevoEvento.royalty
    this.platillos = nuevoEvento.platillos
  }

  save () {
    // Insertar evento
    return db.execute('INSERT INTO evento (nombre, descripcion, fecha_inicio, fecha_Fin) VALUES (?, ?, ?, ?)').then(([result]) => {
      // const idEvento = result.insertId

      // Insertar relaciones con promociones
      if (this.promociones.length > 0) {
        // const values = this.promociones.map(id => [idEvento, id])
        return db.execute('') // Query
      }

      // Insertar relaciones con estatus royalty
      if (this.royalty.length > 0) {
        // const values = this.royalty.map(id => [idEvento, id])
        return db.execute('') // Query
      }

      // Insertar relaciones con platillos
      if (this.platillos.length > 0) {
        // const values = this.platillos.map(id => [idEvento, id])
        return db.execute('') // Query
      }
      return result
    }).catch((error) => {
      console.log(error)
      throw error
    })
  }

  static fetchAllPromociones () {
    return db.execute('SELECT Id_Promo, Nombre FROM promociones')
  }

  static fetchAllRoyalties () {
    return db.execute('SELECT Nombre FROM status_royalty')
  }

  static fetchAllProductos () {
    return db.execute('SELECT Id_Producto, nombre_producto FROM producto')
  }

  static fetchAll () {
    return db.execute('SELECT * FROM evento')
  }
}
