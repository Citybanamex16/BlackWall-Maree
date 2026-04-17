function generateStaticMap () {
  console.log('Iniciando generación de Mapa')

  const lat = 19.4326
  const lng = -99.1332
  const zoom = 15

  const urlMapa = `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

  const contenedor = document.getElementById('contenedor-mapa')

  if (contenedor) {
    contenedor.innerHTML = `
            <iframe 
                width="100%" 
                height="400" 
                src="${urlMapa}" 
                style="border:0;" 
                allowfullscreen 
                loading="lazy">
            </iframe>`
    console.log('Mapa generado correctamente')
  } else {
    console.error("No se encontró el elemento 'contenedor-mapa'")
  }

  getAllSucursalesInfo()
}

async function getAllSucursalesInfo () {
  console.log('Obteniendo datos de Sucursales')
  try {
    const response = await fetch('/menu/Sucursales/getAll')
    if (!response.ok) {
      throw new Error('Error en obtener data de sucursales desde Backend')
    }
    const data = await response.json()
    const SucursalData = data.allSucursales
    console.log('Data de sucursales recuperada: ', SucursalData)

    buildSucursalSection(SucursalData) // ← conectar con el builder
  } catch (error) {
    console.log('Error recibido: ', error)
  }
}

function buildSucursalSection (data) {
  console.log('Armando sección de Sucursales')

  const contenedor = document.getElementById('contenedor-sucursales')
  contenedor.innerHTML = '' // limpia el skeleton

  if (!data || data.length === 0) {
    contenedor.innerHTML = `
            <div class="sucursal-card">
                <p class="sucursal-dato">No hay sucursales disponibles por el momento.</p>
            </div>`
    return
  }

  data.forEach(sucursal => {
    contenedor.insertAdjacentHTML('beforeend', crearTarjetaSucursal(sucursal))
  })
}

function crearTarjetaSucursal (sucursal) {
  return `
        <div class="sucursal-card">

            <p class="sucursal-nombre">${sucursal.Nombre}</p>

            <div class="sucursal-dato">
                <span class="sucursal-dato-icon">📍</span>
                <span>${sucursal.Calle}</span>
            </div>

            <div class="sucursal-dato">
                <span class="sucursal-dato-icon">🏙</span>
                <span>${sucursal.Municipio}, ${sucursal.Ciudad}</span>
            </div>

            <div class="sucursal-dato">
                <span class="sucursal-dato-icon">🗺</span>
                <span>${sucursal.Estado}, ${sucursal.País}</span>
            </div>

        </div>`
}

generateStaticMap()
