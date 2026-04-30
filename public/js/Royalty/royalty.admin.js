/* eslint-env browser */
/* global alert */

/* eslint-disable no-unused-vars */

let royaltiesData = []
let nombreOriginal = ''
async function modificarRoyalty (nombre) {
  nombreOriginal = nombre
  const royalty = royaltiesData.find(r => r.Nombre_Royalty === nombre)

  document.getElementById('modal-nombre').textContent = nombre
  document.getElementById('input-nombre').value = royalty.Nombre_Royalty
  document.getElementById('input-prioridad').value = royalty.Número_de_prioridad
  document.getElementById('input-descripcion').value = royalty.Descripción
  document.getElementById('input-minVisitas').value = royalty.Min_Visitas
  document.getElementById('input-maxVisitas').value = royalty.Max_Visitas
  const valorMostrar = royalty.descuento_premio ? (royalty.descuento_premio * 100) : 0;
  document.getElementById('input-descuentos_premios').value = valorMostrar

  // Promociones
  const resPromos = await fetch(`/royalty/royaltyAdmin/${nombre}/promociones`)
  const dataPromos = await resPromos.json()

  // Eventos
  const resEventos = await fetch(`/royalty/royaltyAdmin/${nombre}/eventos`)
  const dataEventos = await resEventos.json()

  // Promociones
  const contenedor = document.getElementById('contenedor-promociones')
  contenedor.innerHTML = ''
  dataPromos.data.todas.forEach(promo => {
    const marcada = dataPromos.data.idsAsignadas.includes(promo.ID_promocion)
    const label = document.createElement('label')
    label.className = 'checkbox'
    label.style.display = 'block'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.value = promo.ID_promocion
    input.className = 'checkbox-promo mr-2'
    input.checked = marcada
    label.appendChild(input)
    label.appendChild(document.createTextNode(' ' + promo.Nombre))
    contenedor.appendChild(label)
  })

  // Eventos
  const contenedorEventos = document.getElementById('contenedor-eventos')
  contenedorEventos.innerHTML = ''
  dataEventos.data.todas.forEach(evento => {
    const marcada = dataEventos.data.idsAsignadas.includes(evento.ID_Evento)
    const label = document.createElement('label')
    label.className = 'checkbox'
    label.style.display = 'block'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.value = evento.ID_Evento
    input.className = 'checkbox-evento mr-2'
    input.checked = marcada
    label.appendChild(input)
    label.appendChild(document.createTextNode(' ' + evento.Nombre))
    contenedorEventos.appendChild(label)
  })
  const recordatorio = document.getElementById('recordatorio-visitas')
  const minActual = document.getElementById('input-minVisitas').value
  const otrosPrioridad = royaltiesData.filter(r => r.Nombre_Royalty !== nombre)
  if (otrosPrioridad.length > 0) {
    const maxActual = Math.max(...otrosPrioridad.map(r => Number(r.Max_Visitas)))
    recordatorio.textContent = `Tu mínimo debe ser igual a ${minActual} o mayor a ${maxActual}`
  } else {
    recordatorio.textContent = ''
  }
  const recordatorioPrioridad = document.getElementById('recordatorio-prioridad')
  const otros = royaltiesData.filter(r => r.Nombre_Royalty !== nombre)
  if (otros.length > 0) {
    const maxPrioridad = Math.max(...otros.map(r => Number(r.Número_de_prioridad)))
    const prioridadActual = document.getElementById('input-prioridad').value
    recordatorioPrioridad.textContent = `La prioridad actual debe ser igual a ${prioridadActual} o mayor a ${maxPrioridad}`
  } else {
    recordatorioPrioridad.textContent = ''
  }

  document.getElementById('modal-modificarRoyalty').classList.add('is-active')
}

const RegistroGuardarRoyalty = () => {
  const datos = {
    nombre: document.getElementById('add-input-nombre').value.trim(),
    prioridad: document.getElementById('add-input-prioridad').value.trim(),
    descripcion: document.getElementById('add-input-descripcion').value.trim(),
    minVisitas: document.getElementById('add-input-minVisitas').value.trim(),
    maxVisitas: document.getElementById('add-input-maxVisitas').value.trim(),
    descuento_premio: parseFloat(document.getElementById('add-input-descuento_premio').value.trim()) / 100,
    promociones: Array.from(document.querySelectorAll('.checkbox-promociones:checked')).map(cb => ({
      id: cb.value,
      nombre: cb.dataset.nombre
    })),
    eventos: Array.from(document.querySelectorAll('.checkbox-eventos:checked')).map(cb => ({
      id: cb.value,
      nombre: cb.dataset.nombre
    }))
  }

  if (!agregarValidarFormulario(datos)) return

  const btnGuardar = document.querySelector('#modalAgregarRoyalty .button.is-primary')
  btnGuardar.classList.add('is-loading')

  console.log('Datos enviados:', JSON.stringify(datos))
  fetch('/royalty/promociones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        cerrarModal()
        document.getElementById('modal-exito').classList.add('is-active')
        cargarEstadosRoyalty() // Recargar la lista sin refrescar página
      } else {
        alert('Error: ' + data.message)
      }
    })
    .catch(err => console.error('Error:', err))
    .finally(() => btnGuardar.classList.remove('is-loading'))
}

async function guardarRoyalty () {
  const promociones = Array.from(document.querySelectorAll('.checkbox-promo:checked'))
    .map(cb => cb.value)
  const eventos = Array.from(document.querySelectorAll('.checkbox-evento:checked')).map(cb => cb.value)

  const body = {
    nombre: document.getElementById('input-nombre').value,
    prioridad: document.getElementById('input-prioridad').value,
    descripcion: document.getElementById('input-descripcion').value,
    minVisitas: document.getElementById('input-minVisitas').value,
    maxVisitas: document.getElementById('input-maxVisitas').value,
    maxVisitasPremios: document.getElementById('input-descuentos_premios').value,
    descuento_premio: parseFloat(document.getElementById('input-descuentos_premios').value) / 100,
    promociones,
    eventos
  }

  if (!validarFormulario(body)) return

  try {
    const response = await fetch('/royalty/royaltyAdmin/' + nombreOriginal, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (data.success) {
      document.getElementById('modal-confirmarModificarRoyalty').classList.add('is-active')
    } else {
      alert('Error al guardar Royalty')
    }
  } catch (error) {
    console.log(error)
    document.getElementById('ModalError').classList.add('is-active')
  }
}

const abrirModal = () => {
  document.getElementById('modal-modificarRoyalty').classList.add('is-active')
}

// Después:
const abrirModalNuevoEstadoRoyalty = async () => {
  // Limpiamos el formulario primero
  document.getElementById('add-input-nombre').value = ''
  document.getElementById('add-input-prioridad').value = ''
  document.getElementById('add-input-descripcion').value = ''
  document.getElementById('add-input-minVisitas').value = ''
  document.getElementById('add-input-maxVisitas').value = ''
  document.getElementById('add-input-descuento_premio').value = ''

  // Cargamos todas las promociones disponibles
  const resPromos = await fetch('/royalty/royaltyAdmin/todas/promociones-disponibles')
  const dataPromos = await resPromos.json()

  const contenedorPromos = document.getElementById('contenedor-promociones-nuevo')
  contenedorPromos.innerHTML = ''
  dataPromos.data.forEach(promo => {
    const label = document.createElement('label')
    label.className = 'checkbox'
    label.style.display = 'block'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.value = promo.ID_promocion
    input.className = 'checkbox-promociones mr-2'
    input.dataset.nombre = promo.Nombre
    label.appendChild(input)
    label.appendChild(document.createTextNode(' ' + promo.Nombre))
    contenedorPromos.appendChild(label)
  })

  // Cargamos todos los eventos disponibles
  const resEventos = await fetch('/royalty/royaltyAdmin/todas/eventos-disponibles')
  const dataEventos = await resEventos.json()

  const contenedorEventos = document.getElementById('contenedor-eventos-nuevo')
  contenedorEventos.innerHTML = ''
  dataEventos.data.forEach(evento => {
    const label = document.createElement('label')
    label.className = 'checkbox'
    label.style.display = 'block'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.value = evento.ID_Evento
    input.className = 'checkbox-eventos mr-2'
    input.dataset.nombre = evento.Nombre
    label.appendChild(input)
    label.appendChild(document.createTextNode(' ' + evento.Nombre))
    contenedorEventos.appendChild(label)
  })

  const recordatorio = document.getElementById('add-recordatorio-visitas')
  if (royaltiesData.length > 0) {
    const maxActual = Math.max(...royaltiesData.map(r => Number(r.Max_Visitas)))
    recordatorio.textContent = `Tu mínimo debe ser mayor a ${maxActual}`
  } else {
    recordatorio.textContent = ''
  }
  const recordatorioPrioridad = document.getElementById('add-recordatorio-prioridad')
  if (royaltiesData.length > 0) {
    const maxPrioridad = Math.max(...royaltiesData.map(r => Number(r.Número_de_prioridad)))
    recordatorioPrioridad.textContent = `La prioridad más alta actual es ${maxPrioridad}`
  } else {
  recordatorioPrioridad.textContent = ''
  }

  document.getElementById('modalAgregarRoyalty').classList.add('is-active')
}

const cargarEstadosRoyalty = async () => {
  const spinner = document.getElementById('loading-spinner')
  if (spinner) spinner.classList.remove('is-hidden')

  try {
    const response = await fetch('/royalty/royaltyAdmin/api')
    const result = await response.json()

    if (result.success) {
      royaltiesData = result.data
    }
  } catch (error) {
    console.error('Error al cargar promos:', error)
  } finally {
    if (spinner) spinner.classList.add('is-hidden')
  }
}

const actualizarProductos = async () => {
  const promociones = document.querySelector('select[name="promociones"')
  const eventos = document.querySelector('select[name="eventos"]')

  const params = new URLSearchParams()
  if (promociones) params.append('promociones', promociones)
  if (eventos) params.append('eventos', eventos)

  try {
    const res = await fetch(`/royalty/royaltyAdmin/promocion-evento-filtro?${params.toString()}`)
    const data = await res.json()
    const selectProductos = document.getElementById('select-productos')
    selectProductos.innerHTML = ''

    if (!data.success || data.data.length === 0) {
      selectProductos.innerHTML = '<option value="">Sin resultados</option>'
      return
    }

    data.data.forEach(producto => {
      const label = document.createElement('label')
      label.className = 'checkbox'
      label.style.display = 'block'
      label.innerHTML = `
                <input type="checkbox" value="${producto.ID_Producto}" 
                       data-nombre="${producto.Nombre}" class="checkbox-producto mr-2">
                ${producto.Nombre}
            `
      selectProductos.appendChild(label)
    })
  } catch (error) {
    console.error('Error al filtrar productos:', error)
  }
}

// Validar formulario para agregar royalties
function agregarValidarFormulario (datos) {
  document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'))
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())
  const minNuevo = Number(datos.minVisitas)
  const maxNuevo = Number(datos.maxVisitas)
  const desc_nuevo = Number(datos.descuento_premio)
  const prioridadNueva = Number(datos.prioridad)
  const prioridadDuplicada = royaltiesData.find(r => 
  Number(r.Número_de_prioridad) === prioridadNueva && r.Nombre_Royalty !== nombreOriginal)

  let esValido = true
  if (!datos.nombre.trim()) { marcarError('add-input-nombre', 'Obligatorio'); esValido = false }
  if (!datos.prioridad.trim()) { marcarError('add-input-prioridad', 'Obligatorio'); esValido = false }
  if (!datos.descripcion.trim()) { marcarError('add-input-descripcion', 'Requerido'); esValido = false }
  if (!datos.minVisitas) { marcarError('add-input-minVisitas', 'Requerido'); esValido = false }
  if (!datos.maxVisitas) { marcarError('add-input-maxVisitas', 'Requerido'); esValido = false }
  // Validamos que sea menor y mayor al numero de visitas
  if (Number(datos.minVisitas) > Number(datos.maxVisitas)) {
    marcarError('add-input-minVisitas', 'Debe ser menor que max Visitas')
    esValido = false
  }
  if (Number(datos.maxVisitas) < Number(datos.minVisitas)) {
    marcarError('add-input-maxVisitas', 'Debe ser mayor que min Visitas')
    esValido = false
  }
  // Validamos que sea entero
  if (Number(datos.prioridad) < 0) {
    marcarError('add-input-prioridad', 'Debe ser mayor que cero')
    esValido = false
  }
  if (Number(datos.minVisitas) < 0) {
    marcarError('add-input-minVisitas', 'Debe ser mayor que cero')
    esValido = false
  }
  if (Number(datos.maxVisitas) < 0) {
    marcarError('add-input-maxVisitas', 'Debe ser mayor que cero')
    esValido = false
  }
  if (datos.promociones.length === 0) {
    marcarError('contenedor-promociones-nuevo', 'Debes de registrar una promocion')
    esValido = false
  }
  if (datos.eventos.length === 0) {
    marcarError('contenedor-eventos-nuevo', 'Debes de registrar un evento')
    esValido = false
  }
  if (minNuevo === maxNuevo) {
  marcarError('add-input-minVisitas', 'Min y Max no pueden ser iguales')
  marcarError('add-input-maxVisitas', 'Min y Max no pueden ser iguales')
  esValido = false
}

for (const royalty of royaltiesData) {
  if (royalty.Nombre_Royalty === nombreOriginal) continue

  const minExistente = Number(royalty.Min_Visitas)
  const maxExistente = Number(royalty.Max_Visitas)

  if (minNuevo <= maxExistente && maxNuevo >= minExistente) {
    marcarError('add-input-minVisitas', `Rango traslapa con "${royalty.Nombre_Royalty}" (${minExistente}-${maxExistente})`)
    marcarError('add-input-maxVisitas', `Rango traslapa con "${royalty.Nombre_Royalty}" (${minExistente}-${maxExistente})`)
    esValido = false
    break
  }
}
if (prioridadDuplicada) {
  marcarError('add-input-prioridad', `La prioridad ${prioridadNueva} ya la tiene "${prioridadDuplicada.Nombre_Royalty}"`)
  esValido = false
}
const nombreDuplicado = royaltiesData.find(r => 
  r.Nombre_Royalty.toLowerCase() === datos.nombre.toLowerCase()
)
if (nombreDuplicado) {
  marcarError('add-input-nombre', 'Ya existe un estado royalty con ese nombre')
  esValido = false
}

  return esValido
}

function validarFormulario (datos) {
  document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'))
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())
  const minNuevo = Number(datos.minVisitas)
  const minActual = Number(document.getElementById('input-minVisitas').value)
  const maxActual = Number(document.getElementById('input-maxVisitas').value)
  const prioridadActual = Number(document.getElementById('input-prioridad').value)
  const maxNuevo = Number(datos.maxVisitas)
  const prioridadNueva = Number(datos.prioridad)
  const prioridadDuplicada = royaltiesData.find(r => Number(r.Número_de_prioridad) === prioridadNueva)
  let esValido = true
  if (!datos.nombre.trim()) { marcarError('input-nombre', 'Obligatorio'); esValido = false }
  if (!datos.prioridad.trim()) { marcarError('input-prioridad', 'Obligatorio'); esValido = false }
  if (!datos.descripcion.trim()) { marcarError('input-descripcion', 'Requerido'); esValido = false }
  if (!datos.minVisitas) { marcarError('input-minVisitas', 'Requerido'); esValido = false }
  if (!datos.maxVisitas) { marcarError('input-maxVisitas', 'Requerido'); esValido = false }
  // Validamos que sea menor y mayor al numero de visitas
  if (Number(minNuevo) > Number(maxNuevo)) {
    marcarError('input-minVisitas', 'Debe ser menor que max Visitas')
    esValido = false
  }
  // Validamos que sea entero
  if (Number(datos.prioridad) < 0) {
    marcarError('input-prioridad', 'Debe ser mayor que cero')
    esValido = false
  }
  if (Number(datos.minVisitas) < 0) {
    marcarError('input-minVisitas', 'Debe ser mayor que cero')
    esValido = false
  }
  if (Number(datos.maxVisitas) < 0) {
    marcarError('input-maxVisitas', 'Debe ser mayor que cero')
    esValido = false
  }
  if(minNuevo === maxNuevo) {
    marcarError ('input-minVisitas', `El valor minimo y maximo no pueden ser iguales`)
  }
  //Para el valor minimo
  if (minActual != minNuevo){
    for (const royalty of royaltiesData) {
      if (royalty.Nombre_Royalty === nombreOriginal) continue
      const maxExistente = Number(royalty.Max_Visitas)
      const minExistente = Number(royalty.Min_Visitas)
      if (minNuevo <= maxExistente && maxNuevo >= minExistente) {
        marcarError('add-input-minVisitas', `Rango traslapa con "${royalty.Nombre_Royalty}" (${minExistente}-${maxExistente})`)
        esValido = false
        break
      }
    }
  }
  if(prioridadActual != prioridadNueva){
    if (prioridadDuplicada) {
      marcarError('input-prioridad', `La prioridad ${prioridadNueva} ya la tiene "${prioridadDuplicada.Nombre_Royalty}"`)
      esValido = false
    }
  }

  const nombreDuplicado = royaltiesData.find(r => 
  r.Nombre_Royalty.toLowerCase() === datos.nombre.toLowerCase() && 
  r.Nombre_Royalty !== nombreOriginal)
  if (nombreDuplicado) {
    marcarError('input-nombre', 'Ya existe un estado royalty con ese nombre')
    esValido = false
  }

  return esValido
}

function marcarError (id, mensaje) {
  const elemento = document.getElementById(id)
  console.log('buscando elemento:', id, elemento)
  if (!elemento) return
  elemento.classList.add('is-danger')
  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje
  const control = elemento.closest('.control')
  if (control) {
    control.appendChild(help)
  } else {
    elemento.insertAdjacentElement('afterend', help)
  }
}

const limpiarFormulario = () => {
  document.getElementById('form-modificarRoyalty').reset()
}

const cerrarModalSoloConfirmacion = () => {
  document.getElementById('modal-confirmarModificarRoyalty').classList.remove('is-active')
}

const cerrarModalConfirmacion = () => {
  document.getElementById('modal-confirmarModificarRoyalty').classList.remove('is-active')
  document.getElementById('modal-modificarRoyalty').classList.remove('is-active')
  limpiarFormulario()
  window.location.reload()
}

function cerrarModalError () {
  document.getElementById('ModalError').classList.remove('is-active')
}

const cerrarModal = () => {
  document.getElementById('modal-modificarRoyalty').classList.remove('is-active')
  limpiarFormulario()
}

const cerrarModalGuardarRoyalty = () => {
  document.getElementById('modalAgregarRoyalty').classList.remove('is-active')
  limpiarFormulario()
}

let royaltyABorrar = ''
function borrarRoyalty (NombreRoyalty) {
  royaltyABorrar = NombreRoyalty
  document.getElementById('nombre-a-borrar').textContent = NombreRoyalty
  document.getElementById('ModalEliminar').classList.add('is-active')
}

function confirmarBorrado () {
  console.log('Borrando:', royaltyABorrar)
  fetch('/royalty/borrar/' + royaltyABorrar, { method: 'DELETE' })
    .then(() => {
      document.getElementById('ModalEliminar').classList.remove('is-active')
      window.location.reload()
    })
    .catch(() => {
      document.getElementById('ModalEliminar').classList.remove('is-active')
      document.getElementById('ModalError').classList.add('is-active')
    })
}

async function cargarRoyalty () {
  try {
    // Obtenemos la ruta del royalty
    const response = await fetch('/royalty/royaltyAdmin/api')
    const data = await response.json()

    console.log('Mostrando los royalties en HTML') // Debug
    const container = document.getElementById('royaltyContainer')
    royaltiesData = data.data // Obtenemos los datos en total de todos los royalties
    // Obtenemos cada dato de cada royalty
    data.data.forEach(royalty => {
      // Variables para eventos y promociones
      let eventosHTML
      let promocionesHTML
      // Si obtenemos las promociones y eventos se deben de mostrar en la vista
      if (royalty.promociones && royalty.promociones.length > 0) {
        // Obtenemos solo el nombre de las promociones del arreglo
        promocionesHTML = royalty.promociones.map(promo => `<p>${promo.Nombre}</p>`).join('')
      } else {
        promocionesHTML = '<p class="has-text-grey">Sin promociones</p>'
      }
      if (royalty.eventos && royalty.eventos.length > 0) {
        // Obtenemos solo los nombres de los eventos del arreglo
        eventosHTML = royalty.eventos.map(evento => `<p>${evento.Nombre}</p>`).join('')
      } else {
        eventosHTML = '<p class="has-text-grey">Sin eventos</p>'
      }
      // Añadimos en la vista
      container.innerHTML += `
  <div class="royalty-card">
    <p class="royalty-card-name">${royalty.Nombre_Royalty}</p>
    <div class="royalty-card-meta">
      <span class="royalty-meta-pill"><i class="fas fa-star"></i> Prioridad ${royalty.Número_de_prioridad}</span>
      <span class="royalty-meta-pill"><i class="fas fa-arrow-up"></i> Min ${royalty.Min_Visitas}</span>
      <span class="royalty-meta-pill"><i class="fas fa-arrow-down"></i> Max ${royalty.Max_Visitas}</span>
      <span class="royalty-meta-pill"><i class="fas fa-tag"></i> Descuento: ${(royalty.descuento_premio * 100)}%</span>
    </div>
    <p class="royalty-card-desc">${royalty.Descripción}</p>
    <hr style="margin: 4px 0; border-color: var(--c-border);">
    <div style="font-size:13px; color: var(--c-text-soft);">
      <strong>Promociones:</strong> ${promocionesHTML}
      <strong>Eventos:</strong> ${eventosHTML}
    </div>
    <div class="royalty-card-actions">
      <button class="button" onclick="modificarRoyalty('${royalty.Nombre_Royalty}')">
        <span class="icon"><i class="fas fa-pen"></i></span>
        <span>Modificar</span>
      </button>
      <button class="button is-danger" onclick="borrarRoyalty('${royalty.Nombre_Royalty}')">
        <span class="icon"><i class="fas fa-trash"></i></span>
        <span>Borrar</span>
      </button>
    </div>
  </div>
`
    })
    // Si no se logra añadir a la vista
  } catch (error) {
    console.log(error)
    document.getElementById('ModalError').classList.add('is-active')
  }
}
cargarRoyalty()
