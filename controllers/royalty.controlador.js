// const { request } = require('express')
const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')

// Admin
exports.getRoyaltyAdmin = (request, response, next) => {
  console.log('Obtenemos los estados Royalty de la base de datos')
  Royalty.fetchAll().then(([rows, fieldData]) => {
    console.log(fieldData)
    return response.render('/royalty/royaltyAdmin', {
      nombre: request.session.nombre,
      numero_prioridad: request.session.Número_de_prioridad,
      descripcion: request.session.descripcion,
      max_visitas: request.session.max_visitas,
      min_visitas: request.session.min_visitas,
      royalties: rows
    })
  }).catch((error) => {
    console.log(error)
    next(error)
  })
}

exports.deleteRoyalty = (request, response, next) => {
  const nombre = request.params.nombre
  Royalty.deleteRoyaltyBD(nombre).then(() => {
    response.status(200).json({ mensaje: 'Borrado correctamente' })
  }).catch((error) => {
    console.log(error)
    next(error)
  })
}

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('/royalty/royaltyAdmin')
}

// Cliente
exports.getRoyaltyCli = async (request, response, next) => {
  if (!request.session.isLoggedIn) {
    return response.render('cliente/login')
  }

  console.log('El rol exacto es:', `"${request.session.rol}"`)
  if (request.session.rol !== 'Usuario') {
    return response.redirect('/royalty/royaltyAdmin')
  }

  const telefono = request.session.cliente.telefono

  try {
    const [statusData] = await Royalty.fetchClientStatus(telefono)
    const clienteInfo = statusData[0]

    if (!clienteInfo) {
      return response.status(404).render('errores/404', { error: 'Información no encontrada.' })
    }
    return response.render('cliente/royalty', {
      pageTitle: 'Mi Estado Royalty',
      breadcrumbs: nav.getBreadcrumbs('Royalty'),
      cliente: clienteInfo
    })
  } catch (error) {
    console.error('Error al cargar vista Royalty:', error)
    next(error)
  }
}

exports.getRoyaltyDataAPI = async (request, response, next) => {
  if (!request.session.isLoggedIn || request.session.rol !== 'Usuario') {
    return response.status(403).json({ message: 'Acceso denegado' })
  }

  const telefono = request.session.cliente.telefono

  try {
    const [statusData] = await Royalty.fetchClientStatus(telefono)
    const clienteInfo = statusData[0]
    const nivelId = clienteInfo.nivel

    const [[promotionsData], [eventsData]] = await Promise.all([
      Royalty.fetchPromotions(nivelId),
      Royalty.fetchEvents(nivelId)
    ])

    return response.status(200).json({
      clienteNivel: nivelId,
      promociones: promotionsData,
      eventos: eventsData
    })
  } catch (error) {
    console.error(error)
    return response.status(500).json({
      message: 'Error al traer datos de nivel royalty de cliente',
      error
    })
  }
}
