/* global alert */

document.addEventListener('DOMContentLoaded', () => {
  cargarPromociones()
})

const cargarPromociones = async () => {
  const spinner = document.getElementById('loading-spinner')

  spinner.classList.remove('is-hidden')

  try {
    const response = await fetch('/admin/promociones/api/all')
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
    const cardHTML = `
      <div class="column is-4">
        <div class="card">
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">${promo.nombre}</p>
              </div>
            </div>
            <div class="content">
              ${promo.condición || 'Sin condición disponible.'}
            </div>
          </div>
          <footer class="card-footer">
            <a href="#" class="card-footer-item has-text-link" onclick="prepararModificacion(${promo.id_promo})">
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
