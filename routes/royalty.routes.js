const express = require('express')
const router = express.Router()

const royaltyControlador = require('../controllers/royalty.controlador.js')
const adminControlador = require('../controllers/admin.controlador.js')
const isAuth = require('../middleware/isAuth.js')
const isAdmin = require('../middleware/isAdmin.js')

// ADMIN
// Visualizar estados Royalties
router.get('/royaltyAdmin', isAuth, isAdmin, royaltyControlador.getRoyaltyAdmin)
router.get('/royaltyAdmin/api', isAuth, isAdmin, royaltyControlador.getRoyaltyAdminJSON)

// Modificar estados Royalties
router.put('/royaltyAdmin/:nombre', isAuth, isAdmin, royaltyControlador.updateRoyalty)
router.get('/royaltyMetrics', isAuth, isAdmin, royaltyControlador.getRoyaltyMetrics)
router.get('/royaltyAdmin/:nombre/promociones', isAuth, isAdmin, royaltyControlador.getPromocionesParaModal)
router.get('/royaltyAdmin/:nombre/eventos', isAuth, isAdmin, royaltyControlador.getEventosParaModal)

// Metodos post
router.post('/promociones', isAuth, isAdmin, royaltyControlador.postRegistrarEstadoRoyalty)
router.get('/royaltyAdmin/promocion-evento-filtro', isAuth, isAdmin, royaltyControlador.getFilterPromocionesEventos)
// Agrega estas dos rutas (antes de las rutas de cliente)
router.get('/royaltyAdmin/todas/promociones-disponibles', isAuth, isAdmin, royaltyControlador.getTodasPromociones)
router.get('/royaltyAdmin/todas/eventos-disponibles', isAuth, isAdmin, royaltyControlador.getTodosEventos)

router.delete('/borrar/:nombre', isAuth, isAdmin, royaltyControlador.deleteRoyalty)

router.get('/royaltyAdmin/metricsRoyalty', isAuth, isAdmin, adminControlador.getRoyaltyMetrics)
router.get('/royaltyAdmin/metricsRoyalty/api/royalty', isAuth, isAdmin, adminControlador.getRoyaltyMetricsData)
router.get('/royaltyAdmin/metricsRoyalty/api/royalty/export', isAuth, isAdmin, adminControlador.exportRoyaltyMetricsCsv)

// CLIENTE
router.get('/royaltyUser', royaltyControlador.getRoyaltyCli)
router.get('/royaltyUser/api/datos', royaltyControlador.getRoyaltyDataAPI)

module.exports = router
