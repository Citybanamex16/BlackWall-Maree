const db = require('../util/database.js')

module.exports = class Ingrediente {
  // Devuelve todos los ingredientes con sus categorías (lista en cats_raw separada por |)
  static async fetchAll () {
    return db.execute(`
      SELECT i.ID_Insumo, i.Nombre, i.\`Categoría\`, i.Precio, i.Activo, i.Imagen,
        IFNULL(
          GROUP_CONCAT(ic.Nom_Categoria ORDER BY ic.Nom_Categoria SEPARATOR '|'),
          i.\`Categoría\`
        ) AS cats_raw
      FROM insumo i
      LEFT JOIN insumo_categoria ic ON i.ID_Insumo = ic.ID_Insumo
      GROUP BY i.ID_Insumo, i.Nombre, i.\`Categoría\`, i.Precio, i.Activo, i.Imagen
    `)
  }

  static async fetchAllValid (connection) {
    return connection.execute('SELECT * FROM insumo WHERE Activo = 1')
  }


  // Devuelve solo los insumos activos que pertenecen a una categoría específica
  static async fetchAllValidPorCategoria (connection, categoria) {
    return connection.execute(
      `SELECT i.ID_Insumo, i.Nombre, i.\`Categoría\`, i.Precio, i.Activo, i.Imagen
       FROM insumo i
       JOIN insumo_categoria ic ON i.ID_Insumo = ic.ID_Insumo
       WHERE ic.Nom_Categoria = ? AND i.Activo = 1
       ORDER BY i.Nombre`,
      [categoria]
    )
  }



  // Busca ingrediente por nombre (para verificar duplicados)
  static async buscarPorNombre (nombre) {
    return db.execute('SELECT ID_Insumo FROM insumo WHERE Nombre = ?', [nombre])
  }

  // Verifica que los campos obligatorios no estén vacíos
  static verificarCamposVacios (datos) {
    const camposRequeridos = ['Nombre', 'Precio']
    for (const campo of camposRequeridos) {
      const valor = datos[campo]
      if (valor === null || valor === undefined || String(valor).trim() === '') {
        return { camposVacios: true, campoFaltante: campo }
      }
    }

    if (!datos.Categorias || !Array.isArray(datos.Categorias) || datos.Categorias.length === 0) {
      return { camposVacios: true, campoFaltante: 'Categoría' }
    }

    const precio = parseFloat(datos.Precio)
    if (isNaN(precio) || precio < 0) {
      return { camposVacios: true, campoFaltante: 'Precio (valor inválido)' }
    }

    return { camposVacios: false }
  }

  // Genera ID con prefijo IN
  static generarID () {
    const numero = Math.floor(Math.random() * 90_000_000 + 10_000_000)
    return `IN${numero}`
  }

  // Inserta el insumo base (Categoría = primera categoría seleccionada)
  static async insertNuevoIngrediente (id, nombre, categoria, precio, activo, tipo, imagen) {
    return db.execute(
      'INSERT INTO insumo (ID_Insumo, Nombre, `Categoría`, Precio, Activo, Imagen) VALUES (?, ?, ?, ?, ?, ?)',
      [id, nombre, categoria, precio, activo ? 1 : 0, imagen || null]
    )
  }

  // Inserta las categorías del insumo en la tabla junction
  static async insertCategoriasInsumo (idInsumo, categorias) {
    if (!categorias || categorias.length === 0) return
    const placeholders = categorias.map(() => '(?, ?)').join(', ')
    const values = categorias.flatMap(cat => [idInsumo, cat])
    return db.execute(
      `INSERT IGNORE INTO insumo_categoria (ID_Insumo, Nom_Categoria) VALUES ${placeholders}`,
      values
    )
  }

  // Elimina todas las categorías de un insumo (para reemplazarlas al actualizar)
  static async deleteCategoriasInsumo (idInsumo) {
    return db.execute('DELETE FROM insumo_categoria WHERE ID_Insumo = ?', [idInsumo])
  }

  // Obtiene las categorías disponibles
  static async getCategorias () {
    return db.execute('SELECT Nombre FROM categoría')
  }

  // Busca en cuáles productos aparece un ingrediente
  static async getProductosVinculados (idInsumo) {
    return db.execute(
      `SELECT p.Nombre FROM producto_tiene_insumo pti
      JOIN producto p ON pti.ID_Producto = p.ID_Producto
      WHERE pti.ID_Insumo = ?`,
      [idInsumo]
    )
  }

  // Elimina de insumo_categoria, producto_tiene_insumo y luego de insumo
  static async eliminarIngrediente (idInsumo) {
    return db.execute('CALL EliminarIngrediente(?)', [idInsumo])
  }

  // Actualiza los campos del insumo (Categoría = primera categoría seleccionada)
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

  // En tu archivo models/Insumo.js (o similar)

 static async verificarDisponibilidad(ids) {
  // Si no hay IDs, regresamos vacío
  if (!ids || ids.length === 0) return []

  try {
    const [rows] = await db.execute(
      `SELECT ID_Insumo FROM insumo 
       WHERE ID_Insumo IN (${ids.map(() => '?').join(',')}) 
       AND Activo = 1`,
      ids
    )

    // Regresamos solo los IDs disponibles
    return rows.map(row => row.ID_Insumo)

  } catch (error) {
    console.error('Error en verificarDisponibilidad de Insumos:', error)
    throw error
  }
 }
}



