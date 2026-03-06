// Configuración Express y enrutamiento

// TODOS ESTOS SON TIPO /cliente

const express = require('express')
const router = express.Router()
// const clienteControlador = require('../controllers/cliente.controller.js')

// Llamadas de controlador
const clienteControlador = require('../controllers/cliente.controller.js')

// Middlewares de enrutamiento -> router.metodo('/url', controlador.metodo)

router.get('/', clienteControlador.getMenu)
router.get('/royalty', clienteControlador.getRoyalty)
router.get('/orden', clienteControlador.getOrden)
router.get('/login', clienteControlador.getLogin)
router.post('/login', clienteControlador.postLogin)

module.exports = router
