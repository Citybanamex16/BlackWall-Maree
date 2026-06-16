document.addEventListener('DOMContentLoaded', () => {
  const botonesEliminar = document.querySelectorAll('.btn-eliminar-dia')

  botonesEliminar.forEach((boton) => {
    boton.addEventListener('click', async () => {
      const id = boton.dataset.id
      const fecha = boton.dataset.fecha

      const confirmado = confirm(`¿Seguro que deseas eliminar el día hábil ${fecha}?`)

      if (!confirmado) {
        return
      }

      try {
        const response = await fetch(`/admin/dias-habiles/${id}/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        alert(data.mensaje)

        if (data.ok) {
          window.location.href = '/admin/dias-habiles'
        }
      } catch (error) {
        alert('Error de red o del servidor al intentar eliminar el día hábil.')
      }
    })
  })
})
