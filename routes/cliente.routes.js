// Configuración Express y enrutamiento

// TODOS ESTOS SON TIPO /cliente

const express = require('express')
const router = express.Router()
// const clienteControlador = require('../controllers/cliente.controller.js')

// Llamadas de controlador
const clienteControlador = require('../controllers/cliente.controller.js')
const loginControlador = require('../controllers/login.controlador.js')

// Middlewares de enrutamiento -> router.metodo('/url', controlador.metodo)

router.get('/menu', clienteControlador.getMenu)
router.get('/logout', loginControlador.logout)
router.get('/login', loginControlador.getLogin)
router.post('/login', loginControlador.postLogin)
router.post('/signup', loginControlador.postSignUp)
router.post('/login/verify', loginControlador.postVerifyOtp)

module.exports = router
