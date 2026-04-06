// Modulos nativos
// const path = require('path')

// Llamar al model
const nav = require('../models/breadcrumbs.model.js')

// Recuerden que automaticamente cuando haces render Express busca en Views
// Si esta dentro de una subcarpeta de Views hay que decirle en cual

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs })
}
