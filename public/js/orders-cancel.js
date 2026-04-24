document.addEventListener('DOMContentLoaded', () => {
  // ── Cancel modal ──────────────────────────────────────────────
  const cancelModal   = document.getElementById('cancel-order-modal')
  const closeModalBtn = document.getElementById('close-cancel-modal')
  const cancelModalBtn= document.getElementById('cancel-modal-btn')
  const confirmBtn    = document.getElementById('confirm-cancel-btn')
  const alertContainer= document.getElementById('alert-container')

  let selectedOrderId = null

  const openCancelModal = () => cancelModal.classList.add('is-active')
  window._openCancelModal = (id) => { selectedOrderId = id; openCancelModal() }
  const closeCancelModal = () => { cancelModal.classList.remove('is-active'); selectedOrderId = null }

  const showAlert = (message, type = 'is-info') => {
    if (!alertContainer) return
    alertContainer.innerHTML = `
      <article class="message ${type}">
        <div class="message-body">${message}</div>
      </article>`
    setTimeout(() => { alertContainer.innerHTML = '' }, 4000)
  }

  document.querySelectorAll('.btn-cancel-order').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation()
      selectedOrderId = button.dataset.orderId
      openCancelModal()
    })
  })

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeCancelModal)
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeCancelModal)
  cancelModal.querySelector('.modal-background')?.addEventListener('click', closeCancelModal)

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!selectedOrderId) return
      const id = selectedOrderId
      closeCancelModal()
      try {
        const res  = await fetch(`/admin/api/orders/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' } })
        const data = await res.json()
        if (!res.ok || !data.ok) { showAlert(data.message || 'No se pudo cancelar la orden.', 'is-danger'); return }

        // Eliminar de tabla activa o sección pendientes
        const row = document.querySelector(`[data-order-row="${id}"]`)
        if (row) row.remove()
        if (typeof removePendingRow === 'function') removePendingRow(id)

        showAlert(data.message || 'Orden cancelada correctamente.', 'is-success')
      } catch {
        showAlert('Ocurrió un error inesperado.', 'is-danger')
      }
    })
  }

  // ── Detail modal ──────────────────────────────────────────────
  const detailModal   = document.getElementById('detail-order-modal')
  const closeDetailBtn= document.getElementById('close-detail-modal')
  let   currentDetailId = null

  const closeDetailModal = () => { detailModal.classList.remove('is-active'); currentDetailId = null }

  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetailModal)
  detailModal.querySelector('.modal-background')?.addEventListener('click', closeDetailModal)

  // Status buttons inside detail modal
  document.querySelectorAll('#status-btn-group .status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!currentDetailId || btn.classList.contains('active-status')) return
      const nuevoEstado = btn.dataset.status
      try {
        const res  = await fetch(`/admin/api/orders/${currentDetailId}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: nuevoEstado })
        })
        const data = await res.json()
        if (!data.ok) { showAlert(data.message || 'No se pudo actualizar el estatus.', 'is-danger'); return }

        // Actualizar badge activo en los botones
        document.querySelectorAll('#status-btn-group .status-btn').forEach(b => b.classList.remove('active-status'))
        btn.classList.add('active-status')

        // Actualizar texto del detalle
        document.getElementById('detail-estado').textContent = nuevoEstado

        // Actualizar badge en la tabla
        const row = document.querySelector(`[data-order-row="${currentDetailId}"]`)
        if (row) {
          row.dataset.estado = nuevoEstado
          const badge = row.querySelector('.order-status-cell .order-badge')
          if (badge && typeof badgeClass === 'function') {
            badge.textContent = nuevoEstado
            badge.className   = `order-badge ${badgeClass(nuevoEstado)}`
          }
          // Si pasó a Entregado o Cancelado, quitar de la tabla
          if (nuevoEstado === 'Entregado' || nuevoEstado === 'Cancelado') {
            row.remove()
            closeDetailModal()
          }
        }

        if (nuevoEstado !== 'Entregado' && nuevoEstado !== 'Cancelado') {
          showAlert(`Estatus actualizado a "${nuevoEstado}".`, 'is-success')
        }
      } catch {
        showAlert('Error al actualizar el estatus.', 'is-danger')
      }
    })
  })

  document.querySelectorAll('[data-order-row]').forEach((row) => {
    row.addEventListener('click', () => openDetailModal(row))
  })

  window._openDetailModal = openDetailModal

  function openDetailModal (row, showStatus = true) {
    const id = row.dataset.orderRow || row.dataset.pendingRow
    currentDetailId = id

    document.getElementById('detail-id').textContent        = id
    document.getElementById('detail-nombre').textContent    = row.dataset.nombre
    document.getElementById('detail-telefono').textContent  = row.dataset.telefono
    document.getElementById('detail-tipo').textContent      = row.dataset.tipo
    document.getElementById('detail-fecha').textContent     = row.dataset.fecha
    document.getElementById('detail-direccion').textContent = row.dataset.direccion || '—'

    const estadoActual = row.dataset.estado
    document.getElementById('detail-estado').textContent = estadoActual

    // Mostrar/ocultar sección de cambio de estatus
    document.getElementById('status-section').style.display = showStatus ? '' : 'none'

    // Resaltar botón del estatus actual
    document.querySelectorAll('#status-btn-group .status-btn').forEach(b => {
      b.classList.toggle('active-status', b.dataset.status === estadoActual)
    })

    const itemsList = document.getElementById('detail-items')
    const totalEl   = document.getElementById('detail-total')
    itemsList.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:16px;">Cargando...</td></tr>'
    totalEl.textContent = ''
    detailModal.classList.add('is-active')

    fetch(`/admin/api/orders/${id}/items`)
      .then(r => r.json())
      .then(data => {
        if (!data.ok || data.items.length === 0) {
          itemsList.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:16px;">Sin productos registrados.</td></tr>'
          return
        }
        let total = 0
        itemsList.innerHTML = data.items.map(item => {
          const subtotal = item.cantidad * item.precio
          total += subtotal
          return `<tr>
            <td style="padding:8px 4px;">${item.nombre}</td>
            <td style="text-align:center;padding:8px 4px;">${item.cantidad}</td>
            <td style="text-align:right;padding:8px 4px;">$${subtotal.toFixed(2)}</td>
          </tr>`
        }).join('')
        totalEl.textContent = `$${total.toFixed(2)}`
      })
      .catch(() => {
        itemsList.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#e74c3c;padding:16px;">Error al cargar productos.</td></tr>'
      })
  }
})
