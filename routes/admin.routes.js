const express = require('express')
const router = express.Router()

// Dashboard principal
router.get('/', (req, res) => {
  res.render('admin/admindashboard')
})

// Cada sección del dashboard uu que rico
router.get('/ingredients', (req, res) => {
  res.render('admin/ingredients')
})

router.get('/products', (req, res) => {
  res.render('admin/products')
})

router.get('/royalty', (req, res) => {
  res.render('admin/royalty')
})

router.get('/collaborators', (req, res) => {
  res.render('admin/collaborators')
})

router.get('/orders', (req, res) => {
  res.render('admin/orders')
})

router.get('/promotions', (req, res) => {
  res.render('admin/promotions')
})

router.get('/events', (req, res) => {
  res.render('admin/events')
})

module.exports = router
