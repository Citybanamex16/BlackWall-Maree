/* eslint-env browser */

const estadoEventos = {
  modo: 'crear',
  eventoId: null,
  eventos: [],
  catalogosCargados: false,
  promocionesCatalogo: [],
  productosCatalogo: [],
  promocionesSeleccionadas: new Map(),
  productosSeleccionados: new Map(),
  eventoPendienteEliminar: null,
  eventoPendienteCambioEstado: null
}

document.addEventListener('DOMContentLoaded', () => {
  configurarEventosBase()
  renderizarResumen('resumen-promociones', estadoEventos.promocionesSeleccionadas, 'Sin promociones seleccionadas', false)
  renderizarResumen('resumen-productos', estadoEventos.productosSeleccionados, 'Sin productos seleccionados', true)
  cargarEventos()
})

function configurarEventosBase () {
  const contenedor = document.getElementById('contenedor-eventos')
  const formulario = document.getElementById('form-evento')
  const botonNuevoEvento = document.getElementById('btn-nuevo-evento')
  const botonResultado = document.getElementById('boton-modal-resultado')
  const botonConfirmarEliminar = document.getElementById('boton-confirmar-eliminar')
  const botonConfirmarDesactivar = document.getElementById('boton-confirmar-desactivar')
  const listaPromociones = document.getElementById('lista-promociones')
  const listaProductos = document.getElementById('lista-productos')

  if (contenedor) {
    contenedor.addEventListener('click', manejarAccionesEvento)
  }

  if (formulario) {
    formulario.addEventListener('submit', guardarEvento)
  }

  if (botonNuevoEvento) {
    botonNuevoEvento.addEventListener('click', abrirModalNuevoEvento)
  }

  if (botonResultado) {
    botonResultado.addEventListener('click', () => cerrarModal('modal-resultado'))
  }

  if (botonConfirmarEliminar) {
    botonConfirmarEliminar.addEventListener('click', confirmarEliminacion)
  }

  if (botonConfirmarDesactivar) {
    botonConfirmarDesactivar.addEventListener('click', confirmarCambioEstado)
  }

  if (listaPromociones) {
    listaPromociones.addEventListener('change', manejarCambioCatalogo)
  }

  if (listaProductos) {
    listaProductos.addEventListener('change', manejarCambioCatalogo)
  }

  document.querySelectorAll('[data-close-modal]').forEach(elemento => {
    elemento.addEventListener('click', () => cerrarModal(elemento.dataset.closeModal))
  })
}

async function cargarEventos () {
  const spinner = document.getElementById('loading-spinner')
  const contenedor = document.getElementById('contenedor-eventos')

  if (spinner) {
    spinner.classList.remove('is-hidden')
  }

  try {
    const response = await fetch('/promos/eventos/api/all')
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudieron cargar los eventos.')
    }

    estadoEventos.eventos = Array.isArray(result.data) ? result.data : []
    renderizarEventos(estadoEventos.eventos)
  } catch (error) {
    console.error('Error al cargar eventos:', error)

    if (contenedor) {
      contenedor.innerHTML = `
        <div class="column is-full">
          <div class="box has-text-centered">
            <p>No se pudieron cargar los eventos.</p>
          </div>
        </div>
      `
    }
  } finally {
    if (spinner) {
      spinner.classList.add('is-hidden')
    }
  }
}

function renderizarEventos (lista) {
  const contenedor = document.getElementById('contenedor-eventos')

  if (!contenedor) {
    return
  }

  contenedor.innerHTML = ''

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div class="column is-full">
        <div class="box has-text-centered">
          <p>No hay eventos registrados.</p>
        </div>
      </div>
    `
    return
  }

  lista.forEach(evento => {
    const activo = estaActivo(evento.Activo)
    const totalPromociones = Number(evento.TotalPromociones || 0)
    const totalProductos = Number(evento.TotalProductos || 0)

    const cardHTML = `
      <div class="column is-4-desktop is-6-tablet">
        <article class="card event-card ${activo ? '' : 'is-inactive'}">
          <div class="card-content">
            <div class="event-card-head">
              <div>
                <p class="event-card-label">${escaparHtml(evento.ID_Evento)}</p>
                <p class="title is-4">${escaparHtml(evento.Nombre)}</p>
              </div>
              <div class="has-text-right">
                <p class="event-card-label">Estado</p>
                <span class="event-status-pill ${activo ? 'is-active' : 'is-inactive'}">
                  ${activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div class="content event-description">
              ${escaparHtml(evento.Descripcion || 'Sin descripcion disponible.')}
            </div>

            <div class="event-badges">
              <span class="event-chip">${totalPromociones} ${totalPromociones === 1 ? 'promocion' : 'promociones'}</span>
              <span class="event-chip secondary">${totalProductos} ${totalProductos === 1 ? 'producto' : 'productos'}</span>
            </div>

            <hr class="my-4 event-card-divider">

            <div>
              <p class="event-card-label mb-2">Vigencia</p>
              <span class="event-date-tag">
                ${escaparHtml(formatearRangoFechas(evento.Fecha_Inicio, evento.Fecha_Final))}
              </span>
            </div>
          </div>

          <footer class="card-footer event-card-footer">
            <button type="button" class="card-footer-item event-footer-button" data-action="editar" data-id="${evento.ID_Evento}">
              Modificar
            </button>
            <button
              type="button"
              class="card-footer-item event-footer-button"
              data-action="cambiar-estado"
              data-id="${evento.ID_Evento}"
            >
              ${activo ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" class="card-footer-item event-footer-button is-danger-text" data-action="eliminar" data-id="${evento.ID_Evento}">
              Eliminar
            </button>
          </footer>
        </article>
      </div>
    `

    contenedor.insertAdjacentHTML('beforeend', cardHTML)
  })
}

function manejarAccionesEvento (event) {
  const botonAccion = event.target.closest('button[data-action]')

  if (!botonAccion) {
    return
  }

  const { action, id } = botonAccion.dataset

  if (action === 'editar') {
    prepararModificacion(id)
  }

  if (action === 'cambiar-estado') {
    solicitarCambioEstado(id)
  }

  if (action === 'eliminar') {
    solicitarEliminacion(id)
  }
}

async function cargarCatalogos () {
  if (estadoEventos.catalogosCargados) {
    return
  }

  const response = await fetch('/promos/eventos/api/catalogos')
  const result = await leerRespuestaJson(response)

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'No se pudieron cargar los catalogos del evento.')
  }

  estadoEventos.promocionesCatalogo = Array.isArray(result.data?.promociones) ? result.data.promociones : []
  estadoEventos.productosCatalogo = Array.isArray(result.data?.productos) ? result.data.productos : []
  estadoEventos.catalogosCargados = true
}

function renderizarCatalogo (idContenedor, items, seleccionados, tipo) {
  const contenedor = document.getElementById(idContenedor)

  if (!contenedor) {
    return
  }

  contenedor.innerHTML = ''
  contenedor.classList.remove('event-box-error')

  if (items.length === 0) {
    contenedor.innerHTML = '<p class="has-text-grey">No hay elementos disponibles en este catalogo.</p>'
    return
  }

  items.forEach(item => {
    const label = document.createElement('label')
    label.className = 'checkbox event-option'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.className = 'mr-2'
    checkbox.dataset.catalogo = tipo
    checkbox.value = item.id
    checkbox.dataset.nombre = item.nombre
    checkbox.checked = seleccionados.has(String(item.id))

    label.appendChild(checkbox)
    label.append(document.createTextNode(item.nombre))
    contenedor.appendChild(label)
  })
}

function manejarCambioCatalogo (event) {
  const checkbox = event.target.closest('input[type="checkbox"][data-catalogo]')

  if (!checkbox) {
    return
  }

  const tipo = checkbox.dataset.catalogo
  const id = String(checkbox.value)
  const nombre = checkbox.dataset.nombre || ''
  const mapa = tipo === 'promocion'
    ? estadoEventos.promocionesSeleccionadas
    : estadoEventos.productosSeleccionados

  if (checkbox.checked) {
    mapa.set(id, nombre)
  } else {
    mapa.delete(id)
  }

  limpiarErrorContenedor(tipo === 'promocion' ? 'lista-promociones' : 'lista-productos')
  limpiarErrorContenedor('lista-promociones')
  limpiarErrorContenedor('lista-productos')
  renderizarResumen('resumen-promociones', estadoEventos.promocionesSeleccionadas, 'Sin promociones seleccionadas', false)
  renderizarResumen('resumen-productos', estadoEventos.productosSeleccionados, 'Sin productos seleccionados', true)
}

function renderizarResumen (idContenedor, seleccionados, mensajeVacio, secundario) {
  const contenedor = document.getElementById(idContenedor)

  if (!contenedor) {
    return
  }

  if (seleccionados.size === 0) {
    contenedor.innerHTML = `<span class="event-chip ${secundario ? 'secondary' : ''}">${escaparHtml(mensajeVacio)}</span>`
    return
  }

  const chips = Array.from(seleccionados.entries())
    .sort((a, b) => a[1].localeCompare(b[1], 'es'))
    .map(([id, nombre]) => `
      <span class="event-chip ${secundario ? 'secondary' : ''}" data-relacion-id="${id}">
        ${escaparHtml(nombre)}
      </span>
    `)
    .join('')

  contenedor.innerHTML = chips
}

function abrirModal (idModal) {
  const modal = document.getElementById(idModal)

  if (modal) {
    modal.classList.add('is-active')
  }
}

function cerrarModal (idModal) {
  const modal = document.getElementById(idModal)

  if (modal) {
    modal.classList.remove('is-active')
  }

  if (idModal === 'modal-confirmar-eliminacion') {
    estadoEventos.eventoPendienteEliminar = null
  }

  if (idModal === 'modal-confirmar-desactivacion') {
    estadoEventos.eventoPendienteCambioEstado = null
  }
}

function mostrarModalResultado (titulo, mensaje, kicker = 'Actualizacion de eventos') {
  const tituloModal = document.getElementById('titulo-modal-resultado')
  const mensajeModal = document.getElementById('mensaje-modal-resultado')
  const kickerModal = document.getElementById('kicker-modal-resultado')

  if (tituloModal) {
    tituloModal.textContent = titulo
  }

  if (mensajeModal) {
    mensajeModal.textContent = mensaje
  }

  if (kickerModal) {
    kickerModal.textContent = kicker
  }

  abrirModal('modal-resultado')
}

async function abrirModalNuevoEvento () {
  try {
    await cargarCatalogos()
    limpiarFormulario()
    establecerModoFormulario('crear')
    renderizarCatalogo('lista-promociones', estadoEventos.promocionesCatalogo, estadoEventos.promocionesSeleccionadas, 'promocion')
    renderizarCatalogo('lista-productos', estadoEventos.productosCatalogo, estadoEventos.productosSeleccionados, 'producto')
    abrirModal('modal-evento')
  } catch (error) {
    console.error('Error al abrir el modal de evento:', error)
    mostrarModalResultado('No se pudo abrir el formulario', error.message)
  }
}

function establecerModoFormulario (modo) {
  estadoEventos.modo = modo

  const titulo = document.getElementById('titulo-modal-evento')
  const descripcion = document.getElementById('descripcion-modal-evento')
  const kicker = document.getElementById('kicker-modal-evento')
  const botonGuardar = document.getElementById('boton-guardar-evento')

  if (modo === 'editar') {
    if (titulo) titulo.textContent = 'Modificar Evento'
    if (descripcion) descripcion.textContent = 'Actualiza nombre, vigencia, estado y relaciones del evento.'
    if (kicker) kicker.textContent = 'Edicion administrativa'
    if (botonGuardar) botonGuardar.textContent = 'Guardar cambios'
    return
  }

  if (titulo) titulo.textContent = 'Registrar Nuevo Evento'
  if (descripcion) descripcion.textContent = 'Captura el evento, define su vigencia y selecciona las promociones o productos vinculados.'
  if (kicker) kicker.textContent = 'Registro administrativo'
  if (botonGuardar) botonGuardar.textContent = 'Guardar evento'
}

async function prepararModificacion (idEvento) {
  try {
    await cargarCatalogos()

    const response = await fetch(`/promos/eventos/${encodeURIComponent(idEvento)}`)
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo cargar el detalle del evento.')
    }

    const evento = result.data

    limpiarFormulario()
    establecerModoFormulario('editar')

    estadoEventos.eventoId = idEvento
    document.getElementById('id_evento').value = idEvento
    document.getElementById('nombre').value = evento.Nombre || ''
    document.getElementById('descripcion').value = evento.Descripcion || ''
    document.getElementById('fechaInicio').value = normalizarFechaInput(evento.Fecha_Inicio)
    document.getElementById('fechaFin').value = normalizarFechaInput(evento.Fecha_Final)
    document.getElementById('activo').checked = estaActivo(evento.Activo)

    const idsPromocionesActivas = new Set(estadoEventos.promocionesCatalogo.map(promocion => String(promocion.id)))
    estadoEventos.promocionesSeleccionadas = new Map(
      (Array.isArray(evento.promociones) ? evento.promociones : [])
        .filter(promocion => idsPromocionesActivas.has(String(promocion.id)))
        .map(promocion => [String(promocion.id), promocion.nombre])
    )
    estadoEventos.productosSeleccionados = new Map(
      (Array.isArray(evento.productos) ? evento.productos : []).map(producto => [String(producto.id), producto.nombre])
    )

    renderizarCatalogo('lista-promociones', estadoEventos.promocionesCatalogo, estadoEventos.promocionesSeleccionadas, 'promocion')
    renderizarCatalogo('lista-productos', estadoEventos.productosCatalogo, estadoEventos.productosSeleccionados, 'producto')
    renderizarResumen('resumen-promociones', estadoEventos.promocionesSeleccionadas, 'Sin promociones seleccionadas', false)
    renderizarResumen('resumen-productos', estadoEventos.productosSeleccionados, 'Sin productos seleccionados', true)

    abrirModal('modal-evento')
  } catch (error) {
    console.error('Error al preparar la modificacion:', error)
    mostrarModalResultado('No se pudo cargar el evento', error.message)
  }
}

function obtenerDatosFormulario () {
  return {
    nombre: document.getElementById('nombre').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    fechaInicio: document.getElementById('fechaInicio').value,
    fechaFin: document.getElementById('fechaFin').value,
    activo: document.getElementById('activo').checked,
    promociones: Array.from(estadoEventos.promocionesSeleccionadas.keys()),
    productos: Array.from(estadoEventos.productosSeleccionados.keys())
  }
}

function validarFormulario (datos) {
  let esValido = true

  if (!datos.nombre) {
    marcarError('nombre', 'El nombre es obligatorio.')
    esValido = false
  }

  if (!datos.descripcion) {
    marcarError('descripcion', 'La descripcion es obligatoria.')
    esValido = false
  }

  if (!datos.fechaInicio) {
    marcarError('fechaInicio', 'La fecha de inicio es obligatoria.')
    esValido = false
  }

  if (!datos.fechaFin) {
    marcarError('fechaFin', 'La fecha final es obligatoria.')
    esValido = false
  }

  if (datos.fechaInicio && datos.fechaFin && datos.fechaInicio > datos.fechaFin) {
    marcarError('fechaInicio', 'La fecha inicial debe ser anterior o igual a la final.')
    marcarError('fechaFin', 'La fecha final debe ser posterior o igual a la inicial.')
    esValido = false
  }

  if (datos.promociones.length === 0 && datos.productos.length === 0) {
    marcarErrorContenedor('lista-promociones', 'Selecciona al menos una promocion o un producto.')
    marcarErrorContenedor('lista-productos', 'Selecciona al menos una promocion o un producto.')
    esValido = false
  }

  return esValido
}

async function guardarEvento (event) {
  event.preventDefault()
  limpiarErroresFormulario()

  const datos = obtenerDatosFormulario()

  if (!validarFormulario(datos)) {
    return
  }

  const esEdicion = estadoEventos.modo === 'editar'
  const botonGuardar = document.getElementById('boton-guardar-evento')
  const url = esEdicion
    ? `/promos/eventos/${encodeURIComponent(estadoEventos.eventoId)}`
    : '/promos/eventos/registrar'
  const method = esEdicion ? 'PUT' : 'POST'

  if (botonGuardar) {
    botonGuardar.classList.add('is-loading')
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
    })
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo guardar el evento.')
    }

    cerrarModal('modal-evento')
    limpiarFormulario()
    establecerModoFormulario('crear')
    await cargarEventos()

    mostrarModalResultado(
      esEdicion ? 'Evento actualizado' : 'Evento registrado',
      result.message || (esEdicion ? 'El evento se actualizo correctamente.' : 'El evento se registro correctamente.')
    )
  } catch (error) {
    console.error('Error al guardar evento:', error)
    mostrarModalResultado('No se pudieron guardar los cambios', error.message)
  } finally {
    if (botonGuardar) {
      botonGuardar.classList.remove('is-loading')
    }
  }
}

function solicitarCambioEstado (idEvento) {
  const evento = estadoEventos.eventos.find(item => item.ID_Evento === idEvento)
  const mensaje = document.getElementById('mensaje-confirmar-desactivar')
  const titulo = document.getElementById('titulo-confirmar-estado-evento')
  const boton = document.getElementById('boton-confirmar-desactivar')
  const activar = evento ? !estaActivo(evento.Activo) : false

  estadoEventos.eventoPendienteCambioEstado = {
    idEvento,
    activar
  }

  if (mensaje) {
    mensaje.textContent = evento
      ? (activar
          ? `Deseas activar el evento "${evento.Nombre}"? Volvera a mostrarse como activo en el catalogo.`
          : `Deseas desactivar el evento "${evento.Nombre}"? Permanecera registrado, pero dejara de mostrarse como activo.`)
      : (activar
          ? 'Deseas activar este evento? Volvera a mostrarse como activo en el catalogo.'
          : 'Deseas desactivar este evento? Permanecera registrado, pero dejara de mostrarse como activo.')
  }

  if (titulo) {
    titulo.textContent = activar ? 'Activar evento' : 'Desactivar evento'
  }

  if (boton) {
    boton.textContent = activar ? 'Activar evento' : 'Desactivar evento'
  }

  abrirModal('modal-confirmar-desactivacion')
}

function solicitarEliminacion (idEvento) {
  const evento = estadoEventos.eventos.find(item => item.ID_Evento === idEvento)
  const mensaje = document.getElementById('mensaje-confirmar-eliminar')

  estadoEventos.eventoPendienteEliminar = idEvento

  if (mensaje) {
    mensaje.textContent = evento
      ? `Deseas eliminar el evento "${evento.Nombre}"? Esta accion no se puede deshacer.`
      : 'Deseas eliminar este evento? Esta accion no se puede deshacer.'
  }

  abrirModal('modal-confirmar-eliminacion')
}

async function confirmarCambioEstado () {
  const cambioEstado = estadoEventos.eventoPendienteCambioEstado
  const botonDesactivar = document.getElementById('boton-confirmar-desactivar')

  if (!cambioEstado || !botonDesactivar) {
    return
  }

  botonDesactivar.classList.add('is-loading')

  try {
    const endpoint = cambioEstado.activar ? 'activar' : 'desactivar'
    const response = await fetch(`/promos/eventos/${encodeURIComponent(cambioEstado.idEvento)}/${endpoint}`, {
      method: 'PATCH'
    })
    const result = await leerRespuestaJson(response)

    cerrarModal('modal-confirmar-desactivacion')

    if (!response.ok || !result.success) {
      throw new Error(result.message || `No se pudo ${cambioEstado.activar ? 'activar' : 'desactivar'} el evento.`)
    }

    await cargarEventos()
    mostrarModalResultado(
      cambioEstado.activar ? 'Evento activado' : 'Evento desactivado',
      result.message || `El evento fue ${cambioEstado.activar ? 'activado' : 'desactivado'} correctamente.`,
      'Estado de eventos'
    )
  } catch (error) {
    console.error('Error al cambiar estado de evento:', error)
    mostrarModalResultado(
      `No se pudo ${cambioEstado.activar ? 'activar' : 'desactivar'} el evento`,
      error.message,
      'Estado de eventos'
    )
  } finally {
    botonDesactivar.classList.remove('is-loading')
  }
}

async function confirmarEliminacion () {
  const idEvento = estadoEventos.eventoPendienteEliminar
  const botonEliminar = document.getElementById('boton-confirmar-eliminar')

  if (!idEvento || !botonEliminar) {
    return
  }

  botonEliminar.classList.add('is-loading')

  try {
    const response = await fetch(`/promos/eventos/${encodeURIComponent(idEvento)}`, {
      method: 'DELETE'
    })
    const result = await leerRespuestaJson(response)

    cerrarModal('modal-confirmar-eliminacion')

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo eliminar el evento.')
    }

    await cargarEventos()
    mostrarModalResultado(
      'Evento eliminado',
      result.message || 'El evento fue eliminado correctamente.',
      'Eliminacion de eventos'
    )
  } catch (error) {
    console.error('Error al eliminar evento:', error)
    mostrarModalResultado('No se pudo eliminar el evento', error.message, 'Eliminacion de eventos')
  } finally {
    botonEliminar.classList.remove('is-loading')
  }
}

function marcarError (id, mensaje) {
  const elemento = document.getElementById(id)

  if (!elemento) {
    return
  }

  elemento.classList.add('is-danger')

  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje

  const destino = elemento.closest('.control') || elemento.parentElement
  destino.appendChild(help)
}

function marcarErrorContenedor (id, mensaje) {
  const contenedor = document.getElementById(id)

  if (!contenedor) {
    return
  }

  contenedor.classList.add('event-box-error')

  if (contenedor.nextElementSibling && contenedor.nextElementSibling.classList.contains('help') && contenedor.nextElementSibling.classList.contains('is-danger')) {
    return
  }

  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje

  contenedor.insertAdjacentElement('afterend', help)
}

function limpiarErrorContenedor (id) {
  const contenedor = document.getElementById(id)

  if (!contenedor) {
    return
  }

  contenedor.classList.remove('event-box-error')

  const siguiente = contenedor.nextElementSibling
  if (siguiente && siguiente.classList.contains('help') && siguiente.classList.contains('is-danger')) {
    siguiente.remove()
  }
}

function limpiarErroresFormulario () {
  document.querySelectorAll('#form-evento .input, #form-evento .textarea').forEach(elemento => {
    elemento.classList.remove('is-danger')
  })

  document.querySelectorAll('#form-evento .help.is-danger').forEach(error => {
    error.remove()
  })

  limpiarErrorContenedor('lista-promociones')
  limpiarErrorContenedor('lista-productos')
}

function limpiarFormulario () {
  const formulario = document.getElementById('form-evento')

  if (formulario) {
    formulario.reset()
  }

  estadoEventos.eventoId = null
  estadoEventos.promocionesSeleccionadas = new Map()
  estadoEventos.productosSeleccionados = new Map()

  document.getElementById('id_evento').value = ''
  document.getElementById('activo').checked = true

  renderizarCatalogo('lista-promociones', estadoEventos.promocionesCatalogo, estadoEventos.promocionesSeleccionadas, 'promocion')
  renderizarCatalogo('lista-productos', estadoEventos.productosCatalogo, estadoEventos.productosSeleccionados, 'producto')
  renderizarResumen('resumen-promociones', estadoEventos.promocionesSeleccionadas, 'Sin promociones seleccionadas', false)
  renderizarResumen('resumen-productos', estadoEventos.productosSeleccionados, 'Sin productos seleccionados', true)
  limpiarErroresFormulario()
}

function normalizarFechaInput (fecha) {
  if (!fecha) {
    return ''
  }

  const texto = String(fecha)
  const coincidencia = texto.match(/^(\d{4}-\d{2}-\d{2})/)

  if (coincidencia) {
    return coincidencia[1]
  }

  const fechaObjeto = new Date(fecha)

  if (Number.isNaN(fechaObjeto.getTime())) {
    return ''
  }

  return fechaObjeto.toISOString().slice(0, 10)
}

function formatearRangoFechas (fechaInicio, fechaFinal) {
  const fechaInicioNormalizada = normalizarFechaInput(fechaInicio)
  const fechaFinalNormalizada = normalizarFechaInput(fechaFinal)

  return `${formatearFecha(fechaInicioNormalizada)} - ${formatearFecha(fechaFinalNormalizada)}`
}

function formatearFecha (fecha) {
  if (!fecha) {
    return 'Sin fecha'
  }

  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function estaActivo (activo) {
  return activo === true || activo === 1 || activo === '1'
}

function escaparHtml (valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function leerRespuestaJson (response) {
  try {
    return await response.json()
  } catch (error) {
    return {}
  }
}
