const express = require('express')
const router = express.Router()

const royaltyControlador = require('../controllers/royalty.controlador.js')
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
router.post('/promociones', royaltyControlador.postRegistrarEstadoRoyalty)
router.get('/royaltyAdmin/promocion-evento-filtro', royaltyControlador.getFilterPromocionesEventos)
// Agrega estas dos rutas (antes de las rutas de cliente)
router.get('/royaltyAdmin/todas/promociones-disponibles', isAuth, isAdmin, royaltyControlador.getTodasPromociones)
router.get('/royaltyAdmin/todas/eventos-disponibles', isAuth, isAdmin, royaltyControlador.getTodosEventos)

router.delete('/borrar/:nombre', isAuth, isAdmin, royaltyControlador.deleteRoyalty)

// CLIENTE
router.get('/royaltyUser', royaltyControlador.getRoyaltyCli)
router.get('/royaltyUser/api/datos', royaltyControlador.getRoyaltyDataAPI)

module.exports = router
