const express = require('express')
const router = express.Router()

const colaboradorControlador = require('../controllers/colaborador.controlador.js')
const isCollaborator = require('../middleware/isCollaborator.js')

router.get('/', isCollaborator, colaboradorControlador.getHub)

module.exports = router
