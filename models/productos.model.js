const db = require('../util/database.js')

module.exports = class Producto {
  static async fetchOne (id) {
    return db.execute('') // AQUI VA EL QUERY
  }

  //funcion para los tipos de productos existentes
  static async getProductTypes(){
    return db.execute('') //Query que regresa TODOS los tipos de productos
  }
}


