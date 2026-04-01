const express = require('express')
const router = express.Router()

const evenPromoControlador = require('../controllers/promo_eventos.controller.js')

router.get('/eventos', evenPromoControlador.getEvents)

router.get('/eventos/api/all', evenPromoControlador.getEventsAPI)

router.post('/eventos/registrar', evenPromoControlador.postRegistrarEvento)

router.post('/promociones', evenPromoControlador.postRegistrarPromotions)

router.get('/promociones/producto-filtro', evenPromoControlador.getFilterProductos)

router.get('/eventos/api/catalogos', evenPromoControlador.getCatalogosEvento)

router.get('/promociones', evenPromoControlador.getPromotionsPage)

router.get('/promociones/api/all', evenPromoControlador.getPromotionsAPI)

router.get('/mensajes', evenPromoControlador.getMensajes)

module.exports = router
