const Login = require('../models/login.model.js')
const nav = require('../models/breadcrumbs.model.js')
const { sendOTP } = require('../util/twilio.js')
const bcrypt = require('bcryptjs')

const isBcryptHash = (value = '') => /^\$2[aby]\$\d{2}\$/.test(value)

const formatearTelefono = (tel) => {
  const soloNumeros = tel.replace(/\D/g, '')
  if (soloNumeros.length === 10) {
    return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2, 6)}-${soloNumeros.slice(6)}`
  }
  return tel
}

const normalizarIdColaborador = (valor = '') => valor.trim().toUpperCase()
const esPosibleTelefonoCliente = (valor = '') => /^[\d\s-]{10,15}$/.test(valor)

const setEmployeeSession = (request, colaborador) => {
  request.session.isLoggedIn = true
  request.session.user = {
    id: colaborador.id_colaborador,
    nombre: colaborador.nombre,
    rol: colaborador.id_rol
  }
  request.session.rol = colaborador.id_rol
  request.session.name = colaborador.nombre

  delete request.session.cliente
  delete request.session.pendingPhone
}

const setClientSession = (request, client) => {
  request.session.isLoggedIn = true
  request.session.rol = client.rol
  request.session.name = client.Nombre
  request.session.cliente = {
    nombre: client.Nombre,
    telefono: client.telefono,
    genero: client.genero,
    visitas: client.visitasActual || 0
  }

  delete request.session.user
  delete request.session.pendingPhone
}

exports.logout = (request, response, next) => {
  request.session.destroy((err) => {
    if (err) return next(err)
    response.clearCookie('connect.sid')
    response.redirect('/cliente/menu')
  })
}

exports.getLogin = (request, response, next) => {
  response.render('cliente/login', {
    breadcrumbs: nav.getBreadcrumbs('LogIn'),
    mode: request.query.mode || 'login'
  })
}

exports.postLogin = async (request, response, next) => {
  const { telefono, password } = request.body

  try {
    const idColaborador = normalizarIdColaborador(telefono)
    // --- LÓGICA COLABORADOR ---
    if (!esPosibleTelefonoCliente(telefono)) {
      const [rows] = await Login.fetchColaborador(idColaborador)
      const colaborador = rows[0]
      if (!colaborador) {
        return response.status(404).json({ error: 'ID de Colaborador no encontrado.' })
      }

      if (password) {
        let passwordValido = false

        if (isBcryptHash(colaborador.password)) {
          passwordValido = await bcrypt.compare(password, colaborador.password)
        } else if (password === colaborador.password) {
          passwordValido = true

          const nuevoHash = await bcrypt.hash(password, 12)
          await Login.updateColaboradorPasswordHash(colaborador.id_colaborador, nuevoHash)
        }

        if (passwordValido) {
          setEmployeeSession(request, colaborador)

          const redirectUrl = colaborador.id_rol === 'Administrador'
            ? '/admin'
            : '/colaborador'

          return response.status(200).json({ success: true, redirectUrl })
        }
        return response.status(401).json({ error: 'Contraseña incorrecta.' })
      }
      return response.status(200).json({ requirePassword: true })
    }

    // --- LÓGICA CLIENTE ---
    if (esPosibleTelefonoCliente(telefono)) {
      const telefonoFormateado = formatearTelefono(telefono)
      const client = await Login.findByPhoneForLogin(telefonoFormateado)

      if (!client) {
        return response.status(404).json({
          error: 'Número no registrado. ¡Crea una cuenta!',
          action: 'switch_to_signup'
        })
      }

      const otpData = await issueOtpForClient(telefonoFormateado)
      request.session.pendingPhone = telefonoFormateado

      return response.status(200).json({
        otpStep: true,
      })
    }

    return response.status(400).json({ error: 'Formato inválido.' })
  } catch (error) {
    console.error('ERROR EN postLogin:', error)
    return response.status(500).json({
      redirectUrl: '/menu/menu?authError=database'
    })
  }
}

exports.postSignUp = async (request, response, next) => {
  const { telefono, nombre, genero, birthday, mail, username } = request.body
  const telefonoSoloNumeros = telefono.replace(/\D/g, '')

  if (telefonoSoloNumeros.length !== 10) {
    return response.status(400).json({ error: 'El teléfono debe tener exactamente 10 dígitos numéricos.' })
  }

  try {
    const telefonoFormateado = formatearTelefono(telefonoSoloNumeros)
    await Login.save({ telefono: telefonoFormateado, nombre, genero, birthday, mail, username })

    const otpData = await issueOtpForClient(telefonoFormateado)
    request.session.pendingPhone = telefonoFormateado

    return response.status(201).json({
      success: true,
      otpStep: true,
      message: '¡Cuenta creada con éxito!'
    })
  } catch (error) {
    console.error('ERROR EN postSignUp:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      return response.status(409).json({
        error: 'Ya existe un Usuario con ese teléfono. Por favor inicia sesión',
        action: 'switch_to_login'
      })
    }
    return response.status(500).json({
      redirectUrl: '/menu/menu?authError=database'
    })
  }
}

// 4. ENDPOINT: VERIFICAR OTP
exports.postVerifyOtp = async (request, response, next) => {
  const { codigo } = request.body;
    const telefono = request.session.pendingPhone;

    if (!telefono) return response.status(400).json({ error: 'Sesión expirada.' });

    try {
        const esValido = await checkOTP(telefono, codigo);

        if (esValido) {
            const client = await Login.findByPhoneForLogin(telefono);
            setClientSession(request, client);
            return response.status(200).json({ success: true, redirectUrl: '/menu/menu' });
        }

        return response.status(400).json({ error: 'Código incorrecto o expirado.' });
    } catch (error) {
        return response.status(500).json({ error: 'Error en el servidor.' });
    }
};

const issueOtpForClient = async (telefono) => {
    // 1. Mandamos el SMS vía Twilio Verify
    const smsResult = await sendOTP(telefono);
    return smsResult;
};

// === Funciones que utiliza el equipo de Menu :) ==
exports.getSesion = (req, res) => {
  if (req.session.isLoggedIn && req.session.cliente) {
    return res.json({
      autenticado: true,
      rol: 'cliente',
      usuario: req.session.cliente
      // Devuelve: { nombre, telefono, genero, visitas }
    })
  }
  res.json({ autenticado: false })
}
