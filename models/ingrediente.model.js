const db = require('../util/database.js')

module.exports = class Ingrediente {
  // Consigue todods los ingredientes activos
  static async fetchAll () {
    return db.execute('SELECT ID_Insumo, Nombre, Categoría, Precio, Activo FROM insumo')
  }

  static async fetchAllValid (connection) {
    return connection.execute('SELECT * FROM insumo WHERE Activo = 1')
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
      'INSERT INTO insumo (ID_Insumo, Nombre, `Categoría`, Precio, Activo, Imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nombre, categoria, precio, activo ? 1 : 0, imagen || null]
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

  static async actualizarIngrediente (id, nombre, categoria, precio, activo, imagen) {
    return db.execute(
      'CALL ActualizarIngrediente(?, ?, ?, ?, ?, ?)',
      [id, nombre, categoria, precio, activo ? 1 : 0, imagen || null]
    )
  }

  static async getMetricas () {
    const [resumen] = await db.execute(`
    SELECT
      COUNT(*) AS total_insumos,
      SUM(Activo = 1) AS activos,
      SUM(Activo = 0) AS inactivos,
      SUM(CASE WHEN ID_Insumo NOT IN (SELECT ID_Insumo FROM producto_tiene_insumo) THEN 1 ELSE 0 END) AS sin_uso
    FROM insumo
  `)

    const [masUsados] = await db.execute(`
    SELECT i.Nombre AS ingrediente, COUNT(pti.ID_Producto) AS total_productos
    FROM insumo i
    JOIN producto_tiene_insumo pti ON i.ID_Insumo = pti.ID_Insumo
    GROUP BY i.ID_Insumo, i.Nombre
    ORDER BY total_productos DESC
    LIMIT 10
  `)

    const [porCategoria] = await db.execute(`
    SELECT \`Categoría\` AS categoria, COUNT(*) AS total
    FROM insumo
    GROUP BY \`Categoría\`
  `)

    const [afectados] = await db.execute(`
    SELECT p.Nombre AS producto, p.\`Categoría\` AS categoria,
      COUNT(i.ID_Insumo) AS insumos_inactivos,
      GROUP_CONCAT(i.Nombre SEPARATOR ', ') AS detalle_insumos
    FROM producto p
    JOIN producto_tiene_insumo pti ON p.ID_Producto = pti.ID_Producto
    JOIN insumo i ON pti.ID_Insumo = i.ID_Insumo
    WHERE i.Activo = 0
    GROUP BY p.ID_Producto, p.Nombre, p.\`Categoría\`
    ORDER BY insumos_inactivos DESC
  `)

    const [sinUso] = await db.execute(`
    SELECT i.Nombre AS ingrediente, i.\`Categoría\` AS categoria, i.Precio AS precio
    FROM insumo i
    LEFT JOIN producto_tiene_insumo pti ON i.ID_Insumo = pti.ID_Insumo
    WHERE pti.ID_Insumo IS NULL
    ORDER BY i.Nombre
  `)

    return { resumen, masUsados, porCategoria, afectados, sinUso }
  }
}
