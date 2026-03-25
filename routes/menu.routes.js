const express = require('express')
const router = express.Router()
// const clienteControlador = require('../controllers/menu.controller.js')

// Llamadas de controlador
const menuControlador = require('../controllers/menu.controlador.js')

router.get('/menu', menuControlador.getMenu)
router.get('/orden', menuControlador.getOrden)

router.get('/consultaplatillo', menuControlador.getPlatillo)

module.exports = router
