

function generateStaticMap(){
    console.log("Iniciando generación de Mapa");

    const lat = 19.4326;
    const lng = -99.1332;
    const zoom = 15;
    
    const urlMapa = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;

    const contenedor = document.getElementById('contenedor-mapa');
    
    if (contenedor) {
        contenedor.innerHTML = `
            <iframe 
                width="100%" 
                height="400" 
                src="${urlMapa}" 
                style="border:0;" 
                allowfullscreen 
                loading="lazy">
            </iframe>`;
        console.log("Mapa generado correctamente");
    } else {
        console.error("No se encontró el elemento 'contenedor-mapa'");
    }
}


generateStaticMap();



