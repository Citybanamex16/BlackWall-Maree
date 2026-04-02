const Eventos = require('../models/eventos.model')
const Promociones = require('../models/promociones.model')

exports.getEvents = (req, res, next) => {
  res.render('admin/events')
}

exports.getEventsAPI = async (req, res, next) => {
  try {
    const [eventos] = await Eventos.fetchAll()
    res.status(200).json({
      success: true,
      message: 'Envio de eventos exitosa',
      data: eventos
    })
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: 'No se pudo hacer el envío de eventos'
    })
  }
}

exports.postRegistrarEvento = (req, res, next) => {
  const { nombre, descripcion, fechaInicio, fechaFin, promociones, productos } = req.body

  if (!nombre || !descripcion || !fechaInicio || !fechaFin) {
    return res.status(400).json({
      status: 'error',
      message: 'Faltan datos obligatorios'
    })
  }
  const nuevoEvento = new Eventos(nombre, descripcion, fechaInicio, fechaFin, promociones, productos)

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
    const [productos] = await Eventos.fetchAllProductos()

    res.status(200).json({
      success: true,
      data: {
        promociones: promos,
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

exports.getPromotionsPage = (req, res, next) => {
  res.render('admin/promotions')
}

exports.getPromotionsAPI = async (req, res, next) => {
  try {
    const [promociones] = await Promociones.fetchAll()
    res.status(200).json({
      success: true,
      message: 'Envio de promociones exitosa',
      data: promociones
    })
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: 'No se pudo hacer el envío de promociones'
    })
  }
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
}
