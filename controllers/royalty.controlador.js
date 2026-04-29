// const { request } = require('express')
const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')
const QRCode = require('qrcode')
const WalletModel = require('../models/googleWallet.model.js')
const AppleWallet = require('../models/appleWallet.model.js')
const path = require('path')
const fs = require('fs')

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

exports.getApplePass = async (request, response) => {
  if (!request.session.isLoggedIn || request.session.rol !== 'Usuario') {
    return response.redirect('/cliente/login')
  }

  const telefono = request.session.cliente.telefono
  const [[statusDataGoogle]] = await Royalty.fetchClienteStatusGoogle(telefono)

  try {
    const passBuffer = await AppleWallet.generarApplePass(
      telefono,
      statusDataGoogle.Nombre,
      statusDataGoogle.nivel,
      statusDataGoogle.Visitas_Actuales,
      statusDataGoogle.Max_Visitas
    )

    const fileName = `maree-${String(telefono).replace(/[^a-zA-Z0-9]/g, '')}.pkpass`
    response.setHeader('Content-Type', 'application/vnd.apple.pkpass')
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    response.send(passBuffer)
  } catch (err) {
    console.error('Error generando Apple Pass:', err)
    response.status(500).send('Error generando pase')
  }
}

exports.postRegistrarEstadoRoyalty = async (request, response, next) => {
  console.log('Body recibido:', request.body)
  const { nombre, prioridad, descripcion, minVisitas, maxVisitas, promociones, eventos } = request.body

  if (!nombre || prioridad === undefined || !descripcion || !minVisitas || !maxVisitas) {
    return response.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios para registrar Estado Royalty'
    })
  }
  try {
    const nuevoEstadoRoyalty = new Royalty(nombre, prioridad, descripcion, maxVisitas, minVisitas)
    await nuevoEstadoRoyalty.save()
    const promesas = []
    if (promociones && promociones.length > 0) {
      console.log('promociones recibidas:', promociones)
      const idsPromociones = promociones.map(p => p.id)
      console.log('ids extraídos:', idsPromociones)
      promesas.push(Royalty.guardarEstadoRoyaltyPromociones(nombre, idsPromociones))
    }
    if (eventos && eventos.length > 0) {
      const idsEventos = eventos.map(e => e.id)
      promesas.push(Royalty.guardarEstadoRoyaltyEventos(nombre, idsEventos))
    }
    await Promise.all(promesas)
    await WalletModel.crearLoyaltyClass(nombre, maxVisitas)
    response.status(200).json({
      success: true,
      message: 'Estado Royalty registrado correctamente'
    })
  } catch (error) {
    console.log('Error al guardar datos:', error)
    response.status(500).json({
      success: false,
      message: 'Error al guardar el estado royalty'
    })
  }
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

exports.deleteRoyalty = async (request, response, next) => {
  const nombre = request.params.nombre
  try {
    await Royalty.deleteRoyaltyBD(nombre)
    await WalletModel.eliminarLoyaltyClass(nombre)
    response.status(200).json({ mensaje: 'Borrado correctamente' })
  } catch (error) {
    console.log(error)
    next(error)
  }
}

exports.updateRoyalty = async (request, response, next) => {
  try {
    const nombreOriginal = request.params.nombre
    const { nombre, prioridad, descripcion, minVisitas, maxVisitas, promociones, eventos } = request.body
    await Royalty.updateEstadoRoyalty(nombreOriginal, nombre, prioridad, descripcion, minVisitas, maxVisitas)
    await Royalty.updatePromocionesRoyalty(nombre, promociones)
    await Royalty.updateEventosRoyalty(nombre, eventos)
    await WalletModel.actualizarLoyaltyClass(nombreOriginal, nombre, maxVisitas)
    await WalletModel.actualizarTarjetaPorNivel(nombreOriginal, nombre, null, maxVisitas)
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

// Registrar Visitas
exports.postProcesarEscaneo = async (request, response) => {
  const telefono = request.body.telefono

  if (!telefono) {
    return response.status(400).json({
      success: false,
      message: 'No se recibió el número telefónico'
    })
  }

  try {
    const [rows] = await Royalty.fetchClienteParaEscaneo(telefono)
    if (rows.length === 0) return response.status(404).json({ message: 'Cliente no encontrado' })

    const cliente = rows[0]

    // Matemática de los tokens
    const tokensGanados = Math.floor(cliente.visitas_totales / 8)
    const tokensDisponibles = tokensGanados - cliente.tokens_gastados
    const sellosActuales = cliente.visitas_totales % 8

    const visitasTotales = cliente.Visitas_Actuales || 0

    const [promocionesDisponibles] = await Royalty.fetchPromociones_royalties(cliente.Nombre_Royalty)

    return response.status(200).json({
      success: true,
      cliente: {
        id: cliente.Numero_Telefonico,
        nombre: cliente.Nombre || 'Cliente Marée',
        nivel: cliente.Nombre_Royalty,
        visitas: visitasTotales,
        sellosActuales,
        tokensDisponibles
      },
      premiosDisponibles: promocionesDisponibles
    })
  } catch (error) {
    console.log(error)
    response.status(500).json({ message: 'Error al procesar el escaneo' })
  }
}

exports.postRegistrarVisitaAdmin = async (request, response) => {
  const telefono = request.body.telefono

  try {
    await Royalty.registrarVisita(telefono)
    response.status(200).json({ success: true, message: 'Visita registrada con éxito' })
  } catch (error) {
    response.status(500).json({ success: false, message: 'Error al registrar visita' })
  }
}

exports.postCanjearPremio = async (request, response) => {
  const { telefono, idPromocion } = request.body

  try {
    await Royalty.registrarCanje(telefono, idPromocion)
    response.status(200).json({ success: true, message: 'Premio entregado correctamente' })
  } catch (error) {
    console.log(error)
    response.status(500).json({ success: false, message: 'Error al procesar el canje' })
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
    const [[statusDataGoogle]] = await Royalty.fetchClienteStatusGoogle(telefono)
    const clienteInfo = statusData[0]
    const nivelId = clienteInfo.nivel
    console.log(clienteInfo.Nombre)
    console.log(clienteInfo.visitas)
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
    if (statusDataGoogle.nivel == null) {
      statusDataGoogle.nivel = '¡Bienvenido!'
    }

    // Google Wallet
    const walletLink = await WalletModel.generarLinkWallet(
      telefono,
      statusDataGoogle.Nombre,
      statusDataGoogle.nivel,
      statusDataGoogle.Visitas_Actuales,
      statusDataGoogle.Max_Visitas
    )

    // Apple Wallet
    let applePassUrl = null
    try {
      const passBuffer = await AppleWallet.generarApplePass(
        telefono,
        statusDataGoogle.Nombre,
        statusDataGoogle.nivel,
        statusDataGoogle.Visitas_Actuales,
        statusDataGoogle.Max_Visitas
      )

      // Guardamos el buffer temporalmente y mandamos la ruta
      const fileName = `maree-${String(telefono).replace(/[^a-zA-Z0-9]/g, '')}.pkpass`
      const filePath = path.join('./passes', fileName)
      fs.writeFileSync(filePath, passBuffer)
      const host = request.headers.host
      const protocol = request.headers['x-forwarded-proto'] || 'https'
      applePassUrl = `${protocol}://${host}/passes/${fileName}`
    } catch (err) {
      console.error('Error generando Apple Pass:', err)
    }

    console.log('Wallet link generado:', walletLink)
    console.log('clienteInfo completo:', clienteInfo)

    return response.status(200).json({
      clienteNivel: nivelId,
      promociones: promotionsData,
      eventos: eventsData,
      walletLink,
      applePassUrl,
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
