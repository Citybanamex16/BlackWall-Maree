const express = require('express')
const router = express.Router()
const menuControlador = require('../controllers/menu.controlador.js')

// Rutas Menu cliente
router.get('/menu', menuControlador.getMenu)
router.get('/menuData', menuControlador.getMenuData)
router.get('/orden', menuControlador.getOrden)
router.get('/consultaplatillo', menuControlador.getPlatillo)
router.post('/agregaritem', menuControlador.agregarItem)
router.post('/pedidos/validar', menuControlador.validarPedido)
router.post('/pedidos/confirmar', menuControlador.confirmarPedido)

// Rutas Admin
router.get('/productos', menuControlador.getProducts)
router.get('/productosCatalog', menuControlador.getProductsCatalog)
router.get('/formsTipoPlatillo', menuControlador.getTypes)
router.get('/formsRegistraPlatillo', menuControlador.getProductfieldsAndIngredientes)
router.post('/registerNewProduct', menuControlador.postNewProduct)

module.exports = router
