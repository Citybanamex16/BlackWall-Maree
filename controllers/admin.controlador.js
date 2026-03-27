// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
const Colaborador = require("../models/colaborador.model.js")

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

exports.getCollaborators = async(req, res, next) => {
  try{
    const colaboradores = await Colaborador.fetchActivos()
    res.render("admin/collaborators", {
      pageTitle: "Colaboradores",
      colaboradores,
      mensaje: null,
      error: null
    })
  } catch(error){
    console.log(error)
    res.status(500).render("admin/collaborators", {
      pageTitle: "Colaboradores",
      colaboradores: [],
      mensaje: null,
      error: "No se pudo cargar la lista de colaboradores."
    })
  }
}

exports.getCollaboratorsDetails = async(req, res, next) => {
  try{
    const idColaborador = req.params.id
    const colaborador = await Colaborador.fetchById(idColaborador)
    if (!colaborador){
      return res.status(404).render("404")
    }
    res.render("admin/collaboratorsDetails", {
      pageTitle: "Detalles del colaborador",
      colaborador,
      error: null
    })
  } catch (error){
    console.log(error)
    res.status(500).render("admin/collaboratorsDetails", {
      pageTitle: "Detalle del colaborador",
      colaborador: null,
      error: "No se pudo cargar la información del colaborador."
    })
  }
}

exports.postDarDeBajaColaborador = async (req, res, next) => {
  try{
    const idColaborador = req.params.id
    const idAdminSesion = String(req.session.user.id)

    console.log("ID colaborador recibido:", idColaborador)
    console.log("ID admin en sesión:", idAdminSesion)

    if (idColaborador === idAdminSesion){
      return res.status(400).json({
        ok: false,
        mensaje: "No puedes darte de baja a ti mismo."
      })
    }

    const resultado = await Colaborador.darDeBaja(idColaborador)
    console.log("Resultado darDeBaja:", resultado)

    if (!resultado){
      return res.status(400).json({
        ok: false,
        mensaje: "No fue posible dar de baja al colaborador."
      })
    }

    return res.json({
      ok: true,
      mensaje: "Empleado dado de baja exitosamente."
    })
  } catch (error) {
    console.log("ERROR EN BAJA:", error)
    res.status(500).json({
      ok: false,
      mensaje: "Ocurrió un error al actualizar en la base de datos."
    })
  }
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
