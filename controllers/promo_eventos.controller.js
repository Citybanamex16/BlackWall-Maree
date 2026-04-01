const Eventos = require('../models/eventos.model')
const Promociones = require('../models/promociones.model')

// Eventos
exports.getEvents = (req, res, next) => {
  res.render('admin/events')
}

exports.postRegistrarEvento = (req, res, next) => {
  const { nombre, descripcion, fechaInicio, fechaFin, promociones, royalty, platillos } = req.body

  const nuevoEvento = new Eventos(nombre, descripcion, fechaInicio, fechaFin, promociones, royalty, platillos)

  if (!nombre || !descripcion || !fechaInicio || !fechaFin ||
        !promociones || promociones.length === 0 ||
        !royalty || royalty.length === 0 ||
        !platillos || platillos.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan datos obligatorios: un evento debe tener promociones, estatus royalty y platillos asociados.'
    })
  }

  nuevoEvento.save().then(() => {
    res.status(200).json({
      success: true,
      message: 'Evento nuevo registrado correctamente.'
    })
  }).catch((error) => {
    res.status(500).json({
      success: false,
      message: 'Evento nuevo no registrado por algun error',
      detalles: error
    })
  })
}

exports.getCatalogosEvento = async (req, res, next) => {
  try {
    const [promos] = await Eventos.fetchAllPromociones()
    const [royalties] = await Eventos.fetchAllRoyalties()
    const [platillos] = await Eventos.fetchAllPlatillos()

    res.status(200).json({
      success: true,
      data: {
        promociones: promos,
        royalties,
        platillos
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los catálogos'
    })
  }
}

// Promociones

exports.getPromotions = async (request, response, next) => {
  try {
    // Ejecutamos todas las consultas en paralelo
    const [
      [categorias],
      [tipos]
    ] = await Promise.all([
      Promociones.fetchCategorías(),
      Promociones.fetchTipo()
    ])

    response.render('../views/admin/promotions', {
      lista_categorias: categorias,
      lista_tipos: tipos,
      path: '/promociones'
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.getFilterProductos = async (request, response, next) => {
  try {
    const { categoria, tipo } = request.query
    const [productos] = await Promociones.fetchProductos(categoria, tipo)
    response.status(200).json({
      success: true,
      data: productos
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.postRegistrarPromotions = (request, response, next) => {
  // Para evitar peticiones fantasmas o que se hagan vacías
  // Obtenemos todos los datos del body de una vez
  const { nombre, descuento, condicion, fechaInicio, fechaFinal } = request.body
  if (!nombre || descuento === undefined || !condicion || !fechaInicio || !fechaFinal) {
    console.log('PETICIÓN RECHAZADA: Faltan datos en el body')
    return response.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios para registrar la promoción.'
    })
  }
  // Logica para obtener ID's y si se encuentra activo
  // The class is made or done in the Model
  const numeroId = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 10000000)) + 10000000
  const id = `PR${numeroId}`
  // Se pone activo por default y se puede cambiar cuando se quiera editar una promocion
  const activo = true
  // cambiamos el descuento a decimal
  const descuentoDecimal = request.body.descuento / 100
  console.log('Datos recibidos:', request.body)
  console.log('ID generado:', id)
  // Valores deben coincidir con el FrontEnd, es decir, promotions.js
  // Creamos la nueva promoción
  const promociones = new Promociones(id, request.body.nombre, descuentoDecimal,
    request.body.condicion, activo, request.body.fechaInicio, request.body.fechaFinal)
  console.log('Objeto promocion:', promociones)
  promociones.save().then(() => {
    response.status(200).json({
      success: true,
      message: 'Promocion registrada correctamente'
    })
  }).catch((error) => {
    console.log('error en guardar datos')
    response.status(500).json({
      success: false,
      message: 'Error al guardar la promocion'
    })
    next(error)
  })
}

exports.getMensajes = (request, response, next) => {
  response.render('admin/whatsapp')
}
