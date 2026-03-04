// Configuración Express y enrutamiento
const express = require('express')
const router = express.Router()

// Llamadas de controlador
const clienteControlador = require('../controllers/cliente.controller.js')

// Middlewares de enrutamiento -> router.metodo('/url', controlador.metodo)

router.get('/', clienteControlador.get_main)

module.exports = router
