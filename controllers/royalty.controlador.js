// const { request } = require('express')
const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')
const QRCode = require('qrcode')
const WalletModel = require('../models/googleWallet.model.js')

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
    await WalletModel.actualizarTarjetaPorNivel(nombreOriginal, nombre, maxVisitas)
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
        width: 340,
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

    const walletLink = await WalletModel.generarLinkWallet(
      telefono,
      clienteInfo.nivel,
      clienteInfo.visitas,
      clienteInfo.Max_Visitas
    )

    console.log('Wallet link generado:', walletLink)

    return response.status(200).json({
      clienteNivel: nivelId,
      promociones: promotionsData,
      eventos: eventsData,
      walletLink,
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
