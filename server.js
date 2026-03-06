const express = require('express')
const path = require('path')
const appServer = express()

// Sección: Configuración de Carpetas Estaticas
appServer.use(express.static(path.join(__dirname, 'public')))

// Sección: Configuración de Motor EJS
appServer.set('view engine', 'ejs')
appServer.set('views', 'views')

// Sección de Routers
const clienteRutes = require('./routes/cliente.routes.js')
const adminRutes = require('./routes/admin.routes.js')

appServer.use('/cliente', clienteRutes)
appServer.use('/admin', adminRutes)

// Middlewares Globales de enrutamiento

// 404 (Ruta no encontrada)
appServer.use((req, res, next) => {
  const errorFile = path.join(__dirname, 'public', 'htmls', 'errorPage404.html')
  res.status(404).sendFile(errorFile)
  console.log(`Ruta Fallida: ${req.url}`)
  // O si usas plantillas: res.status(404).render('404');
})

// ERRORES GLOBAL (algun middleware llamo a error)
appServer.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500)
})

appServer.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000')
})
