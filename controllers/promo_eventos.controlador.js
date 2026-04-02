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

exports.getPromotionsPage = async (req, res, next) => {
  try {
    const [[categorias], [tipos]] = await Promise.all([
      Promociones.fetchCategorías(),
      Promociones.fetchTipo()
    ])

    res.render('admin/promotions', {
      lista_categorias: categorias,
      lista_tipos: tipos,
      path: '/promociones'
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
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

exports.getFilterProductos = async (req, res, next) => {
  try {
    const { categoria, tipo } = req.query
    const [productos] = await Promociones.fetchProductos(categoria, tipo)
    res.status(200).json({
      success: true,
      data: productos
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.postRegistrarPromotions = (req, res, next) => {
  const { nombre, descuento, condicion, fechaInicio, fechaFinal, productos } = req.body
  
  if (!nombre || descuento === undefined || !condicion || !fechaInicio || !fechaFinal) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios para registrar la promoción.'
    })
  }

  const numeroId = Math.floor(Math.random() * 90000000) + 10000000
  const id = `PR${numeroId}`
  const activo = true
  const descuentoDecimal = descuento / 100

  const nuevaPromocion = new Promociones(
    id, nombre, descuentoDecimal, condicion, activo, fechaInicio, fechaFinal
  )

  nuevaPromocion.save()
    .then(() => {
      if (productos && productos.length > 0) {
        const idsProductos = productos.map(p => p.id)
        return Promociones.guardarProductosPromocion(id, idsProductos)
      }
    })
    .then(() => {
      res.status(200).json({
        success: true,
        message: 'Promoción registrada correctamente'
      })
    })
    .catch((error) => {
      console.log('Error al guardar datos:', error)
      res.status(500).json({
        success: false,
        message: 'Error al guardar la promoción'
      })
    })
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
}
