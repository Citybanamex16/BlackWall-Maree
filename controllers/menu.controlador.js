// Llamar a models
const nav = require('../models/breadcrumbs.model.js')
const productos = require('../models/productos.model.js')

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs })
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs })
}

exports.getPlatillo = (request, response, next) => {
  console.log('ENCONTROLLER')
  // DESCOMENTAR EL DE ABAJO CUANDO ESTE LA BASE DE DATOS
  // productos.fetchOne(request.body)
  response.status(200).json({ message: 'Respuesta asíncrona' })
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
      message: 'Error al obtener los tipos de la BD:'
    })
  }
}

const ProductFields = [
  { nombre: 'Nombre', type: 'string' },
  { nombre: 'Precio', type: 'float' },
  { nombre: 'Disponible', type: 'boolean' },
  { nombre: 'Imagen', type: 'string' }
]

/*
const ingredientesDummy = [
  { id: 1, nombre: 'Nutella', categoria: 'Dulce', precio: 15.50 },
  { id: 2, nombre: 'Queso Crema', categoria: 'Salado', precio: 12.00 },
  { id: 3, nombre: 'Fresa fresca', categoria: 'Dulce', precio: 10.00 },
  { id: 4, nombre: 'Jamón de Pavo', categoria: 'Salado', precio: 14.00 },
  { id: 5, nombre: 'Cajeta', categoria: 'Dulce', precio: 11.50 },
  { id: 6, nombre: 'Champiñones', categoria: 'Salado', precio: 13.00 }
]
*/

exports.getProductfieldsAndIngredientes = async (req, res, next) => {
  try {
    const { id: typeId } = req.query

    // 2. Validación (Recomendado)
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
    res.status(500).json({ // 500 es más preciso que 404 aquí
      success: false,
      message: 'Error al obtener los Ingredientes/Campos del servidor'
    })
  }
}

exports.postNewProduct = async (req, res, nex) => {
  console.log('POST recibido: ', req.body)
  try {
    const NewProductData = {}
    req.body.forEach(item => {
      NewProductData[item.key] = item.value
    })

    // Extracción tipo map
    const {
      Nombre,
      Precio,
      Disponible,
      Imagen,
      type: categoria, // Renombramos 'type' a 'categoria'
      ingredientes
    } = NewProductData

    console.log('Nombre: ', Nombre)
    console.log('Ingredientes: ', ingredientes)

    const validation = await productos.ValidarDatosRegistro(req.body)
    const AutoId = productos.generarID()
    console.log('Nuevo ID: ', AutoId)

    if (validation) {
      await productos.insertNewProduct(AutoId, Nombre, categoria, Precio, Disponible, Imagen)

      res.status(200).json({
        ok: true,
        message: 'Datos validados y correctos :)'
      })
    } else {
      res.status(400).json({
        ok: false,
        message: 'Datos no validos'
      })
    }
  } catch (error) {
    console.log('Error en conexion a BD: ', error)
    res.status(500).json({
      ok: false,
      message: 'Error en conexión a BD'
    })
  }
}
