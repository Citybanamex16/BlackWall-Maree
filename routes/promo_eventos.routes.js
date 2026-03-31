const express = require('express')
const router = express.Router()

const evenPromoControlador = require('../controllers/promo_eventos.controller.js')

router.get('/eventos', evenPromoControlador.getEvents)

router.post('/eventos', evenPromoControlador.postRegistrarEvento)

router.post('/promociones/registrar', evenPromoControlador.postRegistrarPromotions)

router.get('/eventos/api/catalogos', evenPromoControlador.getCatalogosEvento)

router.get('/promociones', evenPromoControlador.getPromotions)

router.get('/mensajes', evenPromoControlador.getMensajes)

module.exports = router
