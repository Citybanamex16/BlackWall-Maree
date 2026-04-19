console.log('adminTipos.js cargado')

const btnNuevoTipo = document.getElementById('btnNuevoTipo')
const modalRegistroTipo = document.getElementById('ModalRegistroTipo')
const btnCerrarRegistroTipo = document.getElementById('btnCerrarRegistroTipo')
const btnConfirmarRegistroTipo = document.getElementById('btnConfirmarRegistroTipo')
const inputNombreTipo = document.getElementById('inputNombreTipo')

const modalResumenTipo = document.getElementById('ModalResumenTipo')
const resumenContenidoTipo = document.getElementById('resumenContenidoTipo')
const btnConfirmarCreacionTipo = document.getElementById('btnConfirmarCreacionTipo')
const btnVolverFormularioTipo = document.getElementById('btnVolverFormularioTipo')

const modalErrorTipo = document.getElementById('ModalErrorTipo')
const errorTituloTipo = document.getElementById('errorTituloTipo')
const errorMensajeTipo = document.getElementById('errorMensajeTipo')
const btnCerrarErrorTipo = document.getElementById('btnCerrarErrorTipo')

const modalExitoTipo = document.getElementById('ModalExitoTipo')
const exitoTituloTipo = document.getElementById('exitoTituloTipo')
const exitoMensajeTipo = document.getElementById('exitoMensajeTipo')
const btnCerrarExitoTipo = document.getElementById('btnCerrarExitoTipo')

const tablaTiposContainer = document.getElementById('tablaTiposContainer')

let datosTipoParaEnviar = null

document.addEventListener('DOMContentLoaded', () => {
  cargarTablaTipos()
})

// Tablita
async function cargarTablaTipos () {
  try {
    const res = await fetch('/admin/api/tipos')
    if (!res.ok) throw new Error('Error al obtener tipos')
    const obj = await res.json()
    const tipos = obj.data

    if (!tipos || tipos.length === 0) {
      tablaTiposContainer.innerHTML = '<div class="ing-empty">No hay tipos registrados aún.</div>'
      return
    }

    const tabla = document.createElement('table')
    tabla.className = 'ing-table'
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Nombre</th>
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    tipos.forEach(tipo => {
      const tr = document.createElement('tr')
      tr.innerHTML = `<td style="font-weight:500;">${tipo.nombre}</td>`
      tbody.appendChild(tr)
    })

    tabla.appendChild(tbody)
    tablaTiposContainer.innerHTML = ''
    tablaTiposContainer.appendChild(tabla)
  } catch (error) {
    console.error('Error cargando tabla tipos:', error)
    tablaTiposContainer.innerHTML = '<div class="ing-empty" style="color:#a03020;">Error al cargar tipos.</div>'
  }
}

btnNuevoTipo.addEventListener('click', (e) => {
  e.preventDefault()
  inputNombreTipo.value = ''
  modalRegistroTipo.showModal()
})

btnCerrarRegistroTipo.addEventListener('click', (e) => {
  e.preventDefault()
  modalRegistroTipo.close()
})

// Validacion lleno registro
btnConfirmarRegistroTipo.addEventListener('click', async (e) => {
  e.preventDefault()
  const nombre = inputNombreTipo.value.trim()

  if (!nombre) {
    mostrarErrorTipo('Campo incompleto', 'El nombre del tipo es obligatorio.')
    return
  }

  try {
    const res = await fetch(`/admin/api/tipos/verificarNombre?nombre=${encodeURIComponent(nombre)}`)
    const obj = await res.json()
    if (obj.existe) {
      mostrarErrorTipo('Tipo ya existente', `Ya existe un tipo con el nombre "${nombre}".`)
      return
    }
  } catch (error) {
    mostrarErrorTipo('Error de verificación', 'No se pudo verificar el nombre.')
    return
  }

  datosTipoParaEnviar = { nombre }
  modalRegistroTipo.close()
  mostrarResumenTipo(nombre)
})

// Resumen tipo
function mostrarResumenTipo (nombre) {
  resumenContenidoTipo.innerHTML = ''
  const fila = document.createElement('div')
  fila.className = 'resumen-fila'
  const etiqueta = document.createElement('span')
  etiqueta.className = 'resumen-label'
  etiqueta.textContent = 'Nombre'
  const valor = document.createElement('span')
  valor.className = 'resumen-valor'
  valor.textContent = nombre
  fila.appendChild(etiqueta)
  fila.appendChild(valor)
  resumenContenidoTipo.appendChild(fila)
  modalResumenTipo.showModal()
}

btnVolverFormularioTipo.addEventListener('click', (e) => {
  e.preventDefault()
  modalResumenTipo.close()
  modalRegistroTipo.showModal()
})

btnConfirmarCreacionTipo.addEventListener('click', async (e) => {
  e.preventDefault()
  if (!datosTipoParaEnviar) {
    mostrarErrorTipo('Error interno', 'No hay datos para guardar.')
    return
  }

  try {
    const res = await fetch('/admin/api/tipos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosTipoParaEnviar)
    })
    const obj = await res.json()

    if (obj.success) {
      modalResumenTipo.close()
      exitoTituloTipo.textContent = `¡${datosTipoParaEnviar.nombre} registrado!`
      exitoMensajeTipo.textContent = 'El tipo fue guardado exitosamente.'
      modalExitoTipo.showModal()
      cargarTablaTipos()
    } else {
      mostrarErrorTipo('Error al registrar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorTipo('Error interno', `Fallo al conectar con el servidor: ${error}`)
  }
})

btnCerrarErrorTipo.addEventListener('click', () => modalErrorTipo.close())

btnCerrarExitoTipo.addEventListener('click', () => {
  modalExitoTipo.close()
  datosTipoParaEnviar = null
})

function mostrarErrorTipo (titulo, mensaje) {
  errorTituloTipo.textContent = titulo
  errorMensajeTipo.textContent = mensaje
  modalErrorTipo.showModal()
}
