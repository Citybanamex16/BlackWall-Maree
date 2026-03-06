const express = require('express')
const router = express.Router()

router.get('/', (req, res) => res.render('admin/admindashboard'))
router.get('/ingredients', (req, res) => res.render('admin/ingredients'))
router.get('/products', (req, res) => res.render('admin/products'))
router.get('/royalty', (req, res) => res.render('admin/royalty'))
router.get('/collaborators', (req, res) => res.render('admin/collaborators'))
router.get('/orders', (req, res) => res.render('admin/orders'))
router.get('/promotions', (req, res) => res.render('admin/promotions'))
router.get('/events', (req, res) => res.render('admin/events'))
router.get('/whatsapp', (req, res) => res.render('admin/whatsapp'))
router.get('/cliente', (req, res) => res.render('menu'))

module.exports = router
