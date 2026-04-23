/* eslint-env browser */

/* global jsQR */

let escaneando = true
let telefonoEscaneado = ''

const video = document.getElementById('video')
const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

async function iniciarEscaner () {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    video.srcObject = stream
    video.play()
    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      escanearFrame()
    })
  } catch (err) {
    console.error('Error cámara:', err)
    document.getElementById('resultado').innerHTML =
      '<p class="has-text-danger">No se pudo acceder a la cámara. Verifica los permisos.</p>'
  }
}

function escanearFrame () {
  if (!escaneando) return
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const code = jsQR(imageData.data, imageData.width, imageData.height)
  if (code) {
    escaneando = false
    telefonoEscaneado = code.data
    mostrarConfirmacion(telefonoEscaneado)
    return
  }
  requestAnimationFrame(escanearFrame)
}

function mostrarConfirmacion (telefono) {
  document.getElementById('modal-info').textContent = `Teléfono: ${telefono}`
  document.getElementById('modal-confirmar').classList.add('is-active')
}

window.cerrarModal = () => {
  document.getElementById('modal-confirmar').classList.remove('is-active')
  escaneando = true
  escanearFrame()
}

window.reiniciarEscaner = () => {
  document.getElementById('modal-exito').classList.remove('is-active')
  document.getElementById('modal-error').classList.remove('is-active')
  escaneando = true
  escanearFrame()
}

document.getElementById('btn-confirmar').addEventListener('click', async () => {
  document.getElementById('modal-confirmar').classList.remove('is-active')
  try {
    const res = await fetch('/royalty/registrar-visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono: telefonoEscaneado })
    })
    const data = await res.json()
    if (data.success) {
      document.getElementById('exito-info').textContent =
        `Teléfono: ${telefonoEscaneado} | Visitas: ${data.data.visitas} | Nivel: ${data.data.nivel}`
      document.getElementById('modal-exito').classList.add('is-active')
    } else {
      document.getElementById('error-info').textContent = data.message
      document.getElementById('modal-error').classList.add('is-active')
    }
  } catch (err) {
    document.getElementById('error-info').textContent = 'Error de conexión'
    document.getElementById('modal-error').classList.add('is-active')
  }
})

iniciarEscaner()
