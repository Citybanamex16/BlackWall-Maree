console.log('adminIngredientes.js cargadouu')
const canManageIngredients = window.canManageIngredients === true

// Referencias del DOM
const btnRegistrar = document.getElementById('btnRegistrarIngrediente')
const modalRegistro = document.getElementById('ModalRegistroIngrediente')
const btnCerrarRegistro = document.getElementById('btnCerrarRegistro')
const btnConfirmarRegistro = document.getElementById('btnConfirmarRegistro')

const inputNombre = document.getElementById('inputNombre')
const checksCategoriasContainer = document.getElementById('checksCategorias')
const checksTiposContainer = document.getElementById('checksTipos')
const inputPrecio = document.getElementById('inputPrecio')
const inputImagen = document.getElementById('inputImagen')
const checkActivo = document.getElementById('checkActivo')

const modalResumen = document.getElementById('ModalResumen')
const resumenContenido = document.getElementById('resumenContenido')
const btnConfirmarCreacion = document.getElementById('btnConfirmarCreacion')
const btnVolverFormulario = document.getElementById('btnVolverFormulario')

const modalError = document.getElementById('ModalError')
const errorTitulo = document.getElementById('errorTitulo')
const errorMensaje = document.getElementById('errorMensaje')
const btnCerrarError = document.getElementById('btnCerrarError')

const modalExito = document.getElementById('ModalExito')
const exitoTitulo = document.getElementById('exitoTitulo')
const exitoMensaje = document.getElementById('exitoMensaje')
const btnCerrarExito = document.getElementById('btnCerrarExito')

const tablaContainer = document.getElementById('tablaContainer')

let datosParaEnviar = null

// ─── Carga inicial ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  cargarTablaIngredientes()
  if (canManageIngredients) cargarCategorias()
})

// ─── Tabla ────────────────────────────────────────────────
async function cargarTablaIngredientes () {
  try {
    const res = await fetch('/admin/api/ingredientes')
    if (!res.ok) throw new Error('Error al obtener ingredientes')

    const obj = await res.json()
    const ingredientes = obj.data

    if (!ingredientes || ingredientes.length === 0) {
      tablaContainer.innerHTML = '<div class="ing-empty">No hay ingredientes registrados aún.</div>'
      return
    }

    const tabla = document.createElement('table')
    tabla.className = 'ing-table'
    tabla.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Tipos</th>
          <th>Precio</th>
          <th>Estado</th>
          <th></th>
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    ingredientes.forEach(ing => {
      const tr = document.createElement('tr')

      const badgeEstado = ing.Activo
        ? '<span class="badge badge-activo">Disponible</span>'
        : '<span class="badge badge-inactivo">Inactivo</span>'

      const cats = ing.categorias || [ing.Categoría]
      const badgesCats = cats.map(c => `<span class="badge badge-cat">${c}</span>`).join(' ')

      const tipos = ing.tipos || []
      const badgesTipos = tipos.length > 0
        ? tipos.map(t => `<span class="badge badge-cat" style="background:#f0e8d8;color:#8a6a3a;">${t}</span>`).join(' ')
        : '<span style="color:#ccc;font-size:12px;">—</span>'

      tr.innerHTML = `
        <td class="muted" style="font-size:12px;font-family:monospace;">${ing.ID_Insumo}</td>
        <td style="font-weight:500;">${ing.Nombre}</td>
        <td>${badgesCats}</td>
        <td>${badgesTipos}</td>
        <td style="color:#b5956a;font-weight:500;">$${parseFloat(ing.Precio).toFixed(2)}</td>
        <td>${badgeEstado}</td>
        <td>${canManageIngredients ? `<button class="btn-eliminar" data-id="${ing.ID_Insumo}" data-nombre="${ing.Nombre}">Eliminar</button>` : ''}</td>
      `
      tbody.appendChild(tr)

      if (canManageIngredients) {
        tr.querySelector('.btn-eliminar').addEventListener('click', (e) => {
          abrirModalEliminar(e.target.dataset.id, e.target.dataset.nombre)
        })
        tr.addEventListener('click', (e) => {
          if (e.target.classList.contains('btn-eliminar')) return
          abrirModalEditar(ing)
        })
      }
    })

    tabla.appendChild(tbody)
    tablaContainer.innerHTML = ''
    tablaContainer.appendChild(tabla)
  } catch (error) {
    console.error('Error cargando tabla:', error)
    tablaContainer.innerHTML = '<div class="ing-empty" style="color:#a03020;">Error al cargar ingredientes.</div>'
  }
}

// ─── Tipos dinámicos ──────────────────────────────────────

async function cargarTiposParaCategorias (cats, container, selectedTipos = []) {
  if (!cats || cats.length === 0) {
    container.innerHTML = '<span style="color:#999;font-size:13px;">Selecciona una categoría primero</span>'
    return
  }
  try {
    const qs = cats.map(c => encodeURIComponent(c)).join(',')
    const res = await fetch(`/admin/api/ingredientes/tiposPorCategorias?cats=${qs}`)
    const obj = await res.json()
    const tipos = obj.data || []

    if (tipos.length === 0) {
      container.innerHTML = '<span style="color:#999;font-size:13px;">No hay tipos para las categorías seleccionadas</span>'
      return
    }

    container.innerHTML = ''
    tipos.forEach(t => {
      const label = document.createElement('label')
      label.className = 'maree-checkbox-row'
      label.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:0;cursor:pointer;'
      const checked = selectedTipos.includes(t.nombre) ? 'checked' : ''
      label.innerHTML = `<input type="checkbox" class="tipo-check" value="${t.nombre}" ${checked}> ${t.nombre} <span style="font-size:11px;color:#aaa;">(${t.categoria})</span>`
      container.appendChild(label)
    })
  } catch (error) {
    console.error('Error cargando tipos:', error)
    container.innerHTML = '<span style="color:#a03020;font-size:13px;">Error al cargar tipos</span>'
  }
}

function getCatsSeleccionadas (checksContainer) {
  return Array.from(checksContainer.querySelectorAll('.cat-check-registro:checked, .cat-check-editar:checked')).map(c => c.value)
}

// ─── Categorías (registro) ────────────────────────────────
async function cargarCategorias () {
  try {
    const res = await fetch('/admin/api/ingredientes/categorias')
    if (!res.ok) throw new Error('Error al obtener categorías')

    const obj = await res.json()
    const categorias = obj.data

    checksCategoriasContainer.innerHTML = ''
    categorias.forEach(cat => {
      const label = document.createElement('label')
      label.className = 'maree-checkbox-row'
      label.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:0;cursor:pointer;'
      label.innerHTML = `<input type="checkbox" class="cat-check-registro" value="${cat.Nombre}"> ${cat.Nombre}`
      checksCategoriasContainer.appendChild(label)
    })

    // Listener: cuando cambia una categoría en el form de registro, recargar tipos
    checksCategoriasContainer.addEventListener('change', () => {
      const seleccionadas = Array.from(checksCategoriasContainer.querySelectorAll('.cat-check-registro:checked')).map(c => c.value)
      cargarTiposParaCategorias(seleccionadas, checksTiposContainer, [])
    })
  } catch (error) {
    console.error('Error cargando categorías:', error)
    checksCategoriasContainer.innerHTML = '<span style="color:red;font-size:13px;">Error al cargar</span>'
  }
}

// ─── Abrir formulario de registro ────────────────────────
if (canManageIngredients && btnRegistrar && modalRegistro) {
  btnRegistrar.addEventListener('click', (e) => {
    e.preventDefault()
    limpiarFormulario()
    modalRegistro.showModal()
  })

  btnCerrarRegistro.addEventListener('click', (e) => {
    e.preventDefault()
    modalRegistro.close()
  })
}

// ─── Validar y continuar al resumen ──────────────────────
if (canManageIngredients && btnConfirmarRegistro) {
  btnConfirmarRegistro.addEventListener('click', async (e) => {
    e.preventDefault()

    const datos = obtenerDatosFormulario()

    try {
      const resValidar = await fetch('/admin/api/ingredientes/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      })
      const objValidar = await resValidar.json()
      if (objValidar.camposVacios) {
        mostrarError('Campos incompletos', `El campo "${objValidar.campoFaltante}" es obligatorio.`)
        return
      }
    } catch (error) {
      mostrarError('Error de validación', 'No se pudo validar el formulario.')
      return
    }

    try {
      const resNombre = await fetch(`/admin/api/ingredientes/verificarNombre?nombre=${encodeURIComponent(datos.Nombre)}`)
      const objNombre = await resNombre.json()
      if (objNombre.existe) {
        mostrarError('Ingrediente ya existente', `Ya existe un ingrediente con el nombre "${datos.Nombre}".`)
        return
      }
    } catch (error) {
      mostrarError('Error de verificación', 'No se pudo verificar el nombre del ingrediente.')
      return
    }

    datosParaEnviar = datos
    modalRegistro.close()
    mostrarResumen(datos)
  })
}

// ─── Resumen ──────────────────────────────────────────────
function mostrarResumen (datos) {
  resumenContenido.innerHTML = ''

  const campos = [
    { label: 'Nombre', value: datos.Nombre },
    { label: 'Categorías', value: (datos.Categorias || []).join(', ') || '—' },
    { label: 'Tipos', value: (datos.Tipos || []).join(', ') || '—' },
    { label: 'Precio', value: `$${parseFloat(datos.Precio).toFixed(2)}` },
    { label: 'Imagen', value: datos.Imagen || '—' },
    { label: 'Disponible', value: datos.Activo ? 'Sí' : 'No' }
  ]

  campos.forEach(c => {
    const fila = document.createElement('div')
    fila.className = 'resumen-fila'
    const etiqueta = document.createElement('span')
    etiqueta.className = 'resumen-label'
    etiqueta.textContent = c.label
    const valor = document.createElement('span')
    valor.className = 'resumen-valor'
    valor.textContent = c.value
    fila.appendChild(etiqueta)
    fila.appendChild(valor)
    resumenContenido.appendChild(fila)
  })

  modalResumen.showModal()
}

if (canManageIngredients && btnVolverFormulario) {
  btnVolverFormulario.addEventListener('click', (e) => {
    e.preventDefault()
    modalResumen.close()
    modalRegistro.showModal()
  })
}

// ─── Guardar en BD ────────────────────────────────────────
if (canManageIngredients && btnConfirmarCreacion) {
  btnConfirmarCreacion.addEventListener('click', async (e) => {
    e.preventDefault()

    if (!datosParaEnviar) {
      mostrarError('Error interno', 'No hay datos para guardar.')
      return
    }

    try {
      const res = await fetch('/admin/api/ingredientes/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaEnviar)
      })
      const obj = await res.json()

      if (obj.success) {
        modalResumen.close()
        exitoTitulo.textContent = `¡${datosParaEnviar.Nombre} registrado!`
        exitoMensaje.textContent = 'El ingrediente fue guardado exitosamente en el catálogo.'
        modalExito.showModal()
        cargarTablaIngredientes()
      } else {
        mostrarError('Error al registrar', obj.message || 'Error desconocido')
      }
    } catch (error) {
      mostrarError('Error interno', `Fallo al conectar con el servidor: ${error}`)
    }
  })
}

// ─── Modales utilitarios ──────────────────────────────────
btnCerrarError.addEventListener('click', () => modalError.close())

btnCerrarExito.addEventListener('click', () => {
  modalExito.close()
  datosParaEnviar = null
})

// ─── Helpers ──────────────────────────────────────────────
function obtenerDatosFormulario () {
  const cats = checksCategoriasContainer.querySelectorAll('.cat-check-registro:checked')
  const tipos = checksTiposContainer.querySelectorAll('.tipo-check:checked')
  return {
    Nombre: inputNombre.value.trim(),
    Categorias: Array.from(cats).map(c => c.value),
    Tipos: Array.from(tipos).map(t => t.value),
    Precio: inputPrecio.value,
    Imagen: inputImagen.value.trim(),
    Activo: checkActivo.checked
  }
}

function limpiarFormulario () {
  inputNombre.value = ''
  checksCategoriasContainer.querySelectorAll('.cat-check-registro').forEach(c => { c.checked = false })
  checksTiposContainer.innerHTML = '<span style="color:#999;font-size:13px;">Selecciona una categoría primero</span>'
  inputPrecio.value = ''
  inputImagen.value = ''
  checkActivo.checked = true
}

function mostrarError (titulo, mensaje) {
  errorTitulo.textContent = titulo
  errorMensaje.textContent = mensaje
  modalError.showModal()
}

// ─── Modal eliminar ───────────────────────────────────────
const modalEliminar = document.getElementById('ModalEliminar')
const eliminarNombre = document.getElementById('eliminarNombre')
const eliminarAdvertencia = document.getElementById('eliminarAdvertencia')
const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar')
const btnCancelarEliminar = document.getElementById('btnCancelarEliminar')

let idParaEliminar = null

async function abrirModalEliminar (id, nombre) {
  idParaEliminar = id
  eliminarNombre.textContent = `¿Eliminar "${nombre}"?`
  eliminarAdvertencia.innerHTML = '<p style="color:#888;font-size:13px;">Verificando platillos vinculados...</p>'
  modalEliminar.showModal()

  try {
    const res = await fetch(`/admin/api/ingredientes/${id}/validarEliminable`)
    const obj = await res.json()

    if (obj.vinculado) {
      eliminarAdvertencia.innerHTML = `
        <div style="background:#fdf8f2;border:1px solid #e0c9a8;border-radius:8px;padding:14px;margin-bottom:4px;">
          <p style="font-size:13px;color:#b5956a;font-weight:600;margin-bottom:8px;">⚠️ Este ingrediente está en los siguientes platillos:</p>
          <ul style="font-size:13px;color:#555;padding-left:16px;margin:0;">
            ${obj.productos.map(p => `<li>${p}</li>`).join('')}
          </ul>
          <p style="font-size:12px;color:#999;margin-top:8px;">Al eliminar, se quitará de todos ellos.</p>
        </div>
      `
    } else {
      eliminarAdvertencia.innerHTML = '<p style="font-size:13px;color:#888;">Este ingrediente no está vinculado a ningún platillo.</p>'
    }
  } catch (error) {
    eliminarAdvertencia.innerHTML = '<p style="font-size:13px;color:#a03020;">Error al verificar vínculos.</p>'
  }
}

if (canManageIngredients && btnCancelarEliminar) {
  btnCancelarEliminar.addEventListener('click', () => {
    modalEliminar.close()
    idParaEliminar = null
  })
}

if (canManageIngredients && btnConfirmarEliminar) {
  btnConfirmarEliminar.addEventListener('click', async () => {
    if (!idParaEliminar) return

    try {
      const res = await fetch(`/admin/api/ingredientes/${idParaEliminar}/eliminar`, { method: 'DELETE' })
      const obj = await res.json()

      if (obj.success) {
        modalEliminar.close()
        exitoTitulo.textContent = 'Ingrediente eliminado'
        exitoMensaje.textContent = 'El ingrediente fue eliminado correctamente del catálogo.'
        modalExito.showModal()
        cargarTablaIngredientes()
      } else {
        mostrarError('Error al eliminar', obj.message || 'Error desconocido')
      }
    } catch (error) {
      mostrarError('Error interno', `${error}`)
    } finally {
      idParaEliminar = null
    }
  })
}

// ─── Modal editar ─────────────────────────────────────────
const modalEditar = document.getElementById('ModalEditar')
const editarSubtitulo = document.getElementById('editarSubtitulo')
const editNombre = document.getElementById('editNombre')
const editChecksCatContainer = document.getElementById('editChecksCategorias')
const editChecksTiposContainer = document.getElementById('editChecksTipos')
const editPrecio = document.getElementById('editPrecio')
const editImagen = document.getElementById('editImagen')
const editActivo = document.getElementById('editActivo')
const btnGuardarEditar = document.getElementById('btnGuardarEditar')
const btnCancelarEditar = document.getElementById('btnCancelarEditar')

let idParaEditar = null
let nombreOriginalEditar = null

// Listener de categorías en editar — declarado UNA sola vez
editChecksCatContainer.addEventListener('change', () => {
  const seleccionadas = Array.from(editChecksCatContainer.querySelectorAll('.cat-check-editar:checked')).map(c => c.value)
  const tiposActuales = Array.from(editChecksTiposContainer.querySelectorAll('.tipo-check:checked')).map(c => c.value)
  cargarTiposParaCategorias(seleccionadas, editChecksTiposContainer, tiposActuales)
})

async function abrirModalEditar (ing) {
  idParaEditar = ing.ID_Insumo
  nombreOriginalEditar = ing.Nombre
  editarSubtitulo.textContent = `Editando: ${ing.Nombre}`

  editNombre.value = ing.Nombre
  editPrecio.value = ing.Precio
  editImagen.value = ing.Imagen ?? ''
  editActivo.checked = ing.Activo === 1

  const ingCategorias = ing.categorias || [ing.Categoría]
  const ingTipos = ing.tipos || []

  // Cargar checkboxes de categorías
  const resCats = await fetch('/admin/api/ingredientes/categorias')
  const objCats = await resCats.json()
  editChecksCatContainer.innerHTML = ''
  objCats.data.forEach(cat => {
    const label = document.createElement('label')
    label.className = 'maree-checkbox-row'
    label.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin:0;cursor:pointer;'
    const checked = ingCategorias.includes(cat.Nombre) ? 'checked' : ''
    label.innerHTML = `<input type="checkbox" class="cat-check-editar" value="${cat.Nombre}" ${checked}> ${cat.Nombre}`
    editChecksCatContainer.appendChild(label)
  })

  // Cargar tipos según las categorías actuales del ingrediente
  await cargarTiposParaCategorias(ingCategorias, editChecksTiposContainer, ingTipos)

  modalEditar.showModal()
}

if (canManageIngredients && btnCancelarEditar) {
  btnCancelarEditar.addEventListener('click', () => {
    modalEditar.close()
    idParaEditar = null
  })
}

if (canManageIngredients && btnGuardarEditar) {
  btnGuardarEditar.addEventListener('click', async () => {
    if (!idParaEditar) return

    const nombre = editNombre.value.trim()
    const precio = parseFloat(editPrecio.value)
    const categorias = Array.from(editChecksCatContainer.querySelectorAll('.cat-check-editar:checked')).map(c => c.value)
    const tipos = Array.from(editChecksTiposContainer.querySelectorAll('.tipo-check:checked')).map(c => c.value)

    if (!nombre || !categorias.length || !editPrecio.value) {
      mostrarError('Campos incompletos', 'Nombre, al menos una Categoría y Precio son obligatorios.')
      return
    }
    if (isNaN(precio) || precio < 0) {
      mostrarError('Precio inválido', 'El precio debe ser un número positivo.')
      return
    }

    if (nombre !== nombreOriginalEditar) {
      try {
        const resNombre = await fetch(`/admin/api/ingredientes/verificarNombre?nombre=${encodeURIComponent(nombre)}`)
        const objNombre = await resNombre.json()
        if (objNombre.existe) {
          mostrarError('Nombre duplicado', `Ya existe un ingrediente con el nombre "${nombre}".`)
          return
        }
      } catch (error) {
        mostrarError('Error de verificación', 'No se pudo verificar el nombre.')
        return
      }
    }

    const body = {
      Nombre: nombre,
      Categorias: categorias,
      Tipos: tipos,
      Precio: precio,
      Activo: editActivo.checked,
      Imagen: editImagen.value.trim()
    }

    try {
      const res = await fetch(`/admin/api/ingredientes/${idParaEditar}/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'La base de datos no está disponible.')
      }

      const obj = await res.json()

      if (obj.success) {
        modalEditar.close()
        exitoTitulo.textContent = 'Ingrediente actualizado'
        exitoMensaje.textContent = 'Los cambios fueron guardados correctamente.'
        modalExito.showModal()
        cargarTablaIngredientes()
      } else {
        mostrarError('Error al actualizar', obj.message || 'Error desconocido')
      }
    } catch (error) {
      mostrarError('Error al intentar modificar ingrediente', error.message)
    } finally {
      idParaEditar = null
    }
  })
}
