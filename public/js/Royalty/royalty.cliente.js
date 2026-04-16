document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los contenedores en el HTML
  const contenedorPromociones = document.getElementById('contenedor-promociones')
  const contenedorEventos = document.getElementById('contenedor-eventos')
  const clienteNivelTexto = document.getElementById('cliente-nivel-badge').innerText.trim()

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
})
