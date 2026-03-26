/* global alert, location */

// eslint-disable-next-line no-unused-vars
const abrirModal = () => {
  document.getElementById('modal-evento').classList.add('is-active')
}

// eslint-disable-next-line no-unused-vars
const cargarYMostrarModal = async () => {
  const btn = document.getElementById('btn-registrar-evento')
  btn.classList.add('is-loading')

  try {
    const response = await fetch('/admin/eventos/api/catalogos')
    const result = await response.json()

    if (result.success) {
      const { promociones, royalties, productos } = result.data
      poblarSelect('promociones', promociones)
      poblarSelect('royalty', royalties)
      poblarSelect('productos', productos)

      // Una vez lleno, mostramos el modal
      document.getElementById('modal-evento').classList.add('is-active')
    }
  } catch (error) {
    console.error('Error al cargar catálogos:', error)
    alert('No se pudieron cargar las promociones o productos.')
  } finally {
    btn.classList.remove('is-loading')
  }
}

// Función helper para no repetir código
// eslint-disable-next-line no-unused-vars
function poblarSelect (idSelect, lista) {
  const select = document.getElementById(idSelect)
  select.innerHTML = ''

  lista.forEach(item => {
    const option = document.createElement('option')
    option.value = item.id
    option.textContent = item.nombre
    select.appendChild(option)
  })
}

// eslint-disable-next-line no-unused-vars
const cerrarModal = () => {
  document.getElementById('modal-evento').classList.remove('is-active')
}

// Función para capturar los IDs seleccionados
// eslint-disable-next-line no-unused-vars
const getSelectedValues = (id) => {
  const select = document.getElementById(id)
  return Array.from(select.selectedOptions).map(opt => opt.value)
}

// eslint-disable-next-line no-unused-vars
function validarFormulario (datos) {
  let esValido = true
  document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'))
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())

  if (!datos.nombre || datos.nombre.trim() === '') {
    marcarError('nombre', 'El nombre es obligatorio')
    esValido = false
  }

  if (datos.promociones.length === 0) {
    marcarError('selectPromos', 'Debes seleccionar al menos una promoción')
    esValido = false
  }

  return esValido
}

// eslint-disable-next-line no-unused-vars
function marcarError (id, mensaje) {
  const elemento = document.getElementById(id)
  elemento.classList.add('is-danger')

  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje
  elemento.closest('.control').appendChild(help)
}

// eslint-disable-next-line no-unused-vars
const guardarEvento = () => {
  const datos = {
    nombre: document.getElementById('nombre').value,
    descripcion: 'Evento Marée',
    fechaInicio: document.getElementById('fechaInicio').value,
    fechaFin: document.getElementById('fechaFin').value,
    promociones: getSelectedValues('promociones'),
    royalty: getSelectedValues('royalty'),
    productos: getSelectedValues('productos')
  }

  let error = false
  if (!datos.nombre) {
    document.getElementById('nombre').classList.add('is-danger')
    error = true
  }

  if (!datos.descripcion) {
    document.getElementById('descripcion').classList.add('is-danger')
    error = true
  }

  if (!datos.fechaInicio) {
    document.getElementById('fechaInicio').classList.add('is-danger')
    error = true
  }

  if (!datos.fechaFin) {
    document.getElementById('fechaFin').classList.add('is-danger')
    error = true
  }

  if (datos.promociones.length === 0) {
    document.getElementById('promociones').closest('.select').classList.add('is-danger')
    error = true
  }

  if (datos.royalty.length === 0) {
    document.getElementById('royalty').closest('.select').classList.add('is-danger')
    error = true
  }

  if (datos.productos.length === 0) {
    document.getElementById('productos').closest('.select').classList.add('is-danger')
    error = true
  }

  if (error) return // Detenemos si algo falta

  // 3. Feedback de carga (Opcional pero recomendado)
  const btnGuardar = document.querySelector('.button.is-primary')
  btnGuardar.classList.add('is-loading')

  fetch('/admin/eventos/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert('¡Listo! ' + data.message)
        cerrarModal()
        location.reload()
      } else {
        alert('Error: ' + data.message)
      }
    })
    .catch(err => console.error('Error en la petición:', err))
}
