/* global Html5Qrcode */
/* eslint-disable no-unused-vars */
let html5QrCode

function iniciarEscaneo () {
  document.getElementById('seccion-scanner-royalty').style.display = 'flex'
  const contenedor = document.getElementById('contenedor-dinamico-cliente')

  contenedor.innerHTML = `
        <div class="scanner-container-box" style="text-align: center; padding: 20px;">
            <h2 class="page-title" style="font-size: 24px; margin-bottom: 20px;">Escanear Cliente</h2>
            <div id="reader" style="width: 100%; max-width: 400px; margin: 0 auto; border: 3px solid var(--c-primary); border-radius: 12px; overflow: hidden;"></div>
            <p style="margin-top: 15px; color: var(--c-text-muted);">El sistema detectará automáticamente el teléfono del cliente</p>
        </div>
    `

  html5QrCode = new Html5Qrcode('reader')

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0
  }

  html5QrCode.start(
    { facingMode: 'environment' },
    config,
    async (decodedText) => {
      await html5QrCode.stop()
      buscarDatosPorTelefono(decodedText)
    }
  ).catch(err => {
    console.error('Error al iniciar cámara', err)
    alert('No se pudo acceder a la cámara.')
  })
}

async function buscarDatosPorTelefono (telefono) {
  try {
    const response = await fetch('/admin/procesar-escaneo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono })
    })

    const data = await response.json()

    if (response.ok) {
      renderizarTarjetaCliente(data.cliente)
    } else {
      mostrarError('Cliente no encontrado', 'El teléfono escaneado no está registrado en el programa Royalty.')
    }
  } catch (error) {
    console.error('Detalle del error:', error)
    mostrarError('Error de conexión', 'No se pudo contactar con el servidor.')
  }
}

function renderizarTarjetaCliente (cliente) {
  const contenedor = document.getElementById('contenedor-dinamico-cliente')

  contenedor.innerHTML = `
        <div class="cliente-card-confirmacion" style="animation: fadeIn 0.4s ease; padding: 25px; background: white; border-radius: 20px; border: 1px solid var(--c-border); box-shadow: var(--shadow-md);">
            <div style="text-align: center; margin-bottom: 20px;">
                <span class="badge-nivel" style="background: var(--c-primary-bg); color: var(--c-primary); padding: 5px 15px; border-radius: 20px; font-size: 11px; font-weight: bold; border: 1px solid var(--c-primary-light);">
                    ${cliente.nivel.toUpperCase()}
                </span>
                <h2 style="font-family: var(--font-heading); font-size: 2.2rem; margin: 10px 0 0 0;">${cliente.nombre}</h2>
                <p style="color: var(--c-text-muted); font-size: 14px;">Tel: ${cliente.id}</p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
                <div style="background: var(--c-bg-body); padding: 15px; border-radius: 12px; text-align: center;">
                    <small style="display:block; color: var(--c-text-muted); text-transform: uppercase; font-size: 10px;">Visitas Actuales</small>
                    <span style="font-size: 1.8rem; font-weight: bold;">${cliente.visitas}</span>
                </div>
            </div>

            <div class="buttons-container" style="display: flex; flex-direction: column; gap: 10px;">
                <button onclick="confirmarVisitaFinal('${cliente.id}')" class="btn-base" style="width: 100%; background: var(--c-primary); color: white; border: none; padding: 16px; border-radius: 12px; font-weight: bold; cursor: pointer;">
                    CONFIRMAR VISITA (+1)
                </button>
                <button onclick="iniciarEscaneo()" style="background: none; border: 1px solid var(--c-border); padding: 10px; border-radius: 10px; color: var(--c-text-muted); cursor: pointer;">
                    Escanear otro cliente
                </button>
            </div>
        </div>
    `
}

async function confirmarVisitaFinal (telefono) {
  try {
    const res = await fetch('/admin/registrar-visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ telefono })
    })

    if (res.ok) {
      const contenedor = document.getElementById('contenedor-dinamico-cliente')
      contenedor.innerHTML = `
                <div style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
                    <h2 class="page-title" style="font-size: 28px;">¡Visita Registrada!</h2>
                    <p style="color: var(--c-text-muted); margin-bottom: 30px;">Se ha sumado 1 visita al cliente exitosamente.</p>
                    <button onclick="iniciarEscaneo()" class="btn-base" style="background: var(--c-primary); color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer;">Siguiente Cliente</button>
                </div>
            `
    }
  } catch (err) {
    alert('Error al procesar la visita.')
  }
}

function mostrarError (titulo, mensaje) {
  const contenedor = document.getElementById('contenedor-dinamico-cliente')
  contenedor.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 50px; margin-bottom: 20px;">❌</div>
            <h2 style="font-family: var(--font-heading); font-size: 24px;">${titulo}</h2>
            <p style="color: var(--c-text-muted); margin-bottom: 25px;">${mensaje}</p>
            <button onclick="iniciarEscaneo()" class="btn-base" style="background: var(--c-text-main); color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">Reintentar</button>
        </div>
    `
}

function cerrarPanelScanner () {
  if (html5QrCode) html5QrCode.stop().catch(() => {})
  document.getElementById('seccion-scanner-royalty').style.display = 'none'
}
