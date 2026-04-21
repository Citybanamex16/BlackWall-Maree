const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const router = express.Router()

const evenPromoControlador = require('../controllers/promo_eventos.controlador.js')

const carpetaImagenesEventos = path.join(__dirname, '..', 'public', 'uploads', 'eventos')
const extensionesImagen = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
}

const cargaImagenEvento = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(carpetaImagenesEventos, { recursive: true })
      cb(null, carpetaImagenesEventos)
    },
    filename: (req, file, cb) => {
      const extension = extensionesImagen[file.mimetype]
      cb(null, `evento-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`)
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!extensionesImagen[file.mimetype]) {
      return cb(new Error('Solo se permiten imagenes JPG, PNG, WEBP o GIF.'))
    }

    cb(null, true)
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

const subirImagenEvento = (req, res, next) => {
  cargaImagenEvento.single('imagenEvento')(req, res, error => {
    if (!error) {
      return next()
    }

    const mensaje = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen no puede superar 5 MB.'
      : error.message || 'No se pudo cargar la imagen del evento.'

    return res.status(400).json({
      success: false,
      message: mensaje
    })
  })
}

router.get('/eventos', evenPromoControlador.getEvents)

router.get('/eventos/api/all', evenPromoControlador.getEventsAPI)

router.get('/eventos/:idEvento', evenPromoControlador.getEventDetail)

router.post('/eventos/registrar', subirImagenEvento, evenPromoControlador.postRegistrarEvento)

router.put('/eventos/:idEvento', subirImagenEvento, evenPromoControlador.putUpdateEvent)

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
