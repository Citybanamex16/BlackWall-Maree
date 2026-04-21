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

// Tabla tipos
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
          <th></th>
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    tipos.forEach(tipo => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td style="font-weight:500;">${tipo.nombre}</td>
        <td><button class="btn-eliminar" data-nombre="${tipo.nombre}">Eliminar</button></td>
      `
      tr.style.cursor = 'pointer'

      tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        abrirModalEliminarTipo(tipo.nombre)
      })

      tr.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) return
        abrirModalEditarTipo(tipo.nombre)
      })

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

// Modal Editar Tipo
const modalEditarTipo = document.getElementById('ModalEditarTipo')
const editarSubtituloTipo = document.getElementById('editarSubtituloTipo')
const editNombreTipo = document.getElementById('editNombreTipo')
const editarTipoEnUso = document.getElementById('editarTipoEnUso')
const btnGuardarEditarTipo = document.getElementById('btnGuardarEditarTipo')
const btnCancelarEditarTipo = document.getElementById('btnCancelarEditarTipo')

let nombreOriginalTipo = null

async function abrirModalEditarTipo (nombre) {
  nombreOriginalTipo = nombre
  editarSubtituloTipo.textContent = `Editando: ${nombre}`
  editNombreTipo.value = nombre
  editarTipoEnUso.style.display = 'none'
  editarTipoEnUso.innerHTML = ''

  try {
    const res = await fetch(`/admin/api/tipos/${encodeURIComponent(nombre)}/verificarEnUso`)
    const obj = await res.json()
    if (obj.enUso) {
      editarTipoEnUso.style.display = 'block'
      editarTipoEnUso.innerHTML = `
        ⚠️ Este tipo está siendo usado por
        <strong>${obj.totalProductos}</strong> producto(s).
        Al renombrarlo se actualizarán todos.
      `
    }
  } catch (error) {
    console.error('Error verificando uso:', error)
  }

  modalEditarTipo.showModal()
}

btnCancelarEditarTipo.addEventListener('click', () => {
  modalEditarTipo.close()
  nombreOriginalTipo = null
})

btnGuardarEditarTipo.addEventListener('click', async () => {
  if (!nombreOriginalTipo) return

  const nuevoNombre = editNombreTipo.value.trim()

  if (!nuevoNombre) {
    mostrarErrorTipo('Campo incompleto', 'El nombre es obligatorio.')
    return
  }

  if (nuevoNombre !== nombreOriginalTipo) {
    try {
      const resVerif = await fetch(`/admin/api/tipos/verificarNombre?nombre=${encodeURIComponent(nuevoNombre)}`)
      const objVerif = await resVerif.json()
      if (objVerif.existe) {
        mostrarErrorTipo('Nombre duplicado', `Ya existe un tipo con el nombre "${nuevoNombre}".`)
        return
      }
    } catch (error) {
      mostrarErrorTipo('Error de verificación', 'No se pudo verificar el nombre.')
      return
    }
  }

  try {
    const res = await fetch(`/admin/api/tipos/${encodeURIComponent(nombreOriginalTipo)}/actualizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoNombre })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error del servidor')
    }

    const obj = await res.json()

    if (obj.success) {
      modalEditarTipo.close()
      exitoTituloTipo.textContent = 'Tipo actualizado'
      exitoMensajeTipo.textContent = 'Los cambios fueron guardados correctamente.'
      modalExitoTipo.showModal()
      cargarTablaTipos()
    } else {
      mostrarErrorTipo('Error al actualizar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorTipo('Error al modificar', error.message)
  } finally {
    nombreOriginalTipo = null
  }
})

// Modal Eliminar Tipo
const modalEliminarTipo = document.getElementById('ModalEliminarTipo')
const eliminarNombreTipo = document.getElementById('eliminarNombreTipo')
const eliminarAdvertenciaTipo = document.getElementById('eliminarAdvertenciaTipo')
const btnConfirmarEliminarTipo = document.getElementById('btnConfirmarEliminarTipo')
const btnCancelarEliminarTipo = document.getElementById('btnCancelarEliminarTipo')

let nombreParaEliminarTipo = null

async function abrirModalEliminarTipo (nombre) {
  nombreParaEliminarTipo = nombre
  eliminarNombreTipo.textContent = `¿Eliminar "${nombre}"?`
  eliminarAdvertenciaTipo.innerHTML = '<p style="color:#888;font-size:13px;">Verificando uso...</p>'
  btnConfirmarEliminarTipo.disabled = false
  modalEliminarTipo.showModal()

  try {
    const res = await fetch(`/admin/api/tipos/${encodeURIComponent(nombre)}/verificarEnUso`)
    const obj = await res.json()

    if (obj.enUso) {
      eliminarAdvertenciaTipo.innerHTML = `
        <div style="background:#fdf8f2;border:1px solid #e0c9a8;border-radius:8px;padding:14px;margin-bottom:4px;">
          <p style="font-size:13px;color:#a03020;font-weight:600;margin-bottom:4px;">No se puede eliminar</p>
          <p style="font-size:13px;color:#555;margin:0;">
            Este tipo está siendo usado por <strong>${obj.totalProductos}</strong> producto(s).
          </p>
        </div>
      `
      btnConfirmarEliminarTipo.disabled = true
    } else {
      eliminarAdvertenciaTipo.innerHTML = '<p style="font-size:13px;color:#888;">Este tipo no está en uso.</p>'
    }
  } catch (error) {
    eliminarAdvertenciaTipo.innerHTML = '<p style="font-size:13px;color:#a03020;">Error al verificar uso.</p>'
  }
}

btnCancelarEliminarTipo.addEventListener('click', () => {
  modalEliminarTipo.close()
  nombreParaEliminarTipo = null
})

btnConfirmarEliminarTipo.addEventListener('click', async () => {
  if (!nombreParaEliminarTipo) return

  try {
    const res = await fetch(`/admin/api/tipos/${encodeURIComponent(nombreParaEliminarTipo)}/eliminar`, {
      method: 'DELETE'
    })
    const obj = await res.json()

    if (obj.success) {
      modalEliminarTipo.close()
      exitoTituloTipo.textContent = 'Tipo eliminado'
      exitoMensajeTipo.textContent = 'El tipo fue eliminado del catálogo.'
      modalExitoTipo.showModal()
      cargarTablaTipos()
    } else {
      mostrarErrorTipo('Error al eliminar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorTipo('Error interno', `${error}`)
  } finally {
    nombreParaEliminarTipo = null
  }
})
