// JS FRONTEND de la vista de Productos del Admin

/* CU Registrar Nuevo Producto */
// 1. Referencia a Boton
console.log('Iniciando Setup de CU')
const registerButton = document.getElementById('registrarNuevoProducto')
registerButton.addEventListener('click', registerButtonOnClick)

const typeFormsModal = document.getElementById('TypeFormsCU04')
const typeFormsTitle = document.getElementById('tituloModal')
const typeFormsCloseBtn = document.getElementById('cerrarModal')

function registerButtonOnClick (event) {
  // Logica de Registrar Nuevo Producto
  event.preventDefault()
  console.log('Iniciando CU Registrar Nuevo Producto...')

  fetch('/menu/formsTipoPlatillo')
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en Register Button Click')
      }
      return response.json()
    })
    .then(objeto => {
      console.log('Objeto recibido en Front')
      console.log('Estructura real de objeto:', objeto)
      const tiposProductos = objeto.data
      // console.log("¿Es realmente un Array?:", Array.isArray(tiposProductos));

      /* == Despliegue de Modal y HTML DOM == */

      /* Limpieza de elementos dinamicos */
      limpiarModal(typeFormsModal)

      typeFormsTitle.innerText = 'Seleccione el Tipo de Producto'

      // Creación de Botones de Tipos
      tiposProductos.forEach(t => {
        console.log(t.nombre)
        // 1. Creamos el boton en memoria
        const newbtn = document.createElement('button')

        // 2. Asignamos ID y Clases
        newbtn.id = `btn${t.id}`
        newbtn.className = 'formsTypebtn button is-info is-dynamic' // aprovechar y poner CSS

        // 3. SEGURIDAD: textContent escapa cualquier código HTML
        newbtn.textContent = t.nombre

        // 4. ESCUCHADOR DE CLICKS
        newbtn.onclick = async (event) => {
          event.preventDefault()
          typeFormsModal.close() // Cerramos el Modal Actual
          await seleccionarTipoProducto(t.id)
        }
        // 5. Lo inyectamos al DOM
        typeFormsModal.appendChild(newbtn)
        console.log('Boton Creado')
      })
      //
      typeFormsCloseBtn.addEventListener('click', (event) => {
        event.preventDefault()
        typeFormsModal.close()
      })

      typeFormsModal.showModal()
    })
    .catch(error => {
      console.error('Erro en datos Type product CU04: ', error)
    })
}

async function seleccionarTipoProducto (id) {
  // Equivalente a los .then()
  try {
    console.log(`Iniciando fetch para el ID: ${id}`)

    /* 1. Fetch: Obtener campos del producto */
    const respuesta = await fetch(`/menu/formsRegistraPlatillo?id=${id}`)

    if (!respuesta.ok) {
      throw new Error('Error al obtener formulario de Registro de Producto')
    }

    const object = await respuesta.json()
    console.log('Datos recibidos:', object)
    // Separación

    const ProductFields = object.data.Fields
    const AllIngredientes = object.data.Ingredientes
    createProductRegisterForms(ProductFields, AllIngredientes, id)
  } catch (error) {
    console.error('Hubo un fallo en la operación:', error)
    console.log('No se pudo cargar la configuración del producto.')
  }
}

/* == Funcion de creación de Modal Registrar Producto == */

/* ── Helper de campo por tipo ── */
function createFieldElement (field) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('field', 'is-dynamic')

  const label = document.createElement('label')
  label.classList.add('label', 'is-dynamic')
  label.textContent = field.nombre
  label.setAttribute('for', `field-${field.nombre}`)

  const control = document.createElement('div')
  control.classList.add('control', 'is-dynamic')

  // ── text | number | date ──
  const input = document.createElement('input')
  input.classList.add('input')
  input.id = `field-${field.nombre}`
  input.name = field.nombre
  input.required = true

  // Selección de Tipo de Dato
  const typeMap = {
    string: 'text',
    int: 'number',
    float: 'number',
    bool: 'checkbox',
    boolean: 'checkbox'
  }
  const mappedType = typeMap[field.type] ?? 'text'

  if (mappedType === 'checkbox') {
  // Bulma necesita: <label class="checkbox"><input type="checkbox"> Texto</label>
    const checkLabel = document.createElement('label')
    checkLabel.classList.add('checkbox')
    checkLabel.setAttribute('for', `field-${field.nombre}`)

    input.type = 'checkbox'
    input.id = `field-${field.nombre}`
    input.name = field.nombre
    input.required = false
    // Quitar la clase 'input' que se agregó arriba, no aplica a checkbox
    input.classList.remove('input')

    checkLabel.appendChild(input)
    checkLabel.append(` ${field.nombre}`) // Texto al lado del checkbox

    // Reemplazar el label externo y meter todo en control
    label.textContent = '' // Vaciar el label superior
    label.style.display = 'none' // Ocultarlo, el checkLabel ya tiene el texto
    control.appendChild(checkLabel)
  } else {
    input.type = mappedType
    input.classList.add('input') // Clase estándar de Bulma para texto/número
  }
  // Para los números 'Float', puedes añadir el atributo 'step'
  if (field.type === 'float') {
    input.step = 'any' // Permite decimales
  }

  if (field.placeholder) input.placeholder = field.placeholder
  control.appendChild(input)

  wrapper.appendChild(label)
  wrapper.appendChild(control)
  return wrapper
}

function createIngElement (ing) {
  // Creamos el elemento
  console.log('Creando opcion de ingrediene...')
  const opt = document.createElement('option')
  opt.value = ing.nombre
  opt.textContent = `${ing.nombre}: $${ing.precio}`
  return opt
}

const RegisterFormModal = document.getElementById('RegisterFormsCU04')
const RegisterFormTitle = document.getElementById('formsRegistrarTitulo')
const RegisterFormClose = document.getElementById('cerrarFormsRegistrar')
const RegisterFormEl = document.getElementById('formsRegistrarForm')
const DropdownIngredientes = document.getElementById('DropdownIngredientes')

// Error Modal
const invalidDataModal = document.getElementById('InvalidaDataRegister')
const invalidclosebtn = document.getElementById('closeInvalidData')
invalidclosebtn.addEventListener('click',
  (event) => {
    invalidDataModal.close()
  })

function createProductRegisterForms (Fields, Ingredientes, type) {
  // Limpieza
  const productType = type
  console.log(productType)
  limpiarModal(RegisterFormModal)
  DropdownIngredientes.innerHTML = '<option value="">Cargando opciones...</option>'
  RegisterFormTitle.textContent = `Registro de nuevo ${type}`

  // Inyectar un campo por cada field
  Fields.forEach(field => {
    const fieldEl = createFieldElement(field)
    RegisterFormEl.appendChild(fieldEl)
  })

  Ingredientes.forEach(ing => {
    console.log('listo para agregar ingredientes :)')
    const optionIngEl = createIngElement(ing)
    DropdownIngredientes.appendChild(optionIngEl)
  })

  RegisterFormModal.showModal()

  // Listener Cerrar
  RegisterFormClose.addEventListener('click', () => {
  // FA: Cancelar registro de Formulario de Tipo
    RegisterFormModal.close()
    typeFormsModal.showModal()
  })

  // Listener Submit
  RegisterFormEl.addEventListener('submit', (event) => {
    event.preventDefault()

    // 1. Validación nativa de HTML (required, type, min, etc.)
    if (!RegisterFormEl.checkValidity()) {
      RegisterFormEl.reportValidity() // Muestra los mensajes del navegador
      return
    }

    // 2. Recolectar datos
    const formData = new FormData(RegisterFormEl)
    const data = {}

    formData.forEach((value, key) => {
      data[key] = value === '' ? null : value
    })

    // 3. Los checkbox agregamos manualmente
    RegisterFormEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      data[cb.name] = cb.checked
    })

    const validacion = validarDatosRegistro(data)

    if (validacion) {
    // Datos son correctos -> POST
      console.log('Datos validos :)')
      RegisterFormModal.close()
      ShowProductSummary(data, type)
    } else {
    // No son correctos, Cancelar el envío y limpiar datos
      console.log('Datos invalidos ;(')
      invalidDataModal.showModal()
    }

    console.log('📋 Datos del formulario:', data)
  })
}

/* == FIN Modal Registrar Producto == */

/* == Creación de Modal de Resumen de Datos */

const SummaryModal = document.getElementById('SummaryCU04')
const SummaryFormTitle = document.getElementById('SummaryTitleModal')
const SummaryFormClose = document.getElementById('cerrarSummaryModal')

function createSummaryElement (title, content) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('summary-field', 'is-dynamic')
  wrapper.style.cssText = `
    display: flex;
    gap: 8px;
    padding: 6px 0;
    border-bottom: 1px solid #e5e5e5;
    font-size: 14px;
  `

  const label = document.createElement('span')
  label.classList.add('summary-label', 'is-dynamic')
  label.style.cssText = 'font-weight: 600; min-width: 140px; color: #555;'
  label.textContent = `${title}:`

  const value = document.createElement('span')
  value.classList.add('summary-value', 'is-dynamic')
  value.style.cssText = 'color: #111;'
  value.textContent = content ?? '—' // muestra guión si el valor está vacío

  wrapper.appendChild(label)
  wrapper.appendChild(value)
  return wrapper
}

/* IMPORTANTE ARRAY VS OBJECT PARSER
Object -> Object.entries(TuObjecto)
Array -> .forEach

*/

function ShowProductSummary (Registerdata, type) {
  limpiarModal(SummaryModal)
  console.log('Summary getting: ', Registerdata)
  SummaryFormTitle.innerText = `Resumen de Nuevo ${type}`
  // Despliegue de los datos
  Object.entries(Registerdata).forEach(([key, value]) => {
    const SummaryEl = createSummaryElement(key, value)
    SummaryModal.insertBefore(SummaryEl, SummaryFormClose)
  })
  SummaryFormClose.addEventListener('click', (event) => {
    // FA: Cancelar confirmacion
    RegisterFormModal.showModal() // Volvemos a abrir el Formulario de registro
    SummaryModal.close()
  })

  SummaryModal.showModal()
}

// Funcion validar datos de Formulario
function validarDatosRegistro (data) {
  if (data.Precio < 0) {
    return false
  } else {
    return true
  }
}

// Funcion para limpiar elementos dinamicos de un Modal
function limpiarModal (contenedor) {
  console.log('Limpiando elementos dinamicos...')
  if (!contenedor) {
    console.error('No se encontró el contenedor')
    return
  }

  // BUSCA SOLO ADENTRO: contenedor.querySelectorAll en vez de document
  const dinamicos = contenedor.querySelectorAll('.is-dynamic')
  dinamicos.forEach(el => el.remove())
}
