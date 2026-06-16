/*
  Objetivo:
  1. Agregar `orden.Descripcion` en bases locales que todavia no la tienen.
  2. Dejar la tabla alineada con el esquema esperado por el flujo de ordenes actual.
*/

SET @has_descripcion_orden := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orden'
    AND COLUMN_NAME = 'Descripcion'
);

SET @sql_descripcion_orden := IF(
  @has_descripcion_orden = 0,
  'ALTER TABLE `orden` ADD COLUMN `Descripcion` VARCHAR(500) DEFAULT NULL AFTER `Tipo_Orden`',
  'SELECT ''La columna orden.Descripcion ya existe'' AS mensaje'
);

PREPARE stmt_descripcion_orden FROM @sql_descripcion_orden;
EXECUTE stmt_descripcion_orden;
DEALLOCATE PREPARE stmt_descripcion_orden;
