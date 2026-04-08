const btnFiltrar = document.getElementById('btn-filtrar')

async function getFeedbackData () {
  console.log('Obteniendo Datos de Feedback')
  try {
    const res = await fetch('/menu/feedbackCatalog')

    if (!res.ok) {
      // error desde Controlador
      console.log('Erro desde controlador: ', res.error)
      throw new Error('Error desde controlador feedback')
    }

    const response = await res.json()
    const feedbackData = response.data
    // Listener de boton de filtrar
    btnFiltrar.addEventListener('click', (event) => {
      event.preventDefault()
      applyFilter(feedbackData)
    })

    const summaryReciente = buildSectionRecentSummary(feedbackData)
    console.log('Summary Reciente: ', summaryReciente)
    buildSectionKPIs(feedbackData)

  } catch (err) {
    console.log('Error detectado en buildFeedbackCatalog: ', err)
  }
}

getFeedbackData()

// Construcción de Sección 0: Resumen Actual
function buildSectionRecentSummary (AllData) {
  if (!AllData || AllData.length === 0) return null

  // 1. Ordenar por fecha (Descendente: la más nueva primero)
  // Convertimos a objeto Fecha para asegurar una comparación precisa
  const sortedData = [...AllData].sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))

  // 2. Definir ventana de tiempo para el "Promedio Reciente" (ej. últimos 30 días)
  const latestFecha = new Date(sortedData[0].Fecha)
  const thirtyDaysAgo = new Date(latestFecha)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentReviews = sortedData.filter(r => new Date(r.Fecha) >= thirtyDaysAgo)

  // 3. Cálculos de métricas
  const totalReviews = AllData.length

  const totalPositive = AllData.filter(r => r.Puntaje >= 4).length

  const averagePuntaje = (recentReviews.reduce((acc, curr) => acc + curr.Puntaje, 0) / recentReviews.length).toFixed(1)

  // 4. Extraer la más reciente (ya ordenada en el paso 1)
  const mostRecent = sortedData[0]

  // Retornamos el objeto de INFORMACIÓN listo para el HTML
  return {
    metrics: {
      generalAverage: parseFloat(averagePuntaje),
      totalReviews,
      totalPositive,
      positivePercentage: ((totalPositive / totalReviews) * 100).toFixed(0) + '%'
    },
    recentSnapshot: {
      id: mostRecent.id,
      customerComment: mostRecent.comment,
      stars: mostRecent.Puntaje,
      FechaLabel: new Date(mostRecent.Fecha).toLocaleDateString('es-ES')
    },
    config: {
      averagePeriodDays: 30 // Metadato para que la vista sepa qué está mostrando
    }
  }
}

// Auxiliares de Sección 1:
const filtroDate = document.getElementById('filtro-date')
const filtroPuntaje = document.getElementById('filtro-puntaje')
const filtroId = document.getElementById('filtro-id')
const filtroResult = document.getElementById('filtro-conteo')

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
  const processedData = cleanOldReviews(AllData, 90)
  console.log('Datos limpiados (Últimos 90 días): ', processedData)

  // B. Capturar valores de la interfaz
  const dateFilterValue = getDateLimit(filtroDate.value)
  console.log('Fecha de filtro límite: ', dateFilterValue)
  const puntajeFilterValue = filtroPuntaje.value
  const idFilterValue = filtroId.value.trim().toLowerCase()

  console.log('Puntaje filtro: ', puntajeFilterValue)

  // C. Pipeline de filtrado
  const filteredData = processedData.filter(review => {
    const matchId = idFilterValue === '' ||
                        review.ID_Review.toLowerCase().includes(idFilterValue)

    // Filtro Fecha: reviewDateString >= dateFilterValue
    const reviewDateString = review.Fecha.split('T')[0]
    const matchDate = dateFilterValue === '' ||
                         reviewDateString >= dateFilterValue

    const matchPuntaje = puntajeFilterValue === 'todos' ||
                            review.Puntaje === parseInt(puntajeFilterValue)

    return matchId && matchDate && matchPuntaje
  })

  // 4. Mostrar en UI
  const totalAmount = filteredData.length
  filtroResult.textContent = `Resultados encontrados: ${totalAmount}`

  // 5. Salida final
  console.log('--- Datos Listos para Secciones 1 y 2 ---')
  console.log(filteredData)

  // 6. constuir vistas:
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

  // Delegación de clicks — placeholder para abrir orden
  contenedor.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('.review-card')
    if (!tarjeta) return
    const idOrden = tarjeta.dataset.idOrden
    // TODO: abrir modal o navegar a la orden
    console.log('Orden seleccionada:', idOrden)
  }, { once: true })
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
let timeChartInstance = null;

// 1. Función Auxiliar: Procesamiento de datos para la gráfica
function processDataForTimeChart(data) {
    const dailyData = {};

    // A. Agrupar por fecha y sumar puntajes
    data.forEach(review => {
        //Agrupación por Lapos de tiempo
        //const dateString = review.Fecha.split('T')[0]; // Por día
      const dateString = review.Fecha.slice(0, 7); // Por mes
        
        if (!dailyData[dateString]) {
            dailyData[dateString] = { sum: 0, count: 0 };
        }
        
        dailyData[dateString].sum += review.Puntaje;
        dailyData[dateString].count += 1;
    });

    // B. Convertir el objeto a un array y calcular el promedio
    const chartArray = Object.keys(dailyData).map(date => {
        return {
            date: date,
            // Calculamos promedio y lo limitamos a 2 decimales
            average: parseFloat((dailyData[date].sum / dailyData[date].count).toFixed(2))
        };
    });

    // C. Ordenar cronológicamente (Eje X debe ir del pasado al presente)
    chartArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    return chartArray;
}

// 2. Construcción de Sección 2: Graficas de KPIs
function buildSectionKPIs(data) {
    console.log('KPIs data: ', data);

    const kpiContainer = document.getElementById('seccion-kpis');

    // Si no hay datos, mostramos un mensaje y salimos
    if (data.length === 0) {
        kpiContainer.innerHTML = '<p class="kpis-placeholder">No hay datos en este periodo.</p>';
        return;
    }

    // A. Preparamos el HTML: Inyectamos un canvas fresco
    kpiContainer.innerHTML = '<canvas id="kpi-chart" style="width:100%; height:300px;"></canvas>';
    
    // B. Procesamos los datos
    const chartData = processDataForTimeChart(data);

    // C. Extraemos los ejes X e Y para Chart.js
    const xAxisLabels = chartData.map(item => item.date);   // ["2026-05-01", "2026-05-02"...]
    const yAxisValues = chartData.map(item => item.average); // [4.5, 3.2, 5.0...]

    // D. Dibujamos la gráfica
    const ctx = document.getElementById('kpi-chart').getContext('2d');

    // IMPORTANTE: Si ya existía una gráfica, debemos destruirla antes de crear la nueva
    // Esto evita el bug donde al pasar el mouse parpadean los datos viejos
    if (timeChartInstance) {
        timeChartInstance.destroy();
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
                    position: 'top',
                }
            }
        }
    });
}
