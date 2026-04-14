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

  document.getElementById('modal-modificarRoyalty').classList.add('is-active')
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
    document.getElementById('ModalError')
  }
}

const abrirModal = () => {
  document.getElementById('modal-modificarRoyalty').classList.add('is-active')
}

function validarFormulario (datos) {
  document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'))
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())

  let esValido = true
  if (!datos.nombre.trim()) { marcarError('input-nombre', 'Obligatorio'); esValido = false }
  if (!datos.prioridad.trim()) { marcarError('input-prioridad', 'Obligatorio'); esValido = false }
  if (!datos.descripcion.trim()) { marcarError('input-descripcion', 'Requerido'); esValido = false }
  if (!datos.minVisitas) { marcarError('input-minVisitas', 'Requerido'); esValido = false }
  if (!datos.maxVisitas) { marcarError('input-maxVisitas', 'Requerido'); esValido = false }
  // Validamos que sea menor y mayor al numero de visitas
  if (Number(datos.minVisitas) > Number(datos.maxVisitas)) {
    marcarError('input-minVisitas', 'Debe ser menor que max Visitas')
    esValido = false
  }
  if (Number(datos.maxVisitas) < Number(datos.minVisitas)) {
    marcarError('input-maxVisitas', 'Debe ser mayor que min Visitas')
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
  elemento.closest('.control').appendChild(help)
}

const limpiarFormulario = () => {
  document.getElementById('form-modificarRoyalty').reset()
}

const cerrarModalSoloConfirmacion = () => {
  document.getElementById('modal-confirmarModificarRoyalty').classList.remove('is-active')
}

const cerrarModalError = () => {
  document.getElementById('ModalError').classList.remove('is-active')
}

const cerrarModalConfirmacion = () => {
  document.getElementById('modal-confirmarModificarRoyalty').classList.remove('is-active')
  document.getElementById('modal-modificarRoyalty').classList.remove('is-active')
  limpiarFormulario()
  window.location.reload()
}

const cerrarModal = () => {
  document.getElementById('modal-modificarRoyalty').classList.remove('is-active')
  limpiarFormulario()
}

let royaltyABorrar = ''
function borrarRoyalty (NombreRoyalty) {
  royaltyABorrar = NombreRoyalty
  document.getElementById('nombre-a-borrar').textContent = NombreRoyalty
  document.getElementById('ModalEliminar').classList.add('is-active')
}

function confirmarBorrado () {
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
    const response = await fetch('/royalty/royaltyAdmin/api')
    const data = await response.json()

    console.log('Mostrando los royalties en HTML')
    const container = document.getElementById('royaltyContainer')
    royaltiesData = data.data
    data.data.forEach(royalty => {
      let eventosHTML
      let promocionesHTML
      if (royalty.promociones && royalty.promociones.length > 0) {
        promocionesHTML = royalty.promociones.map(promo => `<p>${promo.Nombre}</p>`).join('')
      } else {
        promocionesHTML = '<p class="has-text-grey">Sin promociones</p>'
      }
      if (royalty.eventos && royalty.eventos.length > 0) {
        eventosHTML = royalty.eventos.map(evento => `<p>${evento.Nombre}</p>`).join('')
      } else {
        eventosHTML = '<p class="has-text-grey">Sin eventos</p>'
      }
      container.innerHTML += `
        <div class="column is-half">
          <div class="card">
            <div class="card-content">
              <p class="title is-5">${royalty.Nombre_Royalty}</p>
              <div class="content">
                <p><strong>Prioridad:</strong> ${royalty.Número_de_prioridad}</p>
                <p><strong>Descripción:</strong> ${royalty.Descripción}</p>
                <p><strong>Visitas mínimas:</strong> ${royalty.Min_Visitas}</p>
                <p><strong>Visitas máximas:</strong> ${royalty.Max_Visitas}</p>
                <hr>
                <strong> Promociones: </strong>
                ${promocionesHTML}
              </div>
                <strong> Eventos: </strong>
                ${eventosHTML}
                <br>
              <footer class="card-footer">
                <button class="button is-warning card-footer-item" onclick="modificarRoyalty('${royalty.Nombre_Royalty}')">
                  <span class="icon"><i class="fas fa-pen"></i></span>
                  <span>Modificar</span>
                </button>
                <button class="button is-danger card-footer-item" onclick="borrarRoyalty('${royalty.Nombre_Royalty}')">
                  <span class="icon"><i class="fas fa-trash"></i></span>
                  <span>Borrar</span>
                </button>
              </footer>
            </div>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.log(error)
  }
}
cargarRoyalty()
