// JS FRONTEND de la vista de Productos del Admin

/* CU Registrar Nuevo Producto */
// 1. Referencia a Boton
console.log('Iniciando Setup de CU')
const registerButton = document.getElementById('registrarNuevoProducto')
registerButton.addEventListener('click', registerButtonOnClick)

const typeFormsModal = document.getElementById('TypeFormsCU04')
const typeFormsTitle = document.getElementById('tituloModal')
const typeFormsCloseBtn = document.getElementById('cerrarModal')

function registerButtonOnClick(event) {
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
      console.log("Estructura real de objeto:", objeto);
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
        newbtn.onclick =async (event) => {
          event.preventDefault();
          typeFormsModal.close() //Cerramos el Modal Actual
          await seleccionarTipoProducto(t.id); 
};
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

async function seleccionarTipoProducto(id) {
    //Equivalente a los .then()
    try {
        console.log(`Iniciando fetch para el ID: ${id}`);
        
        /* 1. Primer Fetch: Obtener campos del producto */
        const respuesta = await fetch(`/menu/formsRegistraPlatillo?id=${id}`);

        if (!respuesta.ok){
          throw new Error("Error al obtener formulario de Registro de Producto");
        } 
        
        const object = await respuesta.json();
        console.log("Datos recibidos:", object);
        //Separación

        const ProductFields = object.data.Fields
        const AllIngredientes = object.data.Ingredientes
        createProductRegisterForms(ProductFields,AllIngredientes,id)

        

    } 
    catch (error) {
        console.error("Hubo un fallo en la operación:", error);
        alert("No se pudo cargar la configuración del producto.");
    }
}


/* == Funcion de creación de Modal Registrar Producto == */

/* ── Helpers de campo por tipo ── */
function createFieldElement(field) {
  const wrapper = document.createElement('div')
  wrapper.classList.add('field', 'is-dynamic')


  const label = document.createElement('label')
  label.classList.add('label' ,'is-dynamic')
  label.textContent = field.nombre
  label.setAttribute('for', `field-${field.nombre}`)

  const control = document.createElement('div')
  control.classList.add('control', 'is-dynamic')

  let input

  if (field.type === 'select') {
    // ── Select / dropdown ──
    const selectWrapper = document.createElement('div')
    selectWrapper.classList.add('select', 'is-fullwidth', 'is-dynamic')

    input = document.createElement('select')
    input.id = `field-${field.nombre}`
    input.name = field.nombre
    input.required = true

    const placeholder = document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = `Selecciona ${field.nombre}...`
    placeholder.disabled = true
    placeholder.selected = true
    input.appendChild(placeholder)

    // Si el field trae opciones, las agrega
    if (Array.isArray(field.opciones)) {
      field.opciones.forEach(op => {
        const option = document.createElement('option')
        option.value = op
        option.textContent = op
        input.appendChild(option)
      })
    }

    selectWrapper.appendChild(input)
    control.appendChild(selectWrapper)

  } else {
    // ── text | number | date ──
    input = document.createElement('input')
    input.classList.add('input')
    input.id = `field-${field.nombre}`
    input.name = field.nombre
    input.required = true

    const typeMap = { texto: 'text', numero: 'number', fecha: 'date' }
    input.type = typeMap[field.type] ?? 'text'

    if (field.placeholder) input.placeholder = field.placeholder

    control.appendChild(input)
  }

  wrapper.appendChild(label)
  wrapper.appendChild(control)
  return wrapper
}


function createIngElement(ing){
  //Creamos el elemento 
  console.log("Creando opcion de ingrediene...")
  const opt = document.createElement('option')
  opt.value = ing.id
  opt.textContent = `${ing.nombre}: $${ing.precio}`
  return opt
}


const RegisterFormModal = document.getElementById('RegisterFormsCU04')
const RegisterFormTitle = document.getElementById('formsRegistrarTitulo')
const RegisterFormClose = document.getElementById('cerrarFormsRegistrar')
const RegisterFormEl = document.getElementById('formsRegistrarForm')
const DropdownIngredientes =document.getElementById('DropdownIngredientes')


function createProductRegisterForms(Fields, Ingredientes, type) {
  //Limpieza
  limpiarModal(RegisterFormModal)
  DropdownIngredientes.innerHTML = '<option value="">Cargando opciones...</option>'

  RegisterFormTitle.textContent = `Registro de nuevo ${type}`

  // Inyectar un campo por cada field
  Fields.forEach(field => {
    const fieldEl = createFieldElement(field)
    RegisterFormEl.appendChild(fieldEl)
  })

  Ingredientes.forEach(ing =>{
    console.log('listo para agregar ingredientes :)')
    const optionIngEl = createIngElement(ing)
    DropdownIngredientes.appendChild(optionIngEl)
  })

  RegisterFormModal.showModal()
}

// Cerrar
RegisterFormClose.addEventListener('click', () => {
  RegisterFormModal.close()

})

// Submit → consola
RegisterFormEl.addEventListener('submit', (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(RegisterFormEl))
  console.log('📋 Datos del formulario:', data)
})










/* == FIN Modal Registrar Producto == */


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
