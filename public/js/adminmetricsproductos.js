/* global Chart */

const form = document.getElementById('filtersForm')
const btnLimpiar = document.getElementById('btnLimpiar')
const btnExportar = document.getElementById('btnExportar')
const statusBox = document.getElementById('statusBox')
const dashboardContent = document.getElementById('dashboardContent')
const selectCategoria = document.getElementById('selectCategoria')
const selectTipo = document.getElementById('selectTipo')

let chartTopCantidad = null
let chartCategoriaIngresos = null
let chartIngredientes = null
let chartTendencia = null

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

function normalizeOptionRows (result) {
  if (!result) return []
  if (Array.isArray(result)) return result
  if (Array.isArray(result.data)) return result.data
  return []
}

function populateSelect (selectElement, rows, preferredKeys, allLabel) {
  if (!selectElement) return

  const previousValue = selectElement.value
  selectElement.innerHTML = `<option value="">${allLabel}</option>`

  const valuesSet = new Set()

  for (const row of rows) {
    const key = preferredKeys.find((k) => row && row[k] !== undefined && row[k] !== null)
    if (!key) continue

    const value = String(row[key]).trim()
    if (!value || valuesSet.has(value)) continue

    valuesSet.add(value)

    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    selectElement.appendChild(option)
  }

  if (previousValue && valuesSet.has(previousValue)) {
    selectElement.value = previousValue
  }
}

async function cargarCatalogosFiltros () {
  const [resCategorias, resTipos] = await Promise.all([
    fetch('/admin/api/categorias'),
    fetch('/admin/api/tipos')
  ])

  const [categoriasResult, tiposResult] = await Promise.all([
    resCategorias.json(),
    resTipos.json()
  ])

  if (!resCategorias.ok) {
    throw new Error(categoriasResult.message || 'No se pudieron cargar las categorías.')
  }

  if (!resTipos.ok) {
    throw new Error(tiposResult.message || 'No se pudieron cargar los tipos.')
  }

  const categoriasRows = normalizeOptionRows(categoriasResult)
  const tiposRows = normalizeOptionRows(tiposResult)

  populateSelect(selectCategoria, categoriasRows, ['Nombre', 'nombre'], 'Todas')
  populateSelect(selectTipo, tiposRows, ['Nombre', 'nombre'], 'Todos')
}

function formatMoney (value) {
  const numero = Number(value || 0)
  return `$${numero.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

function renderResumen (resumen) {
  document.getElementById('kpiProductosVendidos').textContent = resumen.productos_vendidos || 0
  document.getElementById('kpiUnidadesVendidas').textContent = resumen.unidades_vendidas || 0
  document.getElementById('kpiIngresos').textContent = formatMoney(resumen.ingresos_totales)
  document.getElementById('kpiIngredientes').textContent = resumen.ingredientes_utilizados || 0
  document.getElementById('kpiAfectados').textContent = resumen.productos_afectados || 0
}

function renderTopIngresos (rows) {
  const tbody = document.getElementById('topIngresosBody')

  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No hay datos para estos filtros.</td></tr>'
    return
  }

  tbody.innerHTML = rows.map((row) => `
    <tr>
      <td>
        <strong>${row.producto}</strong><br>
        <small>${row.tipo || 'Sin tipo'}</small>
      </td>
      <td>${row.categoria || 'Sin categoría'}</td>
      <td>${row.total_vendido || 0}</td>
      <td>${formatMoney(row.ingresos)}</td>
    </tr>
  `).join('')
}

function renderProductosAfectados (rows) {
  const tbody = document.getElementById('productosAfectadosBody')

  if (!rows || rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No hay productos afectados para estos filtros.</td></tr>'
    return
  }

  tbody.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.producto}</td>
      <td>${row.categoria}</td>
      <td>${row.insumos_inactivos}</td>
      <td>${row.detalle_insumos || 'Sin detalle'}</td>
    </tr>
  `).join('')
}

function renderDisponibilidad (data) {
  document.getElementById('ingredientesActivos').textContent = data.ingredientes_activos || 0
  document.getElementById('ingredientesInactivos').textContent = data.ingredientes_inactivos || 0
}

function buildBarChart (chartRef, canvasId, labels, values, label) {
  if (chartRef) {
    chartRef.destroy()
  }

  const ctx = document.getElementById(canvasId).getContext('2d')
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

function buildLineChart (chartRef, canvasId, labels, values1, values2) {
  if (chartRef) {
    chartRef.destroy()
  }

  const ctx = document.getElementById(canvasId).getContext('2d')
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Unidades',
          data: values1,
          tension: 0.3
        },
        {
          label: 'Ingresos',
          data: values2,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}

function renderCharts (data) {
  const topCantidad = data.topProductosCantidad || []
  const categoriaIngresos = data.categoriaIngresos || []
  const ingredientes = data.ingredientesPopulares || []
  const tendencia = data.tendencia || []

  chartTopCantidad = buildBarChart(
    chartTopCantidad,
    'chartTopCantidad',
    topCantidad.map((x) => x.producto),
    topCantidad.map((x) => Number(x.total_vendido || 0)),
    'Cantidad vendida'
  )

  chartCategoriaIngresos = buildBarChart(
    chartCategoriaIngresos,
    'chartCategoriaIngresos',
    categoriaIngresos.map((x) => x.categoria),
    categoriaIngresos.map((x) => Number(x.ingresos || 0)),
    'Ingresos'
  )

  chartIngredientes = buildBarChart(
    chartIngredientes,
    'chartIngredientes',
    ingredientes.map((x) => x.ingrediente),
    ingredientes.map((x) => Number(x.uso_en_pedidos || 0)),
    'Uso en pedidos'
  )

  chartTendencia = buildLineChart(
    chartTendencia,
    'chartTendencia',
    tendencia.map((x) => x.periodo),
    tendencia.map((x) => Number(x.unidades || 0)),
    tendencia.map((x) => Number(x.ingresos || 0))
  )
}

async function cargarMetricas () {
  clearStatus()
  dashboardContent.classList.add('loading')

  try {
    const params = getQueryParams()
    const response = await fetch(`/admin/api/metricas-productos?${params.toString()}`)
    const result = await response.json()

    if (!response.ok || !result.ok) {
      throw new Error(result.mensaje || 'No se pudieron consultar las métricas.')
    }

    renderResumen(result.data.resumen)
    renderTopIngresos(result.data.topProductosIngresos)
    renderProductosAfectados(result.data.productosAfectados)
    renderDisponibilidad(result.data.disponibilidad)
    renderCharts(result.data)

    if (result.sinDatos) {
      showStatus('info', result.mensaje || 'No hay información disponible.')
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
  window.open(`/admin/api/metricas-productos/export?${params.toString()}`, '_blank')
})

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await cargarCatalogosFiltros()
  } catch (error) {
    showStatus('error', error.message || 'No fue posible cargar los filtros de catálogo.')
  }

  await cargarMetricas()
})
