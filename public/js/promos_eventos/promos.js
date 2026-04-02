/* global alert */

document.addEventListener('DOMContentLoaded', () => {
  cargarPromociones()
})

const cargarPromociones = async () => {
  const spinner = document.getElementById('loading-spinner')

  spinner.classList.remove('is-hidden')

  try {
    const response = await fetch('/promos/promociones/api/all')
    const result = await response.json()

    if (result.success) {
      renderizarPromociones(result.data)
    }
  } catch (error) {
    console.error(error)
    alert('Error al conectar con el servidor')
  } finally {
    spinner.classList.add('is-hidden')
  }
}

function renderizarPromociones (lista) {
  const contenedor = document.getElementById('contenedor-promociones')
  contenedor.innerHTML = ''

  if (lista.length === 0) {
    contenedor.innerHTML = '<p class="column is-full has-text-centered">No hay promociones registradas.</p>'
    return
  }

  lista.forEach(promo => {
    const statusTag = promo.Activo
      ? '<span class="tag is-success is-light">Sí</span>'
      : '<span class="tag is-danger is-light">No</span>'
    const cardHTML = `
      <div class="column is-4">
        <div class="card">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${promo.Nombre}</p>
                <div class="has-text-right">
                    <p class="is-size-7 has-text-grey is-uppercase mb-1">Activo</p>
                    ${statusTag}
                </div>
              </div>
            </div>
            <div class="content">
              ${promo.Condiciones || 'Sin condición disponible.'}
            </div>

             <hr class="my-4" style="background-color: #f5f5f5; height: 1px;">
                  
                  <div class="is-flex is-justify-content-space-between is-align-items-center">
                      <div>
                          <p class="is-size-7 has-text-grey-lighter is-uppercase">Vigencia</p>
                          <span class="event-date-tag">${promo.Fecha_inicio} - ${promo.Fecha_final}</span>
                      </div>
                  </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item has-text-link" onclick="prepararModificacion(${promo.ID_Promocion})">
              Modificar
            </a>
          </footer>
        </div>
      </div>
    `
    contenedor.insertAdjacentHTML('beforeend', cardHTML)
  })
}

// eslint-disable-next-line no-unused-vars
function prepararModificacion (id) {
  console.log('Modificando promo:', id)
  // Aquí irá la lógica del siguiente caso de uso
}
