/* global localStorage, sesionCliente */

const listaPedido = document.getElementById('lista-pedido')
const pedidoVacio = document.getElementById('pedido-vacio')
const seccionCheckout = document.getElementById('seccion-checkout')

let pedido = JSON.parse(localStorage.getItem('pedido') || '[]')

// MODAL de orden
const crearOverlay = () => {
  const overlay = document.createElement('div')
  overlay.id = 'order-modal-overlay'
  overlay.style.cssText = `
    position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.5);z-index:1000;
    display:flex;justify-content:center;align-items:center;
  `
  return overlay
}

const cerrarModal = () => {
  const overlay = document.getElementById('order-modal-overlay')
  if (overlay) overlay.remove()
}

// MODAL checkout
const abrirModalCheckout = () => {
  const overlay = crearOverlay()
  const conSesion = !!sesionCliente

  const camposIdentidad = conSesion
    ? `<div style="background:#faf8f5;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
        <p style="font-size:13px;color:#aaa;margin:0 0 2px 0;">Hola,</p>
        <p style="font-size:16px;font-weight:600;color:#333;margin:0;">${sesionCliente.nombre}</p>
       </div>`
    : `<p style="font-size:13px;font-weight:600;color:#444;margin-bottom:6px;">Nombre</p>
       <input id="input-nombre" type="text" placeholder="Tu nombre"
         style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;
                font-size:14px;font-family:'Jost',sans-serif;margin-bottom:16px;
                box-sizing:border-box;outline:none;">

       <p style="font-size:13px;font-weight:600;color:#444;margin-bottom:6px;">Número telefónico</p>
       <input id="input-telefono" type="tel" placeholder="Ej. 442 123 4567"
         style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;
                font-size:14px;font-family:'Jost',sans-serif;margin-bottom:8px;
                box-sizing:border-box;outline:none;">
       <p id="error-telefono" style="display:none;color:#e74c3c;font-size:12px;margin-bottom:12px;">
         Ingresa solo números (7-15 dígitos).
       </p>`

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:32px;width:480px;
                max-width:90%;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.15);">

      <button id="cerrar-checkout"
        style="position:absolute;top:14px;right:16px;background:none;
               border:none;font-size:18px;cursor:pointer;color:#aaa;">✕</button>

      <h2 style="font-family:'Cormorant Garamond',serif;font-size:26px;margin-bottom:4px;">
        Confirmar Pedido
      </h2>
      <p style="color:#888;font-size:12px;margin-bottom:24px;">
        Completa los detalles para finalizar tu orden
      </p>

      ${camposIdentidad}

      <p style="font-size:13px;font-weight:600;color:#444;margin-bottom:10px;">
        Forma de comer
      </p>
      <div style="display:flex;gap:10px;margin-bottom:24px;">
        <label class="forma-opt"
          style="flex:1;border:2px solid #b5956a;border-radius:8px;padding:12px;
                 text-align:center;cursor:pointer;font-size:13px;color:#b5956a;
                 font-family:'Jost',sans-serif;transition:all 0.2s;">
          <input type="radio" name="forma" value="Pick-Up" checked style="display:none;">
          Pick-Up
        </label>
        <label class="forma-opt"
          style="flex:1;border:2px solid #eee;border-radius:8px;padding:12px;
                 text-align:center;cursor:pointer;font-size:13px;color:#777;
                 font-family:'Jost',sans-serif;transition:all 0.2s;">
          <input type="radio" name="forma" value="Sucursal" style="display:none;">
          On Site
        </label>
        <label class="forma-opt"
          style="flex:1;border:2px solid #eee;border-radius:8px;padding:12px;
                 text-align:center;cursor:pointer;font-size:13px;color:#777;
                 font-family:'Jost',sans-serif;transition:all 0.2s;">
          <input type="radio" name="forma" value="Delivery" style="display:none;">
          Delivery
        </label>
      </div>

      <div id="campo-direccion" style="display:none;margin-bottom:16px;">
        <p style="font-size:13px;font-weight:600;color:#444;margin-bottom:6px;">Dirección de entrega</p>
        <input id="input-direccion" type="text" placeholder="Calle, número, colonia, ciudad"
          style="width:100%;padding:10px 14px;border:1px solid #ddd;border-radius:6px;
                 font-size:14px;font-family:'Jost',sans-serif;box-sizing:border-box;outline:none;">
        <p id="error-direccion" style="display:none;color:#e74c3c;font-size:12px;margin-top:4px;">
          Ingresa una dirección válida.
        </p>
      </div>

      <p id="error-servidor"
        style="display:none;color:#e74c3c;font-size:12px;margin-bottom:12px;">
        Hubo un error al procesar tu pedido. Intenta de nuevo.
      </p>

      <button id="btn-confirmar-orden"
        style="width:100%;padding:13px;background:#b5956a;color:#fff;margin-top:16px;
               border:none;border-radius:6px;font-size:15px;cursor:pointer;
               font-family:'Jost',sans-serif;">
        Confirmar Orden
      </button>
    </div>
  `

  document.body.appendChild(overlay)

  document.getElementById('cerrar-checkout').addEventListener('click', cerrarModal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarModal()
  })

  const opciones = document.querySelectorAll('.forma-opt')
  opciones.forEach(opt => {
    opt.addEventListener('click', () => {
      opciones.forEach(o => {
        o.style.borderColor = '#eee'
        o.style.color = '#777'
      })
      opt.style.borderColor = '#b5956a'
      opt.style.color = '#b5956a'

      const valor = opt.querySelector('input[name="forma"]').value
      document.getElementById('campo-direccion').style.display = valor === 'Delivery' ? 'block' : 'none'
    })
  })

  document.getElementById('btn-confirmar-orden').addEventListener('click', () => {
    const formaSeleccionada = document.querySelector('input[name="forma"]:checked').value
    const direccion = document.getElementById('input-direccion')?.value.trim() || ''
    const errorServ = document.getElementById('error-servidor')
    const errorDir = document.getElementById('error-direccion')

    let telefono, nombre

    if (conSesion) {
      telefono = sesionCliente.telefono
      nombre = sesionCliente.nombre
    } else {
      telefono = document.getElementById('input-telefono').value.trim()
      nombre = document.getElementById('input-nombre').value.trim()
      const errorTel = document.getElementById('error-telefono')
      const soloDigitos = telefono.replace(/[\s-]/g, '')
      if (!/^\d{7,15}$/.test(soloDigitos)) {
        errorTel.style.display = 'block'
        return
      }
      errorTel.style.display = 'none'
    }

    if (formaSeleccionada === 'Delivery' && direccion.length < 5) {
      errorDir.style.display = 'block'
      return
    }
    if (errorDir) errorDir.style.display = 'none'

    fetch('/menu/pedidos/validar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: pedido })
    })
      .then(r => r.json())
      .then(validacion => {
        if (!validacion.pedidoValido) {
          errorServ.style.display = 'block'
          errorServ.textContent = validacion.mensaje || 'El pedido está vacío.'
          return
        }

        fetch('/menu/pedidos/confirmar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: pedido,
            forma: formaSeleccionada,
            telefono,
            nombre,
            direccion: formaSeleccionada === 'Delivery' ? direccion : null
          })
        })
          .then(r => r.json())
          .then(confirmacion => {
            if (confirmacion.pedidoConfirmado) {
              cerrarModal()
              abrirModalConfirmacion(formaSeleccionada, telefono, direccion)
            } else {
              errorServ.style.display = 'block'
              errorServ.textContent = 'No se pudo confirmar el pedido. Intenta de nuevo.'
            }
          })
          .catch(() => { errorServ.style.display = 'block' })
      })
      .catch(() => { errorServ.style.display = 'block' })
  })
}

// MODAL confirmacion
const abrirModalConfirmacion = (forma, telefono, direccion) => {
  const overlay = crearOverlay()

  const resumenItems = pedido
    .map(item => `
      <div style="display:flex;justify-content:space-between;
                  padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <span style="font-size:14px;color:#333;">${item.nombre}</span>
        <span style="font-size:14px;color:#b5956a;font-weight:500;">${typeof item.precio === 'number' ? '$' + item.precio.toFixed(2) : item.precio}</span>
      </div>
    `).join('')

  const totalConfirm = pedido.reduce((sum, item) => {
    const raw = typeof item.precio === 'number'
      ? item.precio
      : parseFloat(String(item.precio || '').replace(/[^0-9.,]/g, '').replace(',', '.'))
    return sum + (isNaN(raw) ? 0 : raw)
  }, 0)

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:12px;padding:32px;width:480px;
                max-width:90%;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.15);
                max-height:90vh;overflow-y:auto;">

      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:48px;margin-bottom:8px;">✔</div>
        <h2 style="font-family:'Cormorant Garamond',serif;font-size:28px;margin-bottom:4px;">
          ¡Pedido Confirmado!
        </h2>
        <p style="color:#888;font-size:13px;">
          Tu orden ha sido registrada exitosamente
        </p>
      </div>

      <div style="background:#faf8f5;border-radius:8px;padding:16px;margin-bottom:20px;">
        <p style="font-size:12px;color:#aaa;margin-bottom:4px;">Forma de entrega</p>
        <p style="font-size:15px;font-weight:500;color:#333;margin-bottom:12px;">${forma}</p>
        ${forma === 'Delivery' && direccion
? `
          <p style="font-size:12px;color:#aaa;margin-bottom:4px;">Dirección</p>
          <p style="font-size:15px;font-weight:500;color:#333;margin-bottom:12px;">${direccion}</p>
        `
: ''}
        <p style="font-size:12px;color:#aaa;margin-bottom:4px;">Teléfono</p>
        <p style="font-size:15px;font-weight:500;color:#333;">${telefono}</p>
      </div>

      <p style="font-size:13px;font-weight:600;color:#444;margin-bottom:8px;">Tu pedido</p>
      <div style="margin-bottom:8px;">${resumenItems}</div>
      <div style="display:flex;justify-content:flex-end;align-items:center;gap:12px;
                  padding:12px 0;border-top:2px solid #eee;margin-bottom:12px;">
        <span style="font-size:14px;color:#777;">Total:</span>
        <span style="font-size:18px;font-weight:600;color:#b5956a;">$${totalConfirm.toFixed(2)}</span>
      </div>

      <button id="btn-back-menu"
        style="width:100%;padding:13px;background:#fff;color:#b5956a;
               border:2px solid #b5956a;border-radius:6px;font-size:15px;
               cursor:pointer;font-family:'Jost',sans-serif;">
        ← Back to Menu
      </button>
    </div>
  `

  document.body.appendChild(overlay)

  document.getElementById('btn-back-menu').addEventListener('click', () => {
    pedido = []
    localStorage.removeItem('pedido')
    cerrarModal()
    window.location.href = '/menu/menu'
  })
}

// PEDIDO
const renderPedido = () => {
  listaPedido.innerHTML = ''

  if (pedido.length === 0) {
    pedidoVacio.style.display = 'block'
    seccionCheckout.style.display = 'none'
    return
  }

  pedidoVacio.style.display = 'none'
  seccionCheckout.style.display = 'block'

  pedido.forEach((item, index) => {
    const div = document.createElement('div')
    div.style.cssText = `
      display:flex;justify-content:space-between;align-items:center;
      border:1px solid #eee;border-radius:10px;padding:16px 20px;
      margin-bottom:12px;background:#fff;
    `
    const descTexto = item.desc && item.desc.trim() !== '' ? item.desc : ''
    const precioTexto = typeof item.precio === 'number'
      ? '$' + item.precio.toFixed(2)
      : String(item.precio || '')
    div.innerHTML = `
      <div>
        <p style="font-weight:500;font-size:15px;color:#222;margin:0;">${item.nombre || '—'}</p>
        ${descTexto ? `<p style="font-size:13px;color:#777;margin:4px 0 0 0;">${descTexto}</p>` : ''}
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="color:#b5956a;font-weight:500;">${precioTexto}</span>
        <button data-index="${index}" class="btn-eliminar"
          style="background:none;border:none;color:#aaa;font-size:18px;cursor:pointer;">
          ✕
        </button>
      </div>
    `
    listaPedido.appendChild(div)
  })

  const total = pedido.reduce((sum, item) => {
    const raw = typeof item.precio === 'number'
      ? item.precio
      : parseFloat(String(item.precio || '').replace(/[^0-9.,]/g, '').replace(',', '.'))
    return sum + (isNaN(raw) ? 0 : raw)
  }, 0)

  const divTotal = document.createElement('div')
  divTotal.style.cssText = `
    display:flex;justify-content:flex-end;align-items:center;
    gap:12px;padding:16px 20px 0 20px;
    border-top:1px solid #eee;margin-top:4px;
  `
  divTotal.innerHTML = `
    <span style="font-size:14px;color:#777;">Total:</span>
    <span style="font-size:18px;font-weight:600;color:#b5956a;">$${total}</span>
  `
  listaPedido.appendChild(divTotal)

  for (const btn of document.getElementsByClassName('btn-eliminar')) {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index)
      pedido.splice(idx, 1)
      localStorage.setItem('pedido', JSON.stringify(pedido))
      renderPedido()
    })
  }
}

document.getElementById('btn-checkout').addEventListener('click', () => {
  if (pedido.length === 0) return
  abrirModalCheckout()
})

renderPedido()

const navCount = document.getElementById('nav-item-count')
if (navCount && pedido.length > 0) {
  navCount.textContent = `${pedido.length} ${pedido.length === 1 ? 'artículo' : 'artículos'}`
}
