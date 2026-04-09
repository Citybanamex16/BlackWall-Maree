/* global Chart */

let chartMasUsados = null
let chartPorCategoria = null

function buildBarChart (chartRef, canvasId, labels, values, label) {
  if (chartRef) chartRef.destroy()
  const ctx = document.getElementById(canvasId).getContext('2d')
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label, data: values, borderWidth: 1 }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  })
}

function renderKPIs (resumen) {
  document.getElementById('kpiTotal').textContent = resumen.total_insumos || 0
  document.getElementById('kpiActivos').textContent = resumen.activos || 0
  document.getElementById('kpiInactivos').textContent = resumen.inactivos || 0
  document.getElementById('kpiSinUso').textContent = resumen.sin_uso || 0
}

function renderAfectados (rows) {
  const tbody = document.getElementById('afectadosBody')
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="color:#888;padding:12px;">Ningún producto afectado.</td></tr>'
    return
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-weight:500;">${r.producto}</td>
      <td>${r.categoria}</td>
      <td style="color:#b5956a;font-weight:600;">${r.insumos_inactivos}</td>
      <td style="color:#888;font-size:12px;">${r.detalle_insumos}</td>
    </tr>
  `).join('')
}

function renderSinUso (rows) {
  const tbody = document.getElementById('sinUsoBody')
  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="color:#888;padding:12px;">Todos los ingredientes están en uso.</td></tr>'
    return
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td style="font-weight:500;">${r.ingrediente}</td>
      <td>${r.categoria}</td>
      <td style="color:#b5956a;">$${parseFloat(r.precio).toFixed(2)}</td>
    </tr>
  `).join('')
}

async function cargarMetricas () {
  try {
    const res = await fetch('/admin/api/metricas-ingredientes')
    const result = await res.json()

    if (!result.ok) throw new Error(result.mensaje)

    const { resumen, masUsados, porCategoria, afectados, sinUso } = result.data

    renderKPIs(resumen[0])
    renderAfectados(afectados)
    renderSinUso(sinUso)

    chartMasUsados = buildBarChart(
      chartMasUsados, 'chartMasUsados',
      masUsados.map(x => x.ingrediente),
      masUsados.map(x => Number(x.total_productos)),
      'Productos que lo usan'
    )

    chartPorCategoria = buildBarChart(
      chartPorCategoria, 'chartPorCategoria',
      porCategoria.map(x => x.categoria),
      porCategoria.map(x => Number(x.total)),
      'Total insumos'
    )
  } catch (error) {
    document.getElementById('statusBox').className = 'status-box error'
    document.getElementById('statusBox').textContent = `Error al cargar métricas: ${error.message}`
  }
}

window.addEventListener('DOMContentLoaded', cargarMetricas)
