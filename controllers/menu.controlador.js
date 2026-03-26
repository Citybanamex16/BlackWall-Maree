// Llamar al model
const nav = require('../models/breadcrumbs.model.js')
// const productos = require('../models/productos.model.js')

// ── DATOS DUMMY ── (reemplazar con BD cuando esté lista)
const platillosDummy = [
  { nombre: 'Build Your Own Crêpe', precio: 85, ingredientes: ['Untables a elegir', 'Fruta a elegir', 'Toppings a elegir'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Build Your Own Waffle', precio: 95, ingredientes: ['Untables a elegir', 'Fruta a elegir', 'Toppings a elegir'], base: 'Waffle', disponible: true },
  { nombre: 'Ferrero Rocher', precio: 145, ingredientes: ['Nutella', 'Fresa o plátano', 'Ferrero Rocher'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Kinder Delice', precio: 145, ingredientes: ['Nutella', 'Fresa o plátano', 'Kinder Delice'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Oreo', precio: 145, ingredientes: ['Nutella', 'Fresa o plátano', 'Galleta Oreo'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Snickers', precio: 145, ingredientes: ['Crema de cacahuate', 'Plátano', 'Snickers'], base: 'Crêpe dulce', disponible: true },
  { nombre: "M&M's", precio: 145, ingredientes: ['Nutella', 'Fresa o plátano', "M&M's"], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Mazapán', precio: 125, ingredientes: ['Cajeta', 'Fresa o plátano', 'Mazapán', 'Canela'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Bubulubu', precio: 145, ingredientes: ['Nutella', 'Mermelada de fresa', 'Fresas', 'Bubulubu'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Gansito', precio: 145, ingredientes: ['Nutella', 'Philadelphia', 'Fresa o plátano', 'Gansito'], base: 'Crêpe dulce', disponible: true },
  { nombre: "Reese's", precio: 145, ingredientes: ['Crema de cacahuate', 'Nutella', 'Fresa o plátano', "Reese's"], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Manzane', precio: 145, ingredientes: ['Cajeta', 'Manzana verde', 'Nuez', 'Nieve de vainilla'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'La Dolce Phila', precio: 105, ingredientes: ['Philadelphia', 'Mermelada de zarzamora o fresa', 'Nuez'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Honey Honey', precio: 120, ingredientes: ['Miel de maple', 'Fresa', 'Plátano', 'Almendras'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Chocoberries', precio: 135, ingredientes: ['Nutella', 'Philadelphia', 'Mix de berries'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Magnum', precio: 145, ingredientes: ['Nutella', 'Fresa o plátano', 'Paleta Magnum'], base: 'Crêpe dulce', disponible: true },
  { nombre: "Cookies N' Cream", precio: 145, ingredientes: ['Nutella', 'Fresa o plátano', "Cookies N' Cream"], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Rol de Canela', precio: 120, ingredientes: ['Azúcar', 'Canela', 'Frosting cremoso'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'La Pizzeria', precio: 145, ingredientes: ['Salsa de tomate', 'Tres quesos', 'Peperoni', 'Jamón'], base: 'Crêpe salada', disponible: true },
  { nombre: '4 Quesos', precio: 145, ingredientes: ['Philadelphia', 'Tres quesos', 'Jamón', 'Champiñones'], base: 'Crêpe salada', disponible: true },
  { nombre: 'La Española', precio: 145, ingredientes: ['Philadelphia', 'Tres quesos', 'Jamón serrano'], base: 'Crêpe salada', disponible: true },
  { nombre: 'Marée Crêpe', precio: 150, ingredientes: ['Aderezo de la casa', 'Tres quesos', 'Jamón', 'Salami'], base: 'Crêpe salada', disponible: true },
  { nombre: 'La Verde', precio: 145, ingredientes: ['Tres quesos', 'Espinacas', 'Champiñones', 'Jamón'], base: 'Crêpe salada', disponible: true },
  { nombre: 'La Champi', precio: 145, ingredientes: ['Philadelphia', 'Tres quesos', 'Champiñones'], base: 'Crêpe salada', disponible: true },
  { nombre: 'Rajas', precio: 150, ingredientes: ['Rajas de chile poblano', 'Elote', 'Cebolla', 'Tres quesos'], base: 'Crêpe salada', disponible: true },
  { nombre: 'Poblana', precio: 150, ingredientes: ['Pollo', 'Crema de chile poblano', 'Tres quesos'], base: 'Crêpe salada', disponible: true },
  { nombre: 'Rosendo Nieblas', precio: 165, ingredientes: ['Pesto', 'Mozzarella', 'Arugula', 'Jamón serrano', 'Parmesano', 'Pistache'], base: 'Crêpe salada', disponible: true },
  { nombre: 'Coco Almond', precio: 145, ingredientes: ['Crema Cinn-Almond', 'Almendra', 'Plátano', 'Coco tostado'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Cinn-Apple', precio: 145, ingredientes: ['Crema Cinn-Almond', 'Manzana', 'Nuez', 'Canela'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Cinn-Almond Crêpe', precio: 135, ingredientes: ['Crema Cinn-Almond', 'Almendra', 'Fresa o plátano'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'White Pistachio', precio: 150, ingredientes: ['Crema de pistache', 'Chocolate blanco', 'Fresa', 'Arándanos'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Dubai Chocolate Style', precio: 150, ingredientes: ['Kataifi', 'Crema de pistache', 'Nutella', 'Fresa'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Golden Bite', precio: 150, ingredientes: ['Crema de lotus', 'Fresa o plátano', 'Galleta lotus'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Berry Lotus', precio: 150, ingredientes: ['Crema de lotus', 'Philadelphia', 'Arándanos', 'Galleta lotus'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Lotus de Nuez', precio: 150, ingredientes: ['Crema de lotus', 'Nuez', 'Galleta lotus'], base: 'Crêpe dulce', disponible: true },
  { nombre: 'Espresso', precio: 35, ingredientes: ['Café espresso'], base: 'Bebida caliente', disponible: true },
  { nombre: 'Cappuccino / Latte', precio: 69, ingredientes: ['Café', 'Leche vaporizada', 'Saborizante a elegir'], base: 'Bebida caliente', disponible: true },
  { nombre: 'Dirty Chai', precio: 85, ingredientes: ['Té chai', 'Espresso', 'Leche'], base: 'Bebida caliente', disponible: true },
  { nombre: 'Chocolate Caliente', precio: 69, ingredientes: ['Chocolate', 'Leche'], base: 'Bebida caliente', disponible: true },
  { nombre: 'Iced Latte', precio: 75, ingredientes: ['Café', 'Leche fría', 'Hielo', 'Saborizante a elegir'], base: 'Bebida fría', disponible: true },
  { nombre: 'Iced Dirty Chai', precio: 85, ingredientes: ['Té chai', 'Espresso', 'Leche fría', 'Hielo'], base: 'Bebida fría', disponible: true },
  { nombre: 'Matcha Frío', precio: 75, ingredientes: ['Matcha', 'Leche fría', 'Hielo'], base: 'Bebida fría', disponible: true },
  { nombre: 'Iced Dirty Matcha', precio: 85, ingredientes: ['Matcha', 'Espresso', 'Leche fría', 'Hielo'], base: 'Bebida fría', disponible: true },
  { nombre: 'Frappuccino', precio: 90, ingredientes: ['Café', 'Leche', 'Hielo', 'Crema batida'], base: 'Frappe', disponible: true },
  { nombre: 'Dirty Chai Frappe', precio: 105, ingredientes: ['Té chai', 'Espresso', 'Hielo', 'Crema batida'], base: 'Frappe', disponible: true },
  { nombre: 'Chamoyada Mango', precio: 70, ingredientes: ['Mango', 'Chamoy', 'Chile en polvo', 'Hielo'], base: 'Frappe', disponible: true },
  { nombre: 'Matcha Frappe', precio: 95, ingredientes: ['Matcha', 'Leche', 'Hielo', 'Crema batida'], base: 'Frappe', disponible: true }
]

exports.getMenu = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Menu')
  response.render('cliente/menu', { breadcrumbs })
}

exports.getOrden = (request, response, next) => {
  const breadcrumbs = nav.getBreadcrumbs('Orden')
  response.render('cliente/order', { breadcrumbs })
}

exports.getPlatillo = (request, response, next) => {
  const nombre = request.query.nombre
  console.log('ENCONTROLLER — buscando:', nombre)

  // Cuando haya BD, borrar o comentar el dummy y descomentar esto:
  // productos.fetchOne(nombre).then(data => response.status(200).json(data))

  const platillo = platillosDummy.find(p => p.nombre === nombre)

  if (platillo) {
    response.status(200).json(platillo)
  } else {
    response.status(404).json({ disponible: false, mensaje: 'Platillo no encontrado' })
  }
}

exports.agregarItem = (request, response, next) => {
  const { nombre, precio, desc } = request.body
  console.log(`Item agregado: ${nombre} - $${precio}`)
  // Cuando haya BD/sesión, aquí se guarda
  response.status(200).json({ agregado: true, nombre, precio, desc })
}
