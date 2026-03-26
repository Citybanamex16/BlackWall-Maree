/* global localStorage, alert */

const listaPedido = document.getElementById('lista-pedido')
const pedidoVacio = document.getElementById('pedido-vacio')
const seccionCheckout = document.getElementById('seccion-checkout')

const pedido = JSON.parse(localStorage.getItem('pedido') || '[]')

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
    div.innerHTML = `
      <div>
        <p style="font-weight:500;font-size:15px;color:#222;margin:0;">${item.nombre}</p>
        <p style="font-size:13px;color:#777;margin:4px 0 0 0;">${item.desc}</p>
      </div>
      <div style="display:flex;align-items:center;gap:16px;">
        <span style="color:#b5956a;font-weight:500;">${item.precio}</span>
        <button data-index="${index}" class="btn-eliminar"
          style="background:none;border:none;color:#aaa;font-size:18px;cursor:pointer;">
          ✕
        </button>
      </div>
    `
    listaPedido.appendChild(div)
  })

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
  // Aquí después va el fetch a /cliente/pedidos/confirmar
  alert('Despues esto manda la úbicación mas cercana, da las opciones (Recoger, Comer ahi, Delivery) y se podra pagar')
})

renderPedido()
