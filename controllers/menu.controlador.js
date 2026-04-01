const nav = require('../models/breadcrumbs.model.js')
const productos = require('../models/MenuDigital/productos.model.js')
const categorías = require('../models/MenuDigital/categorías.model.js')
const Pedido = require('../models/pedidos.model.js')
const db = require('../util/database.js')

// CU11
exports.getMenu = async (request, response, next) => {
  console.log('GetMenu ejecutandose...')
  try {
    // 1. Llamado en paralelo de consultas con Promise.all()
    const [Allcategories, productsData] = await Promise.all([
      categorías.fecthAll(), // Async BD call 1.
      productos.getValidProductData() // async BD call
    ])

    // 2. llamadas sincronicas
    const breadcrumbs = nav.getBreadcrumbs('Menu')

    console.log('All Promises realizada con exito')
    console.log('Categorías Info: ', Allcategories)
    console.log('Products Info: ', productsData)

    response.status(200).json({
      ok: true,
      message: 'Consultas realizadas con exito',
      arrayCategorías: Allcategories,
      arrayProductsInfo: productsData,
      breadcrumbsInfo: breadcrumbs
    })
  } catch (err) {
    console.log('Error en get Menu: ', err)
    response.status(500).json({
      ok: false,
      message: err
    })
  }

  // response.render('cliente/menu', { breadcrumbs })
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs })
}

exports.getPlatillo = async (request, response, next) => {
  const nombre = request.query.nombre
  console.log('ENCONTROLLER — buscando:', nombre)

  if (!nombre || typeof nombre !== 'string' || nombre.length > 100) {
    return response.status(400).json({ disponible: false, mensaje: 'Nombre inválido' })
  }

  try {
    const [rows] = await db.execute(
      `SELECT p.ID_Producto, p.Nombre, p.Precio, p.Disponible,
              p.Categoría as base,
              GROUP_CONCAT(i.Nombre SEPARATOR '||') as ingredientes
       FROM producto p
       LEFT JOIN producto_tiene_insumo pti ON p.ID_Producto = pti.ID_Producto
       LEFT JOIN insumo i ON pti.ID_Insumo = i.ID_Insumo
       WHERE p.Nombre = ?
       GROUP BY p.ID_Producto`,
      [nombre]
    )

    console.log('Resultado BD:', rows) // ve qué regresa

    if (rows.length === 0) {
      return response.status(404).json({ disponible: false, mensaje: 'Platillo no encontrado' })
    }

    const row = rows[0]

    // Disponible puede venir como string '1'/'0' o número 1/0
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
      typeof item.precio !== 'string' ||
      typeof item.desc !== 'string' ||
      item.nombre.trim() === '' ||
      item.nombre.length > 100
    ) {
      return response.status(400).json({ pedidoValido: false, mensaje: 'Datos de pedido inválidos' })
    }
  }

  try {
    const nombres = items.map(i => i.nombre)
    const resultado = await Pedido.verificarDisponibilidad(nombres)
    if (resultado.count === 0) {
      return response.status(200).json({ pedidoValido: false, mensaje: 'Ningún platillo está disponible' })
    }
    response.status(200).json({ pedidoValido: true })
  } catch (err) {
    console.error('Error validando pedido:', err)
    next(err)
  }
}

exports.confirmarPedido = async (request, response, next) => {
  const { items, forma, telefono } = request.body

  // Mapear forma del front al enumerao de la BD
  const mapaForma = {
    'Pick-Up': 'Pick-up',
    'On Site': 'Sucursal',
    Delivery: 'Delivery'
  }
  const tipoOrden = mapaForma[forma]
  if (!tipoOrden) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Forma de entrega inválida' })
  }

  // Validar teléfono
  const telefonoLimpio = String(telefono).replace(/[\s-]/g, '')
  if (!/^\d{7,15}$/.test(telefonoLimpio)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Teléfono inválido' })
  }

  // Validar items
  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'El pedido está vacío' })
  }

  for (const item of items) {
    if (typeof item.nombre !== 'string' || item.nombre.trim() === '' || item.nombre.length > 100) {
      return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Item inválido' })
    }
  }

  try {
    const idOrden = await Pedido.guardarOrden(telefono, tipoOrden, 'Cliente')
    console.log('Orden guardada con ID:', idOrden)

    await Pedido.guardarItems(idOrden, items)
    console.log('Items guardados para orden:', idOrden)

    response.status(200).json({ pedidoConfirmado: true, idOrden })
  } catch (err) {
    console.error('Error confirmando pedido:', err)
    response.status(500).json({ pedidoConfirmado: false, mensaje: 'Error al guardar en BD' })
  }
}

exports.getProducts = (req, res, next) => {
  res.render('admin/products')
}

exports.getTypes = async (req, res, next) => {
  try {
    const productTypes = await productos.getAllProductTypes()
    res.status(200).json({
      success: true,
      message: 'Tipos recuperados',
      data: productTypes
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener los tipos de la BD'
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

    const allIngredientes = await productos.getAllIngredientes(typeId)
    res.status(200).json({
      success: true,
      message: 'Campos e Ingredientes recuperados',
      data: {
        fields: ProductFields,
        ingredientes: allIngredientes
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

exports.postNewProduct = async (req, res, next) => {
  console.log('POST recibido: ', req.body)
  try {
    const NewProductData = {}
    req.body.forEach(item => {
      NewProductData[item.key] = item.value
    })

    const { Nombre, Precio, Disponible, Imagen, type: categoria, ingredientes } = NewProductData

    console.log('Nombre: ', Nombre)
    console.log('Ingredientes: ', ingredientes)

    const validation = await productos.ValidarDatosRegistro(req.body)
    const AutoId = productos.generarID()
    console.log('Nuevo ID: ', AutoId)

    if (validation) {
      await productos.insertNewProduct(AutoId, Nombre, categoria, Precio, Disponible, Imagen)
      res.status(200).json({ ok: true, message: 'Datos validados y correctos :)' })
    } else {
      res.status(400).json({ ok: false, message: 'Datos no validos' })
    }
  } catch (error) {
    console.log('Error en conexion a BD: ', error)
    res.status(500).json({ ok: false, message: 'Error en conexión a BD' })
  }
}
