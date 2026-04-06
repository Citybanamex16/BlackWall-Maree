const express = require('express')
const router = express.Router()

// Llamada a controlador de Admin
const adminControlador = require('../controllers/admin.controlador.js')
const isAuth = require('../middleware/isAuth.js')
const isAdmin = require('../middleware/isAdmin.js')
// Dashboard principal
router.get('/', isAuth, isAdmin, adminControlador.getHub)
// Cada sección del dashboard uu que rico
// router.get('/ingredientes', adminControlador.getIngredientes)

router.get('/ingredientes', isAuth, isAdmin, adminControlador.getIngredients)
router.get('/productos', isAuth, isAdmin, adminControlador.getProducts)

router.get('/royalty', isAuth, isAdmin, adminControlador.getRoyaltyMetrics)
router.get('/api/royalty', isAuth, isAdmin, adminControlador.getRoyaltyMetricsData)
router.get('/api/royalty/export', isAuth, isAdmin, adminControlador.exportRoyaltyMetricsCsv)
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

router.get('/ordenes', isAuth, isAdmin, adminControlador.getOrders)
router.post('/api/orders/:id/cancel', adminControlador.cancelActiveOrder)
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

module.exports = router
