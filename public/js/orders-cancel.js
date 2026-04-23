document.addEventListener('DOMContentLoaded', () => {
  // ── Cancel modal ──────────────────────────────────────────────
  const cancelModal = document.getElementById('cancel-order-modal')
  const closeModalBtn = document.getElementById('close-cancel-modal')
  const cancelModalBtn = document.getElementById('cancel-modal-btn')
  const confirmBtn = document.getElementById('confirm-cancel-btn')
  const alertContainer = document.getElementById('alert-container')

  let selectedOrderId = null

  const openCancelModal = () => cancelModal.classList.add('is-active')
  window._openCancelModal = (id) => { selectedOrderId = id; openCancelModal() }
  const closeCancelModal = () => {
    cancelModal.classList.remove('is-active')
    selectedOrderId = null
  }

  const showAlert = (message, type = 'is-info') => {
    if (!alertContainer) return
    alertContainer.innerHTML = `
      <article class="message ${type}">
        <div class="message-body">${message}</div>
      </article>`
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
      try {
        const response = await fetch(`/admin/api/orders/${selectedOrderId}/cancel`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        const result = await response.json()

        if (!response.ok || !result.ok) {
          showAlert(result.message || 'No se pudo cancelar la orden.', 'is-danger')
          closeCancelModal()
          return
        }

        const row = document.querySelector(`[data-order-row="${selectedOrderId}"]`)
        if (row) row.remove()

        showAlert(result.message || 'Orden cancelada correctamente.', 'is-success')
        closeCancelModal()
      } catch (error) {
        console.error('Error al cancelar:', error)
        showAlert('Ocurrió un error inesperado.', 'is-danger')
        closeCancelModal()
      }
    })
  }

  // ── Detail modal ──────────────────────────────────────────────
  const detailModal = document.getElementById('detail-order-modal')
  const closeDetailBtn = document.getElementById('close-detail-modal')

  const closeDetailModal = () => detailModal.classList.remove('is-active')

  if (closeDetailBtn) closeDetailBtn.addEventListener('click', closeDetailModal)
  detailModal.querySelector('.modal-background')?.addEventListener('click', closeDetailModal)

  document.querySelectorAll('[data-order-row]').forEach((row) => {
    row.addEventListener('click', async () => {
      const id = row.dataset.orderRow
      document.getElementById('detail-id').textContent = id
      document.getElementById('detail-nombre').textContent = row.dataset.nombre
      document.getElementById('detail-telefono').textContent = row.dataset.telefono
      document.getElementById('detail-tipo').textContent = row.dataset.tipo
      document.getElementById('detail-fecha').textContent = row.dataset.fecha
      document.getElementById('detail-direccion').textContent = row.dataset.direccion || '—'
      document.getElementById('detail-estado').textContent = row.dataset.estado

      const itemsList = document.getElementById('detail-items')
      const totalEl = document.getElementById('detail-total')
      itemsList.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#aaa;padding:16px;">Cargando...</td></tr>'
      totalEl.textContent = ''
      detailModal.classList.add('is-active')

      try {
        const res = await fetch(`/admin/api/orders/${id}/items`)
        const data = await res.json()

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
      } catch {
        itemsList.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#e74c3c;padding:16px;">Error al cargar productos.</td></tr>'
      }
    })
  })
})
