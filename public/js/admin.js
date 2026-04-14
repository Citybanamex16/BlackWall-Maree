document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll(".btn-baja")

  botones.forEach((boton) => {
    boton.addEventListener("click", async () => {
      const id = boton.dataset.id
      const nombre = boton.dataset.nombre

      const confirmado = confirm(`¿Seguro que deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`)

      if (!confirmado) {
        return
      }

      try {
        const response = await fetch(`/admin/colaboradores/${id}/baja`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        })

        const data = await response.json()
        alert(data.mensaje)

        if (data.ok) {
          window.location.href = "/admin/colaboradores"
        }
      } catch (error) {
        alert("Error de red o del servidor al intentar eliminar al colaborador.")
      }
    })
  })
})
