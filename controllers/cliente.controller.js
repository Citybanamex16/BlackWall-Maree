// Modulos nativos
const querystring = require('node:querystring')
// const path = require('path')

// Llamar al model
const nav = require('../models/breadcrumbs.model.js')

// Recuerden que automaticamente cuando haces render Express busca en Views
// Si esta dentro de una subcarpeta de Views hay que decirle en cual

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs })
}

exports.getRoyalty = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Royalty')
  response.render('cliente/royalty', { breadcrumbs })
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs })
}

exports.getLogin = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('LogIn')
  response.render('cliente/login', { breadcrumbs })
}

exports.postLogin = (request, response, next) => {
  let body = ''
  // 1. Almacenamos para procesar
  request.on('data', chunk => {
    body += chunk.toString()
  })
  // 2. traducirlos para manipular
  request.on('end', () => {
    const datos = querystring.parse(body)
    console.log(`Cuenta registrada bajo nombre de ${datos.nombre} con numero telefonico: ${datos.telefono}`)
    // 3. respondemos
    response.redirect('/cliente/login')
  })
}
