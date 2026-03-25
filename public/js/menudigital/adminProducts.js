//JS FRONTEND de la vista de Productos del Admin


/*CU Registrar Nuevo Producto*/
//1. Referencia a Boton
console.log("Iniciando Setup de CU")
const registerButton = document.getElementById('registrarNuevoProducto')
registerButton.addEventListener('click',registerButtonOnClick)

const typeFormsModal = document.getElementById('TypeFormsCU04')
const typeFormsTitle = document.getElementById('tituloModal')
const typeFormsCloseBtn = document.getElementById('cerrarModal')


function registerButtonOnClick(event) {
	//Logica de Registrar Nuevo Producto
	event.preventDefault()
	console.log("Iniciando CU Registrar Nuevo Producto...")
	
	fetch('/menu/formsTipoPlatillo')
	.then(response =>{
		if(!response.ok){
			throw new error('Erro en RegisterButtonClick')
			}
		return response.json()
	})
	.then(objeto =>{
		console.log("Objeto recibido en Front")
		//console.log("Estructura real de objeto:", objeto);
		const tiposProductos = objeto.data
		//console.log("¿Es realmente un Array?:", Array.isArray(tiposProductos));

		/* == Despliegue de Modal y HTML DOM == */

		/*Limpieza de elementos dinamicos */
		limpiarModal(typeFormsModal)
			

		typeFormsTitle.innerText = "Seleccione el Tipo de Producto"

		//Creación de Botones de Tipos
		tiposProductos.forEach(t => {
			console.log(t.nombre);
			// 1. Creamos el boton en memoria
		    const newbtn = document.createElement('button');
		    
		    // 2. Asignamos ID y Clases
		    newbtn.id = `btn${t.id}`;
		    newbtn.className = "formsTypebtn button is-info is-dynamic"; // aprovechar y poner CSS
		    
		    // 3. SEGURIDAD: textContent escapa cualquier código HTML
		    newbtn.textContent = t.nombre; 
		    
		    // 4. ESCUCHADOR DE CLICKS 
		    newbtn.onclick = (event) => {
		    	event.preventDefault()
		        console.log(`Seleccionaste el producto ID: ${t.id}`);
		        // Aquí llamarías a la lógica de tu Modal "A o B"
		    };

		    // 5. Lo inyectamos al DOM 
		    typeFormsModal.appendChild(newbtn);
		    console.log("Boton Creado")
				})
		//
		typeFormsCloseBtn.addEventListener('click',(event)=>{
			event.preventDefault()
			typeFormsModal.close()

		})

		typeFormsModal.showModal()


	})
	.catch(error =>{

	})
}


//Funcion para limpiar elementos dinamicos de un Modal
function limpiarModal(contenedor){
	console.log("Limpiando elementos dinamicos...")
	 if (!contenedor) {
    console.error(`No se encontró el contenedor: ${idContenedor}`);
    return;
  }
	
    // BUSCA SOLO ADENTRO: contenedor.querySelectorAll en vez de document
    const dinamicos = contenedor.querySelectorAll('.is-dynamic');
    dinamicos.forEach(el => el.remove());
    
    
}

