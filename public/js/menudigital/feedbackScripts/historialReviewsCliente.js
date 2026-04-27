console.log("Reviews de cliente conectado...")
const cliente = window.clienteData
console.log("Datos cliente: ", cliente)



async function obtenerHistorialReviews(){
	console.log("Obteniendo Historial de Reviews de: ", cliente.nombre)

	try{
	  const numero = cliente.telefono
			 // 1. Definimos los parámetros
	  const params = new URLSearchParams({
	    Numero_Telefonico: numero
	  });

	  // 2. Los añadimos a la ruta
	  const res = await fetch(`/menu/feedback/historyData?${params.toString()}`);
	  
	  const data = await res.json();
	  console.log(data);

	  const historialReviews = data.reviewCatalog
	  console.log("Historial de Reviews Obtenido: ", historialReviews)

	  construirHistorialReviews(historialReviews)

	}
	catch (err) {
		console.log("Error al obtener historial de Reviews: ", err)


	}
}
obtenerHistorialReviews()






function construirHistorialReviews(data) {
    console.log("Construyendo historial de Reviews", data)
    const contenedor = document.getElementById('contenedor-reviews')
    contenedor.innerHTML = ''

    // ── Estado vacío ──
    if (!data || data.length === 0) {
        contenedor.innerHTML = `
            <div class="resena-empty">
                <div class="resena-empty-icon">✍️</div>
                <p>Todavía no has dejado ninguna reseña.</p>
                <div class="resena-empty-hint">
                    ¿Quieres compartir tu experiencia?<br>
                    Ve a <strong>Status Pedidos</strong>, abre cualquier orden entregada
                    y encontrarás la opción para dejar tu comentario. ¡Solo toma un momento! 🙌
                </div>
            </div>
        `
        return
    }

    // ── Una ficha por review ──
    data.forEach(review => {
        // Estrellas
        const puntaje    = parseInt(review.Puntaje) || 0
        const estrellas  = '★'.repeat(puntaje) + '☆'.repeat(5 - puntaje)

        // Fecha legible
        const fecha = review.Fecha
            ? new Date(review.Fecha).toLocaleString('es-MX', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })
            : '—'

        // Comentario — viene con comillas extra del JSON, las limpiamos
        const comentario = (review.Comentario || '').replace(/^"|"$/g, '').trim()

        const card = document.createElement('div')
        card.classList.add('resena-card')
        card.innerHTML = `
            <p class="resena-meta">${fecha} · ${review.ID_Review}</p>
            <div class="resena-estrellas">${estrellas}</div>
            <p class="resena-comentario">${comentario || 'Sin comentario.'}</p>
            <p class="resena-orden">Orden: ${review.ID_Orden}</p>
        `
        contenedor.appendChild(card)
    })
}