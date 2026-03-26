const db = require('../util/database.js')

module.exports = class Producto {
  static async fetchOne (id) {
    return db.execute('') // AQUI VA EL QUERY
  }

  // funcion para los tipos de productos existentes
  static async getProductTypes () {
    return db.execute('SELECT * FROM ?', ['Tipos']) // Query que regresa TODOS los tipos de productos
  }

  // Función para obtener los campos de la Tabla Productos
  static async getProductFields (producto) {
    return db.execute('SHOW COLUMNS FROM ?', ['producto'])
  }

  // Función para obtener los ingredientes pertenecientes a un tipo
  static async getAllIngredientes () {
    return db.execute('SELECT name FROM ?', ['insumos'])
  }

  static async getAllcategorys () {
    return db.execute('SELECT name FROM Categorías')
  }

  static async insertNewProduct () {
    return db.execute('INSERT INTO PRODUCTOS VALUES ()')
  }

  static ValidarDatosRegistro (data){
    let mensaje_error = ''

    for (const field of data) {
    // 1. Nada puede ser null, undefined, ni string vacío
    if (field.value === null || field.value === undefined || field.value === '') {
      mensaje_error += `Campo vacío: ${field.key}, `
      console.warn(`Campo vacío: ${field.key}`)
      return false
      }
      
    // 2. Precio no puede ser negativo
    if (field.key === 'Precio') {
      const precio = parseFloat(field.value)
      if (isNaN(precio) || precio < 0) {
        console.warn(`Precio inválido: ${field.value}`)
        return false
      }
    }
  }

  return true 

  }
}
