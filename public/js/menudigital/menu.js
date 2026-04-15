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
const actualizarBotonResumen = () => {
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

// ── BOTONES DE PLATILLO ──
for (const button of platillobotones) {
  button.addEventListener('click', () => {
    const tarjeta = button.closest('.product-info')
    const nombre = tarjeta.querySelector('.product-name').textContent.trim()
    const precio = tarjeta.querySelector('.product-price').textContent.trim()
    const desc = tarjeta.querySelector('.product-desc').textContent.trim()

    fetch(`/menu/consultaplatillo?nombre=${encodeURIComponent(nombre)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.disponible) {
          abrirModal(`
            <h2 style="font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:12px;">
              ${nombre}
            </h2>
            <p style="color:#e74c3c;font-size:14px;">
              Este platillo no está disponible por el momento.
            </p>
          `)
          return
        }

        const listaIngredientes = data.ingredientes
          .map(ing => `<li style="font-size:13px;color:#555;margin-bottom:4px;">• ${ing}</li>`)
          .join('')

        const checkboxIngredientes = data.ingredientes
          .map(ing => `
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;
                          color:#555;margin-bottom:6px;cursor:pointer;">
              <input type="checkbox" checked disabled> ${ing}
            </label>
          `).join('')

        abrirModal(`
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:26px;margin-bottom:4px;">
            ${nombre}
          </h2>
          <p style="color:#b5956a;font-size:15px;font-weight:500;margin-bottom:12px;">
            ${precio}
          </p>
          <p style="color:#777;font-size:13px;margin-bottom:8px;">${desc}</p>
          <p style="font-size:13px;font-weight:600;color:#444;margin-bottom:6px;">Ingredientes:</p>
          <ul style="margin-bottom:16px;padding-left:4px;">${listaIngredientes}</ul>
          <p style="font-size:12px;color:#aaa;margin-bottom:20px;">Base: ${data.base}</p>

          <button id="btn-confirmar-agregar"
            style="width:100%;padding:12px;background:#eac9c1;color:#fff;
                   border:none;border-radius:6px;font-size:14px;cursor:pointer;
                   font-family:'Jost',sans-serif;margin-bottom:12px;">
            + Confirmar y agregar al pedido
          </button>

          <details>
            <summary style="font-size:13px;color:#b5956a;cursor:pointer;list-style:none;">
              ✎ Editar ingredientes
            </summary>
            <div style="margin-top:10px;padding:12px;background:#faf8f5;border-radius:8px;">
              <p style="font-size:12px;color:#aaa;margin-bottom:8px;">
                Selecciona los ingredientes que quieres incluir:
              </p>
              ${checkboxIngredientes}
              <p style="font-size:11px;color:#bbb;margin-top:8px;">
                Asi no va a estar pero ahora es prototipo por ahora
              </p>
            </div>
          </details>
        `)

        document.getElementById('btn-confirmar-agregar').addEventListener('click', () => {
          pedido.push({ nombre, precio, desc })
          localStorage.setItem('pedido', JSON.stringify(pedido))

          fetch('/menu/agregaritem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, desc })
          })
            .then(r => r.json())
            .then(confirmacion => {
              console.log('Agregado:', confirmacion)
              cerrarModal()
              actualizarBotonResumen()
            })
            .catch(err => console.log(err))
        })
      })
      .catch(err => console.log(err))
  })
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

    /* === Llamada a Construcción de Menu Dinámico == */
    contruirMenuDinamico(data)
  } catch (error) {
    console.error('Error al obtener el menú:', error)
    ShowMenuErrorModal()
  }
}

obtenerMenu()

/* ==Construcción de Menu Dinámico == */

// Actor A: Constructor de fichas individuales
function construirFichaProductos (datosProducto, datosCategorias) {
  console.log('Repartiendo productos en sus categorías...')
  datosCategorias.forEach(cat => {
    const sectionPrincipal = document.getElementById(cat.id)
    const gridDestino = sectionPrincipal.querySelector('.grid')
    const productosFiltrados = datosProducto.filter(prod => prod.categoria === cat.nombre)

    if (productosFiltrados.length === 0) {
      gridDestino.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🥐</span>
          <p>Sin productos en esta categoría por el momento.</p>
        </div>`
      return
    }

    productosFiltrados.forEach((prod, i) => {
      const cardHTML = `
        <div class="column is-12-mobile is-6-tablet is-4-desktop">
          <div class="card product-card h-100" style="animation-delay: ${i * 60}ms">
            <div class="card-image">
              <figure class="image is-4by3">
                <img
                  src="${prod.imagen}"
                  alt="${prod.nombre}"
                  class="product-thumb"
                  loading="lazy"
                  onerror="this.src='/img/placeholder.webp'"
                >
              </figure>
            </div>
            <div class="card-content">
              <div class="media mb-2">
                <div class="media-content">
                  <p class="title is-5 mb-1">${prod.nombre}</p>
                  <p class="product-price">$${prod.precio}</p>
                </div>
              </div>
              <div class="content">
                ${prod.descripcion
                  ? `<p class="product-desc">${prod.descripcion}</p>`
                  : ''}
                <div class="tags" id="ingredientes-${prod.id}">
                  ${generarBadgesIngredientes(prod.ingredientes)}
                </div>
                <button
                  class="btn btn-primary"
                  data-id="${prod.id}"
                  data-nombre="${prod.nombre}"
                  data-precio="${prod.precio}"
                  onclick="agregarAlCarrito(this)"
                >
                  <span>＋</span>
                  <span>Agregar a la orden</span>
                </button>
              </div>
            </div>
          </div>
        </div>`

      gridDestino.insertAdjacentHTML('beforeend', cardHTML)
    })
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
  seccionCat.className = 'categoria-section mb-4 is-dynamic is-open'
  seccionCat.id = `cat-${cat.Nombre.toLowerCase().replace(/\s+/g, '-')}`
  const seccionID = seccionCat.id
  const idContenedor = `grid-${cat.Nombre.replace(/\s+/g, '-').toLowerCase()}`

  seccionCat.innerHTML = `
    <div class="cat-header" role="button" tabindex="0" aria-expanded="true">
      <h2 class="cat-title">${cat.Nombre}</h2>
      <span class="cat-chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <div id="${idContenedor}" class="columns is-multiline grid grid--collapsible">
    </div>`

  const header = seccionCat.querySelector('.cat-header')
  const grid = seccionCat.querySelector('.grid')

  /* Toggle con animación real de altura */

  function toggleGrid () {
    const open = seccionCat.classList.contains('is-open')

    if (open) {
      // Cerrar: fija la altura actual, luego anima a 0
      grid.style.maxHeight = grid.scrollHeight + 'px'
      grid.style.opacity = '1'
      /* global requestAnimationFrame */
      requestAnimationFrame(() => {
        grid.style.maxHeight = '0'
        grid.style.opacity = '0'
      })
      seccionCat.classList.remove('is-open')
      header.setAttribute('aria-expanded', 'false')
    } else {
      // Abrir: anima desde 0 hasta el alto real
      grid.style.maxHeight = grid.scrollHeight + 'px'
      grid.style.opacity = '1'
      seccionCat.classList.add('is-open')
      header.setAttribute('aria-expanded', 'true')
      // Una vez terminada la transición, suelta max-height para que
      // el contenido pueda crecer si se añaden más items
      grid.addEventListener('transitionend', () => {
        if (seccionCat.classList.contains('is-open')) {
          grid.style.maxHeight = 'none'
        }
      }, { once: true })
    }
  }

  header.addEventListener('click', toggleGrid)
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGrid() }
  })

  contenedorMenu.appendChild(seccionCat)
  return { id: seccionID, nombre: cat.Nombre }
}

/* Actor D: Sticky tabs */
function generarStickyTabs (categorias) {
  const listaTabs = document.getElementById('lista-tabs')
  listaTabs.innerHTML = ''

  categorias.forEach((cat, index) => {
    const idSeccion = `cat-${cat.Nombre.toLowerCase().replace(/\s+/g, '-')}`
    const li = document.createElement('li')
    if (index === 0) li.classList.add('is-active')

    li.innerHTML = `<a href="#${idSeccion}"><span>${cat.Nombre}</span></a>`

    li.querySelector('a').addEventListener('click', e => {
      e.preventDefault()
      document.querySelectorAll('#lista-tabs li').forEach(el => el.classList.remove('is-active'))
      li.classList.add('is-active')

      const target = document.getElementById(idSeccion)

      // Si estaba cerrado, ábrir antes de hacer scroll
      if (!target.classList.contains('is-open')) {
        const grid = target.querySelector('.grid')
        grid.style.maxHeight = grid.scrollHeight + 'px'
        grid.style.opacity = '1'
        target.classList.add('is-open')
        target.querySelector('.cat-header').setAttribute('aria-expanded', 'true')
        grid.addEventListener('transitionend', () => {
          grid.style.maxHeight = 'none'
        }, { once: true })
      }

      // Offset por la sticky nav
      const stickyH = document.getElementById('sticky-nav-wrapper')?.offsetHeight ?? 0
      const top = target.getBoundingClientRect().top + window.scrollY - stickyH - 12
      window.scrollTo({ top, behavior: 'smooth' })
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

function contruirMenuDinamico (datos) {
  // 1. Referencia al contenedor principal
  const contenedorMenu = document.getElementById('menu-categorias')
  contenedorMenu.innerHTML = ''

  const categoríasInfo = []

  const categorías = datos.arrayCategorías[0]
  // 2. Iteramos por cada categoría para crear su sección
  categorías.forEach(cat => {
    console.log(`Creando sección para catalogo ${cat.Nombre}`)
    categoríasInfo.push(construirCategoria(cat, contenedorMenu))
  })

  generarStickyTabs(categorías)

  console.log('ID de categorias en View: ', categoríasInfo)

  const productosInfo = datos.arrayProductsInfo
  construirFichaProductos(productosInfo, categoríasInfo)

  console.log('Menu dinámico construido con exito')
}

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
