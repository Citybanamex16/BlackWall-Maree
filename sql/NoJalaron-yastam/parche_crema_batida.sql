ALTER TABLE `categoría`
ADD COLUMN `Permite_Crema_Batida` TINYINT(1) NOT NULL DEFAULT 0 AFTER `Nombre`;

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
