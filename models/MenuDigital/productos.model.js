const db = require('../../util/database.js')

module.exports = class Producto {
  // Obtiene todos los productos y sus ingredientes correspondientes disponibles y no disponibles
  static async getAllProductsInfo () {
    // 1. ejecutamos Consulta
    const [rows] = await db.execute(`SELECT 
    P.ID_Producto AS productoID,
    P.nombre AS productoNombre, 
    P.precio AS productoPrecio, 
    P.categoría AS productoCategoria,
    P.Tipo AS productoType, 
    P.imagen AS productoImagen,
    P.Disponible AS productoActivo, 
    I.ID_Insumo AS insumoID,
    I.nombre AS insumoNombre,
    I.Precio AS precio
    FROM producto AS P
    INNER JOIN producto_tiene_insumo AS PI ON P.ID_Producto = PI.ID_Producto
    INNER JOIN insumo AS I ON PI.ID_Insumo = I.ID_Insumo
    ;`)

    console.log('Rows: ', rows)

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
          tipo: fila.productoType,
          activo: fila.productoActivo,
          imagen: fila.productoImagen,
          ingredientes: [] // Inicializamos el array de ingredientes
        }
      }

      // 4. Agregamos el ingrediente de esta fila al producto correspondiente
      if (fila.insumoID) {
        productosMap[fila.productoID].ingredientes.push({
          id: fila.insumoID,
          nombre: fila.insumoNombre,
          precio: fila.precio
        })
      }
    })

    // 5. convertimos de diccionario a Array
    return Object.values(productosMap)
  }

  static async getValidProductData () {
    // 1. ejecutamos Consulta
    const [rows] = await db.execute(`SELECT 
    P.ID_Producto AS productoID,
    P.nombre AS productoNombre, 
    P.precio AS productoPrecio, 
    P.categoría AS productoCategoria, 
    P.Tipo  AS productoTipo,
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
          tipo: fila.productoTipo,
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

  // Función para obtener los campos de la Tabla Productos
  static async getProductFields (producto) {
    return db.execute('SHOW COLUMNS FROM producto')
  }

  // Función para obtener los ingredientes pertenecientes a una Categoría
  static async getCategoryIngredientes (categoria) {
    return db.execute('SELECT ID_Insumo as id ,Nombre as nombre, Precio as precio FROM insumo WHERE Categoría = ?', [categoria])
  }

  static generarID (prefijo) {
  // 10 dígitos aleatorios → colisión prácticamente imposible (1 en 10,000,000,000)
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `${prefijo}${numero}` // "PD1823049231" — 12 chars, bien dentro del varchar(10)...
  }

  static async insertNewProduct (connection, id, nombre, categoria, Precio, Disponible, Imagen, tipo) {
    // Al usar await, recibes el resultado de la promesa
    const [result] = await connection.execute(
      'INSERT INTO producto VALUES (?,?,?,?,?,?,?,?)',
      [id, 'Básico', categoria, nombre, Precio, Disponible, tipo, Imagen]
    )
    return result // Este objeto contiene affectedRows e insertId
  }

  static async modifyProduct (connection, id, nombre, categoria,tipo, Precio, Disponible, Imagen) {
    const result = await connection.execute(`
    UPDATE producto
    SET 
      Categoría = ?, 
      Tipo = ?,
      Nombre = ?,
      Precio = ?,
      Disponible = ?,
      Imagen = ?
  WHERE ID_Producto = ?;`, [categoria,tipo, nombre, Precio, Disponible, Imagen, id])
    return result
  }

  static async insertNewProductIng (connection, productId, insumoId) {
    const [result] = await connection.execute(
      'INSERT INTO producto_tiene_insumo VALUES (?,?)',
      [productId, insumoId])
    return result
  }

  static async eliminateIngProduct (connection, productId, insumoId) {
    const [result] = await connection.execute(
      'DELETE FROM producto_tiene_insumo WHERE ID_Producto = ? AND ID_Insumo = ?'
      , [productId, insumoId])
    return result
  }

  static ValidarDatosRegistro (data) {
    const mensajesError = [] // Lista para acumular errores

    for (const [key, value] of Object.entries(data)) {
      // 1. Validar vacío
      if (value === null || value === undefined || value === '') {
        mensajesError.push(`Campo vacío: ${key}`)
      } else if (key === 'Precio') {
        const precio = parseFloat(value)
        if (isNaN(precio) || precio <= 0) {
          mensajesError.push(`Precio inválido: ${value}`)
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

  // Esta se va a ir de este modelo
  static async getAllIngredientes () {
    return db.execute('SELECT Nombre as nombre, ID_Insumo as id, Precio as precio FROM INSUMO')
  }

  /* Modificar Un producto */

  static async fecthOneProduct (id) {
    return db.execute('SELECT * FROM PRODUCTO WHERE ID_Producto = ?', [id])
  }

  static async fetchOneProductIngredientes (id) {
    return db.execute('SELECT ID_Insumo as id FROM producto_tiene_insumo WHERE ID_Producto = ?', [id])
  }

  /* EliminarDesactivar producto PD30576515 */

  static async eliminarProducto (id) {
    const [result] = await db.execute('CALL eliminarProducto(?)', [id])
    return result
  }

  static async desactivarProducto (id) {
    const [result] = await db.execute('UPDATE producto SET Disponible = 0 WHERE ID_Producto = ?', [id])
    return result
  }
}
