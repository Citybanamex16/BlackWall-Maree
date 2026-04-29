/* eslint-env browser */

const estadoPromociones = {
  modo: 'crear',
  promocionId: null,
  promociones: [],
  productosSeleccionados: new Map(),
  promocionPendienteEliminar: null,
  promocionPendienteCambioEstado: null
}

document.addEventListener('DOMContentLoaded', () => {
  configurarEventosBase()
  configurarCheckboxDescuento()
  renderizarResumenProductos()
  cargarPromociones()
})

function configurarEventosBase () {
  const contenedor = document.getElementById('contenedor-promociones')
  const formulario = document.getElementById('form-promocion')
  const nuevaPromocionBtn = document.getElementById('btn-nueva-promocion')
  const filtroCategoria = document.getElementById('filtro-categoria')
  const filtroTipo = document.getElementById('filtro-tipo')
  const botonResultado = document.getElementById('boton-modal-resultado')
  const botonConfirmarEliminar = document.getElementById('boton-confirmar-eliminar')
  const botonConfirmarDesactivar = document.getElementById('boton-confirmar-desactivar')

  if (contenedor) {
    contenedor.addEventListener('click', manejarAccionesPromocion)
  }

  if (formulario) {
    formulario.addEventListener('submit', guardarPromocion)
  }

  if (nuevaPromocionBtn) {
    nuevaPromocionBtn.addEventListener('click', abrirModalNuevaPromocion)
  }

  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', actualizarProductos)
  }

  if (filtroTipo) {
    filtroTipo.addEventListener('change', actualizarProductos)
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

  document.querySelectorAll('[data-close-modal]').forEach(elemento => {
    elemento.addEventListener('click', () => cerrarModal(elemento.dataset.closeModal))
  })
}

async function cargarPromociones () {
  const spinner = document.getElementById('loading-spinner')
  const contenedor = document.getElementById('contenedor-promociones')

  if (spinner) {
    spinner.classList.remove('is-hidden')
  }

  try {
    const response = await fetch('/promos/promociones/api/all')
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudieron cargar las promociones.')
    }

    estadoPromociones.promociones = Array.isArray(result.data) ? result.data : []
    renderizarPromociones(estadoPromociones.promociones)
  } catch (error) {
    console.error('Error al cargar promociones:', error)

    if (contenedor) {
      contenedor.innerHTML = `
        <div class="column is-full">
          <div class="box has-text-centered">
            <p>No se pudieron cargar las promociones.</p>
          </div>
        </div>
      `
    }
  } finally {
    await cargarMetricasPromociones()

    if (spinner) {
      spinner.classList.add('is-hidden')
    }
  }
}

async function cargarMetricasPromociones () {
  const cuerpoTabla = document.getElementById('promociones-populares-body')

  if (!cuerpoTabla) {
    return
  }

  cuerpoTabla.innerHTML = '<tr><td colspan="5">Cargando métricas...</td></tr>'

  try {
    const response = await fetch('/promos/promociones/api/metricas?limit=5')
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudieron cargar las métricas de promociones.')
    }

    renderizarMetricasPromociones(Array.isArray(result.data) ? result.data : [])
  } catch (error) {
    console.error('Error al cargar métricas de promociones:', error)
    renderizarMetricasPromociones([], 'No se pudieron cargar las métricas de promociones.')
  }
}

function renderizarMetricasPromociones (metricas, mensajeVacio = 'Aún no hay promociones registradas con uso.') {
  const cuerpoTabla = document.getElementById('promociones-populares-body')

  if (!cuerpoTabla) {
    return
  }

  if (metricas.length === 0) {
    cuerpoTabla.innerHTML = `<tr><td colspan="5">${escaparHtml(mensajeVacio)}</td></tr>`
    return
  }

  cuerpoTabla.innerHTML = metricas.map((promocion, indice) => `
    <tr>
      <td><strong>#${indice + 1}</strong></td>
      <td>${escaparHtml(promocion.Nombre)}</td>
      <td>${escaparHtml(String(promocion.usos || 0))}</td>
      <td>${escaparHtml(String(promocion.clientes_distintos || 0))}</td>
      <td>${escaparHtml(String(promocion.promociones_canjeadas || 0))}</td>
    </tr>
  `).join('')
}

function renderizarPromociones (lista) {
  const contenedor = document.getElementById('contenedor-promociones')

  if (!contenedor) {
    return
  }

  contenedor.innerHTML = ''

  if (lista.length === 0) {
    contenedor.innerHTML = `
      <div class="column is-full">
        <div class="box has-text-centered">
          <p>No hay promociones registradas.</p>
        </div>
      </div>
    `
    return
  }

  lista.forEach(promo => {
    const activa = estaActiva(promo.Activo)
    const vigencia = obtenerEstadoVigencia(promo.Fecha_inicio, promo.Fecha_final)
    const descuentoPorcentaje = Number(promo.DescuentoPorcentaje || 0)
    const beneficio = descuentoPorcentaje > 0
      ? `<span class="promo-benefit">${formatearDescuento(descuentoPorcentaje)}</span>`
      : '<span class="promo-benefit is-neutral">Promoción por condiciones</span>'

    const cardHTML = `
      <div class="column is-4-desktop is-6-tablet">
        <article class="card promo-card ${activa ? '' : 'is-inactive'}">
          <div class="card-content">
            <div class="promo-card-meta">
              <div>
                <p class="promo-card-id">${escaparHtml(promo.ID_Promocion)}</p>
                <p class="title is-4">${escaparHtml(promo.Nombre)}</p>
              </div>
              <div class="has-text-right promo-status-stack">
                <p class="promo-card-label">Estado</p>
                <span class="status-pill ${activa ? 'is-active' : 'is-inactive'}">
                  ${activa ? 'Activa' : 'Inactiva'}
                </span>
                <p class="promo-card-label">Vigencia actual</p>
                <span class="promo-validity-pill ${vigencia.clase}">
                  ${vigencia.texto}
                </span>
              </div>
            </div>

            ${beneficio}

            <div class="content promo-conditions">
              ${escaparHtml(promo.Condiciones || 'Sin condición disponible.')}
            </div>

            <hr class="my-4 promo-card-divider">

            <div>
              <p class="promo-card-label mb-2">Vigencia</p>
              <span class="promo-date-tag">
                ${escaparHtml(formatearRangoFechas(promo.Fecha_inicio, promo.Fecha_final))}
              </span>
            </div>
          </div>

          <footer class="card-footer promo-card-footer">
            <button type="button" class="card-footer-item promo-footer-button" data-action="editar" data-id="${promo.ID_Promocion}">
              Modificar
            </button>
            <button
              type="button"
              class="card-footer-item promo-footer-button"
              data-action="cambiar-estado"
              data-id="${promo.ID_Promocion}"
            >
              ${activa ? 'Desactivar' : 'Activar'}
            </button>
            <button type="button" class="card-footer-item promo-footer-button is-danger-text" data-action="eliminar" data-id="${promo.ID_Promocion}">
              Eliminar
            </button>
          </footer>
        </article>
      </div>
    `

    contenedor.insertAdjacentHTML('beforeend', cardHTML)
  })
}

function manejarAccionesPromocion (event) {
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
    estadoPromociones.promocionPendienteEliminar = null
  }

  if (idModal === 'modal-confirmar-desactivacion') {
    estadoPromociones.promocionPendienteCambioEstado = null
  }
}

function mostrarModalResultado (titulo, mensaje, kicker = 'Actualización de promociones') {
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

function abrirModalNuevaPromocion () {
  limpiarFormulario()
  establecerModoFormulario('crear')
  abrirModal('modal-promocion')
}

function establecerModoFormulario (modo) {
  estadoPromociones.modo = modo

  const titulo = document.getElementById('titulo-modal-promocion')
  const descripcion = document.getElementById('descripcion-modal-promocion')
  const kicker = document.getElementById('kicker-modal-promocion')
  const botonGuardar = document.getElementById('boton-guardar-promocion')

  if (modo === 'editar') {
    if (titulo) titulo.textContent = 'Modificar Promoción'
    if (descripcion) descripcion.textContent = 'Actualiza nombre, vigencia, descuento, condiciones, productos vinculados y estado de la promoción.'
    if (kicker) kicker.textContent = 'Edición administrativa'
    if (botonGuardar) botonGuardar.textContent = 'Guardar cambios'
    return
  }

  if (titulo) titulo.textContent = 'Registrar Nueva Promoción'
  if (descripcion) descripcion.textContent = 'Captura un beneficio nuevo y asígnalo a los productos correspondientes del catálogo.'
  if (kicker) kicker.textContent = 'Registro administrativo'
  if (botonGuardar) botonGuardar.textContent = 'Guardar promoción'
}

async function prepararModificacion (idPromocion) {
  try {
    const response = await fetch(`/promos/promociones/${encodeURIComponent(idPromocion)}`)
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo cargar el detalle de la promoción.')
    }

    const promocion = result.data
    const descuentoPorcentaje = Number(promocion.DescuentoPorcentaje || 0)
    const productos = Array.isArray(promocion.productos) ? promocion.productos : []
    const tieneDescuento = descuentoPorcentaje > 0 || productos.length > 0

    limpiarFormulario()
    establecerModoFormulario('editar')

    estadoPromociones.promocionId = idPromocion
    document.getElementById('id_promocion').value = idPromocion
    document.getElementById('nombre').value = promocion.Nombre || ''
    document.getElementById('condiciones').value = promocion.Condiciones || ''
    document.getElementById('fecha_de_Inicio').value = normalizarFechaInput(promocion.Fecha_inicio)
    document.getElementById('fecha_de_Fin').value = normalizarFechaInput(promocion.Fecha_final)
    document.getElementById('activo').checked = estaActiva(promocion.Activo)
    document.getElementById('check-descuento').checked = tieneDescuento
    document.getElementById('descuento').value = tieneDescuento ? formatearDescuentoInput(descuentoPorcentaje) : ''

    estadoPromociones.productosSeleccionados = new Map(
      productos.map(producto => [String(producto.id), producto.nombre])
    )

    if (tieneDescuento) {
      document.getElementById('seccion-descuento').style.display = 'block'
      resetearFiltrosProductos()
      await actualizarProductos()
    } else {
      renderizarResumenProductos()
    }

    abrirModal('modal-promocion')
  } catch (error) {
    console.error('Error al preparar la modificación:', error)
    mostrarModalResultado('No se pudo cargar la promoción', error.message)
  }
}

function solicitarEliminacion (idPromocion) {
  const promocion = estadoPromociones.promociones.find(item => item.ID_Promocion === idPromocion)
  const mensaje = document.getElementById('mensaje-confirmar-eliminar')

  estadoPromociones.promocionPendienteEliminar = idPromocion

  if (mensaje) {
    mensaje.textContent = promocion
      ? `¿Deseas eliminar la promoción "${promocion.Nombre}"? Esta acción no se puede deshacer.`
      : '¿Deseas eliminar esta promoción? Esta acción no se puede deshacer.'
  }

  abrirModal('modal-confirmar-eliminacion')
}

function solicitarCambioEstado (idPromocion) {
  const promocion = estadoPromociones.promociones.find(item => item.ID_Promocion === idPromocion)
  const mensaje = document.getElementById('mensaje-confirmar-desactivar')
  const titulo = document.getElementById('titulo-confirmar-estado-promocion')
  const boton = document.getElementById('boton-confirmar-desactivar')
  const activar = promocion ? !estaActiva(promocion.Activo) : false

  estadoPromociones.promocionPendienteCambioEstado = {
    idPromocion,
    activar
  }

  if (mensaje) {
    mensaje.textContent = promocion
      ? (activar
          ? `¿Deseas activar la promoción "${promocion.Nombre}"? Volverá a mostrarse como activa en el catálogo.`
          : `¿Deseas desactivar la promoción "${promocion.Nombre}"? Permanecerá registrada, pero dejará de mostrarse como activa.`)
      : (activar
          ? '¿Deseas activar esta promoción? Volverá a mostrarse como activa en el catálogo.'
          : '¿Deseas desactivar esta promoción? Permanecerá registrada, pero dejará de mostrarse como activa.')
  }

  if (titulo) {
    titulo.textContent = activar ? 'Activar promoción' : 'Desactivar promoción'
  }

  if (boton) {
    boton.textContent = activar ? 'Activar promoción' : 'Desactivar promoción'
  }

  abrirModal('modal-confirmar-desactivacion')
}

async function confirmarCambioEstado () {
  const cambioEstado = estadoPromociones.promocionPendienteCambioEstado
  const botonDesactivar = document.getElementById('boton-confirmar-desactivar')

  if (!cambioEstado || !botonDesactivar) {
    return
  }

  botonDesactivar.classList.add('is-loading')

  try {
    const endpoint = cambioEstado.activar ? 'activar' : 'desactivar'
    const response = await fetch(`/promos/promociones/${encodeURIComponent(cambioEstado.idPromocion)}/${endpoint}`, {
      method: 'PATCH'
    })
    const result = await leerRespuestaJson(response)

    cerrarModal('modal-confirmar-desactivacion')

    if (!response.ok || !result.success) {
      throw new Error(result.message || `No se pudo ${cambioEstado.activar ? 'activar' : 'desactivar'} la promoción.`)
    }

    await cargarPromociones()
    mostrarModalResultado(
      cambioEstado.activar ? 'Promoción activada' : 'Promoción desactivada',
      result.message || `La promoción fue ${cambioEstado.activar ? 'activada' : 'desactivada'} correctamente.`,
      'Estado de promociones'
    )
  } catch (error) {
    console.error('Error al cambiar estado de promoción:', error)
    mostrarModalResultado(
      `No se pudo ${cambioEstado.activar ? 'activar' : 'desactivar'} la promoción`,
      error.message,
      'Estado de promociones'
    )
  } finally {
    botonDesactivar.classList.remove('is-loading')
  }
}

async function confirmarEliminacion () {
  const idPromocion = estadoPromociones.promocionPendienteEliminar
  const botonEliminar = document.getElementById('boton-confirmar-eliminar')

  if (!idPromocion || !botonEliminar) {
    return
  }

  botonEliminar.classList.add('is-loading')

  try {
    const response = await fetch(`/promos/promociones/${encodeURIComponent(idPromocion)}`, {
      method: 'DELETE'
    })
    const result = await leerRespuestaJson(response)

    cerrarModal('modal-confirmar-eliminacion')

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo eliminar la promoción.')
    }

    await cargarPromociones()
    mostrarModalResultado('Promoción eliminada', result.message || 'La promoción fue eliminada correctamente.', 'Eliminación de promociones')
  } catch (error) {
    console.error('Error al eliminar promoción:', error)
    mostrarModalResultado('No se pudo eliminar la promoción', error.message, 'Eliminación de promociones')
  } finally {
    botonEliminar.classList.remove('is-loading')
  }
}

function configurarCheckboxDescuento () {
  const checkbox = document.getElementById('check-descuento')
  const seccion = document.getElementById('seccion-descuento')
  const descuentoInput = document.getElementById('descuento')

  if (!checkbox || !seccion || !descuentoInput) {
    return
  }

  checkbox.addEventListener('change', async () => {
    limpiarErrorContenedor('select-productos')

    if (checkbox.checked) {
      seccion.style.display = 'block'
      await actualizarProductos()
      return
    }

    seccion.style.display = 'none'
    descuentoInput.value = ''
    estadoPromociones.productosSeleccionados.clear()
    resetearFiltrosProductos()
    mostrarPlaceholderProductos('Activa el descuento para cargar los productos del catálogo.')
    renderizarResumenProductos()
  })
}

async function actualizarProductos () {
  if (!document.getElementById('check-descuento').checked) {
    return
  }

  persistirSeleccionVisible()

  const categoria = document.getElementById('filtro-categoria').value
  const tipo = document.getElementById('filtro-tipo').value
  const selectProductos = document.getElementById('select-productos')
  const params = new URLSearchParams()

  if (categoria) {
    params.append('categoria', categoria)
  }

  if (tipo) {
    params.append('tipo', tipo)
  }

  if (selectProductos) {
    selectProductos.innerHTML = '<p class="has-text-grey">Cargando productos...</p>'
  }

  try {
    const response = await fetch(`/promos/promociones/producto-filtro?${params.toString()}`)
    const result = await leerRespuestaJson(response)

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'No se pudo obtener el catálogo de productos.')
    }

    renderizarProductos(result.data || [])
  } catch (error) {
    console.error('Error al cargar productos:', error)
    mostrarPlaceholderProductos('No se pudieron cargar los productos del catálogo.')
  }

  renderizarResumenProductos()
}

function renderizarProductos (productos) {
  const selectProductos = document.getElementById('select-productos')

  if (!selectProductos) {
    return
  }

  selectProductos.innerHTML = ''

  if (productos.length === 0) {
    mostrarPlaceholderProductos('No se encontraron productos con esos filtros.')
    return
  }

  productos.forEach(producto => {
    const label = document.createElement('label')
    label.className = 'checkbox promo-product-option'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.value = producto.ID_Producto
    checkbox.dataset.nombre = producto.Nombre
    checkbox.className = 'checkbox-producto mr-2'
    checkbox.checked = estadoPromociones.productosSeleccionados.has(String(producto.ID_Producto))
    checkbox.addEventListener('change', manejarCambioProducto)

    label.appendChild(checkbox)
    label.append(document.createTextNode(producto.Nombre))
    selectProductos.appendChild(label)
  })
}

function manejarCambioProducto (event) {
  const checkbox = event.target
  const id = String(checkbox.value)
  const nombre = checkbox.dataset.nombre || ''

  if (checkbox.checked) {
    estadoPromociones.productosSeleccionados.set(id, nombre)
  } else {
    estadoPromociones.productosSeleccionados.delete(id)
  }

  limpiarErrorContenedor('select-productos')
  renderizarResumenProductos()
}

function persistirSeleccionVisible () {
  document.querySelectorAll('.checkbox-producto').forEach(checkbox => {
    const id = String(checkbox.value)
    const nombre = checkbox.dataset.nombre || ''

    if (checkbox.checked) {
      estadoPromociones.productosSeleccionados.set(id, nombre)
    } else {
      estadoPromociones.productosSeleccionados.delete(id)
    }
  })
}

function renderizarResumenProductos () {
  const resumen = document.getElementById('resumen-productos')

  if (!resumen) {
    return
  }

  if (estadoPromociones.productosSeleccionados.size === 0) {
    resumen.innerHTML = '<span class="promo-chip empty">Sin productos seleccionados</span>'
    return
  }

  const chips = Array.from(estadoPromociones.productosSeleccionados.entries())
    .sort((a, b) => a[1].localeCompare(b[1], 'es'))
    .map(([id, nombre]) => `
      <span class="promo-chip" data-producto-id="${id}">
        ${escaparHtml(nombre)}
      </span>
    `)
    .join('')

  resumen.innerHTML = chips
}

async function guardarPromocion (event) {
  event.preventDefault()

  persistirSeleccionVisible()
  limpiarErroresFormulario()

  const datos = obtenerDatosFormulario()

  if (!validarFormulario(datos)) {
    return
  }

  const esEdicion = estadoPromociones.modo === 'editar'
  const botonGuardar = document.getElementById('boton-guardar-promocion')
  const url = esEdicion
    ? `/promos/promociones/${encodeURIComponent(estadoPromociones.promocionId)}`
    : '/promos/promociones'
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
      throw new Error(result.message || 'No se pudo guardar la promoción.')
    }

    cerrarModal('modal-promocion')
    limpiarFormulario()
    establecerModoFormulario('crear')
    await cargarPromociones()

    mostrarModalResultado(
      esEdicion ? 'Promoción actualizada' : 'Promoción registrada',
      result.message || (esEdicion ? 'La promoción se actualizó correctamente.' : 'La promoción se registró correctamente.')
    )
  } catch (error) {
    console.error('Error al guardar promoción:', error)
    mostrarModalResultado('No se pudieron guardar los cambios', error.message)
  } finally {
    if (botonGuardar) {
      botonGuardar.classList.remove('is-loading')
    }
  }
}

function obtenerDatosFormulario () {
  const tieneDescuento = document.getElementById('check-descuento').checked

  return {
    nombre: document.getElementById('nombre').value.trim(),
    descuento: tieneDescuento ? document.getElementById('descuento').value.trim() : 0,
    condicion: document.getElementById('condiciones').value.trim(),
    fechaInicio: document.getElementById('fecha_de_Inicio').value,
    fechaFinal: document.getElementById('fecha_de_Fin').value,
    activo: document.getElementById('activo').checked,
    productos: tieneDescuento
      ? Array.from(estadoPromociones.productosSeleccionados.entries()).map(([id, nombre]) => ({ id, nombre }))
      : []
  }
}

function validarFormulario (datos) {
  let esValido = true
  const descuentoNumero = Number(datos.descuento || 0)

  if (!datos.nombre) {
    marcarError('nombre', 'El nombre es obligatorio.')
    esValido = false
  }

  if (!datos.condicion) {
    marcarError('condiciones', 'Las condiciones son obligatorias.')
    esValido = false
  }

  if (!datos.fechaInicio) {
    marcarError('fecha_de_Inicio', 'La fecha de inicio es obligatoria.')
    esValido = false
  }

  if (!datos.fechaFinal) {
    marcarError('fecha_de_Fin', 'La fecha final es obligatoria.')
    esValido = false
  }

  if (datos.fechaInicio && datos.fechaFinal && datos.fechaInicio > datos.fechaFinal) {
    marcarError('fecha_de_Inicio', 'La fecha inicial debe ser anterior o igual a la final.')
    marcarError('fecha_de_Fin', 'La fecha final debe ser posterior o igual a la inicial.')
    esValido = false
  }

  if (document.getElementById('check-descuento').checked) {
    if (datos.descuento === '' || Number.isNaN(descuentoNumero) || descuentoNumero < 0 || descuentoNumero > 100) {
      marcarError('descuento', 'Ingresa un porcentaje válido entre 0 y 100.')
      esValido = false
    }

    if (datos.productos.length === 0) {
      marcarErrorContenedor('select-productos', 'Selecciona al menos un producto para aplicar el descuento.')
      esValido = false
    }
  }

  return esValido
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

  contenedor.classList.add('promotion-box-error')

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

  contenedor.classList.remove('promotion-box-error')

  const siguiente = contenedor.nextElementSibling
  if (siguiente && siguiente.classList.contains('help') && siguiente.classList.contains('is-danger')) {
    siguiente.remove()
  }
}

function limpiarErroresFormulario () {
  document.querySelectorAll('#form-promocion .input, #form-promocion .textarea, #form-promocion .select select').forEach(elemento => {
    elemento.classList.remove('is-danger')
  })

  document.querySelectorAll('#form-promocion .help.is-danger').forEach(error => {
    error.remove()
  })

  limpiarErrorContenedor('select-productos')
}

function limpiarFormulario () {
  const formulario = document.getElementById('form-promocion')
  const seccionDescuento = document.getElementById('seccion-descuento')

  if (formulario) {
    formulario.reset()
  }

  estadoPromociones.promocionId = null
  estadoPromociones.productosSeleccionados.clear()

  if (seccionDescuento) {
    seccionDescuento.style.display = 'none'
  }

  document.getElementById('id_promocion').value = ''
  document.getElementById('activo').checked = true
  resetearFiltrosProductos()
  mostrarPlaceholderProductos('Activa el descuento para cargar los productos del catálogo.')
  renderizarResumenProductos()
  limpiarErroresFormulario()
}

function resetearFiltrosProductos () {
  const filtroCategoria = document.getElementById('filtro-categoria')
  const filtroTipo = document.getElementById('filtro-tipo')

  if (filtroCategoria) {
    filtroCategoria.value = ''
  }

  if (filtroTipo) {
    filtroTipo.value = ''
  }
}

function mostrarPlaceholderProductos (mensaje) {
  const selectProductos = document.getElementById('select-productos')

  if (selectProductos) {
    selectProductos.innerHTML = `<p class="has-text-grey">${escaparHtml(mensaje)}</p>`
  }
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

function obtenerFechaActualLocal () {
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function obtenerEstadoVigencia (fechaInicio, fechaFinal) {
  const inicio = normalizarFechaInput(fechaInicio)
  const fin = normalizarFechaInput(fechaFinal)
  const hoy = obtenerFechaActualLocal()

  if (!inicio && !fin) {
    return { texto: 'Sin fechas', clase: 'is-undated' }
  }

  if (inicio && hoy < inicio) {
    return { texto: 'Próxima', clase: 'is-upcoming' }
  }

  if (fin && hoy > fin) {
    return { texto: 'Vencida', clase: 'is-expired' }
  }

  return { texto: 'Vigente', clase: 'is-current' }
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

function formatearDescuento (descuento) {
  const valor = Number(descuento)

  if (Number.isNaN(valor)) {
    return 'Descuento'
  }

  return `${formatearDescuentoInput(valor)}% de descuento`
}

function formatearDescuentoInput (descuento) {
  const valor = Number(descuento)

  if (Number.isNaN(valor)) {
    return ''
  }

  return Number.isInteger(valor) ? String(valor) : valor.toFixed(2).replace(/\.?0+$/, '')
}

function estaActiva (activo) {
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
