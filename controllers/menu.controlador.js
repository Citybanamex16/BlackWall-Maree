const fs = require('fs')
const path = require('path')
const nav = require('../models/breadcrumbs.model.js')
const productos = require('../models/MenuDigital/productos.model.js')
const ingrediente = require('../models/ingrediente.model.js')
const categorías = require('../models/MenuDigital/categorías.model.js')
const tipos = require('../models/MenuDigital/tipos.model.js')
const promos = require('../models/promociones.model.js')
const Pedido = require('../models/pedidos.model.js')
const sucursal = require('../models/MenuDigital/sucursales.model.js')
const feedback = require('../models/MenuDigital/feedback.model.js')
const db = require('../util/database.js')

const CREMA_BATIDA_INGREDIENT_ID = 'INCRMBT001'
const directorioImagenesProductos = path.join(__dirname, '..', 'public', 'uploads', 'productos')
const prefijoImagenesProductos = '/uploads/productos/'

function parseBooleanFlag (value) {
  if (typeof value === 'string') {
    return ['true', '1', 'on', 'si'].includes(value.trim().toLowerCase()) ? 1 : 0
  }

  return value === true || value === 1 ? 1 : 0
}

function firstDefined (...values) {
  return values.find(value => value !== undefined)
}

function parseIngredientesPayload (value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value !== 'string' || value.trim() === '') {
    return []
  }

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    return []
  }
}

function obtenerRutaImagenProducto (archivo) {
  return archivo ? `${prefijoImagenesProductos}${archivo.filename}` : null
}

async function eliminarImagenSubidaProducto (archivo) {
  if (!archivo) return

  try {
    await fs.promises.unlink(path.join(directorioImagenesProductos, archivo.filename))
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn('No se pudo eliminar la imagen subida del producto:', error)
    }
  }
}

async function fetchPlatilloRows (id) {
  try {
    return await db.execute(
      `SELECT p.ID_Producto, p.Nombre, p.Precio, p.Disponible,
              p.Categoría as base,
              p.Permite_Crema_Batida as permiteCremaBatida,
              i.ID_Insumo as ing_id,
              i.Nombre    as ing_nombre,
              i.Precio    as ing_precio
       FROM producto p
       LEFT JOIN producto_tiene_insumo pti ON p.ID_Producto = pti.ID_Producto
       LEFT JOIN insumo i ON pti.ID_Insumo = i.ID_Insumo
       WHERE p.ID_Producto = ?`,
      [id]
    )
  } catch (error) {
    if (error.code !== 'ER_BAD_FIELD_ERROR') throw error

    return db.execute(
      `SELECT p.ID_Producto, p.Nombre, p.Precio, p.Disponible,
              p.Categoría as base,
              0 as permiteCremaBatida,
              i.ID_Insumo as ing_id,
              i.Nombre    as ing_nombre,
              i.Precio    as ing_precio
       FROM producto p
       LEFT JOIN producto_tiene_insumo pti ON p.ID_Producto = pti.ID_Producto
       LEFT JOIN insumo i ON pti.ID_Insumo = i.ID_Insumo
       WHERE p.ID_Producto = ?`,
      [id]
    )
  }
}

// CU11 Vizualisar Menu
exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  const SesionData = request.session.cliente
  response.render('cliente/menu', { breadcrumbs, datosCliente: SesionData })
}

exports.getMenuData = async (request, response, next) => {
  console.log('GetMenu ejecutandose...')
  try {
    const [Allcategories, productsData, AllTypes] = await Promise.all([
      categorías.fecthAll(),
      productos.getValidProductData(),
      tipos.fetchAll()
    ])

    console.log('All Promises realizada con exito')
    // console.log('Categorías Info: ', Allcategories)
    // console.log('Products Info: ', productsData)

    response.status(200).json({
      ok: true,
      message: 'Consultas realizadas con exito',
      arrayCategorías: Allcategories,
      arrayProductsInfo: productsData,
      arrayTipos: AllTypes
    })
    console.log('Proceso finalizado con exito')
  } catch (err) {
    console.log('Error en get Menu: ', err)
    response.status(500).json({
      ok: false,
      message: err
    })
  }
}

exports.getMenuPromos = async (req, res, nex) => {
  console.log('Obteniendo PU & PE')
  try {
    const [PUs, PEs, PRs] = await Promise.all([
      promos.getPromotionsBySource('PU'),
      promos.getPromotionsBySource('PE'),
      promos.getPromotionsBySource('PR')
    ])

    console.log('All promises hechas con exito')
    res.status(200).json({
      ok: true,
      message: 'PE & PU obtenidos',
      allPUs: PUs,
      allPEs: PEs,
      allPRs: PRs
    })
  } catch (err) {
    console.log('Error en consulta de PEs & PUs: ', err)
    res.status(500).json({
      ok: true,
      message: 'PE & PU no obtenidos, error',
      error: err
    })
  }
}

exports.getMapaSucursales = (req, res, nex) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  res.render('cliente/mapaSucursal', { breadcrumbs })
}

exports.getAllSucursales = async (req, res, nex) => {
  console.log('obteniendo Sucursales ')
  try {
    const sucursalesData = await sucursal.fetchAll()

    console.log('Sucursales recuperadas')
    res.status(200).json({
      ok: true,
      message: 'Sucursales obtenidas de manera correcta',
      allSucursales: sucursalesData
    })
  } catch (err) {
    console.log('Error: ', err)
    res.status(500).json({
      ok: false,
      message: 'Sucursales no obtenidas'
    })
  }
}

exports.getOrden = async (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  const sesion = request.session.cliente

  // Solo intentamos calcular si el usuario está logueado
  if (sesion && sesion.telefono) {
    try {
      // 1. Llamamos al SP que nos trae el estado del cliente (visitas, nivel, etc.)
      const [statusData] = await Royalty.fetchClientStatus(sesion.telefono)

      if (statusData && statusData.length > 0) {
        const info = statusData[0]

        // 2. CÁLCULO DE TOKENS (Regla: Visitas/10 - Gastados)
        const visitas = info.visitas|| 0
        const gastados = info.tokens_gastados || 0
        const tokensDisponibles = Math.floor(visitas / 10) - gastados

        // 3. OBTENER DESCUENTO (Atributo: descuento_premio desde la DB)
        const descuentoDecimal = parseFloat(info.descuento_premio) || 0
        const descuentoPorcentaje = Math.round(descuentoDecimal * 100)

        // 4. Actualizamos la sesión con datos reales de la DB
        request.session.cliente.tokensDisponibles = tokensDisponibles > 0 ? tokensDisponibles : 0
        request.session.cliente.descuentoRoyalty = descuentoPorcentaje
        request.session.cliente.nivel = info.nivel

        console.log(`Tokens calculados para ${sesion.telefono}: ${tokensDisponibles}`)
      }
    } catch (err) {
      console.error('Error al sincronizar datos de Royalty:', err)
    }
  }

  response.render('cliente/order', {
    datosCliente: request.session.cliente
  })
}

exports.getPlatillo = async (request, response, next) => {
  const id = request.query.id
  try {
    const [rows] = await fetchPlatilloRows(id)

    if (rows.length === 0) {
      return response.status(404).json({ disponible: false, mensaje: 'Platillo no encontrado' })
    }

    const row = rows[0]
    const disponible = row.Disponible === 1 || row.Disponible === '1'

    const ingredientes = rows
      .filter(r => r.ing_id)
      .map(r => ({ id: r.ing_id, nombre: r.ing_nombre, precio: parseFloat(r.ing_precio) }))

    const permiteCremaBatida = row.permiteCremaBatida === 1 || row.permiteCremaBatida === '1'
    const [catalogoRows] = await db.execute(
      `SELECT i.ID_Insumo as id, i.Nombre as nombre, i.Precio as precio
       FROM insumo i
       JOIN insumo_categoria ic ON i.ID_Insumo = ic.ID_Insumo
       WHERE ic.Nom_Categoria = ? AND i.Activo = 1
       ORDER BY i.Nombre`,
      [row.base]
    )
    const [cremaBatidaRows] = permiteCremaBatida
      ? await db.execute(
          'SELECT ID_Insumo as id, Nombre as nombre, Precio as precio FROM insumo WHERE Activo = 1 AND ID_Insumo = ? LIMIT 1',
          [CREMA_BATIDA_INGREDIENT_ID]
        )
      : [[]]
    const cremaBatida = cremaBatidaRows[0] || null

    response.status(200).json({
      disponible,
      nombre: row.Nombre,
      precio: row.Precio,
      base: row.base,
      permiteCremaBatida,
      cremaBatida: cremaBatida
        ? {
            id: cremaBatida.id,
            nombre: cremaBatida.nombre,
            precio: parseFloat(cremaBatida.precio)
          }
        : null,
      ingredientes,
      catalogo: catalogoRows
        .filter(r => r.id !== CREMA_BATIDA_INGREDIENT_ID)
        .map(r => ({ id: r.id, nombre: r.nombre, precio: parseFloat(r.precio) }))
    })
  } catch (err) {
    console.error('Error buscando platillo:', err)
    next(err)
  }
}

exports.agregarItem = (request, response, next) => {
  const { nombre, precio, desc } = request.body
  console.log(`Item agregado: ${nombre} - $${precio}`)
  response.status(200).json({ agregado: true, nombre, precio, desc })
}

/* ==== middleware de contexto de sesion ==== */
// middlewares/contextoUsuario.middleware.js

// middleware/contextoUsuario.js

const Royalty = require('../models/royalty.model')

exports.contextoUsuario = async (request, response, next) => {
  const isLoggedIn = request.session?.isLoggedIn === true
  const cliente = request.session?.cliente || null

  let nivelRoyalty = 'CLIENTE_GENERAL'

  try {
    // Solo consultar si hay sesión de cliente
    if (
      isLoggedIn &&
      request.session?.rol === 'Usuario' &&
      cliente?.telefono
    ) {
      console.log('📡 [ROYALTY] Consultando nivel del cliente...')

      const telefono = cliente.telefono

      const [statusData] = await Royalty.fetchClientStatus(telefono)

      const clienteInfo = statusData?.[0]

      nivelRoyalty = clienteInfo?.nivel || 'CLIENTE_GENERAL'

      console.log('👑 [ROYALTY] Nivel detectado:', nivelRoyalty)
    }

    request.usuario = {
      autenticado: isLoggedIn,
      rol: request.session?.rol || 'cliente_general',

      datos: cliente,

      nombre: cliente?.nombre || 'Invitado',
      telefono: cliente?.telefono || null,
      visitas: cliente?.visitas || 0,

      nivelRoyalty,
      esRoyalty: nivelRoyalty !== 'CLIENTE_GENERAL'
    }

    console.log('🔐 [MIDDLEWARE]')
    console.log('   Usuario:', request.usuario.nombre)
    console.log('   Nivel:', request.usuario.nivelRoyalty)

    next()
  } catch (error) {
    console.error('❌ Error obteniendo contexto de usuario:', error)

    // Fallback seguro
    request.usuario = {
      autenticado: false,
      rol: 'cliente_general',
      datos: null,
      nombre: 'Invitado',
      telefono: null,
      visitas: 0,
      nivelRoyalty: 'CLIENTE_GENERAL',
      esRoyalty: false
    }

    next()
  }
}

exports.validarPedido = async (request, response, next) => {
  const usuario = request.usuario // Trae: nombre, esRoyalty, nivelRoyalty, etc.

  const { items } = request.body

  try {
    const tienePremio = items.some(i => i.premioAplicado === true);
    let descuentoRecompensa = 0;

    if (tienePremio) {
      const [statusData] = await Royalty.fetchClientStatus(usuario.telefono);
      const info = statusData[0];
      
      const tokensReales = Math.floor(info.visitas / 10) - (info.tokens_gastados || 0);

      if (tokensReales <= 0) {
        return response.status(200).json({ 
          pedidoValido: false, 
          mensaje: 'No tienes tokens suficientes para reclamar este premio.' 
        });
      }
      descuentoRecompensa = parseFloat(info.descuento_premio) || 0;
    }

  // ── Validación básica ──
  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoValido: false, mensaje: 'El pedido está vacío' })
  }

    // ── 1. Recolección de IDs ──
    const idsProductos = [...new Set(items.map(i => i.id))]
    const idsInsumos = [...new Set(items.flatMap(i => [
      ...(i.ingredientes_adentro || []).map(ins => ins.id_insumo),
      ...(i.ingredientes_toppings || []).map(ins => ins.id_insumo)
    ]))]

    // ── 2. Disponibilidad ──
    const idsDisponibles = await Pedido.verificarDisponibilidadPorId(idsProductos)
    if (!idsProductos.every(id => idsDisponibles.includes(id))) {
      return response.status(200).json({ pedidoValido: false, mensaje: 'Algunos platillos ya no están disponibles.' })
    }

    // ── 3. Fase de Inteligencia: El Compendio ──
    // Obtenemos precios base e ingredientes
    const listaOro = await Pedido.obtenerListaDeOro(idsProductos, idsInsumos)

    // Armamos el compendio de promociones filtrado por el contexto del usuario
    const compendio = await Pedido.obtenerCompendioPromociones(usuario)

    // ── 4. Inspección del Policía (Item por Item) ──
    let granTotalOficial = 0
    const erroresPrecio = []

    items.forEach((item, index) => {
      // Pasamos el compendio para que el cálculo sepa qué promo aplicar
      const precioOficial = Pedido.calcularPrecioRealItem(item, listaOro, compendio, descuentoRecompensa)
      
      const precioRecibido = parseFloat(
        String(item.precio_total ?? item.precio).replace(/[^0-9.]/g, '')
      )

      console.log(` ⚖️ [COMPARACIÓN] Item ${index + 1}: Poli calculó $${precioOficial} | Front envió $${precioRecibido}`);

      if (Math.abs(precioOficial - precioRecibido) > 0.01) {
        erroresPrecio.push(`Item ${index + 1}: se esperaba $${precioOficial} pero se recibió $${precioRecibido}`)
      }
      granTotalOficial += precioOficial
    })

    if (erroresPrecio.length > 0) {
      return response.status(200).json({
        pedidoValido: false,
        mensaje: 'Discrepancia de precios detectada.',
        detalles: erroresPrecio
      })
    }
    return response.status(200).json({
      pedidoValido: true,
      totalVerificado: granTotalOficial
    })
  } catch (err) {
    if (err.code === 'INVALID_ITEM_CONFIGURATION') {
      return response.status(200).json({
        pedidoValido: false,
        mensaje: err.message
      })
    }
    console.error('💥 Error en Policía:', err)
    next(err)
  }
}

exports.confirmarPedido = async (request, response, next) => {
  const { items, forma, telefono: telefonoBody, nombre: nombreBody, direccion, descripcion } = request.body
    console.error('💥 Error en Policía:', err)
    next(err)
  }


exports.confirmarPedido = async (request, response, next) => {
  const { items, forma, telefono: telefonoBody, nombre: nombreBody, direccion, descripcion } = request.body
  const sesion = request.session.cliente
  const telefonoFinal = sesion ? String(sesion.telefono) : telefonoBody
  const nombreFinal = sesion ? sesion.nombre : (String(nombreBody || '').trim() || 'Cliente')
  const telefonoLimpio = String(telefonoFinal).replace(/[\s-]/g, '')

  // 1. Validaciones básicas de entrada
  const formasValidas = ['Pick-Up', 'Sucursal', 'Delivery']
  if (!formasValidas.includes(forma)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Forma de entrega inválida' })
  }
  if (!/^\d{7,15}$/.test(telefonoLimpio)) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Teléfono inválido' })
  }
  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ pedidoConfirmado: false, mensaje: 'El pedido está vacío' })
  }

  const descripcionFinal = String(descripcion || '').trim()

  if (descripcionFinal.length > 500) {
    return response.status(400).json({
      pedidoConfirmado: false,
      mensaje: 'La especificación no puede superar los 500 caracteres.'
    })
  }

  try {
    // --- INICIO DEL POLICÍA DE ROYALTY ---
    const itemConPremio = items.find(i => i.premioAplicado === true)
    let idPromocionARegistrar = null

    if (itemConPremio) {
      // A. Verificar tokens reales en la Base de Datos
      const [statusData] = await Royalty.fetchClientStatus(telefonoLimpio)
      if (!statusData || statusData.length === 0) {
        return response.status(403).json({ pedidoConfirmado: false, mensaje: 'No se encontró información de Royalty' })
      }

      const info = statusData[0]
      const tokensDisponibles = Math.floor(info.visitas / 10) - info.tokens_gastados

      if (tokensDisponibles <= 0) {
        return response.status(403).json({ pedidoConfirmado: false, mensaje: 'Fraude detectado: No tienes tokens disponibles' })
      }

      // B. Recalcular precio original desde la DB (El policía no confía en el precio del front)
      let precioOriginalDB = 0
      if (itemConPremio.producto_base) {
        const [res] = await productos.getCrepaPersoPrecioBase()
        precioOriginalDB = res[0].PrecioBase
        // Aquí podrías sumar el precio de los ingredientes si tu lógica lo requiere
      } else {
        const [res] = await productos.fecthOneProduct(itemConPremio.id)
        precioOriginalDB = res[0].Precio
      }

      // C. Verificar que el descuento aplicado sea el que le corresponde a su nivel
      // Asumimos que el porcentaje viene de la sesión o una constante por nivel
      const porcentajePermitido = sesion.descuentoRoyalty || 0
      const precioEsperado = precioOriginalDB - (precioOriginalDB * (porcentajePermitido / 100))

      // Comparar con un margen de error pequeño por decimales
      if (Math.abs(parseFloat(itemConPremio.precio_total) - precioEsperado) > 0.1) {
        return response.status(400).json({ pedidoConfirmado: false, mensaje: 'Fraude detectado: El precio del premio no coincide' })
      }

      // Si llegamos aquí, el policía da el visto bueno
      // Definimos qué ID de promoción registrar (puedes mapearlo por nivel)
      idPromocionARegistrar = info.ID_Promocion_Actual || 1
    }
    // --- FIN DEL POLICÍA DE ROYALTY ---

    // 2. Guardar el pedido (Proceso normal)
    await Pedido.verificarOCrearCliente(telefonoLimpio, nombreFinal)
    const idOrden = await Pedido.guardarOrden(
      telefonoLimpio,
      forma,
      nombreFinal,
      forma === 'Delivery' ? (direccion || null) : null,
      descripcionFinal || null
    )
    await Pedido.guardarItems(idOrden, items)

    // 3. Si se usó un premio, registrar el canje para restar el token
    if (idPromocionARegistrar) {
      await Royalty.registrarCanje(telefonoLimpio, idPromocionARegistrar)
    }

    response.status(200).json({ pedidoConfirmado: true, idOrden })
  } catch (error) {
    console.error('Error al confirmar pedido:', error)
    response.status(500).json({ pedidoConfirmado: false, mensaje: 'Error al guardar el pedido' })
  }
}

/* CU 14 Visualizar Catalogo Productos */
exports.getProducts = (req, res, next) => {
  const breadcrumbs = nav.getBreadcrumbs('AdminSection')
  res.render('admin/products', { breadcrumbs })
}

exports.getProductsCatalog = async (req, res, next) => {
  console.log('Backend obteniendo todos los Productos, ingredientes & catalogos')
  try {
    // 1. Llamado en paralelo de consultas con Promise.all()
    const [Allcategories, allProductsData] = await Promise.all([
      categorías.fecthAll(), // Async BD call 1.
      productos.getAllProductsInfo() // async BD call
    ])

    // console.log('Categorías catalog: ', Allcategories)
    // console.log('Products catalog: ', allProductsData)

    res.status(200).json({
      ok: true,
      message: 'Catalogos Obtenido con exito',
      arrayCategorías: Allcategories,
      arrayProductsCatalog: allProductsData
    })
    console.log('Catalogos obtenidos con exito')
  } catch (err) {
    console.log('Error en get Menu: ', err)
    res.status(500).json({
      ok: false,
      message: err.message || 'Error al obtener catalogos de productos'
    })
  }
}

exports.getTypes = async (req, res, nex) => {
  try {
    const productTypes = await tipos.fetchAll()

    res.status(200).json({
      ok: true,
      message: 'Tipos recuperados',
      data: productTypes
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      ok: false,
      message: 'Error al obtener los tipos de la BD'
    })
  }
}

/* FIN Visualizar Catalogo */

exports.getCategorys = async (req, res, next) => {
  try {
    const productsCategorys = await categorías.fecthAll()

    res.status(200).json({
      success: true,
      message: 'Tipos recuperados',
      data: productsCategorys
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener las Categorías de la BD'
    })
  }
}

const ProductFields = [
  { nombre: 'Nombre', type: 'string' },
  { nombre: 'Precio', type: 'float' },
  { nombre: 'Disponible', type: 'boolean' },
  { nombre: 'permiteCremaBatida', label: 'Permitir crema batida', type: 'boolean' },
  { nombre: 'ImagenArchivo', label: 'Imagen del producto', type: 'file', accept: 'image/*' }
]

exports.getProductfieldsAndIngredientes = async (req, res, next) => {
  try {
    const { id: typeId } = req.query

    if (!typeId) {
      return res.status(400).json({ error: 'El ID es requerido' })
    }

    const allIngredientes = await productos.getCategoryIngredientes(typeId)
    const allTypes = await tipos.fetchAll()

    const productFormsFields = ProductFields
    res.status(200).json({
      success: true,
      message: 'Campos e Ingredientes recuperados',
      data: {
        fields: productFormsFields,
        ingredientes: allIngredientes,
        types: allTypes
      }
    })
  } catch (error) {
    console.error('Error en getProductfieldsAndIngredientes:', error)
    res.status(500).json({
      success: false,
      message: 'Error al obtener los Ingredientes/Campos del servidor'
    })
  }
}

const pool = require('../util/database.js')

exports.postNewProduct = async (req, res, next) => {
  console.log('POST recibido: ', req.body)
  let connection
  try {
    connection = await pool.getConnection()

    const NewProductData = req.body
    const ingredientesID = parseIngredientesPayload(NewProductData.ingredientesID)
    const nombreProducto = firstDefined(NewProductData.Nombre, NewProductData.nombre) ?? null
    const precioProducto = firstDefined(NewProductData.Precio, NewProductData.precio) ?? null
    const categoriaProducto = firstDefined(
      NewProductData.categoria,
      NewProductData.Categoria,
      NewProductData['Categoría'],
      NewProductData['categoría'],
      NewProductData['categorÃ­a']
    ) ?? null
    const disponibleProducto = parseBooleanFlag(firstDefined(NewProductData.Disponible, NewProductData.disponible))
    const tipoProducto = firstDefined(NewProductData.tipo, NewProductData.Tipo) ?? null
    const permiteCremaBatidaProducto = parseBooleanFlag(
      firstDefined(NewProductData.permiteCremaBatida, NewProductData.Permite_Crema_Batida)
    )
    const imagenProducto = obtenerRutaImagenProducto(req.file) ||
      firstDefined(NewProductData.Imagen, NewProductData.imagen) ||
      null

    console.log('Variables a insertar:', {
      AutoId: 'Generando...',
      Nombre: nombreProducto,
      categoria: categoriaProducto,
      Precio: precioProducto,
      Disponible: disponibleProducto,
      permiteCremaBatida: Boolean(permiteCremaBatidaProducto),
      Imagen: imagenProducto,
      tipo: tipoProducto,
      tieneIngredientes: ingredientesID.length > 0
    })

    const validation = productos.ValidarDatosRegistro({
      Nombre: nombreProducto,
      Precio: precioProducto,
      Disponible: disponibleProducto,
      categoria: categoriaProducto,
      tipo: tipoProducto,
      Imagen: imagenProducto
    })
    const AutoId = productos.generarID('PD')

    if (!imagenProducto) {
      await eliminarImagenSubidaProducto(req.file)
      return res.status(400).json({ ok: false, message: 'Debes subir una imagen del producto.' })
    }

    if (validation.valido) {
      if (ingredientesID.length > 0) {
        // Caso producto con ingredientes (transacción)
        // 1. Iniciamos la transacción asincronica -> hasta commit
        await connection.beginTransaction()

        // 2. Inserción en Producto
        await productos.insertNewProduct(
          connection,
          AutoId,
          nombreProducto,
          categoriaProducto,
          precioProducto,
          disponibleProducto,
          imagenProducto,
          tipoProducto,
          permiteCremaBatidaProducto
        )

        // 3. Inserciones en Ingrediente-Producto
        for (const ing of ingredientesID) {
          console.log(`Insertando ingrediente: ${ing.nombre}`)
          await productos.insertNewProductIng(connection, AutoId, ing.id)
        }

        // 4. Si llegamos aqui salvamos de forma permanente
        await connection.commit()
        console.log('¡Todo se guardó correctamente!')
        res.status(200).json({
          ok: true,
          message: 'Producto e insumos registrado con éxito'
        })
      } else {
        // Caso producto Sin ingredientes
        const postResult = await productos.insertNewProduct(
          connection,
          AutoId,
          nombreProducto,
          categoriaProducto,
          precioProducto,
          disponibleProducto,
          imagenProducto,
          tipoProducto,
          permiteCremaBatidaProducto
        )

        if (postResult.affectedRows > 0) {
          console.log('Producto Insertado con exito')
          res.status(200).json({
            ok: true,
            message: 'Producto registrado con éxito'
          })
        } else {
          res.status(500).json({
            ok: false,
            message: 'No se pudo insertar el producto'
          })
        }
      }
    } else {
      await eliminarImagenSubidaProducto(req.file)
      res.status(400).json({ ok: false, message: validation.mensaje || 'Datos no válidos' })
    }
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {})
    }
    await eliminarImagenSubidaProducto(req.file)
    console.log('Error en conexion a BD: ', error)
    res.status(500).json({
      ok: false,
      message: error.message || 'Error en conexión a BD'
    })
  } finally {
    if (connection) connection.release() // Siempre liberar la conexión
  }
}

exports.postModifProduct = async (req, res, next) => {
  console.log('Recibiendo datos: ', req.body)
  const connection = await pool.getConnection()

  try {
    const newdata = req.body
    const idProducto = firstDefined(newdata.id, req.params.id)
    const nombreProducto = firstDefined(newdata.nombre, newdata.Nombre) ?? null
    const categoriaProducto = firstDefined(
      newdata.categoria,
      newdata.Categoria,
      newdata['Categoría'],
      newdata['categoría']
    ) ?? null
    const tipoProducto = firstDefined(newdata.tipo, newdata.Tipo) ?? null
    const precioProducto = firstDefined(newdata.precio, newdata.Precio) ?? null
    const disponibleProducto = parseBooleanFlag(firstDefined(newdata.activo, newdata.Disponible, newdata.disponible))
    const imagenProducto = firstDefined(newdata.imagen, newdata.Imagen) ?? null
    const newIngredientesRaw = newdata.ingredientes || [] // Evitamos fallos si viene vacío
    const oldIngredientesRaw = await productos.fetchOneProductIngredientes(idProducto)

    // 1. LIMPIEZA DE DATOS: Convertimos los objetos complejos en arrays de IDs simples
    // newIds quedará como: ['IN37891778', 'IN12345678']
    const newIds = newIngredientesRaw.map(ing => ing.id)

    // oldIds quedará como: ['IN37891778']. Ojo: usamos [0] para ignorar la metadata de MySQL
    const oldIds = oldIngredientesRaw[0].map(ing => ing.id)

    console.log('IDs Nuevos a evaluar: ', newIds)
    console.log('IDs Viejos en la BD: ', oldIds)

    // 2. EL ALGORITMO DIFERENCIAL (La Magia)
    // aEliminar: IDs que estaban en la BD (old) pero ya NO vienen en los nuevos.
    const aEliminar = oldIds.filter(id => !newIds.includes(id))

    // aInsertar: IDs que vienen en los nuevos pero NO estaban en la BD (old).
    const aInsertar = newIds.filter(id => !oldIds.includes(id))

    console.log('Array a Eliminar: ', aEliminar)
    console.log('Array a Insertar: ', aInsertar)

    // 3. EJECUCIÓN EN BASE DE DATOS
    // Setup
    await connection.beginTransaction()

    // A. Cambio de datos en el Producto
    const modifyResult = await productos.modifyProduct(
      connection,
      idProducto,
      nombreProducto,
      categoriaProducto,
      tipoProducto,
      precioProducto,
      disponibleProducto,
      imagenProducto,
      parseBooleanFlag(newdata.permiteCremaBatida)
    )
    console.log(modifyResult)
    // B. Eliminacion de ingredientes removidos
    if (aEliminar.length > 0) {
      console.log(`Eliminando ${aEliminar.length} relaciones obsoletas...`)
      // TODO: Placeholder para Modelo
      for (const ingElim of aEliminar) {
        await productos.eliminateIngProduct(connection, idProducto, ingElim)
      }
    }
    // C. Insercion de ingredientes nuevos :)
    if (aInsertar.length > 0) {
      console.log(`Insertando ${aInsertar.length} relaciones nuevas...`)
      // TODO: Placeholder para Modelo
      for (const ingInsert of aInsertar) {
        await productos.insertNewProductIng(connection, idProducto, ingInsert)
      }
    }

    // Fin de llamado ¿Todos lo lograron ?
    await connection.commit()

    // 4. RESPUESTA AL FRONTEND
    res.status(200).json({
      ok: true,
      message: 'Producto e ingredientes modificados correctamente'
    })
  } catch (error) {
    console.log('Error crítico en modificación: ', error)
    await connection.rollback()
    res.status(500).json({
      ok: false,
      message: 'Error al actualizar el producto',
      error: error.message
    })
  } finally {
    if (connection) connection.release()
  }
}

exports.getIngredientesFullCatalog = async (req, res, next) => {
  try {
    console.log('Backend: Obteniendo Catalogo de ingredientes ')
    const ingredientesCatalog = await productos.getAllIngredientes()

    res.status(200).json({
      ok: true,
      message: 'Catalogo de Ingredientes Obtenido',
      ingCatalog: ingredientesCatalog
    })
  } catch (err) {
    console.log('Error en get Ingredientes: ', err)
    res.status(500).json({
      ok: false,
      message: err.message || 'No es posible obtener ingredientes'
    })
  }
}

/* Eliminar/Desactivar Producto */
exports.deleteProducto = async (req, res, next) => {
  const { id } = req.body // Más limpio
  let connection

  // Validar entrada
  if (!id) {
    return res.status(400).json({
      ok: false,
      message: 'El ID del producto es obligatorio para la eliminación'
    })
  }

  try {
    connection = await pool.getConnection()
    await connection.beginTransaction()
    console.log('Eliminando producto con id: ', id)
    const productoEliminado = await productos.eliminarProducto(connection, id)

    if (productoEliminado.affectedRows === 0) {
      await connection.rollback()
      console.log('Error producto no encontrado')
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      })
    }

    await connection.commit()
    console.log('Producto Eliminado con exito: ', productoEliminado)
    res.status(200).json({
      ok: true,
      message: 'Producto eliminado con éxito',
      data: { id }
    })
  } catch (err) {
    if (connection) {
      await connection.rollback().catch(() => {})
    }
    // 3. Logear el error real para debugging
    console.error('Error al eliminar producto:', err)

    res.status(500).json({
      ok: false,
      message: err.message || 'Error interno del servidor'
    })
  } finally {
    if (connection) connection.release()
  }
}

exports.putDesactivarProducto = async (req, res, next) => {
  const { id } = req.body // Más limpio

  // Validar entrada
  if (!id) {
    return res.status(400).json({
      ok: false,
      message: 'El ID del producto es obligatorio'
    })
  }

  try {
    // 2. Asumimos que desactivarProducto devuelve el producto actualizado o null
    const productoDesactivado = await productos.desactivarProducto(id)

    if (productoDesactivado.affectedRows === 0) {
      console.log('Error producto no desactivado')
      return res.status(404).json({
        ok: false,
        message: 'Producto no encontrado'
      })
    }

    console.log('Producto desactivado con exito')
    res.status(200).json({
      ok: true,
      message: 'Producto desactivado con éxito',
      data: { id }
    })
  } catch (err) {
    // 3. Logear el error real para debugging
    console.error('Error al desactivar producto:', err)

    res.status(500).json({
      ok: false,
      message: err.message || 'Error interno del servidor'
    })
  }
}

// Seccion Personalizacion de productos

exports.getCategorías = async (req, res, nex) => {
  console.log('Obteniendo las categorías')
  try {
    const result = await categorías.fecthAll()

    res.status(200).json({
      ok: true,
      message: 'Catalogo de categorías Obtenido',
      categoriasCatalog: result
    })
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err
    })
  }
}

exports.getIngredientesActivos = async (req, res, nex) => {
  console.log('Obteniendo los ingredientes activos con transacción')

  // PLACEHOLDER: Obtener el objeto de conexión/pool de tu configuración de BD
  const connection = await db.getConnection()

  try {
    // Iniciamos la transacción
    await connection.beginTransaction()
        // Ejecutamos ambas consultas usando la misma conexión
        const categoria = req.query.categoria
        const result = categoria
          ? await ingrediente.fetchAllValidPorCategoria(connection, categoria)
          : await ingrediente.fetchAllValid(connection)
        const resultPrecioBase = await productos.getCrepaPersoPrecioBase(connection);

    // Si todo sale bien, confirmamos (commit)
    await connection.commit()

    res.status(200).json({
      ok: true,
      message: 'Catalogo de Ingredientes Activos Obtenido',
      ingActiveCatalog: result,
      precioBasePerso: resultPrecioBase
    })
  } catch (err) {
    // Si algo falla, revertimos cualquier cambio (rollback)
    if (connection) await connection.rollback()

    res.status(500).json({
      ok: false,
      message: 'Error en la transacción',
      error: err.message || err
    })
  } finally {
    // Siempre liberamos la conexión al terminar
    if (connection) connection.release()
  }
}
//Sección feedback Cliente
exports.getReviewHistoryView = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  const SesionData = request.session.cliente
  console.log("Datos del cliente: ", SesionData)
  response.render('cliente/historialClienteReviews', { breadcrumbs, datosCliente: SesionData})
}



exports.getClientReviewHistory = async (req, res, nex) => {
  console.log("Getting Client's review history")
  try{

    const clienteTelefono = req.query.Numero_Telefonico;

    if(clienteTelefono === undefined){
      throw new Error("Telefono indefinido")
    }

    console.log("Teléfono recibido:", clienteTelefono);

    const resultData = await feedback.getClientFeedback(clienteTelefono)

    console.log("Reviews obtenidas: ", resultData)

     res.status(200).json({
          ok: true,
          message: 'Catalogo Feedback Obtenido',
          reviewCatalog:resultData
                  })

  } catch (err) {
    if (connection) await connection.rollback()

    res.status(500).json({
      ok: false,
      message: 'Error en la transacción',
      error: err.message || err
    })

  } finally {
    if (connection) connection.release()
  }
}


// Sección feedback Cliente
exports.getReviewHistoryView = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  const SesionData = request.session.cliente
  console.log('Datos del cliente: ', SesionData)
  response.render('cliente/historialClienteReviews', { breadcrumbs, datosCliente: SesionData })
}

exports.getClientReviewHistory = async (req, res, nex) => {
  console.log("Getting Client's review history")
  try {
    const clienteTelefono = req.query.Numero_Telefonico

    if (clienteTelefono === undefined) {
      throw new Error('Telefono indefinido')
    }

    console.log('Teléfono recibido:', clienteTelefono)

    const resultData = await feedback.getClientFeedback(clienteTelefono)

    console.log('Reviews obtenidas: ', resultData)

    res.status(200).json({
      ok: true,
      message: 'Catalogo Feedback Obtenido',
      reviewCatalog: resultData
    })
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: 'Error al obtener catalogo feedback',
      error: err
    })
  }
}

exports.postNewFeedback = async (req, res, post) => {
  console.log('Generando nuevo feedback de cliente')
  let resultData
  try {
    const NewReviewData = req.body
    // Extracción tipo map
    const {
      ID_Orden, // Recibir
      Puntaje, // Recibir
      Comentario, // Recibir
      Numero_Telefonico // Recibir para cliente_tiene_review
    } = NewReviewData

    // Generar variables
    const ID_Review = productos.generarID('RV')
    console.log('ID generado para nueva review: ', ID_Review)

    const now = new Date()
    const Fecha_Hora = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0')

    // Preparando paquetes de info para cada tabla:
    // Para tabla Review
    const reviewRecord = {
      ID_Review,
      ID_Orden,
      Puntaje,
      Fecha_Hora,
      Comentario
    }

    // Para tabla cliente_tiene_review
    const intermediaryData = {
      ID_Review, // ID_Review generada arriba
      Numero_Telefonico
    }

    console.log(reviewRecord)
    console.log(intermediaryData)

    // Ejecutando POST
    resultData = await feedback.postNewOrderFeedback(reviewRecord, intermediaryData)

    console.log('Resultado SP:', JSON.stringify(resultData))

    if (resultData && resultData[0]?.Estado === 'Error') {
      throw new Error(`SP falló: ${resultData[0]?.Mensaje}`)
    }

    res.status(200).json({
      ok: true,
      message: 'Feedback Guardado correctamente',
      result: resultData
    })
  } catch (err) {
    console.log('Error interno en POST de feedback: ', err)
    res.status(500).json({
      ok: false,
      message: 'Error al guardar feedback',
      result: resultData
    })
  }
}
