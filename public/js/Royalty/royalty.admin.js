/* eslint-env browser */
/* global alert */

/* eslint-disable no-unused-vars */
function borrarRoyalty (NombreRoyalty) {
  if (confirm('¿Estas seguro que deseas borrar ' + NombreRoyalty + ' ?')) {
    fetch('/royalty/borrar/' + NombreRoyalty, { method: 'DELETE' }).then(() => {
      window.location.reload()
    }).catch(() => {
      alert('Error en conexión')
    })
  }
}
