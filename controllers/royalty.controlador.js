// const { request } = require('express')
const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')
const QRCode = require('qrcode')

// Admin
exports.getRoyaltyAdmin = async (request, response, next) => {
  try {
    const [royalties] = await Royalty.fetchAll()
    console.log('Obtenemos los estados Royalty de la base de datos')
    response.render('admin/royalty', { royalties })
  } catch (error) {
    console.log(error)
    response.status(500).json({
      succes: false,
      message: 'No se pudo mandar los estados royalties'
    })
  }
}

exports.getRoyaltyAdminJSON = async (request, response, next) => {
  try {
    const [royalties] = await Royalty.fetchAll()
    response.status(200).json({
      succes: true,
      message: 'Éxito al obtener estados royalty',
      data: royalties
    })
  } catch (error) {
    console.log(error)
    response.status(500).json({
      succes: false,
      message: 'No se pudo mandar los estados royalties'
    })
  }
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

exports.updateRoyalty = async (request, response, next) => {
  try {
    const nombreOriginal = request.params.nombre
    const { nombre, prioridad, descripcion, minVisitas, maxVisitas } = request.body
    await Royalty.updateEstadoRoyalty(nombreOriginal, nombre, prioridad, descripcion, minVisitas, maxVisitas)
    response.status(200).json({
      success: true,
      message: 'Se han modificado los datos correctamente'
    })
  } catch (error) {
    console.log(error)
    next(error)
    response.status(500).json({
      success: false,
      message: 'No se pudo cambiar el estado royalty'
    })
  }
}

// Cliente
exports.getRoyaltyCli = async (request, response, next) => {
  if (!request.session.isLoggedIn) {
    return response.redirect('/cliente/login')
  }

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

    let qrCodeDataUrl = ''
    try {
      qrCodeDataUrl = await QRCode.toDataURL(telefono, {
        color: {
          dark: '#000000',
          light: '#0000'
        },
        width: 200,
        margin: 2
      })
    } catch (qrError) {
      console.error('Error generando QR:', qrError)
    }

    return response.render('cliente/royalty', {
      pageTitle: 'Mi Estado Royalty',
      breadcrumbs: nav.getBreadcrumbs('Royalty'),
      cliente: clienteInfo,
      qrCode: qrCodeDataUrl
    })
  } catch (error) {
    console.error('Error al cargar vista Royalty:', error)
    return response.redirect('/menu/menu?authError=database')
  }
}

exports.getRoyaltyDataAPI = async (request, response, next) => {
  if (!request.session.isLoggedIn || request.session.rol !== 'Usuario') {
    return response.status(401).json({ redirectUrl: '/cliente/login' })
  }

  if (request.session.rol !== 'Usuario') {
    return response.status(403).json({ redirectUrl: '/royalty/royaltyAdmin' })
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
      redirectUrl: '/menu/menu?authError=database'
    })
  }
}
