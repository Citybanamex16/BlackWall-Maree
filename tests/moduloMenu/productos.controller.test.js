/* global jest, describe, test, expect, beforeEach */

jest.mock('../../util/database.js', () => ({
  getConnection: jest.fn().mockResolvedValue({
    beginTransaction: jest.fn(),
    commit: jest.fn(),
    release: jest.fn(),
    execute: jest.fn()
  })
}))

jest.mock('../../models/MenuDigital/productos.model.js')

const productosController = require('../../controllers/menu.controlador.js')
const productosModel = require('../../models/MenuDigital/productos.model.js')

describe('Pruebas de Registro de Producto Nuevo', () => {
  let req, res

  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    req = { body: {} }
    res = {
      status: jest.fn().mockReturnThis(), // Permite encadenar .status().json()
      json: jest.fn()
    }
  })

  // ESCENARIO 1: Happy Path
  // ESCENARIO 1: Happy Path
  test('1. Happy Path: Registro exitoso', async () => {
    // 1. Preparamos el "Doble de Acción" del Frontend
    req.body = {
      Nombre: 'Crepa Mareé',
      Precio: 145,
      Disponible: true,
      permiteCremaBatida: false,
      Imagen: 'URL-de-imagen',
      tipo: 'Artesanal',
      categoría: 'Platillo',
      ingredientesID: []
    }

    // 2. Simulamos que el modelo responde éxito (mockResolvedValue)
    // MySQL suele devolver un array donde la primera posición tiene el insertId
    productosModel.ValidarDatosRegistro.mockReturnValue({ valido: true, mensaje: '' })
    productosModel.generarID.mockReturnValue('PD12345678')
    productosModel.insertNewProduct.mockResolvedValue({ affectedRows: 1, insertId: 100 })

    // 3. Ejecutamos la función del controlador
    await productosController.postNewProduct(req, res)

    expect(productosModel.insertNewProduct).toHaveBeenCalledWith(
      expect.anything(), // connection
      expect.stringMatching(/^PD/), // Cambié PROD por PD porque así lo pusiste en el body
      'Crepa Mareé', // Nombre
      expect.any(String), // Categoría
      145, // Precio (puedes poner el valor exacto)
      true, // Disponible
      expect.any(String), // Imagen
      expect.any(String), // Tipo
      0 // Permite crema batida
    )

    // 4. VERIFICACIONES (Assertions)
    // A. ¿Mandó el status 200?
    expect(res.status).toHaveBeenCalledWith(200)

    // B. ¿La respuesta JSON dice que todo salió bien?
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      message: expect.any(String) // Verificamos que mande algún mensaje de texto
    }))

    // C. VERIFICACIÓN PRO: ¿El controlador llamó al modelo con los datos correctos?
    // Esto asegura que el controlador no "perdió" datos en el camino.
    expect(productosModel.insertNewProduct).toHaveBeenCalled()
  })
})
