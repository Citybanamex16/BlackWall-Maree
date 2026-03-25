// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
// const productos = require('../models/productos.model.js')

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs })
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs })
}

exports.getPlatillo = (request, response, next) => {
  console.log('ENCONTROLLER')
  // DESCOMENTAR EL DE ABAJO CUANDO ESTE LA BASE DE DATOS
  // productos.fetchOne(request.body)
  response.status(200).json({ message: 'Respuesta asíncrona' })
}

exports.getProducts = (req, res, next) => {
  res.render('admin/products')
}

// Dummys
const dummyTypes = [
  { id: 1, nombre: 'Platillo' },
  { id: 2, nombre: 'Bebida' }
]

exports.getModalForms = (req, res, next) => {
  // 1. Debemos de consultar los tipos de
  // const productTypes = productos.getAllProductTypes().then().catch()
  console.log('Controlador obteniendo tipos de Productos')
  // Enviamos Datos JSON a Front
  res.status(200).json({
    succes: true,
    message: 'Tipos recuperados',
    data: dummyTypes //matriz [{},{}]
  })
}

const dummyFields = [
  { "nombre": "ID_Producto", "type": "int" },
  { "nombre": "Nombre", "type": "string" },
  { "nombre": "Precio", "type": "float" },
  { "nombre": "Disponible", "type": "boolean" },
  { "nombre": "Tipo", "type": "string" },
  { "nombre": "Tamaño", "type": "string" },
  { "nombre": "Imagen", "type": "string" }
]

const ingredientesDummy = [
  { id: 1, nombre: 'Nutella', categoria: 'Dulce', precio: 15.50 },
  { id: 2, nombre: 'Queso Crema', categoria: 'Salado', precio: 12.00 },
  { id: 3, nombre: 'Fresa fresca', categoria: 'Dulce', precio: 10.00 },
  { id: 4, nombre: 'Jamón de Pavo', categoria: 'Salado', precio: 14.00 },
  { id: 5, nombre: 'Cajeta', categoria: 'Dulce', precio: 11.50 },
  { id: 6, nombre: 'Champiñones', categoria: 'Salado', precio: 13.00 }
];




exports.getProductRegisterForms = (req,res,next) =>{
  /*
  try{

  }
  */
  const typeId = req.query.id
  console.log("Tipo de producto seleccionado fue: ", typeId)
//1. Consultar Campos de Tabla
//const ProductFields = async productos.getProductFields()
  const ProductFields = dummyFields

//2. Consultar Ingredientes existentes
  //const AllIngredientes = async productos.getAllIngredientes()
  const AllIngredientes = ingredientesDummy
  res.status(200).json({
    succes: true,
    message: 'Campos e Ingredientes recuperados',
    data: {'Fields':ProductFields,'Ingredientes':AllIngredientes}
  })
  /*
  catch{

  }
  */
}




