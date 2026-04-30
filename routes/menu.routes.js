const express = require('express')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const router = express.Router()
const menuControlador = require('../controllers/menu.controlador.js')
const isAdmin = require('../middleware/isAdmin.js')
const isAdminOrCollaborator = require('../middleware/isAdminOrCollaborator.js')
const uploadProductos = require('../middleware/uploadProductos.js')

const carpetaImagenesProductos = path.join(__dirname, '..', 'public', 'uploads', 'productos')
const extensionesImagen = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
}

const cargaImagenProducto = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(carpetaImagenesProductos, { recursive: true })
      cb(null, carpetaImagenesProductos)
    },
    filename: (req, file, cb) => {
      const extension = extensionesImagen[file.mimetype]
      cb(null, `producto-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`)
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

const subirImagenProducto = (req, res, next) => {
  cargaImagenProducto.single('ImagenArchivo')(req, res, error => {
    if (!error) {
      return next()
    }

    const mensaje = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen no puede superar 5 MB.'
      : error.message || 'No se pudo cargar la imagen del producto.'

    return res.status(400).json({
      ok: false,
      message: mensaje
    })
  })
}

// Rutas Menu cliente
router.get('/menu', menuControlador.getMenu)
router.get('/menuData', menuControlador.getMenuData)
router.get('/orden', menuControlador.getOrden)
router.get('/sucursales', menuControlador.getMapaSucursales)
router.get('/consultaplatillo', menuControlador.getPlatillo)
router.get('/consultarPromosMenu', menuControlador.getMenuPromos)
router.post('/agregaritem', menuControlador.agregarItem)
router.post('/pedidos/validar', menuControlador.contextoUsuario, menuControlador.validarPedido)
router.post('/pedidos/confirmar', menuControlador.confirmarPedido)

// FeedbackCliente
router.get('/feedback/historView', menuControlador.getReviewHistoryView)
router.get('/feedback/historyData', menuControlador.getClientReviewHistory)
router.post('/feedback/Nuevo', menuControlador.postNewFeedback)

// Productos Personalizados
router.get('/categorias', menuControlador.getCategorías)
router.get('/ingActivos', menuControlador.getIngredientesActivos)

// Sección de Mapa
router.get('/Sucursales/getAll', menuControlador.getAllSucursales)

// Rutas Admin
router.get('/productos', isAdminOrCollaborator, menuControlador.getProducts)
router.get('/productosCatalog', isAdminOrCollaborator, menuControlador.getProductsCatalog)
router.get('/productosTipos', isAdmin, menuControlador.getTypes)
router.get('/tiposByCategoria', isAdmin, menuControlador.getTiposByCategoria)
router.get('/ingredientesPorTipo', isAdmin, menuControlador.getIngredientesPorTipo)
router.get('/formsTipoPlatillo', isAdmin, menuControlador.getCategorys)
router.get('/formsRegistraPlatillo', isAdmin, menuControlador.getProductfieldsAndIngredientes)

router.post('/uploadImage', isAdmin, uploadProductos.single('imagen'), menuControlador.uploadImage)
router.post('/registerNewProduct', isAdmin, subirImagenProducto, menuControlador.postNewProduct)

router.put('/modifProduct/:id', isAdmin, menuControlador.postModifProduct)
// Eliminar Producto
router.delete('/eliminarProducto', isAdmin, menuControlador.deleteProducto)
router.put('/desactivarProducto', isAdmin, menuControlador.putDesactivarProducto)

// Rutas Global: Rutas utilizadas por cualquier CU, devuelven información general
router.get('/globalAdminIngredientes', isAdmin, menuControlador.getIngredientesFullCatalog)

module.exports = router
