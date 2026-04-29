/*
  Parche completo: crema batida por producto
  Objetivo:
  1. Garantizar la bandera histórica en `categoría` para compatibilidad.
  2. Garantizar el insumo especial `INCRMBT001` = "Crema batida".
  3. Agregar control individual por producto.
  4. Inicializar `producto.Permite_Crema_Batida` desde la categoría, solo si la columna es nueva.
  Nota:
  - Algunas bases tienen `insumo.Stock` y otras no. El parche detecta ambos casos.
*/

SET @categoria_col_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categoría'
    AND COLUMN_NAME = 'Permite_Crema_Batida'
);

SET @sql_categoria := IF(
  @categoria_col_existe = 0,
  'ALTER TABLE `categoría` ADD COLUMN `Permite_Crema_Batida` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Nombre`',
  'SELECT ''La columna categoría.Permite_Crema_Batida ya existe'' AS mensaje'
);
PREPARE stmt_categoria FROM @sql_categoria;
EXECUTE stmt_categoria;
DEALLOCATE PREPARE stmt_categoria;

SET @insumo_stock_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'insumo'
    AND COLUMN_NAME = 'Stock'
);

SET @sql_insumo := IF(
  @insumo_stock_existe > 0,
  'INSERT INTO `insumo` (`ID_Insumo`, `Nombre`, `Categoría`, `Precio`, `Activo`, `Stock`)
   SELECT ''INCRMBT001'', ''Crema batida'', ''Platillo'', 15.00, 1, ''15''
   WHERE NOT EXISTS (
     SELECT 1
     FROM `insumo`
     WHERE `ID_Insumo` = ''INCRMBT001''
        OR LOWER(TRIM(``Nombre``)) = ''crema batida''
   )',
  'INSERT INTO `insumo` (`ID_Insumo`, `Nombre`, `Categoría`, `Precio`, `Activo`)
   SELECT ''INCRMBT001'', ''Crema batida'', ''Platillo'', 15.00, 1
   WHERE NOT EXISTS (
     SELECT 1
     FROM `insumo`
     WHERE `ID_Insumo` = ''INCRMBT001''
        OR LOWER(TRIM(``Nombre``)) = ''crema batida''
   )'
);
PREPARE stmt_insumo FROM @sql_insumo;
EXECUTE stmt_insumo;
DEALLOCATE PREPARE stmt_insumo;

SET @producto_col_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'producto'
    AND COLUMN_NAME = 'Permite_Crema_Batida'
);

SET @sql_producto := IF(
  @producto_col_existe = 0,
  'ALTER TABLE `producto` ADD COLUMN `Permite_Crema_Batida` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Imagen`',
  'SELECT ''La columna producto.Permite_Crema_Batida ya existe'' AS mensaje'
);
PREPARE stmt_producto FROM @sql_producto;
EXECUTE stmt_producto;
DEALLOCATE PREPARE stmt_producto;

SET @sql_inicializacion := IF(
  @producto_col_existe = 0 AND @categoria_col_existe >= 0,
  'UPDATE `producto` p LEFT JOIN `categoría` c ON c.Nombre = p.`Categoría` SET p.`Permite_Crema_Batida` = COALESCE(c.`Permite_Crema_Batida`, 0)',
  'SELECT ''La inicialización de producto.Permite_Crema_Batida no fue necesaria'' AS mensaje'
);
PREPARE stmt_inicializacion FROM @sql_inicializacion;
EXECUTE stmt_inicializacion;
DEALLOCATE PREPARE stmt_inicializacion;
