const express = require('express')
const path = require('path')
const session = require('express-session')
const appServer = express()

// Apple Wallet
appServer.get('/passes/:filename', (req, res) => {
  console.log('Sirviendo pass:', req.params.filename)
  const filePath = path.join(__dirname, 'passes', req.params.filename)
  res.setHeader('Content-Type', 'application/vnd.apple.pkpass')
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`)
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('Error enviando pass:', err)
      res.status(404).send('Pass no encontrado')
    }
  })
})

// Sección: Configuración de Carpetas Estaticas
appServer.use(express.static(path.join(__dirname, 'public')))

// Sección: Configuración de Motor EJS
appServer.set('view engine', 'ejs')
appServer.set('views', 'views')

// Configuracion de POST & sesión
appServer.use(express.json()) // Para recibir JSON (si mandamos fetch)
appServer.use(express.urlencoded({ extended: true })) // Para recibir datos de formularios (el clásico POST de toda la vida)

appServer.use(session({
  secret: 'mi string secreto que debe ser un string aleatorio muy largo, no como éste',
  resave: false, // La sesión no se guardará en cada petición, sino sólo se guardará si algo cambió
  saveUninitialized: false // Asegura que no se guarde una sesión para una petición que no lo necesita
}))

// ESTO Hace que no salga /Ruta fallida por cada foto, no lo borren porfa
appServer.use('/img/placeholder.webp', (req, res) => {
  res.redirect('https://placehold.co/400x300/fdf8f2/b5956a?text=Marée')
})

// Middlewares Globales de enrutamiento, redirects & locals
appServer.use((req, res, next) => {
  // res.locals es lo que EJS lee por defecto
  res.locals.nombreUsuario = req.session.user?.nombre || req.session.cliente?.nombre || req.session.name || null
  res.locals.rolUsuario = req.session.user?.rol || req.session.rol || null
  next()
})
const bodyParser = require('body-parser')
appServer.use(bodyParser.urlencoded({ extended: false }))
appServer.use(bodyParser.json())

// Sección de Routers
const clienteRutes = require('./routes/cliente.routes.js')
const adminRutes = require('./routes/admin.routes.js')
const colaboradorRoutes = require('./routes/colaborador.routes.js')
const menuRutes = require('./routes/menu.routes.js')
const rutasEventosPromos = require('./routes/promo_eventos.routes.js')
const rutasRoyalty = require('./routes/royalty.routes.js')

// Prefijos De Routes
appServer.use('/cliente', clienteRutes) // Modulos a Quitar
appServer.use('/admin', adminRutes) // Modulos a quitar
appServer.use('/colaborador', colaboradorRoutes)
appServer.use('/menu', menuRutes) // Modulo de Menu Digital
appServer.use('/promos', rutasEventosPromos)
appServer.use('/royalty', rutasRoyalty)
// Promociones -> /admin

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

appServer.listen(3005, () => {
  console.log('Servidor activo en http://localhost:3005')
})
