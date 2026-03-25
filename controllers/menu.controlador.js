// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
// const productos = require('../models/productos.model.js')

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs })
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs })
}

exports.getPlatillo = (request, response, next) => {
  console.log('ENCONTROLLER')
  // DESCOMENTAR EL DE ABAJO CUANDO ESTE LA BASE DE DATOS
  // productos.fetchOne(request.body)
  response.status(200).json({ message: 'Respuesta asíncrona' })
}
