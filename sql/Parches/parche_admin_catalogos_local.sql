/*
  Objetivo:
  1. Alinear una base local rezagada con el admin actual de categorias, tipos e ingredientes.
  2. Completar columnas, catalogos base y tablas junction requeridas por menu/admin.
  3. Actualizar procedimientos almacenados usados por el modulo admin.
*/

SET @categoria_visible_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'categoría'
    AND COLUMN_NAME = 'Visible_Menu'
);

SET @sql_categoria_visible := IF(
  @categoria_visible_existe = 0,
  'ALTER TABLE `categoría` ADD COLUMN `Visible_Menu` TINYINT(1) NOT NULL DEFAULT 1 AFTER `Permite_Crema_Batida`',
  'SELECT ''La columna categoría.Visible_Menu ya existe'' AS mensaje'
);
PREPARE stmt_categoria_visible FROM @sql_categoria_visible;
EXECUTE stmt_categoria_visible;
DEALLOCATE PREPARE stmt_categoria_visible;

INSERT INTO `categoría` (`Nombre`, `Permite_Crema_Batida`, `Visible_Menu`) VALUES
('Bebidas', 1, 1),
('CrepaPerso', 0, 0),
('Crepas', 1, 1),
('Otros', 0, 1),
('Platillo', 0, 1),
('Waffles', 1, 1)
ON DUPLICATE KEY UPDATE
  `Permite_Crema_Batida` = VALUES(`Permite_Crema_Batida`),
  `Visible_Menu` = VALUES(`Visible_Menu`);

SET @tipo_categoria_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tipos'
    AND COLUMN_NAME = 'categoria'
);

SET @sql_tipo_categoria := IF(
  @tipo_categoria_existe = 0,
  'ALTER TABLE `tipos` ADD COLUMN `categoria` VARCHAR(50) NOT NULL DEFAULT ''Otros'' AFTER `nombre`',
  'SELECT ''La columna tipos.categoria ya existe'' AS mensaje'
);
PREPARE stmt_tipo_categoria FROM @sql_tipo_categoria;
EXECUTE stmt_tipo_categoria;
DEALLOCATE PREPARE stmt_tipo_categoria;

INSERT INTO `tipos` (`nombre`, `categoria`) VALUES
('Caliente', 'Bebidas'),
('Frío', 'Bebidas'),
('Fruta', 'CrepaPerso'),
('Topping', 'CrepaPerso'),
('Untable', 'CrepaPerso'),
('PruebaCrep', 'Crepas'),
('Artesanal', 'Platillo'),
('Dulce', 'Platillo'),
('Otros', 'Platillo'),
('Salado', 'Platillo'),
('Vegano', 'Platillo'),
('PruebasWAFFLE', 'Waffles'),
('w2', 'Waffles')
ON DUPLICATE KEY UPDATE
  `categoria` = VALUES(`categoria`);

SET @idx_tipos_categoria_existe := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tipos'
    AND INDEX_NAME = 'idx_tipos_categoria'
);

SET @sql_idx_tipos_categoria := IF(
  @idx_tipos_categoria_existe = 0,
  'ALTER TABLE `tipos` ADD INDEX `idx_tipos_categoria` (`categoria`)',
  'SELECT ''El indice tipos.idx_tipos_categoria ya existe'' AS mensaje'
);
PREPARE stmt_idx_tipos_categoria FROM @sql_idx_tipos_categoria;
EXECUTE stmt_idx_tipos_categoria;
DEALLOCATE PREPARE stmt_idx_tipos_categoria;

CREATE TABLE IF NOT EXISTS `insumo_categoria` (
  `ID_Insumo` VARCHAR(10) NOT NULL,
  `Nom_Categoria` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`ID_Insumo`, `Nom_Categoria`),
  KEY `fk_ic_cat_idx` (`Nom_Categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

CREATE TABLE IF NOT EXISTS `insumo_tipo` (
  `ID_Insumo` VARCHAR(10) NOT NULL,
  `Nom_Tipo` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`ID_Insumo`, `Nom_Tipo`),
  KEY `fk_it_tipo` (`Nom_Tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

INSERT IGNORE INTO `insumo_categoria` (`ID_Insumo`, `Nom_Categoria`)
SELECT i.`ID_Insumo`, i.`Categoría`
FROM `insumo` i
WHERE i.`Categoría` IS NOT NULL
  AND TRIM(i.`Categoría`) <> '';

INSERT IGNORE INTO `insumo_categoria` (`ID_Insumo`, `Nom_Categoria`)
SELECT DISTINCT pti.`ID_Insumo`, p.`Categoría`
FROM `producto_tiene_insumo` pti
JOIN `producto` p
  ON p.`ID_Producto` = pti.`ID_Producto`
WHERE p.`Categoría` IS NOT NULL
  AND TRIM(p.`Categoría`) <> '';

INSERT IGNORE INTO `insumo_tipo` (`ID_Insumo`, `Nom_Tipo`)
SELECT DISTINCT pti.`ID_Insumo`, p.`Tipo`
FROM `producto_tiene_insumo` pti
JOIN `producto` p
  ON p.`ID_Producto` = pti.`ID_Producto`
WHERE p.`Tipo` IS NOT NULL
  AND TRIM(p.`Tipo`) <> '';

SET @orden_descripcion_existe := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'orden'
    AND COLUMN_NAME = 'Descripcion'
);

SET @sql_orden_descripcion := IF(
  @orden_descripcion_existe = 0,
  'ALTER TABLE `orden` ADD COLUMN `Descripcion` VARCHAR(500) DEFAULT NULL AFTER `Tipo_Orden`',
  'SELECT ''La columna orden.Descripcion ya existe'' AS mensaje'
);
PREPARE stmt_orden_descripcion FROM @sql_orden_descripcion;
EXECUTE stmt_orden_descripcion;
DEALLOCATE PREPARE stmt_orden_descripcion;

DELIMITER $$

DROP PROCEDURE IF EXISTS `ActualizarCategoria`$$
CREATE PROCEDURE `ActualizarCategoria` (
  IN `oldNombre` VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  IN `newNombre` VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_spanish2_ci
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET FOREIGN_KEY_CHECKS = 1;
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    SET FOREIGN_KEY_CHECKS = 0;
    UPDATE `categoría` SET `Nombre` = newNombre WHERE `Nombre` = oldNombre;
    UPDATE `insumo` SET `Categoría` = newNombre WHERE `Categoría` = oldNombre;
    UPDATE `insumo_categoria` SET `Nom_Categoria` = newNombre WHERE `Nom_Categoria` = oldNombre;
    UPDATE `tipos` SET `categoria` = newNombre WHERE `categoria` = oldNombre;
    UPDATE `producto` SET `Categoría` = newNombre WHERE `Categoría` = oldNombre;
    SET FOREIGN_KEY_CHECKS = 1;
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS `ActualizarTipo`$$
CREATE PROCEDURE `ActualizarTipo` (
  IN `oldNombre` VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  IN `newNombre` VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  IN `newCategoria` VARCHAR(50) CHARSET utf8mb4 COLLATE utf8mb4_spanish2_ci
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    SET FOREIGN_KEY_CHECKS = 1;
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;
    SET FOREIGN_KEY_CHECKS = 0;
    UPDATE `tipos`
    SET `nombre` = newNombre,
        `categoria` = newCategoria
    WHERE `nombre` = oldNombre;
    UPDATE `insumo_tipo` SET `Nom_Tipo` = newNombre WHERE `Nom_Tipo` = oldNombre;
    UPDATE `producto` SET `Tipo` = newNombre WHERE `Tipo` = oldNombre;
    SET FOREIGN_KEY_CHECKS = 1;
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS `ActualizarIngrediente`$$
CREATE PROCEDURE `ActualizarIngrediente` (
  IN `p_idInsumo` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  IN `p_nombre` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  IN `p_categoria` VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci,
  IN `p_precio` DECIMAL(10, 2),
  IN `p_activo` TINYINT(1),
  IN `p_imagen` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci
)
BEGIN
  DECLARE v_error_msg VARCHAR(500);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
  END;

  START TRANSACTION;
    UPDATE `insumo`
    SET `Nombre` = p_nombre,
        `Categoría` = p_categoria,
        `Precio` = p_precio,
        `Activo` = p_activo,
        `Imagen` = p_imagen
    WHERE `ID_Insumo` = p_idInsumo;
  COMMIT;
END$$

DROP PROCEDURE IF EXISTS `EliminarIngrediente`$$
CREATE PROCEDURE `EliminarIngrediente` (
  IN `p_idInsumo` VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci
)
BEGIN
  DECLARE v_error_msg VARCHAR(500);
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;
  END;

  START TRANSACTION;
    DELETE FROM `insumo_tipo` WHERE `ID_Insumo` = p_idInsumo;
    DELETE FROM `insumo_categoria` WHERE `ID_Insumo` = p_idInsumo;
    DELETE FROM `producto_tiene_insumo` WHERE `ID_Insumo` = p_idInsumo;
    DELETE FROM `insumo` WHERE `ID_Insumo` = p_idInsumo;
  COMMIT;
END$$

DELIMITER ;
