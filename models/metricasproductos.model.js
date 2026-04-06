const db = require('../util/database.js')

module.exports = class MetricasProductos {
  static construirFiltrosProducto (filtros = {}) {
    const condiciones = []
    const params = []

    if (filtros.categoria && filtros.categoria !== '') {
      condiciones.push('p.`Categoría` = ?')
      params.push(filtros.categoria)
    }

    if (filtros.tipo && filtros.tipo !== '') {
      condiciones.push('p.Tipo = ?')
      params.push(filtros.tipo)
    }

    const whereProducto = condiciones.length > 0
      ? ` AND ${condiciones.join(' AND ')}`
      : ''

    return {
      whereProducto,
      paramsProducto: params
    }
  }

  static construirRangoFechas (filtros = {}) {
    const fechaInicio = filtros.fechaInicio || '2000-01-01'
    const fechaFin = filtros.fechaFin || '2099-12-31'
    return { fechaInicio, fechaFin }
  }

  static async getDashboardData (filtros = {}) {
    const { fechaInicio, fechaFin } = this.construirRangoFechas(filtros)
    const { whereProducto, paramsProducto } = this.construirFiltrosProducto(filtros)

    const resumenQuery = `
      SELECT
        COUNT(DISTINCT otp.ID_Producto) AS productos_vendidos,
        COALESCE(SUM(otp.Cantidad), 0) AS unidades_vendidas,
        ROUND(COALESCE(SUM(otp.Precio_Venta), 0), 2) AS ingresos_totales,
        COUNT(DISTINCT pti.ID_Insumo) AS ingredientes_utilizados,
        COUNT(DISTINCT CASE WHEN i.Activo = 0 THEN p.ID_Producto END) AS productos_afectados
      FROM orden_tiene_producto otp
      INNER JOIN producto p
        ON p.ID_Producto = otp.ID_Producto
      INNER JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      LEFT JOIN producto_tiene_insumo pti
        ON pti.ID_Producto = p.ID_Producto
      LEFT JOIN insumo i
        ON i.ID_Insumo = pti.ID_Insumo
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereProducto}
    `

    const topProductosCantidadQuery = `
      SELECT
        p.ID_Producto AS id_producto,
        p.Nombre AS producto,
        p.\`Categoría\` AS categoria,
        p.Tipo AS tipo,
        COALESCE(SUM(otp.Cantidad), 0) AS total_vendido,
        ROUND(COALESCE(SUM(otp.Precio_Venta), 0), 2) AS ingresos
      FROM orden_tiene_producto otp
      INNER JOIN producto p
        ON p.ID_Producto = otp.ID_Producto
      INNER JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereProducto}
      GROUP BY p.ID_Producto, p.Nombre, p.\`Categoría\`, p.Tipo
      ORDER BY total_vendido DESC, ingresos DESC
      LIMIT 10
    `

    const topProductosIngresosQuery = `
      SELECT
        p.ID_Producto AS id_producto,
        p.Nombre AS producto,
        p.\`Categoría\` AS categoria,
        p.Tipo AS tipo,
        COALESCE(SUM(otp.Cantidad), 0) AS total_vendido,
        ROUND(COALESCE(SUM(otp.Precio_Venta), 0), 2) AS ingresos
      FROM orden_tiene_producto otp
      INNER JOIN producto p
        ON p.ID_Producto = otp.ID_Producto
      INNER JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereProducto}
      GROUP BY p.ID_Producto, p.Nombre, p.\`Categoría\`, p.Tipo
      ORDER BY ingresos DESC, total_vendido DESC
      LIMIT 10
    `

    const categoriaIngresosQuery = `
      SELECT
        p.\`Categoría\` AS categoria,
        COALESCE(SUM(otp.Cantidad), 0) AS unidades,
        ROUND(COALESCE(SUM(otp.Precio_Venta), 0), 2) AS ingresos
      FROM orden_tiene_producto otp
      INNER JOIN producto p
        ON p.ID_Producto = otp.ID_Producto
      INNER JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereProducto}
      GROUP BY p.\`Categoría\`
      ORDER BY ingresos DESC, unidades DESC
    `

    const ingredientesPopularesQuery = `
      SELECT
        i.ID_Insumo AS id_insumo,
        i.Nombre AS ingrediente,
        i.Activo AS activo,
        COUNT(DISTINCT p.ID_Producto) AS recetas_distintas,
        COALESCE(SUM(otp.Cantidad), 0) AS uso_en_pedidos
      FROM producto_tiene_insumo pti
      INNER JOIN insumo i
        ON i.ID_Insumo = pti.ID_Insumo
      INNER JOIN producto p
        ON p.ID_Producto = pti.ID_Producto
      LEFT JOIN orden_tiene_producto otp
        ON otp.ID_Producto = p.ID_Producto
      LEFT JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      WHERE (
        o.ID_Orden IS NULL
        OR DATE(o.Fecha) BETWEEN ? AND ?
      )
      ${whereProducto}
      GROUP BY i.ID_Insumo, i.Nombre, i.Activo
      ORDER BY uso_en_pedidos DESC, recetas_distintas DESC, i.Nombre ASC
      LIMIT 10
    `

    const disponibilidadQuery = `
      SELECT
        SUM(CASE WHEN i.Activo = 1 THEN 1 ELSE 0 END) AS ingredientes_activos,
        SUM(CASE WHEN i.Activo = 0 THEN 1 ELSE 0 END) AS ingredientes_inactivos
      FROM insumo i
    `

    const productosAfectadosQuery = `
      SELECT
        p.Nombre AS producto,
        p.\`Categoría\` AS categoria,
        COUNT(DISTINCT i.ID_Insumo) AS insumos_inactivos,
        GROUP_CONCAT(DISTINCT i.Nombre ORDER BY i.Nombre SEPARATOR ', ') AS detalle_insumos
      FROM producto p
      INNER JOIN producto_tiene_insumo pti
        ON pti.ID_Producto = p.ID_Producto
      INNER JOIN insumo i
        ON i.ID_Insumo = pti.ID_Insumo
      WHERE i.Activo = 0
      ${whereProducto}
      GROUP BY p.ID_Producto, p.Nombre, p.\`Categoría\`
      ORDER BY insumos_inactivos DESC, p.Nombre ASC
      LIMIT 10
    `

    const tendenciaQuery = `
      SELECT
        DATE_FORMAT(o.Fecha, '%Y-%m') AS periodo,
        COALESCE(SUM(otp.Cantidad), 0) AS unidades,
        ROUND(COALESCE(SUM(otp.Precio_Venta), 0), 2) AS ingresos
      FROM orden_tiene_producto otp
      INNER JOIN producto p
        ON p.ID_Producto = otp.ID_Producto
      INNER JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereProducto}
      GROUP BY DATE_FORMAT(o.Fecha, '%Y-%m')
      ORDER BY periodo ASC
    `

    const [resumenRows] = await db.execute(resumenQuery, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    const [topProductosCantidadRows] = await db.execute(topProductosCantidadQuery, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    const [topProductosIngresosRows] = await db.execute(topProductosIngresosQuery, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    const [categoriaIngresosRows] = await db.execute(categoriaIngresosQuery, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    const [ingredientesPopularesRows] = await db.execute(ingredientesPopularesQuery, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    const [disponibilidadRows] = await db.execute(disponibilidadQuery)

    const [productosAfectadosRows] = await db.execute(productosAfectadosQuery, [
      ...paramsProducto
    ])

    const [tendenciaRows] = await db.execute(tendenciaQuery, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    return {
      resumen: resumenRows[0] || {
        productos_vendidos: 0,
        unidades_vendidas: 0,
        ingresos_totales: 0,
        ingredientes_utilizados: 0,
        productos_afectados: 0
      },
      topProductosCantidad: topProductosCantidadRows || [],
      topProductosIngresos: topProductosIngresosRows || [],
      categoriaIngresos: categoriaIngresosRows || [],
      ingredientesPopulares: ingredientesPopularesRows || [],
      disponibilidad: disponibilidadRows[0] || {
        ingredientes_activos: 0,
        ingredientes_inactivos: 0
      },
      productosAfectados: productosAfectadosRows || [],
      tendencia: tendenciaRows || []
    }
  }

  static async getCsvData (filtros = {}) {
    const { fechaInicio, fechaFin } = this.construirRangoFechas(filtros)
    const { whereProducto, paramsProducto } = this.construirFiltrosProducto(filtros)

    const query = `
      SELECT
        p.Nombre AS producto,
        p.\`Categoría\` AS categoria,
        p.Tipo AS tipo,
        COALESCE(SUM(otp.Cantidad), 0) AS total_vendido,
        ROUND(COALESCE(SUM(otp.Precio_Venta), 0), 2) AS ingresos
      FROM orden_tiene_producto otp
      INNER JOIN producto p
        ON p.ID_Producto = otp.ID_Producto
      INNER JOIN orden o
        ON o.ID_Orden = otp.ID_Orden
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereProducto}
      GROUP BY p.ID_Producto, p.Nombre, p.\`Categoría\`, p.Tipo
      ORDER BY ingresos DESC, total_vendido DESC
    `

    const [rows] = await db.execute(query, [
      fechaInicio,
      fechaFin,
      ...paramsProducto
    ])

    return rows
  }
}
