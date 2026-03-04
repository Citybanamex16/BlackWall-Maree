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

appServer.listen(3000, () => {
  console.log('Servidor activo en http://localhost:3000')
})