const nav = require('../models/breadcrumbs.model.js')
const feedback = require('../models/MenuDigital/feedback.model.js')

// Inicio CU15 Visualizar Feedback
exports.getFeedback = (req, res, next) => {
  console.log('Getting feedback page')
  const breadcrumbs = nav.getBreadcrumbs('AdminSection')
  res.render('admin/feedback', { breadcrumbs })
}

exports.getFeedbackCatalog = async (req, res, next) => {
  console.log('Obteniendo datos de catalogo feedback')
  try {
    const feedbackData = await feedback.getFeedBackCatalog()
    console.log('data: ', feedbackData)

    res.status(200).json({
      ok: true,
      message: 'Consulta realizada con exito',
      data: feedbackData
    })
  } catch (err) {
    console.log('Error al obtener datos de feedback: ', err)
    res.status(500).json({
      ok: false,
      message: 'Error en consulta de datos de feedback',
      error: err
    })
  }
}
// Fin de Visualizar Feedback
