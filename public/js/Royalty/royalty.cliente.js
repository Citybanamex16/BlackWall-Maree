document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los contenedores en el HTML
  const contenedorPromociones = document.getElementById('contenedor-promociones')
  const contenedorEventos = document.getElementById('contenedor-eventos')
  const clienteNivelTexto = document.getElementById('cliente-nivel-badge').innerText.trim()
  const contenedorSellos = document.getElementById('contenedor-sellos')
  if (contenedorSellos) {
    // Obtenemos las visitas y limitamos la visualización a los sellos del nivel actual (1 a 10)
    const visitasTotales = parseInt(contenedorSellos.dataset.visitas) || 0
    let sellosGanados = visitasTotales % 10
    if (visitasTotales > 0 && sellosGanados === 0) {
      sellosGanados = 10
    }

    const maxSellos = 10
    const iconPath = 'm90.426 21.926c0.058594-0.10547 0.10156-0.21484 0.13281-0.32812 0.007812-0.03125 0.015625-0.066406 0.023437-0.097656 0.019531-0.089844 0.03125-0.17578 0.035157-0.26562 0-0.035156 0.003906-0.066406 0.003906-0.10156-0.003906-0.11719-0.015625-0.23437-0.046875-0.34766v-0.003906c-0.03125-0.11719-0.082031-0.22656-0.13672-0.33203-0.007812-0.011719-0.007812-0.023438-0.015625-0.035157-0.011719-0.015624-0.023437-0.03125-0.035156-0.046874-0.050781-0.078126-0.10547-0.15234-0.16797-0.21875-0.023438-0.023438-0.042969-0.050782-0.066406-0.070313-0.085938-0.082031-0.17578-0.15625-0.28125-0.21484l-0.003906-0.003906c-11.855-6.8555-25.637-10.48-39.863-10.48-14.223 0-28.008 3.625-39.863 10.48h-0.003906l-0.003907 0.003906c-0.13281 0.078125-0.24609 0.17578-0.34766 0.28516-0.019531 0.019531-0.035156 0.035156-0.054687 0.058593-0.09375 0.10938-0.16797 0.23438-0.22266 0.36328-0.011718 0.023438-0.019531 0.046876-0.027343 0.070313-0.050781 0.14062-0.089844 0.28125-0.10156 0.42969-0.011718 0.15234 0.007813 0.30469 0.042969 0.45313 0.003906 0.015624 0 0.03125 0.003906 0.042968 0.003907 0.007813 0.007813 0.015625 0.011719 0.023438 0.035156 0.11719 0.078125 0.23047 0.14062 0.33984l39.105 67.93 0.003906 0.003906c0.007812 0.015625 0.023438 0.027344 0.035156 0.042969 0.070313 0.10938 0.14453 0.20703 0.23438 0.29297 0.03125 0.027343 0.066407 0.046875 0.097657 0.074219 0.078124 0.0625 0.16016 0.125 0.25 0.17187 0.042968 0.023438 0.089843 0.039063 0.13672 0.054688 0.089844 0.035156 0.17578 0.066406 0.26953 0.082031 0.023437 0.003907 0.042968 0.015625 0.066406 0.019531 0.074218 0.011719 0.14844 0.015626 0.21875 0.015626h0.007812c0.12891 0 0.26172-0.019532 0.39062-0.050782 0.12891-0.035156 0.25-0.085937 0.36719-0.15234 0.10547-0.0625 0.19922-0.13672 0.28516-0.21875 0.023437-0.023437 0.042969-0.046874 0.0625-0.070312 0.066406-0.070312 0.12109-0.14453 0.17188-0.22656 0.011719-0.015626 0.027344-0.027344 0.035156-0.046876l39.105-67.914v-0.003906c0-0.003906 0.003906-0.007813 0.003906-0.007813zm-40.426-9.5078c11.805 0 23.285 2.5977 33.531 7.5352-3.9453 0.41016-7.793 1.2539-11.496 2.5312-1.6562-1.8711-3.9336-3.1055-6.4141-3.4414-1.4375-0.1875-2.8555-0.089844-4.2188 0.28516-0.61719 0.17188-1.2539-0.089844-1.5859-0.65625-1.8828-3.1758-5.3477-5.1523-9.043-5.1523-3.7461 0-7.125 1.9258-9.0312 5.1484-0.33984 0.57422-0.96875 0.82812-1.5977 0.65625-1.3594-0.375-2.7773-0.47266-4.2227-0.28516-2.6523 0.35938-5.1016 1.7852-6.7734 3.8867-4.0508-1.5273-8.2891-2.5312-12.668-2.9883 10.242-4.9375 21.723-7.5273 33.523-7.5273zm-6.3672 55.621 2.6289 11.527-32.691-56.797c5.4297 0.28125 10.652 1.4219 15.559 3.4102 7.8906 3.1953 14.586 8.5195 18.969 15.043-1.7812 2.9336-3.1406 6.0312-4.0391 9.2266-1.6289 5.7617-1.7734 11.676-0.42578 17.582zm6.2773-29.531c-4.3516-6.0469-10.555-11.051-17.793-14.348 1.1406-1.1289 2.6211-1.8906 4.2031-2.1016 1.0352-0.13281 2.0469-0.066406 3.0156 0.20312 1.9609 0.53906 3.9766-0.27734 5.0234-2.0391 1.3555-2.293 3.7539-3.6602 6.418-3.6602 2.668 0 5.0703 1.3672 6.4219 3.6562 1.0195 1.7383 3.082 2.5781 5.0195 2.043 0.96484-0.26953 1.9805-0.33594 3.0039-0.20312 1.3555 0.18359 2.625 0.75781 3.6758 1.6211-7.7305 3.2812-14.352 8.4531-18.984 14.828zm0.70703 46.473-4.0195-17.617c-1.2305-5.4062-1.0977-10.816 0.39062-16.082 0.90234-3.2188 2.3164-6.3359 4.1953-9.2617 4.6758-7.2734 12.086-13.07 20.859-16.324 4.582-1.6914 9.4102-2.6719 14.391-2.9297z'

    // Usamos 'sellos-grid' para que el CSS grid 2x5 funcione correctamente
    let gridHTML = '<div class="sellos-grid mb-4">'
    for (let i = 1; i <= maxSellos; i++) {
      const isActive = i <= sellosGanados
      const statusClass = isActive ? 'sello-activo' : 'sello-inactivo'

      gridHTML += `
              <div class="sello-item ${statusClass}">
                  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                      <g transform="scale(0.85) translate(5, 5)">
                          <path d="${iconPath}" />
                      </g>
                  </svg>
              </div>
          `
    }
    gridHTML += '</div>'
    contenedorSellos.innerHTML = gridHTML
  }
  fetch('/royalty/royaltyUser/api/datos', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(async (response) => {
      const data = await response.json()

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
        return null
      }
      if (!response.ok) throw new Error('Error al obtener la información Royalty')
      return data
    })
    .then(data => {
      contenedorPromociones.innerHTML = ''
      if (data.promociones.length > 0) {
        let htmlPromos = ''
        data.promociones.forEach(promo => {
          const fecha = new Date(promo.Fecha_final).toLocaleDateString()
          const borderClass = promo.Nombre_Royalty === clienteNivelTexto ? 'border border-warning' : ''

          htmlPromos += `
            <div class="promo-card d-flex flex-column ${borderClass}">
                <div class="mb-auto">
                    <span class="badge bg-dark mb-3">Beneficio ${promo.Nombre_Royalty}</span>
                    <h5 class="fw-bold mb-1">${promo.Nombre}</h5>
                    <p class="text-muted small mb-3">${promo.Descuento}</p>
                </div>
                <div class="mt-3 pt-3 border-top text-muted small">
                    <i class="bi bi-clock-history"></i> Válido hasta: ${fecha}
                </div>
            </div>
          `
        })
        contenedorPromociones.innerHTML = htmlPromos
      } else {
        contenedorPromociones.innerHTML = '<div class="alert alert-light border mx-3 w-100 text-center">Aún no hay promociones disponibles.</div>'
      }

      contenedorEventos.innerHTML = ''

      if (data.eventos.length > 0) {
        let htmlEventos = ''
        data.eventos.forEach(evento => {
          const fecha = new Date(evento.Fecha_final).toLocaleDateString()

          htmlEventos += `
            <div class="event-card d-flex flex-column">
                <div class="mb-auto">
                    <span class="badge bg-warning text-dark mb-3">Pase ${evento.Nombre_Royalty}</span>
                    <h5 class="fw-bold mb-1">${evento.Nombre_Evento}</h5>
                    <p class="text-muted small mb-3">${evento.Descripcion}</p>
                </div>
                <div class="mt-3 pt-3 border-top text-muted small">
                    <i class="bi bi-calendar-event"></i> <strong>Fecha:</strong> ${fecha}
                </div>
            </div>
          `
        })
        contenedorEventos.innerHTML = htmlEventos
      } else {
        contenedorEventos.innerHTML = '<div class="alert alert-light border mx-3 w-100 text-center">Por el momento no hay eventos programados.</div>'
      }
      const contenedorMetricas = document.getElementById('contenedor-metricas')
      if (data.metrics) {
        const { global, personal } = data.metrics

        contenedorMetricas.innerHTML = `
          <div class="metrics-grid">
              <div class="metrics-card">
                  <h2 class="section-title mb-4 fs-5 text-start">Tus Favoritos</h2>
                  <div class="row g-3">
                      <div class="col-6">
                          <div class="fav-highlight">
                              <i class="bi bi-cup-hot text-gold"></i>
                              <span class="stat-label d-block mb-1">Bebida</span>
                              <strong class="small text-truncate d-block">${personal.bebidas[0]?.Nombre || '¡Prueba una!'}</strong>
                          </div>
                      </div>
                      <div class="col-6">
                          <div class="fav-highlight">
                              <i class="bi bi-egg-fried text-gold"></i>
                              <span class="stat-label d-block mb-1">Platillo</span>
                              <strong class="small text-truncate d-block">${personal.platillos[0]?.Nombre || '¡Pide tu crepe!'}</strong>
                          </div>
                      </div>
                  </div>
              </div>

              <div class="metrics-card">
                  <h2 class="section-title mb-4 fs-5 text-start">Lo más pedido</h2>
                  <div class="row g-3">
                      <div class="col-6">
                          <p class="stat-label mb-2 text-center">Bebidas</p>
                          ${global.bebidas.slice(0, 3).map((item, i) => `
                              <div class="ranking-item">
                                  <span class="rank-number">${i + 1}</span>
                                  <span class="small fw-bold text-truncate">${item.Nombre}</span>
                              </div>
                          `).join('')}
                      </div>
                      <div class="col-6">
                          <p class="stat-label mb-2 text-center">Platillos</p>
                          ${global.platillos.slice(0, 3).map((item, i) => `
                              <div class="ranking-item">
                                  <span class="rank-number">${i + 1}</span>
                                  <span class="small fw-bold text-truncate">${item.Nombre}</span>
                              </div>
                          `).join('')}
                      </div>
                  </div>
              </div>
          </div>`
      }
    })
    .catch(error => {
      console.error('Error:', error)
      contenedorPromociones.innerHTML = '<div class="alert alert-danger mx-3 w-100">Ocurrió un error al cargar las promociones.</div>'
      contenedorEventos.innerHTML = '<div class="alert alert-danger mx-3 w-100">Ocurrió un error al cargar los eventos.</div>'
    })

  // SECCION NUEVA DE CHARLY NO BORRAR SI APARECE EN MERGE CONFLICT ESTO ES NUEVO Y FUNCIONAL

  async function obtenerCatalogoDePRs () {
    console.log('Obteniendo PRs respetando EFUL')
    try {
      const response = await fetch('/menu/consultarPromosMenu')

      if (!response.ok) {
        console.log('Error Interno')
        throw new Error('Error Interno PRs')
      }

      const data = await response.json()

      const RPs = data.allPRs[0]

      const cliente = {
        nombre: window.clienteData.nombre,
        nivel: window.clienteData.nivel,
        visitas: window.clienteData.visitas
      }

      console.log('PROMOS obtenidas: ', RPs)
      console.log('Cliente: ', cliente)

      const RPsFinales = filtrarRPs(RPs, cliente) // obtenemos solo RPs del nivel del cliente
      console.log('RPs finales: ', RPsFinales)

      construirCarruselPromos(RPsFinales)
    } catch (err) {

    }
  }

  obtenerCatalogoDePRs()
})

function filtrarRPs (RPsGlobales, datosCliente) {
  console.log('Filtrando RPsGlobales')

  const RPsFiltradas = RPsGlobales.filter(promo =>
    promo.Nombre_Royalty === datosCliente.nivel
  )

  console.log(`Cliente nivel: ${datosCliente.nivel} → ${RPsFiltradas.length} promos encontradas`)
  return RPsFiltradas
}

function construirCarruselPromos (RPsFinales) {
  console.log('Construyendo carrusel con RPs finales')

  const loading = document.getElementById('promos-loading')
  const empty = document.getElementById('promos-empty')
  const carrusel = document.getElementById('contenedor-promos-carrusel')

  loading.style.display = 'none'

  if (!RPsFinales || RPsFinales.length === 0) {
    empty.style.display = 'block'
    return
  }

  carrusel.innerHTML = ''

  RPsFinales.forEach(promo => {
    const descuento = promo.Descuento
      ? `${Math.round(parseFloat(promo.Descuento) * 100)}% OFF`
      : null

    const card = document.createElement('div')
    card.classList.add('promo-img-card')
    card.innerHTML = `
      <!-- Icono decorativo -->
      <div class="promo-icon-area">
        <span class="promo-icon-circle">
          <span style="font-size: 28px;">👑</span>
        </span>
        ${descuento ? `<span class="promo-descuento-badge">${descuento}</span>` : ''}
      </div>

      <!-- Datos de la promo -->
      <div class="promo-img-caption">
        <p class="promo-plantilla">${promo.Plantilla_Promo}</p>
        <p class="promo-producto">${promo.Producto}</p>
        <span class="promo-nivel-pill">${promo.Nombre_Royalty}</span>
      </div>
    `
    carrusel.appendChild(card)
  })

  carrusel.style.display = 'flex'
}
