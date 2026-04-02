const express = require('express')
const router = express.Router()

// Llamada a controlador de Admin
const adminControlador = require('../controllers/admin.controlador.js')
const isAuth = require('../middleware/isAuth.js')
const isAdmin = require('../middleware/isAdmin.js')
// Dashboard principal
router.get('/', adminControlador.getHub)
// Cada sección del dashboard uu que rico
// router.get('/ingredientes', adminControlador.getIngredientes)

router.get('/royalty', adminControlador.getRoyalty)

router.get('/colaboradores', isAuth, isAdmin, adminControlador.getCollaborators)
router.get('/colaboradores/:id', isAuth, isAdmin, adminControlador.getCollaboratorsDetails)
router.post('/colaboradores/:id/baja', isAuth, isAdmin, adminControlador.postDarDeBajaColaborador)

router.get('/ordenes', adminControlador.getOrders)
router.post('/api/orders/:id/cancel', adminControlador.cancelActiveOrder)

router.get('/colaboradores', adminControlador.getCollaborators)

router.get('/ordenes', adminControlador.getOrders)

router.get('/ingredientes', adminControlador.getIngredientes)
// ingredientes activos
router.get('/api/ingredientes', adminControlador.getIngredientesLista)
// categorías para el dropdown del formulario
router.get('/api/ingredientes/categorias', adminControlador.getCategorias)
router.get('/api/ingredientes/verificarNombre', adminControlador.verificarNombreIngrediente)

// validar campos del formulario (sin guardar)
router.post('/api/ingredientes/validar', adminControlador.validarIngrediente)
// guardar nuevo ingrediente en BD
router.post('/api/ingredientes/crear', adminControlador.crearIngrediente)

module.exports = router
