/* CU01 */
const platillobotones = document.getElementsByClassName('platillo-btn')
const overlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const modalClose = document.getElementById('modal-close')
/* global localStorage, L */
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

// ── MAPA DE UBICACIÓN ──
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

// ── DROPDOWNS DE SECCIONES ──
const seccionesCollapsible = document.querySelectorAll('.menu-section--collapsible')

for (const seccion of seccionesCollapsible) {
  const header = seccion.querySelector('.section-header')
  const contenido = seccion.querySelector('.section-content')

  header.addEventListener('click', () => {
    const abierto = seccion.dataset.open === 'true'
    seccion.dataset.open = abierto ? 'false' : 'true'
    contenido.style.display = abierto ? 'none' : 'block'
  })
}

/* CU11 Visualizar Menu Digital */

// Funcion para obtener los datos del Menu
async function obtenerMenu () {
  try {
    const response = await fetch('/menu/menuData')

    if (!response.ok) {
      console.log('Señal de Error desde Backend: ', response.message)
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    console.log('Datos obtenidos de Backend: ', data)

    /* === Llamada a Construcción de Menu Dinámico == */
    contruirMenuDinamico(data)
  } catch (error) {
    console.error('Error al obtener el menú:', error)
  }
}

obtenerMenu()

/* ==Construcción de Menu Dinámico == */

function construirFichaProductos (datosProducto, datosCategorias) {
  console.log('Repartiendo productos en sus categorías...')
  console.log('Datos productos: ', datosProducto)

  // 1. Iteramos por cada categoría que ya existe en el DOM
  datosCategorias.forEach(cat => {
    // 2. Buscamos el contenedor específico de esta categoría
    // Usamos el ID que generamos en la Capa 1
    const sectionPrincipal = document.getElementById(cat.id)

    // Seleccionamos el div con la clase .grid-productos que dejamos listo
    const gridDestino = sectionPrincipal.querySelector('.grid-productos')

    // 3. Filtramos: ¿Qué productos pertenecen a esta categoría?
    const productosFiltrados = datosProducto.filter(prod => prod.categoria === cat.nombre)

    // 4. Por cada producto filtrado, construimos su "Ficha" (Capa 2 + Capa 3)
    productosFiltrados.forEach(prod => {
      const cardHTML = `
                <div class="column is-12-mobile is-6-tablet is-4-desktop">
                    <div class="card product-card h-100">
                        <div class="card-image">
                            <figure class="image is-4by3">
                                <img src="${prod.imagen}" alt="${prod.nombre}" style="object-fit: cover;">
                            </figure>
                        </div>
                        
                        <div class="card-content">
                            <div class="media mb-2">
                                <div class="media-content">
                                    <p class="title is-5 mb-1">${prod.nombre}</p>
                                    <p class="subtitle is-6 has-text-primary has-text-weight-bold">$${prod.precio}</p>
                                </div>
                            </div>

                            <div class="content">
                                <div class="tags" id="ingredientes-${prod.id}">
                                    ${generarBadgesIngredientes(prod.ingredientes)}
                                </div>
                                
                                <button class="button is-primary is-small is-fullwidth is-outlined mt-3">
                                    + Agregar a la orden
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `

      // Inyectamos la ficha en el grid de la categoría
      gridDestino.insertAdjacentHTML('beforeend', cardHTML)
    })
  })
}

// Función auxiliar para la Capa 3: Los Ingredientes
function generarBadgesIngredientes (listaIngredientes) {
  if (!listaIngredientes || listaIngredientes.length === 0) return ''

  return listaIngredientes.map(ing =>
        `<span class="tag is-light is-rounded" style="font-size: 0.75rem;">${ing.nombre}</span>`
  ).join(' ')
}

function construirCategoria (cat, contenedorMenu) {
  // Crear el elemento de sección
  const seccionCat = document.createElement('section')
  seccionCat.className = 'categoria-section mb-6 is-dynamic' // Clase para CSS
  seccionCat.id = `cat-${cat.Nombre.toLowerCase()}` // ID único por si necesitas anclas
  const seccionID = seccionCat.id
  // Estructura interna de la categoría
  // Creamos un div específico para los productos de esta categoría
  seccionCat.innerHTML = `
            <h2 class="title is-3 is-italic mb-5">${cat.Nombre}</h2>
            <hr class="mb-5" style="background-color: #eee; height: 1px;">
            
            <div class="columns is-multiline grid-productos">
                </div>
        `
  // 5. Inyectar la sección en el DOM
  contenedorMenu.appendChild(seccionCat)

  return { id: seccionID, nombre: cat.Nombre }
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
  console.log('ID de categorias en View: ', categoríasInfo)

  const productosInfo = datos.arrayProductsInfo
  construirFichaProductos(productosInfo, categoríasInfo)

  console.log('Menu dinámico construido con exito')
}
