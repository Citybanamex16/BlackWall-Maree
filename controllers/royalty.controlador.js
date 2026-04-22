/* eslint-env browser */

/* eslint-disable no-unused-vars */

// const { request } = require('express')
const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')
const WalletModel = require('../models/googleWallet.model.js')
const { request } = require('express')
const QRCode = require('qrcode')

// Admin
exports.getRoyaltyAdmin = async (request, response, next) => {
  try {
    // Obtenemos los royalties
    const [royalties] = await Royalty.fetchAll()
    for (const royalty of royalties) {
      // Obtenemos las promociones
      const [promociones] = await Royalty.fetchPromociones_royalties(royalty.Nombre_Royalty)
      royalty.promociones = promociones
      console.log(`${royalty.Nombre_Royalty}:`, promociones) // Para debuggear
      const [eventos] = await Royalty.fetchEventos_royalty(royalty.Nombre_Royalty)
      royalty.eventos = eventos
      console.log(`${royalty.Nombre_Royalty}:`, eventos)
    }
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

exports.postRegistrarEstadoRoyalty = (request, response, next) => {
  console.log('Body recibido:', request.body)
  const { nombre, prioridad, descripcion, minVisitas, maxVisitas, promociones, eventos } = request.body

  if (!nombre || prioridad === undefined || !descripcion || !minVisitas || !maxVisitas) {
    return response.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios para registrar Estado Royalty'
    })
  }

  const nuevoEstadoRoyalty = new Royalty(nombre, prioridad, descripcion, maxVisitas, minVisitas)

  nuevoEstadoRoyalty.save()
    .then(() => {
      const promesas = []
      if (promociones && promociones.length > 0) {
        const idsPromociones = promociones.map(p => p.id)
        promesas.push(Royalty.guardarEstadoRoyaltyPromociones(nombre, idsPromociones))
      }
      if (eventos && eventos.length > 0) {
        const idsEventos = eventos.map(e => e.id)
        promesas.push(Royalty.guardarEstadoRoyaltyEventos(nombre, idsEventos))
      }
      return Promise.all(promesas)
    })
    .then(() => {
      response.status(200).json({
        success: true,
        message: 'Estado Royalty registrado correctamente'
      })
    })
    .catch((error) => {
      console.log('Error al guardar datos:', error)
      response.status(500).json({
        success: false,
        message: 'Error al guardar el estado royalty'
      })
    })
}

exports.getFilterPromocionesEventos = async (request, response, next) => {
  try {
    const { promociones, eventos } = request.query
    const [productos] = await Royalty.fetchPromocionesEventos(promociones, eventos)
    response.status(200).json({
      success: true,
      data: productos
    })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.getTodasPromociones = async (request, response, next) => {
  try {
    const [todas] = await Royalty.fetchTodasPromociones()
    response.status(200).json({ success: true, data: todas })
  } catch (error) {
    console.log(error)
    response.status(500).json({ success: false })
  }
}

exports.getTodosEventos = async (request, response, next) => {
  try {
    const [todas] = await Royalty.fetchTodosEventos()
    response.status(200).json({ success: true, data: todas })
  } catch (error) {
    console.log(error)
    response.status(500).json({ success: false })
  }
}

exports.getRoyaltyAdminJSON = async (request, response, next) => {
  try {
    // Obtenemos los royalties
    const [royalties] = await Royalty.fetchAll()
    for (const royalty of royalties) {
      // guardamos las promociones
      const [promociones] = await Royalty.fetchPromociones_royalties(royalty.Nombre_Royalty)
      royalty.promociones = promociones
      const [eventos] = await Royalty.fetchEventos_royalty(royalty.Nombre_Royalty)
      royalty.eventos = eventos
    }
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
    const { nombre, prioridad, descripcion, minVisitas, maxVisitas, promociones, eventos } = request.body
    await Royalty.updateEstadoRoyalty(nombreOriginal, nombre, prioridad, descripcion, minVisitas, maxVisitas)
    await Royalty.updatePromocionesRoyalty(nombre, promociones)
    await Royalty.updateEventosRoyalty(nombre, eventos)
    // Actualizar WalletModel
    await WalletModel.actualizarTarjetaPorNivel(nombreOriginal, nombre, descripcion)
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

exports.getPromocionesParaModal = async (request, response, next) => {
  try {
    const nombre = request.params.nombre
    const [todas] = await Royalty.fetchTodasPromociones()
    const [asignadas] = await Royalty.fetchPromociones_royalties(nombre)
    console.log('asignadas raw:', asignadas)

    // IDs de las que ya tiene este royalty
    const idsAsignadas = asignadas.map(p => p.ID_promocion)

    response.status(200).json({
      success: true,
      data: { todas, idsAsignadas }
    })
  } catch (error) {
    console.log(error)
    response.status(500).json({ success: false })
  }
}

exports.getEventosParaModal = async (request, response, next) => {
  try {
    const nombre = request.params.nombre
    const [todas] = await Royalty.fetchTodosEventos()
    const [asignadas] = await Royalty.fetchEventos_royalty(nombre)
    console.log('asignadas raw: ', asignadas)

    const idsAsignadas = asignadas.map(p => p.ID_Evento)

    response.status(200).json({
      success: true,
      data: { todas, idsAsignadas }
    })
  } catch (error) {
    console.log(error)
    response.status(500).json({ success: true })
  }
}

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('/royalty/royaltyAdmin')
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

    if (!clienteInfo) return response.redirect('/menu/menu')

    let qrCodeDataUrl = ''
    try {
      qrCodeDataUrl = await QRCode.toDataURL(String(telefono), {
        color: { dark: '#000000', light: '#0000' },
        width: 200,
        margin: 2
      })
    } catch (err) {
      console.error('Error generando QR:', err)
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
  console.log('getRoyaltyDataAPI llamado')
  if (!request.session.isLoggedIn || request.session.rol !== 'Usuario') {
    return response.status(401).json({ redirectUrl: '/cliente/login' })
  }

  const telefono = request.session.cliente.telefono

  try {
    const [statusData] = await Royalty.fetchClientStatus(telefono)
    const clienteInfo = statusData[0]
    const nivelId = clienteInfo.nivel

    // Wallet
    const walletLink = await WalletModel.generarLinkWallet(
      telefono,
      clienteInfo.Nombre_Royalty,
      clienteInfo.Visitas,
      clienteInfo.maxVisitas
    )
    console.log('Cliente infor para wallet:', {
      nombre: clienteInfo.Nombre_Royalty,
      visitas: clienteInfo.visitas,
      max: clienteInfo.Max_Visitas
    })
    console.log('TOKEN JWT:', walletLink.split('/').pop())
    console.log('Wallet link generado:', walletLink)

    const [
      [promotionsData],
      [eventsData],
      [topBebidasResult],
      [topPlatillosResult],
      [favBebidasResult],
      [favPlatillosResult]
    ] = await Promise.all([
      Royalty.fetchPromotions(nivelId),
      Royalty.fetchEvents(nivelId),
      Royalty.fetchTopPlatillos('Bebidas'),
      Royalty.fetchTopPlatillos('Platillo'),
      Royalty.fetchFavoritosCliente(telefono, 'Bebidas'),
      Royalty.fetchFavoritosCliente(telefono, 'Platillo')
    ])

    return response.status(200).json({
      clienteNivel: nivelId,
      promociones: promotionsData,
      eventos: eventsData,
      walletLink, // wallet
      metrics: {
        global: {
          bebidas: topBebidasResult[0] || [],
          platillos: topPlatillosResult[0] || []
        },
        personal: {
          bebidas: favBebidasResult[0] || [],
          platillos: favPlatillosResult[0] || []
        }
      }
    })
  } catch (error) {
    console.error('Error en API de Royalty:', error)
    return response.status(500).json({
      redirectUrl: '/menu/menu?authError=database'
    })
  }
}
