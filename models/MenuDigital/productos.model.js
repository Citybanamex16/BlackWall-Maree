const db = require('../../util/database.js')

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

  static async getValidProductData () {
    // 1. ejecutamos Consulta
    const [rows] = await db.execute(`SELECT 
    P.ID_Producto AS productoID,
    P.nombre AS productoNombre, 
    P.precio AS productoPrecio, 
    P.categoría AS productoCategoria, 
    P.imagen AS productoImagen, 
    I.ID_Insumo AS insumoID,
    I.nombre AS insumoNombre
    FROM producto AS P
    INNER JOIN producto_tiene_insumo AS PI ON P.ID_Producto = PI.ID_Producto
    INNER JOIN insumo AS I ON PI.ID_Insumo = I.ID_Insumo
    WHERE P.Disponible = 1;`)

    // console.log('Rows: ', rows)

    // 2. Agrupamos utilizando Mapping
    const productosMap = {}

    rows.forEach(fila => {
      // 3. Si el producto no existe en nuestro diccionario, lo creamos
      if (!productosMap[fila.productoID]) {
        productosMap[fila.productoID] = {
          id: fila.productoID,
          nombre: fila.productoNombre,
          precio: fila.productoPrecio,
          categoria: fila.productoCategoria,
          imagen: fila.productoImagen,
          ingredientes: [] // Inicializamos el array de ingredientes
        }
      }

      // 4. Agregamos el ingrediente de esta fila al producto correspondiente
      if (fila.insumoID) {
        productosMap[fila.productoID].ingredientes.push({
          id: fila.insumoID,
          nombre: fila.insumoNombre
        })
      }
    })

    // 5. convertimos de diccionario a Array
    return Object.values(productosMap)
  }
}
