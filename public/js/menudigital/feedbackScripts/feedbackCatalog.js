/* global Chart */
const btnFiltrar = document.getElementById('btn-filtrar')

async function getFeedbackData () {
  try {
    const res = await fetch('/admin/api/comentarios')

    if (!res.ok) {
      throw new Error('Error al obtener comentarios')
    }

    const response = await res.json()
    const feedbackData = response.data

    buildSectionRecentSummary(feedbackData)

    // la chart
    buildSectionKPIs(feedbackData)

    applyFilter(feedbackData)

    // Filter button listener
    btnFiltrar.addEventListener('click', (event) => {
      event.preventDefault()
      applyFilter(feedbackData)
    })
  } catch (err) {
    console.error('Error en getFeedbackData:', err)
    document.getElementById('seccion-comentarios').innerHTML = `
      <div class="reviews-empty">
        <span class="reviews-empty-icon">⚠️</span>
        <p>No se pudieron cargar los comentarios.</p>
      </div>`
  }
}

getFeedbackData()

// Construcción de Sección 0: KPI cards
function buildSectionRecentSummary (AllData) {
  if (!AllData || AllData.length === 0) return

  // Sort (descendiente por fecha)
  const sortedData = [...AllData].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))

  const latestFecha = new Date(sortedData[0].Fecha)
  const thirtyDaysAgo = new Date(latestFecha)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentReviews = sortedData.filter(r => new Date(r.Fecha) >= thirtyDaysAgo)

  const totalReviews = AllData.length
  const totalPositive = AllData.filter(r => r.Puntaje >= 4).length
  const averagePuntaje = recentReviews.length
    ? (recentReviews.reduce((acc, curr) => acc + curr.Puntaje, 0) / recentReviews.length).toFixed(1)
    : '—'
  const mostRecent = sortedData[0]
  const recentLabel = new Date(mostRecent.Fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })

  document.getElementById('kpi-promedio').textContent = averagePuntaje
  document.getElementById('kpi-total').textContent = totalReviews
  document.getElementById('kpi-positivas').textContent = totalPositive
  document.getElementById('kpi-reciente').textContent = recentLabel
}

// Auxiliares de Sección 1:
const filtroDate = document.getElementById('filtro-date')
const filtroPuntaje = document.getElementById('filtro-puntaje')
const filtroId = document.getElementById('filtro-id')

const APP_TODAY = new Date()
console.log('Fecha de hoy: ', APP_TODAY)

function cleanOldReviews (AllData, daysThreshold) {
  // Clonamos la fecha de hoy
  const cutoffDate = new Date(APP_TODAY)

  // CORRECCIÓN: Usamos getDate() para obtener el día (número) y le restamos los días
  cutoffDate.setDate(cutoffDate.getDate() - daysThreshold)
  cutoffDate.setHours(0, 0, 0, 0) // Limpiamos horas para una comparación justa

  return AllData.filter(review => {
    if (!review.Fecha) return false

    const reviewDate = new Date(review.Fecha)
    if (isNaN(reviewDate)) return false

    const tempReviewDate = new Date(reviewDate)
    tempReviewDate.setHours(0, 0, 0, 0)

    return tempReviewDate >= cutoffDate
  })
}

function getDateLimit (dropDownValue) {
  if (dropDownValue === '') return ''

  // Usamos la misma referencia global APP_TODAY
  const limiteDate = new Date(APP_TODAY)
  const dias = parseInt(dropDownValue)

  // Restamos los días
  limiteDate.setDate(limiteDate.getDate() - dias)

  // Formateamos a YYYY-MM-DD
  const year = limiteDate.getFullYear()
  const month = String(limiteDate.getMonth() + 1).padStart(2, '0')
  const day = String(limiteDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function applyFilter (AllData) {
  // A. Limpiar lo antiguo
  const selectedDays = parseInt(filtroDate.value)
  const allTime = selectedDays === 0

  // A. Si no es "todo el historial", recortar por días seleccionados
  const processedData = allTime ? AllData : cleanOldReviews(AllData, selectedDays)

  // B. Capturar valores de la interfaz
  const dateFilterValue = allTime ? '' : getDateLimit(filtroDate.value)
  const puntajeFilterValue = filtroPuntaje.value
  const idFilterValue = filtroId.value.trim().toLowerCase()

  // C. Pipeline de filtrado
  const filteredData = processedData.filter(review => {
    const matchId = idFilterValue === '' ||
      review.ID_Review.toLowerCase().includes(idFilterValue)

    const reviewDateString = review.Fecha.split('T')[0]
    const matchDate = dateFilterValue === '' ||
      reviewDateString >= dateFilterValue

    const matchPuntaje = puntajeFilterValue === 'todos' ||
      review.Puntaje === parseInt(puntajeFilterValue)

    return matchId && matchDate && matchPuntaje
  })

  buildSectionComments(filteredData)
}

// Construcción de Sección 1: Lectura de Comentarios
function buildSectionComments (reviewData) {
  console.log('Data: ', reviewData)

  const contenedor = document.getElementById('seccion-comentarios')
  contenedor.innerHTML = ''

  // Actualizar conteo en la barra de filtros
  document.getElementById('filtro-conteo').textContent =
        `${reviewData.length} comentario${reviewData.length !== 1 ? 's' : ''}`

  if (reviewData.length === 0) {
    contenedor.innerHTML = `
            <div class="reviews-empty">
                <span class="reviews-empty-icon">💬</span>
                <p>No hay comentarios que coincidan con los filtros.</p>
            </div>`
    return
  }

  reviewData.forEach(review => {
    contenedor.insertAdjacentHTML('beforeend', crearTarjetaReview(review))
  })

  // Click en tarjeta → abrir modal de detalle
  contenedor.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.review-card')
    if (!tarjeta) return
    const idReview = tarjeta.dataset.idReview
    abrirDetalleReview(idReview)
  })
}

function crearTarjetaReview (review) {
  const estrellas = renderEstrellas(review.Puntaje)
  const colorBorde = colorPorPuntaje(review.Puntaje)
  const fechaLegible = formatearFecha(review.Fecha)
  const comentario = review.Comentario.replace(/^"|"$/g, '') // quita comillas extra si las hay

  return `
        <article class="review-card" data-id-review="${review.ID_Review}" data-id-orden="${review.ID_Orden}" title="Ver orden ${review.ID_Orden}">
            <div class="review-borde-color" style="background:${colorBorde}"></div>
            <div class="review-body">
                <div class="review-header">
                    <div class="review-estrellas">${estrellas}</div>
                    <span class="review-puntaje-num">${review.Puntaje}/5</span>
                    <span class="review-fecha">${fechaLegible}</span>
                    <span class="review-id-orden">${review.ID_Orden}</span>
                </div>
                <p class="review-comentario">${comentario}</p>
                <p class="review-id-small">Review ${review.ID_Review}</p>
            </div>
        </article>`
}

// ── Helpers ───────────────────────────────────────────────

function renderEstrellas (puntaje) {
  return Array.from({ length: 5 }, (_, i) =>
        `<span class="${i < puntaje ? 'estrella llena' : 'estrella vacia'}">★</span>`
  ).join('')
}

function colorPorPuntaje (puntaje) {
  const colores = {
    1: '#e74c3c',
    2: '#e67e22',
    3: '#f1c40f',
    4: '#2ecc71',
    5: '#27ae60'
  }
  return colores[puntaje] ?? '#ccc'
}

function formatearFecha (fechaISO) {
  return new Date(fechaISO).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

/// /Construcción de Sección 2: Graficas de KPIs
// Variable global para almacenar el gráfico y poder destruirlo al re-filtrar
let timeChartInstance = null

// 1. Función Auxiliar: Procesamiento de datos para la gráfica
function processDataForTimeChart (data) {
  const dailyData = {}

  // A. Agrupar por fecha y sumar puntajes
  data.forEach(review => {
    // Agrupación por Lapos de tiempo
    // const dateString = review.Fecha.split('T')[0]; // Por día
    const dateString = review.Fecha.slice(0, 7) // Por mes

    if (!dailyData[dateString]) {
      dailyData[dateString] = { sum: 0, count: 0 }
    }

    dailyData[dateString].sum += review.Puntaje
    dailyData[dateString].count += 1
  })

  // B. Convertir el objeto a un array y calcular el promedio
  const chartArray = Object.keys(dailyData).map(date => {
    return {
      date,
      // Calculamos promedio y lo limitamos a 2 decimales
      average: parseFloat((dailyData[date].sum / dailyData[date].count).toFixed(2))
    }
  })

  // C. Ordenar cronológicamente (Eje X debe ir del pasado al presente)
  chartArray.sort((a, b) => new Date(a.date) - new Date(b.date))

  return chartArray
}

// 2. Construcción de Sección 2: Graficas de KPIs
function buildSectionKPIs (data) {
  console.log('KPIs data: ', data)

  const kpiContainer = document.getElementById('seccion-kpis')

  // Si no hay datos, mostramos un mensaje y salimos
  if (data.length === 0) {
    kpiContainer.innerHTML = '<p class="kpis-placeholder">No hay datos en este periodo.</p>'
    return
  }

  // A. Preparamos el HTML: Inyectamos un canvas fresco
  kpiContainer.innerHTML = '<canvas id="kpi-chart" style="width:100%; height:300px;"></canvas>'

  // B. Procesamos los datos
  const chartData = processDataForTimeChart(data)

  // C. Extraemos los ejes X e Y para Chart.js
  const xAxisLabels = chartData.map(item => item.date) // ["2026-05-01", "2026-05-02"...]
  const yAxisValues = chartData.map(item => item.average) // [4.5, 3.2, 5.0...]

  // D. Dibujamos la gráfica
  const ctx = document.getElementById('kpi-chart').getContext('2d')

  // IMPORTANTE: Si ya existía una gráfica, debemos destruirla antes de crear la nueva
  // Esto evita el bug donde al pasar el mouse parpadean los datos viejos
  if (timeChartInstance) {
    timeChartInstance.destroy()
  }

  timeChartInstance = new Chart(ctx, {
    type: 'line', // Tipo línea para "a través del tiempo"
    data: {
      labels: xAxisLabels,
      datasets: [{
        label: 'Promedio de Satisfacción Diario',
        data: yAxisValues,
        borderColor: '#4CAF50', // Un verde estilo restaurante
        backgroundColor: 'rgba(76, 175, 80, 0.2)', // Relleno semitransparente debajo de la línea
        borderWidth: 3,
        tension: 0.3, // Le da una curva suave a la línea (no tan angular)
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 1, // El mínimo es 1 estrella
          max: 5, // El máximo es 5 estrellas
          ticks: {
            stepSize: 1 // Que el eje Y marque 1, 2, 3, 4, 5
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  })
}

// ── Modal de detalle ──────────────────────────────────────

const modalDetalle = document.getElementById('ModalDetalleReview')
document.getElementById('btnCerrarDetalle').addEventListener('click', () => modalDetalle.close())

async function abrirDetalleReview (idReview) {
  try {
    const res = await fetch(`/admin/api/comentarios/${idReview}`)
    if (!res.ok) throw new Error('No se pudo obtener el detalle')

    const { data } = await res.json()

    document.getElementById('detalle-subtitulo').textContent = `Orden ${data.ID_Orden}`
    document.getElementById('detalle-id').textContent = data.ID_Review
    document.getElementById('detalle-orden').textContent = data.ID_Orden
    document.getElementById('detalle-estrellas').innerHTML =
      renderEstrellas(data.Puntaje) + ` <span style="margin-left:6px;">${data.Puntaje}/5</span>`
    document.getElementById('detalle-fecha').textContent = formatearFecha(data.Fecha)
    document.getElementById('detalle-comentario').textContent =
      data.Comentario ? data.Comentario.replace(/^"|"$/g, '') : 'Sin comentario'

    modalDetalle.showModal()
  } catch (err) {
    console.error('Error al abrir detalle:', err)
  }
}
