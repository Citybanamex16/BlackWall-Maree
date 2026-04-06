console.log('adminIngredientes.js cargadouu')

// Referencias del DOM
const btnRegistrar = document.getElementById('btnRegistrarIngrediente')
const modalRegistro = document.getElementById('ModalRegistroIngrediente')
const btnCerrarRegistro = document.getElementById('btnCerrarRegistro')
const btnConfirmarRegistro = document.getElementById('btnConfirmarRegistro')

const inputNombre = document.getElementById('inputNombre')
const selectCategoria = document.getElementById('selectCategoria')
const inputPrecio = document.getElementById('inputPrecio')
const inputTipo = document.getElementById('inputTipo')
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

// Cuando carga la pagina

document.addEventListener('DOMContentLoaded', () => {
  cargarTablaIngredientes()
  cargarCategorias()
})

// Tabluki
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
          <th>Precio</th>
          <th>Tipo</th>
          <th>Estado</th>
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    ingredientes.forEach(ing => {
      const tr = document.createElement('tr')

      const badgeEstado = ing.Activo
        ? '<span class="badge badge-activo">Disponible</span>'
        : '<span class="badge badge-inactivo">Inactivo</span>'

      tr.innerHTML = `
        <td class="muted" style="font-size:12px;font-family:monospace;">${ing.ID_Insumo}</td>
        <td style="font-weight:500;">${ing.Nombre}</td>
        <td><span class="badge badge-cat">${ing.Categoría}</span></td>
        <td style="color:#b5956a;font-weight:500;">$${parseFloat(ing.Precio).toFixed(2)}</td>
        <td class="muted">${ing.Tipo ?? '—'}</td>
        <td>${badgeEstado}</td>
      `
      tbody.appendChild(tr)
    })

    tabla.appendChild(tbody)
    tablaContainer.innerHTML = ''
    tablaContainer.appendChild(tabla)
  } catch (error) {
    console.error('Error cargando tabla:', error)
    tablaContainer.innerHTML = '<div class="ing-empty" style="color:#a03020;">Error al cargar ingredientes.</div>'
  }
}

// Categorias
async function cargarCategorias () {
  try {
    const res = await fetch('/admin/api/ingredientes/categorias')
    if (!res.ok) throw new Error('Error al obtener categorías')

    const obj = await res.json()
    const categorias = obj.data

    selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>'
    categorias.forEach(cat => {
      const opt = document.createElement('option')
      opt.value = cat.Nombre
      opt.textContent = cat.Nombre
      selectCategoria.appendChild(opt)
    })
  } catch (error) {
    console.error('Error cargando categorías:', error)
    selectCategoria.innerHTML = '<option value="">Error al cargar</option>'
  }
}

// Abrir formulario
btnRegistrar.addEventListener('click', (e) => {
  e.preventDefault()
  limpiarFormulario()
  modalRegistro.showModal()
})

btnCerrarRegistro.addEventListener('click', (e) => {
  e.preventDefault()
  modalRegistro.close()
})

// Validaci´ón nombre
btnConfirmarRegistro.addEventListener('click', async (e) => {
  e.preventDefault()

  const datos = obtenerDatosFormulario()

  // Valida campos vacíos
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
    console.error(error)
    return
  }

  // Verifica duplicados (nombre)
  try {
    const resNombre = await fetch(`/admin/api/ingredientes/verificarNombre?nombre=${encodeURIComponent(datos.Nombre)}`)
    const objNombre = await resNombre.json()

    if (objNombre.existe) {
      mostrarError('Ingrediente ya existente', `Ya existe un ingrediente con el nombre "${datos.Nombre}".`)
      return
    }
  } catch (error) {
    mostrarError('Error de verificación', 'No se pudo verificar el nombre del ingrediente.')
    console.error(error)
    return
  }

  // Resumen
  datosParaEnviar = datos
  modalRegistro.close()
  mostrarResumen(datos)
})

// Resumen final
function mostrarResumen (datos) {
  resumenContenido.innerHTML = ''

  const campos = [
    { label: 'Nombre', value: datos.Nombre },
    { label: 'Categoría', value: datos.Categoría },
    { label: 'Precio', value: `$${parseFloat(datos.Precio).toFixed(2)}` },
    { label: 'Tipo', value: datos.Tipo || '—' },
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

btnVolverFormulario.addEventListener('click', (e) => {
  e.preventDefault()
  modalResumen.close()
  modalRegistro.showModal()
})

// Guardado en BD
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
    console.error(error)
  }
})

// Cerrado de los modales
btnCerrarError.addEventListener('click', () => modalError.close())

btnCerrarExito.addEventListener('click', () => {
  modalExito.close()
  datosParaEnviar = null
})

// Helpers
function obtenerDatosFormulario () {
  return {
    Nombre: inputNombre.value.trim(),
    Categoría: selectCategoria.value,
    Precio: inputPrecio.value,
    Tipo: inputTipo.value.trim(),
    Imagen: inputImagen.value.trim(),
    Activo: checkActivo.checked
  }
}

function limpiarFormulario () {
  inputNombre.value = ''
  selectCategoria.value = ''
  inputPrecio.value = ''
  inputTipo.value = ''
  inputImagen.value = ''
  checkActivo.checked = true
}

function mostrarError (titulo, mensaje) {
  errorTitulo.textContent = titulo
  errorMensaje.textContent = mensaje
  modalError.showModal()
}
