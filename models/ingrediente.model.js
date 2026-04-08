const db = require('../util/database.js')

module.exports = class Ingrediente {
  // Consigue todods los ingredientes activos
  static async fetchAll () {
    return db.execute('SELECT ID_Insumo, Nombre, Categoría, Precio, Activo, Tipo FROM insumo')
  }

  // Busca ingrediente por nombre (para verificar duplicados)
  static async buscarPorNombre (nombre) {
    return db.execute('SELECT ID_Insumo FROM insumo WHERE Nombre = ?', [nombre])
  }

  // IMPORTANTE
  // Verifica que los campos obligatorios no estén vacíos
  static verificarCamposVacios (datos) {
    const camposRequeridos = ['Nombre', 'Categoría', 'Precio']
    for (const campo of camposRequeridos) {
      const valor = datos[campo]
      if (valor === null || valor === undefined || String(valor).trim() === '') {
        return { camposVacios: true, campoFaltante: campo }
      }
    }

    // Valida precio no negativo
    const precio = parseFloat(datos.Precio)
    if (isNaN(precio) || precio < 0) {
      return { camposVacios: true, campoFaltante: 'Precio (valor inválido)' }
    }

    return { camposVacios: false }
  }

  // Hace el  ID con inicio IN
  static generarID () {
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `IN${numero}`
  }

  // Inserta nuevo ingrediente en BD
  static async insertNuevoIngrediente (id, nombre, categoria, precio, activo, tipo, imagen) {
    return db.execute(
      'INSERT INTO insumo (ID_Insumo, Nombre, `Categoría`, Precio, Activo, Tipo, Imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, categoria, precio, activo ? 1 : 0, tipo || null, imagen || null]
    )
  }

  //  all categorías disponibles (desde tabla categoría)
  static async getCategorias () {
    return db.execute('SELECT Nombre FROM categoría')
  }

  // Busca en cuales productos aparece un ingrediente
  static async getProductosVinculados (idInsumo) {
    return db.execute(
      `SELECT p.Nombre FROM producto_tiene_insumo pti
      JOIN producto p ON pti.ID_Producto = p.ID_Producto
      WHERE pti.ID_Insumo = ?`,
      [idInsumo]
    )
  }

  // Elimina de producto_tiene_insumo y luego de insumo
  static async eliminarIngrediente (idInsumo) {
    return db.execute('CALL EliminarIngrediente(?)', [idInsumo])
  }

  static async actualizarIngrediente (id, nombre, categoria, precio, activo, tipo, imagen) {
    return db.execute(
      'CALL ActualizarIngrediente(?, ?, ?, ?, ?, ?, ?)',
      [id, nombre, categoria, precio, activo ? 1 : 0, tipo || null, imagen || null]
    )
  }
}
