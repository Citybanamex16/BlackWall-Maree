/*
  Parche: visibilidad de categorías en menú
  Objetivo:
  1. Agregar `categoría.Visible_Menu` en bases locales que todavía no la tienen.
  2. Ocultar `CrepaPerso` del menú público sin afectar el resto de categorías.
*/

SET @categoria_crema_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categoría'
    AND COLUMN_NAME = 'Permite_Crema_Batida'
);

SET @categoria_visible_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categoría'
    AND COLUMN_NAME = 'Visible_Menu'
);

SET @sql_categoria_visible := IF(
  @categoria_visible_existe = 0 AND @categoria_crema_existe > 0,
  'ALTER TABLE `categoría` ADD COLUMN `Visible_Menu` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Permite_Crema_Batida`',
  IF(
    @categoria_visible_existe = 0,
    'ALTER TABLE `categoría` ADD COLUMN `Visible_Menu` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Nombre`',
    'SELECT ''La columna categoría.Visible_Menu ya existe'' AS mensaje'
  )
);
PREPARE stmt_categoria_visible FROM @sql_categoria_visible;
EXECUTE stmt_categoria_visible;
DEALLOCATE PREPARE stmt_categoria_visible;

SET @sql_categoria_visible_seed := IF(
  @categoria_visible_existe = 0,
  'UPDATE `categoría` SET `Visible_Menu` = CASE WHEN `Nombre` = ''CrepaPerso'' THEN 0 ELSE 1 END',
  'UPDATE `categoría` SET `Visible_Menu` = 0 WHERE `Nombre` = ''CrepaPerso'''
);
PREPARE stmt_categoria_visible_seed FROM @sql_categoria_visible_seed;
EXECUTE stmt_categoria_visible_seed;
DEALLOCATE PREPARE stmt_categoria_visible_seed;
