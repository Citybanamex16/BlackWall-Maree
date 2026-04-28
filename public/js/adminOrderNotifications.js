;(function () {
  'use strict'

  const style = document.createElement('style')
  style.textContent = `
    #new-order-notifications {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }
    .new-order-toast {
      background: #fff;
      border: 2px solid #c0392b;
      border-left: 6px solid #c0392b;
      border-radius: 10px;
      padding: 16px 20px;
      min-width: 280px;
      max-width: 340px;
      box-shadow: 0 4px 20px rgba(192,57,43,0.25);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      pointer-events: all;
      animation: toastSlideIn 0.3s ease;
    }
    @keyframes toastSlideIn {
      from { transform: translateX(120%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }
    .toast-title {
      font-family: 'Jost', sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #c0392b;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin-bottom: 4px;
    }
    .toast-order-id {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      color: #222;
      line-height: 1.1;
    }
    .toast-meta {
      font-family: 'Jost', sans-serif;
      font-size: 12px;
      color: #888;
      margin-top: 3px;
    }
    .toast-close {
      background: none;
      border: none;
      font-size: 16px;
      color: #bbb;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      margin-left: 4px;
      transition: color 0.15s;
    }
    .toast-close:hover { color: #c0392b; }
  `
  document.head.appendChild(style)

  const container = document.createElement('div')
  container.id = 'new-order-notifications'
  document.body.appendChild(container)

  const knownPendingIds = new Set()
  let initialized = false

  function playNewOrderSound () {
    try {
      const audio = new Audio('/sounds/neworder.mp3')
      audio.volume = 0.8
      audio.play()
    } catch {}
  }

  function showNewOrderNotification (order) {
    playNewOrderSound()
    const toast = document.createElement('div')
    toast.className = 'new-order-toast'
    toast.innerHTML = `
      <span style="font-size:22px;flex-shrink:0;margin-top:2px;">🔔</span>
      <div style="flex:1;">
        <p class="toast-title">Nueva orden</p>
        <p class="toast-order-id">${order.id_orden}</p>
        <p class="toast-meta">${order.nombre_cliente || 'Sin nombre'} · ${order.tipo_orden || '—'}</p>
      </div>
      <button class="toast-close" title="Cerrar">✕</button>`
    toast.querySelector('.toast-close').addEventListener('click', () => toast.remove())
    container.appendChild(toast)
    setTimeout(() => toast.remove(), 10000)
  }

  async function pollForNewOrders () {
    try {
      const res = await fetch('/admin/api/orders')
      const data = await res.json()
      if (!data.ok) return

      const currentPendingIds = new Set(data.pendientes.map(p => p.id_orden))

      if (!initialized) {
        currentPendingIds.forEach(id => knownPendingIds.add(id))
        initialized = true
        return
      }

      data.pendientes.forEach(p => {
        if (!knownPendingIds.has(p.id_orden)) {
          showNewOrderNotification(p)
          knownPendingIds.add(p.id_orden)
        }
      })

      knownPendingIds.forEach(id => {
        if (!currentPendingIds.has(id)) knownPendingIds.delete(id)
      })

    } catch {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      pollForNewOrders()
      setInterval(pollForNewOrders, 15000)
    })
  } else {
    pollForNewOrders()
    setInterval(pollForNewOrders, 15000)
  }
})()
