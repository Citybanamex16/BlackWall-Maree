const nav = require('../models/breadcrumbs.model.js')
const productos = require('../models/MenuDigital/productos.model.js')
const ingrediente = require('../models/ingrediente.model.js')
const categorías = require('../models/MenuDigital/categorías.model.js')
const tipos = require('../models/MenuDigital/tipos.model.js')
const promos = require('../models/promociones.model.js')
const Pedido = require('../models/pedidos.model.js')
const sucursal = require('../models/MenuDigital/sucursales.model.js')
const feedback = require('../models/MenuDigital/feedback.model.js')
const db = require('../util/database.js')


// CU11 Vizualisar Menu
exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  const SesionData = request.session.cliente
  response.render('cliente/menu', { breadcrumbs, datosCliente: SesionData })
}

exports.getMenuData = async (request, response, next) => {
  console.log('GetMenu ejecutandose...')
  try {
    const [Allcategories, productsData, AllTypes] = await Promise.all([
      categorías.fecthAll(),
      productos.getValidProductData(),
      tipos.fetchAll()
    ])

    console.log('All Promises realizada con exito')
    // console.log('Categorías Info: ', Allcategories)
    // console.log('Products Info: ', productsData)

    response.status(200).json({
      ok: true,
      message: 'Consultas realizadas con exito',
      arrayCategorías: Allcategories,
      arrayProductsInfo: productsData,
      arrayTipos: AllTypes
    })
    console.log('Proceso finalizado con exito')
  } catch (err) {
    console.log('Error en get Menu: ', err)
    response.status(500).json({
      ok: false,
      message: err
    })
  }
}

exports.getMenuPromos = async (req, res, nex) => {
  console.log('Obteniendo PU & PE')
  try {
    const [PUs, PEs, PRs] = await Promise.all([
      promos.getPromotionsBySource('PU'),
      promos.getPromotionsBySource('PE'),
      promos.getPromotionsBySource('PR')
    ])

    console.log('All promises hechas con exito')
    res.status(200).json({
      ok: true,
      message: 'PE & PU obtenidos',
      allPUs: PUs,
      allPEs: PEs,
      allPRs: PRs
    })
  } catch (err) {
    console.log('Error en consulta de PEs & PUs: ', err)
    res.status(500).json({
      ok: true,
      message: 'PE & PU no obtenidos, error',
      error: err
    })
  }
}

exports.getMapaSucursales = (req, res, nex) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  res.render('cliente/mapaSucursal', { breadcrumbs })
}

exports.getAllSucursales = async (req, res, nex) => {
  console.log('obteniendo Sucursales ')
  try {
    const sucursalesData = await sucursal.fetchAll()

    console.log('Sucursales recuperadas')
    res.status(200).json({
      ok: true,
      message: 'Sucursales obtenidas de manera correcta',
      allSucursales: sucursalesData
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(500).json({
      ok: false,
      message: 'Sucursales no obtenidas'
    })
  }
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs, datosCliente: request.session.cliente || null })
}

exports.getPlatillo = async (request, response, next) => {
  const id = request.query.id
  try {
    const [rows] = await db.execute(
      `SELECT p.ID_Producto, p.Nombre, p.Precio, p.Disponible,
              p.Categoría as base,
              i.ID_Insumo as ing_id,
              i.Nombre    as ing_nombre,
              i.Precio    as ing_precio
       FROM producto p
       LEFT JOIN producto_tiene_insumo pti ON p.ID_Producto = pti.ID_Producto
       LEFT JOIN insumo i ON pti.ID_Insumo = i.ID_Insumo
       WHERE p.ID_Producto = ?`,
      [id]
    )

    if (rows.length === 0) {
      return response.status(404).json({ disponible: false, mensaje: 'Platillo no encontrado' })
    }

    const row = rows[0]
    const disponible = row.Disponible === 1 || row.Disponible === '1'

    const ingredientes = rows
      .filter(r => r.ing_id)
      .map(r => ({ id: r.ing_id, nombre: r.ing_nombre, precio: parseFloat(r.ing_precio) }))

    const [catalogoRows] = await db.execute(
      'SELECT ID_Insumo as id, Nombre as nombre, Precio as precio FROM insumo WHERE Activo = 1 ORDER BY Nombre'
    )

    response.status(200).json({
      disponible,
      nombre: row.Nombre,
      precio: row.Precio,
      base: row.base,
      ingredientes,
      catalogo: catalogoRows.map(r => ({ id: r.id, nombre: r.nombre, precio: parseFloat(r.precio) }))
    })
  } catch (err) {
    console.error('Error buscando platillo:', err)
    next(err)
  }
}

exports.agregarItem = (request, response, next) => {
  const { nombre, precio, desc } = request.body
  console.log(`Item agregado: ${nombre} - $${precio}`)
  response.status(200).json({ agregado: true, nombre, precio, desc })
}


/* ==== middleware de contexto de sesion ==== */
// middlewares/contextoUsuario.middleware.js

// middleware/contextoUsuario.js

const Royalty = require('../models/royalty.model')

exports.contextoUsuario = async (request, response, next) => {
  const isLoggedIn = request.session?.isLoggedIn === true
  const cliente = request.session?.cliente || null

  let nivelRoyalty = 'CLIENTE_GENERAL'

  try {
    // Solo consultar si hay sesión de cliente
    if (
      isLoggedIn &&
      request.session?.rol === 'Usuario' &&
      cliente?.telefono
    ) {
      console.log("📡 [ROYALTY] Consultando nivel del cliente...")

      const telefono = cliente.telefono

      const [statusData] = await Royalty.fetchClientStatus(telefono)

      const clienteInfo = statusData?.[0]

      nivelRoyalty = clienteInfo?.nivel || 'CLIENTE_GENERAL'

      console.log("👑 [ROYALTY] Nivel detectado:", nivelRoyalty)
    }

    request.usuario = {
      autenticado: isLoggedIn,
      rol: request.session?.rol || 'cliente_general',

      datos: cliente,

      nombre: cliente?.nombre || 'Invitado',
      telefono: cliente?.telefono || null,
      visitas: cliente?.visitas || 0,

      nivelRoyalty,
      esRoyalty: nivelRoyalty !== 'CLIENTE_GENERAL'
    }

    console.log("🔐 [MIDDLEWARE]");
    console.log("   Usuario:", request.usuario.nombre);
    console.log("   Nivel:", request.usuario.nivelRoyalty);

    next()

  } catch (error) {
    console.error("❌ Error obteniendo contexto de usuario:", error)

    // Fallback seguro
    request.usuario = {
      autenticado: false,
      rol: 'cliente_general',
      datos: null,
      nombre: 'Invitado',
      telefono: null,
      visitas: 0,
      nivelRoyalty: 'CLIENTE_GENERAL',
      esRoyalty: false
    }

    next()
  }
}


exports.validarPedido = async (request, response, next) => {
  const usuario = request.usuario; // Trae: nombre, esRoyalty, nivelRoyalty, etc.

  const { items } = request.body;

  // ── Validación básica ──
  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoValido: false, mensaje: 'El pedido está vacío' });
  }

  try {
    // ── 1. Recolección de IDs ──
    const idsProductos = [...new Set(items.map(i => i.id))];
    const idsInsumos = [...new Set(items.flatMap(i => [
        ...(i.ingredientes_adentro || []).map(ins => ins.id_insumo),
        ...(i.ingredientes_toppings || []).map(ins => ins.id_insumo)
    ]))];

    // ── 2. Disponibilidad ──
    const idsDisponibles = await Pedido.verificarDisponibilidadPorId(idsProductos);
    if (!idsProductos.every(id => idsDisponibles.includes(id))) {
      return response.status(200).json({ pedidoValido: false, mensaje: 'Algunos platillos ya no están disponibles.' });
    }

    // ── 3. Fase de Inteligencia: El Compendio ──
    // Obtenemos precios base e ingredientes
    const listaOro = await Pedido.obtenerListaDeOro(idsProductos, idsInsumos);
    
    // Armamos el compendio de promociones filtrado por el contexto del usuario
    const compendio = await Pedido.obtenerCompendioPromociones(usuario);

    // ── 4. Inspección del Policía (Item por Item) ──
    let granTotalOficial = 0;
    const erroresPrecio = [];

    items.forEach((item, index) => {
      // Pasamos el compendio para que el cálculo sepa qué promo aplicar
      const precioOficial = Pedido.calcularPrecioRealItem(item, listaOro, compendio);
      
      const precioRecibido = parseFloat(
        String(item.precio_total ?? item.precio).replace(/[^0-9.]/g, '')
      );

      if (Math.abs(precioOficial - precioRecibido) > 0.01) {
        erroresPrecio.push(`Item ${index + 1}: se esperaba $${precioOficial} pero se recibió $${precioRecibido}`);
      }
      granTotalOficial += precioOficial;
    });

    if (erroresPrecio.length > 0) {
      return response.status(200).json({
        pedidoValido: false,
        mensaje: 'Discrepancia de precios detectada.',
        detalles: erroresPrecio
      });
    }

    return response.status(200).json({
      pedidoValido: true,
      totalVerificado: granTotalOficial
    });

  } catch (err) {
    console.error('💥 Error en Policía:', err);
    next(err);
  }
};



exports.confirmarPedido = async (request, response, next) => {
  const { items, forma, telefono: telefonoBody, nombre: nombreBody, direccion } = request.body

  const sesion = request.session.cliente
  const telefonoFinal = sesion ? String(sesion.telefono) : telefonoBody
  const nombreFinal = sesion ? sesion.nombre : (String(nombreBody || '').trim() || 'Cliente')

  const formasValidas = ['Pick-Up', 'Sucursal', 'Delivery']
  if (!formasValidas.includes(forma)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Forma de entrega inválida' })
  }

  const telefonoLimpio = String(telefonoFinal).replace(/[\s-]/g, '')
  if (!/^\d{7,15}$/.test(telefonoLimpio)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Teléfono inválido' })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'El pedido está vacío' })
  }

  try {
    await Pedido.verificarOCrearCliente(telefonoLimpio, nombreFinal)
    const idOrden = await Pedido.guardarOrden(telefonoLimpio, forma, nombreFinal, forma === 'Delivery' ? (direccion || null) : null)
    await Pedido.guardarItems(idOrden, items)

    response.status(200).json({ pedidoConfirmado: true, idOrden })
  } catch (error) {
    console.error('Error al confirmar pedido:', error)
    response.status(500).json({ pedidoConfirmado: false, mensaje: 'Error al guardar el pedido' })
  }
}


/* CU 14 Visualizar Catalogo Productos */
exports.getProducts = (req, res, next) => {
  const breadcrumbs = nav.getBreadcrumbs('AdminSection')
  res.render('admin/products', { breadcrumbs })
}

exports.getProductsCatalog = async (req, res, next) => {
  console.log('Backend obteniendo todos los Productos, ingredientes & catalogos')
  try {
    // 1. Llamado en paralelo de consultas con Promise.all()
    const [Allcategories, allProductsData] = await Promise.all([
      categorías.fecthAll(), // Async BD call 1.
      productos.getAllProductsInfo() // async BD call
    ])

    // console.log('Categorías catalog: ', Allcategories)
    // console.log('Products catalog: ', allProductsData)

    res.status(200).json({
      ok: true,
      message: 'Catalogos Obtenido con exito',
      arrayCategorías: Allcategories,
      arrayProductsCatalog: allProductsData
    })
    console.log('Catalogos obtenidos con exito')
  } catch (err) {
    console.log('Error en get Menu: ', err)
    res.status(500).json({
      ok: false,
      message: err
    })
  }
}

exports.getTypes = async (req, res, nex) => {
  try {
    const productTypes = await tipos.fetchAll()

    res.status(200).json({
      ok: true,
      message: 'Tipos recuperados',
      data: productTypes
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      ok: false,
      message: 'Error al obtener los tipos de la BD'
    })
  }
}

/* FIN Visualizar Catalogo */

exports.getCategorys = async (req, res, next) => {
  try {
    const productsCategorys = await categorías.fecthAll()

    res.status(200).json({
      success: true,
      message: 'Tipos recuperados',
      data: productsCategorys
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener las Categorías de la BD'
    })
  }
}

const ProductFields = [
  { nombre: 'Nombre', type: 'string' },
  { nombre: 'Precio', type: 'float' },
  { nombre: 'Disponible', type: 'boolean' },
  { nombre: 'Imagen', type: 'string' }
]

exports.getProductfieldsAndIngredientes = async (req, res, next) => {
  try {
    const { id: typeId } = req.query

    if (!typeId) {
      return res.status(400).json({ error: 'El ID es requerido' })
    }

    const allIngredientes = await productos.getCategoryIngredientes(typeId)
    const allTypes = await tipos.fetchAll()

    const productFormsFields = ProductFields
    res.status(200).json({
      success: true,
      message: 'Campos e Ingredientes recuperados',
      data: {
        fields: productFormsFields,
        ingredientes: allIngredientes,
        types: allTypes
      }
    })
  } catch (error) {
    console.error('Error en getProductfieldsAndIngredientes:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener los Ingredientes/Campos del servidor'
    })
  }
}

const pool = require('../util/database.js')

exports.postNewProduct = async (req, res, next) => {
  console.log('POST recibido: ', req.body)
  let connection
  try {
    connection = await pool.getConnection()

    const NewProductData = req.body
    // Extracción tipo map
    const {
      Nombre,
      Precio,
      Disponible,
      Imagen,
      tipo,
      categoría, // Renombramos 'type' a 'categoria'
      ingredientesID
    } = NewProductData

    console.log('Variables a insertar:', {
      AutoId: 'Generando...',
      Nombre,
      categoría,
      Precio,
      Disponible,
      Imagen,
      tipo,
      tieneIngredientes: ingredientesID?.length > 0
    })

    const validation = await productos.ValidarDatosRegistro(NewProductData)
    const AutoId = productos.generarID('PD')

    if (validation) {
      if (ingredientesID.length > 0) {
        // Caso producto con ingredientes (transacción)
        // 1. Iniciamos la transacción asincronica -> hasta commit
        await connection.beginTransaction()

        // 2. Inserción en Producto
        await productos.insertNewProduct(connection, AutoId, Nombre, categoría, Precio, Disponible, Imagen, tipo)

        // 3. Inserciones en Ingrediente-Producto
        for (const ing of ingredientesID) {
          console.log(`Insertando ingrediente: ${ing.nombre}`)
          await productos.insertNewProductIng(connection, AutoId, ing.id)
        }

        // 4. Si llegamos aqui salvamos de forma permanente
        await connection.commit()
        console.log('¡Todo se guardó correctamente!')
        res.status(200).json({
          ok: true,
          message: 'Producto e insumos registrado con éxito'
        })
      } else {
        // Caso producto Sin ingredientes
        const postResult = await productos.insertNewProduct(connection, AutoId, Nombre, categoría, Precio, Disponible, Imagen, tipo)

        if (postResult.affectedRows > 0) {
          console.log('Producto Insertado con exito')
          res.status(200).json({
            ok: true,
            message: 'Producto registrado con éxito'
          })
        } else {
          res.status(500).json({
            ok: false,
            message: 'No se pudo insertar el producto'
          })
        }
      }
    } else {
      res.status(400).json({ ok: false, message: 'Datos no validos' })
    }
  } catch (error) {
    console.log('Error en conexion a BD: ', error)
    res.status(500).json({
      ok: false,
      message: 'Error en conexión a BD'
    })
  } finally {
    connection.release() // Siempre liberar la conexión
  }
}

exports.postModifProduct = async (req, res, next) => {
  console.log('Recibiendo datos: ', req.body)
  const connection = await pool.getConnection()

  try {
    const newdata = req.body
    const newIngredientesRaw = newdata.ingredientes || [] // Evitamos fallos si viene vacío
    const oldIngredientesRaw = await productos.fetchOneProductIngredientes(newdata.id)

    // 1. LIMPIEZA DE DATOS: Convertimos los objetos complejos en arrays de IDs simples
    // newIds quedará como: ['IN37891778', 'IN12345678']
    const newIds = newIngredientesRaw.map(ing => ing.id)

    // oldIds quedará como: ['IN37891778']. Ojo: usamos [0] para ignorar la metadata de MySQL
    const oldIds = oldIngredientesRaw[0].map(ing => ing.id)

    console.log('IDs Nuevos a evaluar: ', newIds)
    console.log('IDs Viejos en la BD: ', oldIds)

    // 2. EL ALGORITMO DIFERENCIAL (La Magia)
    // aEliminar: IDs que estaban en la BD (old) pero ya NO vienen en los nuevos.
    const aEliminar = oldIds.filter(id => !newIds.includes(id))

    // aInsertar: IDs que vienen en los nuevos pero NO estaban en la BD (old).
    const aInsertar = newIds.filter(id => !oldIds.includes(id))

    console.log('Array a Eliminar: ', aEliminar)
    console.log('Array a Insertar: ', aInsertar)

    // 3. EJECUCIÓN EN BASE DE DATOS
    // Setup
    await connection.beginTransaction()

    // A. Cambio de datos en el Producto
    const modifyResult = await productos.modifyProduct(connection, newdata.id, newdata.nombre, newdata.Categoria, newdata.tipo, newdata.precio, newdata.activo, newdata.imagen)
    console.log(modifyResult)
    // B. Eliminacion de ingredientes removidos
    if (aEliminar.length > 0) {
      console.log(`Eliminando ${aEliminar.length} relaciones obsoletas...`)
      // TODO: Placeholder para Modelo
      for (const ingElim of aEliminar) {
        await productos.eliminateIngProduct(connection, newdata.id, ingElim)
      }
    }
    // C. Insercion de ingredientes nuevos :)
    if (aInsertar.length > 0) {
      console.log(`Insertando ${aInsertar.length} relaciones nuevas...`)
      // TODO: Placeholder para Modelo
      for (const ingInsert of aInsertar) {
        await productos.insertNewProductIng(connection, newdata.id, ingInsert)
      }
    }

    // Fin de llamado ¿Todos lo lograron ?
    await connection.commit()

    // 4. RESPUESTA AL FRONTEND
    res.status(200).json({
      ok: true,
      message: 'Producto e ingredientes modificados correctamente'
    })
  } catch (error) {
    console.log('Error crítico en modificación: ', error)
    await connection.rollback()
    res.status(500).json({
      ok: false,
      message: 'Error al actualizar el producto',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

exports.getIngredientesFullCatalog = async (req, res, next) => {
  try {
    console.log('Backend: Obteniendo Catalogo de ingredientes ')
    const ingredientesCatalog = await productos.getAllIngredientes()

    res.status(200).json({
      ok: true,
      message: 'Catalogo de Ingredientes Obtenido',
      ingCatalog: ingredientesCatalog
    })
  } catch (err) {
    console.log('Error en get Ingredientes: ', err)
    res.status(500).json({
      ok: false,
      message: err
    })
  }
}

/* Eliminar/Desactivar Producto */
exports.deleteProducto = async (req, res, next) => {
  const { id } = req.body // Más limpio

  // Validar entrada
  if (!id) {
    return res.status(400).json({
      ok: false,
      message: 'El ID del producto es obligatorio para la eliminación'
    })
  }

  try {
    console.log('Eliminando producto con id: ', id)
    const productoEliminado = await productos.eliminarProducto(id)

    if (!productoEliminado) {
      console.log('Error producto no encontrado')
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      })
    }

    console.log('Producto Eliminado con exito: ', productoEliminado)
    res.status(200).json({
      ok: true,
      message: 'Producto Eliminado con éxito', // Mensaje preciso
      data: productoEliminado // Opcional: devolver el objeto
    })
  } catch (err) {
    // 3. Logear el error real para debugging
    console.error('Error al eliminar producto:', err)

    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor', // Mensaje seguro para el cliente
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    })
  }
}

exports.putDesactivarProducto = async (req, res, next) => {
  const { id } = req.body // Más limpio

  // Validar entrada
  if (!id) {
    return res.status(400).json({
      ok: false,
      message: 'El ID del producto es obligatorio'
    })
  }

  try {
    // 2. Asumimos que desactivarProducto devuelve el producto actualizado o null
    const productoDesactivado = await productos.desactivarProducto(id)

    if (!productoDesactivado) {
      console.log('Error producto no desactivado')
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      })
    }

    console.log('Producto desactivado con exito')
    res.status(200).json({
      ok: true,
      message: 'Producto desactivado con éxito', // Mensaje preciso
      data: productoDesactivado // Opcional: devolver el objeto
    })
  } catch (err) {
    // 3. Logear el error real para debugging
    console.error('Error al desactivar producto:', err)

    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor', // Mensaje seguro para el cliente
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    })
  }
}



// Seccion Personalizacion de productos 


exports.getCategorías = async (req, res, nex) =>{
  console.log("Obteniendo las categorías")
  try{
    const result = await categorías.fecthAll()

    res.status(200).json({
      ok: true,
      message: 'Catalogo de categorías Obtenido',
      categoriasCatalog: result
    })

  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err
    })


  }

}


exports.getIngredientesActivos = async (req, res, nex) => {
    console.log("Obteniendo los ingredientes activos con transacción");
    
    // PLACEHOLDER: Obtener el objeto de conexión/pool de tu configuración de BD
    const connection = await db.getConnection(); 

    try {
        // Iniciamos la transacción
        await connection.beginTransaction();

        // Ejecutamos ambas consultas usando la misma conexión
        const result = await ingrediente.fetchAllValid(connection);
        const resultPrecioBase = await productos.getCrepaPersoPrecioBase(connection);

        // Si todo sale bien, confirmamos (commit)
        await connection.commit();

        res.status(200).json({
            ok: true,
            message: 'Catalogo de Ingredientes Activos Obtenido',
            ingActiveCatalog: result,
            precioBasePerso: resultPrecioBase
        });

    } catch (err) {
        // Si algo falla, revertimos cualquier cambio (rollback)
        if (connection) await connection.rollback();
        
        res.status(500).json({
            ok: false,
            message: 'Error en la transacción',
            error: err.message || err
        });
    } finally {
        // Siempre liberamos la conexión al terminar
        if (connection) connection.release();
    }
};


//Sección feedback Cliente

exports.getClientReview = async (req, res, nex) => {
  console.log("Getting Client's review history")
  try{

    const clientData = req.body

    const resultData = await feedback.getClientFeedback(clientData.Numero_Telefonico)

     res.status(200).json({
          ok: true,
          message: 'Catalogo Feedback Obtenido',
          reviewCatalog:resultData
                  })

  } catch (err) {
    res.status(500).json({
          ok: false,
          message: 'Error al obtener catalogo feedback',
          error:err
                  })

  }
}




exports.postNewFeedback = async (req, res, post) => {
  console.log("Generando nuevo feedback de cliente")
  let resultData
  try{

    const NewReviewData = req.body
    // Extracción tipo map
     const {
      ID_Orden,            // Recibir
      Puntaje,             // Recibir
      Comentario,          // Recibir
      Numero_Telefonico    // Recibir para cliente_tiene_review
  } = NewReviewData;

  //Generar variables
  const ID_Review = productos.generarID("RV")
  console.log("ID generado para nueva review: ", ID_Review)

  const now = new Date();
  const Fecha_Hora = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');

  //Preparando paquetes de info para cada tabla:
  // Para tabla Review
const reviewRecord = {
    ID_Review,
    ID_Orden,
    Puntaje,
    Fecha_Hora,
    Comentario
};

// Para tabla cliente_tiene_review
const intermediaryData = {
    ID_Review, // ID_Review generada arriba
    Numero_Telefonico
};

console.log(reviewRecord);
console.log(intermediaryData);

//Ejecutando POST
resultData = await feedback.postNewOrderFeedback(reviewRecord, intermediaryData)

  console.log("Resultado SP:", JSON.stringify(resultData))

  if (resultData && resultData[0]?.Estado === 'Error') {
    throw new Error(`SP falló: ${resultData[0]?.Mensaje}`)
  }

  res.status(200).json({
          ok: true,
          message: 'Feedback Guardado correctamente',
          result:resultData
                  })


  } catch (err){
    console.log("Error interno en POST de feedback: ", err)
    res.status(500).json({
          ok: false,
          message: 'Error al guardar feedback',
          result:resultData
                  })


  }
}



