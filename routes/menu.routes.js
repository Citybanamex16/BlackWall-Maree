const express = require('express')
const router = express.Router()
const menuControlador = require('../controllers/menu.controlador.js')

// Rutas Menu cliente
router.get('/menu', menuControlador.getMenu)
router.get('/menuData', menuControlador.getMenuData)
router.get('/orden', menuControlador.getOrden)
router.get('/sucursales', menuControlador.getMapaSucursales)
router.get('/consultaplatillo', menuControlador.getPlatillo)
router.get('/consultarPromosMenu', menuControlador.getMenuPromos)
router.post('/agregaritem', menuControlador.agregarItem)
router.post('/pedidos/validar', menuControlador.contextoUsuario ,menuControlador.validarPedido)
router.post('/pedidos/confirmar', menuControlador.confirmarPedido)

//FeedbackCliente
router.post('/feedback/Nuevo', menuControlador.postNewFeedback)

// Productos Personalizados
router.get('/categorias', menuControlador.getCategorías)
router.get('/ingActivos', menuControlador.getIngredientesActivos)

// Sección de Mapa
router.get('/Sucursales/getAll', menuControlador.getAllSucursales)

// Rutas Admin
router.get('/productos', menuControlador.getProducts)
router.get('/productosCatalog', menuControlador.getProductsCatalog)
router.get('/productosTipos', menuControlador.getTypes)
router.get('/formsTipoPlatillo', menuControlador.getCategorys)
router.get('/formsRegistraPlatillo', menuControlador.getProductfieldsAndIngredientes)
router.post('/registerNewProduct', menuControlador.postNewProduct)
router.put('/modifProduct/:id', menuControlador.postModifProduct)
// Eliminar Producto
router.delete('/eliminarProducto', menuControlador.deleteProducto)
router.put('/desactivarProducto', menuControlador.putDesactivarProducto)

// Rutas Global: Rutas utilizadas por cualquier CU, devuelven información general
router.get('/globalAdminIngredientes', menuControlador.getIngredientesFullCatalog)

module.exports = router
