document.addEventListener('DOMContentLoaded', () => {
  const botones = document.querySelectorAll('.btn-baja')

  botones.forEach((boton) => {
    boton.addEventListener('click', async () => {
      const id = boton.dataset.id
      // const nombre = boton.dataset.nombre

      /*
      const confirmado = confirm(`¿Seguro que deseas dar de baja a ${nombre}?`)

      if (!confirmado) {
        return
      }
      */

      try {
        const response = await fetch(`/admin/colaboradores/${id}/baja`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()

        console.log(data.mensaje)

        if (data.ok) {
          window.location.href = '/admin/colaboradores'
        }
      } catch (error) {
        console.log('Error de red o del servidor al intentar dar de baja.')
      }
    })
  })
})
