// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
const Colaborador = require('../models/colaborador.model.js')
const Ingrediente = require('../models/ingrediente.model.js')
const MetricasClientes = require('../models/metricasclientes.model.js')
const MetricasProductos = require('../models/metricasproductos.model.js')
const Calendario = require('../models/calendario.model.js')
const Categoria = require('../models/categoria.model.js')
const Tipo = require('../models/tipo.model.js')
const Sucursal = require('../models/sucursal.model.js')

// const bcrypt = require('bcryptjs')

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

exports.getRoyaltyMetrics = (req, res, next) => {
  res.render('admin/metricsRoyalty', {
    pageTitle: 'Métricas de clientes'
  })
}
exports.getRoyaltyMetricsData = async (req, res, next) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio || '',
      fechaFin: req.query.fechaFin || '',
      genero: req.query.genero || '',
      royalty: req.query.royalty || ''
    }

    const data = await MetricasClientes.getDashboardData(filtros)

    const hayDatos =
      Number(data.resumen.clientes_activos) > 0 ||
      data.topClientes.length > 0 ||
      data.promociones.length > 0

    if (!hayDatos) {
      return res.status(200).json({
        ok: true,
        sinDatos: true,
        mensaje: 'No hay información disponible para los filtros seleccionados.',
        data
      })
    }

    return res.status(200).json({
      ok: true,
      sinDatos: false,
      data
    })
  } catch (error) {
    console.error('Error al consultar métricas de clientes:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error al consultar las métricas de clientes.'
    })
  }
}

exports.exportRoyaltyMetricsCsv = async (req, res, next) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio || '',
      fechaFin: req.query.fechaFin || '',
      genero: req.query.genero || '',
      royalty: req.query.royalty || ''
    }

    const rows = await MetricasClientes.getCsvData(filtros)

    const encabezados = [
      'Nombre',
      'Teléfono',
      'Género',
      'Royalty',
      'Órdenes',
      'Productos comprados',
      'Total gastado',
      'Última compra'
    ]

    const escapeCsv = (valor) => {
      if (valor === null || valor === undefined) return '""'
      return `"${String(valor).replace(/"/g, '""')}"`
    }

    const lineas = rows.map((row) => {
      return [
        row.nombre,
        row.telefono,
        row.genero,
        row.royalty,
        row.total_ordenes,
        row.productos_comprados,
        row.total_gastado,
        row.ultima_compra
      ].map(escapeCsv).join(',')
    })

    const csv = [encabezados.join(','), ...lineas].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_metricas_clientes.csv"'
    )

    return res.status(200).send(csv)
  } catch (error) {
    console.error('Error al exportar CSV de métricas de clientes:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'No fue posible generar el reporte.'
    })
  }
}

exports.getProductIngredientMetrics = (req, res, next) => {
  res.render('admin/metricsproducts', {
    pageTitle: 'Métricas de productos e ingredientes'
  })
}

exports.getProductIngredientMetricsData = async (req, res, next) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio || '',
      fechaFin: req.query.fechaFin || '',
      categoria: req.query.categoria || '',
      tipo: req.query.tipo || ''
    }

    const data = await MetricasProductos.getDashboardData(filtros)

    const hayDatos =
      Number(data.resumen.productos_vendidos) > 0 ||
      data.topProductosCantidad.length > 0 ||
      data.topProductosIngresos.length > 0 ||
      data.ingredientesPopulares.length > 0

    if (!hayDatos) {
      return res.status(200).json({
        ok: true,
        sinDatos: true,
        mensaje: 'No hay información disponible para los filtros seleccionados.',
        data
      })
    }

    return res.status(200).json({
      ok: true,
      sinDatos: false,
      data
    })
  } catch (error) {
    console.error('Error al consultar métricas de productos e ingredientes:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error al consultar las métricas de productos e ingredientes.'
    })
  }
}

exports.exportProductIngredientMetricsCsv = async (req, res, next) => {
  try {
    const filtros = {
      fechaInicio: req.query.fechaInicio || '',
      fechaFin: req.query.fechaFin || '',
      categoria: req.query.categoria || '',
      tipo: req.query.tipo || ''
    }

    const rows = await MetricasProductos.getCsvData(filtros)

    const encabezados = [
      'Producto',
      'Categoría',
      'Tipo',
      'Cantidad vendida',
      'Ingresos'
    ]

    const escapeCsv = (valor) => {
      if (valor === null || valor === undefined) return '""'
      return `"${String(valor).replace(/"/g, '""')}"`
    }

    const lineas = rows.map((row) => {
      return [
        row.producto,
        row.categoria,
        row.tipo,
        row.total_vendido,
        row.ingresos
      ].map(escapeCsv).join(',')
    })

    const csv = [encabezados.join(','), ...lineas].join('\n')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="reporte_metricas_productos_ingredientes.csv"'
    )

    return res.status(200).send(csv)
  } catch (error) {
    console.error('Error al exportar CSV de métricas de productos:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'No fue posible generar el reporte.'
    })
  }
}

exports.getIngredients = (req, res, next) => {
  res.render('admin/ingredientes')
}

exports.getProducts = (req, res, next) => {
  res.render('admin/products')
}

exports.getEvents = (req, res, next) => {
  res.render('admin/events')
}

exports.getMensajes = (req, res, next) => {
  res.render('admin/whatsapp')
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
      return res.status(404).send('Colaborador no encontrado')
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
    const idColaborador = String(req.params.id).trim()
    const idAdminSesion = String(req.session.user.id).trim()

    if (idColaborador === idAdminSesion) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No puedes darte de baja a ti mismo.'
      })
    }

    const resultado = await Colaborador.darDeBaja(idColaborador)

    if (!resultado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No fue posible dar de baja al colaborador.'
      })
    }

    return res.json({
      ok: true,
      mensaje: 'Colaborador eliminado exitosamente.'
    })
  } catch (error) {
    console.log('ERROR EN BAJA:', error)
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error al actualizar la base de datos.'
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
    const [[pedidos], [pendientes]] = await Promise.all([
      Pedido.fetchOrders(),
      Pedido.fetchPendingOrders()
    ])
    res.render('admin/orders', {
      pageTitle: 'Órdenes',
      pedidos,
      pendientes,
      breadcrumbs,
      error: null
    })
  } catch (error) {
    console.error('Error al cargar órdenes:', error)
    res.status(500).render('admin/orders', {
      pageTitle: 'Órdenes',
      pedidos: [],
      pendientes: [],
      breadcrumbs,
      error: 'No hay conexión con la base de datos.'
    })
  }
}

exports.getOrdersJson = async (req, res) => {
  try {
    const [[pedidos], [pendientes]] = await Promise.all([
      Pedido.fetchOrders(),
      Pedido.fetchPendingOrders()
    ])
    return res.json({ ok: true, pedidos, pendientes })
  } catch {
    return res.status(500).json({ ok: false })
  }
}

exports.getOrderItems = async (req, res) => {
  const { id } = req.params
  try {
    const [items] = await Pedido.fetchItems(id)
    return res.status(200).json({ ok: true, items })
  } catch (error) {
    console.error('ERROR getOrderItems:', error)
    return res.status(500).json({ ok: false, message: 'Error al obtener los items.' })
  }
}

exports.postUpdateOrderStatus = async (req, res) => {
  const { id } = req.params
  const { estado } = req.body
  try {
    await Pedido.updateOrderStatus(id, estado)
    return res.json({ ok: true })
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message })
  }
}

exports.postAcceptOrder = async (req, res) => {
  const { id } = req.params
  try {
    await Pedido.updateOrderStatus(id, 'Preparando')
    return res.json({ ok: true })
  } catch (error) {
    return res.status(400).json({ ok: false, message: error.message })
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

// GET /admin/ingredientes
// Renderoza vista de gestion de ingredientes
exports.getIngredientes = (req, res, next) => {
  res.render('admin/ingredientes')
}

// GET /admin/api/ingredientes
// Regresa lista de ingredientes activos (para llenar la tabla en el front yuhhhh)
exports.getIngredientesLista = async (req, res, next) => {
  try {
    const [rows] = await Ingrediente.fetchAll()
    const data = rows.map(row => ({
      ...row,
      categorias: row.cats_raw ? row.cats_raw.split('|') : [row.Categoría]
    }))
    res.status(200).json({
      success: true,
      message: 'Ingredientes recuperados',
      data
    })
  } catch (error) {
    console.error('Error en getIngredientesLista:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener ingredientes de la BD'
    })
  }
}

// GET /admin/api/ingredientes/categorias
// Regresa las categorías disponibles para el dropdown del formulario
exports.getCategorias = async (req, res, next) => {
  try {
    const [categorias] = await Ingrediente.getCategorias()
    res.status(200).json({
      success: true,
      message: 'Categorías recuperadas',
      data: categorias
    })
  } catch (error) {
    console.error('Error en getCategorias:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener categorías de la BD'
    })
  }
}

// GET /admin/api/ingredientes/verificarNombre
// Verifica si ya existe un ingrediente con ese nombre
exports.verificarNombreIngrediente = async (req, res, next) => {
  try {
    const { nombre } = req.query
    console.log('=== VERIFICAR NOMBRE ===')
    console.log('Nombre recibido:', nombre)

    if (!nombre || String(nombre).trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre requerido' })
    }

    const [rows] = await Ingrediente.buscarPorNombre(nombre.trim())
    console.log('Rows encontrados:', rows)
    console.log('Existe:', rows.length > 0)

    const existe = rows.length > 0
    res.status(200).json({ success: true, existe })
  } catch (error) {
    console.error('Error en verificarNombreIngrediente:', error)
    res.status(500).json({ success: false, message: 'Error al verificar nombre' })
  }
}

// POST /admin/api/ingredientes/validad
// Valida campos
exports.validarIngrediente = async (req, res, next) => {
  try {
    const resultado = Ingrediente.verificarCamposVacios(req.body)

    if (resultado.camposVacios) {
      return res.status(200).json({
        success: true,
        camposVacios: true,
        campoFaltante: resultado.campoFaltante
      })
    }

    res.status(200).json({ success: true, camposVacios: false })
  } catch (error) {
    console.error('Error en validarIngrediente:', error)
    res.status(500).json({ success: false, message: 'Error al validar ingrediente' })
  }
}

// IMPORTANT POST /admin/api/ingredientes/crear
// Guarda el nuevo ingrediente en la BD
exports.crearIngrediente = async (req, res, next) => {
  try {
    const { Nombre, Precio, Activo, Imagen } = req.body
    const Categorias = req.body.Categorias // array de categorías seleccionadas

    // Validación de campos obligatorios
    const resultado = Ingrediente.verificarCamposVacios(req.body)
    if (resultado.camposVacios) {
      return res.status(400).json({
        success: false,
        message: `Campo requerido faltante: ${resultado.campoFaltante}`
      })
    }

    // Verificar que el nombre no exista ya
    const [existente] = await Ingrediente.buscarPorNombre(Nombre.trim())
    console.log('Verificar nombre:', Nombre, '→ rows:', existente)
    if (existente.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un ingrediente con ese nombre'
      })
    }

    const nuevoID = Ingrediente.generarID()
    console.log('Nuevo ID Ingrediente:', nuevoID)

    await Ingrediente.insertNuevoIngrediente(
      nuevoID,
      Nombre.trim(),
      Categorias[0],
      parseFloat(Precio),
      Activo !== undefined ? Activo : true,
      Imagen || null
    )
    await Ingrediente.insertCategoriasInsumo(nuevoID, Categorias)

    res.status(200).json({
      success: true,
      message: 'Ingrediente registrado exitosamente',
      registrado: true
    })
  } catch (error) {
    console.error('Error en crearIngrediente:', error)
    res.status(500).json({
      success: false,
      message: 'Error al guardar el ingrediente en la BD'
    })
  }
}

exports.validarIngredienteEliminable = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido' })

    const [productos] = await Ingrediente.getProductosVinculados(id)
    res.status(200).json({
      success: true,
      vinculado: productos.length > 0,
      productos: productos.map(p => p.Nombre)
    })
  } catch (error) {
    console.error('Error en validarIngredienteEliminable:', error)
    res.status(500).json({ success: false, message: 'Error al validar ingrediente' })
  }
}

exports.eliminarIngrediente = async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, message: 'ID requerido' })

    await Ingrediente.eliminarIngrediente(id)
    res.status(200).json({ success: true, message: 'Ingrediente eliminado correctamente' })
  } catch (error) {
    console.error('Error en eliminarIngrediente:', error)
    res.status(500).json({ success: false, message: 'Error al eliminar ingrediente' })
  }
}

exports.actualizarIngrediente = async (req, res, next) => {
  try {
    const { id } = req.params
    const { Nombre, Precio, Activo, Imagen } = req.body
    const Categorias = req.body.Categorias // array de categorías seleccionadas

    if (!id || !Nombre || !Categorias || !Categorias.length || !Precio) {
      return res.status(400).json({ success: false, message: 'Campos obligatorios faltantes' })
    }

    await Ingrediente.actualizarIngrediente(
      id, Nombre.trim(), Categorias[0],
      parseFloat(Precio), Activo, Imagen || null
    )
    await Ingrediente.deleteCategoriasInsumo(id)
    await Ingrediente.insertCategoriasInsumo(id, Categorias)

    res.status(200).json({ success: true, message: 'Ingrediente actualizado correctamente' })
  } catch (error) {
    console.error('Error en actualizarIngrediente:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Todo lo de las metricas
exports.getMetricasIngredientes = (req, res, next) => {
  res.render('admin/metricsIngredientes')
}

exports.getMetricasIngredientesData = async (req, res, next) => {
  try {
    const data = await Ingrediente.getMetricas()
    res.status(200).json({ ok: true, data })
  } catch (error) {
    console.error('Error en getMetricasIngredientesData:', error)
    res.status(500).json({ ok: false, mensaje: 'Error al obtener métricas' })
  }
}

// Fuchi, collaborator things
exports.getNewCollaborator = async (req, res, next) => {
  try {
    const idGenerado = await Colaborador.generateUniqueId()

    res.render('admin/newCollaborator', {
      pageTitle: 'Registrar colaborador',
      error: null,
      oldInput: {
        id_colaborador: idGenerado,
        nombre: '',
        rol: 'Colaborador'
      }
    })
  } catch (error) {
    console.log(error)
    res.redirect('/admin/colaboradores')
  }
}

exports.postNewCollaborator = async (req, res, next) => {
  try {
    const idColaborador = String(req.body.id_colaborador || '').trim()
    const nombre = String(req.body.nombre || '').trim()
    const rol = String(req.body.rol || '').trim()
    const contrasena = String(req.body.contrasena || '').trim()

    if (!idColaborador || !nombre || !rol || !contrasena) {
      return res.status(400).render('admin/newCollaborator', {
        pageTitle: 'Registrar colaborador',
        error: 'Datos incompletos o incorrectos.',
        oldInput: {
          id_colaborador: idColaborador,
          nombre,
          rol
        }
      })
    }

    if (rol !== 'Administrador' && rol !== 'Colaborador') {
      return res.status(400).render('admin/newCollaborator', {
        pageTitle: 'Registrar colaborador',
        error: 'Rol inválido.',
        oldInput: {
          id_colaborador: idColaborador,
          nombre,
          rol: 'Colaborador'
        }
      })
    }

    const yaExiste = await Colaborador.existsById(idColaborador)

    if (yaExiste) {
      return res.status(400).render('admin/newCollaborator', {
        pageTitle: 'Registrar colaborador',
        error: 'Datos previamente registrados.',
        oldInput: {
          id_colaborador: idColaborador,
          nombre,
          rol
        }
      })
    }

    // const contrasenaHasheada = await bcrypt.hash(contrasena, 12)

    await Colaborador.create(
      idColaborador,
      rol,
      nombre,
      contrasena
    )

    return res.redirect('/admin/colaboradores')
  } catch (error) {
    console.log('ERROR EN ALTA DE COLABORADOR:', error)

    return res.status(500).render('admin/newCollaborator', {
      pageTitle: 'Registrar colaborador',
      error: 'Error al guardar el colaborador.',
      oldInput: {
        id_colaborador: req.body.id_colaborador || '',
        nombre: req.body.nombre || '',
        rol: req.body.rol || 'Colaborador'
      }
    })
  }
}

// dias habiless
exports.getDiasHabiles = async (req, res, next) => {
  try {
    const diasHabiles = await Calendario.fetchDiasHabiles()
    const sucursales = await Calendario.fetchSucursales()
    const idCalendario = await Calendario.generateUniqueId()

    return res.render('admin/diasHabiles', {
      pageTitle: 'Días hábiles',
      diasHabiles,
      sucursales,
      error: null,
      mensaje: null,
      oldInput: {
        id_calendario: idCalendario,
        id_sucursal: '',
        fecha: '',
        es_laboral: '1',
        descripcion: ''
      }
    })
  } catch (error) {
    console.error('Error al recuperar días hábiles:', error)

    return res.status(500).render('admin/diasHabiles', {
      pageTitle: 'Días hábiles',
      diasHabiles: [],
      sucursales: [],
      error: 'No se pudo recuperar la configuración de días hábiles.',
      mensaje: null,
      oldInput: {
        id_calendario: '',
        id_sucursal: '',
        fecha: '',
        es_laboral: '1',
        descripcion: ''
      }
    })
  }
}

exports.postDiasHabiles = async (req, res, next) => {
  try {
    const idCalendario = String(req.body.id_calendario || '').trim()
    const idSucursal = String(req.body.id_sucursal || '').trim()
    const fecha = String(req.body.fecha || '').trim()
    const esLaboral = String(req.body.es_laboral || '').trim()
    const descripcion = String(req.body.descripcion || '').trim()

    const sucursales = await Calendario.fetchSucursales()
    const diasHabiles = await Calendario.fetchDiasHabiles()

    if (!idCalendario || !idSucursal || !fecha || (esLaboral !== '0' && esLaboral !== '1')) {
      return res.status(400).render('admin/diasHabiles', {
        pageTitle: 'Días hábiles',
        diasHabiles,
        sucursales,
        error: 'Información inválida. Verifica los datos capturados.',
        mensaje: null,
        oldInput: {
          id_sucursal: idSucursal,
          fecha,
          es_laboral: esLaboral || '1',
          descripcion
        }
      })
    }

    await Calendario.createDiaHabil(
      idCalendario,
      idSucursal,
      fecha,
      Number(esLaboral),
      descripcion || null
    )

    const diasHabilesActualizados = await Calendario.fetchDiasHabiles()
    const nuevoIdCalendario = await Calendario.generateUniqueId()

    return res.render('admin/diasHabiles', {
      pageTitle: 'Días hábiles',
      diasHabiles: diasHabilesActualizados,
      sucursales,
      error: null,
      mensaje: 'Configuración guardada exitosamente.',
      oldInput: {
        id_calendario: nuevoIdCalendario,
        id_sucursal: '',
        fecha: '',
        es_laboral: '1',
        descripcion: ''
      }
    })
  } catch (error) {
    console.error('Error al guardar días hábiles:', error)

    const sucursales = await Calendario.fetchSucursales().catch(() => [])
    const diasHabiles = await Calendario.fetchDiasHabiles().catch(() => [])

    return res.status(500).render('admin/diasHabiles', {
      pageTitle: 'Días hábiles',
      diasHabiles,
      sucursales,
      error: 'No fue posible guardar la configuración.',
      mensaje: null,
      oldInput: {
        id_sucursal: req.body.id_sucursal || '',
        fecha: req.body.fecha || '',
        es_laboral: req.body.es_laboral || '1',
        descripcion: req.body.descripcion || ''
      }
    })
  }
}
// Sección Categorias

// GET categorias-tipos
exports.getCategoriasTipos = (req, res, next) => {
  res.render('admin/categoriasTipos')
}

// GET categorias
exports.getCategoriasLista = async (req, res, next) => {
  try {
    const [categorias] = await Categoria.fetchAll()
    res.status(200).json({ success: true, data: categorias })
  } catch (error) {
    console.error('Error en getCategoriasLista:', error)
    res.status(500).json({ success: false, message: 'Error al obtener categorías' })
  }
}

// Verifica nombre de la categoria
exports.verificarNombreCategoria = async (req, res, next) => {
  try {
    const { nombre } = req.query
    if (!nombre || String(nombre).trim() === '') {
      return res.status(400).json({ success: false, message: 'Nombre requerido' })
    }
    const [rows] = await Categoria.buscarPorNombre(nombre.trim())
    res.status(200).json({ success: true, existe: rows.length > 0 })
  } catch (error) {
    console.error('Error en verificarNombreCategoria:', error)
    res.status(500).json({ success: false, message: 'Error al verificar nombre' })
  }
}

// Inserta nueva categoria
exports.crearCategoria = async (req, res, next) => {
  try {
    const { Nombre } = req.body
    if (!Nombre || String(Nombre).trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }
    const [existente] = await Categoria.buscarPorNombre(Nombre.trim())
    if (existente.length > 0) {
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' })
    }
    await Categoria.insertNuevaCategoria(Nombre.trim())
    res.status(200).json({ success: true, message: 'Categoría registrada exitosamente' })
  } catch (error) {
    console.error('Error en crearCategoria:', error)
    res.status(500).json({ success: false, message: 'Error al guardar la categoría' })
  }
}

// GET verificarEnUso
exports.verificarCategoriaEnUso = async (req, res, next) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre)
    const uso = await Categoria.buscarEnUso(nombre)
    res.status(200).json({
      success: true,
      enUso: uso.totalInsumos > 0 || uso.totalProductos > 0,
      totalInsumos: uso.totalInsumos,
      totalProductos: uso.totalProductos
    })
  } catch (error) {
    console.error('Error en verificarCategoriaEnUso:', error)
    res.status(500).json({ success: false, message: 'Error al verificar uso' })
  }
}

// Actualiza categoria
exports.actualizarCategoria = async (req, res, next) => {
  try {
    const oldNombre = decodeURIComponent(req.params.nombre)
    const { Nombre: newNombre } = req.body

    if (!newNombre || String(newNombre).trim() === '') {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    if (oldNombre === newNombre.trim()) {
      return res.status(200).json({ success: true, message: 'Sin cambios' })
    }

    const [existente] = await Categoria.buscarPorNombre(newNombre.trim())
    if (existente.length > 0) {
      return res.status(409).json({ success: false, message: 'Ya existe una categoría con ese nombre' })
    }

    await Categoria.actualizarCategoria(oldNombre, newNombre.trim())
    res.status(200).json({ success: true, message: 'Categoría actualizada correctamente' })
  } catch (error) {
    console.error('Error en actualizarCategoria:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Eliminar categoria
exports.eliminarCategoria = async (req, res, next) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre)

    const uso = await Categoria.buscarEnUso(nombre)
    if (uso.totalInsumos > 0 || uso.totalProductos > 0) {
      return res.status(409).json({
        success: false,
        enUso: true,
        totalInsumos: uso.totalInsumos,
        totalProductos: uso.totalProductos
      })
    }

    await Categoria.eliminarCategoria(nombre)
    res.status(200).json({ success: true, message: 'Categoría eliminada correctamente' })
  } catch (error) {
    console.error('Error en eliminarCategoria:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET tipos
exports.getTiposLista = async (req, res, next) => {
  try {
    const [tipos] = await Tipo.fetchAll()
    res.status(200).json({ success: true, data: tipos })
  } catch (error) {
    console.error('Error en getTiposLista:', error)
    res.status(500).json({ success: false, message: 'Error al obtener tipos' })
  }
}

// GET verificar nombre tipo
exports.verificarNombreTipo = async (req, res, next) => {
  try {
    const { nombre } = req.query
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' })
    const [rows] = await Tipo.buscarPorNombre(nombre.trim())
    res.status(200).json({ existe: rows.length > 0 })
  } catch (error) {
    console.error('Error en verificarNombreTipo:', error)
    res.status(500).json({ success: false, message: 'Error al verificar nombre' })
  }
}

// POST crear tipo
exports.crearTipo = async (req, res, next) => {
  try {
    const { nombre } = req.body
    if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' })
    await Tipo.insertNuevoTipo(nombre.trim())
    res.status(200).json({ success: true, message: 'Tipo registrado exitosamente' })
  } catch (error) {
    console.error('Error en crearTipo:', error)
    res.status(500).json({ success: false, message: 'Error al guardar el tipo' })
  }
}

// GET verificarEnUso tipo
exports.verificarTipoEnUso = async (req, res, next) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre)
    const uso = await Tipo.buscarEnUso(nombre)
    res.status(200).json({
      enUso: uso.totalProductos > 0,
      totalProductos: uso.totalProductos
    })
  } catch (error) {
    console.error('Error en verificarTipoEnUso:', error)
    res.status(500).json({ success: false, message: 'Error al verificar uso' })
  }
}

// PUT actualizar tipo
exports.actualizarTipo = async (req, res, next) => {
  try {
    const oldNombre = decodeURIComponent(req.params.nombre)
    const { nombre: newNombre } = req.body

    if (!newNombre || !newNombre.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' })
    }

    if (newNombre.trim() !== oldNombre) {
      const [rows] = await Tipo.buscarPorNombre(newNombre.trim())
      if (rows.length > 0) {
        return res.status(409).json({ success: false, message: `Ya existe un tipo con el nombre "${newNombre.trim()}"` })
      }
    }

    await Tipo.actualizarTipo(oldNombre, newNombre.trim())
    res.status(200).json({ success: true, message: 'Tipo actualizado correctamente' })
  } catch (error) {
    console.error('Error en actualizarTipo:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Eliminar tipo
exports.eliminarTipo = async (req, res, next) => {
  try {
    const nombre = decodeURIComponent(req.params.nombre)

    const uso = await Tipo.buscarEnUso(nombre)
    if (uso.totalProductos > 0) {
      return res.status(409).json({
        success: false,
        enUso: true,
        totalProductos: uso.totalProductos
      })
    }

    await Tipo.eliminarTipo(nombre)
    res.status(200).json({ success: true, message: 'Tipo eliminado correctamente' })
  } catch (error) {
    console.error('Error en eliminarTipo:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET sucursales
exports.getSucursales = (req, res, next) => {
  res.render('admin/sucursales')
}

// GET lista sucursales
exports.getSucursalesLista = async (req, res, next) => {
  try {
    const [sucursales] = await Sucursal.fetchAll()
    res.status(200).json({ success: true, data: sucursales })
  } catch (error) {
    console.error('Error en getSucursalesLista:', error)
    res.status(500).json({ success: false, message: 'Error al obtener sucursales' })
  }
}

// Crea Nueva Sucursal
exports.crearSucursal = async (req, res, next) => {
  try {
    const { Nombre, Ciudad, Estado, Pais, Municipio, Calle, Longitud, Latitud } = req.body
    if (!Nombre || !Ciudad || !Estado || !Pais || !Municipio || !Calle) {
      return res.status(400).json({ success: false, message: 'Todos los campos obligatorios son requeridos' })
    }
    const id = Sucursal.generarID()
    await Sucursal.insertNuevaSucursal(id, Nombre.trim(), Ciudad.trim(), Estado.trim(), Pais.trim(), Municipio.trim(), Calle.trim(), Longitud, Latitud)
    res.status(200).json({ success: true, message: 'Sucursal registrada exitosamente', id })
  } catch (error) {
    console.error('Error en crearSucursal:', error)
    res.status(500).json({ success: false, message: 'Error al guardar la sucursal' })
  }
}

// actualiza infor sucursal
exports.actualizarSucursal = async (req, res, next) => {
  try {
    const { id } = req.params
    const { Nombre, Ciudad, Estado, Pais, Municipio, Calle, Longitud, Latitud } = req.body
    if (!Nombre || !Ciudad || !Estado || !Pais || !Municipio || !Calle) {
      return res.status(400).json({ success: false, message: 'Todos los campos obligatorios son requeridos' })
    }

    const [existing] = await Sucursal.buscarPorNombre(Nombre.trim())
    const duplicado = existing.find(s => s.ID_Sucursal !== id)
    if (duplicado) {
      return res.status(409).json({ success: false, message: `Ya existe una sucursal con el nombre "${Nombre.trim()}"` })
    }

    await Sucursal.actualizarSucursal(id, Nombre.trim(), Ciudad.trim(), Estado.trim(), Pais.trim(), Municipio.trim(), Calle.trim(), Longitud, Latitud)
    res.status(200).json({ success: true, message: 'Sucursal actualizada correctamente' })
  } catch (error) {
    console.error('Error en actualizarSucursal:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// verifica si es eliminable
exports.verificarSucursalEliminable = async (req, res, next) => {
  try {
    const { id } = req.params
    const uso = await Sucursal.buscarEnUso(id)
    res.status(200).json({
      eliminable: uso.totalTurnos === 0,
      totalTurnos: uso.totalTurnos
    })
  } catch (error) {
    console.error('Error en verificarSucursalEliminable:', error)
    res.status(500).json({ success: false, message: 'Error al verificar' })
  }
}

// elimina suc
exports.eliminarSucursal = async (req, res, next) => {
  try {
    const { id } = req.params
    const uso = await Sucursal.buscarEnUso(id)
    if (uso.totalTurnos > 0) {
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar: tiene ${uso.totalTurnos} turno(s) asignado(s).`
      })
    }
    await Sucursal.eliminarSucursal(id)
    res.status(200).json({ success: true, message: 'Sucursal eliminada correctamente' })
  } catch (error) {
    console.error('Error en eliminarSucursal:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getMetricasRoyalty = async (request, response, next) => {
  try {
    const [flujoClientes] = await MetricasClientes.getFlujoClientesMensuales()

    const labelsMeses = flujoClientes.map(row => row.mes)
    const dataClientes = flujoClientes.map(row => row.total_clientes)

    response.render('metricsRoyalty.ejs', {
      chartLabels: JSON.stringify(labelsMeses),
      chartData: JSON.stringify(dataClientes)
    })
  } catch (error) {
    console.log(error)
  }
}
