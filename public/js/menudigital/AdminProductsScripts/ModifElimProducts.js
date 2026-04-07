/* global ShowErrorModal, showSuccessModal, catalogoIng:writable, limpiarModal, createFieldElement, buildIngredientsSection, SetRegisterButtons, onBtnIngNewClick, getIngredientesSeleccionados, validarDatosRegistro */
/* exported ConstruirModifModal, ModifyProduct */

/* CU05 Modificar Platillo Existente */

async function getAllIngredientesCatalog () {
  try {
    const response = await fetch('/Menu/globalAdminIngredientes')

    if (!response.ok) {
      ShowErrorModal('Error en Backend global', 'No es posible obtener ingredientes')
      return
    }

    const ingCatalogData = await response.json()
    return ingCatalogData.ingCatalog[0]
  } catch (error) {
    ShowErrorModal('Error en funcion global', 'No es posible obtener ingredientes')
  }
}

// Referencias del modal
const ModifModal = document.getElementById('RegisterFormsCU04')
const ModifForm = document.getElementById('formsRegistrarForm')
const ModifTitle = document.getElementById('formsRegistrarTitulo')
document.getElementById('cerrarFormsRegistrar').addEventListener('click', (event) => {
  event.preventDefault()
  ModifModal.close()
})

async function ConstruirModifModal (productData, AllCategorys) {
  console.log('¡Hola desde otro Script!')
  const ModifIdSection = document.getElementById('idSection')

  const ingData = productData.ingredientes
  console.log('Ingrediente data: ', ingData)

  console.log('Obteniendo catalogo global de ingredientes ')
  catalogoIng = await getAllIngredientesCatalog()
  console.log('Catalogo de ingredientes obtenido para modificacion: ', catalogoIng)

  // 1. Limpieza
  limpiarModal(ModifModal)
  limpiarModal(ModifForm)

  // Título e ID
  ModifTitle.textContent = `Modificar ${productData.nombre}`
  ModifIdSection.textContent = `ID: ${productData.id}`

  // 2. Construir fields desde productData
  // Keys que tienen tratamiento especial — se excluyen del loop general
  const KEYS_EXCLUIDAS = ['id', 'ingredientes', 'categoria'] // Nombres Sincronizados con Backend

  Object.entries(productData).forEach(([key, value]) => {
    if (KEYS_EXCLUIDAS.includes(key)) return

    // Inferir el tipo para createFieldElement
    const tipoJS = typeof value
    const field = {
      nombre: key,
      type: tipoJS, // 'string', 'number', 'boolean' — createFieldElement ya los mapea
      value // valor actual del producto
    }
    const fieldEl = createFieldElement(field)

    // Pre-llenar el input con el valor actual
    const input = fieldEl.querySelector('input')
    if (input) {
      if (input.type === 'checkbox') input.checked = Boolean(value)
      else input.value = value ?? ''
    }

    fieldEl.classList.add('is-dynamic')
    ModifForm.appendChild(fieldEl)
  })

  // 3. Sección ingredientes (sin botón de cantidad)
  const ingSection = buildIngredientsSection({ mostrarCantidad: false })
  ingSection.classList.add('is-dynamic')
  ModifForm.appendChild(ingSection)

  // 4. Dropdown de categoría
  console.log('Mi categoría es : ', productData)
  const catField = buildCategoriaDropdown(AllCategorys, productData.categoria)
  catField.classList.add('is-dynamic')
  ModifForm.appendChild(catField)

  // 5. Pre-seleccionar ingredientes actuales en los dropdowns
  precargarIngredientes(ingData, productData)

  // 6. Conectar Botones
  SetRegisterButtons('MODIFY', catalogoIng, productData)

  // 7. Mostrar modal
  ModifModal.showModal()
}

// ── Dropdown de categoría ──────────────────────────────────
function buildCategoriaDropdown (categorias, valorActual) {
  console.log('Categorías: ', categorias, ' Mi valor actual -> ', valorActual)
  const wrapper = document.createElement('div')
  wrapper.classList.add('field', 'is-dynamic')
  wrapper.innerHTML = `
    <label class="label">Categoría</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select id="selectCategoria" name="Categoria">
          ${categorias.map(cat => `
            <option value="${cat.nombre}" ${cat.nombre === valorActual ? 'selected' : ''}>
              ${cat.nombre}
            </option>`).join('')}
        </select>
      </div>
    </div>`
  return wrapper
}

// ── Pre-seleccionar ingredientes en los dropdowns ──────────
function precargarIngredientes (ingData) {
  const rows = document.querySelectorAll('#ingredientsList .ingredient-row')
  ingData.forEach((ing, i) => {
    if (!rows[i]) {
      onBtnIngNewClick() // crea la fila si no existe
    }
    const dropdown = document.querySelectorAll('#ingredientsList .ing-dropdown')[i]
    if (dropdown) dropdown.value = ing.id
  })
}

function ModifyProduct (BackupIngredientes, oldProductData) {
  // 1. Validación front
  if (!ModifForm.checkValidity()) {
    ModifForm.reportValidity()
    return
  }

  // 2. Recolectar campos normales (FormData)
  const formData = new FormData(ModifForm)
  const data = {}
  formData.forEach((value, key) => {
    const el = ModifForm.querySelector(`[name="${key}"]`)
    // El '?' sirve para comprobar si el existe -> no hacer ifs ilegibles :)
    if (el?.dataset.ingField) return // ← se salta este campo
    data[key] = value === '' ? null : value
  })

  // 3. Checkboxes manuales
  ModifForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    data[cb.name] = cb.checked
  })

  // 4. Ingredientes — array separado de ingredientes
  const ingredientes = getIngredientesSeleccionados()
  console.log('Ingredientes Get: ', ingredientes)

  // 5. Validación de Reglas de negocio
  const validacion = validarDatosRegistro(data, BackupIngredientes)

  if (validacion) {
    console.log('Datos válidos :)')

    // Construir array para ShowProductSummary incluyendo ingredientes
    const summaryData = Object.entries(data)
      .filter(([key]) => key !== 'ingredientes') // los ingredientes se muestran aparte
      .map(([key, value]) => ({ key, value }))

    ingredientes.forEach((ing, i) => {
      summaryData.push({ key: `Ingrediente ${i + 1}`, value: ing.nombre })
    })

    data.ingredientes = []

    // Salvamos todos los ingredientes
    ingredientes.forEach((ing) => {
      data.ingredientes.push(ing)
    })

    // Agregamos el id

    data.id = oldProductData.id

    console.log('Data save en Modify product: ', data)
    const formattedNewData = (Array.isArray(data) ? data : Object.entries(data)).reduce((acc, item) => {
    // Si es Array, sacamos key/value del objeto. Si es Object.entries, vienen como [key, value]
      const key = (item.key || item[0]).toLowerCase()
      const value = item.value !== undefined ? item.value : item[1]
      acc[key] = value
      return acc
    }, {})

    // Verificar cambios y mostrar Resumen
    const verifModif = verificarCambiosNormalizados(oldProductData, data)
    if (verifModif.huboCambios) {
      console.log('Cambios Detectados')
      ModifModal.close()
      ShowModifySummary(formattedNewData, oldProductData, data, verifModif.campos)
    } else {
      ShowErrorModal('Cambios No detectados', 'No hubo cambios en el producto')
    }
  } else {
    console.log('Datos inválidos ;(')
    ShowErrorModal('Datos inválidos', 'Datos Invalidos en Campos de Formulario, favor de corregir')
  }

  // console.log('Datos de Modificación:', data)
}

/* Crear vista old vs new */
const modifSummaryModal = document.getElementById('modifSummaryCU05')
const modifSummaryFormTitle = document.getElementById('SummaryTitleModif')
const modifSummaryCloseBtn = document.getElementById('cerrarSummaryModif')
const modifSummaryRegisterbtn = document.getElementById('RegisterModification')
const modifSummaryContent = document.getElementById('modifSummaryContent')

function conectarBotonesSummaryModif (modifiedData) {
  modifSummaryCloseBtn.addEventListener('click', (event) => {
    event.preventDefault()
    modifSummaryModal.close()
    ModifModal.showModal()
  }, { once: true })

  modifSummaryRegisterbtn.addEventListener('click', (event) => {
    event.preventDefault()
    postModifiedProduct(modifiedData)
  }, { once: true })
}

// ── Normaliza cualquier valor a string legible para el usuario ──
function formatearValor (valor) {
  if (Array.isArray(valor)) {
    // Array de ingredientes [{id, nombre}] → "Bubulubu, Mocha"
    return valor.map(v => v.nombre ?? v).join(', ') || '—'
  }
  if (valor === null || valor === undefined || valor === '') return '—'
  if (typeof valor === 'boolean' || valor === '1' || valor === '0') {
    return valor === '1' || valor === true ? 'Activo' : 'Inactivo'
  }
  return String(valor)
}

// ── Construye una fila de la tabla comparativa ──
function crearFilaComparativa (key, valorOld, valorNew, huboCambio) {
  const clase = huboCambio ? 'con-cambio' : 'sin-cambio'
  const oldTexto = formatearValor(valorOld)
  const newTexto = formatearValor(valorNew)

  return `
    <div class="modif-summary-row ${clase}">
      <span class="modif-col-label">${key}</span>
      <span class="modif-col-old">${oldTexto}</span>
      <span class="modif-col-new">${newTexto}</span>
    </div>`
}

function ShowModifySummary (NewData, oldProductData, PostData, camposModif) {
  /* console.log('New product Data:', NewData)
  console.log('Old product Data:', oldProductData)
  console.log('Campos diferentes:', camposModif)
  */

  console.log('Construyendo Modal de COmparación')
  // Limpiar filas anteriores
  modifSummaryContent.innerHTML = ''
  modifSummaryFormTitle.textContent = `Modificar ${oldProductData.nombre ?? ''}`

  // Iteramos por las keys de oldProductData — tiene todas, incluyendo id
  Object.keys(oldProductData).forEach(key => {
    const valorOld = oldProductData[key]
    const valorNew = NewData[key] // undefined si NewData no tiene esa key
    const hubocambio = camposModif.includes(key)
    console.log(hubocambio)

    // El ID solo se muestra como referencia, sin columna "nuevo"
    if (key === 'id') {
      modifSummaryContent.insertAdjacentHTML('beforeend', `
        <div class="modif-summary-row sin-cambio">
          <span class="modif-col-label">id</span>
          <span class="modif-col-old" style="text-decoration:none">${valorOld}</span>
          <span class="modif-col-new" style="color:#bbb;">—</span>
        </div>`)
      return
    }

    modifSummaryContent.insertAdjacentHTML(
      'beforeend',
      crearFilaComparativa(key, valorOld, valorNew, camposModif.includes(key))
    )
  })

  console.log('Conectar botones y mostrar')
  // Conectar botones y mostrar
  conectarBotonesSummaryModif(PostData)
  modifSummaryModal.close() //
  modifSummaryModal.showModal()
  console.log('¿Está abierto?:', modifSummaryModal.open)
  console.log('Display actual:', window.getComputedStyle(modifSummaryModal).display)
}

async function postModifiedProduct (data) {
  console.log('Sending data to backend:', data)
  try {
    const postrequest = await fetch(`/menu/modifProduct/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    const response = await postrequest.json()

    if (!response.ok) {
      ShowErrorModal('Error Registrar Modificacion', 'La modificacion no se pudo registrar en la base de datos')
      return
    }

    // Exito
    showSuccessModal('Modificaciones Exitosas', 'Modificacion en la Base de Datos')
  } catch (error) {

  }
}

// Funciones Auxiliares
function verificarCambiosNormalizados (obj1, obj2) {
  const llavesAIgnorar = ['id', 'prototype', 'createdat', 'updatedat']
  const camposModificados = [] // Array para guardar las llaves diferentes

  const obtenerValorNormalizado = (llave, valor) => {
    if (valor === null || valor === undefined) return ''

    if (llave.toLowerCase() === 'ingredientes' && Array.isArray(valor)) {
      return JSON.stringify(
        valor
          .filter(ing => ing && (ing.id !== undefined && ing.id !== null))
          .map(ing => String(ing.id))
          .sort()
      )
    }
    return String(valor).trim()
  }

  const normalizarObjeto = (obj) => {
    const nuevo = {}
    if (!obj) return nuevo
    Object.keys(obj).forEach(k => {
      nuevo[k.toLowerCase()] = obj[k]
    })
    return nuevo
  }

  const plano1 = normalizarObjeto(obj1)
  const plano2 = normalizarObjeto(obj2)
  const todasLasLlaves = Array.from(new Set([...Object.keys(plano1), ...Object.keys(plano2)]))

  for (const llave of todasLasLlaves) {
    if (llavesAIgnorar.includes(llave.toLowerCase())) continue

    const val1 = obtenerValorNormalizado(llave, plano1[llave])
    const val2 = obtenerValorNormalizado(llave, plano2[llave])

    if (val1 !== val2) {
      // En lugar de salir, guardamos la llave que cambió
      camposModificados.push(llave)
      console.log(`%c Diferencia en: ${llave}`, 'color: yellow; background: black;')
    }
  }

  // Lógica de retorno
  if (camposModificados.length > 0) {
    return {
      huboCambios: true,
      campos: camposModificados
    }
  }

  ShowErrorModal('Sin cambios', 'No se detectaron modificaciones en el producto.')
  return {
    huboCambios: false,
    campos: []
  }
}

console.log(ConstruirModifModal, ModifyProduct) // Esto cuenta como "uso" y limpia el error.

/* Fin de Modificar Platillo existente */
