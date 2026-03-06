const express = require('express')
const router = express.Router()
// const clienteControlador = require('../controllers/cliente.controller.js')

router.get('/hours', (req, res) => res.render('cliente/hours'))
router.get('/promotions', (req, res) => res.render('cliente/promotions'))
router.get('/record', (req, res) => res.render('cliente/record'))
router.get('/royalty', (req, res) => res.render('cliente/royalty'))
router.get('/order', (req, res) => res.render('cliente/order'))

module.exports = router
