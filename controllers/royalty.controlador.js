const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')

// Admin
exports.getRoyaltyAdmin = (request, response, next) => {
  console.log('Obtenemos los estados Royalty de la base de datos')
  Royalty.fetchAll().then(([rows, fieldData]) => {
    console.log(fieldData)
    return response.render('admin/royalty', {
      nombre: request.session.nombre,
      numero_prioridad: request.session.Número_de_prioridad,
      descripcion: request.session.descripcion,
      max_visitas: request.session.max_visitas,
      min_visitas: request.session.min_visitas,
      royalties: rows
    })
  }).catch((error) => {
    console.log(error)
    next(error)
  })
}

exports.deleteRoyalty = (request, response, next) => {
  const nombre = request.params.nombre
  Royalty.deleteRoyaltyBD(nombre).then(() => {
    response.status(200).json({ mensaje: 'Borrado correctamente' })
  }).catch((error) => {
    console.log(error)
    next(error)
  })
}

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('admin/metricsRoyalty')
}

// Cliente
exports.getRoyaltyCli = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Royalty')
  response.render('cliente/royalty', { breadcrumbs })
}
