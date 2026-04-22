console.log("Script Producto Personalizado conectado")

//Boton/elemento trigger de modal personalizacion 
document.getElementById("fab-personalizado")
.addEventListener("click", () =>{
	getPersModalData()
})



function agruparIngredientesCategoría(){

}


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
		const activeIngData = ingData.ingActiveCatalog[0]

		
		//console.log("Ingredientes activos obtenidos desde menu: ", activeIngData)
		construirModalPerso(activeIngData)

	} catch (err){
		ShowErrorModal("Error en Conexio", "La conexion fue interrumpida, favor de intentarlo mas tarde")

	} finally{
		console.log("Hidding spinner")

	}
	
}


function construirModalPerso(data){
	console.log("Construyendo modal personalizado con los siguientes datos: ", data)
		
}








