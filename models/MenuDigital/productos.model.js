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

  static async modifyProduct (connection, id, nombre, categoria, tipo, Precio, Disponible, Imagen) {
    const result = await connection.execute(`
    UPDATE producto
    SET 
      Categoría = ?, 
      Tipo = ?,
      Nombre = ?,
      Precio = ?,
      Disponible = ?,
      Imagen = ?
  WHERE ID_Producto = ?;`, [categoria, tipo, nombre, Precio, Disponible, Imagen, id])
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


  /* --- MODELO PEDIDO --- */

static async ValidarDatosRegistro(data) {
    let mensajesError = [];

    // 1. Validaciones estructurales básicas
    for (const [key, value] of Object.entries(data)) {
        if (value === null || value === undefined || value === '') {
            // Saltamos 'direccion' si no es delivery, por ejemplo
            if (key === 'direccion' && data.forma !== 'Delivery') continue;
            mensajesError.push(`Campo vacío: ${key}`);
        }
    }

    // 2. Si la estructura está mal, no molestamos al policía todavía
    if (mensajesError.length > 0) {
        return { valido: false, mensaje: mensajesError.join(', ') };
    }

    // 3. LLAMADA AL POLICÍA (Asíncrona)
    // Pasamos el array de errores para que el policía le escriba sus hallazgos
    await this.sistemaValidarprecio(mensajesError, data);

    if (mensajesError.length > 0) {
        return { valido: false, mensaje: mensajesError.join(' | ') };
    }

    return { valido: true, mensaje: '' };
}

/* --- SECCIÓN DE POLICÍA DE PRECIOS >:) --- */

static async sistemaValidarprecio(arrayDeErrores, ordenData) {
    console.log("🕵️ Policia de precios inspeccionando la orden...");
  
    try {
        // A. Recolectar todos los IDs únicos (Productos e Insumos) para la consulta masiva
        const idsProductos = [...new Set(ordenData.items.map(i => i.id))];
        const idsInsumos = [...new Set(ordenData.items.flatMap(i => [
            ...(i.ingredientes_adentro || []).map(ins => ins.id_insumo),
            ...(i.ingredientes_toppings || []).map(ins => ins.id_insumo)
        ]))];

        // B. Obtener la "Lista de Oro" (Precios reales de la BD)
        const listaOro = await this.obtenerListaDeOro(idsProductos, idsInsumos);

        // C. El Verificador analiza item por item
        for (const [index, item] of ordenData.items.entries()) {
            const precioOficialItem = this.calcularPrecioRealItem(item, listaOro);
            
            // Limpiar el precio que mandó el cliente (quitar $ o comas)
            const precioCliente = parseFloat(String(item.precio_total || item.precio).replace(/[^0-9.]/g, ''));

            // Comparación con tolerancia de centavos (0.01)
            if (Math.abs(precioOficialItem - precioCliente) > 0.01) {
                arrayDeErrores.push(`Discrepancia en Item ${index + 1} (${item.nombre || item.producto_base}): El precio esperado era $${precioOficialItem} pero se recibió $${precioCliente}`);
            }
        }
    } catch (err) {
        console.error("Falla en el sistema de vigilancia:", err);
        arrayDeErrores.push("Error interno al verificar precios.");
    }
}

// Función auxiliar: Consulta masiva a la BD
static async obtenerListaDeOro(idsProductos, idsInsumos) {
    try {

        const [resultSets] = await db.query("CALL ObtenerPreciosPoli(?, ?)", [
            idsProductos.join(','), 
            idsInsumos.join(',')
        ]);

        /** * MariaDB devuelve un array de arrays cuando hay múltiples SELECTs en un SP:
         * resultSets[0] -> Resultados de la tabla Producto
         * resultSets[1] -> Resultados de la tabla Insumo
         */
        const rawProductos = resultSets[0] || [];
        const rawInsumos = resultSets[1] || [];

        // 2. Construcción de la Lista de Oro (Formato Diccionario para O(1))
        const listaOro = {
            productos: {},
            insumos: {}
        };

        // Mapeamos Productos: { "ID": Precio }
        rawProductos.forEach(p => {
            listaOro.productos[p.id] = parseFloat(p.Precio);
        });

        // Mapeamos Insumos: { "ID": Precio }
        rawInsumos.forEach(i => {
            listaOro.insumos[i.id] = parseFloat(i.Precio);
        });

        console.log("✅ Lista de Oro generada con éxito.");
        return listaOro;

    } catch (error) {
        console.error("❌ Error crítico en el Policía (Obtención de Precios):", error);
        // Si falla la lista de oro, el pedido debe ser rechazado por seguridad
        throw new Error("No se pudo verificar el catálogo oficial.");
    }
}

// El cerebro matemático
static calcularPrecioRealItem(item, listaOro) {
    let acumulado = 0;

    // 1. Sumar precio base del producto
    const precioBase = listaOro.productos[item.id];
    if (precioBase === undefined) {
        throw new Error(`Producto no reconocido o inactivo: ${item.id}`);
    }
    acumulado += precioBase;

    // 2. Sumar ingredientes (adentro y toppings)
    const todosLosInsumos = [
        ...(item.ingredientes_adentro || []),
        ...(item.ingredientes_toppings || [])
    ];

    todosLosInsumos.forEach(ins => {
        const precioInsumo = listaOro.insumos[ins.id_insumo] || 0;
        acumulado += precioInsumo;
    });

    return acumulado;
}

/* fin de funciones polis */
  
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

  static async getCrepaPersoPrecioBase(connection){
    const [result] = await connection.execute('SELECT Precio as precioBaseCrepaPerso FROM `producto` WHERE ID_Producto = "PD_COMODIN";')
    return result
  }
}
