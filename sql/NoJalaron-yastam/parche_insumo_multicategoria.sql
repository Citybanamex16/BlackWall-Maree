-- =============================================================
--  PARCHE: Multi-categoría para insumos
--  Ejecutar en phpMyAdmin sobre la base de datos mareebd
-- =============================================================

-- 1. Crear tabla de relación insumo ↔ categoría (muchos a muchos)
CREATE TABLE IF NOT EXISTS `insumo_categoria` (
  `ID_Insumo`     varchar(10) NOT NULL,
  `Nom_Categoria` varchar(50) NOT NULL,
  PRIMARY KEY (`ID_Insumo`, `Nom_Categoria`),
  KEY `fk_ic_cat_idx` (`Nom_Categoria`),
  CONSTRAINT `fk_ic_insumo`    FOREIGN KEY (`ID_Insumo`)     REFERENCES `insumo`    (`ID_Insumo`) ON DELETE CASCADE,
  CONSTRAINT `fk_ic_categoria` FOREIGN KEY (`Nom_Categoria`) REFERENCES `categoría` (`Nombre`)    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish2_ci;

-- 2. Migrar datos existentes (cada insumo ya tiene una Categoría, la pasamos a la nueva tabla)
INSERT IGNORE INTO `insumo_categoria` (`ID_Insumo`, `Nom_Categoria`)
SELECT `ID_Insumo`, `Categoría` FROM `insumo`;

-- =============================================================
-- 3. Actualizar SP EliminarIngrediente
--    Agrega el DELETE en insumo_categoria antes de eliminar el insumo
-- =============================================================
DROP PROCEDURE IF EXISTS `EliminarIngrediente`;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `EliminarIngrediente` (
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
        DELETE FROM insumo_categoria     WHERE ID_Insumo = p_idInsumo;
        DELETE FROM producto_tiene_insumo WHERE ID_Insumo = p_idInsumo;
        DELETE FROM insumo               WHERE ID_Insumo = p_idInsumo;
    COMMIT;
END$$
DELIMITER ;

-- =============================================================
-- 4. Actualizar SP ActualizarCategoria
--    Agrega UPDATE en insumo_categoria para propagar el nuevo nombre
-- =============================================================
DROP PROCEDURE IF EXISTS `ActualizarCategoria`;

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `ActualizarCategoria` (
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
        UPDATE `categoría`        SET Nombre          = newNombre WHERE Nombre          = oldNombre;
        UPDATE `insumo`           SET `Categoría`     = newNombre WHERE `Categoría`     = oldNombre;
        UPDATE `insumo_categoria` SET `Nom_Categoria` = newNombre WHERE `Nom_Categoria` = oldNombre;
        UPDATE `producto`         SET `Categoría`     = newNombre WHERE `Categoría`     = oldNombre;
        SET FOREIGN_KEY_CHECKS = 1;
    COMMIT;
END$$
DELIMITER ;
