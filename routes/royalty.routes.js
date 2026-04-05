const express = require('express')
const router = express.Router()

const royaltyControlador = require('../controllers/royalty.controlador.js') // CAMBIAR
const isAuth = require('../middleware/isAuth.js')
const isAdmin = require('../middleware/isAdmin.js')

// ADMIN
// Visualizar estados Royalties
router.get('/royaltyAdmin', isAuth, isAdmin, royaltyControlador.getRoyaltyAdmin)
router.get('/royaltyAdmin/api', isAuth, isAdmin, royaltyControlador.getRoyaltyAdminJSON)
// Modificar estados Royalties
router.put('/royaltyAdmin/:nombre', isAuth, isAdmin, royaltyControlador.updateRoyalty)
router.get('/royaltyMetrics', isAuth, isAdmin, royaltyControlador.getRoyaltyMetrics)

router.delete('/borrar/:nombre', isAuth, isAdmin, royaltyControlador.deleteRoyalty)
// CLIENTE
router.get('/royaltyUser', royaltyControlador.getRoyaltyCli)

module.exports = router
