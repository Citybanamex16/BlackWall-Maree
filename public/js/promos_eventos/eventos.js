/* eslint-env browser */

const estadoEventos = {
  modoFormulario: 'registro',
  idEventoEditando: '',
  nombreEvento: '',
  activoEvento: false,
  accionCU24: '',
  siguienteEstado: null
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarPantallaEventos()
  cargarEventos()
})

function inicializarPantallaEventos () {
  const btnEstado = document.getElementById('btn-opcion-estado-evento')
  const btnEliminar = document.getElementById('btn-opcion-eliminar')
  const btnConfirmar = document.getElementById('btn-confirmar-accion-evento')

  if (btnEstado) {
    btnEstado.addEventListener('click', prepararCambioEstado)
  }

  if (btnEliminar) {
    btnEliminar.addEventListener('click', prepararEliminacionEvento)
  }

  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', confirmarAccionEvento)
  }
}

async function abrirFormularioRegistro () {
  estadoEventos.modoFormulario = 'registro'
  estadoEventos.idEventoEditando = ''
  limpiarFeedback()
  resetearFormularioEvento()
  actualizarEncabezadoFormulario()

  await cargarCatalogosFormulario()
  abrirModal('modal-formulario-evento')
}

async function prepararModificacion (idEvento) {
  limpiarFeedback()
  mostrarSpinner(true)

  try {
    const response = await fetch(`/promos/eventos/${encodeURIComponent(idEvento)}`)
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo cargar el evento.')
    }

    const { evento, catalogos, seleccionados } = result.data

    estadoEventos.modoFormulario = 'edicion'
    estadoEventos.idEventoEditando = evento.ID_Evento

    actualizarEncabezadoFormulario()
    poblarSelect('promociones', catalogos.promociones, seleccionados.promociones)
    poblarSelect('productos', catalogos.productos, seleccionados.productos)
    llenarFormularioEvento(evento)

    abrirModal('modal-formulario-evento')
  } catch (error) {
    mostrarFeedback('danger', error.message || 'No se pudo cargar la informacion del evento.')
  } finally {
    mostrarSpinner(false)
  }
}

async function cargarCatalogosFormulario () {
  mostrarSpinner(true)

  try {
    const response = await fetch('/promos/eventos/api/catalogos')
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudieron cargar los catalogos.')
    }

    const { promociones, productos } = result.data
    poblarSelect('promociones', promociones)
    poblarSelect('productos', productos)
  } catch (error) {
    mostrarFeedback('danger', error.message || 'No se pudieron cargar los catalogos del evento.')
    throw error
  } finally {
    mostrarSpinner(false)
  }
}

function poblarSelect (idSelect, lista, seleccionados = []) {
  const select = document.getElementById(idSelect)

  if (!select) {
    return
  }

  const seleccion = new Set(seleccionados.map(value => String(value)))
  select.innerHTML = ''

  lista.forEach(item => {
    const option = document.createElement('option')
    option.value = item.id
    option.textContent = item.nombre
    option.selected = seleccion.has(String(item.id))
    select.appendChild(option)
  })
}

function llenarFormularioEvento (evento) {
  document.getElementById('nombre').value = evento.Nombre || ''
  document.getElementById('descripcion').value = evento.Descripcion || ''
  document.getElementById('fechaInicio').value = normalizarFechaInput(evento.Fecha_Inicio)
  document.getElementById('fechaFin').value = normalizarFechaInput(evento.Fecha_Final)
}

function actualizarEncabezadoFormulario () {
  const titulo = document.getElementById('titulo-form-evento')
  const modo = document.getElementById('modo-form-evento')
  const botonGuardar = document.getElementById('btn-guardar-evento')

  if (estadoEventos.modoFormulario === 'edicion') {
    titulo.textContent = 'Modificar Evento'
    modo.textContent = 'Edicion'
    botonGuardar.textContent = 'Guardar Cambios'
    botonGuardar.className = 'button is-link'
    return
  }

  titulo.textContent = 'Registrar Nuevo Evento'
  modo.textContent = 'Alta'
  botonGuardar.textContent = 'Guardar Evento'
  botonGuardar.className = 'button is-primary'
}

function cerrarModalFormulario () {
  cerrarModal('modal-formulario-evento')
  resetearFormularioEvento()
}

function resetearFormularioEvento () {
  const form = document.getElementById('form-evento')

  form.reset()
  limpiarErroresFormulario()

  estadoEventos.modoFormulario = 'registro'
  estadoEventos.idEventoEditando = ''
  actualizarEncabezadoFormulario()
}

function getSelectedValues (id) {
  const select = document.getElementById(id)
  return Array.from(select.selectedOptions).map(opt => opt.value)
}

function limpiarErroresFormulario () {
  const form = document.getElementById('form-evento')

  form.querySelectorAll('.input').forEach(input => {
    input.classList.remove('is-danger')
  })

  form.querySelectorAll('.help.is-danger').forEach(message => {
    message.remove()
  })
}

function marcarErrorFormulario (id, mensaje) {
  const elemento = document.getElementById(id)

  if (!elemento) {
    return
  }

  elemento.classList.add('is-danger')

  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje

  const control = elemento.closest('.control')
  if (control) {
    control.appendChild(help)
  }
}

function validarFormularioEvento (datos) {
  let esValido = true
  limpiarErroresFormulario()

  if (!datos.nombre.trim()) {
    marcarErrorFormulario('nombre', 'El nombre es obligatorio.')
    esValido = false
  }

  if (!datos.descripcion.trim()) {
    marcarErrorFormulario('descripcion', 'La descripcion es obligatoria.')
    esValido = false
  }

  if (!datos.fechaInicio) {
    marcarErrorFormulario('fechaInicio', 'La fecha de inicio es obligatoria.')
    esValido = false
  }

  if (!datos.fechaFin) {
    marcarErrorFormulario('fechaFin', 'La fecha de fin es obligatoria.')
    esValido = false
  }

  if (datos.fechaInicio && datos.fechaFin && datos.fechaFin < datos.fechaInicio) {
    marcarErrorFormulario('fechaFin', 'La fecha de fin no puede ser menor a la fecha de inicio.')
    esValido = false
  }

  return esValido
}

async function guardarEvento () {
  const datos = {
    nombre: document.getElementById('nombre').value,
    descripcion: document.getElementById('descripcion').value,
    fechaInicio: document.getElementById('fechaInicio').value,
    fechaFin: document.getElementById('fechaFin').value,
    promociones: getSelectedValues('promociones'),
    productos: getSelectedValues('productos')
  }

  if (!validarFormularioEvento(datos)) {
    return
  }

  const botonGuardar = document.getElementById('btn-guardar-evento')
  botonGuardar.classList.add('is-loading')
  limpiarFeedback()

  const esEdicion = estadoEventos.modoFormulario === 'edicion'
  const endpoint = esEdicion
    ? `/promos/eventos/${encodeURIComponent(estadoEventos.idEventoEditando)}`
    : '/promos/eventos/registrar'
  const method = esEdicion ? 'PUT' : 'POST'

  try {
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo guardar el evento.')
    }

    cerrarModalFormulario()
    mostrarFeedback('success', result.message)
    await cargarEventos()
  } catch (error) {
    mostrarFeedback('danger', error.message || 'No se pudo guardar el evento.')
  } finally {
    botonGuardar.classList.remove('is-loading')
  }
}

async function cargarEventos () {
  mostrarSpinner(true)

  try {
    const response = await fetch('/promos/eventos/api/all')
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudieron cargar los eventos.')
    }

    renderizarEventos(result.data)
  } catch (error) {
    mostrarFeedback('danger', error.message || 'Error al conectar con el servidor.')
  } finally {
    mostrarSpinner(false)
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
    const idEvento = escapeHtml(evento.ID_Evento)
    const nombreEvento = escapeHtml(evento.Nombre || 'Evento sin nombre')
    const descripcion = escapeHtml(evento.Descripcion || 'Sin descripcion disponible.')
    const fechaInicio = escapeHtml(evento.Fecha_Inicio || '')
    const fechaFinal = escapeHtml(evento.Fecha_Final || '')
    const activo = esEventoActivo(evento)
    const statusTag = activo
      ? '<span class="tag is-success is-light">Activo</span>'
      : '<span class="tag is-danger is-light">Inactivo</span>'

    const cardHTML = `
      <div class="column is-4">
        <div class="card event-card">
          <div class="card-content">
            <p class="title is-5 mb-2">${nombreEvento}</p>
            <p class="subtitle is-7 is-uppercase has-text-grey-light mb-4">Evento Maree</p>

            <div class="has-text-right">
              <p class="is-size-7 has-text-grey is-uppercase mb-1">Estado</p>
              ${statusTag}
            </div>

            <div class="content is-size-6 has-text-grey">
              ${descripcion}
            </div>

            <hr class="my-4" style="background-color: #f5f5f5; height: 1px;">

            <div class="is-flex is-justify-content-space-between is-align-items-center">
              <div>
                <p class="is-size-7 has-text-grey-lighter is-uppercase">Vigencia</p>
                <span class="event-date-tag">${fechaInicio} - ${fechaFinal}</span>
              </div>
            </div>
          </div>
          <footer class="card-footer" style="border-top: none; background-color: #fafafa;">
            <a
              href="#"
              class="card-footer-item has-text-link"
              data-event-action="modificar"
              data-event-id="${idEvento}">
              Modificar
            </a>
            <a
              href="#"
              class="card-footer-item has-text-danger"
              data-event-action="estado"
              data-event-id="${idEvento}"
              data-event-name="${nombreEvento}"
              data-event-active="${activo}">
              Estado / Eliminar
            </a>
          </footer>
        </div>
      </div>`

    contenedor.insertAdjacentHTML('beforeend', cardHTML)
  })

  contenedor.querySelectorAll('[data-event-action="modificar"]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault()
      prepararModificacion(button.dataset.eventId)
    })
  })

  contenedor.querySelectorAll('[data-event-action="estado"]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault()
      abrirModalAccionEvento(
        button.dataset.eventId,
        button.dataset.eventName,
        button.dataset.eventActive === 'true'
      )
    })
  })
}

function abrirModalAccionEvento (idEvento, nombreEvento, activoEvento) {
  estadoEventos.idEventoEditando = idEvento
  estadoEventos.nombreEvento = nombreEvento
  estadoEventos.activoEvento = activoEvento
  estadoEventos.accionCU24 = ''
  estadoEventos.siguienteEstado = null

  document.getElementById('nombre-evento-accion').textContent = nombreEvento

  const tagEstado = document.getElementById('tag-estado-evento')
  tagEstado.textContent = activoEvento ? 'Activo' : 'Inactivo'
  tagEstado.className = activoEvento ? 'tag is-success is-light' : 'tag is-danger is-light'

  const btnEstado = document.getElementById('btn-opcion-estado-evento')
  btnEstado.textContent = activoEvento ? 'Desactivar' : 'Activar'
  btnEstado.className = activoEvento ? 'button is-warning' : 'button is-success'

  abrirModal('modal-accion-evento')
}

function cerrarModalAccionEvento () {
  cerrarModal('modal-accion-evento')
  resetearEstadoAccion()
}

function prepararCambioEstado () {
  estadoEventos.accionCU24 = 'estado'
  estadoEventos.siguienteEstado = !estadoEventos.activoEvento

  const activar = estadoEventos.siguienteEstado
  const botonConfirmar = document.getElementById('btn-confirmar-accion-evento')

  document.getElementById('titulo-confirmacion-evento').textContent = activar
    ? 'Confirmar activacion'
    : 'Confirmar desactivacion'
  document.getElementById('texto-confirmacion-evento').textContent = activar
    ? `Vas a activar el evento "${estadoEventos.nombreEvento}".`
    : `Vas a desactivar el evento "${estadoEventos.nombreEvento}".`

  botonConfirmar.textContent = activar ? 'Activar' : 'Desactivar'
  botonConfirmar.className = activar ? 'button is-success' : 'button is-warning'

  cerrarModal('modal-accion-evento')
  abrirModal('modal-confirmacion-evento')
}

function prepararEliminacionEvento () {
  estadoEventos.accionCU24 = 'eliminar'
  estadoEventos.siguienteEstado = null

  const botonConfirmar = document.getElementById('btn-confirmar-accion-evento')

  document.getElementById('titulo-confirmacion-evento').textContent = 'Confirmar eliminacion'
  document.getElementById('texto-confirmacion-evento').textContent =
    `Vas a eliminar el evento "${estadoEventos.nombreEvento}". Esta accion no se puede deshacer.`

  botonConfirmar.textContent = 'Eliminar'
  botonConfirmar.className = 'button is-danger'

  cerrarModal('modal-accion-evento')
  abrirModal('modal-confirmacion-evento')
}

function volverAOpcionesEvento () {
  cerrarModal('modal-confirmacion-evento')

  if (estadoEventos.idEventoEditando) {
    abrirModal('modal-accion-evento')
  }
}

async function confirmarAccionEvento () {
  if (!estadoEventos.idEventoEditando || !estadoEventos.accionCU24) {
    mostrarFeedback('danger', 'No hay una accion seleccionada para el evento.')
    cerrarModal('modal-confirmacion-evento')
    return
  }

  const botonConfirmar = document.getElementById('btn-confirmar-accion-evento')
  botonConfirmar.classList.add('is-loading')
  mostrarSpinner(true)
  limpiarFeedback()

  try {
    const response = await ejecutarAccionCU24()
    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo completar la accion sobre el evento.')
    }

    cerrarModal('modal-confirmacion-evento')
    resetearEstadoAccion()
    mostrarFeedback('success', result.message)
    await cargarEventos()
  } catch (error) {
    mostrarFeedback('danger', error.message || 'No se pudo completar la accion sobre el evento.')
    cerrarModal('modal-confirmacion-evento')
    abrirModal('modal-accion-evento')
  } finally {
    botonConfirmar.classList.remove('is-loading')
    mostrarSpinner(false)
  }
}

function ejecutarAccionCU24 () {
  const endpoint = `/promos/eventos/${encodeURIComponent(estadoEventos.idEventoEditando)}`

  if (estadoEventos.accionCU24 === 'estado') {
    return fetch(`${endpoint}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: estadoEventos.siguienteEstado })
    })
  }

  return fetch(endpoint, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
}

function resetearEstadoAccion () {
  estadoEventos.idEventoEditando = ''
  estadoEventos.nombreEvento = ''
  estadoEventos.activoEvento = false
  estadoEventos.accionCU24 = ''
  estadoEventos.siguienteEstado = null
}

function normalizarFechaInput (value) {
  return value ? String(value).slice(0, 10) : ''
}

function esEventoActivo (evento) {
  return Number(evento.Activo) === 1 || evento.Activo === true || evento.Activo === '1'
}

function mostrarSpinner (mostrar) {
  const spinner = document.getElementById('loading-spinner')

  if (!spinner) {
    return
  }

  spinner.classList.toggle('is-hidden', !mostrar)
}

function mostrarFeedback (tipo, mensaje) {
  const feedback = document.getElementById('feedback-eventos')
  feedback.className = `notification is-${tipo}`
  feedback.textContent = mensaje
}

function limpiarFeedback () {
  const feedback = document.getElementById('feedback-eventos')
  feedback.className = 'notification is-hidden'
  feedback.textContent = ''
}

function abrirModal (idModal) {
  document.getElementById(idModal).classList.add('is-active')
}

function cerrarModal (idModal) {
  document.getElementById(idModal).classList.remove('is-active')
}

function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
