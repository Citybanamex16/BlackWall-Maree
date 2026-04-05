const nav = require('../models/breadcrumbs.model.js')
const Royalty = require('../models/royalty.model.js')

// Admin
exports.getRoyaltyAdmin = async (request, response, next) => {
  try {
    const [royalties] = await Royalty.fetchAll()
    console.log('Obtenemos los estados Royalty de la base de datos')
    response.render('admin/royalty', { royalties })
  } catch (error) {
    console.log(error)
    response.status(500).json({
      succes: false,
      message: 'No se pudo mandar los estados royalties'
    })
  }
}

exports.getRoyaltyAdminJSON = async (request, response, next) => {
  try {
    const [royalties] = await Royalty.fetchAll()
    response.status(200).json({
      succes: true,
      message: 'Éxito al obtener estados royalty',
      data: royalties
    })
  } catch (error) {
    console.log(error)
    response.status(500).json({
      succes: false,
      message: 'No se pudo mandar los estados royalties'
    })
  }
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

exports.updateRoyalty = async (request, response, next) => {
  try {
    const nombreOriginal = request.params.nombre
    const { nombre, prioridad, descripcion, minVisitas, maxVisitas } = request.body
    await Royalty.updateEstadoRoyalty(nombreOriginal, nombre, prioridad, descripcion, minVisitas, maxVisitas)
    response.status(200).json({
      success: true,
      message: 'Se han modificado los datos correctamente'
    })
  } catch (error) {
    console.log(error)
    next(error)
    response.status(500).json({
      success: false,
      message: 'No se pudo cambiar el estado royalty'
    })
  }
}

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('admin/metricsRoyalty')
}

// Cliente
exports.getRoyaltyCli = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Royalty')
  response.render('cliente/royalty', { breadcrumbs })
}
