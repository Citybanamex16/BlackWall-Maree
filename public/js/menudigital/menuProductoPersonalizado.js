console.log("Script Producto Personalizado conectado")

//Boton/elemento trigger de modal personalizacion 
document.getElementById("fab-personalizado")
.addEventListener("click", () =>{
	getPersModalData()
})



//function agruparIngredientesCategoría(){

//

//Esta funcion obtiene todos los datos que el Modal de personalizacion necesita :)
async function getPersModalData(){
	try{
		//Nos vamos a traer las categorías y los ingredientes
		const respuestaIng = await fetch('/Menu/ingActivos')
		//const respuestaCat = await fetch('/Menu/categorias')

		if(!respuestaIng.ok){
			throw new Error("Error Interno al obtener ingredientes:")
		} 

		const ingData = await respuestaIng.json()
		console.log("ingData: ", ingData)
		const activeIngData = ingData.ingActiveCatalog[0]
		const basePrice = ingData.precioBasePerso[0].precioBaseCrepaPerso
		//console.log("price recived: ", basePrice)

		
		//console.log("Ingredientes activos obtenidos desde menu: ", activeIngData)
		construirModalPerso(activeIngData, basePrice)

	} catch (err){
		console.log("Error en frontend: ", err)
		ShowErrorModal("Error en Conexio", "La conexion fue interrumpida, favor de intentarlo mas tarde")

	} finally{
		console.log("Hidding spinner")

	}
	
}


// --- Elementos del Modal de Crepas ---
const modalCreacionCrepa = document.getElementById('modal-creacion-crepa');
const modalTituloPersonalizacion = document.getElementById('modal-titulo-personalizacion');
const modalInstruccionesPersonalizacion = document.getElementById('modal-instrucciones-personalizacion');
const placeholderPrecioTotal = document.getElementById('placeholder-precio-total');
const btnCancelarCreacion = document.getElementById('btn-cancelar-creacion');
const btnConfirmarCreacion = document.getElementById('btn-confirmar-creacion');

// Nuevos contenedores divididos
const contenedorAdentro = document.getElementById('contenedor-ingredientes-adentro');
const contenedorToppings = document.getElementById('contenedor-toppings');



// --- LÓGICA DE CIERRE CON ANIMACIÓN ---
btnCancelarCreacion.addEventListener('click', () => {
    modalCreacionCrepa.classList.add('is-closing');
    modalCreacionCrepa.addEventListener('animationend', () => {
        modalCreacionCrepa.classList.remove('is-closing');
        modalCreacionCrepa.close();
    }, { once: true });
});

// --- LÓGICA DE CONFIRMACIÓN ---
btnConfirmarCreacion.addEventListener("click", () => {
    const miCrepaCustom = RecolectarDatosDeCampos();
    console.log("¡Lista para el carrito!", miCrepaCustom);
    // Aquí mandarías miCrepaCustom a tu lógica de carrito
});


let PrecioBase 


// ==========================================
// 1. CONSTRUCTOR PRINCIPAL
// ==========================================
function construirModalPerso(data, basePrice) {
    console.log("Construyendo modal personalizado...");
    PrecioBase = parseFloat(basePrice)
    
    // Limpiamos los contenedores por si se abrió antes
    contenedorAdentro.innerHTML = '';
    contenedorToppings.innerHTML = '';
    
    // (Opcional) Aquí podrías filtrar la 'data' si en el backend tienes 
    // categorías como 'Relleno' o 'Topping'. Por ahora, pasamos toda la data.
    const insumosDisponibles = data;

    // Creamos la primera fila obligatoria en ambas secciones
    crearFilaIngrediente(contenedorAdentro, insumosDisponibles, true);
    crearFilaIngrediente(contenedorToppings, insumosDisponibles, true);

    // Calculamos el precio inicial (Base)
    calcularPrecioEnVivo();

    modalCreacionCrepa.showModal();
}

// ==========================================
// 2. GENERADOR DE FILAS (DROPDOWNS DINÁMICOS)
// ==========================================
function crearFilaIngrediente(contenedor, dataInsumos, isFirst = false) {
    // Creamos un wrapper para la fila
    const fila = document.createElement('div');
    fila.classList.add('ingrediente-row');
    fila.style.cssText = 'display: flex; gap: 8px; margin-bottom: 12px; align-items: center; width: 100%;';

    // 2.1 Crear el Select (Dropdown)
    const select = document.createElement('select');
    select.classList.add('input-base', 'ingrediente-select'); // Usando tu clase global
    select.style.flexGrow = '1';
    
    // Opción por defecto
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Selecciona un ingrediente...";
    defaultOption.dataset.precio = 0; // Precio 0 si no escoge nada
    select.appendChild(defaultOption);

    // Llenar con la data del Backend
    dataInsumos.forEach(insumo => {
        if (insumo.Activo == 1) { // Solo si está activo
            const option = document.createElement('option');
            option.value = insumo.ID_Insumo;
            option.textContent = `${insumo.Nombre} (+$${insumo.Precio})`;
            
            // ¡MAGIA!: Embebemos los datos en el HTML para recolectarlos fácil después
            option.dataset.precio = insumo.Precio;
            option.dataset.nombre = insumo.Nombre;
            option.dataset.idInsumo = insumo.ID_Insumo;
            
            select.appendChild(option);
        }
    });

    // 2.2 Escuchador de cambios para el precio en vivo
    select.addEventListener('change', calcularPrecioEnVivo);

    // 2.3 Botón de Agregar [+]
    const btnAdd = document.createElement('button');
    btnAdd.innerHTML = '<i class="fas fa-plus"></i>'; // Asumiendo que usas FontAwesome
    btnAdd.classList.add('btn-add-ingrediente');
    btnAdd.style.cssText = 'background: #9ab87a; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer;';
    
    btnAdd.addEventListener('click', () => {
        // Al hacer clic, crea OTRA fila en este mismo contenedor, pero isFirst es false
        crearFilaIngrediente(contenedor, dataInsumos, false);
    });

    // Añadimos Select y Botón Add a la fila
    fila.appendChild(select);
    fila.appendChild(btnAdd);

    // 2.4 Botón de Eliminar [-] (Solo si NO es el primero)
    if (!isFirst) {
        const btnRemove = document.createElement('button');
        btnRemove.innerHTML = '<i class="fas fa-trash"></i>';
        btnRemove.style.cssText = 'background: #e74c3c; color: white; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer;';
        
        btnRemove.addEventListener('click', () => {
            fila.remove(); // Eliminamos el HTML
            calcularPrecioEnVivo(); // Recalculamos el precio al quitarlo
        });
        
        fila.appendChild(btnRemove);
    }

    // Finalmente, insertamos la fila en el contenedor (Adentro o Toppings)
    contenedor.appendChild(fila);
}

// ==========================================
// 3. ACTUALIZACIÓN DE PRECIO EN VIVO
// ==========================================
function calcularPrecioEnVivo() {
	console.log("Calculando precio en vivo a partir de precio base: ", PrecioBase)
    let total = PrecioBase;
    
    // Buscamos TODOS los selects dentro del modal
    const todosLosSelects = modalCreacionCrepa.querySelectorAll('.ingrediente-select');

    todosLosSelects.forEach(select => {
        // Obtenemos la opción que está seleccionada actualmente
        const opcionSeleccionada = select.options[select.selectedIndex];
        
        // Sacamos el precio embebido en el dataset (lo pasamos a Float por si es string)
        const precioExtra = parseFloat(opcionSeleccionada.dataset.precio) || 0;
        total += precioExtra;
    });

    // Actualizamos el HTML visual
    
    placeholderPrecioTotal.innerText = `$${total.toFixed(2)}`;
}

// ==========================================
// 4. RECOLECCIÓN DE DATOS (PARA EL CARRITO)
// ==========================================
function RecolectarDatosDeCampos() {
    console.log("Recolectando receta...");
    
    const recetaFinal = {
        producto_base: "Crepa Personalizada",
        precio_total: parseFloat(placeholderPrecioTotal.innerText.replace('$', '')),
        ingredientes_adentro: [],
        ingredientes_toppings: []
    };

    // 4.1 Recolectar de la sección "Adentro"
    const selectsAdentro = contenedorAdentro.querySelectorAll('.ingrediente-select');
    selectsAdentro.forEach(select => {
        const opt = select.options[select.selectedIndex];
        if (opt.value !== "") { // Si no es la opción por defecto
            recetaFinal.ingredientes_adentro.push({
                id_insumo: opt.dataset.idInsumo,
                nombre: opt.dataset.nombre,
                precio: parseFloat(opt.dataset.precio)
            });
        }
    });

    // 4.2 Recolectar de la sección "Toppings"
    const selectsToppings = contenedorToppings.querySelectorAll('.ingrediente-select');
    selectsToppings.forEach(select => {
        const opt = select.options[select.selectedIndex];
        if (opt.value !== "") {
            recetaFinal.ingredientes_toppings.push({
                id_insumo: opt.dataset.idInsumo,
                nombre: opt.dataset.nombre,
                precio: parseFloat(opt.dataset.precio)
            });
        }
    });

    return recetaFinal;
}







