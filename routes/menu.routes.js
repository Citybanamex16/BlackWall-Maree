const express = require('express')
const router = express.Router()
const menuControlador = require('../controllers/menu.controlador.js')
const isAdmin = require('../middleware/isAdmin.js')
const isAdminOrCollaborator = require('../middleware/isAdminOrCollaborator.js')

// Rutas Menu cliente
router.get('/menu', menuControlador.getMenu)
router.get('/menuData', menuControlador.getMenuData)
router.get('/orden', menuControlador.getOrden)
router.get('/sucursales', menuControlador.getMapaSucursales)
router.get('/consultaplatillo', menuControlador.getPlatillo)
router.get('/consultarPromosMenu', menuControlador.getMenuPromos)
router.post('/agregaritem', menuControlador.agregarItem)
router.post('/pedidos/validar', menuControlador.contextoUsuario, menuControlador.validarPedido)
router.post('/pedidos/confirmar', menuControlador.confirmarPedido)

// Productos Personalizados
router.get('/categorias', menuControlador.getCategorías)
router.get('/ingActivos', menuControlador.getIngredientesActivos)

// Sección de Mapa
router.get('/Sucursales/getAll', menuControlador.getAllSucursales)

// Rutas Admin
router.get('/productos', isAdminOrCollaborator, menuControlador.getProducts)
router.get('/productosCatalog', isAdminOrCollaborator, menuControlador.getProductsCatalog)
router.get('/productosTipos', isAdmin, menuControlador.getTypes)
router.get('/formsTipoPlatillo', isAdmin, menuControlador.getCategorys)
router.get('/formsRegistraPlatillo', isAdmin, menuControlador.getProductfieldsAndIngredientes)
router.post('/registerNewProduct', isAdmin, menuControlador.postNewProduct)
router.put('/modifProduct/:id', isAdmin, menuControlador.postModifProduct)
// Eliminar Producto
router.delete('/eliminarProducto', isAdmin, menuControlador.deleteProducto)
router.put('/desactivarProducto', isAdmin, menuControlador.putDesactivarProducto)

// Rutas Global: Rutas utilizadas por cualquier CU, devuelven información general
router.get('/globalAdminIngredientes', isAdmin, menuControlador.getIngredientesFullCatalog)

module.exports = router
