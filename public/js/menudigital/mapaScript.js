let mapa = null
let marcadorCliente = null
let sucursalSeleccionada = null

const marcadores = []
const mexicoCentro = [23.6345, -102.5528]

document.addEventListener('DOMContentLoaded', () => {
  inicializarMapa()
  cargarSucursales()

  const btnMiUbicacion = document.getElementById('btnMiUbicacion')

  if (btnMiUbicacion) {
    btnMiUbicacion.addEventListener('click', obtenerUbicacionCliente)
  }
})

function inicializarMapa () {
  mapa = L.map('contenedor-mapa').setView(mexicoCentro, 5)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa)
}

async function cargarSucursales () {
  mostrarMensaje('Cargando sucursales...')

  try {
    const response = await fetch('/menu/Sucursales/getAll')

    if (!response.ok) {
      throw new Error('No se pudieron obtener las sucursales')
    }

    const data = await response.json()
    const sucursales = data.allSucursales || []

    construirListaSucursales(sucursales)
    await colocarMarcadores(sucursales)

    if (sucursales.length === 0) {
      mostrarMensaje('No hay sucursales registradas.')
    } else {
      mostrarMensaje('Selecciona una sucursal para verla en el mapa.')
    }
  } catch (error) {
    console.error(error)
    mostrarMensaje('No se pudieron cargar las sucursales.')
  }
}

function construirListaSucursales (sucursales) {
  const contenedor = document.getElementById('contenedor-sucursales')

  if (!contenedor) return

  contenedor.innerHTML = ''

  if (sucursales.length === 0) {
    contenedor.innerHTML = `
      <div class="sucursal-card">
        <p>No hay sucursales disponibles.</p>
      </div>
    `
    return
  }

  sucursales.forEach((sucursal, index) => {
    const card = document.createElement('button')
    card.type = 'button'
    card.className = 'sucursal-card sucursal-card-btn'
    card.dataset.index = index

    card.innerHTML = `
      <p class="sucursal-nombre">${escaparHTML(sucursal.Nombre)}</p>

      <p class="sucursal-dato">
        <i class="fa-solid fa-location-dot"></i>
        ${escaparHTML(sucursal.Calle || '')}
      </p>

      <p class="sucursal-dato">
        <i class="fa-solid fa-city"></i>
        ${escaparHTML(sucursal.Municipio || '')}, ${escaparHTML(sucursal.Ciudad || '')}
      </p>

      <p class="sucursal-dato">
        <i class="fa-solid fa-map"></i>
        ${escaparHTML(sucursal.Estado || '')}, ${escaparHTML(sucursal.País || sucursal.Pais || 'México')}
      </p>

      <span class="sucursal-accion">Ver en mapa</span>
    `

    card.addEventListener('click', () => seleccionarSucursal(index))

    contenedor.appendChild(card)
  })
}

async function colocarMarcadores (sucursales) {
  const grupo = L.featureGroup()

  for (let i = 0; i < sucursales.length; i++) {
    const sucursal = sucursales[i]
    const coordenadas = await geocodificarSucursal(sucursal)

    if (!coordenadas) {
      console.warn('No se pudo geocodificar:', sucursal)
      continue
    }

    const marker = L.marker([coordenadas.lat, coordenadas.lon])
      .bindPopup(crearPopupSucursal(sucursal))

    marker.addTo(mapa)
    marker.addTo(grupo)

    marcadores.push({
      marker,
      sucursal,
      coordenadas
    })
  }

  if (marcadores.length > 0) {
    grupo.addTo(mapa)
    mapa.fitBounds(grupo.getBounds(), {
      padding: [40, 40]
    })

    seleccionarSucursal(0)
  }
}

async function geocodificarSucursal (sucursal) {
  const direccion = construirDireccionCompleta(sucursal)

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(direccion)}`

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json'
      }
    })

    const data = await response.json()

    if (!data || data.length === 0) {
      return null
    }

    return {
      lat: Number(data[0].lat),
      lon: Number(data[0].lon)
    }
  } catch (error) {
    console.error('Error al geocodificar dirección:', error)
    return null
  }
}

function seleccionarSucursal (index) {
  const item = marcadores[index]

  if (!item) return

  sucursalSeleccionada = item

  mapa.setView([item.coordenadas.lat, item.coordenadas.lon], 16)
  item.marker.openPopup()

  actualizarBotonRuta(item.sucursal)
  resaltarCard(index)
}

function obtenerUbicacionCliente () {
  if (!navigator.geolocation) {
    mostrarMensaje('Tu navegador no permite obtener ubicación automática.')
    return
  }

  mostrarMensaje('Obteniendo tu ubicación...')

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lon = position.coords.longitude

      if (marcadorCliente) {
        mapa.removeLayer(marcadorCliente)
      }

      marcadorCliente = L.marker([lat, lon])
        .addTo(mapa)
        .bindPopup('Tu ubicación actual')
        .openPopup()

      mapa.setView([lat, lon], 14)

      mostrarMensaje('Ubicación encontrada.')
    },
    () => {
      mostrarMensaje('No se pudo acceder a tu ubicación.')
    }
  )
}

function actualizarBotonRuta (sucursal) {
  const boton = document.getElementById('btnAbrirMapa')

  if (!boton) return

  const direccion = construirDireccionCompleta(sucursal)

  boton.href = `https://www.openstreetmap.org/search?query=${encodeURIComponent(direccion)}`
}

function crearPopupSucursal (sucursal) {
  const direccion = construirDireccionCompleta(sucursal)

  return `
    <div class="mapa-popup">
      <strong>${escaparHTML(sucursal.Nombre)}</strong>
      <p>${escaparHTML(direccion)}</p>
    </div>
  `
}

function construirDireccionCompleta (sucursal) {
  return [
    sucursal.Calle,
    sucursal.Municipio,
    sucursal.Ciudad,
    sucursal.Estado,
    sucursal.País || sucursal.Pais || 'México'
  ]
    .filter(dato => dato && String(dato).trim() !== '')
    .join(', ')
}

function resaltarCard (index) {
  const cards = document.querySelectorAll('.sucursal-card-btn')

  cards.forEach(card => card.classList.remove('sucursal-card-activa'))

  const cardActiva = document.querySelector(`.sucursal-card-btn[data-index="${index}"]`)

  if (cardActiva) {
    cardActiva.classList.add('sucursal-card-activa')
  }
}

function mostrarMensaje (mensaje) {
  const elemento = document.getElementById('mapaMensaje')

  if (elemento) {
    elemento.textContent = mensaje
  }
}

function escaparHTML (texto) {
  if (texto === null || texto === undefined) return ''

  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}