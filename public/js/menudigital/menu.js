/* global localStorage, window */
/* eslint-disable no-unused-vars */

/* CU01 */
const platillobotones = document.getElementsByClassName('platillo-btn')
const modalOverlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const pedido = []

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

// Datos platillo seleccionado
function obtenerDatosPlatillo (boton) {
  const tarjeta = boton.closest('.product-card-app')
  return {
    id: boton.getAttribute('data-id'), // Se usa el ID del boton
    nombre: tarjeta.querySelector('.product-name-app').textContent.trim(),
    precio: tarjeta.querySelector('.product-price-app').textContent.trim()
  }
}

// Modal con datos de l platillo
function generarHTMLModal (platillo, dataExtra, promoDisplay, promoPrecio) {
  const listaIngredientes = (dataExtra.ingredientes || [])
    .map(ing => `<li>${ing}</li>`).join('') || '<li>Sin ingredientes registrados</li>'

  const precioOriginal = Number(platillo.precio || dataExtra.precio || 0)
  const precioFinal = promoPrecio ? Number(promoPrecio) : precioOriginal

  const precioHTML = promoPrecio
    ? `<span style="text-decoration:line-through;color:#aaa;font-size:0.85em;margin-right:6px;">$${precioOriginal.toFixed(2)}</span>
       <span style="color:#b5956a;font-weight:700;">$${precioFinal.toFixed(2)}</span>`
    : `<span style="color:#b5956a;font-weight:700;">$${precioOriginal.toFixed(2)}</span>`

  const promoHTML = promoDisplay
    ? `<div style="display:inline-block;background:#fdf3e3;color:#b5956a;border:1px solid #f0d9b5;
                  border-radius:6px;padding:4px 10px;font-size:12px;margin-top:6px;">
         🏷️ ${promoDisplay}
       </div>`
    : ''

  return `
    <div class="modal-detalle-header">
        <h2 class="title is-4 font-cormorant" style="font-family:'Cormorant Garamond',serif;margin-bottom:4px;">${platillo.nombre}</h2>
        <p class="subtitle is-5" style="margin-bottom:4px;">${precioHTML}</p>
        ${promoHTML}
    </div>
    <div class="modal-detalle-body" style="margin-top:16px;">
        <p class="description" style="color:#666;font-size:14px;">${dataExtra.base ? `Categoría: ${dataExtra.base}` : 'Crepa artesanal preparada al momento.'}</p>
        <hr style="margin:12px 0;">
        <p style="font-size:12px;font-weight:600;letter-spacing:1px;color:#888;margin-bottom:8px;">INGREDIENTES</p>
        <ul class="lista-ingredientes-modal" style="list-style:disc;padding-left:18px;color:#555;font-size:13px;">${listaIngredientes}</ul>
    </div>
    <div class="modal-detalle-footer" style="margin-top:20px;display:flex;justify-content:flex-end;">
        <button id="btn-confirmar-agregar"
          style="padding:12px 24px;background:#222;color:#fff;border:none;border-radius:6px;
                 font-size:14px;cursor:pointer;font-family:'Jost',sans-serif;">
            + Confirmar y agregar
        </button>
    </div>
  `
}

async function agregarAlCarrito (item) {
  pedido.push(item)
  localStorage.setItem('pedido', JSON.stringify(pedido))

  try {
    await fetch('/menu/agregaritem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    })
    console.log('Sincronizado con servidor')
    cerrarModal()
    actualizarBotonResumen()
  } catch (err) {
    console.error('Error al guardar:', err)
  }
}

async function verDetalleProducto (id) {
  try {
    const producto = globalProducts.find(p => p.id === id)

    // Chedca datos de promo
    const btn = document.querySelector(`.add-btn-app[data-id="${id}"]`)
    const promoDisplay = btn?.getAttribute('data-promo-display') || null
    const promoPrecio = promoDisplay ? btn?.getAttribute('data-precio') || null : null

    console.log('Buscando producto:', id)
    const res = await fetch(`/menu/consultaplatillo?id=${id}`)
    const data = await res.json()

    if (!data.disponible) {
      alert('Lo sentimos, este producto se acaba de agotar.')
      return
    }

    // Lo construye bien para meterlo al carrito
    const precioFinal = promoPrecio ? Number(promoPrecio) : Number(data.precio || producto?.precio || 0)
    const itemParaCarrito = {
      id,
      nombre: data.nombre,
      precio: '$' + precioFinal.toFixed(2),
      desc: [data.base, producto?.tipo].filter(Boolean).join(' · ')
    }

    modalContent.innerHTML = generarHTMLModal(producto, data, promoDisplay, promoPrecio)
    modalOverlay.showModal()

    document.getElementById('btn-confirmar-agregar').onclick = function () {
      agregarAlCarrito(itemParaCarrito)
    }
  } catch (err) {
    console.error('Error al abrir detalle:', err)
  }
}


//funciones globales 

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
async function getSesionPRs (SesionData, AcceptedPromos) {
  // Validamos que tengamos la lista maestra antes de empezar
  const masterList = AcceptedPromos?.allPRs[0] || []
  console.log('Iniciando validación con Accepted promos:', masterList)

  try {
    const res = await fetch('/cliente/promosClienteData')

    // La validación .ok va sobre la respuesta del fetch, no sobre el JSON
    if (!res.ok) {
      throw new Error(`Error de red: ${res.status}`)
    }

    const responseData = await res.json()

    // Aquí extraemos las promos que el servidor dice que el usuario tiene
    // Si el servidor no manda nada, usamos el SesionData que pasaste por parámetro
    const rawPromos = responseData.PRs || []

    console.log('PRs obtenidos del servidor con éxito', rawPromos)

    // Aplicamos el filtro de seguridad (Regla de EFUL)
    const SesionAcceptedPromos = cleanSesionPromos(rawPromos, masterList)

    console.log(`Resultado final: ${SesionAcceptedPromos.length} promociones autorizadas.`)
    return SesionAcceptedPromos
  } catch (err) {
    console.error('Error fetching Sesion Promos:', err)
    // En caso de error, devolvemos un array vacío para no romper el resto de la app
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
      SesionPromos = await getSesionPRs(SesionData, PromosData)
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

function getPromosFromProduct (nombre, promosData, PRs) {
  const promosArray = []

  // 1. Aseguramos que PRs sea un array. Si es null o undefined, usamos []
  const safePRs = Array.isArray(PRs) ? PRs : []

  // Mantienes tu lógica de seguridad para los otros datos
  const PEs = promosData?.allPEs?.[0] ?? []
  const PUs = promosData?.allPUs?.[0] ?? []

  // 2. Filtramos usando los arrays seguros
  // filter no fallará si el array está vacío, simplemente devolverá otro []
  const promosEvento = PEs.filter(promo => promo?.Producto === nombre)
  const promosUnicas = PUs.filter(promo => promo?.Producto === nombre)
  const promosRoyalty = safePRs.filter(promo => promo?.Producto === nombre)

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
      card.style.boxShadow = '0 4px 15px rgba(52, 152, 219, 0.3)';
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
function promosMaster (cardHTML, promosData, productName, dataSesion) {
  // 1. Extraer promos
  let PRs = []
  if (dataSesion != null) {
    PRs = dataSesion.PRs
  }

  const arrayPromosProducto = getPromosFromProduct(productName, promosData, PRs)

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

  productosFiltrados.forEach((prod, i) => {
    const cardHTML = `
            <div class="column is-half-mobile is-half-tablet"> 
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
    const completedCardHTML = promosMaster(cardHTML, PromosData, prod.nombre, DatosSesion)
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
  seccionCat.className = 'categoria-render mb-5 animate-fade-in' // Clase para animación suave

  // Estructura limpia: Título elegante y Grid preparado para 3 columnas
  seccionCat.innerHTML = `
    <h2 class="category-display-title">${cat.Nombre}</h2>
    <div id="grid-principal" class="columns is-mobile is-multiline product-grid-app">
        </div>`

  contenedorMenu.appendChild(seccionCat)
  return { id: 'grid-principal', nombre: cat.Nombre }
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
  wrapperTipo.className = 'type-accordion mb-2 is-open' // Por defecto abierto

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

    construirFichaProductos(productosRestantes, gridOtros)
  }
}

/*
window.agregarAlCarrito = function (btn) {
  const nombre = btn.dataset.nombre
  const precio = btn.dataset.precio
  const desc = btn.closest('.card-content')?.querySelector('.product-desc')?.textContent?.trim() || ''

  // Abrir modal con descripción y botón de confirmar
  abrirModal(`
    <h2 style="font-family:'Cormorant Garamond',serif;font-size:26px;margin-bottom:4px;">
      ${nombre}
    </h2>
    <p style="color:#b5956a;font-size:15px;font-weight:500;margin-bottom:12px;">
      $${precio}
    </p>
    <p style="color:#777;font-size:13px;margin-bottom:20px;">${desc || 'Sin descripción disponible'}</p>

    <button id="btn-confirmar-agregar"
      style="width:100%;padding:12px;background:#eac9c1;color:#fff;
             border:none;border-radius:6px;font-size:14px;cursor:pointer;
             font-family:'Jost',sans-serif;">
      + Confirmar y agregar al pedido
    </button>
  `)

  document.getElementById('btn-confirmar-agregar').addEventListener('click', () => {
    const item = { nombre, precio: `$${precio}`, desc }
    const pedidoActual = JSON.parse(localStorage.getItem('pedido') || '[]')
    pedidoActual.push(item)
    localStorage.setItem('pedido', JSON.stringify(pedidoActual))
    cerrarModal()
    console.log('Item agregado:', item)
  })
}
*/
