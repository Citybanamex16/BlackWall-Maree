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
const Pedido = require('../models/pedidos.model.js')
const Cliente = require('../models/cliente.model.js')
exports.getHub = (req, res, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Admin')
  res.render('admin/admindashboard', { breadcrumbs })
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

exports.getOrders = async (req, res, next) => {
  try {
    const [pedidos] = await Pedido.fetchOrders()

    res.render('admin/orders', {
      pedidos,
      breadcrumbs: [
        { name: 'Inicio', url: '/' },
        { name: 'Admin', url: '/admin' },
        { name: 'Órdenes', url: '/admin/ordenes' }
      ]
    })
  } catch (error) {
    console.error('Error al cargar órdenes:', error)
    res.status(500).send('Error al cargar órdenes.')
  }
}

exports.getCollaborators = (req, res, next) => {
  res.render('admin/collaborators')
}

exports.getOrders = (req, res, next) => {
  res.render('admin/orders')
}
exports.getPromotions = (req, res, next) => {
  res.render('admin/promotions')
}

exports.cancelActiveOrder = async (req, res, next) => {
  const idOrden = String(req.params.id).trim()

  if (!idOrden) {
    return res.status(400).json({
      ok: false,
      message: 'ID de orden inválido.'
    })
  }

  try {
    const [ordenRows] = await Pedido.fetchOne(idOrden)

    if (!ordenRows || ordenRows.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'La orden no existe.'
      })
    }

    const [cancelResult] = await Pedido.cancelActiveOrder(idOrden)

    if (!cancelResult || cancelResult.affectedRows === 0) {
      return res.status(409).json({
        ok: false,
        message: 'No se pudo cancelar la orden porque ya estaba cancelada.'
      })
    }

    const [clienteRows] = await Cliente.fetchContactDataByOrder(idOrden)

    if (!clienteRows || clienteRows.length === 0) {
      return res.status(500).json({
        ok: false,
        partial: true,
        message: 'La orden se canceló, pero no fue posible recuperar los datos del cliente.'
      })
    }

    const cliente = clienteRows[0]
    const mensaje = `Hola ${cliente.nombre_cliente || 'cliente'}, tu orden #${idOrden} ha sido cancelada.`

    return res.status(200).json({
      ok: true,
      message: 'Orden cancelada correctamente.',
      pedidoId: idOrden,
      nuevoEstatus: 'Cancelado',
      cliente: {
        nombre: cliente.nombre_cliente || null,
        telefono: cliente.telefono || null,
        correo: cliente.correo || null,
        royalty: cliente.nombre_royalty || null
      },
      notificacion: mensaje
    })
  } catch (error) {
    console.error('Error al cancelar la orden:', error)
    return res.status(500).json({
      ok: false,
      message: 'Ocurrió un error al cancelar la orden.'
    })
  }
}
