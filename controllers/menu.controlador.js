const nav = require('../models/breadcrumbs.model.js')
const productos = require('../models/MenuDigital/productos.model.js')
const ingrediente = require('../models/ingrediente.model.js')
const categorías = require('../models/MenuDigital/categorías.model.js')
const tipos = require('../models/MenuDigital/tipos.model.js')
const promos = require('../models/promociones.model.js')
const Pedido = require('../models/pedidos.model.js')
const sucursal = require('../models/MenuDigital/sucursales.model.js')
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
  response.render('cliente/order', { breadcrumbs })
}

exports.getPlatillo = async (request, response, next) => {
  const id = request.query.id
  console.log('Query: ', request.query)
  console.log('EN CONTROLLER — buscando:', id)

  /* if (!nombre || typeof nombre !== 'string' || nombre.length > 100) {
    return response.status(400).json({ disponible: false, mensaje: 'Nombre inválido' })
  }
  */

  try {
    const [rows] = await db.execute(
      `SELECT p.ID_Producto, p.Nombre, p.Precio, p.Disponible,
              p.Categoría as base,
              GROUP_CONCAT(i.Nombre SEPARATOR '||') as ingredientes
       FROM producto p
       LEFT JOIN producto_tiene_insumo pti ON p.ID_Producto = pti.ID_Producto
       LEFT JOIN insumo i ON pti.ID_Insumo = i.ID_Insumo
       WHERE p.ID_Producto = ?
       GROUP BY p.ID_Producto`,
      [id]
    )

    console.log('Resultado BD:', rows) // ve qué regresa

    if (rows.length === 0) {
      return response.status(404).json({ disponible: false, mensaje: 'Platillo no encontrado' })
    }

    const row = rows[0]
    const disponible = row.Disponible === 1 || row.Disponible === '1'

    response.status(200).json({
      disponible,
      nombre: row.Nombre,
      precio: row.Precio,
      base: row.base,
      ingredientes: row.ingredientes ? row.ingredientes.split('||') : []
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

exports.validarPedido = async (request, response, next) => {
  const { items } = request.body
  console.log('Validando pedido:', items)

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoValido: false, mensaje: 'El pedido está vacío' })
  }

  for (const item of items) {
    if (
      typeof item.nombre !== 'string' ||
      item.nombre.trim() === '' ||
      item.nombre.length > 100
    ) {
      return response.status(400).json({ pedidoValido: false, mensaje: 'Datos de pedido inválidos' })
    }
  }

  try {
    const ids = items.map(i => i.id)
    const idsDisponibles = await Pedido.verificarDisponibilidadPorId(ids)
    const todosDisponibles = ids.every(id => idsDisponibles.includes(id))
    if (!todosDisponibles) {
      return response.status(200).json({
        pedidoValido: false,
        mensaje: 'Algunos platillos de tu pedido ya no están disponibles.'
      })
    }
    response.status(200).json({ pedidoValido: true })
  } catch (err) {
    console.error('Error validando pedido:', err)
    next(err)
  }
}

exports.confirmarPedido = async (request, response, next) => {
  const { items, forma, telefono } = request.body

  const formasValidas = ['Pick-Up', 'On Site', 'Delivery']
  if (!formasValidas.includes(forma)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Forma de entrega inválida' })
  }

  const telefonoLimpio = String(telefono).replace(/[\s-]/g, '')
  if (!/^\d{7,15}$/.test(telefonoLimpio)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Teléfono inválido' })
  }

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'El pedido está vacío' })
  }

  try {
    // 1 Verifica cliente (o lo crea si no hay)
    await Pedido.verificarOCrearCliente(telefonoLimpio)

    // 2 Guarda la orden
    const idOrden = await Pedido.guardarOrden(telefonoLimpio, forma, 'Cliente')

    // 3. Guarda los items
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


exports.getIngredientesActivos = async (req, res, nex) =>{
  console.log("Obteniendo los ingredientes activos")
  try{
    const result = await ingrediente.fetchAllValid()

    res.status(200).json({
      ok: true,
      message: 'Catalogo de Ingredientes Activos Obtenido',
      ingActiveCatalog: result
    })

  } catch (err){
    res.status(500).json({
      ok: false,
      message: err
    })

  }

}

