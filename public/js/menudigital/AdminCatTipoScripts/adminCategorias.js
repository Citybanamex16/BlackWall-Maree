console.log('adminCategorias.js cargado')

// Referencias DOM - Categorías
const btnNuevaCategoria = document.getElementById('btnNuevaCategoria')
const modalRegistroCategoria = document.getElementById('ModalRegistroCategoria')
const btnCerrarRegistroCategoria = document.getElementById('btnCerrarRegistroCategoria')
const btnConfirmarRegistroCategoria = document.getElementById('btnConfirmarRegistroCategoria')
const inputNombreCategoria = document.getElementById('inputNombreCategoria')

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
        </tr>
      </thead>
    `
    const tbody = document.createElement('tbody')

    categorias.forEach(cat => {
      const tr = document.createElement('tr')
      tr.innerHTML = `
        <td style="font-weight:500;">${cat.Nombre}</td>
      `
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

  datosCategoriaParaEnviar = { Nombre: nombre }
  modalRegistroCategoria.close()
  mostrarResumenCategoria(nombre)
})

function mostrarResumenCategoria (nombre) {
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
