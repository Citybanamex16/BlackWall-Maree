/*
  Parche: permitir o bloquear la modificación de ingredientes por producto
  Objetivo:
  1. Agregar `producto.Permite_Modificar_Ingredientes`.
  2. Dejar todos los productos existentes editables por defecto para no cambiar el comportamiento actual.
*/

SET @producto_modifica_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'producto'
    AND COLUMN_NAME = 'Permite_Modificar_Ingredientes'
);

SET @sql_producto_modifica := IF(
  @producto_modifica_existe = 0,
  'ALTER TABLE `producto` ADD COLUMN `Permite_Modificar_Ingredientes` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Imagen`',
  'SELECT ''La columna producto.Permite_Modificar_Ingredientes ya existe'' AS mensaje'
);
PREPARE stmt_producto_modifica FROM @sql_producto_modifica;
EXECUTE stmt_producto_modifica;
DEALLOCATE PREPARE stmt_producto_modifica;
