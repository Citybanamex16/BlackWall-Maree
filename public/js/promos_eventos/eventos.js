/* global alert, location */

// --------------------------- Funcionalidad Registrar Evento  ---------------------------
// eslint-disable-next-line no-unused-vars
const cargarYMostrarModal = async () => {
  const btn = document.getElementById('btn-registrar-evento')
  btn.classList.add('is-loading')

  try {
    const response = await fetch('/promos/eventos/api/catalogos')
    const result = await response.json()

    if (result.success) {
      const { promociones, royalties, productos } = result.data
      poblarSelect('promociones', promociones)
      poblarSelect('productos', productos)

      // Una vez lleno, mostramos el modal
      document.getElementById('modal-evento').classList.add('is-active')
    }
  } catch (error) {
    console.error('Error al cargar catálogos:', error)
    alert('No se pudieron cargar las promociones o productos.')
  } finally {
    btn.classList.remove('is-loading')
  }
}

// Función helper para no repetir código
// eslint-disable-next-line no-unused-vars
function poblarSelect (idSelect, lista) {
  const select = document.getElementById(idSelect)
  select.innerHTML = ''

  lista.forEach(item => {
    const option = document.createElement('option')
    option.value = item.id
    option.textContent = item.nombre
    select.appendChild(option)
  })
}

// eslint-disable-next-line no-unused-vars
const cerrarModal = () => {
  document.getElementById('modal-evento').classList.remove('is-active')
}

// Función para capturar los IDs seleccionados
// eslint-disable-next-line no-unused-vars
const getSelectedValues = (id) => {
  const select = document.getElementById(id)
  return Array.from(select.selectedOptions).map(opt => opt.value)
}

// eslint-disable-next-line no-unused-vars
function validarFormulario (datos) {
  let esValido = true
  document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'))
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())

  if (!datos.nombre || datos.nombre.trim() === '') {
    marcarError('nombre', 'El nombre es obligatorio')
    esValido = false
  }

  if (datos.promociones.length === 0) {
    marcarError('selectPromos', 'Debes seleccionar al menos una promoción')
    esValido = false
  }

  return esValido
}

// eslint-disable-next-line no-unused-vars
function marcarError (id, mensaje) {
  const elemento = document.getElementById(id)
  elemento.classList.add('is-danger')

  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje
  elemento.closest('.control').appendChild(help)
}

// eslint-disable-next-line no-unused-vars
const guardarEvento = () => {
  const elNombre = document.getElementById('nombre')
  const elDesc = document.getElementById('descripcion')
  const elInicio = document.getElementById('fechaInicio')
  const elFin = document.getElementById('fechaFin')

  const datos = {
    nombre: elNombre.value,
    descripcion: elDesc.value,
    fechaInicio: elInicio.value,
    fechaFin: elFin.value,
    promociones: getSelectedValues('promociones'),
    productos: getSelectedValues('productos')
  }

  let error = false;
  [elNombre, elDesc, elInicio, elFin].forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('is-danger')
      error = true
    } else {
      input.classList.remove('is-danger')
    }
  })

  if (error) return

  const btnGuardar = document.querySelector('.button.is-primary')
  btnGuardar.classList.add('is-loading')

  fetch('/promos/eventos/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('¡Listo! ' + data.message)
        cerrarModal()
        location.reload()
      } else {
        alert('Error: ' + data.message)
      }
    })
    .catch(err => console.error('Error en la petición:', err))
}

// --------------------------- Funcionalidad Visualizar Catalogo Eventos  ---------------------------
document.addEventListener('DOMContentLoaded', () => {
  cargarEventos()
})

const cargarEventos = async () => {
  const spinner = document.getElementById('loading-spinner')

  spinner.classList.remove('is-hidden')

  try {
    const response = await fetch('/promos/eventos/api/all')
    const result = await response.json()

    if (result.success) {
      renderizarEventos(result.data)
    }
  } catch (error) {
    console.error(error)
    alert('Error al conectar con el servidor')
  } finally {
    spinner.classList.add('is-hidden')
  }
}

function renderizarEventos (lista) {
  const contenedor = document.getElementById('contenedor-eventos')
  contenedor.innerHTML = ''

  if (lista.length === 0) {
    contenedor.innerHTML = '<p class="column is-full has-text-centered">No hay eventos registrados.</p>'
    return
  }

  lista.forEach(evento => {
    const statusTag = evento.Activo
      ? '<span class="tag is-success is-light">Sí</span>'
      : '<span class="tag is-danger is-light">No</span>'
    const cardHTML = `
      <div class="column is-4">
          <div class="card event-card">
              <div class="card-content">
                  <p class="title is-5 mb-2">${evento.Nombre}</p>
                  <p class="subtitle is-7 is-uppercase has-text-grey-light mb-4">Evento Marée</p>
                  
                  <div class="has-text-right">
                      <p class="is-size-7 has-text-grey is-uppercase mb-1">Activo</p>
                      ${statusTag}
                  </div>

                  <div class="content is-size-6 has-text-grey">
                      ${evento.Descripcion || 'Sin descripción disponible.'}
                  </div>

                  <hr class="my-4" style="background-color: #f5f5f5; height: 1px;">
                  
                  <div class="is-flex is-justify-content-space-between is-align-items-center">
                      <div>
                          <p class="is-size-7 has-text-grey-lighter is-uppercase">Vigencia</p>
                          <span class="event-date-tag">${evento.Fecha_Inicio} - ${evento.Fecha_Final}</span>
                      </div>
                  </div>
              </div>
              <footer class="card-footer" style="border-top: none; background-color: #fafafa;">
                  <a href="#" class="card-footer-item has-text-grey" onclick="prepararModificacion(${evento.ID_Evento})">
                      <span class="icon is-small mr-2"><i class="fas fa-edit"></i></span> Modificar
                  </a>
              </footer>
          </div>
      </div>`
    contenedor.insertAdjacentHTML('beforeend', cardHTML)
  })
}

// --------------------------- Funcionalidad Modificar Eventos  ---------------------------
// eslint-disable-next-line no-unused-vars
function prepararModificacion (id) {
  console.log('Modificando evento:', id)
  // Aquí irá la lógica del siguiente caso de uso
}
