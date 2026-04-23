// Configuración Express y enrutamiento

// TODOS ESTOS SON TIPO /cliente

const express = require('express')
const router = express.Router()
// const clienteControlador = require('../controllers/cliente.controller.js')

// Llamadas de controlador
const clienteControlador = require('../controllers/cliente.controller.js')
const loginControlador = require('../controllers/login.controlador.js')
const isAuth = require('../middleware/isAuth.js')

// Middlewares de enrutamiento -> router.metodo('/url', controlador.metodo)

router.get('/menu', clienteControlador.getMenu)
router.get('/logout', loginControlador.logout)
router.get('/login', loginControlador.getLogin)
router.post('/login', loginControlador.postLogin)
router.post('/signup', loginControlador.postSignUp)
router.post('/login/verify', loginControlador.postVerifyOtp)
router.get('/perfil', isAuth, clienteControlador.getProfile)
router.post('/perfil', isAuth, clienteControlador.postUpdateProfile)

/* Nuevos agregados por charly -> usados por Menu */
router.get('/promosCliente', clienteControlador.getPromosView)
router.get('/eventosCliente', clienteControlador.getEventos)
router.get('/promosClienteData', clienteControlador.getPRsData)
router.get('/Sesion', loginControlador.getSesion)

// Historial de pedidos del cliente
router.get('/historial', isAuth, clienteControlador.getHistorial)
router.get('/api/mis-ordenes', isAuth, clienteControlador.getClientOrders)
router.post('/api/orders/:id/cancel', isAuth, clienteControlador.postCancelClientOrder)


module.exports = router
