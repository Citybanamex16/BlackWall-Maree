const nav = require('../models/breadcrumbs.model.js')

// Admin
exports.getRoyaltyAdmin = (req, res, next) => {
  res.render('admin/royalty')
}

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('admin/metricsRoyalty')
}

// Cliente
exports.getRoyaltyCli = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Royalty')
  response.render('cliente/royalty', { breadcrumbs })
}
