const express = require('express')
const router = express.Router()

const evenPromoControlador = require('../controllers/promo_eventos.controlador.js')

router.get('/eventos', evenPromoControlador.getEvents)

router.post('/eventos', evenPromoControlador.postRegistrarEvento)

router.get('/eventos/api/catalogos', evenPromoControlador.getCatalogosEvento)

router.get('/promociones', evenPromoControlador.getPromotionsPage)

router.get('/promociones/api/all', evenPromoControlador.getPromotionsAPI)

router.get('/mensajes', evenPromoControlador.getMensajes)

module.exports = router
