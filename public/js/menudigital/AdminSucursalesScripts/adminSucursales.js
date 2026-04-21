console.log('adminSucursales.js cargado')

const btnNuevaSucursal = document.getElementById('btnNuevaSucursal')
const modalRegistroSucursal = document.getElementById('ModalRegistroSucursal')
const btnCerrarRegistroSucursal = document.getElementById('btnCerrarRegistroSucursal')
const btnConfirmarRegistroSucursal = document.getElementById('btnConfirmarRegistroSucursal')

const inputNombreSuc = document.getElementById('inputNombreSuc')
const inputCiudadSuc = document.getElementById('inputCiudadSuc')
const inputEstadoSuc = document.getElementById('inputEstadoSuc')
const inputPaisSuc = document.getElementById('inputPaisSuc')
const inputMunicipioSuc = document.getElementById('inputMunicipioSuc')
const inputCalleSuc = document.getElementById('inputCalleSuc')
const inputLongitudSuc = document.getElementById('inputLongitudSuc')
const inputLatitudSuc = document.getElementById('inputLatitudSuc')

const modalResumenSucursal = document.getElementById('ModalResumenSucursal')
const resumenContenidoSucursal = document.getElementById('resumenContenidoSucursal')
const btnConfirmarCreacionSucursal = document.getElementById('btnConfirmarCreacionSucursal')
const btnVolverFormularioSucursal = document.getElementById('btnVolverFormularioSucursal')

const modalErrorSuc = document.getElementById('ModalErrorSuc')
const errorTituloSuc = document.getElementById('errorTituloSuc')
const errorMensajeSuc = document.getElementById('errorMensajeSuc')
const btnCerrarErrorSuc = document.getElementById('btnCerrarErrorSuc')

const modalExitoSuc = document.getElementById('ModalExitoSuc')
const exitoTituloSuc = document.getElementById('exitoTituloSuc')
const exitoMensajeSuc = document.getElementById('exitoMensajeSuc')
const btnCerrarExitoSuc = document.getElementById('btnCerrarExitoSuc')

const tablaSucursalesContainer = document.getElementById('tablaSucursalesContainer')

let datosSucursalParaEnviar = null

document.addEventListener('DOMContentLoaded', () => {
  cargarTablaSucursales()
})

// Tabla Sucursales
async function cargarTablaSucursales () {
  try {
    const res = await fetch('/admin/api/sucursales')
    if (!res.ok) throw new Error('Error al obtener sucursales')
    const obj = await res.json()
    const sucursales = obj.data

    if (!sucursales || sucursales.length === 0) {
      tablaSucursalesContainer.innerHTML = '<div class="ing-empty">No hay sucursales registradas aún.</div>'
      return
    }

    const tabla = document.createElement('table')
    tabla.className = 'ing-table'
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Ciudad</th>
          <th>Estado</th>
          <th>Calle</th>
          <th></th>
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    sucursales.forEach(suc => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td class="muted" style="font-size:12px;font-family:monospace;">${suc.ID_Sucursal}</td>
        <td style="font-weight:500;">${suc.Nombre}</td>
        <td>${suc.Ciudad}</td>
        <td>${suc.Estado}</td>
        <td>${suc.Calle}</td>
        <td><button class="btn-eliminar" data-id="${suc.ID_Sucursal}">Eliminar</button></td>
      `
      tr.style.cursor = 'pointer'

      tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        abrirModalEliminarSucursal(suc.ID_Sucursal, suc.Nombre)
      })

      tr.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) return
        abrirModalEditarSucursal(suc)
      })

      tbody.appendChild(tr)
    })

    tabla.appendChild(tbody)
    tablaSucursalesContainer.innerHTML = ''
    tablaSucursalesContainer.appendChild(tabla)
  } catch (error) {
    console.error('Error cargando tabla sucursales:', error)
    tablaSucursalesContainer.innerHTML = '<div class="ing-empty" style="color:#a03020;">Error al cargar sucursales.</div>'
  }
}

btnNuevaSucursal.addEventListener('click', (e) => {
  e.preventDefault()
  inputNombreSuc.value = ''
  inputCiudadSuc.value = ''
  inputEstadoSuc.value = ''
  inputPaisSuc.value = 'México'
  inputMunicipioSuc.value = ''
  inputCalleSuc.value = ''
  inputLongitudSuc.value = ''
  inputLatitudSuc.value = ''
  modalRegistroSucursal.showModal()
})

btnCerrarRegistroSucursal.addEventListener('click', (e) => {
  e.preventDefault()
  modalRegistroSucursal.close()
})

btnConfirmarRegistroSucursal.addEventListener('click', (e) => {
  e.preventDefault()

  const datos = {
    Nombre: inputNombreSuc.value.trim(),
    Ciudad: inputCiudadSuc.value.trim(),
    Estado: inputEstadoSuc.value.trim(),
    Pais: inputPaisSuc.value.trim(),
    Municipio: inputMunicipioSuc.value.trim(),
    Calle: inputCalleSuc.value.trim(),
    Longitud: inputLongitudSuc.value.trim() || null,
    Latitud: inputLatitudSuc.value.trim() || null
  }

  const obligatorios = ['Nombre', 'Ciudad', 'Estado', 'Pais', 'Municipio', 'Calle']
  for (const campo of obligatorios) {
    if (!datos[campo]) {
      mostrarErrorSuc('Campo incompleto', `El campo "${campo}" es obligatorio.`)
      return
    }
  }

  datosSucursalParaEnviar = datos
  modalRegistroSucursal.close()
  mostrarResumenSucursal(datos)
})

// Modal Resumen
function mostrarResumenSucursal (datos) {
  resumenContenidoSucursal.innerHTML = ''
  const campos = [
    ['Nombre', datos.Nombre],
    ['Ciudad', datos.Ciudad],
    ['Estado', datos.Estado],
    ['País', datos.Pais],
    ['Municipio', datos.Municipio],
    ['Calle', datos.Calle]
  ]
  if (datos.Longitud) campos.push(['Longitud', datos.Longitud])
  if (datos.Latitud) campos.push(['Latitud', datos.Latitud])

  campos.forEach(([label, valor]) => {
    const fila = document.createElement('div')
    fila.className = 'resumen-fila'
    const etiqueta = document.createElement('span')
    etiqueta.className = 'resumen-label'
    etiqueta.textContent = label
    const val = document.createElement('span')
    val.className = 'resumen-valor'
    val.textContent = valor
    fila.appendChild(etiqueta)
    fila.appendChild(val)
    resumenContenidoSucursal.appendChild(fila)
  })

  modalResumenSucursal.showModal()
}

btnVolverFormularioSucursal.addEventListener('click', (e) => {
  e.preventDefault()
  modalResumenSucursal.close()
  modalRegistroSucursal.showModal()
})

btnConfirmarCreacionSucursal.addEventListener('click', async (e) => {
  e.preventDefault()
  if (!datosSucursalParaEnviar) {
    mostrarErrorSuc('Error interno', 'No hay datos para guardar.')
    return
  }

  try {
    const res = await fetch('/admin/api/sucursales/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosSucursalParaEnviar)
    })
    const obj = await res.json()

    if (obj.success) {
      modalResumenSucursal.close()
      exitoTituloSuc.textContent = `¡${datosSucursalParaEnviar.Nombre} registrada!`
      exitoMensajeSuc.textContent = 'La sucursal fue guardada exitosamente.'
      modalExitoSuc.showModal()
      cargarTablaSucursales()
    } else {
      mostrarErrorSuc('Error al registrar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorSuc('Error interno', `Fallo al conectar con el servidor: ${error}`)
  }
})

btnCerrarErrorSuc.addEventListener('click', () => modalErrorSuc.close())

btnCerrarExitoSuc.addEventListener('click', () => {
  modalExitoSuc.close()
  datosSucursalParaEnviar = null
})

function mostrarErrorSuc (titulo, mensaje) {
  errorTituloSuc.textContent = titulo
  errorMensajeSuc.textContent = mensaje
  modalErrorSuc.showModal()
}

// Modal Editar
const modalEditarSucursal = document.getElementById('ModalEditarSucursal')
const editarSubtituloSucursal = document.getElementById('editarSubtituloSucursal')
const editNombreSuc = document.getElementById('editNombreSuc')
const editCiudadSuc = document.getElementById('editCiudadSuc')
const editEstadoSuc = document.getElementById('editEstadoSuc')
const editPaisSuc = document.getElementById('editPaisSuc')
const editMunicipioSuc = document.getElementById('editMunicipioSuc')
const editCalleSuc = document.getElementById('editCalleSuc')
const editLongitudSuc = document.getElementById('editLongitudSuc')
const editLatitudSuc = document.getElementById('editLatitudSuc')
const btnGuardarEditarSucursal = document.getElementById('btnGuardarEditarSucursal')
const btnCancelarEditarSucursal = document.getElementById('btnCancelarEditarSucursal')

let idSucursalEditando = null

function abrirModalEditarSucursal (suc) {
  idSucursalEditando = suc.ID_Sucursal
  editarSubtituloSucursal.textContent = `Editando: ${suc.Nombre}`
  editNombreSuc.value = suc.Nombre
  editCiudadSuc.value = suc.Ciudad
  editEstadoSuc.value = suc.Estado
  editPaisSuc.value = suc['País'] || suc.Pais || ''
  editMunicipioSuc.value = suc.Municipio
  editCalleSuc.value = suc.Calle
  editLongitudSuc.value = suc.Longitud || ''
  editLatitudSuc.value = suc.Latitud || ''
  modalEditarSucursal.showModal()
}

btnCancelarEditarSucursal.addEventListener('click', () => {
  modalEditarSucursal.close()
  idSucursalEditando = null
})

btnGuardarEditarSucursal.addEventListener('click', async () => {
  if (!idSucursalEditando) return

  const datos = {
    Nombre: editNombreSuc.value.trim(),
    Ciudad: editCiudadSuc.value.trim(),
    Estado: editEstadoSuc.value.trim(),
    Pais: editPaisSuc.value.trim(),
    Municipio: editMunicipioSuc.value.trim(),
    Calle: editCalleSuc.value.trim(),
    Longitud: editLongitudSuc.value.trim() || null,
    Latitud: editLatitudSuc.value.trim() || null
  }

  const obligatorios = ['Nombre', 'Ciudad', 'Estado', 'Pais', 'Municipio', 'Calle']
  for (const campo of obligatorios) {
    if (!datos[campo]) {
      mostrarErrorSuc('Campo incompleto', `El campo "${campo}" es obligatorio.`)
      return
    }
  }

  try {
    const res = await fetch(`/admin/api/sucursales/${idSucursalEditando}/actualizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error del servidor')
    }

    const obj = await res.json()

    if (obj.success) {
      modalEditarSucursal.close()
      exitoTituloSuc.textContent = 'Sucursal actualizada'
      exitoMensajeSuc.textContent = 'Los cambios fueron guardados correctamente.'
      modalExitoSuc.showModal()
      cargarTablaSucursales()
    } else {
      mostrarErrorSuc('Error al actualizar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorSuc('Error al modificar', error.message)
  } finally {
    idSucursalEditando = null
  }
})

// Modal Eliminar
const modalEliminarSucursal = document.getElementById('ModalEliminarSucursal')
const eliminarNombreSucursal = document.getElementById('eliminarNombreSucursal')
const eliminarAdvertenciaSucursal = document.getElementById('eliminarAdvertenciaSucursal')
const btnConfirmarEliminarSucursal = document.getElementById('btnConfirmarEliminarSucursal')
const btnCancelarEliminarSucursal = document.getElementById('btnCancelarEliminarSucursal')

let idParaEliminarSucursal = null

async function abrirModalEliminarSucursal (id, nombre) {
  idParaEliminarSucursal = id
  eliminarNombreSucursal.textContent = `¿Eliminar "${nombre}"?`
  eliminarAdvertenciaSucursal.innerHTML = '<p style="color:#888;font-size:13px;">Verificando...</p>'
  btnConfirmarEliminarSucursal.disabled = false
  modalEliminarSucursal.showModal()

  try {
    const res = await fetch(`/admin/api/sucursales/${id}/verificarEliminable`)
    const obj = await res.json()

    if (!obj.eliminable) {
      eliminarAdvertenciaSucursal.innerHTML = `
        <div style="background:#fdf8f2;border:1px solid #e0c9a8;border-radius:8px;padding:14px;margin-bottom:4px;">
          <p style="font-size:13px;color:#a03020;font-weight:600;margin-bottom:4px;">No se puede eliminar</p>
          <p style="font-size:13px;color:#555;margin:0;">
            Esta sucursal tiene <strong>${obj.totalTurnos}</strong> turno(s) asignado(s).
          </p>
        </div>
      `
      btnConfirmarEliminarSucursal.disabled = true
    } else {
      eliminarAdvertenciaSucursal.innerHTML = '<p style="font-size:13px;color:#888;">Esta sucursal no tiene turnos asignados.</p>'
    }
  } catch (error) {
    eliminarAdvertenciaSucursal.innerHTML = '<p style="font-size:13px;color:#a03020;">Error al verificar.</p>'
  }
}

btnCancelarEliminarSucursal.addEventListener('click', () => {
  modalEliminarSucursal.close()
  idParaEliminarSucursal = null
})

btnConfirmarEliminarSucursal.addEventListener('click', async () => {
  if (!idParaEliminarSucursal) return

  try {
    const res = await fetch(`/admin/api/sucursales/${idParaEliminarSucursal}/eliminar`, {
      method: 'DELETE'
    })
    const obj = await res.json()

    if (obj.success) {
      modalEliminarSucursal.close()
      exitoTituloSuc.textContent = 'Sucursal eliminada'
      exitoMensajeSuc.textContent = 'La sucursal fue eliminada correctamente.'
      modalExitoSuc.showModal()
      cargarTablaSucursales()
    } else {
      mostrarErrorSuc('Error al eliminar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorSuc('Error interno', `${error}`)
  } finally {
    idParaEliminarSucursal = null
  }
})
