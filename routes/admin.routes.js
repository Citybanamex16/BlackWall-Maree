const express = require('express')
const router = express.Router()

// Llamada a controlador de Admin
const adminControlador = require('../controllers/admin.controlador.js')
const isAuth = require('../middleware/isAuth.js')
const isAdmin = require('../middleware/isAdmin.js')
// Dashboard principal
router.get('/', adminControlador.getHub)
// Cada sección del dashboard uu que rico
router.get('/ingredientes', adminControlador.getIngredients)

router.get('/productos', adminControlador.getProducts)

router.get('/royalty', adminControlador.getRoyalty)
router.get('/royaltyMetrics', adminControlador.getRoyaltyMetrics)

router.get('/colaboradores', isAuth, isAdmin, adminControlador.getCollaborators)
router.get('/colaboradores/:id', isAuth, isAdmin, adminControlador.getCollaboratorsDetails)
router.post('/colaboradores/:id/baja', isAuth, isAdmin, adminControlador.postDarDeBajaColaborador)

router.get('/ordenes', adminControlador.getOrders)

router.get('/promociones', adminControlador.getPromotions)

router.get('/eventos', adminControlador.getEvents)

router.get('/mensajes', adminControlador.getMensajes)

module.exports = router
