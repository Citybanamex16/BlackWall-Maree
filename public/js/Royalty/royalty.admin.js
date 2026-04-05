/* eslint-env browser */
/* global alert */

/* eslint-disable no-unused-vars */
function borrarRoyalty (NombreRoyalty) {
  if (confirm('¿Estas seguro que deseas borrar ' + NombreRoyalty + ' ?')) {
    fetch('/royalty/borrar/' + NombreRoyalty, { method: 'DELETE' }).then(() => {
      window.location.reload()
    }).catch(() => {
      alert('Error en conexión')
    })
  }
}

async function cargarRoyalty () {
  try {
    const response = await fetch('/royalty/royaltyAdmin/api')
    const data = await response.json()

    console.log('Mostrando los royalties en HTML')
    const container = document.getElementById('royaltyContainer')
    data.data.forEach(royalty => {
      container.innerHTML += `
        <div class="column is-half">
          <div class="card">
            <div class="card-content">
              <p class="title is-5">${royalty.Nombre_Royalty}</p>
              <div class="content">
                <p><strong>Prioridad:</strong> ${royalty.Número_de_prioridad}</p>
                <p><strong>Descripción:</strong> ${royalty.Descripción}</p>
                <p><strong>Visitas mínimas:</strong> ${royalty.Min_Visitas}</p>
                <p><strong>Visitas máximas:</strong> ${royalty.Max_Visitas}</p>
              </div>
              <footer class="card-footer">
                <button class="button is-warning card-footer-item" onclick="modificarRoyalty('${royalty.Nombre_Royalty}')">
                  <span class="icon"><i class="fas fa-pen"></i></span>
                  <span>Modificar</span>
                </button>
                <button class="button is-danger card-footer-item" onclick="borrarRoyalty('${royalty.Nombre_Royalty}')">
                  <span class="icon"><i class="fas fa-trash"></i></span>
                  <span>Borrar</span>
                </button>
              </footer>
            </div>
          </div>
        </div>
      `
    })
  } catch (error) {
    console.log(error)
  }
}
cargarRoyalty()
