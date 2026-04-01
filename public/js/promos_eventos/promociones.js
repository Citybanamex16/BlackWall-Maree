/* eslint-env browser */
/* eslint-disable no-unused-vars */
// Function to know if the input written is correct

// Modal
// function to open the pop up or the modal
const abrirModal = () => {
  document.getElementById('modal-promocion').classList.add('is-active')
}

const nuevoDescuento = () => {
  // Obtenemos los elementos del HTML
  const checkbox = document.getElementById('check-descuento')
  const seccion = document.getElementById('seccion-descuento')
  const inputDescuento = document.getElementById('descuento')

  // 2. Escuchamos cuando el usuario le da click a la checkbox
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      // Si es verdadero mostramos el bloque
      seccion.style.display = 'block'
    } else {
      // Si no se marca se deja sin valor
      seccion.style.display = 'none'
      inputDescuento.value = ''
    }
  })
}
// Asyncronus petition
// btn-registrar-promocion is going to use when we want to post on the main page
const cargarYMostrarModal = async () => {
  const btn = document.getElementById('btn-registrar-promocion')
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

// Option of cancelar, we close the modal
const cerrarModal = () => {
  console.log('Cerrando Pop-up')
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
    console.log('Debes escribir un nombre')
    marcarError('nombre', 'El nombre es obligatorio')
    esValido = false
  }
  const checkboxDescuento = document.getElementById('check-descuento')
  if (checkboxDescuento && checkboxDescuento.checked) {
    // vatidates Discount
    if (!datos.descuento || datos.descuento.trim() === '') {
      console.log('Debes escribir un descuento')
      marcarError('descuento', 'El descuento es obligatorio')
      esValido = false
    }
  }

  // This makes this in HTML: <p class="help is-danger">El nombre es obligatorio</p>
  // validates Conditions
  if (!datos.condicion || datos.condicion === '') {
    console.log('Debes escribir una condicion')
    marcarError('condiciones', 'Las condiciones no son válidas')
    esValido = false
  }

  if (!datos.fechaInicio || datos.fechaInicio === '') {
    console.log('Debes escribir una fecha de inicio')
    // los parametros de marcar error deben coincidir con el id en el ejs
    marcarError('fecha_de_Inicio', 'Debes colocar una fecha de inicio')
    esValido = false
  }
  if (!datos.fechaFinal || datos.fechaFinal === '') {
    console.log('Debes escribir una fecha de fin')
    // los parametros de marcar error deben coincidir con el id en el ejs
    marcarError('fecha_de_Fin', 'Debes colocar una fecha de inicio')
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
    condicion: document.getElementById('condiciones').value.trim(),
    fechaInicio: document.getElementById('fecha_de_Inicio').value,
    fechaFinal: document.getElementById('fecha_de_Fin').value
  }

  if (validarFormulario(datos) === false) return

  if (error) return
  console.log('Registrando promocion')
  const btnGuardar = document.querySelector('#form-promocion .button.is-primary')
  btnGuardar.classList.add('is-loading')
  btnGuardar.disabled = true
  fetch('/admin/promociones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos)
  }).then(res => res.json()).then(data => {
    if (data.success) {
      document.getElementById('modal-promocion').classList.remove('is-active')
      const mensajeExito = document.querySelector('#modal-exito p') || document.getElementById('mensaje-exito')
      if (mensajeExito) {
        mensajeExito.textContent = data.message
      }
      document.getElementById('modal-exito').classList.add('is-active')
      // location.reload()
      // alert('¡Se pudo hacer el metodo POST ' + data.message)
    } else {
      alert('Error: ' + data.message)
    }
  })
    .catch(err => console.error('Error en la peticion', err))
}

// Obtener produtos en base a la categoría y tipos
const actualizarProductos = async () => {
  // Obtenemos la categoria y tipo en base a lo seleccionado en la vista
  const selectCat = document.querySelector('select[name="categoria"]')
  const selectTipo = document.querySelector('select[name="tipo"]')

  // Verificamos que si se encuentran antes de obtener .value
  if (!selectCat || !selectTipo) {
    console.log('Selects no encontrados')
    return
  }
  // Obtenemos los valores de categoría y tipo
  const categoria = selectCat.value
  const tipo = selectTipo.value

  console.log('Filtrando por:', categoria, tipo)
  // Creamos una variable de parametros
  const params = new URLSearchParams()
  if (categoria) params.append('categoria', categoria)
  if (tipo) params.append('tipo', tipo)

  try {
    // Obtenemos las rutas para hacer el filtrado
    const res = await fetch(`/admin/promociones/producto-filtro?${params.toString()}`)
    const data = await res.json()
    console.log('Respuesta del servidor:', data)
    // Obtenemos el id de los productos
    const selectProductos = document.getElementById('select-productos')
    selectProductos.innerHTML = ''

    if (!data.success || data.data.length === 0) {
      selectProductos.innerHTML = '<option value="">Sin resultados</option>'
      return
    }

    data.data.forEach(producto => {
      const label = document.createElement('label')
      label.className = 'checkbox'// Bulma
      label.style.display = 'block'
      const input = document.createElement('input')
      input.type = 'checkbox'
      input.value = producto.ID_Producto
      input.dataset.nombre = producto.Nombre
      input.className = 'checkbox-producto mr-2'

      label.appendChild(input)
      label.appendChild(document.createTextNode(' ' + producto.Nombre))
      selectProductos.appendChild(label)
    })
  } catch (error) {
    console.error('Error al cargar productos', error)
  }
}
