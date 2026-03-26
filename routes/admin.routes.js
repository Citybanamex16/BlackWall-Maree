const express = require('express')
const router = express.Router()

// Llamada a controlador de Admin
const adminControlador = require('../controllers/admin.controlador.js')
// Dashboard principal
router.get('/', adminControlador.getHub)
// Cada sección del dashboard uu que rico

router.get('/royalty', adminControlador.getRoyalty)

router.get('/royaltyMetrics', adminControlador.getRoyaltyMetrics)

router.get('/ingredientes', adminControlador.getIngredients)

router.get('/productos', adminControlador.getProducts)

router.get('/colaboradores', adminControlador.getCollaborators)

router.get('/ordenes', adminControlador.getOrders)

module.exports = router
