const Eventos = require('../models/eventos.model')
const Promociones = require('../models/promociones.model')

function normalizarIds (values) {
  if (!Array.isArray(values)) {
    return []
  }

  return [...new Set(
    values
      .map(value => String(value || '').trim())
      .filter(Boolean)
  )]
}

function validarDatosEvento (body) {
  const nombre = String(body.nombre || '').trim()
  const descripcion = String(body.descripcion || '').trim()
  const fechaInicio = String(body.fechaInicio || '').trim()
  const fechaFin = String(body.fechaFin || '').trim()
  const promociones = normalizarIds(body.promociones)
  const productos = normalizarIds(body.productos)

  if (!nombre || !descripcion || !fechaInicio || !fechaFin) {
    return {
      valido: false,
      message: 'Faltan datos obligatorios del evento.'
    }
  }

  if (fechaFin < fechaInicio) {
    return {
      valido: false,
      message: 'La fecha de fin no puede ser menor a la fecha de inicio.'
    }
  }

  return {
    valido: true,
    data: {
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      promociones,
      productos
    }
  }
}

function parseActivo (value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 1 || value === '1' || value === 'true') {
    return true
  }

  if (value === 0 || value === '0' || value === 'false') {
    return false
  }

  return null
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
      success: false,
      message: 'No se pudo hacer el envio de eventos'
    })
  }
}

exports.getEventoDetailAPI = async (req, res, next) => {
  const idEvento = String(req.params.id || '').trim()

  if (!idEvento) {
    return res.status(400).json({
      success: false,
      message: 'ID de evento invalido.'
    })
  }

  try {
    const [[eventos], [promociones], [productos], [promocionesRelacionadas], [productosRelacionados]] = await Promise.all([
      Eventos.fetchById(idEvento),
      Eventos.fetchAllPromociones(),
      Eventos.fetchAllProductos(),
      Eventos.fetchPromocionIdsByEvento(idEvento),
      Eventos.fetchProductoIdsByEvento(idEvento)
    ])

    const evento = eventos[0]

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento no existe.'
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        evento,
        catalogos: {
          promociones,
          productos
        },
        seleccionados: {
          promociones: promocionesRelacionadas.map(item => item.ID_Promocion),
          productos: productosRelacionados.map(item => item.ID_Producto)
        }
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'No se pudo cargar la informacion del evento.'
    })
  }
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
      message: 'Error al obtener los catalogos'
    })
  }
}

exports.postRegistrarEvento = async (req, res, next) => {
  const validacion = validarDatosEvento(req.body)

  if (!validacion.valido) {
    return res.status(400).json({
      success: false,
      message: validacion.message
    })
  }

  try {
    const { nombre, descripcion, fechaInicio, fechaFin, promociones, productos } = validacion.data
    const nuevoEvento = new Eventos(nombre, descripcion, fechaInicio, fechaFin, promociones, productos)
    await nuevoEvento.save()

    return res.status(200).json({
      success: true,
      message: 'Evento nuevo registrado correctamente.'
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Evento nuevo no registrado por algun error'
    })
  }
}

exports.putActualizarEvento = async (req, res, next) => {
  const idEvento = String(req.params.id || '').trim()

  if (!idEvento) {
    return res.status(400).json({
      success: false,
      message: 'ID de evento invalido.'
    })
  }

  const validacion = validarDatosEvento(req.body)

  if (!validacion.valido) {
    return res.status(400).json({
      success: false,
      message: validacion.message
    })
  }

  try {
    const [eventos] = await Eventos.fetchById(idEvento)
    const eventoActual = eventos[0]

    if (!eventoActual) {
      return res.status(404).json({
        success: false,
        message: 'El evento no existe.'
      })
    }

    const resultado = await Eventos.updateById(idEvento, {
      ...validacion.data,
      activoActual: eventoActual.Activo
    })

    return res.status(200).json({
      success: true,
      message: 'Evento actualizado correctamente.',
      data: {
        idEvento,
        activo: resultado.activo
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'No fue posible actualizar el evento.'
    })
  }
}

exports.putEstadoEvento = async (req, res, next) => {
  const idEvento = String(req.params.id || '').trim()
  const activo = parseActivo(req.body.activo)

  if (!idEvento) {
    return res.status(400).json({
      success: false,
      message: 'ID de evento invalido.'
    })
  }

  if (activo === null) {
    return res.status(400).json({
      success: false,
      message: 'Estado de evento invalido.'
    })
  }

  try {
    const [eventos] = await Eventos.fetchById(idEvento)
    const evento = eventos[0]

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento no existe.'
      })
    }

    if (Boolean(Number(evento.Activo)) === activo) {
      return res.status(409).json({
        success: false,
        message: activo ? 'El evento ya esta activo.' : 'El evento ya esta inactivo.'
      })
    }

    const [resultado] = await Eventos.updateStatusById(idEvento, activo)

    if (!resultado || resultado.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'No fue posible actualizar el estado del evento.'
      })
    }

    return res.status(200).json({
      success: true,
      message: activo ? 'Evento activado correctamente.' : 'Evento desactivado correctamente.',
      data: {
        idEvento,
        activo
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar el estado del evento.'
    })
  }
}

exports.deleteEvento = async (req, res, next) => {
  const idEvento = String(req.params.id || '').trim()

  if (!idEvento) {
    return res.status(400).json({
      success: false,
      message: 'ID de evento invalido.'
    })
  }

  try {
    const [eventos] = await Eventos.fetchById(idEvento)
    const evento = eventos[0]

    if (!evento) {
      return res.status(404).json({
        success: false,
        message: 'El evento no existe.'
      })
    }

    const [resultado] = await Eventos.eliminarById(idEvento)

    if (!resultado || resultado.affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: 'No fue posible eliminar el evento.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Evento eliminado correctamente.',
      data: {
        idEvento,
        accion: 'eliminar'
      }
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el evento.'
    })
  }
}

exports.getPromotionsPage = async (req, res, next) => {
  try {
    const [[categorias], [tipos]] = await Promise.all([
      Promociones['fetchCategor\u00edas'](),
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
      message: 'No se pudo hacer el envio de promociones'
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
      message: 'Faltan datos obligatorios para registrar la promocion.'
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
        message: 'Promocion registrada correctamente'
      })
    })
    .catch((error) => {
      console.log('Error al guardar datos:', error)
      res.status(500).json({
        success: false,
        message: 'Error al guardar la promocion'
      })
    })
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
}
