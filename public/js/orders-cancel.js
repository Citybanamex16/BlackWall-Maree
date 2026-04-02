document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('cancel-order-modal')
  const closeModalBtn = document.getElementById('close-cancel-modal')
  const cancelModalBtn = document.getElementById('cancel-modal-btn')
  const confirmBtn = document.getElementById('confirm-cancel-btn')
  const alertContainer = document.getElementById('alert-container')

  let selectedOrderId = null

  const openModal = () => {
    modal.classList.add('is-active')
  }

  const closeModal = () => {
    modal.classList.remove('is-active')
    selectedOrderId = null
  }

  const showAlert = (message, type = 'is-info') => {
    if (!alertContainer) return

    alertContainer.innerHTML = `
      <article class="message ${type}">
        <div class="message-body">
          ${message}
        </div>
      </article>
    `
  }

  document.querySelectorAll('.btn-cancel-order').forEach((button) => {
    button.addEventListener('click', () => {
      selectedOrderId = button.dataset.orderId
      openModal()
    })
  })

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal)
  }

  if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', closeModal)
  }

  const modalBackground = modal.querySelector('.modal-background')
  if (modalBackground) {
    modalBackground.addEventListener('click', closeModal)
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!selectedOrderId) return

      try {
        const response = await fetch(`/admin/api/orders/${selectedOrderId}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()

        if (!response.ok || !result.ok) {
          showAlert(result.message || 'No se pudo cancelar la orden.', 'is-danger')
          closeModal()
          return
        }

        const row = document.querySelector(`[data-order-row="${selectedOrderId}"]`)
        if (row) {
          const statusCell = row.querySelector('.order-status-cell')
          const actionCell = row.querySelector('.order-actions')

          if (statusCell) {
            statusCell.innerHTML = '<span class="tag is-light order-status-text">Cancelado</span>'
          }

          if (actionCell) {
            actionCell.innerHTML = '<span class="tag is-light">No disponible</span>'
          }
        }

        showAlert(result.message || 'Orden cancelada correctamente.', 'is-success')
        closeModal()
      } catch (error) {
        console.error('Error al cancelar:', error)
        showAlert('Ocurrió un error inesperado al cancelar la orden.', 'is-danger')
        closeModal()
      }
    })
  }
})
