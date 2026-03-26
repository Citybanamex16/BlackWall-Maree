const Eventos = require('../models/eventos.model')

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
    const [productos] = await Eventos.fetchAllProductos()

    res.status(200).json({
      success: true,
      data: {
        promociones: promos,
        royalties,
        productos
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los catálogos'
    })
  }
}

exports.getPromotions = (req, res, next) => {
  res.render('admin/promotions')
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
}
