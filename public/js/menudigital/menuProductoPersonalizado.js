console.log('Script Producto Personalizado conectado')

// Boton/elemento trigger de modal personalizacion
document.getElementById('fab-personalizado')
  .addEventListener('click', () => {
    getPersModalData()
  })

// function agruparIngredientesCategoría(){

//

// Esta funcion obtiene todos los datos que el Modal de personalizacion necesita :)
async function getPersModalData () {
  try {
    const respuestaIng = await fetch('/Menu/ingActivos?categoria=Crepas')

    // const respuestaCat = await fetch('/Menu/categorias')

    if (!respuestaIng.ok) {
      throw new Error('Error Interno al obtener ingredientes:')
    }

    const ingData = await respuestaIng.json()
    console.log('ingData: ', ingData)
    const activeIngData = ingData.ingActiveCatalog[0]
    const basePrice = ingData.precioBasePerso[0].precioBaseCrepaPerso
    // console.log("price recived: ", basePrice)


    // console.log("Ingredientes activos obtenidos desde menu: ", activeIngData)
    construirModalPerso(activeIngData, basePrice)
  } catch (err) {
    console.log('Error en frontend: ', err)
    ShowErrorModal('Error en Conexio', 'La conexion fue interrumpida, favor de intentarlo mas tarde')
  } finally {
    console.log('Hidding spinner')
  }
}

// --- Elementos del Modal de Crepas ---
const modalCreacionCrepa = document.getElementById('modal-creacion-crepa')
const modalTituloPersonalizacion = document.getElementById('modal-titulo-personalizacion')
const modalInstruccionesPersonalizacion = document.getElementById('modal-instrucciones-personalizacion')
const placeholderPrecioTotal = document.getElementById('placeholder-precio-total')
const btnCancelarCreacion = document.getElementById('btn-cancelar-creacion')
const btnConfirmarCreacion = document.getElementById('btn-confirmar-creacion')

// Nuevos contenedores divididos
const contenedorUntables = document.getElementById('contenedor-untables')
const contenedorFrutas = document.getElementById('contenedor-frutas')
const contenedorToppings = document.getElementById('contenedor-toppings')

// --- LÓGICA DE CIERRE CON ANIMACIÓN ---
btnCancelarCreacion.addEventListener('click', () => {
  modalCreacionCrepa.classList.add('is-closing')
  modalCreacionCrepa.addEventListener('animationend', () => {
    modalCreacionCrepa.classList.remove('is-closing')
    modalCreacionCrepa.close()
  }, { once: true })
})

// --- LÓGICA DE CONFIRMACIÓN ---
btnConfirmarCreacion.addEventListener('click', () => {
  const miCrepaCustom = RecolectarDatosDeCampos()
  // console.log("¡Lista para el carrito!", miCrepaCustom);
  construirPersoSummary(miCrepaCustom)
  // Aquí mandarías miCrepaCustom a tu lógica de carrito
})

let PrecioBase

// ==========================================
// 1. CONSTRUCTOR PRINCIPAL
// ==========================================
function construirModalPerso (data, basePrice) {
  console.log('Construyendo modal personalizado...')
  PrecioBase = parseFloat(basePrice)

  // Limpiamos los contenedores por si se abrió antes
  contenedorUntables.innerHTML = ''
  contenedorFrutas.innerHTML = ''
  contenedorToppings.innerHTML = ''

  // (Opcional) Aquí podrías filtrar la 'data' si en el backend tienes
  // categorías como 'Relleno' o 'Topping'. Por ahora, pasamos toda la data.
  const insumosDisponibles = data

  // Creamos la primera fila obligatoria en ambas secciones

  crearFilaIngrediente(contenedorUntables, data, true)
  crearFilaIngrediente(contenedorFrutas, data, true)
  crearFilaIngrediente(contenedorToppings, data, true)


  // Calculamos el precio inicial (Base)
  calcularPrecioEnVivo()

  modalCreacionCrepa.showModal()
}

// ==========================================
// 2. GENERADOR DE FILAS (DROPDOWNS DINÁMICOS)
// ==========================================
function crearFilaIngrediente (contenedor, dataInsumos, isFirst = false) {
  // Creamos un wrapper para la fila
  const fila = document.createElement('div')
  fila.classList.add('ingrediente-row')
  fila.style.cssText = 'display: flex; gap: 8px; margin-bottom: 12px; align-items: center; width: 100%;'
  const select = document.createElement('select')
  select.classList.add('input-base', 'ingrediente-select')
  select.style.flexGrow = '1'

  const defaultOption = document.createElement('option')
  defaultOption.value = ''
  defaultOption.textContent = 'Selecciona un ingrediente...'
  select.appendChild(defaultOption)

  dataInsumos.forEach(insumo => {
    if (insumo.Activo == 1) {
      const option = document.createElement('option')
      option.value = insumo.ID_Insumo
      option.textContent = `${insumo.Nombre}`
      option.dataset.nombre = insumo.Nombre
      option.dataset.idInsumo = insumo.ID_Insumo
      select.appendChild(option)
    }
  })

  select.addEventListener('change', calcularPrecioEnVivo)

  // ➕ Botón de Agregar (Siempre presente)
  const btnAdd = document.createElement('button')
  btnAdd.innerHTML = '<i class="fas fa-plus"></i>'
  btnAdd.classList.add('btn-add-ingrediente')
  btnAdd.style.cssText = 'background: #9ab87a; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer;'

  btnAdd.addEventListener('click', () => {
    // Las filas nuevas SIEMPRE nacen con isFirst = false para poder borrarse
    crearFilaIngrediente(contenedor, dataInsumos, false)
  })

  fila.appendChild(select)
  fila.appendChild(btnAdd)

  // 🗑️ Botón de Eliminar (PROHIBIDO en la primera fila)

  if (!isFirst) {
    const btnRemove = document.createElement('button')
    btnRemove.innerHTML = '<i class="fas fa-trash"></i>'
    btnRemove.style.cssText = 'background: #e74c3c; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer;'

    btnRemove.addEventListener('click', () => {
      fila.remove()
      calcularPrecioEnVivo()
    })

    fila.appendChild(btnRemove)
  }

  // Finalmente, insertamos la fila en el contenedor (Adentro o Toppings)
  contenedor.appendChild(fila)
}

// ==========================================
// 3. ACTUALIZACIÓN DE PRECIO EN VIVO
// ==========================================
function calcularPrecioEnVivo () {
  // 1. Contamos cuántos selects tienen algo seleccionado
  const todosLosSelects = modalCreacionCrepa.querySelectorAll('.ingrediente-select')
  let totalIngredientes = 0

  todosLosSelects.forEach(select => {
    if (select.value !== '') totalIngredientes++
  })

  // 2. Aplicamos la lógica escalonada
  let nuevoPrecio = 0

  if (totalIngredientes === 0) {
    nuevoPrecio = 0
  } else if (totalIngredientes <= 3) {
    // 1=99, 2=109, 3=119
    nuevoPrecio = 99 + (totalIngredientes - 1) * 10
  } else {
    // Más de 3: Base 119 + 15 por cada extra
    nuevoPrecio = 119 + (totalIngredientes - 3) * 15
  }

  // 3. Bloqueo de seguridad: Si no hay ingredientes, desactivamos el botón de confirmar
  btnConfirmarCreacion.disabled = (totalIngredientes < 1)
  btnConfirmarCreacion.style.opacity = (totalIngredientes < 1) ? '0.5' : '1'

  placeholderPrecioTotal.innerText = `$${nuevoPrecio.toFixed(2)}`
}
// ==========================================
// 4. RECOLECCIÓN DE DATOS (PARA EL CARRITO)
// ==========================================
function RecolectarDatosDeCampos () {
  console.log('🧺 Recolectando receta de autor...')

  const ingredientes_adentro = []
  const ingredientes_toppings = []

  // Helper para no repetir código de extracción
  const extraerDeContenedor = (idContenedor, seccionNombre) => {
    const contenedor = document.getElementById(idContenedor)
    const selects = contenedor.querySelectorAll('.ingrediente-select')

    selects.forEach(select => {
      const opt = select.options[select.selectedIndex]
      if (opt && opt.value !== '') {
        const item = {
          id_insumo: opt.dataset.idInsumo,
          nombre: opt.dataset.nombre,
          // 🏷️ Esta etiqueta es la clave para el Summary
          seccion: seccionNombre
        }

        // Lógica de "Merge" para el Backend:
        // Untables y Frutas se consideran "Adentro"
        if (seccionNombre === 'untable' || seccionNombre === 'fruta') {
          ingredientes_adentro.push(item)
        } else {
          ingredientes_toppings.push(item)
        }
      }
    })
  }

  // Ejecutamos la extracción por cada sección visual
  extraerDeContenedor('contenedor-untables', 'untable')
  extraerDeContenedor('contenedor-frutas', 'fruta')
  extraerDeContenedor('contenedor-toppings', 'topping')

  // Calculamos el total de ingredientes para el Policía
  const totalIng = ingredientes_adentro.length + ingredientes_toppings.length

  return {
    id: 'PD_COMODIN',
    producto_base: 'Crepa Personalizada',
    // Obtenemos el precio directamente del placeholder que calculamos en vivo
    precio_total: parseFloat(placeholderPrecioTotal.innerText.replace('$', '')),
    ingredientes_adentro,
    ingredientes_toppings,
    cantidad_total: totalIng
  }
}

// --- Elementos del Modal de Resumen ---
const modalResumenCrepa = document.getElementById('modal-resumen-crepa')
const listaResumenToppings = document.getElementById('resumen-lista-toppings')
const listaResumenAdentro = document.getElementById('resumen-lista-adentro')
const resumenPrecioTotal = document.getElementById('resumen-precio-total')

const btnEditarReceta = document.getElementById('btn-editar-receta')
const btnAgregarCarrito = document.getElementById('btn-agregar-carrito')

// Variable global para guardar la receta final en espera
let recetaFinalPendiente = null

function construirPersoSummary (receta) {
  console.log('📝 [SUMMARY] Generando resumen visual...')
  recetaFinalPendiente = receta

  // 1. Referencias a las listas
  const listaUntables = document.getElementById('resumen-lista-untables')
  const listaFrutas = document.getElementById('resumen-lista-frutas')
  const listaToppings = document.getElementById('resumen-lista-toppings')

  // Si la lista quedó vacía, añadimos un mensaje elegante
  if (listaUntables.innerHTML === '') listaUntables.innerHTML = '<li class="mensaje-vacio">Sin untables.</li>'
  if (listaFrutas.innerHTML === '') listaFrutas.innerHTML = '<li class="mensaje-vacio">Sin frutas.</li>'
  if (listaToppings.innerHTML === '') listaToppings.innerHTML = '<li class="mensaje-vacio">Sin toppings.</li>';

  // Limpieza total
  [listaUntables, listaFrutas, listaToppings].forEach(l => l.innerHTML = '')

  // 2. Conteo Total (Sumamos los dos arrays que vienen del frontend)
  const n = receta.ingredientes_adentro.length + receta.ingredientes_toppings.length

  // 3. Llenar Listas usando la propiedad .seccion
  receta.ingredientes_adentro.forEach(ing => {
    if (ing.seccion === 'untable') {
      listaUntables.appendChild(crearElementoListaResumen(ing))
    } else if (ing.seccion === 'fruta') {
      listaFrutas.appendChild(crearElementoListaResumen(ing))
    }
  })

  receta.ingredientes_toppings.forEach(ing => {
    listaToppings.appendChild(crearElementoListaResumen(ing))
  })

  // 4. Énfasis en la Cantidad y Precio
  document.getElementById('resumen-badge-conteo').innerText = `${n} ingredientes seleccionados`
  document.getElementById('resumen-precio-total').innerText = `$${receta.precio_total.toFixed(2)}`

  // Leyenda explicativa para el cliente
  const leyenda = document.getElementById('resumen-leyenda-precio')
  if (n <= 3) {
    leyenda.innerText = `Paquete Esencial (${n}/3)`
  } else {
    leyenda.innerText = `Paquete Pro (+${n - 3} extra)`
  }

  // 5. Transición de modales
  document.getElementById('modal-creacion-crepa').close()

  // 6. Botón de confirmación con limpieza de eventos previa
  btnAgregarCarrito.onclick = () => {
    // Enriquecemos el objeto para el carrito
    const itemFinal = {
      ...receta,
      nombre: `Crepa de Autor (${n} Ing.)`,
      resumen_visual: `${n} ingredientes`
    }

    agregarAlCarrito(itemFinal)
    modalResumenCrepa.close()
  }

  modalResumenCrepa.showModal()
}

// Función auxiliar para crear los <li> de la receta (Versión Limpia)
function crearElementoListaResumen(ingrediente) {
  const li = document.createElement('li');
  
  // No mostramos precios individuales para mantener coherencia con el sistema de paquetes
  li.innerHTML = `
        <span class="ingrediente-nombre">• ${ingrediente.nombre}</span>
        <span class="ingrediente-incluido">Incluido</span>
    `;
  return li;
}

// Constructor de Summary
function construirPersoSummary(receta) {
  console.log('📝 [SUMMARY] Generando resumen visual...', receta);
  recetaFinalPendiente = receta;

  const listaUntables = document.getElementById('resumen-lista-untables');
  const listaFrutas = document.getElementById('resumen-lista-frutas');
  const listaToppings = document.getElementById('resumen-lista-toppings');

  // Limpieza de listas previa
  if (listaUntables) listaUntables.innerHTML = '';
  if (listaFrutas) listaFrutas.innerHTML = '';
  if (listaToppings) listaToppings.innerHTML = '';

  const n = receta.ingredientes_adentro.length + receta.ingredientes_toppings.length;

  // Llenar Listas
  receta.ingredientes_adentro.forEach(ing => {
    if (ing.seccion === 'untable' && listaUntables) {
      listaUntables.appendChild(crearElementoListaResumen(ing));
    } else if (ing.seccion === 'fruta' && listaFrutas) {
      listaFrutas.appendChild(crearElementoListaResumen(ing));
    }
  });

  receta.ingredientes_toppings.forEach(ing => {
    if (listaToppings) listaToppings.appendChild(crearElementoListaResumen(ing));
  });

  // Mensajes de lista vacía
  if (listaUntables?.innerHTML === '') listaUntables.innerHTML = '<li class="mensaje-vacio">Sin untables.</li>';
  if (listaFrutas?.innerHTML === '') listaFrutas.innerHTML = '<li class="mensaje-vacio">Sin frutas.</li>';
  if (listaToppings?.innerHTML === '') listaToppings.innerHTML = '<li class="mensaje-vacio">Sin toppings.</li>';

  // Actualizar indicadores visuales
  const badge = document.getElementById('resumen-badge-conteo');
  const precioTxt = document.getElementById('resumen-precio-total');
  const leyenda = document.getElementById('resumen-leyenda-precio');

  if (badge) badge.innerText = `${n} ingredientes seleccionados`;
  if (precioTxt) precioTxt.innerText = `$${receta.precio_total.toFixed(2)}`;
  if (leyenda) {
    leyenda.innerText = n <= 3 ? `Paquete Esencial (${n}/3)` : `Paquete Pro (+${n - 3} extra)`;
  }

  document.getElementById('modal-creacion-crepa').close();

  // Configuración del botón final
  btnAgregarCarrito.onclick = () => {
    const itemFinal = {
      ...receta,
      nombre: `Crepa de Autor (${n} Ing.)`,
      resumen_visual: `${n} ingredientes`
    };
    agregarAlCarrito(itemFinal);
    modalResumenCrepa.close();
  };

  modalResumenCrepa.showModal();
}
// Función auxiliar para crear los <li> de la receta
function crearElementoListaResumen (ingrediente) {
  const li = document.createElement('li')

  // Si el ingrediente cuesta 0 (incluido), mostramos "Incluido", si no, el precio extra.
  const textoPrecio = ingrediente.precio > 0 ? `+$${ingrediente.precio.toFixed(2)}` : 'Incluido'

  li.innerHTML = `
        <span class="ingrediente-nombre">• ${ingrediente.nombre}</span>
        <span class="ingrediente-precio">${textoPrecio}</span>
    `
  return li
}

// --- ACCIONES DEL MODAL DE RESUMEN ---

// Si el usuario quiere regresar a editar
btnEditarReceta.addEventListener('click', () => {
  modalResumenCrepa.close()
  document.getElementById('modal-creacion-crepa').showModal()
})
