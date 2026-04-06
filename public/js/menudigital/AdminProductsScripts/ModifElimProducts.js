/* CU05 Modificar Platillo Existente */


function ConstruirModifModal(productData, AllCategorys) {
  console.log("¡Hola desde otro Script!")

  const ingData = productData.ingredientes
  console.log("Ing data: ", ingData)

  // Referencias del modal
  const ModifModal      = document.getElementById('RegisterFormsCU04')
  const ModifForm       = document.getElementById('formsRegistrarForm')
  const ModifTitle      = document.getElementById('formsRegistrarTitulo')
  const ModifIdSection  = document.getElementById('idSection')




  // 1. Limpieza
  limpiarModal(ModifModal)
  limpiarModal(ModifForm)

  // Título e ID
  ModifTitle.textContent    = `Modificar ${productData.nombre}`
  ModifIdSection.textContent = `ID: ${productData.id}`

  // 2. Construir fields desde productData
  // Keys que tienen tratamiento especial — se excluyen del loop general
  const KEYS_EXCLUIDAS = ['id', 'ingredientes', 'categoria'] //Nombres Sincronizados con Backend

  Object.entries(productData).forEach(([key, value]) => {
    if (KEYS_EXCLUIDAS.includes(key)) return

    // Inferir el tipo para createFieldElement
    const tipoJS = typeof value
    const field = {
      nombre: key,
      type:   tipoJS,       // 'string', 'number', 'boolean' — createFieldElement ya los mapea
      value:  value,        // valor actual del producto
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
  catalogoIng = ingData
  const ingSection = buildIngredientsSection({ mostrarCantidad: false })
  ingSection.classList.add('is-dynamic')
  ModifForm.appendChild(ingSection)

  // 4. Dropdown de categoría
  const catField = buildCategoriaDropdown(AllCategorys, productData.Categoria)
  catField.classList.add('is-dynamic')
  ModifForm.appendChild(catField)

  // 5. Pre-seleccionar ingredientes actuales en los dropdowns
  precargarIngredientes(ingData)

  // 6. Mostrar modal
  ModifModal.showModal()
}


// ── Dropdown de categoría ──────────────────────────────────
function buildCategoriaDropdown(categorias, valorActual) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('field', 'is-dynamic')
  wrapper.innerHTML = `
    <label class="label">Categoría</label>
    <div class="control">
      <div class="select is-fullwidth">
        <select id="selectCategoria" name="Categoria">
          ${categorias.map(cat => `
            <option value="${cat.ID}" ${cat.Nombre === valorActual ? 'selected' : ''}>
              ${cat.Nombre}
            </option>`).join('')}
        </select>
      </div>
    </div>`
  return wrapper
}

// ── Pre-seleccionar ingredientes en los dropdowns ──────────
function precargarIngredientes(ingData) {
  const rows = document.querySelectorAll('#ingredientsList .ingredient-row')
  ingData.forEach((ing, i) => {
    if (!rows[i]) {
      onBtnIngNewClick()  // crea la fila si no existe
    }
    const dropdown = document.querySelectorAll('#ingredientsList .ing-dropdown')[i]
    if (dropdown) dropdown.value = ing.id
  })
}



function PostProductModif(ingredientesData, ProductData){
  console.log("Posting Modif")
}


/*Fin de Modificar Platillo existente */
