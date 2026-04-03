// 1. UNIFICAMOS LOS MODELOS: Solo llamamos a login.model.js
const Login = require('../models/login.model.js')
const nav = require('../models/breadcrumbs.model.js')
// const bcrypt = require('bcryptjs') NO BORRAR

exports.logout = (request, response, next) => {
  console.log('Llamando a logout')
  request.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err)
      return next(err)
    }
    response.clearCookie('connect.sid')
    response.redirect('/cliente/menu')
  })
}

const buildLoginViewModel = (overrides = {}) => ({
  breadcrumbs: nav.getBreadcrumbs('LogIn'),
  error: null,
  success: null,
  telefono: '',
  nombre: '',
  genero: '',
  birthday: '',
  mail: '',
  otpStep: false,
  passwordStep: false,
  debugCode: null,
  mode: 'login',
  ...overrides
})

exports.getLogin = (request, response, next) => {
  const mode = request.query.mode || 'login'
  response.render('cliente/login', buildLoginViewModel({ mode }))
}

exports.postLogin = async (request, response, next) => {
  const { telefono, password } = request.body

  try {
    // --- LÓGICA DE COLABORADOR ---
    if (/^CL\d{8}$/i.test(telefono)) {
      const [rows] = await Login.fetchColaborador(telefono)
      const colaborador = rows[0]

      if (!colaborador) {
        return response.render('cliente/login', buildLoginViewModel({
          error: 'ID de Colaborador no encontrado o incorrecto.',
          telefono,
          mode: 'login'
        }))
      }

      if (password) {
        // Se usa ahora porque las contraseñas dummy son texto directo
        const doMatch = (password === colaborador.password)

        // const doMatch = await bcrypt.compare(password, colaborador.password); Se usa cuando se esten encriptando las contraseñas por ahora no

        if (doMatch) {
          request.session.isLoggedIn = true
          request.session.user = colaborador.nombre
          request.session.rol = colaborador.id_rol
          return response.redirect('/menu/menu')
        }
        return response.render('cliente/login', buildLoginViewModel({
          error: 'Contraseña incorrecta.',
          telefono,
          passwordStep: true,
          mode: 'login'
        }))
      }

      return response.render('cliente/login', buildLoginViewModel({
        telefono, passwordStep: true, mode: 'login'
      }))
    }

    // --- LÓGICA DE CLIENTE ---
    if (/^\d{10}$/.test(telefono)) {
      const client = await Login.findByPhoneForLogin(telefono)
      if (!client) {
        return response.render('cliente/login', buildLoginViewModel({
          error: 'Número no registrado. ¡Crea una cuenta!', telefono, mode: 'signup'
        }))
      }

      const otpData = await issueOtpForClient(telefono)
      request.session.pendingPhone = telefono

      return response.render('cliente/login', buildLoginViewModel({
        telefono, otpStep: true, debugCode: otpData.code
      }))
    }

    return response.render('cliente/login', buildLoginViewModel({
      error: 'Formato inválido.', telefono
    }))
  } catch (error) { next(error) }
}

exports.postSignUp = async (request, response, next) => {
  const { telefono, nombre, genero, birthday, mail } = request.body
  try {
    // Todo a través de Login
    await Login.save({ telefono, nombre, genero, birthday, mail })

    const otpData = await issueOtpForClient(telefono)
    request.session.pendingPhone = telefono

    return response.render('cliente/login', buildLoginViewModel({
      telefono,
      otpStep: true,
      debugCode: otpData.code,
      success: '¡Cuenta creada con éxito! Por favor verifica tu código.'
    }))
  } catch (error) {
    console.error('Error en SignUp:', error)
    let msg = 'Hubo un error al crear la cuenta. Intenta de nuevo.'
    if (error.code === 'ER_DUP_ENTRY') {
      msg = 'Este número de teléfono ya está registrado.'
    }

    return response.render('cliente/login', buildLoginViewModel({
      error: msg, mode: 'signup', telefono, nombre, genero, birthday, mail
    }))
  }
}

exports.postVerifyOtp = async (request, response, next) => {
  const { codigo } = request.body
  const telefono = request.session.pendingPhone

  if (!telefono) {
    return response.redirect('/cliente/login')
  }

  try {
    const client = await Login.findByPhoneForLogin(telefono)

    if (client && String(client.codigoVerificion) === String(codigo)) {
      const ahora = new Date()
      const fechaExpiracion = new Date(client.expiracionVerificacion)

      if (ahora > fechaExpiracion) {
        await Login.deleteVerificationCode(telefono)

        return response.render('cliente/login', buildLoginViewModel({
          error: 'El código ha expirado. Regresa para generar uno nuevo.',
          telefono,
          otpStep: true
        }))
      }

      await Login.deleteVerificationCode(telefono)

      request.session.isLoggedIn = true
      request.session.cliente = {
        nombre: client.nombre,
        telefono: client.telefono,
        genero: client.genero,
        visitas: client.visitasActual || 0
      }

      delete request.session.pendingPhone
      return response.redirect('/menu/menu')
    }

    return response.render('cliente/login', buildLoginViewModel({
      error: 'El código de verificación es incorrecto.',
      telefono,
      otpStep: true
    }))
  } catch (error) {
    next(error)
  }
}

const issueOtpForClient = async (telefono) => {
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
  const expirationDate = new Date(Date.now() + (15 * 60 * 1000))

  await Login.updateVerificationCodeByPhone(telefono, otpCode, expirationDate)

  console.log(`\n[TEST] OTP para ${telefono}: ${otpCode}\n`)

  return { code: otpCode, expires: expirationDate }
}
