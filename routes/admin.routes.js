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

router.get('/royalty', isAuth, isAdmin, adminControlador.getRoyalty)
router.get('/ingredientes', isAuth, isAdmin, adminControlador.getIngredients)
router.get('/productos', isAuth, isAdmin, adminControlador.getProducts)
router.get('/royaltyMetrics', isAuth, isAdmin, adminControlador.getRoyaltyMetrics)

router.get('/colaboradores', isAuth, isAdmin, adminControlador.getCollaborators)
router.get('/colaboradores/:id', isAuth, isAdmin, adminControlador.getCollaboratorsDetails)
router.post('/colaboradores/:id/baja', isAuth, isAdmin, adminControlador.postDarDeBajaColaborador)

router.get('/ordenes', isAuth, isAdmin, adminControlador.getOrders)
// router.post('/api/orders/:id/cancel', adminControlador.cancelActiveOrder)
router.get('/promociones', isAuth, isAdmin, adminControlador.getPromotions)
router.get('/eventos', isAuth, isAdmin, adminControlador.getEvents)
router.get('/mensajes', isAuth, isAdmin, adminControlador.getMensajes)

module.exports = router
