const express = require('express')
const router = express.Router()
const menuControlador = require('../controllers/menu.controlador.js')

router.get('/menu', menuControlador.getMenu)
router.get('/orden', menuControlador.getOrden)
router.get('/consultaplatillo', menuControlador.getPlatillo)
router.post('/agregaritem', menuControlador.agregarItem)
router.post('/pedidos/validar', menuControlador.validarPedido)
router.post('/pedidos/confirmar', menuControlador.confirmarPedido)

module.exports = router
