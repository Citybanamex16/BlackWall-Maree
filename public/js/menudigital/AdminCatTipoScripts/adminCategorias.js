console.log('adminCategorias.js cargado')

// Referencias DOM - Categorías
const btnNuevaCategoria = document.getElementById('btnNuevaCategoria')
const modalRegistroCategoria = document.getElementById('ModalRegistroCategoria')
const btnCerrarRegistroCategoria = document.getElementById('btnCerrarRegistroCategoria')
const btnConfirmarRegistroCategoria = document.getElementById('btnConfirmarRegistroCategoria')
const inputNombreCategoria = document.getElementById('inputNombreCategoria')
const inputPermiteCremaBatidaCategoria = document.getElementById('inputPermiteCremaBatidaCategoria')

const modalResumenCategoria = document.getElementById('ModalResumenCategoria')
const resumenContenidoCategoria = document.getElementById('resumenContenidoCategoria')
const btnConfirmarCreacionCategoria = document.getElementById('btnConfirmarCreacionCategoria')
const btnVolverFormularioCategoria = document.getElementById('btnVolverFormularioCategoria')

const modalErrorCat = document.getElementById('ModalErrorCat')
const errorTituloCat = document.getElementById('errorTituloCat')
const errorMensajeCat = document.getElementById('errorMensajeCat')
const btnCerrarErrorCat = document.getElementById('btnCerrarErrorCat')

const modalExitoCat = document.getElementById('ModalExitoCat')
const exitoTituloCat = document.getElementById('exitoTituloCat')
const exitoMensajeCat = document.getElementById('exitoMensajeCat')
const btnCerrarExitoCat = document.getElementById('btnCerrarExitoCat')

const tablaCategoriasContainer = document.getElementById('tablaCategoriasContainer')

let datosCategoriaParaEnviar = null

document.addEventListener('DOMContentLoaded', () => {
  cargarTablaCategorias()
})

// Tablita de categorias
async function cargarTablaCategorias () {
  try {
    const res = await fetch('/admin/api/categorias')
    if (!res.ok) throw new Error('Error al obtener categorías')

    const obj = await res.json()
    const categorias = obj.data

    if (!categorias || categorias.length === 0) {
      tablaCategoriasContainer.innerHTML = '<div class="ing-empty">No hay categorías registradas aún.</div>'
      return
    }

    const tabla = document.createElement('table')
    tabla.className = 'ing-table'
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Crema batida</th>
          <th></th>
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    categorias.forEach(cat => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td style="font-weight:500;">${cat.Nombre}</td>
        <td>${cat.permiteCremaBatida ? 'Sí' : 'No'}</td>
        <td><button class="btn-eliminar" data-nombre="${cat.Nombre}">Eliminar</button></td>
      `
      tr.style.cursor = 'pointer'

      tr.querySelector('.btn-eliminar').addEventListener('click', () => {
        abrirModalEliminarCategoria(cat.Nombre)
      })

      tr.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) return
        abrirModalEditarCategoria(cat)
      })

      tbody.appendChild(tr)
    })

    tabla.appendChild(tbody)
    tablaCategoriasContainer.innerHTML = ''
    tablaCategoriasContainer.appendChild(tabla)
  } catch (error) {
    console.error('Error cargando tabla categorías:', error)
    tablaCategoriasContainer.innerHTML = '<div class="ing-empty" style="color:#a03020;">Error al cargar categorías.</div>'
  }
}

// Modal
btnNuevaCategoria.addEventListener('click', (e) => {
  e.preventDefault()
  inputNombreCategoria.value = ''
  inputPermiteCremaBatidaCategoria.checked = false
  modalRegistroCategoria.showModal()
})

btnCerrarRegistroCategoria.addEventListener('click', (e) => {
  e.preventDefault()
  modalRegistroCategoria.close()
})

// Validación y resumen
btnConfirmarRegistroCategoria.addEventListener('click', async (e) => {
  e.preventDefault()

  const nombre = inputNombreCategoria.value.trim()
  const permiteCremaBatida = inputPermiteCremaBatidaCategoria.checked

  if (!nombre) {
    mostrarErrorCat('Campo incompleto', 'El nombre de la categoría es obligatorio.')
    return
  }

  try {
    const res = await fetch(`/admin/api/categorias/verificarNombre?nombre=${encodeURIComponent(nombre)}`)
    const obj = await res.json()
    if (obj.existe) {
      mostrarErrorCat('Categoría ya existente', `Ya existe una categoría con el nombre "${nombre}".`)
      return
    }
  } catch (error) {
    mostrarErrorCat('Error de verificación', 'No se pudo verificar el nombre.')
    return
  }

  datosCategoriaParaEnviar = {
    Nombre: nombre,
    PermiteCremaBatida: permiteCremaBatida
  }
  modalRegistroCategoria.close()
  mostrarResumenCategoria(nombre, permiteCremaBatida)
})

function mostrarResumenCategoria (nombre, permiteCremaBatida) {
  resumenContenidoCategoria.innerHTML = ''

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
  resumenContenidoCategoria.appendChild(fila)

  const filaCrema = document.createElement('div')
  filaCrema.className = 'resumen-fila'
  filaCrema.innerHTML = `
    <span class="resumen-label">Crema batida</span>
    <span class="resumen-valor">${permiteCremaBatida ? 'Permitida' : 'No permitida'}</span>
  `
  resumenContenidoCategoria.appendChild(filaCrema)

  modalResumenCategoria.showModal()
}

btnVolverFormularioCategoria.addEventListener('click', (e) => {
  e.preventDefault()
  modalResumenCategoria.close()
  modalRegistroCategoria.showModal()
})

// Inserción en BD
btnConfirmarCreacionCategoria.addEventListener('click', async (e) => {
  e.preventDefault()

  if (!datosCategoriaParaEnviar) {
    mostrarErrorCat('Error interno', 'No hay datos para guardar.')
    return
  }

  try {
    const res = await fetch('/admin/api/categorias/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosCategoriaParaEnviar)
    })

    const obj = await res.json()

    if (obj.success) {
      modalResumenCategoria.close()
      exitoTituloCat.textContent = `¡${datosCategoriaParaEnviar.Nombre} registrada!`
      exitoMensajeCat.textContent = 'La categoría fue guardada exitosamente.'
      modalExitoCat.showModal()
      cargarTablaCategorias()
    } else {
      mostrarErrorCat('Error al registrar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorCat('Error interno', `Fallo al conectar con el servidor: ${error}`)
  }
})

// Modales error o exito
btnCerrarErrorCat.addEventListener('click', () => modalErrorCat.close())

btnCerrarExitoCat.addEventListener('click', () => {
  modalExitoCat.close()
  datosCategoriaParaEnviar = null
})

function mostrarErrorCat (titulo, mensaje) {
  errorTituloCat.textContent = titulo
  errorMensajeCat.textContent = mensaje
  modalErrorCat.showModal()
}

// Modal Editar Categoría
const modalEditarCategoria = document.getElementById('ModalEditarCategoria')
const editarSubtituloCategoria = document.getElementById('editarSubtituloCategoria')
const editNombreCategoria = document.getElementById('editNombreCategoria')
const editPermiteCremaBatidaCategoria = document.getElementById('editPermiteCremaBatidaCategoria')
const editarCategoriaEnUso = document.getElementById('editarCategoriaEnUso')
const btnGuardarEditarCategoria = document.getElementById('btnGuardarEditarCategoria')
const btnCancelarEditarCategoria = document.getElementById('btnCancelarEditarCategoria')

let nombreOriginalCategoria = null

async function abrirModalEditarCategoria (categoria) {
  nombreOriginalCategoria = categoria.Nombre
  editarSubtituloCategoria.textContent = `Editando: ${categoria.Nombre}`
  editNombreCategoria.value = categoria.Nombre
  editPermiteCremaBatidaCategoria.checked = Boolean(categoria.permiteCremaBatida)
  editarCategoriaEnUso.style.display = 'none'
  editarCategoriaEnUso.innerHTML = ''

  // Verificar si está en uso
  try {
    const res = await fetch(`/admin/api/categorias/${encodeURIComponent(categoria.Nombre)}/verificarEnUso`)
    const obj = await res.json()
    if (obj.enUso) {
      editarCategoriaEnUso.style.display = 'block'
      editarCategoriaEnUso.innerHTML = `
        ⚠️ Esta categoría está siendo usada por
        <strong>${obj.totalInsumos}</strong> insumo(s) y
        <strong>${obj.totalProductos}</strong> producto(s).
        Al renombrarla se actualizarán todos.
      `
    }
  } catch (error) {
    console.error('Error verificando uso:', error)
  }

  modalEditarCategoria.showModal()
}

btnCancelarEditarCategoria.addEventListener('click', () => {
  modalEditarCategoria.close()
  nombreOriginalCategoria = null
})

btnGuardarEditarCategoria.addEventListener('click', async () => {
  if (!nombreOriginalCategoria) return

  const nuevoNombre = editNombreCategoria.value.trim()
  const permiteCremaBatida = editPermiteCremaBatidaCategoria.checked

  if (!nuevoNombre) {
    mostrarErrorCat('Campo incompleto', 'El nombre es obligatorio.')
    return
  }

  // Verificar duplicado solo si se cambio el nombre
  if (nuevoNombre !== nombreOriginalCategoria) {
    try {
      const resVerif = await fetch(`/admin/api/categorias/verificarNombre?nombre=${encodeURIComponent(nuevoNombre)}`)
      const objVerif = await resVerif.json()
      if (objVerif.existe) {
        mostrarErrorCat('Nombre duplicado', `Ya existe una categoría con el nombre "${nuevoNombre}".`)
        return
      }
    } catch (error) {
      mostrarErrorCat('Error de verificación', 'No se pudo verificar el nombre.')
      return
    }
  }

  try {
    const res = await fetch(`/admin/api/categorias/${encodeURIComponent(nombreOriginalCategoria)}/actualizar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Nombre: nuevoNombre,
        PermiteCremaBatida: permiteCremaBatida
      })
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error del servidor')
    }

    const obj = await res.json()

    if (obj.success) {
      modalEditarCategoria.close()
      exitoTituloCat.textContent = 'Categoría actualizada'
      exitoMensajeCat.textContent = 'Los cambios fueron guardados correctamente.'
      modalExitoCat.showModal()
      cargarTablaCategorias()
    } else {
      mostrarErrorCat('Error al actualizar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorCat('Error al modificar', error.message)
  } finally {
    nombreOriginalCategoria = null
  }
})

// Modal Eliminar Categoría
const modalEliminarCategoria = document.getElementById('ModalEliminarCategoria')
const eliminarNombreCategoria = document.getElementById('eliminarNombreCategoria')
const eliminarAdvertenciaCategoria = document.getElementById('eliminarAdvertenciaCategoria')
const btnConfirmarEliminarCategoria = document.getElementById('btnConfirmarEliminarCategoria')
const btnCancelarEliminarCategoria = document.getElementById('btnCancelarEliminarCategoria')

let nombreParaEliminar = null

async function abrirModalEliminarCategoria (nombre) {
  nombreParaEliminar = nombre
  eliminarNombreCategoria.textContent = `¿Eliminar "${nombre}"?`
  eliminarAdvertenciaCategoria.innerHTML = '<p style="color:#888;font-size:13px;">Verificando uso...</p>'
  btnConfirmarEliminarCategoria.disabled = false
  modalEliminarCategoria.showModal()

  try {
    const res = await fetch(`/admin/api/categorias/${encodeURIComponent(nombre)}/verificarEnUso`)
    const obj = await res.json()

    if (obj.enUso) {
      eliminarAdvertenciaCategoria.innerHTML = `
        <div style="background:#fdf8f2;border:1px solid #e0c9a8;border-radius:8px;padding:14px;margin-bottom:4px;">
          <p style="font-size:13px;color:#a03020;font-weight:600;margin-bottom:4px;">No se puede eliminar</p>
          <p style="font-size:13px;color:#555;margin:0;">
            Esta categoría está siendo usada por <strong>${obj.totalInsumos}</strong> insumo(s)
            y <strong>${obj.totalProductos}</strong> producto(s).
          </p>
        </div>
      `
      btnConfirmarEliminarCategoria.disabled = true
    } else {
      eliminarAdvertenciaCategoria.innerHTML = '<p style="font-size:13px;color:#888;">Esta categoría no está en uso.</p>'
    }
  } catch (error) {
    eliminarAdvertenciaCategoria.innerHTML = '<p style="font-size:13px;color:#a03020;">Error al verificar uso.</p>'
  }
}

btnCancelarEliminarCategoria.addEventListener('click', () => {
  modalEliminarCategoria.close()
  nombreParaEliminar = null
})

btnConfirmarEliminarCategoria.addEventListener('click', async () => {
  if (!nombreParaEliminar) return

  try {
    const res = await fetch(`/admin/api/categorias/${encodeURIComponent(nombreParaEliminar)}/eliminar`, {
      method: 'DELETE'
    })
    const obj = await res.json()

    if (obj.success) {
      modalEliminarCategoria.close()
      exitoTituloCat.textContent = 'Categoría eliminada'
      exitoMensajeCat.textContent = 'La categoría fue eliminada del catálogo.'
      modalExitoCat.showModal()
      cargarTablaCategorias()
    } else {
      mostrarErrorCat('Error al eliminar', obj.message || 'Error desconocido')
    }
  } catch (error) {
    mostrarErrorCat('Error interno', `${error}`)
  } finally {
    nombreParaEliminar = null
  }
})
