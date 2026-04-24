// Modulos nativos
// const path = require('path')

// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
const Eventos = require('../models/eventos.model.js')
const promos = require('../models/promociones.model.js')
const Cliente = require('../models/cliente.model.js')
const Pedido = require('../models/pedidos.model.js')

// Recuerden que automaticamente cuando haces render Express busca en Views
// Si esta dentro de una subcarpeta de Views hay que decirle en cual

// Func utilizadas por Modulo Menu :)
exports.getMenu = (request, response, next) => {
  response.render('cliente/menu', { datosCliente: request.session.cliente || null })
}

exports.getPromosView = (req, res, nex) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  res.render('cliente/promotions', { breadcrumbs })
}

exports.getEventos = async (req, res, nex) => {
  try {
    const [eventos] = await Eventos.fetchActiveForClient()

    res.render('cliente/eventos', {
      datosCliente: req.session.cliente || null,
      eventos,
      errorCarga: null
    })
  } catch (error) {
    console.error('Error al cargar eventos para cliente:', error)

    res.status(500).render('cliente/eventos', {
      datosCliente: req.session.cliente || null,
      eventos: [],
      errorCarga: 'No fue posible cargar los eventos activos por el momento.'
    })
  }
}

exports.getPRsData = async (req, res, nex) => {
  try {
    const SesionData = req.body
    console.log('Sesion data received: ', SesionData)
    const PRsData = await promos.getPRs('Super Fan')

    res.status(200).json({
      ok: true,
      message: 'PRs conseguidos de manera exitosa',
      PRs: PRsData
    })
  } catch (err) {
    console.log('Error desde backend: ', err)
    res.status(500).json({
      ok: false,
      message: 'PRs error en su obtención'
    })
  }
}

// Fin de Modulo menu

exports.getProfile = async (req, res, next) => {
  try {
    const numeroTelefonico = req.session.cliente.telefono

    const cliente = await Cliente.fetchByPhone(numeroTelefonico)

    if (!cliente) {
      return res.status(404).render('cliente/profile', {
        pageTitle: 'Mi perfil',
        cliente: null,
        error: 'No se encontró la información del cliente.',
        success: null
      })
    }

    return res.render('cliente/profile', {
      pageTitle: 'Mi perfil',
      cliente,
      error: null,
      success: null
    })
  } catch (error) {
    console.error('Error al cargar perfil del cliente:', error)

    return res.status(500).render('cliente/profile', {
      pageTitle: 'Mi perfil',
      cliente: null,
      error: 'No se pudo cargar la información del perfil.',
      success: null
    })
  }
}

exports.postUpdateProfile = async (req, res, next) => {
  try {
    const numeroTelefonico = req.session.cliente.telefono

    const nombre = String(req.body.nombre || '').trim()
    const correo = String(req.body.correo || '').trim()
    const genero = String(req.body.genero || '').trim()
    const fechaNacimiento = String(req.body.fecha_nacimiento || '').trim()

    if (!nombre || !correo || !genero || !fechaNacimiento) {
      return res.status(400).render('cliente/profile', {
        pageTitle: 'Mi perfil',
        cliente: {
          numero_telefonico: numeroTelefonico,
          nombre,
          correo,
          genero,
          fecha_nacimiento: fechaNacimiento
        },
        error: 'Datos incompletos o incorrectos.',
        success: null
      })
    }

    const clienteActual = await Cliente.fetchByPhone(numeroTelefonico)

    if (!clienteActual) {
      return res.status(404).render('cliente/profile', {
        pageTitle: 'Mi perfil',
        cliente: null,
        error: 'No se encontró la información del cliente.',
        success: null
      })
    }

    const sinCambios =
      clienteActual.nombre === nombre &&
      clienteActual.correo === correo &&
      clienteActual.genero === genero &&
      String(clienteActual.fecha_nacimiento).slice(0, 10) === fechaNacimiento

    if (sinCambios) {
      return res.status(200).render('cliente/profile', {
        pageTitle: 'Mi perfil',
        cliente: {
          numero_telefonico: numeroTelefonico,
          nombre,
          correo,
          genero,
          fecha_nacimiento: fechaNacimiento
        },
        error: null,
        success: 'No se detectaron cambios en la información.'
      })
    }

    const result = await Cliente.updatePersonalData(
      numeroTelefonico,
      nombre,
      correo,
      genero,
      fechaNacimiento
    )

    if (!result || result.affectedRows === 0) {
      return res.status(500).render('cliente/profile', {
        pageTitle: 'Mi perfil',
        cliente: {
          numero_telefonico: numeroTelefonico,
          nombre,
          correo,
          genero,
          fecha_nacimiento: fechaNacimiento
        },
        error: 'No fue posible actualizar los datos.',
        success: null
      })
    }

    const clienteActualizado = await Cliente.fetchByPhone(numeroTelefonico)

    return res.status(200).render('cliente/profile', {
      pageTitle: 'Mi perfil',
      cliente: clienteActualizado,
      error: null,
      success: 'Datos actualizados exitosamente.'
    })
  } catch (error) {
    console.error('Error al actualizar perfil del cliente:', error)

    return res.status(500).render('cliente/profile', {
      pageTitle: 'Mi perfil',
      cliente: {
        numero_telefonico: req.session.cliente.telefono,
        nombre: req.body.nombre || '',
        correo: req.body.correo || '',
        genero: req.body.genero || '',
        fecha_nacimiento: req.body.fecha_nacimiento || ''
      },
      error: 'No fue posible actualizar los datos.',
      success: null
    })
  }
}

exports.getHistorial = async (request, response, next) => {
  if (!request.session.cliente) return response.redirect('/cliente/login')
  const telefono = request.session.cliente.telefono
  try {
    const [ordenes] = await Pedido.fetchClientOrders(telefono)
    const ordenesConItems = await Promise.all(ordenes.map(async (o) => {
      const [items] = await Pedido.fetchItems(o.id_orden)
      return { ...o, items }
    }))
    response.render('cliente/historial', { ordenes: ordenesConItems, datosCliente: request.session.cliente })
  } catch (err) {
    next(err)
  }
}

exports.getClientOrders = async (request, response) => {
  if (!request.session.cliente) return response.status(401).json({ ok: false })
  const telefono = request.session.cliente.telefono
  try {
    const [ordenes] = await Pedido.fetchClientOrders(telefono)
    return response.json({ ok: true, ordenes })
  } catch {
    return response.status(500).json({ ok: false })
  }
}

exports.postCancelClientOrder = async (request, response) => {
  if (!request.session.cliente) return response.status(401).json({ ok: false, message: 'No autenticado.' })
  const telefono = request.session.cliente.telefono
  const { id } = request.params
  try {
    const result = await Pedido.cancelClientOrder(id, telefono)
    return response.json(result)
  } catch {
    return response.status(500).json({ ok: false, message: 'Error del servidor.' })
  }
}
