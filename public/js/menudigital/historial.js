/* global ORDENES_INIT */

const CANCEL_WINDOW_MS = 3 * 60 * 1000

function mostrarAlerta (msg, tipo = 'is-success') {
  const el = document.getElementById('alert-historial')
  if (!el) return
  el.innerHTML = `<article class="message ${tipo}" style="margin-bottom:16px;">
    <div class="message-body" style="font-family:'Jost',sans-serif;">${msg}</div>
  </article>`
  setTimeout(() => { el.innerHTML = '' }, 4000)
}

function renderCancelArea (idOrden, fecha, estado) {
  const card = document.querySelector(`.orden-card[data-id="${idOrden}"]`)
  if (!card) return
  const area = card.querySelector('.cancel-area')
  if (!area) return

  if (estado === 'Cancelado' || estado === 'Entregado') { area.innerHTML = ''; return }

  const diff = Date.now() - new Date(fecha).getTime()
  const restante = Math.min(CANCEL_WINDOW_MS - diff, CANCEL_WINDOW_MS)

  if (restante <= 0) { area.innerHTML = ''; return }

  const seg = Math.ceil(restante / 1000)
  area.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <button
        onclick="cancelarOrden('${idOrden}')"
        style="padding:7px 18px;background:transparent;border:1px solid #c0392b;
               border-radius:6px;color:#c0392b;font-size:13px;cursor:pointer;
               font-family:'Jost',sans-serif;">
        Cancelar pedido
      </button>
      <span id="timer-${idOrden}" style="font-size:12px;color:#aaa;font-family:'Jost',sans-serif;">
        Tiempo para cancelar: ${seg}s
      </span>
    </div>`

  // countdown
  const interval = setInterval(() => {
    const left = CANCEL_WINDOW_MS - (Date.now() - new Date(fecha).getTime())
    const timerEl = document.getElementById(`timer-${idOrden}`)
    if (left <= 0) {
      clearInterval(interval)
      area.innerHTML = ''
    } else if (timerEl) {
      timerEl.textContent = `Tiempo para cancelar: ${Math.ceil(left / 1000)}s`
    }
  }, 1000)
}

let _pendingCancelId = null

function cancelarOrden (idOrden) {
  _pendingCancelId = idOrden
  document.getElementById('cancel-confirm-modal').classList.add('is-active')
}

async function _ejecutarCancel () {
  if (!_pendingCancelId) return
  const idOrden = _pendingCancelId
  _pendingCancelId = null
  document.getElementById('cancel-confirm-modal').classList.remove('is-active')
  try {
    const res = await fetch(`/cliente/api/orders/${idOrden}/cancel`, { method: 'POST' })
    const data = await res.json()
    if (data.ok) {
      mostrarAlerta('Pedido cancelado correctamente.')
      const card = document.querySelector(`.orden-card[data-id="${idOrden}"]`)
      if (card) card.remove()
    } else {
      mostrarAlerta(data.message || 'No se pudo cancelar.', 'is-danger')
    }
  } catch {
    mostrarAlerta('Error de conexión.', 'is-danger')
  }
}

// Polling de status cada 30 segundos
async function actualizarStatus () {
  try {
    const res = await fetch('/cliente/api/mis-ordenes')
    const data = await res.json()
    if (!data.ok) return
    data.ordenes.forEach(o => {
      const card = document.querySelector(`.orden-card[data-id="${o.id_orden}"]`)
      if (!card) return
      const badge = card.querySelector('.estado-badge')
      if (badge && badge.textContent.trim() !== o.estado_orden) {
        badge.textContent = o.estado_orden
        // actualiza color según estado
        const color = o.estado_orden === 'Entregado' ? '#3a7d52'
                    : o.estado_orden === 'Cancelado'  ? '#c0392b'
                    : '#b5956a'
        badge.style.color = color
        badge.style.background = color + '15'
        card.dataset.estado = o.estado_orden
        renderCancelArea(o.id_orden, card.dataset.fecha, o.estado_orden)
      }
    })
  } catch { /* silencioso */ }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  const cancelModal = document.getElementById('cancel-confirm-modal')
  const closeModal = () => { _pendingCancelId = null; cancelModal.classList.remove('is-active') }
  document.getElementById('close-cancel-confirm').addEventListener('click', closeModal)
  document.getElementById('btn-no-cancelar').addEventListener('click', closeModal)
  document.getElementById('btn-si-cancelar').addEventListener('click', _ejecutarCancel)
  cancelModal.querySelector('.modal-background').addEventListener('click', closeModal)

  ORDENES_INIT.forEach(o => renderCancelArea(o.id, o.fecha, o.estado))
  setInterval(actualizarStatus, 30000)
})
