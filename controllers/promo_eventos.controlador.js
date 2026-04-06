const Eventos = require('../models/eventos.model')
const Promociones = require('../models/promociones.model')

const obtenerDescuentoDecimal = (descuento) => {
  if (descuento === '' || descuento === null || typeof descuento === 'undefined') {
    return 0
  }

  const descuentoNumero = Number(descuento)

  if (Number.isNaN(descuentoNumero)) {
    return null
  }

  return descuentoNumero / 100
}

const obtenerIdsProductos = (productos = []) => {
  if (!Array.isArray(productos)) {
    return []
  }

  return [...new Set(productos.map(producto => producto.id).filter(Boolean))]
}

const validarDatosPromocion = ({ nombre, descuento, condicion, fechaInicio, fechaFinal }) => {
  if (!nombre || !nombre.trim() || !condicion || !condicion.trim() || !fechaInicio || !fechaFinal) {
    return 'Faltan datos obligatorios para guardar la promoción.'
  }

  const descuentoNumero = Number(descuento || 0)

  if (Number.isNaN(descuentoNumero) || descuentoNumero < 0 || descuentoNumero > 100) {
    return 'El descuento debe ser un número entre 0 y 100.'
  }

  if (new Date(fechaInicio) > new Date(fechaFinal)) {
    return 'La fecha de inicio no puede ser posterior a la fecha final.'
  }

  return null
}

const construirRespuestaPromocion = async (idPromocion) => {
  const [promociones] = await Promociones.fetchById(idPromocion)
  const [productos] = await Promociones.fetchProductosPromocion(idPromocion)

  if (promociones.length === 0) {
    return null
  }

  return {
    ...promociones[0],
    productos: productos.map(producto => ({
      id: producto.ID_Producto,
      nombre: producto.Nombre
    }))
  }
}

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
      success: false,
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

exports.postRegistrarPromotions = async (req, res, next) => {
  try {
    const { nombre, descuento, condicion, fechaInicio, fechaFinal, productos, activo } = req.body
    const errorValidacion = validarDatosPromocion({
      nombre,
      descuento,
      condicion,
      fechaInicio,
      fechaFinal
    })

    if (errorValidacion) {
      return res.status(400).json({
        success: false,
        message: errorValidacion
      })
    }

    const descuentoDecimal = obtenerDescuentoDecimal(descuento)

    if (descuentoDecimal === null) {
      return res.status(400).json({
        success: false,
        message: 'El descuento enviado no es válido.'
      })
    }

    const numeroId = Math.floor(Math.random() * 90000000) + 10000000
    const id = `PR${numeroId}`
    const nuevaPromocion = new Promociones(
      id,
      nombre.trim(),
      descuentoDecimal,
      condicion.trim(),
      typeof activo === 'undefined' ? true : Boolean(activo),
      fechaInicio,
      fechaFinal
    )

    await nuevaPromocion.save()

    const idsProductos = obtenerIdsProductos(productos)
    await Promociones.guardarProductosPromocion(id, idsProductos)

    res.status(200).json({
      success: true,
      message: 'Promoción registrada correctamente.'
    })
  } catch (error) {
    console.log('Error al guardar datos:', error)
    res.status(500).json({
      success: false,
      message: 'Error al guardar la promoción.'
    })
  }
}

exports.getPromotionDetail = async (req, res, next) => {
  try {
    const { idPromocion } = req.params
    const promocion = await construirRespuestaPromocion(idPromocion)

    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'La promoción solicitada no existe.'
      })
    }

    res.status(200).json({
      success: true,
      data: promocion
    })
  } catch (error) {
    console.log('Error al obtener detalle de promoción:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener el detalle de la promoción.'
    })
  }
}

exports.putUpdatePromotion = async (req, res, next) => {
  try {
    const { idPromocion } = req.params
    const { nombre, descuento, condicion, fechaInicio, fechaFinal, productos, activo } = req.body
    const errorValidacion = validarDatosPromocion({
      nombre,
      descuento,
      condicion,
      fechaInicio,
      fechaFinal
    })

    if (errorValidacion) {
      return res.status(400).json({
        success: false,
        message: errorValidacion
      })
    }

    const promocionActual = await construirRespuestaPromocion(idPromocion)

    if (!promocionActual) {
      return res.status(404).json({
        success: false,
        message: 'La promoción que intentas modificar no existe.'
      })
    }

    const descuentoDecimal = obtenerDescuentoDecimal(descuento)

    if (descuentoDecimal === null) {
      return res.status(400).json({
        success: false,
        message: 'El descuento enviado no es válido.'
      })
    }

    await Promociones.updatePromocion(idPromocion, {
      nombre: nombre.trim(),
      descuento: descuentoDecimal,
      condiciones: condicion.trim(),
      activo: Boolean(activo),
      fechaInicio,
      fechaFinal
    })

    const idsProductos = obtenerIdsProductos(productos)
    await Promociones.reemplazarProductosPromocion(idPromocion, idsProductos)

    const promocionActualizada = await construirRespuestaPromocion(idPromocion)

    res.status(200).json({
      success: true,
      message: 'Promoción actualizada correctamente.',
      data: promocionActualizada
    })
  } catch (error) {
    console.log('Error al actualizar promoción:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo actualizar la promoción.'
    })
  }
}

exports.patchDeactivatePromotion = async (req, res, next) => {
  try {
    const { idPromocion } = req.params
    const promocion = await construirRespuestaPromocion(idPromocion)

    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'La promoción que intentas desactivar no existe.'
      })
    }

    const promocionActiva = promocion.Activo === true || promocion.Activo === 1 || promocion.Activo === '1'

    if (!promocionActiva) {
      return res.status(200).json({
        success: true,
        message: 'La promoción ya se encuentra desactivada.'
      })
    }

    await Promociones.desactivarPromocion(idPromocion)

    res.status(200).json({
      success: true,
      message: 'Promoción desactivada correctamente.'
    })
  } catch (error) {
    console.log('Error al desactivar promoción:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo desactivar la promoción.'
    })
  }
}

exports.deletePromotion = async (req, res, next) => {
  try {
    const { idPromocion } = req.params
    const promocion = await construirRespuestaPromocion(idPromocion)

    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'La promoción que intentas eliminar no existe.'
      })
    }

    const validacion = await Promociones.validarEliminacion(idPromocion)

    if (!validacion.eliminable) {
      return res.status(403).json({
        success: false,
        message: `La promoción no puede eliminarse. ${validacion.restricciones.join(' ')}`
      })
    }

    await Promociones.deletePromocion(idPromocion)

    res.status(200).json({
      success: true,
      message: 'Promoción eliminada correctamente.'
    })
  } catch (error) {
    console.log('Error al eliminar promoción:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo eliminar la promoción.'
    })
  }
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
}
