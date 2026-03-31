/* eslint-env browser */
/* eslint-disable no-unused-vars */
// Function to know if the input written is correct

// Modal
const abrirModal = () => {
  document.getElementById('modal-promocion').classList.add('is-active')
}

const cargarYMostrarModal = async () => {
  const btn = document.getElementById('btn-registrar-evento')
  btn.classList.add('is-loading')

  try {
    const response = await fetch('/admin/eventos/api/catalogos')
    const result = await response.json()

    if (result.success) {
      console.log('Se logro cargar el modelo')
      const { promociones, royalties, platillos } = result.data
      poblarSelect('promociones', promociones)
      poblarSelect('royalties', royalties)
      poblarSelect('platillos', platillos)
      // After filling the forms, we show the modal
      document.getElementById('modal-evento').classList.add('is-active')
    }
  } catch (error) {
    console.error('Mistake to load catalogue', error)
    alert('No se puede cargar las promociones o platillos que se buscan')
  } finally {
    btn.classList.remove('is-loading')
  }
}

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

const cerrarModal = () => {
  document.getElementById('modal-promocion').classList.remove('is-active')
  limpiarFormulario()
}

const getSelectedValues = (id) => {
  const select = document.getElementById(id)
  return Array.from(select.selectedOptions).map(opt => opt.value)
}
function validarFormulario (datos) {
  let esValido = true
  // We clean previus mistakes
  // finds all the elements with the classes inputs or select
  document.querySelectorAll('.input, .select').forEach(el => el.classList.remove('is-danger'))
  // turns the field red to signal a mistake in the input
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())

  // Validate name
  // cleans the name and checks if it is empty
  // validates name
  if (!datos.nombre || datos.nombre.trim() === '') {
    marcarError('nombre', 'El descuento es obligatorio')
    esValido = false
  }
  // vatidates Discount
  if (!datos.descuento || datos.descuento.trim() === '') {
    marcarError('descuento', 'El nombre es obligatorio')
    esValido = false
  }
  // This makes this in HTML: <p class="help is-danger">El nombre es obligatorio</p>
  // validates Conditions
  if (!datos.condiciones || datos.condiciones.trim() === '') {
    marcarError('condiciones', 'Las condiciones no son válidas')
    esValido = false
  }
  return esValido
}

const limpiarFormulario = () => {
  document.getElementById('form-promocion').reset()
  document.querySelectorAll('.input').forEach(el => el.classList.remove('is_danger'))
  document.querySelectorAll('.help.is-danger').forEach(el => el.remove())
}

// We send an error message
function marcarError (id, mensaje) {
  // We get the id of the element
  const elemento = document.getElementById(id)
  // We add the class is-danger FROM BULMA
  elemento.classList.add('is-danger')

  // Insert text of help from Bulma
  // This does this:
  // <div class="control">
  // <input id="nombre" class="input is-danger" type="text">
  // <p class="help is-danger">El nombre es obligatorio</p>
  // </div>
  const help = document.createElement('p')
  help.className = 'help is-danger'
  help.textContent = mensaje
  elemento.closest('.control').appendChild(help)
}

const guardarPromocion = () => {
  let error
  console.log('Vamos a guardar una promocion :)')
  const datos = {
    nombre: document.getElementById('nombre').value.trim(),
    descuento: document.getElementById('descuento').value.trim(),
    condiciones: document.getElementById('condiciones').value.trim()
  }

  if (!validarFormulario(datos)) return
  // Si el nombre esta vacío o no existe, pinta el input en rojo
  if (!datos.nombre) {
    document.getElementById('nombre').classList.add('is-danger')
    error = true
  }
  // it verifies that only one promotion has been selected
  if (datos.promociones.length === 0) {
    document.getElementById('promociones').closest('.select')
    error = true
  }

  if (error) return

  const btnGuardar = document.querySelector('#form-promocion .button.is-primary')
  btnGuardar.classList.add('is-loading')
  btnGuardar.disabled = true
  fetch('/admin/promociones/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  }).then(res => res.json()).then(data => {
    if (data.success) {
      alert('¡Se pudo hacer el metodo POST' + data.message)
      location.reload()
    } else {
      alert('Error: ' + data.message)
    }
  })
    .catch(err => console.error('Error en la peticion', err))
}
