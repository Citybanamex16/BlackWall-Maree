document.addEventListener('DOMContentLoaded', () => {
  // Referencias a los contenedores en el HTML
  const contenedorPromociones = document.getElementById('contenedor-promociones')
  const contenedorEventos = document.getElementById('contenedor-eventos')
  const clienteNivelTexto = document.getElementById('cliente-nivel-badge').innerText.trim()

  // Hacemos la petición al endpoint JSON
  fetch('/royalty/royaltyUser/api/datos', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => {
      if (!response.ok) throw new Error('Error al obtener la información Royalty')
      return response.json()
    })
    .then(data => {
      contenedorPromociones.innerHTML = ''

      if (data.promociones.length > 0) {
        let htmlPromos = ''
        data.promociones.forEach(promo => {
          const fecha = new Date(promo.Fecha_final).toLocaleDateString()
          const borderClass = promo.Nombre_Royalty === clienteNivelTexto ? 'border-primary' : 'border-secondary'

          htmlPromos += `
                    <div class="col-md-4 mb-4">
                        <div class="card h-100 shadow-sm ${borderClass}">
                            <div class="card-body">
                                <span class="badge bg-dark mb-2">Beneficio ${promo.Nombre_Royalty}</span>
                                <h5 class="card-title">${promo.Nombre}</h5>
                                <p class="card-text">${promo.Descuento}</p>
                            </div>
                            <div class="card-footer text-muted">
                                Válido hasta: ${fecha}
                            </div>
                        </div>
                    </div>
                `
        })
        contenedorPromociones.innerHTML = htmlPromos
      } else {
        contenedorPromociones.innerHTML = '<div class="alert alert-info w-100">Aún no hay promociones disponibles.</div>'
      }

      contenedorEventos.innerHTML = ''

      if (data.eventos.length > 0) {
        let htmlEventos = ''
        data.eventos.forEach(evento => {
          const fecha = new Date(evento.Fecha_final).toLocaleDateString()

          htmlEventos += `
                    <div class="col-md-6 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <span class="badge bg-warning text-dark mb-2">Pase ${evento.Nombre_Royalty}</span>
                                <h5 class="card-title">${evento.Nombre}</h5>
                                <p class="card-text">${evento.Descripcion}</p>
                            </div>
                            <div class="card-footer bg-transparent border-top-0">
                                <strong>Fecha:</strong> ${fecha}
                            </div>
                        </div>
                    </div>
                `
        })
        contenedorEventos.innerHTML = htmlEventos
      } else {
        contenedorEventos.innerHTML = '<div class="alert alert-info w-100">Por el momento no hay eventos programados.</div>'
      }
    })
    .catch(error => {
      console.error('Error:', error)
      contenedorPromociones.innerHTML = '<div class="alert alert-danger w-100">Ocurrió un error al cargar las promociones.</div>'
      contenedorEventos.innerHTML = '<div class="alert alert-danger w-100">Ocurrió un error al cargar los eventos.</div>'
    })
})
