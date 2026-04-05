/* eslint-env browser */
/* global alert */

/* eslint-disable no-unused-vars */

let royaltiesData = []
let nombreOriginal = ''
function modificarRoyalty (nombre) {
  const royalty = royaltiesData.find(r => r.Nombre_Royalty === nombre)
  nombreOriginal = nombre
  // Obtenemos el modal
  document.getElementById('modal-nombre').textContent = nombre
  document.getElementById('modal-modificarRoyalty').classList.add('is-active')
  document.getElementById('modal-nombre').textContent = nombre
  document.getElementById('input-nombre').value = royalty.Nombre_Royalty
  document.getElementById('input-prioridad').value = royalty.Número_de_prioridad
  document.getElementById('input-descripcion').value = royalty.Descripción
  document.getElementById('input-minVisitas').value = royalty.Min_Visitas
  document.getElementById('input-maxVisitas').value = royalty.Max_Visitas
}

async function guardarRoyalty () {
  const body = {
    nombre: document.getElementById('input-nombre').value,
    prioridad: document.getElementById('input-prioridad').value,
    descripcion: document.getElementById('input-descripcion').value,
    minVisitas: document.getElementById('input-minVisitas').value,
    maxVisitas: document.getElementById('input-maxVisitas').value
  }
  try {
    const response = await fetch('/royalty/royaltyAdmin/' + nombreOriginal, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    if (data.success) {
      // Falta mostrar confirmacion
      cerrarModal()
      window.location.reload()
    } else {
      alert('Error al guardar Royalty')
    }
  } catch (error) {
    console.log(error)
    alert('Error en conexión')
  }
}
const abrirModal = () => {
  document.getElementById('modal-modificarRoyalty').classList.add('is-active')
}

const limpiarFormulario = () => {
  document.getElementById('form-modificarRoyalty').reset()
}

const cerrarModal = () => {
  document.getElementById('modal-modificarRoyalty').classList.remove('is-active')
  limpiarFormulario()
}

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
    royaltiesData = data.data
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
