/* global localStorage, L, window */

/* CU01 */
const platillobotones = document.getElementsByClassName('platillo-btn')
const overlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const modalClose = document.getElementById('modal-close')
const pedido = []

// ── MODAL ──
const abrirModal = (contenido) => {
  modalContent.innerHTML = contenido
  overlay.classList.add('active')
}

const cerrarModal = () => {
  overlay.classList.remove('active')
  modalContent.innerHTML = ''
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) cerrarModal()
})
modalClose.addEventListener('click', cerrarModal)

// ── ACTUALIZAR BOTÓN RESUMEN ──
function actualizarBotonResumen () {
  const btnTitle = document.querySelector('.order-btn-title')
  const btnSub = document.querySelector('.order-btn-sub')
  if (pedido.length === 0) {
    btnTitle.textContent = 'Ver Resumen de Pedido'
    btnSub.textContent = 'Revisa y confirma los artículos de tu orden'
  } else {
    btnTitle.textContent = `Ver Resumen de Pedido (${pedido.length})`
    btnSub.textContent = pedido.map(p => p.nombre).join(', ')
  }
}

// ── Conexion BOTONES DE PLATILLOS DEL MENU ──

// Su único trabajo es leer el HTML y devolver un objeto limpio con la información del platillo.
function obtenerDatosPlatillo (boton) {
  // Buscamos la tarjeta completa que definimos en el Actor A
  const tarjeta = boton.closest('.product-card-app')
  return {
    id: boton.getAttribute('data-id'), // Usamos el ID que pusimos en el botón
    nombre: tarjeta.querySelector('.product-name-app').textContent.trim(),
    precio: tarjeta.querySelector('.product-price-app').textContent.trim()
    // La descripción la podemos sacar de un data-attribute o del objeto original
  }
}

// Esta función solo se encarga de "dibujar". Recibe los datos y devuelve el texto (string) que verás en la pantalla.
function generarHTMLModal (platillo, dataExtra) {
  const listaIngredientes = dataExtra.ingredientes
    .map(ing => `<li>${ing}</li>`).join('')

  return `
        <div class="modal-detalle-header">
            <h2 class="title is-4 font-cormorant">${platillo.nombre}</h2>
            <p class="subtitle is-5 has-text-primary">${platillo.precio}</p>
        </div>
        <div class="modal-detalle-body">
            <p class="description">${dataExtra.descripcion || 'Sin descripción'}</p>
            <hr>
            <p class="is-size-7 has-text-weight-bold">INGREDIENTES:</p>
            <ul class="lista-ingredientes-modal">${listaIngredientes}</ul>
        </div>
        <div class="modal-detalle-footer mt-5">
            <button id="btn-confirmar-agregar" class="button is-black is-fullwidth is-rounded">
                + Confirmar y agregar
            </button>
        </div>
    `
}

// Este se encarga de la lógica pesada: hablar con el servidor y guardar en el localStorage.
async function agregarAlCarrito (platillo) {
  // Guardar localmente
  pedido.push(platillo)
  localStorage.setItem('pedido', JSON.stringify(pedido))

  try {
    const response = await fetch('/menu/agregaritem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(platillo)
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
    // 1. Buscamos la info del producto (puedes sacarla de tu array global 'todosLosProductos')
    const producto = globalProducts.find(p => p.id == id)

    // 2. Lógica del amigo: Consultar disponibilidad real
    console.log('Buscando producto: ', id)
    const res = await fetch(`/menu/consultaplatillo?id=${id}`)
    const data = await res.json()

    if (!data.disponible) {
      alert('Lo sentimos, este producto se acaba de agotar.')
      return
    } else {
      console.log('Este producto si esta disponible')
    }

    // 3. Poblar TU modal con los datos recibidos
    const contenedorContenido = document.getElementById('modal-content')

    // Usamos la función del amigo adaptada para inyectar en tu div
    contenedorContenido.innerHTML = generarHTMLModal(producto, data)

    // 4. Mostrar el modal
    const detailModal = document.getElementById('modal-overlay')
    detailModal.showModal()
    console.log('Mostrando Modal')

    // 5. Asignar el evento al nuevo botón de confirmar que se acaba de crear
    document.getElementById('btn-confirmar-agregar').onclick = function () {
      agregarAlCarrito(producto)
    }
  } catch (err) {
    console.error('Error al abrir detalle:', err)
  }
}

// Función para cerrar (conéctala a tu botón modal-close)
document.getElementById('modal-close').onclick = function () {
  const detailModal = document.getElementById('modal-overlay')
  detailModal.close()
}

/* ── MAPA DE UBICACIÓN ──
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      const mapa = L.map('mapa').setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapa)

      // Punto rojo
      L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#e74c3c',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(mapa).bindPopup('Tú estás aquí').openPopup()

      document.getElementById('mapa-estado').textContent = 'Ubicación detectada'
    },
    (_) => {
      document.getElementById('mapa-estado').textContent =
        'No se pudo obtener tu ubicación. Permite el acceso en tu navegador.'
    }
  )
} else {
  document.getElementById('mapa-estado').textContent =
    'Tu navegador no soporta geolocalización.'
}
*/

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

// Funcion para obtener los datos del Menu
async function obtenerMenu () {
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

    //= =Llamado a promociones ==//

    const PromosData = await PromosMaster()

    console.log('Promos obtenidos del Backend: ', PromosData)

    /* === Llamada a Construcción de Menu Dinámico == */
    globalProducts = data.arrayProductsInfo
    contruirMenuDinamico(data, PromosData)
  } catch (error) {
    console.error('Error al obtener el menú:', error)
    ShowMenuErrorModal()
  }
}

obtenerMenu()

/* ==Construcción de Menu Dinámico == */

// Actor A: Constructor de fichas individuales
function construirFichaProductos (productosFiltrados, gridDestino) {
  // Limpiamos el grid antes de poblar
  gridDestino.innerHTML = ''

  productosFiltrados.forEach((prod, i) => {
    // console.log("prod info: ", prod)
    const cardHTML = `
      <div class="column is-6-mobile is-4-tablet is-3-desktop"> 
        <div class="product-card-app" onclick="verDetalleProducto('${prod.id}')">
          
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
                    onclick="event.stopPropagation(); agregarAlCarrito(this)">
              <span class="btn-agregar-icon">＋</span>
              <span class="btn-agregar-label">Agregar</span>
            </button>
          </div>

        </div>
      </div>`

    gridDestino.insertAdjacentHTML('beforeend', cardHTML)
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
function generarStickyTabs (categorias, todosLosProductos, todosLosTipos) {
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
      renderizarVistaCategoria(cat, todosLosProductos, todosLosTipos)

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
function contruirMenuDinamico (datos, promosDatos) {
  // 1. Guardamos los datos globalmente o en un scope accesible para los filtros
  const categorias = datos.arrayCategorías[0]
  const todosLosProductos = datos.arrayProductsInfo
  const TiposDesordenados = datos.arrayTipos
  const todosLosTipos = ordenarTipos(TiposDesordenados) // Todos los tipos que hay
  console.log('Tipos ordenados: ', todosLosTipos)

  // 2. Generamos los Sticky Tabs una sola vez
  // Pasamos la referencia a los productos para que los tabs puedan disparar el filtro
  generarStickyTabs(categorias, todosLosProductos, todosLosTipos)

  // 3. Renderizado inicial: Mostramos la primera categoría por defecto
  if (categorias.length > 0) {
    const primeraCat = categorias[0]
    renderizarVistaCategoria(primeraCat, todosLosProductos, todosLosTipos, promosDatos)
  }

  console.log('Estructura base del menú lista y primera categoría renderizada.')
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

async function PromosMaster () {
  // Esta funcion obtiene todas las PU & PE
  let Promos
  console.log('Obteniendo PUs y PEs')
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
  console.log('Finalizado')
  return Promos
}

// Actor E
function renderizarVistaCategoria (categoriaObj, productos, allTypes, allPromos) {
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
      construirFichaProductos(productosDeEsteTipo, document.getElementById(idGrid))

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
