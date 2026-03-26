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
        ShowErrorModal('Error Consulta', 'Error en Consulta Tipos de Productos')
        throw new Error('Error en Register Button Click')
      }
      return response.json()
    })
    .then(objeto => {
      console.log('Objeto recibido en Front')
      console.log('Estructura real de objeto:', objeto)
      const tiposProductos = objeto.data[0]
      console.log('Tipos de productos: ', tiposProductos)
      // console.log("¿Es realmente un Array?:", Array.isArray(tiposProductos));

      /* == Despliegue de Modal y HTML DOM == */

      /* Limpieza de elementos dinamicos */
      limpiarModal(typeFormsModal)

      typeFormsTitle.innerText = 'Seleccione el Tipo de Producto'

      // Creación de Botones de Tipos
      tiposProductos.forEach(t => {
        console.log(t.Categoría)
        // 1. Creamos el boton en memoria
        const newbtn = document.createElement('button')

        // 2. Asignamos ID y Clases
        newbtn.id = `btn${t.Categoría}`
        newbtn.className = 'formsTypebtn button is-info is-dynamic' // aprovechar y poner CSS

        // 3. SEGURIDAD: textContent escapa inyección código HTML
        newbtn.textContent = t.Categoría

        // 4. ESCUCHADOR DE CLICKS
        newbtn.onclick = async (event) => {
          event.preventDefault()
          typeFormsModal.close() // Cerramos el Modal Actual
          const ProductType = t.Categoría // Seguridad de Type :)
          await seleccionarTipoProducto(ProductType)
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
      ShowErrorModal('Error Interno', 'Error en Consulta Tipos de Productos')
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
      ShowErrorModal('Error', 'Error en Consulta campos de Producto e Ingredientes')
    }

    const object = await respuesta.json()
    console.log('Datos recibidos:', object)
    // Separación
    const ProductFields = object.data.fields
    const AllIngredientes = object.data.ingredientes[0]
    createProductRegisterForms(ProductFields, AllIngredientes, id)
  } catch (error) {
    console.error('Hubo un fallo en la operación:', error)
    ShowErrorModal('Error Interno', `Error en Consulta campos de Producto: ${error}`)
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

/* ══════════════════════════════════════════════════════
   REFERENCIAS DEL DOM
══════════════════════════════════════════════════════ */
const RegisterFormModal = document.getElementById('RegisterFormsCU04')
const RegisterFormTitle = document.getElementById('formsRegistrarTitulo')
const RegisterFormClose = document.getElementById('cerrarFormsRegistrar')
const RegisterFormEl = document.getElementById('formsRegistrarForm')

/* ══════════════════════════════════════════════════════
   ESTADO DE INGREDIENTES
══════════════════════════════════════════════════════ */
const MAX_INGREDIENTES = 10
let ingCount = 1 // empieza en 1 (la fila 0 que se crea en createProductRegisterForms)
let catalogoIng = [] // se guarda al abrir el modal para reutilizar en cada fila nueva

/* ══════════════════════════════════════════════════════
   HELPERS DE INGREDIENTES
══════════════════════════════════════════════════════ */

// Tu función original — crea un <option> para el dropdown
function createIngElement (ing) {
  console.log('Creando opción de ingrediente...')
  const opt = document.createElement('option')
  opt.value = ing.Nombre
  opt.textContent = `${ing.Nombre}: $${ing.Precio}`
  return opt
}

// Rellena un <select> vacío usando createIngElement
function populateDropdown (selectEl) {
  selectEl.innerHTML = '<option value="">Selecciona un ingrediente</option>'
  catalogoIng.forEach(ing => selectEl.appendChild(createIngElement(ing)))
}

// Actualiza el contador "N / 10" y bloquea el botón al llegar al límite
function updateIngCounter () {
  const counter = document.getElementById('ingCounter')
  const btnAdd = document.getElementById('btnAddIngrediente')
  if (counter) counter.textContent = `${ingCount} / ${MAX_INGREDIENTES}`
  if (btnAdd) btnAdd.disabled = ingCount >= MAX_INGREDIENTES
}

// Crea una fila completa: dropdown + input cantidad [+ botón ✕ si no es la primera]
function createIngRow (index, isFirst = false) {
  const row = document.createElement('div')
  row.classList.add('ingredient-row')
  row.dataset.ingIndex = index

  // Dropdown
  const selectWrap = document.createElement('div')
  selectWrap.classList.add('select', 'is-fullwidth', 'ing-select-wrap')
  const select = document.createElement('select')
  select.classList.add('ing-dropdown')
  select.name = `ingrediente_${index}`
  select.dataset.ingField = 'true' // añade data-ing-field="true"
  populateDropdown(select)
  selectWrap.appendChild(select)

  // Input cantidad
  const inputCant = document.createElement('input')
  inputCant.classList.add('input', 'ing-cantidad')
  inputCant.type = 'number'
  inputCant.name = `cantidad_${index}`
  inputCant.placeholder = 'Cant.'
  inputCant.min = '1'
  inputCant.value = '1'
  inputCant.dataset.ingField = 'true'

  row.appendChild(selectWrap)
  row.appendChild(inputCant)

  // Botón ✕ — solo en filas que no son la primera
  if (!isFirst) {
    const btnRemove = document.createElement('button')
    btnRemove.type = 'button'
    btnRemove.classList.add('btn-remove-ing')
    btnRemove.title = 'Quitar ingrediente'
    btnRemove.textContent = '✕'
    btnRemove.addEventListener('click', () => {
      row.remove()
      ingCount--
      updateIngCounter()
    })
    row.appendChild(btnRemove)
  }

  return row
}

// Construye la sección de ingredientes completa e la inyecta en el form
function buildIngredientsSection () {
  console.log('BUILDING INGREDIENT SECTION......')
  ingCount = 1

  const section = document.createElement('div')
  section.classList.add('ingredients-section', 'is-dynamic')
  section.id = 'ingredientsSection'

  section.innerHTML = `
    <div class="ingredients-header is-dynamic">
      <span class="ingredients-title is-dynamic">
        <span class="ing-icon is-dynamic">🥗</span> Ingredientes
      </span>
      <span id="ingCounter" class="ing-counter is-dynamic">1 / ${MAX_INGREDIENTES}</span>
    </div>
    <div id="ingredientsList" class="ingredients-list is-dynamic"></div>
    <button type="button" id="btnAddIngrediente" class="btn-add-ingredient is-dynamic">
      <span class="add-icon is-dynamic">＋</span> Agregar ingrediente
    </button>
  `

  // Insertar fila 0 (obligatoria, sin ✕)
  const list = section.querySelector('#ingredientsList')
  list.appendChild(createIngRow(0, true))

  // Evento del botón agregar
  section.querySelector('#btnAddIngrediente')
    .addEventListener('click', onBtnIngNewClick)

  return section
}

// Handler del botón "＋ Agregar ingrediente"
function onBtnIngNewClick () {
  if (ingCount >= MAX_INGREDIENTES) return

  const list = document.getElementById('ingredientsList')
  const newRow = createIngRow(ingCount, false)
  list.appendChild(newRow)
  newRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' })

  ingCount++
  updateIngCounter()
}

// Lee todos los ingredientes seleccionados
function getIngredientesSeleccionados () {
  return Array.from(
    document.querySelectorAll('#ingredientsList .ingredient-row')
  )
    .map(row => row.querySelector('.ing-dropdown').value) // Solo traemos el valor del dropdown
    .filter(key => key !== '') // Filtramos vacíos
}

/* == Funcion Central == */
function createProductRegisterForms (Fields, Ingredientes, type) {
  // Guardar catálogo para usarlo en cada nueva fila
  console.log('Catalogo de Ingredientes: ', Ingredientes)
  catalogoIng = Ingredientes

  // Limpieza del modal
  limpiarModal(RegisterFormModal)
  limpiarModal(RegisterFormEl)
  RegisterFormTitle.textContent = `Registro de nuevo ${type}`

  // Inyectar campos dinámicos (nombre, precio, etc.)
  Fields.forEach(field => {
    const fieldEl = createFieldElement(field)
    RegisterFormEl.appendChild(fieldEl)
  })

  // Construir e inyectar la sección de ingredientes
  RegisterFormEl.appendChild(buildIngredientsSection())

  /* ══════════════════════════════════════════════════════
   LISTENER SUBMIT
══════════════════════════════════════════════════════ */
  RegisterFormEl.addEventListener('submit', (event) => {
    event.preventDefault()
    PostNewProduct(Ingredientes, type)
  })

  RegisterFormModal.showModal()
}

/* ══════════════════════════════════════════════════════
   LISTENER CERRAR
══════════════════════════════════════════════════════ */
RegisterFormClose.addEventListener('click', () => {
  RegisterFormModal.close()
  typeFormsModal.showModal()
})

function PostNewProduct (BackupIngredientes, ProductType) {
  // 1. Validación nativa HTML
  if (!RegisterFormEl.checkValidity()) {
    RegisterFormEl.reportValidity()
    return
  }

  // 2. Recolectar campos normales (FormData)
  const formData = new FormData(RegisterFormEl)
  const data = {}
  formData.forEach((value, key) => {
    const el = RegisterFormEl.querySelector(`[name="${key}"]`)
    // El '?' sirve para comprobar si el existe -> no hacer ifs ilegibles :)
    if (el?.dataset.ingField) return // ← se salta este campo
    data[key] = value === '' ? null : value
  })

  // 3. Checkboxes manuales
  RegisterFormEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    data[cb.name] = cb.checked
  })

  // 4. Ingredientes — array separado de ingredientes
  const ingredientes = getIngredientesSeleccionados()
  console.log('Ingredientes Get: ', ingredientes)
  data.ingredientes = ingredientes // también va al objeto data para el POST

  // 4.5 Añadir Tipo
  data.type = ProductType

  // 5. Validación de Reglas de negocio
  const validacion = validarDatosRegistro(data, BackupIngredientes)

  if (validacion) {
    console.log('Datos válidos :)')
    RegisterFormModal.close()

    // Construir array para ShowProductSummary incluyendo ingredientes
    const summaryData = Object.entries(data)
      .filter(([key]) => key !== 'ingredientes') // los ingredientes se muestran aparte
      .map(([key, value]) => ({ key, value }))

    ingredientes.forEach((ing, i) => {
      summaryData.push({ key: `Ingrediente ${i + 1}`, value: ing })
    })

    ShowProductSummary(summaryData, ProductType)
  } else {
    console.log('Datos inválidos ;(')
    ShowErrorModal('Datos inválidos', 'Datos Invalidos en Campos de Formulario, favor de corregir')
  }

  console.log('📋 Datos del formulario:', data)
}
/* == FIN Modal Registrar Producto == */

/* == Conf y Show de Error Modal == */
// Error elements references
const ErrorModal = document.getElementById('ErrorModal')
const ErrorTitle = document.getElementById('ErrorTitle')
const ErrorContent = document.getElementById('ErrorMessage')
const ErrorCloseBtn = document.getElementById('closeInvalidData')
ErrorCloseBtn.addEventListener('click',
  (event) => {
    ErrorModal.close()
  })

function ShowErrorModal (title, content) {
  ErrorTitle.innerText = title
  ErrorContent.innerText = content
  ErrorModal.showModal()
}

/* == Creación de Modal de Resumen de Datos */

const SummaryModal = document.getElementById('SummaryCU04')
const SummaryFormTitle = document.getElementById('SummaryTitleModal')
const SummaryFormClose = document.getElementById('cerrarSummaryModal')
const SummaryRegisterbtn = document.getElementById('RegisterProduct')

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
  Registerdata.forEach((content) => {
    console.log('Key: ', content.key, ' Value: ', content.value)

    const SummaryEl = createSummaryElement(content.key, content.value)
    SummaryModal.insertBefore(SummaryEl, SummaryFormClose)
  })

  SummaryFormClose.addEventListener('click', (event) => {
    // FA: Cancelar confirmacion
    RegisterFormModal.showModal() // Volvemos a abrir el Formulario de registro
    SummaryModal.close()
  }, { once: true })

  SummaryRegisterbtn.addEventListener('click', async (event) => {
    // Send de los Datos del Summary
    event.preventDefault()
    registerNewProduct(Registerdata, type)
  }, { once: true })

  SummaryModal.showModal()
}

async function registerNewProduct (NewProductData, ProductType) {
  const nombre = NewProductData.find(item => item.key === 'Nombre')?.value || 'Sin nombre'
  try {
    console.log('POST NEW PRODUCT')
    const postrequest = await fetch('/menu/registerNewProduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/JSON' },
      body: JSON.stringify(NewProductData)
    })

    const response = await postrequest.json()
    if (response.ok) {
      console.log('¡Exito!')
      // Mostramos modal de exito
      showSuccessModal(nombre, ProductType)
    } else {
      ShowErrorModal(`Error al Registrar ${ProductType}`, response.message || 'Error Desconocido')

      console.log('!Fracaso!')
    }
  } catch (error) {
    ShowErrorModal(`Error Interno al Registrar ${ProductType}`, `Fallo Interno: ${error}`)
    console.error('Error en el Registro de nuevo Producto: ', error)
  }
}

const SuccessModal = document.getElementById('ModalExito')
const Successitle = document.getElementById('TituloExito')
const SuccessContent = document.getElementById('exitoContent')

function showSuccessModal (productName, productType) {
  Successitle.innerText = `Registro de ${productName} exitoso`
  SuccessContent.innerText = `¡Tu ${productType} fue registrado de manera exitosa!`
  SuccessModal.showModal()
}

const Successbtn = document.getElementById('closeExito')
Successbtn.addEventListener('click', (event) => {
  event.preventDefault()
  closeAllModals()
})

// Funcion validar datos de Formulario
function validarDatosRegistro (Formsdata, catalogoIngredientes) {
  console.log('Validador Data entrante: ', Formsdata)
  const data = Object.entries(Formsdata)
  console.log('Validador Data procesado: ', data)

  const nombresValidos = new Set(catalogoIngredientes.map(ing => ing.nombre))

  for (const field of data) {
    if (field[1] === null || field[1] === undefined || field[1] === '') {
      console.warn(`Campo vacío: ${field[0]}`)
      return false
    }

    if (field[0] === 'Precio') {
      const precio = parseFloat(field[1])
      if (isNaN(precio) || precio < 0) {
        console.warn(`Precio inválido: ${field[1]}`)
        return false
      }
    }

    // A. Validar ingredientes contra el catálogo original
    if (field[0].startsWith('Ingrediente')) {
      const nombreIngrediente = field[1].split(' × ')[0] // "Queso Crema × 1" → "Queso Crema"
      if (!nombresValidos.has(nombreIngrediente)) {
        console.warn(`Ingrediente no reconocido: ${nombreIngrediente}`)
        return false
      }
    }
  }

  return true
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

// Funcion para cerrar TODOS los modals
function closeAllModals () {
  // 1. Recolecta todos los <dialog> que tienen la clase 'modal'
  const modales = document.querySelectorAll('dialog.mymodal')

  // 2. Itera sobre cada modal encontrado
  modales.forEach(modal => {
    // 3. Cierra el modal usando el método nativo del DOM
    modal.close()
  })

  console.log(`${modales.length} modales cerrados.`)
}
