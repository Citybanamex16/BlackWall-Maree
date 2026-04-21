/* global ConstruirModifModal, ModifyProduct, eliminarDesactivarModal */
// JS FRONTEND de la vista de Productos del Admin

// Funciones Globales

function showSpinner (mensaje = 'Cargando...') {
  console.log('Mostrando Spinner')
  document.getElementById('spinner-label').textContent = mensaje
  document.getElementById('spinner-overlay').showModal()
}

function hideSpinner () {
  console.log('Closing Spinner')
  document.getElementById('spinner-overlay').close()
}

// Fin de funciones Globales

/* CU Visualizar Catalogo de Productos */

async function getCatalogoProductos () {
  console.log('Obteniendo Catalogo de Productos')
  try {
    showSpinner('Obteniendo Catalogo de Productos')
    const response = await fetch('/menu/productosCatalog')
    if (!response.ok) {
      ShowErrorModal('Error Interno', 'Error en Obtener Catalogo')
      throw new Error('Error en Register Button Click')
    }

    const object = await response.json()
    console.log('object: ', object)
    construirCatalogoAdmin(object)
  } catch (error) {
    console.log('Error obteniendo Catalogo: '.error)
  } finally {
    hideSpinner()
  }
}
getCatalogoProductos()

/* == Construcción de Catálogo Admin == */

// Estructuras de Datos
const catalogoProductosMap = new Map()

function construirFichaProductos (datosProducto, datosCategorias) {
  console.log('Repartiendo productos en sus categorías...')
  datosCategorias.forEach(cat => {
    const sectionPrincipal = document.getElementById(cat.id)
    const gridDestino = sectionPrincipal.querySelector('.grid-productos')
    const productosFiltrados = datosProducto.filter(prod => prod.categoria === cat.nombre)

    if (productosFiltrados.length === 0) {
      gridDestino.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">🥐</span>
          <p>Sin productos en esta categoría por el momento.</p>
        </div>`
      return
    }

    productosFiltrados.forEach(prod => {
      catalogoProductosMap.set(String(prod.id), prod) // Guardamos la info en la memoria
      const fichaHTML = renderProductoAdmin(prod)
      gridDestino.insertAdjacentHTML('beforeend', fichaHTML)
    })

    // Delegar clicks en todas las fichas de esta categoría
    gridDestino.addEventListener('click', (e) => {
      // Click en botón Elim/Desact — tiene prioridad, no propaga a la fila
      const btnElim = e.target.closest('.btn-elim-desact')
      if (btnElim) {
        e.stopPropagation()
        const idProd = btnElim.dataset.idProd
        const nameProd = btnElim.dataset.nameProd
        eliminarDesactivarModal(idProd, nameProd)
        return
      }

      // Click en la fila — abre modal de edición
      const ficha = e.target.closest('.admin-prod-row')
      if (!ficha) return
      const prod = catalogoProductosMap.get(ficha.dataset.id)
      ConstruirModifModal(prod, datosCategorias)
    })
  })
}

// Render de fila compacta
function renderProductoAdmin (prod) {
  // Verificamos si tiene tipo, si no, ponemos un placeholder
  const tipoTexto = prod.tipo ? prod.tipo : 'Otro'

  return `
    <div class="admin-prod-row" data-id="${prod.id}">
      <div class="admin-prod-info">
        <div class="admin-prod-img-container">
            <img src="${prod.imagen}" class="admin-prod-img" onerror="this.src='/img/placeholder.webp'">
        </div>
        <div class="admin-prod-texts">
          <h4 class="admin-prod-name">${prod.nombre}</h4>
          
          <div class="admin-prod-meta">
            <span class="admin-tag-tipo">${tipoTexto}</span>
            <span class="admin-prod-price">$${prod.precio}</span>
          </div>
        </div>
      </div>
      
      <div class="admin-prod-actions">
        <button class="btn-elim-desact" data-id-prod="${prod.id}" data-name-prod="${prod.nombre}">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `
}

// Sección de categoría
function construirCategoria (cat, contenedorMenu) {
  const seccionCat = document.createElement('section')
  seccionCat.className = 'categoria-section mb-4 is-dynamic is-open'
  seccionCat.id = `cat-${cat.Nombre.toLowerCase().replace(/\s+/g, '-')}`
  const idContenedor = `grid-${cat.Nombre.replace(/\s+/g, '-').toLowerCase()}`

  seccionCat.innerHTML = `
    <div class="cat-header toggle-menu" role="button" tabindex="0" aria-expanded="true">
      <h2 class="cat-title">${cat.Nombre}</h2>
      <span class="cat-badge" id="badge-${idContenedor}"></span>
      <span class="cat-chevron" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 6l5 5 5-5" stroke="currentColor" stroke-width="1.8"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
    </div>
    <div id="${idContenedor}" class="grid-productos admin-grid mt-1 grid-collapsible">
      <!-- Cabecera de columnas -->
      <div class="admin-prod-header">
        <span>Nombre</span>
        <span>Precio</span>
        <span>Ingredientes</span>
        <span>Estado</span>
        <span>Acción</span>
      </div>
    </div>`

  const header = seccionCat.querySelector('.cat-header')
  const grid = seccionCat.querySelector('.grid-productos')

  function toggleGrid () {
    const open = seccionCat.classList.contains('is-open')
    if (open) {
      grid.style.maxHeight = grid.scrollHeight + 'px'
      grid.style.opacity = '1'
      /* global requestAnimationFrame */
      requestAnimationFrame(() => {
        grid.style.maxHeight = '0'
        grid.style.opacity = '0'
      })
      seccionCat.classList.remove('is-open')
      header.setAttribute('aria-expanded', 'false')
    } else {
      grid.style.maxHeight = grid.scrollHeight + 'px'
      grid.style.opacity = '1'
      seccionCat.classList.add('is-open')
      header.setAttribute('aria-expanded', 'true')
      grid.addEventListener('transitionend', () => {
        if (seccionCat.classList.contains('is-open')) grid.style.maxHeight = 'none'
      }, { once: true })
    }
  }

  header.addEventListener('click', toggleGrid)
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGrid() }
  })

  contenedorMenu.appendChild(seccionCat)
  return { id: seccionCat.id, nombre: cat.Nombre }
}

// Entry point
function construirCatalogoAdmin (datos) {
  console.log('Construyendo catálogo admin...')
  const categorias = datos.arrayCategorías[0]
  const productosInfo = datos.arrayProductsCatalog

  const contenedor = document.getElementById('admin-catalogo')
  contenedor.innerHTML = ''

  const categoriasInfo = []
  categorias.forEach(cat => {
    categoriasInfo.push(construirCategoria(cat, contenedor))
  })

  construirFichaProductos(productosInfo, categoriasInfo)

  // Stats del encabezado
  document.getElementById('statTotal').textContent = productosInfo.length
  document.getElementById('statCategorias').textContent = categorias.length
  document.getElementById('statDisponibles').textContent =
    productosInfo.filter(p => p.activo).length

  // Actualizar badge de cada categoría con su conteo
  categoriasInfo.forEach(cat => {
    const count = productosInfo.filter(p => p.categoria === cat.nombre).length
    const badge = document.getElementById(
      `badge-grid-${cat.nombre.replace(/\s+/g, '-').toLowerCase()}`
    )
    if (badge) badge.textContent = count
  })

  console.log('Catálogo admin construido con éxito')
}

/* Fin de CU Visualizar Catalogo */

/* CU04 Registrar Nuevo Producto */
// 1. Referencia a Boton
const registerButton = document.getElementById('registrarNuevoProducto')
registerButton.addEventListener('click', registerButtonOnClick)

const typeFormsModal = document.getElementById('TypeFormsCU04')
const typeFormsTitle = document.getElementById('tituloModal')
const typeFormsCloseBtn = document.getElementById('cerrarModal')

function registerButtonOnClick (event) {
  console.log('Nuevo Producto button detectado')
  // Logica de Registrar Nuevo Producto
  event.preventDefault()
  console.log('Iniciando CU Registrar Nuevo Producto...')
  showSpinner('Obteniendo Categorías')
  fetch('/menu/formsTipoPlatillo')
    .then(response => {
      hideSpinner()
      if (!response.ok) {
        ShowErrorModal('Error Interno Backedn', 'Error en Fetch de Categorías')
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
        console.log(t.Nombre)
        // 1. Creamos el boton en memoria
        const newbtn = document.createElement('button')

        // 2. Asignamos ID y Clases
        newbtn.id = `btn${t.Nombre}`
        newbtn.className = 'formsTypebtn button is-info is-dynamic' // aprovechar y poner CSS

        // 3. SEGURIDAD: textContent escapa inyección código HTML
        newbtn.textContent = t.Nombre

        // 4. ESCUCHADOR DE CLICKS
        newbtn.onclick = async (event) => {
          event.preventDefault()
          typeFormsModal.close() // Cerramos el Modal Actual
          const ProductType = t.Nombre // Seguridad de Type :)
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
      }, { once: true })

      typeFormsModal.showModal()
    })
    .catch(error => {
      ShowErrorModal('Error Conexión a Base de Datos', 'Error en Consultar Tipos de Productos')
      console.error('Erro en datos Type product CU04: ', error)
    })
}

async function seleccionarTipoProducto (id) {
  try {
    console.log(`Iniciando fetch para el ID: ${id}`)

    /* 1. Fetch: Obtener campos del producto e Ingredientes */
    showSpinner('Obteniendo Campos e Ingredientes')
    const respuesta = await fetch(`/menu/formsRegistraPlatillo?id=${id}`)

    if (!respuesta.ok) {
      ShowErrorModal('Error Interno', 'Error Interno en Consulta campos de Producto e Ingredientes')
    }

    const object = await respuesta.json()
    console.log('Datos recibidos:', object)
    // Separación
    const ProductFields = object.data.fields
    const AllIngredientes = object.data.ingredientes[0]
    const AllTypes = object.data.types
    console.log('Types recvieves: ', AllTypes)
    createProductRegisterForms(ProductFields, AllIngredientes, id, AllTypes)
  } catch (error) {
    console.error('Hubo un fallo en la operación:', error)
    ShowErrorModal('Error de Conexión con BD', 'Hubo un inconveniente con la conexión a la BD. Intentelo mas tarde')
  } finally {
    hideSpinner()
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
const registerForm = document.getElementById('formsRegistrarForm')
const submitFormsRegistrar = document.getElementById('submitFormsRegistrar')

/* ══════════════════════════════════════════════════════
   ESTADO DE INGREDIENTES
══════════════════════════════════════════════════════ */
const MAX_INGREDIENTES = 10
let ingCount = 1 // empieza en 1 (la fila 0 que se crea en createProductRegisterForms)
let catalogoIng = [] // se guarda al abrir el modal para reutilizar en cada fila nueva

/* ══════════════════════════════════════════════════════
   HELPERS DE INGREDIENTES
══════════════════════════════════════════════════════ */

// función original — crea un <option> para el dropdown
function createIngElement (ing) {
  console.log('Creando opción de ingrediente...')
  const opt = document.createElement('option')
  opt.value = ing.id
  opt.textContent = `${ing.nombre}: $${ing.precio}`

  // Atriutos del Boton -> se recuperan con -> .getAttribute('data-nombre')
  opt.setAttribute('data-nombre', ing.nombre)
  opt.setAttribute('data-precio', ing.precio)
  return opt
}

// Rellena un <select> vacío usando createIngElement
function populateDropdown (selectEl) {
  console.log('Llenando opciones de Ingredientes')
  selectEl.innerHTML = '<option value="">Selecciona un ingrediente</option>'
  console.log('Ing Catalog: ', catalogoIng)
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
function createIngRow (index, isFirst = false, mostrarCantidad = true) {
  const row = document.createElement('div')
  row.classList.add('ingredient-row')
  row.dataset.ingIndex = index

  // Dropdown
  const selectWrap = document.createElement('div')
  selectWrap.classList.add('select', 'is-fullwidth', 'ing-select-wrap')
  const select = document.createElement('select')
  select.classList.add('ing-dropdown')
  console.log('index: ', index)
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

  if (mostrarCantidad) {
    row.appendChild(inputCant)
  }

  // Botón ✕ — solo en filas que no son la primera
  if (!isFirst) {
    const btnRemove = document.createElement('button')
    btnRemove.type = 'button'
    btnRemove.classList.add('btn-remove-ing')
    btnRemove.title = 'Quitar ingrediente'
    btnRemove.textContent = '✕'
    btnRemove.addEventListener('click', () => {
      row.classList.add('removing')
      row.addEventListener('animationend', () => {
        row.remove()
        ingCount--
        updateIngCounter()
        // reindexRows()
      }, { once: true })
    })
    row.appendChild(btnRemove)
  }

  return row
}

// Construye la sección de ingredientes completa y la inyecta en el form
function buildIngredientsSection ({ mostrarCantidad = true } = {}) {
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
  list.appendChild(createIngRow(0, true, mostrarCantidad))

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

function buildTypeSection (typesData) {
  const fieldWrapper = document.createElement('div')
  fieldWrapper.className = 'maree-field is-dynamic'

  const label = document.createElement('label')
  label.className = 'maree-label'
  label.textContent = 'Tipo de Producto'
  fieldWrapper.appendChild(label)

  const select = document.createElement('select')
  select.className = 'maree-select'
  select.id = 'productTypeSelect'
  select.required = true // <--- Validación nativa de HTML5

  const defaultOption = document.createElement('option')
  defaultOption.value = ''
  defaultOption.textContent = 'Selecciona una categoría...'
  defaultOption.disabled = true
  defaultOption.selected = true
  select.appendChild(defaultOption)

  typesData.forEach(tipo => {
    const option = document.createElement('option')
    option.value = tipo.nombre // Asumiendo que el ID es lo que guardas
    option.textContent = tipo.nombre
    select.appendChild(option)
  })

  fieldWrapper.appendChild(select)
  return fieldWrapper
}

function getIngredientesSeleccionados () {
  return Array.from(
    document.querySelectorAll('#ingredientsList .ingredient-row')
  )
    .map(row => {
      const dropdown = row.querySelector('.ing-dropdown')
      const selectedOption = dropdown.options[dropdown.selectedIndex]

      // Creamos un objeto con ambos datos
      return {
        id: dropdown.value,
        nombre: selectedOption.dataset.nombre // Aquí usamos el dataset que configuramos antes
      }
    })
    .filter(item => item.id !== '') // Filtramos los que no tengan ID seleccionado
}

/* == Funcion Central == */
function createProductRegisterForms (Fields, Ingredientes, type, tiposData) {
  // Type == Categoría
  // Guardar catálogo para usarlo en cada nueva fila
  console.log('Catalogo de Ingredientes: ', Ingredientes)
  catalogoIng = Ingredientes // Indispensable

  // Limpieza del modal
  limpiarModal(RegisterFormModal)
  limpiarModal(registerForm)
  RegisterFormTitle.textContent = `Registro de nuevo ${type}`

  // Inyectar campos dinámicos (nombre, precio, etc.)
  Fields.forEach((field, index) => {
    const fieldEl = createFieldElement(field)
    fieldEl.style.animationDelay = `${index * 0.05}s`
    registerForm.appendChild(fieldEl)
  })

  // Construir la sección de tipos
  registerForm.appendChild(buildTypeSection(tiposData))

  // Construir e inyectar la sección de ingredientes
  registerForm.appendChild(buildIngredientsSection({ mostrarCantidad: false }))

  SetRegisterButtons('POST', Ingredientes, type)

  RegisterFormModal.showModal()
}

// Setting de Botones
// Referencias globales de los handlers activos
let handlerSubmit = null
let handlerClose = null

function SetRegisterButtons (tipoAccion, datos1, datos2) {
  if (handlerSubmit) submitFormsRegistrar.removeEventListener('click', handlerSubmit)
  if (handlerClose) RegisterFormClose.removeEventListener('click', handlerClose)

  handlerSubmit = (event) => {
    event.preventDefault()
    if (tipoAccion === 'POST') {
      PostNewProduct(datos1, datos2)
    } else if (tipoAccion === 'MODIFY') {
      ModifyProduct(datos1, datos2)
    }
  }

  handlerClose = () => {
    RegisterFormModal.close()
    if (tipoAccion === 'POST') {
      typeFormsModal.showModal()
    }
  }

  submitFormsRegistrar.addEventListener('click', handlerSubmit)
  RegisterFormClose.addEventListener('click', handlerClose)

  RegisterFormModal.showModal()
}

function PostNewProduct (BackupIngredientes, ProductType) {
  // 1. Validación front
  if (!registerForm.checkValidity()) {
    registerForm.reportValidity()
    return
  }

  // 2. Recolectar campos normales (FormData)
  const formData = new FormData(registerForm)
  const data = {}
  formData.forEach((value, key) => {
    const el = registerForm.querySelector(`[name="${key}"]`)
    // El '?' sirve para comprobar si el existe -> no hacer ifs ilegibles :)
    if (el?.dataset.ingField) return // ← se salta este campo
    data[key] = value === '' ? null : value
  })

  // 3. Checkboxes manuales
  registerForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    data[cb.name] = cb.checked
  })

  // 3.5 tipo de producto
  const tipoSeleccionado = document.getElementById('productTypeSelect').value
  data.tipo = tipoSeleccionado
  console.log('Tipo rescatado: ', tipoSeleccionado)

  // 4. Ingredientes — array separado de ingredientes
  const ingredientes = getIngredientesSeleccionados()
  console.log('Ingredientes Get: ', ingredientes)

  // 4.5 Añadir Tipo
  data.categoría = ProductType

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
      summaryData.push({ key: `Ingrediente ${i + 1}`, value: ing.nombre })
    })

    data.ingredientesID = []

    // Salvamos todos los ingredientes
    ingredientes.forEach((ing) => {
      data.ingredientesID.push(ing)
    })

    console.log('Data save en Post new product: ', data)
    ShowProductSummary(summaryData, ProductType, data)
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

function ShowErrorModal (title, content) {
  ErrorTitle.innerText = title
  ErrorContent.innerText = content
  ErrorCloseBtn.addEventListener('click',
    (event) => {
      ErrorModal.close()
    }, { once: true })
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

const SummaryContent = document.getElementById('summaryContent')

function ShowProductSummary (SummaryData, type, Registerdata) {
  limpiarModal(SummaryModal)
  console.log('Summary getting: ', SummaryData)
  console.log('Register Data: ', Registerdata)
  SummaryContent.innerHTML = '' // limpiar filas anteriores
  SummaryFormTitle.innerText = `Resumen de Nuevo ${type}`

  // Despliegue de los datos
  SummaryData.forEach((content) => {
    console.log('Key: ', content.key, ' Value: ', content.value)

    const SummaryEl = createSummaryElement(content.key, content.value)
    SummaryContent.appendChild(SummaryEl)
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
  console.log('Mostrando Modal de Summary')
  SummaryModal.showModal()
}

async function registerNewProduct (NewProductData, ProductType) {
  const nombre = NewProductData?.Nombre || 'Sin nombre'
  console.log('Mandando datos a backend: ', NewProductData)
  try {
    console.log('POST NEW PRODUCT')

    showSpinner('Guardando Producto')
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
      throw new Error('Error Registrar nuevo Producto')
    }
  } catch (error) {
    ShowErrorModal(`Error al intentar Registrar ${ProductType}`, 'Hubo in fallo en la conexión con la BD. Favor de intentarlo mas tarde')
  } finally {
    hideSpinner()
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
  window.location.reload() // Fuerza la recarga manualmente
}, { once: true })

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
      if (isNaN(precio) || precio <= 0) {
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
