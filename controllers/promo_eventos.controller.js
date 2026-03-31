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
exports.getPromotions = (request, response, next) => {
  // mandamos todos lo datos
  response.render('admin/promotions')
}

exports.postRegistrarPromotions = (request, response, next) => {
  // The class is made or done in the Model
  const promociones = new Promociones(request.body.nombre, request.body.condiciones, request.body.descuento)
  promociones.save().then(() => {
    response.status(200).json({
      success: true,
      message: 'Promocion registrada correctamenre'
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
