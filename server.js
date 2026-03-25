const express = require('express')
const path = require('path')
const session = require('express-session')
const appServer = express()

// Sección: Configuración de Carpetas Estaticas
appServer.use(express.static(path.join(__dirname, 'public')))

// Sección: Configuración de Motor EJS
appServer.set('view engine', 'ejs')
appServer.set('views', 'views')

// Configuracion de POST & sesión
appServer.use(express.json()) // Para recibir JSON (si mandas fetch/axios)
appServer.use(express.urlencoded({ extended: true })) // Para recibir datos de formularios (el clásico POST de toda la vida)

appServer.use(session({
  secret: 'mi string secreto que debe ser un string aleatorio muy largo, no como éste',
  resave: false, // La sesión no se guardará en cada petición, sino sólo se guardará si algo cambió
  saveUninitialized: false // Asegura que no se guarde una sesión para una petición que no lo necesita
}))

// Middlewares Globales de enrutamiento, redirects & locals
appServer.use((req, res, next) => {
  // res.locals es lo que EJS lee por defecto
  res.locals.nombreUsuario = req.session.name || null
  next()
})
const bodyParser = require('body-parser')
appServer.use(bodyParser.urlencoded({ extended: false }))
appServer.use(bodyParser.json())

// Sección de Routers
const clienteRutes = require('./routes/cliente.routes.js')
const adminRutes = require('./routes/admin.routes.js')
const menuRutes = require('./routes/menu.routes.js')

appServer.use('/cliente', clienteRutes)
appServer.use('/admin', adminRutes)
appServer.use('/menu', menuRutes)

// ¡No debemos renderizar en Server!
appServer.get('/', (req, response) => {
  response.redirect('/menu/menu')
})

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
