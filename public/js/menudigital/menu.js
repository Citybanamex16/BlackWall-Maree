/* global localStorage, L */

const platillobotones = document.getElementsByClassName('platillo-btn')
const overlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const modalClose = document.getElementById('modal-close')

const pedido = []

// ── MODAL ──
const abrirModal = (contenido) => {
  modalContent.innerHTML = contenido
  overlay.classList.add('active')
}

const cerrarModal = () => {
  overlay.classList.remove('active')
  modalContent.innerHTML = ''
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay) cerrarModal()
})
modalClose.addEventListener('click', cerrarModal)

// ── ACTUALIZAR BOTÓN RESUMEN ──
const actualizarBotonResumen = () => {
  const btnTitle = document.querySelector('.order-btn-title')
  const btnSub = document.querySelector('.order-btn-sub')
  if (pedido.length === 0) {
    btnTitle.textContent = 'Ver Resumen de Pedido'
    btnSub.textContent = 'Revisa y confirma los artículos de tu orden'
  } else {
    btnTitle.textContent = `Ver Resumen de Pedido (${pedido.length})`
    btnSub.textContent = pedido.map(p => p.nombre).join(', ')
  }
}

// ── BOTONES DE PLATILLO ──
for (const button of platillobotones) {
  button.addEventListener('click', () => {
    const tarjeta = button.closest('.product-info')
    const nombre = tarjeta.querySelector('.product-name').textContent.trim()
    const precio = tarjeta.querySelector('.product-price').textContent.trim()
    const desc = tarjeta.querySelector('.product-desc').textContent.trim()

    fetch(`/menu/consultaplatillo?nombre=${encodeURIComponent(nombre)}`)
      .then(r => r.json())
      .then(data => {
        if (!data.disponible) {
          abrirModal(`
            <h2 style="font-family:'Cormorant Garamond',serif;font-size:22px;margin-bottom:12px;">
              ${nombre}
            </h2>
            <p style="color:#e74c3c;font-size:14px;">
              Este platillo no está disponible por el momento.
            </p>
          `)
          return
        }

        const listaIngredientes = data.ingredientes
          .map(ing => `<li style="font-size:13px;color:#555;margin-bottom:4px;">• ${ing}</li>`)
          .join('')

        const checkboxIngredientes = data.ingredientes
          .map(ing => `
            <label style="display:flex;align-items:center;gap:8px;font-size:13px;
                          color:#555;margin-bottom:6px;cursor:pointer;">
              <input type="checkbox" checked disabled> ${ing}
            </label>
          `).join('')

        abrirModal(`
          <h2 style="font-family:'Cormorant Garamond',serif;font-size:26px;margin-bottom:4px;">
            ${nombre}
          </h2>
          <p style="color:#b5956a;font-size:15px;font-weight:500;margin-bottom:12px;">
            ${precio}
          </p>
          <p style="color:#777;font-size:13px;margin-bottom:8px;">${desc}</p>
          <p style="font-size:13px;font-weight:600;color:#444;margin-bottom:6px;">Ingredientes:</p>
          <ul style="margin-bottom:16px;padding-left:4px;">${listaIngredientes}</ul>
          <p style="font-size:12px;color:#aaa;margin-bottom:20px;">Base: ${data.base}</p>

          <button id="btn-confirmar-agregar"
            style="width:100%;padding:12px;background:#eac9c1;color:#fff;
                   border:none;border-radius:6px;font-size:14px;cursor:pointer;
                   font-family:'Jost',sans-serif;margin-bottom:12px;">
            + Confirmar y agregar al pedido
          </button>

          <details>
            <summary style="font-size:13px;color:#b5956a;cursor:pointer;list-style:none;">
              ✎ Editar ingredientes
            </summary>
            <div style="margin-top:10px;padding:12px;background:#faf8f5;border-radius:8px;">
              <p style="font-size:12px;color:#aaa;margin-bottom:8px;">
                Selecciona los ingredientes que quieres incluir:
              </p>
              ${checkboxIngredientes}
              <p style="font-size:11px;color:#bbb;margin-top:8px;">
                Asi no va a estar pero ahora es prototipo por ahora
              </p>
            </div>
          </details>
        `)

        document.getElementById('btn-confirmar-agregar').addEventListener('click', () => {
          pedido.push({ nombre, precio, desc })
          localStorage.setItem('pedido', JSON.stringify(pedido))

          fetch('/menu/agregaritem', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, desc })
          })
            .then(r => r.json())
            .then(confirmacion => {
              console.log('Agregado:', confirmacion)
              cerrarModal()
              actualizarBotonResumen()
            })
            .catch(err => console.log(err))
        })
      })
      .catch(err => console.log(err))
  })
}

// ── MAPA DE UBICACIÓN ──
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude

      const mapa = L.map('mapa').setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapa)

      // Punto rojo
      L.circleMarker([lat, lng], {
        radius: 10,
        fillColor: '#e74c3c',
        color: '#fff',
        weight: 2,
        fillOpacity: 1
      }).addTo(mapa).bindPopup('Tú estás aquí').openPopup()

      document.getElementById('mapa-estado').textContent = 'Ubicación detectada'
    },
    (_) => {
      document.getElementById('mapa-estado').textContent =
        'No se pudo obtener tu ubicación. Permite el acceso en tu navegador.'
    }
  )
} else {
  document.getElementById('mapa-estado').textContent =
    'Tu navegador no soporta geolocalización.'
}
