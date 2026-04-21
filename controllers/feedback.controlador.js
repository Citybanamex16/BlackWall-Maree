const nav = require('../models/breadcrumbs.model.js')
const feedback = require('../models/MenuDigital/feedback.model.js')

// Inicio CU15 Visualizar Feedback
exports.getFeedback = (req, res, next) => {
  console.log('Getting feedback page')
  const breadcrumbs = nav.getBreadcrumbs('AdminSection')
  res.render('admin/feedback', { breadcrumbs })
}

exports.getFeedbackCatalog = async (req, res, next) => {
  try {
    const feedbackData = await feedback.getFeedBackCatalog()
    res.status(200).json({
      ok: true,
      message: 'Consulta realizada con exito',
      data: feedbackData
    })
  } catch (err) {
    console.error('Error al obtener datos de feedback: ', err)
    res.status(500).json({
      ok: false,
      message: 'Error en consulta de datos de feedback'
    })
  }
}

// Consigue el ID
exports.getComentarioDetail = async (req, res, next) => {
  try {
    const { id } = req.params
    const detalle = await feedback.getById(id)

    if (!detalle) {
      return res.status(404).json({ ok: false, message: 'Comentario no encontrado' })
    }

    res.status(200).json({ ok: true, data: detalle })
  } catch (err) {
    console.error('Error al obtener detalle de comentario: ', err)
    res.status(500).json({ ok: false, message: 'Error al obtener detalle' })
  }
}
// Fin de Visualizar Feedback
