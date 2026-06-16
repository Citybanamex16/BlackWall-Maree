/*
  Parche consolidado para compartir cambios de BD antes de merge a dev.

  Incluye:
  1. Nueva bandera por categoria para permitir crema batida en menu.
  2. Activacion inicial para Bebidas, Crepas y Waffles.
  3. Alta del insumo "Crema batida" para cobrar el extra.

  Nota:
  - La metrica de "promociones mas usadas" no requiere cambios de esquema.
  - Esa vista reutiliza la tabla existente `cliente_canjea_promociones`.
*/

SET @existe_columna := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categoría'
    AND COLUMN_NAME = 'Permite_Crema_Batida'
);

SET @sql_columna := IF(
  @existe_columna = 0,
  'ALTER TABLE `categoría` ADD COLUMN `Permite_Crema_Batida` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Nombre`',
  'SELECT ''La columna Permite_Crema_Batida ya existe'' AS mensaje'
);

PREPARE stmt_columna FROM @sql_columna;
EXECUTE stmt_columna;
DEALLOCATE PREPARE stmt_columna;

UPDATE `categoría`
SET `Permite_Crema_Batida` = 1
WHERE `Nombre` IN ('Bebidas', 'Crepas', 'Waffles');

INSERT INTO `insumo` (`ID_Insumo`, `Nombre`, `Categoría`, `Precio`, `Activo`, `Imagen`)
SELECT 'INCRMBT001', 'Crema batida', 'Platillo', 15.00, 1, '15'
WHERE NOT EXISTS (
  SELECT 1
  FROM `insumo`
  WHERE `ID_Insumo` = 'INCRMBT001'
     OR LOWER(TRIM(`Nombre`)) = 'crema batida'
);

SELECT `Nombre`, `Permite_Crema_Batida`
FROM `categoría`
WHERE `Nombre` IN ('Bebidas', 'Crepas', 'Waffles')
ORDER BY `Nombre`;

SELECT `ID_Insumo`, `Nombre`, `Precio`, `Activo`
FROM `insumo`
WHERE `ID_Insumo` = 'INCRMBT001';
