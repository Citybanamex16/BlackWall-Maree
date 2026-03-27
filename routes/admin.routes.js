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

router.get('/royalty', adminControlador.getRoyalty)

router.get('/colaboradores', isAuth, isAdmin, adminControlador.getCollaborators)
router.get('/colaboradores/:id', isAuth, isAdmin, adminControlador.getCollaboratorsDetails)
router.post('/colaboradores/:id/baja', isAuth, isAdmin, adminControlador.postDarDeBajaColaborador)

router.get('/ordenes', adminControlador.getOrders)
router.post('/api/orders/:id/cancel', adminControlador.cancelActiveOrder)

router.get('/productos', adminControlador.getProducts)

router.get('/colaboradores', adminControlador.getCollaborators)

router.get('/ordenes', adminControlador.getOrders)

module.exports = router
