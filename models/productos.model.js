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

  static async getAllcategorys(){
    return db.execute("SELECT name FROM Categorías")
  }

  static async insertNewProduct () {
    return db.execute('INSERT INTO PRODUCTOS VALUES ()')
  }
}
