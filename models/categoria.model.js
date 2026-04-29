const db = require('../util/database.js')

module.exports = class Categoria {
  static async fetchAll () {
    return db.execute(`
      SELECT
        Nombre,
        Permite_Crema_Batida AS permiteCremaBatida,
        Visible_Menu AS visibleMenu
      FROM \`categoría\`
      ORDER BY Nombre ASC
    `)
  }

  static async buscarPorNombre (nombre) {
    return db.execute(`
      SELECT
        Nombre,
        Permite_Crema_Batida AS permiteCremaBatida
      FROM \`categoría\`
      WHERE Nombre = ?
    `, [nombre])
  }

  static async insertNuevaCategoria (nombre, permiteCremaBatida) {
    return db.execute(
      'INSERT INTO `categoría` (Nombre, Permite_Crema_Batida) VALUES (?, ?)',
      [nombre, permiteCremaBatida]
    )
  }

  static async buscarEnUso (nombre) {
    const [insumos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `insumo` WHERE `Categoría` = ?', [nombre]
    )
    const [productos] = await db.execute(
      'SELECT COUNT(*) AS total FROM `producto` WHERE `Categoría` = ?', [nombre]
    )
    return {
      totalInsumos: insumos[0].total,
      totalProductos: productos[0].total
    }
  }

  static async actualizarCategoria (oldNombre, newNombre) {
    return db.execute('CALL ActualizarCategoria(?, ?)', [oldNombre, newNombre])
  }

  static async actualizarPermiteCremaBatida (nombre, permiteCremaBatida) {
    return db.execute(
      'UPDATE `categoría` SET Permite_Crema_Batida = ? WHERE Nombre = ?',
      [permiteCremaBatida, nombre]
    )
  }

  static async eliminarCategoria (nombre) {
    return db.execute('DELETE FROM `categoría` WHERE Nombre = ?', [nombre])
  }
}
