// Llamar al model
const nav = require('../models/breadcrumbs.model.js')

// const path = require('path')

// Exports
/** ejemplo:
 * exports.get_new = (request, response, next) => {
    response.render('new');
};
*/

exports.getHub = (req, res, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Admin')
  res.render('admin/admindashboard', { breadcrumbs })
}

exports.getIngredients = (req, res, next) => {
  res.render('admin/ingredients')
}

exports.getProducts = (req, res, next) => {
  res.render('admin/products')
}

exports.getRoyalty = (req, res, next) => {
  res.render('admin/royalty')
}

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('admin/metricsRoyalty')
}

exports.getCollaborators = (req, res, next) => {
  res.render('admin/collaborators')
}

exports.getOrders = (req, res, next) => {
  res.render('admin/orders')
}

exports.getPromotions = (req, res, next) => {
  res.render('admin/promotions')
}

exports.getEvents = (req, res, next) => {
  res.render('admin/events')
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
}
