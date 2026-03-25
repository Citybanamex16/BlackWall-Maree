const express = require('express')
const router = express.Router()
// const clienteControlador = require('../controllers/menu.controller.js')

// Llamadas de controlador
const menuControlador = require('../controllers/menu.controlador.js')

// Rutas Menu cliente
router.get('/menu', menuControlador.getMenu)
router.get('/orden', menuControlador.getOrden)
router.get('/consultaplatillo', menuControlador.getPlatillo)

// Rutas Admin
router.get('/productos', menuControlador.getProducts)
router.get('/formsTipoPlatillo', menuControlador.getModalForms)
router.get('/formsRegistraPlatillo', menuControlador.getProductRegisterForms)

module.exports = router
