const express = require('express')
const router = express.Router()
const menuControlador = require('../controllers/menu.controlador.js')
const feedBackControlador = require('../controllers/feedback.controlador.js')

// Rutas Menu cliente
router.get('/menu', menuControlador.getMenu)
router.get('/menuData', menuControlador.getMenuData)
router.get('/orden', menuControlador.getOrden)
router.get('/consultaplatillo', menuControlador.getPlatillo)
router.get('/consultarPromosMenu', menuControlador.getMenuPromos)
router.post('/agregaritem', menuControlador.agregarItem)
router.post('/pedidos/validar', menuControlador.validarPedido)
router.post('/pedidos/confirmar', menuControlador.confirmarPedido)


// Rutas Admin
router.get('/productos', menuControlador.getProducts)
router.get('/productosCatalog', menuControlador.getProductsCatalog)
router.get('/formsTipoPlatillo', menuControlador.getTypes)
router.get('/formsRegistraPlatillo', menuControlador.getProductfieldsAndIngredientes)
router.post('/registerNewProduct', menuControlador.postNewProduct)
router.put('/modifProduct/:id', menuControlador.postModifProduct) // ¡ Ese es PUT !
// Eliminar Producto
router.delete('/eliminarProducto', menuControlador.deleteProducto)
router.put('/desactivarProducto', menuControlador.putDesactivarProducto)

// rutas feedback
router.get('/feedback', feedBackControlador.getFeedback)
router.get('/feedbackCatalog', feedBackControlador.getFeedbackCatalog)

// Rutas Global: Rutas utilizadas por cualquier CU, devuelven información general
router.get('/globalAdminIngredientes', menuControlador.getIngredientesFullCatalog)

module.exports = router
