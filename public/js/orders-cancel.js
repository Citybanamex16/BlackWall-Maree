document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('cancel-modal')
  const confirmBtn = document.getElementById('confirm-cancel-btn')
  const abortBtn = document.getElementById('abort-cancel-btn')
  const closeModalX = document.getElementById('close-modal-x')
  const modalText = document.getElementById('cancel-modal-text')
  const alertContainer = document.getElementById('alert-container')

  if (!modal || !confirmBtn || !abortBtn || !modalText || !alertContainer) {
    return
  }

  let selectedOrderId = null

  const showModal = () => {
    modal.classList.add('is-active')
  }

  const hideModal = () => {
    modal.classList.remove('is-active')
  }

  const showAlert = (message, type = 'is-info') => {
    alertContainer.innerHTML = `
      <article class="message ${type}">
        <div class="message-body">
          ${message}
        </div>
      </article>
    `
  }

  const updateOrderRowStatus = (orderId, newStatus) => {
    const row = document.getElementById(`order-row-${orderId}`)

    if (!row) {
      return
    }

    const statusCell = row.querySelector('.order-status')
    if (statusCell) {
      statusCell.textContent = newStatus
    }

    const actionCell = row.querySelector('.order-actions')
    if (actionCell) {
      actionCell.innerHTML = '<span class="tag is-light">Sin acción</span>'
    }
  }

  document.querySelectorAll('.btn-cancel-order').forEach((button) => {
    button.addEventListener('click', () => {
      selectedOrderId = button.dataset.orderId
      modalText.textContent = `¿Deseas cancelar la orden #${selectedOrderId}?`
      showModal()
    })
  })

  const closeAndResetModal = () => {
    selectedOrderId = null
    hideModal()
  }

  abortBtn.addEventListener('click', closeAndResetModal)

  if (closeModalX) {
    closeModalX.addEventListener('click', closeAndResetModal)
  }

  const modalBackground = modal.querySelector('.modal-background')
  if (modalBackground) {
    modalBackground.addEventListener('click', closeAndResetModal)
  }

  confirmBtn.addEventListener('click', async () => {
    if (!selectedOrderId) {
      return
    }

    confirmBtn.disabled = true
    abortBtn.disabled = true

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

        if (result.partial) {
          updateOrderRowStatus(selectedOrderId, 'Cancelado')
        }

        hideModal()
        return
      }

      updateOrderRowStatus(result.pedidoId, result.nuevoEstatus)
      showAlert(result.message, 'is-success')
      hideModal()
    } catch (error) {
      console.error('Error AJAX al cancelar la orden:', error)
      showAlert('Ocurrió un error de red al cancelar la orden.', 'is-danger')
    } finally {
      confirmBtn.disabled = false
      abortBtn.disabled = false
      selectedOrderId = null
    }
  })
})
