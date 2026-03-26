const db = require('../util/database.js')

module.exports = class Producto {
  static async fetchOne (id) {
    return db.execute('') // AQUI VA EL QUERY
  }

  // funcion para los tipos de productos existentes
  static async getAllProductTypes () {
    return db.execute('SELECT Categoría FROM categoría') // Query que regresa TODOS los tipos de productos
  }

  // Función para obtener los campos de la Tabla Productos
  static async getProductFields (producto) {
    return db.execute('SHOW COLUMNS FROM producto')
  }

  // Función para obtener los ingredientes pertenecientes a un tipo
  static async getAllIngredientes (categoria) {
    return db.execute('SELECT Nombre, Precio FROM insumo WHERE Categoría = ?', [categoria])
  }

  static async getAllcategorys () {
    return db.execute('SELECT name FROM Categoría')
  }

  static generarID (prefijo = 'PD') {
  // 10 dígitos aleatorios → colisión prácticamente imposible (1 en 10,000,000,000)
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `${prefijo}${numero}` // "PD1823049231" — 12 chars, bien dentro del varchar(10)...
  }

  static async insertNewProduct (id, nombre, categoria, Precio, Disponible, Imagen) {
    return db.execute('INSERT INTO producto VALUES (?,?,?,?,?,?,?,?)'
      , [id, 'basico', categoria, nombre, Precio, Disponible, 'Dulce', Imagen])
  }

  /*
  1 ID_Producto  Primaria varchar(10) utf8mb4_general_ci    No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  2 Tamaño  PrimariaÍndice  varchar(100)  utf8mb4_general_ci    No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  3 Categoría  PrimariaÍndice varchar(100)  utf8mb4_general_ci    No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  4 Nombre  varchar(50) utf8mb4_general_ci    No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  5 Precio  float     No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  6 Disponible  varchar(100)  utf8mb4_general_ci    No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  7 Tipo  varchar(100)  utf8mb4_general_ci    No  Ninguna      Cambiar Cambiar   Eliminar Eliminar
  8 Imagen
  */

  static ValidarDatosRegistro (data) {
    const mensajesError = [] // Lista para acumular errores

    for (const field of data) {
    // 1. Validar vacío (null, undefined, string vacío)
      if (field.value === null || field.value === undefined || field.value === '') {
        mensajesError.push(`Campo vacío: ${field.key}`)
        console.warn(`Campo vacío: ${field.key}`)
      } else if (field.key === 'Precio') { // Precio no negativo
        const precio = parseFloat(field.value)
        if (isNaN(precio) || precio < 0) {
          mensajesError.push(`Precio inválido: ${field.value}`)
          console.warn(`Precio inválido: ${field.key}`)
        }
      }
    }

    // Si hay mensajes, regresamos falso ;(
    if (mensajesError.length > 0) {
      return {
        valido: false,
        mensaje: mensajesError.join(', ')
      }
    }

    return { valido: true, mensaje: '' }
  }
}
