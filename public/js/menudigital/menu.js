const platillobotones = document.getElementsByClassName('platillo-btn')

const overlay = document.getElementById('modal-overlay')
const modalContent = document.getElementById('modal-content')
const modalClose = document.getElementById('modal-close')

// Abrir modal
const abrirModal = (contenido) => {
  modalContent.innerHTML = contenido
  overlay.classList.add('active')
}

// Cerrar modal
const cerrarModal = () => {
  overlay.classList.remove('active')
  modalContent.innerHTML = ''
}

// Cerrar si se pica fuera del modal-box
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    cerrarModal()
  }
})

// Cerrar con botón X
modalClose.addEventListener('click', cerrarModal)

// Botones de platillo
for (const button of platillobotones) {
  button.addEventListener('click', () => {
    console.log('Se pico')
    fetch('/menu/consultaplatillo').then((result) => {
      return result.json()
    }).then((data) => {
      console.log(data)

      // Cuando este la DB, aqui se pone data.nombre, data.ingredientes, etc.
      const contenido = `
                <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 24px; margin-bottom: 12px;">
                    Nombre del Platillo
                </h2>
                <p style="color: #777; font-size: 13px; margin-bottom: 16px;">
                    ${data.message}
                </p>
                <p style="color: #b5956a; font-size: 15px; font-weight: 500;">
                    $000
                </p>
            `
      abrirModal(contenido)
    }).catch((error) => {
      console.log(error)
    })
  })
}
