const Login = require('../models/login.model.js')
const nav = require('../models/breadcrumbs.model.js')

const formatearTelefono = (tel) => {
  const soloNumeros = tel.replace(/\D/g, '')
  if (soloNumeros.length === 10) {
    return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2, 6)}-${soloNumeros.slice(6)}`
  }
  return tel
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
    // --- LÓGICA COLABORADOR ---
    if (/^CL\d{8}$/i.test(telefono)) {
      const [rows] = await Login.fetchColaborador(telefono)
      const colaborador = rows[0]
      if (!colaborador) {
        return response.status(404).json({ error: 'ID de Colaborador no encontrado.' })
      }

      if (password) {
        if (password === colaborador.password) {
          request.session.isLoggedIn = true
          request.session.user = {
            id: colaborador.id_colaborador,
            nombre: colaborador.nombre
          }
          request.session.rol = colaborador.id_rol

          const redirectUrl = colaborador.id_rol === 'Administrador'
            ? '/admin'
            : '/menu/menu'

          return response.status(200).json({ success: true, redirectUrl })
        }
        return response.status(401).json({ error: 'Contraseña incorrecta.' })
      }
      return response.status(200).json({ requirePassword: true })
    }

    // --- LÓGICA CLIENTE ---
    if (/^[\d\s-]{10,15}$/.test(telefono)) {
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
        debugCode: otpData.code
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
      debugCode: otpData.code,
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
  const { codigo } = request.body
  const telefono = request.session.pendingPhone

  if (!telefono) {
    return response.status(400).json({ error: 'Sesión expirada. Reinicia el proceso.' })
  }

  try {
    const client = await Login.findByPhoneForLogin(telefono)

    if (client && String(client.codigoVerificacion) === String(codigo)) {
      const ahora = new Date()
      if (ahora > new Date(client.expiracionVerificacion)) {
        await Login.deleteVerificationCode(telefono)
        return response.status(400).json({ error: 'El código ha expirado. Genera uno nuevo.' })
      }

      await Login.deleteVerificationCode(telefono)
      request.session.isLoggedIn = true
      request.session.rol = client.rol
      request.session.cliente = { nombre: client.Nombre, telefono: client.telefono, genero: client.genero, visitas: client.visitasActual, username: client.username || 0 }
      delete request.session.pendingPhone
      return response.status(200).json({
        success: true,
        redirectUrl: '/menu/menu'
      })
    }

    return response.status(400).json({ error: 'El código de verificación es incorrecto.' })
  } catch (error) {
    console.error('ERROR EN postVerifyOtp:', error)
    return response.status(500).json({
      redirectUrl: '/menu/menu?authError=database'
    })
  };
}

const issueOtpForClient = async (telefono) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expirationDate = new Date(Date.now() + (15 * 60 * 1000))
  await Login.updateVerificationCodeByPhone(telefono, otpCode, expirationDate)
  console.log(`\n[TEST] OTP para ${telefono}: ${otpCode}\n`)
  return { code: otpCode, expires: expirationDate }
}

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
