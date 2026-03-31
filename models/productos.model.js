const db = require('../util/database.js')

module.exports = class Producto {
  static async fetchOne (id) {
    return db.execute('') // AQUI VA EL QUERY
  }

  // funcion para los tipos de productos existentes
  static async getAllcategorys () {
    return db.execute('SELECT Nombre FROM categoría') // Query que regresa TODOS los tipos de productos
  }

  // Función para obtener los campos de la Tabla Productos
  static async getProductFields (producto) {
    return db.execute('SHOW COLUMNS FROM producto')
  }

  // Función para obtener los ingredientes pertenecientes a un tipo
  static async getAllIngredientes (categoria) {
    return db.execute('SELECT ID_Insumo ,Nombre, Precio FROM insumo WHERE Categoría = ?', [categoria])
  }

  static generarID (prefijo = 'PD') {
  // 10 dígitos aleatorios → colisión prácticamente imposible (1 en 10,000,000,000)
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `${prefijo}${numero}` // "PD1823049231" — 12 chars, bien dentro del varchar(10)...
  }

 static async insertNewProduct (id, nombre, categoria, Precio, Disponible, Imagen) {
    // Al usar await, recibes el resultado de la promesa
    const [result] = await db.execute(
      'INSERT INTO producto VALUES (?,?,?,?,?,?,?,?)',
      [id, 'Básico', categoria, nombre, Precio, Disponible, 'Dulce', Imagen]
    );
    return result; // Este objeto contiene affectedRows e insertId
}


 

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
