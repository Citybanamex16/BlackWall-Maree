const express = require('express')
const router = express.Router()

const evenPromoControlador = require('../controllers/promo_eventos.controlador.js')

router.get('/eventos', evenPromoControlador.getEvents)

router.get('/eventos/api/all', evenPromoControlador.getEventsAPI)

router.get('/eventos/api/catalogos', evenPromoControlador.getCatalogosEvento)

router.get('/eventos/:id', evenPromoControlador.getEventoDetailAPI)

router.post('/eventos/registrar', evenPromoControlador.postRegistrarEvento)

router.put('/eventos/:id', evenPromoControlador.putActualizarEvento)

router.put('/eventos/:id/estado', evenPromoControlador.putEstadoEvento)

router.delete('/eventos/:id', evenPromoControlador.deleteEvento)

router.get('/promociones', evenPromoControlador.getPromotionsPage)

router.get('/promociones/api/all', evenPromoControlador.getPromotionsAPI)

router.post('/promociones', evenPromoControlador.postRegistrarPromotions)

router.get('/promociones/producto-filtro', evenPromoControlador.getFilterProductos)

router.get('/mensajes', evenPromoControlador.getMensajes)

module.exports = router
