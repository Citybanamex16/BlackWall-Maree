/* global Chart */

const form = document.getElementById('filtersForm')
const btnLimpiar = document.getElementById('btnLimpiar')
const btnExportar = document.getElementById('btnExportar')
const statusBox = document.getElementById('statusBox')
const dashboardContent = document.getElementById('dashboardContent')

function getQueryParams () {
  const formData = new FormData(form)
  const params = new URLSearchParams()

  for (const [key, value] of formData.entries()) {
    if (value !== '') {
      params.append(key, value)
    }
  }

  return params
}

function showStatus (tipo, mensaje) {
  statusBox.className = `status-box ${tipo}`
  statusBox.textContent = mensaje
}

function clearStatus () {
  statusBox.className = 'status-box'
  statusBox.textContent = ''
}

function formatMoney (value) {
  const numero = Number(value || 0)
  return `$${numero.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function renderResumen (resumen) {
  document.getElementById('kpiActivos').textContent = resumen.clientes_activos || 0
  document.getElementById('kpiNuevos').textContent = resumen.clientes_nuevos_aprox || 0
  document.getElementById('kpiFrecuencia').textContent = resumen.frecuencia_promedio || 0
  document.getElementById('kpiTicket').textContent = formatMoney(resumen.ticket_promedio)
  document.getElementById('kpiPromos').textContent = resumen.clientes_con_promocion || 0
}

function renderTopClientes (clientes) {
  const tbody = document.getElementById('topClientesBody')

  if (!clientes || clientes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">No hay clientes para estos filtros.</td>
      </tr>
    `
    return
  }

  tbody.innerHTML = clientes.map((cliente) => `
    <tr>
      <td>
        <strong>${cliente.nombre || 'Sin nombre'}</strong><br>
        <small>${cliente.telefono || 'Sin teléfono'}</small>
      </td>
      <td><span class="pill">${cliente.royalty || 'Sin nivel'}</span></td>
      <td>${cliente.total_ordenes || 0}</td>
      <td>${formatMoney(cliente.total_gastado)}</td>
      <td>${cliente.ultima_compra || 'Sin fecha'}</td>
    </tr>
  `).join('')
}

function renderPromociones (promociones) {
  const tbody = document.getElementById('promocionesBody')

  if (!promociones || promociones.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3">No hay promociones usadas para estos filtros.</td>
      </tr>
    `
    return
  }

  tbody.innerHTML = promociones.map((promo) => `
    <tr>
      <td>${promo.promocion}</td>
      <td>${promo.usos}</td>
      <td>${promo.clientes_distintos}</td>
    </tr>
  `).join('')
}

function renderGenero (generos) {
  const tbody = document.getElementById('generoBody')

  if (!generos || generos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3">No hay información de género para estos filtros.</td>
      </tr>
    `
    return
  }

  tbody.innerHTML = generos.map((item) => `
    <tr>
      <td>${item.genero}</td>
      <td>${item.clientes}</td>
      <td>${item.ordenes}</td>
    </tr>
  `).join('')
}

let chartFlujo = null
let chartRetencion = null

function renderGraficas (datosGraficas) {
  const labels = datosGraficas.map(item => item.mes)
  const dataTotal = datosGraficas.map(item => item.total_clientes)
  const dataNuevos = datosGraficas.map(item => item.clientes_nuevos)
  const dataRecurrentes = datosGraficas.map(item => item.clientes_recurrentes)

  const ctxFlujo = document.getElementById('flujoClientesChart').getContext('2d')
  if (chartFlujo) chartFlujo.destroy()

  chartFlujo = new Chart(ctxFlujo, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Clientes Únicos',
        data: dataTotal,
        borderColor: '#2e5b9f',
        backgroundColor: 'rgba(46, 91, 159, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  })

  const ctxRetencion = document.getElementById('retencionClientesChart').getContext('2d')
  if (chartRetencion) chartRetencion.destroy()

  chartRetencion = new Chart(ctxRetencion, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Recurrentes (Fidelizados)',
          data: dataRecurrentes,
          backgroundColor: '#4caf50'
        },
        {
          label: 'Nuevos (Primera compra)',
          data: dataNuevos,
          backgroundColor: '#ff9800'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  })
}

async function cargarMetricas () {
  clearStatus()
  dashboardContent.classList.add('loading')

  try {
    const params = getQueryParams()
    const response = await fetch(`/royalty/royaltyAdmin/metricsRoyalty/api/royalty?${params.toString()}`)

    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.mensaje || 'No se pudieron consultar las métricas.')
    }

    renderResumen(result.data.resumen)
    renderTopClientes(result.data.topClientes)
    renderPromociones(result.data.promociones)
    renderGenero(result.data.genero)

    if (result.sinDatos) {
      showStatus('info', result.mensaje || 'No hay información disponible.')
    }
    if (result.data.graficas) {
      renderGraficas(result.data.graficas)
    }
  } catch (error) {
    showStatus('error', error.message || 'Error al consultar métricas.')
  } finally {
    dashboardContent.classList.remove('loading')
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  await cargarMetricas()
})

btnLimpiar.addEventListener('click', async () => {
  form.reset()
  await cargarMetricas()
})

btnExportar.addEventListener('click', () => {
  const params = getQueryParams()
  window.open(`/royalty/royaltyAdmin/metricsRoyalty/api/royalty/export?${params.toString()}`, '_blank')
})

window.addEventListener('DOMContentLoaded', async () => {
  await cargarMetricas()
})
