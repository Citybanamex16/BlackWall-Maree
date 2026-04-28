/* global localStorage, window */
/* eslint-disable no-unused-vars */

/* CU01 */
const platillobotones = document.getElementsByClassName('platillo-btn')
const modalOverlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const cartToast = document.getElementById('cart-toast')
let cartToastTimer


let pedido = JSON.parse(localStorage.getItem('pedido')) || []

// MODAL
const cerrarModal = () => {
  modalOverlay.close()
  modalContent.innerHTML = ''
}

modalOverlay.addEventListener('click', (e) => {
  // Cierra al hacer click afuera
  if (e.target === modalOverlay) cerrarModal()
})
document.getElementById('modal-close').addEventListener('click', cerrarModal)

// ACTUALIZA BOTON RESUMEN (numeril)
function actualizarBotonResumen () {
  const btnTitle = document.querySelector('.order-btn-title')
  const btnSub = document.querySelector('.order-btn-sub')
  if (btnTitle && btnSub) {
    if (pedido.length === 0) {
      btnTitle.textContent = 'Ver Resumen de Pedido'
      btnSub.textContent = 'Revisa y confirma los artículos de tu orden'
    } else {
      btnTitle.textContent = `Ver Resumen de Pedido (${pedido.length})`
      btnSub.textContent = pedido.map(p => p.nombre).join(', ')
    }
  }
  const fabBadge = document.querySelector('.fab-badge')
  if (fabBadge) fabBadge.textContent = pedido.length
}

function mostrarToastCarrito (mensaje = 'Se ha agregado un producto al carrito') {
  if (!cartToast) return

  cartToast.textContent = mensaje
  cartToast.classList.add('is-visible')

  clearTimeout(cartToastTimer)
  cartToastTimer = setTimeout(() => {
    cartToast.classList.remove('is-visible')
  }, 1800)
}

// Datos platillo seleccionado
function obtenerDatosPlatillo (boton) {
  const tarjeta = boton.closest('.product-card-app')
  return {
    id: boton.getAttribute('data-id'), // Se usa el ID del boton
    nombre: tarjeta.querySelector('.product-name-app').textContent.trim(),
    precio: tarjeta.querySelector('.product-price-app').textContent.trim()
  }
}

// Estado del editor de ingredientes
let _ingOriginales = []
let _ingEliminados = new Set()
let _ingExtras = []
let _precioBase = 0
let _cremaBatida = null
let _cremaBatidaSeleccionada = false

function _chipOriginal (ing) {
  const removed = _ingEliminados.has(ing.id)
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;
                       font-size:12px;font-family:'Jost',sans-serif;
                       ${removed ? 'background:#f0f0f0;color:#bbb;' : 'background:#f5f0e8;color:#b5956a;'}">
    ${ing.nombre}
    <button onclick="window._toggleOriginal('${ing.id}')"
      style="background:none;border:none;cursor:pointer;padding:0 0 0 2px;font-size:15px;line-height:1;
             color:${removed ? '#ccc' : '#b5956a'};">${removed ? '+' : '×'}</button>
  </span>`
}

function _chipExtra (ing, idx) {
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;
                       font-size:12px;font-family:'Jost',sans-serif;background:#eaf4ee;color:#3a7d52;">
    ${ing.nombre}&nbsp;<span style="font-size:11px;opacity:0.8;">+$${ing.precio.toFixed(2)}</span>
    <button onclick="window._removeExtra(${idx})"
      style="background:none;border:none;cursor:pointer;padding:0 0 0 2px;font-size:15px;line-height:1;color:#3a7d52;">×</button>
  </span>`
}

function _renderIngOriginales () {
  const c = document.getElementById('ings-originales')
  if (c) c.innerHTML = _ingOriginales.map(_chipOriginal).join('') || '<span style="font-size:12px;color:#aaa;font-family:\'Jost\',sans-serif;">Sin ingredientes predeterminados.</span>'
}

function _renderIngExtras () {
  const c = document.getElementById('ings-extra')
  if (c) c.innerHTML = _ingExtras.map((ing, i) => _chipExtra(ing, i)).join('')
}

function _actualizarPrecioVivo () {
  const extrasTotal = _ingExtras.reduce((s, i) => s + i.precio, 0)
  const cremaBatidaTotal = _cremaBatidaSeleccionada && _cremaBatida ? _cremaBatida.precio : 0
  const el = document.getElementById('modal-precio-vivo')
  if (el) el.textContent = `$${(_precioBase + extrasTotal + cremaBatidaTotal).toFixed(2)}`

  const restantes = (_ingOriginales.length - _ingEliminados.size) + _ingExtras.length
  const btn = document.getElementById('btn-confirmar-agregar')
  const msg = document.getElementById('msg-sin-ingredientes')
  if (btn) { btn.disabled = restantes === 0; btn.style.opacity = restantes === 0 ? '0.4' : '1' }
  if (msg) msg.style.display = restantes === 0 ? '' : 'none'
}

window._toggleOriginal = (id) => {
  if (_ingEliminados.has(id)) _ingEliminados.delete(id)
  else _ingEliminados.add(id)
  _renderIngOriginales()
  _actualizarPrecioVivo()
}

window._removeExtra = (idx) => {
  _ingExtras.splice(idx, 1)
  _renderIngExtras()
  _actualizarPrecioVivo()
}

// Modal con datos del platillo
function generarHTMLModal (platillo, dataExtra, promoDisplay, promoPrecio) {
  const precioOriginal = Number(platillo.precio || dataExtra.precio || 0)
  const precioFinal = promoPrecio ? Number(promoPrecio) : precioOriginal

  const precioHTML = promoPrecio
    ? `<span style="text-decoration:line-through;color:#aaa;font-size:0.85em;margin-right:6px;">$${precioOriginal.toFixed(2)}</span>
       <span id="modal-precio-vivo" style="color:#b5956a;font-weight:700;">$${precioFinal.toFixed(2)}</span>`
    : `<span id="modal-precio-vivo" style="color:#b5956a;font-weight:700;">$${precioFinal.toFixed(2)}</span>`

  const promoHTML = promoDisplay
    ? `<div style="display:inline-block;background:#fdf3e3;color:#b5956a;border:1px solid #f0d9b5;
                  border-radius:6px;padding:4px 10px;font-size:12px;margin-top:6px;">
         🏷️ ${promoDisplay}
       </div>`
    : ''
  const cremaBatidaHTML = dataExtra.cremaBatida
    ? `
      <div style="margin-top:14px;margin-bottom:18px;padding:16px 18px;border:1px solid #e2ceb0;border-radius:14px;background:linear-gradient(135deg,#fff8ec 0%,#f7ecda 100%);box-shadow:0 10px 24px rgba(181,149,106,0.14);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:#b5956a;color:#fff;font-size:16px;">+</span>
          <div style="display:flex;flex-direction:column;gap:2px;">
            <span style="font-size:11px;font-weight:700;letter-spacing:1px;color:#8c7553;text-transform:uppercase;">Toque final</span>
            <span style="font-size:16px;font-weight:700;color:#3f352b;">¿Quieres crema batida?</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
          <div style="display:flex;flex-direction:column;gap:3px;">
            <span style="font-size:13px;color:#6e6256;">Se agrega como extra especial a tu pedido.</span>
            <span style="font-size:13px;font-weight:600;color:#b5956a;">+$${dataExtra.cremaBatida.precio.toFixed(2)}</span>
          </div>
          <div id="crema-batida-opciones" style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" id="btn-crema-batida-si"
              style="padding:8px 14px;border:1px solid #d8c3a5;border-radius:999px;background:#fff;color:#7a5f3d;font-size:12px;font-family:'Jost',sans-serif;cursor:pointer;font-weight:600;">
              Sí agregar
            </button>
            <button type="button" id="btn-crema-batida-no"
              style="padding:8px 14px;border:1px solid #d8c3a5;border-radius:999px;background:#b5956a;color:#fff;font-size:12px;font-family:'Jost',sans-serif;cursor:pointer;font-weight:600;">
              No gracias
            </button>
          </div>
        </div>
      </div>`
    : ''

  return `
    <div class="modal-detalle-header">
        <h2 class="title is-4 font-cormorant" style="font-family:'Cormorant Garamond',serif;margin-bottom:4px;">${platillo.nombre}</h2>
        <p class="subtitle is-5" style="margin-bottom:4px;">${precioHTML}</p>
        ${promoHTML}
        ${cremaBatidaHTML}
    </div>
    <div class="modal-detalle-body" style="margin-top:16px;">
        <p style="color:#666;font-size:14px;">${dataExtra.base ? 'Categoría: ' + dataExtra.base : 'Crepa artesanal preparada al momento.'}</p>
        <hr style="margin:12px 0;">

        <p style="font-size:11px;font-weight:600;letter-spacing:1px;color:#888;margin-bottom:6px;text-transform:uppercase;">Ingredientes incluidos</p>
        <p style="font-size:11px;color:#aaa;font-family:'Jost',sans-serif;margin-bottom:8px;">Toca × para quitar (no cambia el precio)</p>
        <div id="ings-originales" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;min-height:28px;"></div>

        <hr style="margin:12px 0;">

        <p style="font-size:11px;font-weight:600;letter-spacing:1px;color:#888;margin-bottom:8px;text-transform:uppercase;">Agregar ingrediente extra</p>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap;">
          <select id="selector-extra" style="flex:1;min-width:180px;padding:7px 10px;border:1px solid #ddd;
                  border-radius:6px;font-family:'Jost',sans-serif;font-size:13px;color:#444;background:#fff;">
            <option value="">Selecciona un ingrediente...</option>
          </select>
          <button id="btn-agregar-extra"
            style="padding:7px 16px;background:#333;color:#fff;border:none;border-radius:6px;
                   font-size:13px;cursor:pointer;font-family:'Jost',sans-serif;white-space:nowrap;">
            + Agregar
          </button>
        </div>
        <div id="ings-extra" style="display:flex;flex-wrap:wrap;gap:6px;min-height:28px;margin-bottom:4px;"></div>
        <p id="msg-sin-ingredientes" style="display:none;color:#c0392b;font-size:12px;font-family:'Jost',sans-serif;margin-top:6px;">
          El platillo debe tener al menos un ingrediente.
        </p>
    </div>
    <div class="modal-detalle-footer" style="margin-top:20px;display:flex;justify-content:flex-end;">
        <button id="btn-confirmar-agregar"
          style="padding:12px 24px;background:#222;color:#fff;border:none;border-radius:6px;
                 font-size:14px;cursor:pointer;font-family:'Jost',sans-serif;transition:opacity 0.2s;">
            + Confirmar y agregar
        </button>
    </div>
  `
}

async function agregarAlCarrito (item) {
  pedido = JSON.parse(localStorage.getItem('pedido')) || []
  pedido.push(item)
  localStorage.setItem('pedido', JSON.stringify(pedido))
  actualizarBotonResumen()
  mostrarToastCarrito()

  try {
    const response = await fetch('/menu/agregaritem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    if (!response.ok) {
      console.warn('No se pudo sincronizar el carrito con el servidor.')
    }
  } catch (err) {
    console.error('Error al sincronizar:', err)
  } finally {
    cerrarModal()
  }
}

async function verDetalleProducto (id) {
  try {
    const producto = globalProducts.find(p => p.id === id)
    const btn = document.querySelector(`.add-btn-app[data-id="${id}"]`)
    const promoDisplay = btn?.getAttribute('data-promo-display') || null
    const promoPrecio = promoDisplay ? btn?.getAttribute('data-precio') || null : null

    const res = await fetch(`/menu/consultaplatillo?id=${id}`)
    const data = await res.json()

    if (!data.disponible) {
      alert('Lo sentimos, este producto se acaba de agotar.')
      return
    }

    _precioBase = promoPrecio ? Number(promoPrecio) : Number(data.precio || producto?.precio || 0)
    _ingOriginales = data.ingredientes || []
    _ingEliminados = new Set()
    _ingExtras = []
    _cremaBatida = data.cremaBatida || null
    _cremaBatidaSeleccionada = false

    modalContent.innerHTML = generarHTMLModal(producto, data, promoDisplay, promoPrecio)
    modalOverlay.showModal()

    _renderIngOriginales()

    const btnCremaBatidaSi = document.getElementById('btn-crema-batida-si')
    const btnCremaBatidaNo = document.getElementById('btn-crema-batida-no')
    const actualizarBotonesCremaBatida = () => {
      if (!btnCremaBatidaSi || !btnCremaBatidaNo) return

      btnCremaBatidaSi.style.background = _cremaBatidaSeleccionada ? '#b5956a' : '#fff'
      btnCremaBatidaSi.style.color = _cremaBatidaSeleccionada ? '#fff' : '#7a5f3d'
      btnCremaBatidaNo.style.background = _cremaBatidaSeleccionada ? '#fff' : '#b5956a'
      btnCremaBatidaNo.style.color = _cremaBatidaSeleccionada ? '#7a5f3d' : '#fff'
    }

    if (btnCremaBatidaSi && btnCremaBatidaNo) {
      btnCremaBatidaSi.addEventListener('click', () => {
        _cremaBatidaSeleccionada = true
        actualizarBotonesCremaBatida()
        _actualizarPrecioVivo()
      })

      btnCremaBatidaNo.addEventListener('click', () => {
        _cremaBatidaSeleccionada = false
        actualizarBotonesCremaBatida()
        _actualizarPrecioVivo()
      })

      actualizarBotonesCremaBatida()
    }

    const ingIdsOriginales = new Set(_ingOriginales.map(i => i.id))
    const selector = document.getElementById('selector-extra')
    ;(data.catalogo || [])
      .filter(i => !ingIdsOriginales.has(i.id))
      .forEach(i => {
        const opt = document.createElement('option')
        opt.value = i.id
        opt.textContent = `${i.nombre} (+$${parseFloat(i.precio).toFixed(2)})`
        opt.dataset.nombre = i.nombre
        opt.dataset.precio = i.precio
        selector.appendChild(opt)
      })

    document.getElementById('btn-agregar-extra').onclick = () => {
      const sel = document.getElementById('selector-extra')
      const opt = sel.options[sel.selectedIndex]
      if (!opt.value) return
      if (_ingExtras.some(i => i.id_insumo === opt.value)) return
      _ingExtras.push({ id_insumo: opt.value, nombre: opt.dataset.nombre, precio: parseFloat(opt.dataset.precio) })
      sel.selectedIndex = 0
      _renderIngExtras()
      _actualizarPrecioVivo()
    }

    document.getElementById('btn-confirmar-agregar').onclick = () => {
      const extrasTotal = _ingExtras.reduce((s, i) => s + i.precio, 0)
      const cremaBatidaTotal = _cremaBatidaSeleccionada && _cremaBatida ? _cremaBatida.precio : 0
      const item = {
        id,
        nombre: data.nombre,
        precio_total: _precioBase + extrasTotal + cremaBatidaTotal,
        desc: [
          data.base,
          producto?.tipo,
          _cremaBatidaSeleccionada ? 'Con crema batida' : null
        ].filter(Boolean).join(' · '),
        ingredientes_adentro: _ingExtras.map(i => ({ id_insumo: i.id_insumo, nombre: i.nombre, precio: i.precio })),
        ingredientes_toppings: _cremaBatidaSeleccionada && _cremaBatida
          ? [{ id_insumo: _cremaBatida.id, nombre: _cremaBatida.nombre, precio: _cremaBatida.precio }]
          : [],
        ingredientes_base: _ingOriginales
          .filter(i => !_ingEliminados.has(i.id))
          .map(i => ({ id_insumo: i.id, nombre: i.nombre, precio: i.precio })),
        ingredientes_eliminados: _ingOriginales
          .filter(i => _ingEliminados.has(i.id))
          .map(i => ({ id_insumo: i.id, nombre: i.nombre }))
      }
      agregarAlCarrito(item)
    }

    _actualizarPrecioVivo()
  } catch (err) {
    console.error('Error al abrir detalle:', err)
  }
}

// funciones globales

/* == Conf y Show de Error Modal == */
// Error elements references
const ErrorModal = document.getElementById('ErrorModal')
const ErrorTitle = document.getElementById('ErrorTitle')
const ErrorContent = document.getElementById('ErrorMessage')
const ErrorCloseBtn = document.getElementById('closeInvalidData')

function ShowErrorModal (title, content) {
  ErrorTitle.innerText = title
  ErrorContent.innerText = content
  ErrorCloseBtn.addEventListener('click',
    (event) => {
      ErrorModal.close()
    }, { once: true })
  ErrorModal.showModal()
}

// fin de funciones globales

/* CU11 Visualizar Menu Digital */
let globalProducts = [] // Variable global de productos

function ShowMenuErrorModal () {
  console.log('Mostrando Modal de error')

  // 1. Parar el spinner — reemplaza el contenido del contenedor del menú
  const menuCategorias = document.getElementById('menu-categorias')
  menuCategorias.innerHTML = `
        <div class="has-text-centered py-6">
            <p class="is-size-6 has-text-grey">No se pudo cargar el menú.</p>
        </div>`

  // 2. Mostrar el modal
  document.getElementById('menuErrorModal').showModal()
}

async function verificarSesion () {
  console.log('Obteniendo datos de sesión...')
  try {
    // 1. Verificar si hay sesión activa
    const resSesion = await fetch('/cliente/Sesion')
    const dataSesion = await resSesion.json()

    if (!dataSesion.autenticado) {
      console.log('Sin sesión activa — menú normal')
      return null
    }

    console.log('Sesión activa:', dataSesion.usuario)

    // 2. Si hay sesión, obtener datos royalty en paralelo
    const resRoyalty = await fetch('/royalty/royaltyUser/api/datos')
    const dataRoyalty = await resRoyalty.json()

    // El endpoint royalty redirige si no hay sesión — lo ignoramos
    // pues ya confirmamos que sí hay sesión en el paso 1
    if (dataRoyalty.redirectUrl) {
      console.log('Royalty no disponible')
      return { usuario: dataSesion.usuario, promociones: [], eventos: [] }
    }

    // 3. Paquete completo
    const paqueteSesion = {
      usuario: dataSesion.usuario, // { nombre, telefono, genero, visitas }
      promociones: dataRoyalty.promociones,
      eventos: dataRoyalty.eventos,
      nivelRoyalty: dataRoyalty.promociones[0]?.Nombre_Royalty ?? null
    }

    console.log('Paquete de sesión completo:', paqueteSesion)
    return paqueteSesion
  } catch (error) {
    console.log('Error verificando sesión:', error)
    return null
  }
}

// funcion que obtiene las promociones que rawSesionPromos tiene en AcceptedPromos
function cleanSesionPromos (rawSesionPromos, AcceptedPromos) {
  // Si alguna de las listas está vacía, no hay nada que mostrar
  if (!rawSesionPromos || !AcceptedPromos) return []

  console.log('rawSesion: ', rawSesionPromos, ' vs ', ' AcceptedPromos: ', AcceptedPromos)
  // Comparamos cada promo de la sesión contra el array de aceptadas
  return rawSesionPromos.filter(rawPromo => {
    // Buscamos si existe una coincidencia en el catálogo aceptado
    // Usamos Plantilla_Promo o ID como llave de comparación
    const esValida = AcceptedPromos.some(accepted =>
      accepted.Producto === rawPromo.Producto && accepted.Plantilla_Promo === rawPromo.Plantilla_Promo
    )

    if (!esValida) {
      console.log(`Promo rechazada por Regla EFUL: ${rawPromo.Plantilla_Promo || rawPromo.Producto}`)
    }

    return esValida
  })
}

//
function getSesionPRs (SesionData, AllPromos) {
  console.log('🛠️ [FRONT-FILTRO] Iniciando selección local de PRs...')

  // 1. Extraemos el nivel de la sesión (ej: 'Mega Fan', 'Fan', etc.)
  const nivelUsuario = SesionData.nivelRoyalty

  // 2. Extraemos la lista maestra de PRs que ya bajaste de la DB
  const masterList = AllPromos?.allPRs?.[0] || []

  console.log(`👤 Usuario: ${SesionData.usuario?.nombre || 'Invitado'} | Nivel: ${nivelUsuario}`)

  // REGLA DE ORO 1: Si no hay nivel o es "General", no hay PRs que buscar.
  if (!nivelUsuario || nivelUsuario === 'General' || nivelUsuario === 'Cliente general') {
    console.log('⚪ [SKIP] Usuario sin nivel Royalty. Devolviendo lista vacía.')
    return []
  }

  // 3. FILTRADO LOCAL (Sin fetch, sin esperas)
  // Buscamos en la lista maestra solo las que coincidan con el nivel del cliente
  try {
    const autorizadas = masterList.filter(promo => {
      return promo.Nombre_Royalty === nivelUsuario
    })

    console.log(`✅ [EXITO] Se encontraron ${autorizadas.length} promos para el nivel ${nivelUsuario}`)

    // Opcional: Aquí puedes seguir usando tu función cleanSesionPromos si hace limpiezas extra
    // return cleanSesionPromos(autorizadas, masterList);

    return autorizadas
  } catch (err) {
    console.error('💥 Error filtrando promociones en local:', err)
    return []
  }
}

// Funcion para obtener los datos del Menu
async function obtenerMenu (SesionData) {
  try {
    const response = await fetch('/menu/menuData')

    const data = await response.json()
    console.log('Data: ', data)
    console.log('response: ', response)

    if (!data.ok) {
      console.log('Señal de Error desde Backend: ', data.message)
      throw new Error(`Error HTTP: ${response.status}`)
    }

    console.log('Datos obtenidos de Backend: ', data)

    //= =Llamado a promociones PUs y PEs==//

    const PromosData = await getAllPromos()
    // console.log('Promos obtenidos del Backend: ', PromosData)

    // Si contamos con una sesión
    let SesionPromos
    if (SesionData !== null && PromosData !== undefined) {
      // == Llamado de PRs == //
      SesionPromos = getSesionPRs(SesionData, PromosData)
      SesionData.PRs = SesionPromos
    } else {
      SesionPromos = null
    }

    console.log('Comenzando construccio1n de menu con datos de sesión: ', SesionData)

    /* === Llamada a Construcción de Menu Dinámico == */
    globalProducts = data.arrayProductsInfo
    contruirMenuDinamico(data, PromosData, SesionData)
  } catch (error) {
    console.error('Error al obtener el menú:', error)
    ShowMenuErrorModal()
  }
}

async function getSesionInfo () {
  // Datos de la sesión:
  let SesionData
  try {
    SesionData = await verificarSesion()
    console.log('Datos de las sesión: ', SesionData)

    obtenerMenu(SesionData)
  } catch (err) {
    console.log('Error al obtener datos de sesión')
    SesionData = null
    obtenerMenu(SesionData)
  }
}

getSesionInfo()

/* ==Construcción de Menu Dinámico == */

/* ==== SISTEMA DE PROMOCIONES ==== */

function getPromosFromProduct (idProd, promosData, PRs) {
  const promosArray = []

  // 1. Aseguramos que PRs sea un array. Si es null o undefined, usamos []
  const safePRs = Array.isArray(PRs) ? PRs : []

  // Mantienes tu lógica de seguridad para los otros datos
  const PEs = promosData?.allPEs?.[0] ?? []
  const PUs = promosData?.allPUs?.[0] ?? []

  // 2. Filtramos usando los arrays seguros
  // filter no fallará si el array está vacío, simplemente devolverá otro []
  const promosEvento = PEs.filter(promo => promo?.ID_Producto === idProd)
  const promosUnicas = PUs.filter(promo => promo?.ID_Producto === idProd)
  const promosRoyalty = safePRs.filter(promo => promo?.ID_Producto === idProd)

  // 3. Unimos todo. Si alguno es [], push no agregará nada al array final
  promosArray.push(...promosEvento, ...promosUnicas, ...promosRoyalty)

  return promosArray
}

function sistemaConflictosPromos (promosArray) {
  // Si no hay conflictos, regresamos la única promo que existe
  if (promosArray.length <= 1) return promosArray

  // console.log('Resolviendo conflicto entre múltiples promos...')

  // 1. Clasificamos y enriquecemos las promos con la lógica de tu compañero
  const promosProcesadas = promosArray.map(promo => {
    const desc = parseFloat(promo.Descuento) || 0
    let tipo = 'PORCENTAJE'
    let valorFiltro = desc // Guardamos el valor para compararlo luego

    if (desc >= 1.0) {
      tipo = 'BOGO'
      // "redondeado hacia arriba al entero más cercano"
      let cantidadX = Math.ceil(desc)

      // Ajuste de seguridad por el ejemplo (1 -> 2x1)
      if (cantidadX === 1) cantidadX = 2

      valorFiltro = cantidadX
    }

    return {
      ...promo,
      tipoCalculado: tipo,
      valorReal: valorFiltro
    }
  })

  // 2. CONFLICTO DESIGUAL: Separamos las promos BOGO (2x1, 3x1)
  const promosBOGO = promosProcesadas.filter(p => p.tipoCalculado === 'BOGO')

  if (promosBOGO.length > 0) {
    // Regla: BOGO mata a Porcentaje siempre.
    // 3. CONFLICTO IGUAL (BOGO vs BOGO): Gana la que regale más productos (mayor X)
    promosBOGO.sort((a, b) => b.valorReal - a.valorReal)
    // console.log(`Ganador BOGO: ${promosBOGO[0].valorReal}x1`)
    return [promosBOGO[0]]
  }

  // 4. CONFLICTO IGUAL (% vs %): Si solo hay porcentajes, gana el mayor descuento
  promosProcesadas.sort((a, b) => b.valorReal - a.valorReal)
  // console.log(`Ganador %: ${(promosProcesadas[0].valorReal * 100)}% de descuento`)

  return [promosProcesadas[0]]
}

function menuPromosAgent (cardHTML, finalPromos) {
  if (!finalPromos || finalPromos.length === 0) return cardHTML

  // Tomamos la primera (gracias al orden anterior, si hay Royalty, será esta)
  const promo = finalPromos[0]
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = cardHTML.trim()

  const card = tempDiv.querySelector('.product-card-app')
  const priceElement = tempDiv.querySelector('.product-price-app')
  const buttonElement = tempDiv.querySelector('.add-btn-app')

  // 1. Definir Configuración según Origen
  let colorPromo, labelOrigen, claseTab

  switch (promo.Origen) {
    case 'Royalty':
      colorPromo = '#7da6baff' // Azul pastel elegante
      labelOrigen = 'Royalty'
      claseTab = 'tab-pr'
      // Plus de vistosidad: sombra azul armonizada con el tono pastel
      card.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)'
      break
    case 'Evento':
      colorPromo = '#b5956a' // Dorado
      labelOrigen = 'Evento'
      claseTab = 'tab-pe'
      break
    default: // PU / Oferta
      colorPromo = '#e67e22' // Naranja
      labelOrigen = 'Oferta'
      claseTab = 'tab-pu'
  }

  // 2. Preparar el Texto de la Pestaña
  const valorDesc = parseFloat(promo.Descuento)
  let textoPestaña = ''

  if (valorDesc >= 1.0) {
    const cantX = Math.ceil(valorDesc) === 1 ? 2 : Math.ceil(valorDesc)
    textoPestaña = `${labelOrigen}: ${cantX}x1`
  } else {
    textoPestaña = `${labelOrigen}: ${(valorDesc * 100).toFixed(0)}%`
  }

  // 3. Inyectar Pestaña de Folder
  const folderTabHTML = `<div class="promo-folder-tab ${claseTab}">${textoPestaña}</div>`
  card.insertAdjacentHTML('afterbegin', folderTabHTML)

  // 4. Cambios Visuales en la Tarjeta
  card.classList.add('has-active-promo')
  card.style.borderColor = colorPromo

  // 5. Ajuste de Precios
  const precioOriginal = parseFloat(priceElement.textContent.replace('$', ''))
  let precioFinal = precioOriginal

  if (valorDesc < 1.0) {
    precioFinal = (precioOriginal * (1 - valorDesc)).toFixed(2)
    priceElement.innerHTML = `
            <span style="text-decoration: line-through; color: #aaa; font-size: 0.8em; margin-right: 5px;">$${precioOriginal}</span>
            <span style="color: ${colorPromo}; font-weight: 800;">$${precioFinal}</span>
        `
  } else {
    priceElement.style.color = colorPromo
    priceElement.style.fontWeight = '800'
  }

  // 6. Meta-data para el botón
  buttonElement.setAttribute('data-precio', precioFinal)
  buttonElement.setAttribute('data-promo-display', textoPestaña)
  buttonElement.setAttribute('data-promo-nombre-real', promo.Plantilla_Promo)

  return tempDiv.innerHTML
}

// Sistema de Promos
function promosMaster (cardHTML, promosData, productId, dataSesion) {
  // 1. Extraer promos
  let PRs = []
  if (dataSesion != null) {
    // console.log("Data sesion PRs en promosMaster: ", dataSesion)
    PRs = dataSesion.PRs
  }

  const arrayPromosProducto = getPromosFromProduct(productId, promosData, PRs)

  // Si el producto no tiene promos, cortamos la ejecución para ahorrar recursos
  if (arrayPromosProducto.length === 0) return cardHTML

  // 2. Resolver conflictos si tenemos mas de 1

  let arrayPromosFinales

  if (arrayPromosProducto.length > 1) {
    arrayPromosFinales = sistemaConflictosPromos(arrayPromosProducto)
  } else {
    arrayPromosFinales = arrayPromosProducto
  }

  // 3. Aplicar cambios en estetica e info en la carta:
  const finalCard = menuPromosAgent(cardHTML, arrayPromosFinales)

  // 4. Final: Regresamos la carta inyectada
  return finalCard
}

// Actor A: Constructor de fichas individuales
function construirFichaProductos (productosFiltrados, PromosData, gridDestino, DatosSesion) {
  gridDestino.innerHTML = ''

  if (productosFiltrados.length === 0) {
    gridDestino.innerHTML = `
      <div style="width:100%;padding:40px 0;text-align:center;color:#aaa;font-family:'Jost',sans-serif;font-size:14px;">
        <span style="font-size:32px;display:block;margin-bottom:10px;">🍽️</span>
        Aún no hay productos registrados para esta categoría.
      </div>`
    return
  }

  productosFiltrados.forEach((prod, i) => {
    const cardHTML = `
            <div class="column is-half-mobile is-half-tablet is-one-third-desktop">
                <div class="product-card-app">
                    
                    <div class="product-img-wrapper">
                        <img src="${prod.imagen}" alt="${prod.nombre}" loading="lazy" onerror="this.src='/img/placeholder.webp'">
                    </div>

                    <div class="product-info-wrapper">
                        <h3 class="product-name-app">${prod.nombre}</h3>
                        <p class="product-price-app">$${prod.precio}</p>
                    </div>

                   <div class="product-action-wrapper">
    <button class="add-btn-app"
            data-id="${prod.id}"
            data-nombre="${prod.nombre}"
            data-precio="${prod.precio}"
            onclick="event.stopPropagation(); verDetalleProducto('${prod.id}')">
        <span style="font-size: 14px; font-weight: bold;">＋</span>
        <span>Agregar</span>
    </button>
</div>

                </div>
            </div>`

    // El Promos Master recibe el string, lo pinta y lo devuelve listo para insertarse
    const completedCardHTML = promosMaster(cardHTML, PromosData, prod.id, DatosSesion)
    gridDestino.insertAdjacentHTML('beforeend', completedCardHTML)
  })
}

// Actor B: Función auxiliar para la Capa 3: Los Ingredientes
function generarBadgesIngredientes (listaIngredientes) {
  if (!listaIngredientes || listaIngredientes.length === 0) return ''
  return listaIngredientes
    .map(ing => `<span class="tag">${ing.nombre}</span>`)
    .join('')
}

/* Actor C: Sección de categoría */
function construirCategoria (cat, contenedorMenu) {
  const seccionCat = document.createElement('section')
  const idSeccion = `cat-${cat.Nombre.toLowerCase().replace(/\s+/g, '-')}`
  const idGridPrincipal = `grid-principal-${cat.Nombre.toLowerCase().replace(/\s+/g, '-')}`
  seccionCat.className = 'categoria-section categoria-render mb-5 animate-fade-in' // Clase para animación suave
  seccionCat.id = idSeccion

  // Estructura limpia: Título elegante y Grid preparado para 3 columnas
  seccionCat.innerHTML = `
    <h2 class="category-display-title">${cat.Nombre}</h2>
    <div id="${idGridPrincipal}" class="columns is-mobile is-multiline product-grid-app">
        </div>`

  contenedorMenu.appendChild(seccionCat)
  return { id: idGridPrincipal, nombre: cat.Nombre }
}

/* Actor D: Sticky tabs */
function generarStickyTabs (categorias, todosLosProductos, todosLosTipos, promosDatos, datosCliente) {
  const listaTabs = document.getElementById('lista-tabs')
  listaTabs.innerHTML = ''

  categorias.forEach((cat, index) => {
    const idSeccion = `cat-${cat.Nombre.toLowerCase().replace(/\s+/g, '-')}`
    const li = document.createElement('li')
    if (index === 0) li.classList.add('is-active')

    li.innerHTML = `<a href="#${idSeccion}"><span>${cat.Nombre}</span></a>`

    li.querySelector('a').addEventListener('click', e => {
      e.preventDefault()

      // Feedback visual de tab activo
      document.querySelectorAll('#lista-tabs li').forEach(el => el.classList.remove('is-active'))
      li.classList.add('is-active')

      // LLAMADA CLAVE: Re-renderizamos la sección con la categoría clickeada
      renderizarVistaCategoria(cat, todosLosProductos, todosLosTipos, promosDatos, datosCliente)

      // Scroll opcional al inicio del menú por si el usuario estaba muy abajo
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    listaTabs.appendChild(li)
  })

  /* IntersectionObserver — resalta el tab de la categoría visible */
  /* global IntersectionObserver */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id
        document.querySelectorAll('#lista-tabs li').forEach(li => {
          const href = li.querySelector('a')?.getAttribute('href')
          li.classList.toggle('is-active', href === `#${id}`)
        })
      }
    })
  }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 })

  document.querySelectorAll('.categoria-section').forEach(s => observer.observe(s))
}

// Mini función para ordenar los Tipos ([{}])-> Array de objetos
function ordenarTipos (array) {
  console.log('Recibiendo tipos desordenados: ', array)

  return [...array].sort((a, b) => {
    // 1. Regla especial: "Otros" siempre al final
    if (a.nombre === 'Otros') return 1
    if (b.nombre === 'Otros') return -1

    // 2. Si no es "Otros", orden alfabético normal
    return a.nombre.localeCompare(b.nombre)
  })
}

// Actor Principal
function contruirMenuDinamico (datos, promosDatos, datosCliente) {
  // 1. Guardamos los datos globalmente o en un scope accesible para los filtros
  const categorias = datos.arrayCategorías[0]
  const todosLosProductos = datos.arrayProductsInfo
  const TiposDesordenados = datos.arrayTipos
  const todosLosTipos = ordenarTipos(TiposDesordenados) // Todos los tipos que hay
  console.log('Constructor recibiendo datos de cliente: ', datosCliente)

  // 2. Generamos los Sticky Tabs una sola vez
  // Pasamos la referencia a los productos para que los tabs puedan disparar el filtro
  generarStickyTabs(categorias, todosLosProductos, todosLosTipos, promosDatos, datosCliente)

  // 3. Renderizado inicial: Mostramos la primera categoría por defecto
  if (categorias.length > 0) {
    const primeraCat = categorias[0]
    renderizarVistaCategoria(primeraCat, todosLosProductos, todosLosTipos, promosDatos, datosCliente)
  }
}

function construirSeccionTipo (tipoNombre, contenedorPadre) {
  const wrapperTipo = document.createElement('div')
  wrapperTipo.className = 'type-accordion mb-2 is-open column is-full'

  const idGridTipo = `grid-tipo-${tipoNombre.toLowerCase().replace(/\s+/g, '-')}`

  wrapperTipo.innerHTML = `
    <div class="type-header" onclick="toggleTipo(this)">
      <h3 class="type-subtitle">${tipoNombre}</h3>
      <span class="type-arrow">
        <i class="fas fa-chevron-down"></i>
      </span>
    </div>
    <div id="${idGridTipo}" class="type-content columns is-mobile is-multiline product-grid-app">
      </div>
  `

  contenedorPadre.appendChild(wrapperTipo)
  return idGridTipo
}

// Pequeña función  auxiliar de F para el toggle visual
function toggleTipo (header) {
  const wrapper = header.parentElement
  wrapper.classList.toggle('is-open')
}
console.log(toggleTipo)

// Actor Promos (Agente P)

async function getAllPromos () {
  // Esta funcion obtiene todas las PU, PE & PRs
  let Promos
  console.log('Obteniendo PUs, PEs y PRs')
  try {
    const response = await fetch('/menu/consultarPromosMenu')
    const data = await response.json()

    if (!data.ok) {
      console.log('Error Interno')
      return
    }

    console.log('Data recibida: ', data)
    Promos = data
  } catch (error) {
    console.log('Error: ', error)
  }
  return Promos
}

// Actor E
function renderizarVistaCategoria (categoriaObj, productos, allTypes, allPromos, SesionData) {
  const contenedorMenu = document.getElementById('menu-categorias')
  contenedorMenu.innerHTML = ''

  // 1. Título de la Categoría (Actor C)
  const infoCategoria = construirCategoria(categoriaObj, contenedorMenu)
  const mainWrapper = document.getElementById(infoCategoria.id)
  mainWrapper.innerHTML = ''

  // 2. Filtro inicial: Productos de esta categoría
  const productosDeCategoria = productos.filter(p => p.categoria === categoriaObj.Nombre)

  if (productosDeCategoria.length === 0) {
    mainWrapper.innerHTML = `
      <div style="width:100%;padding:48px 0;text-align:center;color:#aaa;font-family:'Jost',sans-serif;font-size:14px;">
        <span style="font-size:36px;display:block;margin-bottom:12px;">🍽️</span>
        Aún no hay productos registrados para esta categoría.
      </div>`
    return
  }

  // 3. Clasificación: Separar conocidos de "Otros"
  let productosRestantes = [...productosDeCategoria]

  // Renderizar Tipos Conocidos
  allTypes.forEach(tipo => {
    const productosDeEsteTipo = productosRestantes.filter(p => p.tipo === tipo.nombre)

    if (productosDeEsteTipo.length > 0) {
      const idGrid = construirSeccionTipo(tipo.nombre, mainWrapper)
      // Actor A
      construirFichaProductos(productosDeEsteTipo, allPromos, document.getElementById(idGrid), SesionData)

      // Quitamos estos productos de la lista de "restantes"
      productosRestantes = productosRestantes.filter(p => p.tipo !== tipo.nombre)
    }
  })

  // 4. Lógica de "Otros": Si quedan productos sin tipo o con tipos no identificados
  if (productosRestantes.length > 0) {
    const idGridOtros = construirSeccionTipo('Otros', mainWrapper)
    const gridOtros = document.getElementById(idGridOtros)


    // Forzamos que la sección de Otros empiece colapsada para no estorbar (Opcional)
    gridOtros.parentElement.classList.remove('is-open')
    construirFichaProductos(productosRestantes, allPromos, gridOtros, SesionData)
  }
}

// ── BÚSQUEDA ──
const btnSearchToggle = document.getElementById('btn-search-toggle')
const searchExpanded = document.getElementById('search-expanded')
const searchSideBtns = document.querySelectorAll('.search-side-btn')
const searchInput = document.getElementById('search-input')

if (btnSearchToggle) {
  btnSearchToggle.addEventListener('click', (e) => {
    e.stopPropagation()
    btnSearchToggle.style.display = 'none'
    searchExpanded.style.display = 'flex'
    searchSideBtns.forEach(b => b.style.display = 'none')
    searchInput.focus()
  })

  document.addEventListener('click', (e) => {
    if (searchExpanded.style.display === 'none') return
    if (!searchExpanded.contains(e.target)) {
      btnSearchToggle.style.display = ''
      searchExpanded.style.display = 'none'
      searchSideBtns.forEach(b => b.style.display = '')
      searchInput.value = ''
    }
  })

  let debounceTimer
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const q = e.target.value.trim().toLowerCase()
      if (!q) return
      const match = globalProducts.find(p => p.nombre.toLowerCase().includes(q))
      if (!match) return
      const scrollToCard = () => {
        const btn = document.querySelector(`.add-btn-app[data-id="${match.id}"]`)
        btn?.closest('.product-card-app')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      const btnEnDOM = document.querySelector(`.add-btn-app[data-id="${match.id}"]`)
      if (btnEnDOM) { scrollToCard(); return }
      const tabs = document.querySelectorAll('#lista-tabs li a')
      tabs.forEach(tab => {
        if (tab.querySelector('span')?.textContent === match.categoria) {
          tab.click()
          setTimeout(scrollToCard, 150)
        }
      })
    }, 300)
  })
}

// funciones finales
actualizarBotonResumen()
