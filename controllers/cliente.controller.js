// Modulos nativos
// const path = require('path')

// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
const Cliente = require('../models/cliente.model.js')

// Recuerden que automaticamente cuando haces render Express busca en Views
// Si esta dentro de una subcarpeta de Views hay que decirle en cual

exports.getMenu = (request, response, next) => {
  response.render('cliente/menu')
}

exports.getPromos = (req, res, nex) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  res.render('cliente/promotions', { breadcrumbs })
}

exports.getEventos = (req, res, nex) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  res.render('cliente/eventos', { breadcrumbs })
}

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
