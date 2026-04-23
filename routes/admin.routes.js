const express = require('express')
const router = express.Router()

// Llamada a controlador de Admin
const adminControlador = require('../controllers/admin.controlador.js')
const feedBackControlador = require('../controllers/feedback.controlador.js')
const isAuth = require('../middleware/isAuth.js')
const isAdmin = require('../middleware/isAdmin.js')
// Dashboard principal
router.get('/', isAuth, isAdmin, adminControlador.getHub)
// Cada sección del dashboard uu que rico
// router.get('/ingredientes', adminControlador.getIngredientes)

router.get('/ingredientes', isAuth, isAdmin, adminControlador.getIngredients)
router.get('/productos', isAuth, isAdmin, adminControlador.getProducts)

router.get('/api/metricas-clientes', isAuth, isAdmin, adminControlador.getRoyaltyMetricsData)
router.get('/api/metricas-clientes/export', isAuth, isAdmin, adminControlador.exportRoyaltyMetricsCsv)
router.get('/metricas-productos', isAuth, isAdmin, adminControlador.getProductIngredientMetrics)
router.get('/api/metricas-productos', isAuth, isAdmin, adminControlador.getProductIngredientMetricsData)
router.get('/api/metricas-productos/export', isAuth, isAdmin, adminControlador.exportProductIngredientMetricsCsv)
router.get('/colaboradores', isAuth, isAdmin, adminControlador.getCollaborators)
router.get('/colaboradores/nuevo', isAuth, isAdmin, adminControlador.getNewCollaborator)
router.post('/colaboradores/nuevo', isAuth, isAdmin, adminControlador.postNewCollaborator)
router.get('/colaboradores/:id', isAuth, isAdmin, adminControlador.getCollaboratorsDetails)
router.post('/colaboradores/:id/baja', isAuth, isAdmin, adminControlador.postDarDeBajaColaborador)

router.get('/dias-habiles', isAuth, isAdmin, adminControlador.getDiasHabiles)
router.get('/dias-habiles', isAuth, isAdmin, adminControlador.getDiasHabiles)
router.post('/dias-habiles', isAuth, isAdmin, adminControlador.postDiasHabiles)

router.get('/ordenes', isAuth, isAdmin, adminControlador.getOrders)
router.get('/api/orders', isAuth, isAdmin, adminControlador.getOrdersJson)
router.get('/api/orders/:id/items', isAuth, isAdmin, adminControlador.getOrderItems)
router.post('/api/orders/:id/cancel', isAuth, isAdmin, adminControlador.cancelActiveOrder)
router.get('/promociones', isAuth, isAdmin, adminControlador.getPromotions)
router.get('/eventos', isAuth, isAdmin, adminControlador.getEvents)
router.get('/mensajes', isAuth, isAdmin, adminControlador.getMensajes)

router.get('/ingredientes', adminControlador.getIngredientes)
router.get('/api/ingredientes', adminControlador.getIngredientesLista)
router.get('/api/ingredientes/categorias', adminControlador.getCategorias)
router.get('/api/ingredientes/verificarNombre', adminControlador.verificarNombreIngrediente)
router.post('/api/ingredientes/validar', adminControlador.validarIngrediente)
router.post('/api/ingredientes/crear', adminControlador.crearIngrediente)
router.get('/api/ingredientes/:id/validarEliminable', adminControlador.validarIngredienteEliminable)
router.delete('/api/ingredientes/:id/eliminar', adminControlador.eliminarIngrediente)
router.put('/api/ingredientes/:id/actualizar', adminControlador.actualizarIngrediente)
router.get('/metricas-ingredientes', adminControlador.getMetricasIngredientes)
router.get('/api/metricas-ingredientes', adminControlador.getMetricasIngredientesData)

router.get('/categorias-tipos', isAuth, isAdmin, adminControlador.getCategoriasTipos)
router.get('/api/categorias', isAuth, isAdmin, adminControlador.getCategoriasLista)
router.get('/api/categorias/verificarNombre', isAuth, isAdmin, adminControlador.verificarNombreCategoria)
router.post('/api/categorias/crear', isAuth, isAdmin, adminControlador.crearCategoria)
router.get('/api/categorias/:nombre/verificarEnUso', isAuth, isAdmin, adminControlador.verificarCategoriaEnUso)
router.put('/api/categorias/:nombre/actualizar', isAuth, isAdmin, adminControlador.actualizarCategoria)
router.delete('/api/categorias/:nombre/eliminar', isAuth, isAdmin, adminControlador.eliminarCategoria)

router.get('/api/tipos', isAuth, isAdmin, adminControlador.getTiposLista)
router.get('/api/tipos/verificarNombre', isAuth, isAdmin, adminControlador.verificarNombreTipo)
router.post('/api/tipos/crear', isAuth, isAdmin, adminControlador.crearTipo)
router.get('/api/tipos/:nombre/verificarEnUso', isAuth, isAdmin, adminControlador.verificarTipoEnUso)
router.put('/api/tipos/:nombre/actualizar', isAuth, isAdmin, adminControlador.actualizarTipo)
router.delete('/api/tipos/:nombre/eliminar', isAuth, isAdmin, adminControlador.eliminarTipo)

router.get('/feedback', isAuth, isAdmin, feedBackControlador.getFeedback)
router.get('/api/comentarios', isAuth, isAdmin, feedBackControlador.getFeedbackCatalog)
router.get('/api/comentarios/:id', isAuth, isAdmin, feedBackControlador.getComentarioDetail)

router.get('/sucursales', isAuth, isAdmin, adminControlador.getSucursales)
router.get('/api/sucursales', isAuth, isAdmin, adminControlador.getSucursalesLista)
router.post('/api/sucursales/crear', isAuth, isAdmin, adminControlador.crearSucursal)
router.put('/api/sucursales/:id/actualizar', isAuth, isAdmin, adminControlador.actualizarSucursal)
router.get('/api/sucursales/:id/verificarEliminable', isAuth, isAdmin, adminControlador.verificarSucursalEliminable)
router.delete('/api/sucursales/:id/eliminar', isAuth, isAdmin, adminControlador.eliminarSucursal)

module.exports = router
