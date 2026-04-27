const fs = require('fs')
const path = require('path')

const Eventos = require('../models/eventos.model')
const Promociones = require('../models/promociones.model')

const directorioPublico = path.join(__dirname, '..', 'public')
const directorioImagenesEventos = path.join(directorioPublico, 'uploads', 'eventos')
const prefijoImagenesEventos = '/uploads/eventos/'

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

const normalizarIdsRelacionados = (relaciones = []) => {
  if (typeof relaciones === 'string') {
    const relacionesTexto = relaciones.trim()

    if (!relacionesTexto) {
      return []
    }

    try {
      return normalizarIdsRelacionados(JSON.parse(relacionesTexto))
    } catch (error) {
      return [relacionesTexto]
    }
  }

  if (!Array.isArray(relaciones)) {
    return []
  }

  return [...new Set(
    relaciones
      .map(relacion => {
        if (typeof relacion === 'string' || typeof relacion === 'number') {
          return String(relacion).trim()
        }

        if (relacion && typeof relacion === 'object' && relacion.id) {
          return String(relacion.id).trim()
        }

        return ''
      })
      .filter(Boolean)
  )]
}

const normalizarBoolean = (valor, valorDefault = false) => {
  if (typeof valor === 'undefined') {
    return valorDefault
  }

  if (typeof valor === 'boolean') {
    return valor
  }

  if (typeof valor === 'number') {
    return valor === 1
  }

  if (typeof valor === 'string') {
    return ['true', '1', 'on', 'si'].includes(valor.trim().toLowerCase())
  }

  return Boolean(valor)
}

const obtenerRutaImagenEvento = (archivo) => {
  if (!archivo) {
    return null
  }

  return `/uploads/eventos/${archivo.filename}`
}

const resolverRutaImagenEvento = (rutaImagen) => {
  if (!rutaImagen || !String(rutaImagen).startsWith(prefijoImagenesEventos)) {
    return null
  }

  const rutaRelativa = String(rutaImagen).replace(/^\//, '')
  const rutaAbsoluta = path.resolve(directorioPublico, rutaRelativa)
  const directorioPermitido = path.resolve(directorioImagenesEventos)

  if (!rutaAbsoluta.startsWith(`${directorioPermitido}${path.sep}`)) {
    return null
  }

  return rutaAbsoluta
}

const eliminarImagenEvento = async (rutaImagen) => {
  const rutaAbsoluta = resolverRutaImagenEvento(rutaImagen)

  if (!rutaAbsoluta) {
    return
  }

  try {
    await fs.promises.unlink(rutaAbsoluta)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('No se pudo eliminar la imagen anterior del evento:', error)
    }
  }
}

const eliminarImagenSubida = async (archivo) => {
  await eliminarImagenEvento(obtenerRutaImagenEvento(archivo))
}

const validarDatosEvento = ({
  nombre,
  descripcion,
  fechaInicio,
  fechaFinal,
  promociones,
  productos
}) => {
  if (!nombre || !nombre.trim() || !descripcion || !descripcion.trim() || !fechaInicio || !fechaFinal) {
    return 'Faltan datos obligatorios para guardar el evento.'
  }

  if (new Date(fechaInicio) > new Date(fechaFinal)) {
    return 'La fecha de inicio no puede ser posterior a la fecha final.'
  }

  if (promociones.length === 0 && productos.length === 0) {
    return 'Debes vincular al menos una promoción o un producto al evento.'
  }

  return null
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

const validarPromocionesActivasEvento = async (idsPromociones) => {
  if (idsPromociones.length === 0) {
    return null
  }

  const [promocionesActivas] = await Eventos.fetchPromocionesActivasPorIds(idsPromociones)
  const idsActivos = new Set(promocionesActivas.map(promocion => String(promocion.id)))
  const promocionesNoElegibles = idsPromociones.filter(idPromocion => !idsActivos.has(String(idPromocion)))

  if (promocionesNoElegibles.length > 0) {
    return 'Todas las promociones vinculadas al evento deben estar activas.'
  }

  return null
}

const construirRespuestaEvento = (idEvento) => {
  return Eventos.fetchById(idEvento)
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

const estaActivoRegistro = (activo) => {
  return activo === true || activo === 1 || activo === '1'
}

exports.getEvents = (req, res, next) => {
  res.render('admin/events', {
    path: '/eventos'
  })
}

exports.getEventsAPI = async (req, res, next) => {
  try {
    const [eventos] = await Eventos.fetchAll()

    res.status(200).json({
      success: true,
      message: 'Envío de eventos exitoso.',
      data: eventos
    })
  } catch (error) {
    console.log('Error al obtener eventos:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener el catálogo de eventos.'
    })
  }
}

exports.getEventDetail = async (req, res, next) => {
  try {
    const { idEvento } = req.params
    const evento = await construirRespuestaEvento(idEvento)

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento solicitado no existe.'
      })
    }

    res.status(200).json({
      success: true,
      data: evento
    })
  } catch (error) {
    console.log('Error al obtener detalle de evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener el detalle del evento.'
    })
  }
}

exports.postRegistrarEvento = async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      promociones,
      productos,
      activo
    } = req.body

    const idsPromociones = normalizarIdsRelacionados(promociones)
    const idsProductos = normalizarIdsRelacionados(productos)
    const errorValidacion = validarDatosEvento({
      nombre,
      descripcion,
      fechaInicio,
      fechaFinal: fechaFin,
      promociones: idsPromociones,
      productos: idsProductos
    })

    if (errorValidacion) {
      await eliminarImagenSubida(req.file)
      return res.status(400).json({
        success: false,
        message: errorValidacion
      })
    }

    const errorPromociones = await validarPromocionesActivasEvento(idsPromociones)

    if (errorPromociones) {
      await eliminarImagenSubida(req.file)
      return res.status(400).json({
        success: false,
        message: errorPromociones
      })
    }

    const nuevoEvento = new Eventos({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fechaInicio,
      fechaFinal: fechaFin,
      imagen: obtenerRutaImagenEvento(req.file),
      activo: normalizarBoolean(activo, true),
      promociones: idsPromociones,
      productos: idsProductos
    })

    await nuevoEvento.save()

    res.status(200).json({
      success: true,
      message: 'Evento registrado correctamente.'
    })
  } catch (error) {
    await eliminarImagenSubida(req.file)
    console.log('Error al registrar evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo registrar el evento.'
    })
  }
}

exports.putUpdateEvent = async (req, res, next) => {
  try {
    const { idEvento } = req.params
    const {
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      promociones,
      productos,
      activo
    } = req.body

    const eventoActual = await construirRespuestaEvento(idEvento)

    if (!eventoActual) {
      return res.status(404).json({
        success: false,
        message: 'El evento que intentas modificar no existe.'
      })
    }

    const idsPromociones = normalizarIdsRelacionados(promociones)
    const idsProductos = normalizarIdsRelacionados(productos)
    const errorValidacion = validarDatosEvento({
      nombre,
      descripcion,
      fechaInicio,
      fechaFinal: fechaFin,
      promociones: idsPromociones,
      productos: idsProductos
    })

    if (errorValidacion) {
      await eliminarImagenSubida(req.file)
      return res.status(400).json({
        success: false,
        message: errorValidacion
      })
    }

    const errorPromociones = await validarPromocionesActivasEvento(idsPromociones)

    if (errorPromociones) {
      await eliminarImagenSubida(req.file)
      return res.status(400).json({
        success: false,
        message: errorPromociones
      })
    }

    const nuevaImagenEvento = obtenerRutaImagenEvento(req.file)
    const imagenEvento = nuevaImagenEvento || eventoActual.Imagen || null

    await Eventos.updateEvento(idEvento, {
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fechaInicio,
      fechaFinal: fechaFin,
      imagen: imagenEvento,
      activo: normalizarBoolean(activo),
      promociones: idsPromociones,
      productos: idsProductos
    })

    if (nuevaImagenEvento && eventoActual.Imagen && eventoActual.Imagen !== nuevaImagenEvento) {
      await eliminarImagenEvento(eventoActual.Imagen)
    }

    const eventoActualizado = await construirRespuestaEvento(idEvento)

    res.status(200).json({
      success: true,
      message: 'Evento actualizado correctamente.',
      data: eventoActualizado
    })
  } catch (error) {
    await eliminarImagenSubida(req.file)
    console.log('Error al actualizar evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo actualizar el evento.'
    })
  }
}

exports.patchDeactivateEvent = async (req, res, next) => {
  try {
    const { idEvento } = req.params
    const evento = await construirRespuestaEvento(idEvento)

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento que intentas desactivar no existe.'
      })
    }

    const eventoActivo = estaActivoRegistro(evento.Activo)

    if (!eventoActivo) {
      return res.status(200).json({
        success: true,
        message: 'El evento ya se encuentra desactivado.'
      })
    }

    await Eventos.desactivarEvento(idEvento)

    res.status(200).json({
      success: true,
      message: 'Evento desactivado correctamente.'
    })
  } catch (error) {
    console.log('Error al desactivar evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo desactivar el evento.'
    })
  }
}

exports.patchActivateEvent = async (req, res, next) => {
  try {
    const { idEvento } = req.params
    const evento = await construirRespuestaEvento(idEvento)

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento que intentas activar no existe.'
      })
    }

    const eventoActivo = estaActivoRegistro(evento.Activo)

    if (eventoActivo) {
      return res.status(200).json({
        success: true,
        message: 'El evento ya se encuentra activo.'
      })
    }

    await Eventos.activarEvento(idEvento)

    res.status(200).json({
      success: true,
      message: 'Evento activado correctamente.'
    })
  } catch (error) {
    console.log('Error al activar evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo activar el evento.'
    })
  }
}

exports.deleteEvent = async (req, res, next) => {
  try {
    const { idEvento } = req.params
    const evento = await construirRespuestaEvento(idEvento)

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento que intentas eliminar no existe.'
      })
    }

    await Eventos.deleteEvento(idEvento)

    res.status(200).json({
      success: true,
      message: 'Evento eliminado correctamente.'
    })
  } catch (error) {
    console.log('Error al eliminar evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo eliminar el evento.'
    })
  }
}

exports.getCatalogosEvento = async (req, res, next) => {
  try {
    const [[promociones], [productos]] = await Promise.all([
      Eventos.fetchAllPromociones(),
      Eventos.fetchAllProductos()
    ])

    res.status(200).json({
      success: true,
      data: {
        promociones,
        productos
      }
    })
  } catch (error) {
    console.log('Error al obtener catálogos de evento:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener los catálogos del evento.'
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
      message: 'Envío de promociones exitoso.',
      data: promociones
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'No se pudo obtener el catálogo de promociones.'
    })
  }
}

exports.getPromotionsMetricsAPI = async (req, res, next) => {
  try {
    const limite = Number.parseInt(req.query.limit, 10)
    const [promociones] = await Promociones.fetchPromocionesPopulares(limite)

    res.status(200).json({
      success: true,
      message: 'Metricas de promociones obtenidas correctamente.',
      data: promociones
    })
  } catch (error) {
    console.log('Error al obtener metricas de promociones:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudieron obtener las metricas de promociones.'
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

    const idsProductos = normalizarIdsRelacionados(productos)
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

    const idsProductos = normalizarIdsRelacionados(productos)
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

    const promocionActiva = estaActivoRegistro(promocion.Activo)

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

exports.patchActivatePromotion = async (req, res, next) => {
  try {
    const { idPromocion } = req.params
    const promocion = await construirRespuestaPromocion(idPromocion)

    if (!promocion) {
      return res.status(404).json({
        success: false,
        message: 'La promoción que intentas activar no existe.'
      })
    }

    const promocionActiva = estaActivoRegistro(promocion.Activo)

    if (promocionActiva) {
      return res.status(200).json({
        success: true,
        message: 'La promoción ya se encuentra activa.'
      })
    }

    await Promociones.activarPromocion(idPromocion)

    res.status(200).json({
      success: true,
      message: 'Promoción activada correctamente.'
    })
  } catch (error) {
    console.log('Error al activar promoción:', error)
    res.status(500).json({
      success: false,
      message: 'No se pudo activar la promoción.'
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
