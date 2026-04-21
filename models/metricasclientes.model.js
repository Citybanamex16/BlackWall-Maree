const db = require('../util/database.js')

module.exports = class MetricasClientes {
  static construirFiltrosCliente (filtros = {}) {
    const condicionesCliente = []
    const paramsCliente = []

    if (filtros.genero && filtros.genero !== '') {
      condicionesCliente.push('c.Genero = ?')
      paramsCliente.push(filtros.genero)
    }

    if (filtros.royalty && filtros.royalty !== '') {
      condicionesCliente.push('c.Nombre_Royalty = ?')
      paramsCliente.push(filtros.royalty)
    }

    const whereCliente = condicionesCliente.length > 0
      ? ` AND ${condicionesCliente.join(' AND ')}`
      : ''

    return {
      whereCliente,
      paramsCliente
    }
  }

  static construirRangoFechas (filtros = {}) {
    const fechaInicio = filtros.fechaInicio || '2000-01-01'
    const fechaFin = filtros.fechaFin || '2099-12-31'

    return { fechaInicio, fechaFin }
  }

  static async getDashboardData (filtros = {}) {
    const { fechaInicio, fechaFin } = this.construirRangoFechas(filtros)
    const { whereCliente, paramsCliente } = this.construirFiltrosCliente(filtros)

    const resumenQuery = `
      SELECT
        COUNT(DISTINCT CASE
          WHEN consumo.total_ordenes > 0 THEN c.Numero_Telefonico
        END) AS clientes_activos,
        COUNT(DISTINCT CASE
          WHEN primeras_compras.primera_compra BETWEEN ? AND ? THEN c.Numero_Telefonico
        END) AS clientes_nuevos_aprox,
        ROUND(COALESCE(AVG(consumo.total_ordenes), 0), 2) AS frecuencia_promedio,
        ROUND(COALESCE(AVG(consumo.total_gastado), 0), 2) AS ticket_promedio,
        COUNT(DISTINCT CASE
          WHEN promos_cliente.usos_promocion > 0 THEN c.Numero_Telefonico
        END) AS clientes_con_promocion
      FROM cliente c
      LEFT JOIN (
        SELECT
          o.Numero_Telefonico,
          COUNT(DISTINCT o.ID_Orden) AS total_ordenes,
          ROUND(COALESCE(SUM(otp.Cantidad * otp.Precio_Venta), 0), 2) AS total_gastado
        FROM orden o
        LEFT JOIN orden_tiene_producto otp
          ON otp.ID_Orden = o.ID_Orden
        WHERE DATE(o.Fecha) BETWEEN ? AND ?
        GROUP BY o.Numero_Telefonico
      ) consumo
        ON consumo.Numero_Telefonico = c.Numero_Telefonico
      LEFT JOIN (
        SELECT
          Numero_Telefonico,
          MIN(DATE(Fecha)) AS primera_compra
        FROM orden
        GROUP BY Numero_Telefonico
      ) primeras_compras
        ON primeras_compras.Numero_Telefonico = c.Numero_Telefonico
      LEFT JOIN (
        SELECT
          cp.Numero_Telefonico,
          COUNT(*) AS usos_promocion
        FROM cliente_canjea_promociones cp
        WHERE cp.FECHA BETWEEN ? AND ?
        GROUP BY cp.Numero_Telefonico
      ) promos_cliente
        ON promos_cliente.Numero_Telefonico = c.Numero_Telefonico
      WHERE 1 = 1
      ${whereCliente}
    `

    const topClientesQuery = `
      SELECT
        c.Nombre AS nombre,
        c.Numero_Telefonico AS telefono,
        c.Genero AS genero,
        c.Nombre_Royalty AS royalty,
        COUNT(DISTINCT o.ID_Orden) AS total_ordenes,
        COALESCE(SUM(otp.Cantidad), 0) AS productos_comprados,
        ROUND(COALESCE(SUM(otp.Cantidad * otp.Precio_Venta), 0), 2) AS total_gastado,
        MAX(DATE(o.Fecha)) AS ultima_compra
      FROM cliente c
      LEFT JOIN orden o
        ON o.Numero_Telefonico = c.Numero_Telefonico
        AND DATE(o.Fecha) BETWEEN ? AND ?
      LEFT JOIN orden_tiene_producto otp
        ON otp.ID_Orden = o.ID_Orden
      WHERE 1 = 1
      ${whereCliente}
      GROUP BY
        c.Numero_Telefonico,
        c.Nombre,
        c.Genero,
        c.Nombre_Royalty
      HAVING total_ordenes > 0
      ORDER BY total_gastado DESC, total_ordenes DESC
      LIMIT 10
    `

    const promocionesQuery = `
      SELECT
        p.Nombre AS promocion,
        COUNT(*) AS usos,
        COUNT(DISTINCT cp.Numero_Telefonico) AS clientes_distintos,
        SUM(CASE WHEN cp.Canjeado = 1 THEN 1 ELSE 0 END) AS promociones_canjeadas
      FROM cliente_canjea_promociones cp
      INNER JOIN promocion p
        ON p.ID_Promocion = cp.ID_Promocion
      INNER JOIN cliente c
        ON c.Numero_Telefonico = cp.Numero_Telefonico
      WHERE cp.FECHA BETWEEN ? AND ?
      ${whereCliente.replaceAll('c.', 'c.')}
      GROUP BY p.ID_Promocion, p.Nombre
      ORDER BY usos DESC, clientes_distintos DESC
      LIMIT 10
    `

    const generoQuery = `
      SELECT
        COALESCE(c.Genero, 'No definido') AS genero,
        COUNT(DISTINCT c.Numero_Telefonico) AS clientes,
        COUNT(DISTINCT o.ID_Orden) AS ordenes
      FROM cliente c
      LEFT JOIN orden o
        ON o.Numero_Telefonico = c.Numero_Telefonico
        AND DATE(o.Fecha) BETWEEN ? AND ?
      WHERE 1 = 1
      ${whereCliente}
      GROUP BY COALESCE(c.Genero, 'No definido')
      ORDER BY clientes DESC
    `

    const graficasQuery = `
      WITH PrimerasCompras AS (
          SELECT Numero_Telefonico, MIN(DATE(Fecha)) as fecha_primera_compra
          FROM orden
          GROUP BY Numero_Telefonico
      )
      SELECT 
          DATE_FORMAT(o.Fecha, '%Y-%m') AS mes,
          COUNT(DISTINCT c.Numero_Telefonico) AS total_clientes,
          COUNT(DISTINCT CASE WHEN DATE_FORMAT(pc.fecha_primera_compra, '%Y-%m') = DATE_FORMAT(o.Fecha, '%Y-%m') THEN o.Numero_Telefonico END) AS clientes_nuevos,
          COUNT(DISTINCT CASE WHEN DATE_FORMAT(pc.fecha_primera_compra, '%Y-%m') < DATE_FORMAT(o.Fecha, '%Y-%m') THEN o.Numero_Telefonico END) AS clientes_recurrentes
      FROM orden o
      JOIN cliente c ON o.Numero_Telefonico = c.Numero_Telefonico
      LEFT JOIN PrimerasCompras pc ON c.Numero_Telefonico = pc.Numero_Telefonico
      WHERE DATE(o.Fecha) BETWEEN ? AND ?
      ${whereCliente}
      GROUP BY mes
      ORDER BY mes ASC;
    `

    const [resumenRows] = await db.execute(resumenQuery, [
      fechaInicio,
      fechaFin,
      fechaInicio,
      fechaFin,
      fechaInicio,
      fechaFin,
      ...paramsCliente
    ])

    const [topClientesRows] = await db.execute(topClientesQuery, [
      fechaInicio,
      fechaFin,
      ...paramsCliente
    ])

    const [promocionesRows] = await db.execute(promocionesQuery, [
      fechaInicio,
      fechaFin,
      ...paramsCliente
    ])

    const [generoRows] = await db.execute(generoQuery, [
      fechaInicio,
      fechaFin,
      ...paramsCliente
    ])

    const [graficasRows] = await db.execute(graficasQuery, [
      fechaInicio,
      fechaFin,
      ...paramsCliente
    ])

    return {
      resumen: resumenRows[0] || {
        clientes_activos: 0,
        clientes_nuevos_aprox: 0,
        frecuencia_promedio: 0,
        ticket_promedio: 0,
        clientes_con_promocion: 0
      },
      topClientes: topClientesRows || [],
      promociones: promocionesRows || [],
      genero: generoRows || [],
      graficas: graficasRows || []
    }
  }

  static async getCsvData (filtros = {}) {
    const { fechaInicio, fechaFin } = this.construirRangoFechas(filtros)
    const { whereCliente, paramsCliente } = this.construirFiltrosCliente(filtros)

    const query = `
      SELECT
        c.Nombre AS nombre,
        c.Numero_Telefonico AS telefono,
        c.Genero AS genero,
        c.Nombre_Royalty AS royalty,
        COUNT(DISTINCT o.ID_Orden) AS total_ordenes,
        COALESCE(SUM(otp.Cantidad), 0) AS productos_comprados,
        ROUND(COALESCE(SUM(otp.Cantidad * otp.Precio_Venta), 0), 2) AS total_gastado,
        MAX(DATE(o.Fecha)) AS ultima_compra
      FROM cliente c
      LEFT JOIN orden o
        ON o.Numero_Telefonico = c.Numero_Telefonico
        AND DATE(o.Fecha) BETWEEN ? AND ?
      LEFT JOIN orden_tiene_producto otp
        ON otp.ID_Orden = o.ID_Orden
      WHERE 1 = 1
      ${whereCliente}
      GROUP BY
        c.Numero_Telefonico,
        c.Nombre,
        c.Genero,
        c.Nombre_Royalty
      HAVING total_ordenes > 0
      ORDER BY total_gastado DESC, total_ordenes DESC
    `

    const [rows] = await db.execute(query, [
      fechaInicio,
      fechaFin,
      ...paramsCliente
    ])

    return rows
  }

  static async getFlujoClientesMensuales () {
    const query = `
          SELECT 
              DATE_FORMAT(Fecha, '%M %Y') AS mes,
              COUNT(DISTINCT Numero_Telefonico) AS total_clientes
          FROM orden
          WHERE Estado_Orden = 'Entregado'
          GROUP BY YEAR(fecha), MONTH(fecha)
          ORDER BY YEAR(fecha) ASC, MONTH(fecha) ASC
          LIMIT 12;
      `
    return db.execute(query)
  }
}
