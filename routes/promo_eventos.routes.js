const express = require('express')
const router = express.Router()

const evenPromoControlador = require('../controllers/promo_eventos.controlador.js')

router.get('/eventos', evenPromoControlador.getEvents)

router.get('/eventos/api/all', evenPromoControlador.getEventsAPI)

router.get('/eventos/:idEvento', evenPromoControlador.getEventDetail)

router.post('/eventos/registrar', evenPromoControlador.postRegistrarEvento)

router.put('/eventos/:idEvento', evenPromoControlador.putUpdateEvent)

router.patch('/eventos/:idEvento/desactivar', evenPromoControlador.patchDeactivateEvent)

router.patch('/eventos/:idEvento/activar', evenPromoControlador.patchActivateEvent)

router.delete('/eventos/:idEvento', evenPromoControlador.deleteEvent)

router.get('/eventos/api/catalogos', evenPromoControlador.getCatalogosEvento)

router.get('/promociones', evenPromoControlador.getPromotionsPage)

router.get('/promociones/api/all', evenPromoControlador.getPromotionsAPI)

router.get('/promociones/producto-filtro', evenPromoControlador.getFilterProductos)

router.get('/promociones/:idPromocion', evenPromoControlador.getPromotionDetail)

router.post('/promociones', evenPromoControlador.postRegistrarPromotions)

router.put('/promociones/:idPromocion', evenPromoControlador.putUpdatePromotion)

router.patch('/promociones/:idPromocion/desactivar', evenPromoControlador.patchDeactivatePromotion)

router.patch('/promociones/:idPromocion/activar', evenPromoControlador.patchActivatePromotion)

router.delete('/promociones/:idPromocion', evenPromoControlador.deletePromotion)

router.get('/mensajes', evenPromoControlador.getMensajes)

module.exports = router
