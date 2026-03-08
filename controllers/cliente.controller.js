// Modulos nativos
const querystring = require('node:querystring')
// const path = require('path')

// Llamar al model
const nav = require('../models/breadcrumbs.model.js')

// Recuerden que automaticamente cuando haces render Express busca en Views
// Si esta dentro de una subcarpeta de Views hay que decirle en cual

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs})
}



exports.logout = (request, response, next) => {
    // 1. Destruye la sesión en el servidor
    console.log("Llamando a logout")
    request.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return next(err);
        }
        // 2. Limpia la cookie del navegador (el nombre por defecto es 'connect.sid')
        response.clearCookie('connect.sid');
        
        // 3. Redirige al login o al inicio
        response.redirect('/cliente/menu'); 
    });
};

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
  console.log(request.body.nombre)
  request.session.password = request.body.telefono
  request.session.name = request.body.nombre

  // 3. respondemos
  response.redirect('/cliente/menu')

}

exports.logOut = (request, response, next) => {

}



