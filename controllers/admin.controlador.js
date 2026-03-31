// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
const Colaborador = require('../models/colaborador.model.js')

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

exports.getCollaborators = async (req, res, next) => {
  try {
    const colaboradores = await Colaborador.fetchActivos()
    res.render('admin/collaborators', {
      pageTitle: 'Colaboradores',
      colaboradores,
      mensaje: null,
      error: null
    })
  } catch (error) {
    console.log(error)
    res.status(500).render('admin/collaborators', {
      pageTitle: 'Colaboradores',
      colaboradores: [],
      mensaje: null,
      error: 'No se pudo cargar la lista de colaboradores.'
    })
  }
}

exports.getCollaboratorsDetails = async (req, res, next) => {
  try {
    const idColaborador = req.params.id
    const colaborador = await Colaborador.fetchById(idColaborador)
    if (!colaborador) {
      return res.status(404).render('404')
    }
    res.render('admin/collaboratorsDetails', {
      pageTitle: 'Detalles del colaborador',
      colaborador,
      error: null
    })
  } catch (error) {
    console.log(error)
    res.status(500).render('admin/collaboratorsDetails', {
      pageTitle: 'Detalle del colaborador',
      colaborador: null,
      error: 'No se pudo cargar la información del colaborador.'
    })
  }
}

exports.postDarDeBajaColaborador = async (req, res, next) => {
  try {
    const idColaborador = req.params.id
    const idAdminSesion = String(req.session.user.id)

    console.log('ID colaborador recibido:', idColaborador)
    console.log('ID admin en sesión:', idAdminSesion)

    if (idColaborador === idAdminSesion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No puedes darte de baja a ti mismo.'
      })
    }

    const resultado = await Colaborador.darDeBaja(idColaborador)
    console.log('Resultado darDeBaja:', resultado)

    if (!resultado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No fue posible dar de baja al colaborador.'
      })
    }

    return res.json({
      ok: true,
      mensaje: 'Empleado dado de baja exitosamente.'
    })
  } catch (error) {
    console.log('ERROR EN BAJA:', error)
    res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error al actualizar en la base de datos.'
    })
  }
}

exports.getOrders = async (req, res, next) => {
  const breadcrumbs = [
    { name: 'Inicio', url: '/' },
    { name: 'Admin', url: '/admin' },
    { name: 'Órdenes', url: '/admin/ordenes' }
  ]

  try {
    const [pedidos] = await Pedido.fetchOrders()
    res.render('admin/orders', {
      pageTitle: 'Órdenes',
      pedidos,
      breadcrumbs,
      error: null
    })
  } catch (error) {
    console.error('Error al cargar órdenes:', error)

    res.status(500).render('admin/orders', {
      pageTitle: 'Órdenes',
      pedidos: [],
      breadcrumbs,
      error: 'No hay conexión con la base de datos.'
    })
  }
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
    const cliente = clienteRows && clienteRows.length > 0 ? clienteRows[0] : null

    const nombreCliente = cliente && cliente.nombre_cliente
      ? cliente.nombre_cliente
      : ordenRows[0].nombre_cliente || 'cliente'

    const mensaje = `Hola ${nombreCliente}, tu orden #${idOrden} ha sido cancelada.`

    return res.status(200).json({
      ok: true,
      message: 'Orden cancelada correctamente.',
      pedidoId: idOrden,
      nuevoEstatus: 'Cancelado',
      cliente: {
        nombre: cliente ? cliente.nombre_cliente || null : null,
        telefono: cliente ? cliente.telefono || null : null,
        correo: cliente ? cliente.correo || null : null,
        royalty: cliente ? cliente.nombre_royalty || null : null
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
